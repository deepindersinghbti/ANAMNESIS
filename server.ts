import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/* G11: the model ID appears as a literal in exactly one place in this
 * codebase - the default below - and is overridable from the environment.
 * It is logged at startup and echoed by /api/health, so "is the model
 * right?" is answerable with one curl rather than by watching a demo fail. */
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.7-flash';

/* The Gemini adapter's timeout, per the target architecture. Without it the
 * upstream call had no deadline at all: the browser gave up at 30 seconds
 * while the server went on holding the connection — measured at 142 seconds
 * against a congested model before it finally returned 503.
 *
 * Keep this in step with REQUEST_TIMEOUT_MS in src/lib/api.ts. If the server
 * budget is the larger of the two, the browser aborts first and the server
 * keeps working on a result nobody will read. */
/* The API rejects deadlines under ten seconds outright — "Manually set
 * deadline 2s is too short. Minimum allowed deadline is 10s." — so a value
 * below the floor would turn every analysis into an INVALID_ARGUMENT rather
 * than the snappier failure the author intended. Clamp and say so. */
const GEMINI_MIN_TIMEOUT_MS = 10_000;
const requestedTimeout = Number(process.env.GEMINI_TIMEOUT_MS) || 30_000;
const GEMINI_TIMEOUT_MS = Math.max(requestedTimeout, GEMINI_MIN_TIMEOUT_MS);

/* ===========================================================================
 * G14 — SHARED-SECRET GATE
 *
 * Both POST routes are the only paths to a metered external API, and the
 * deployed URL is public. Without this, anyone who finds the host can spend
 * the key's quota; exhaustion before judging is a realistic outcome.
 *
 * Be clear about what this is. The browser has to send the secret, so the
 * secret is in the bundle, and anyone willing to open devtools can read it.
 * It stops drive-by and automated traffic, not a motivated person. Real
 * departmental identity is the production answer and is out of scope; the
 * rate limiter below is what bounds the damage either way.
 * ======================================================================== */

const API_SHARED_SECRET = process.env.API_SHARED_SECRET?.trim() || '';
const IS_PRODUCTION = process.env.NODE_ENV !== 'development';

function requireSharedSecret(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!API_SHARED_SECRET) {
    /* Unset. In development that is a convenience; in production it means
     * the proxy is open, so it fails closed rather than silently serving. */
    if (IS_PRODUCTION) {
      res.status(503).json({
        error: 'The forensics engine is not configured for requests. Set API_SHARED_SECRET.',
      });
      return;
    }
    next();
    return;
  }

  const presented = req.get('x-anamnesis-key') ?? '';
  if (presented !== API_SHARED_SECRET) {
    res.status(401).json({ error: 'This request was not authorised by the forensics engine.' });
    return;
  }
  next();
}

/* ===========================================================================
 * G15 — RATE LIMITING BY IP
 *
 * A fixed window held in memory. That is the right size for a single-process
 * prototype and deliberately not a dependency: it needs no store, no client
 * and nothing to fail at boot. It does not survive a restart and does not
 * coordinate across instances — both acceptable when there is one process,
 * and both worth knowing before this is ever scaled.
 * ======================================================================== */

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 12;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      error: `Too many analysis requests from this address. Try again in ${retryAfter}s.`,
    });
    return;
  }

  bucket.count += 1;
  next();
}

/* Keep the map from growing without bound on a long-running process. */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now >= bucket.resetAt) rateBuckets.delete(key);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

/**
 * An abort signal for one upstream call.
 *
 * Fires on whichever comes first: the timeout above, or the investigator
 * navigating away / the browser's own 30s abort. The second case is the one
 * that matters in practice — a disconnected client used to leave the model
 * call running to completion.
 *
 * Note the SDK's own caveat: aborting is a client-side operation. It frees
 * this process immediately but does not cancel work already accepted
 * upstream, and does not avoid being billed for it.
 */
function requestAbort(
  res: express.Response
): { signal: AbortSignal; timedOut: () => boolean; dispose: () => void } {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, GEMINI_TIMEOUT_MS);

  /* Listen on the response, not the request. For a POST the request stream
   * is consumed and destroyed as soon as the body is read, so req 'close'
   * fires on every normal request and would abort all of them. The response
   * closes early only when the client has genuinely gone away. */
  const onClientGone = () => {
    if (!res.writableEnded) controller.abort();
  };
  res.on('close', onClientGone);

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    dispose: () => {
      clearTimeout(timer);
      res.off('close', onClientGone);
    },
  };
}

/* ===========================================================================
 * UPSTREAM ERROR MAPPING
 *
 * Two rules govern everything below, and they pull in the same direction:
 *
 *   G16  No model output and no SDK error text ever reaches the client. The
 *        raw payload goes to the server log, which is where a developer can
 *        read it and an investigator cannot.
 *   Honesty  The status we return means what it says. Collapsing a busy
 *        model into a flat 500 tells the investigator the engine is broken
 *        when the truth is "try again in a minute" — and on a demonstration
 *        day that distinction is the whole difference between a recoverable
 *        stumble and an abandoned demo.
 * ======================================================================== */

interface UpstreamFailure {
  /** Status to return to the client. */
  status: number;
  /** Safe to display. Contains no model output and no credential. */
  message: string;
}

/** Pull the upstream HTTP code out of whatever shape the SDK threw. */
function extractUpstreamCode(error: any): number | null {
  if (typeof error?.status === 'number') return error.status;
  if (typeof error?.code === 'number') return error.code;
  // The SDK commonly stringifies the upstream JSON envelope into .message.
  if (typeof error?.message === 'string') {
    try {
      const parsed = JSON.parse(error.message);
      const code = parsed?.error?.code;
      if (typeof code === 'number') return code;
    } catch {
      const match = error.message.match(/\b(4\d{2}|5\d{2})\b/);
      if (match) return Number(match[1]);
    }
  }
  return null;
}

function mapUpstreamFailure(error: any, timedOut = false): UpstreamFailure {
  const aborted =
    timedOut ||
    error?.name === 'AbortError' ||
    (typeof error?.message === 'string' && /abort|timeout|timed out/i.test(error.message));

  if (aborted) {
    return {
      status: 504,
      message:
        `The model did not respond within ${Math.round(GEMINI_TIMEOUT_MS / 1000)} seconds and the request was cancelled. ` +
        'Retry, or raise GEMINI_TIMEOUT_MS if this happens consistently.',
    };
  }

  if (error instanceof Error && error.message.includes('GEMINI_API_KEY is not configured')) {
    return {
      status: 503,
      message: 'The forensics engine has no API key configured. Analysis is unavailable.',
    };
  }

  switch (extractUpstreamCode(error)) {
    case 429:
      return {
        status: 429,
        message:
          'The analysis quota for this key is exhausted. Wait before retrying, or use Demo Mode.',
      };
    case 503:
      return {
        status: 503,
        message:
          `The model (${GEMINI_MODEL}) is busy and refused the request. This is usually temporary — retry, ` +
          'or set GEMINI_MODEL to another available model and restart.',
      };
    case 500:
    case 502:
    case 504:
      return {
        status: 502,
        message: 'The model failed to complete the analysis. Retrying often succeeds.',
      };
    case 400:
      return {
        status: 400,
        message:
          'The model rejected this evidence. Check that the file is a real image and that its type was sent correctly.',
      };
    case 404:
      return {
        status: 502,
        message:
          `The configured model (${GEMINI_MODEL}) was not found. Check GEMINI_MODEL against /api/health.`,
      };
    case 401:
    case 403:
      return {
        status: 502,
        message: 'The forensics engine could not authenticate with the model provider.',
      };
    default:
      return {
        status: 502,
        message: 'The analysis could not be completed.',
      };
  }
}

async function startServer() {
  const app = express();
  /* G12: platforms inject PORT. A hardcoded 3000 worked only by luck. */
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper to initialize Gemini safely
  function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      engine: 'ANAMNESIS v3.4 Forensics Engine',
      model: GEMINI_MODEL,
      timeoutMs: GEMINI_TIMEOUT_MS,
      // Whether a secret is required, never the secret itself.
      authRequired: Boolean(API_SHARED_SECRET),
      rateLimit: { max: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS },
      timestamp: new Date().toISOString(),
    });
  });

  // Forensic Analysis endpoint
  app.post('/api/forensics/analyze', rateLimit, requireSharedSecret, async (req, res) => {
    const abort = requestAbort(res);
    try {
      const {
        imageBase64,
        mimeType = 'image/jpeg',
        claimedLocation = 'Unknown',
        claimedDateTime = 'Unknown',
        claimedNarrative = 'No caption provided',
        sourcePlatform = 'Direct Intake',
        exifData = {},
        fileName = 'evidence_capture.jpg',
        fileHash = '',
        customNotes = '',
      } = req.body;

      const ai = getGeminiClient();

      const promptText = `
You are ANAMNESIS, the advanced digital crime-scene media forensics engine designed for investigators, journalists, and forensic analysts.

Analyze this media item strictly through the 5 Questions Forensic Methodology and Decoupled Context Integrity Framework.

CLAIMED INVESTIGATIVE CONTEXT:
- Evidence File: "${fileName}"
- Primary SHA-256 Hash: "${fileHash || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'}"
- Claimed Location: "${claimedLocation}"
- Claimed Date / Time: "${claimedDateTime}"
- Claimed Narrative / Headline / Caption: "${claimedNarrative}"
- Source Platform: "${sourcePlatform}"
- Extracted EXIF Metadata Summary: ${JSON.stringify(exifData)}
- Investigator Annotations: "${customNotes}"

CORE FORENSIC METHODOLOGY REQUIREMENTS:
1. WHO: Identify entities, faces, distinctive uniforms, insignia, vehicles, or synthetic/generative artifacts (diffusion skin plasticization, asymmetric eyes/fingers, AI generation halos, prompt style tokens).
2. WHERE: Cross-reference visual clues (landmarks, signage, architectural typography, vegetation biomes, road infrastructure, sun angle / azimuth, vehicle license plate formats) against the claimed geographic location ("${claimedLocation}"). State if Consistent, Inconsistent, or Needs Verification.
3. WHEN: Assess temporal markers (lighting quality, shadow lengths, seasonal foliage, clothing styles, archival resolution, historical events) against the claimed date/time ("${claimedDateTime}"). State if Consistent, Inconsistent, or Needs Verification.
4. WHAT CHANGED: Detect cropping, JPEG compression quantization boundaries, multi-pass re-encoding artifacts, watermarking, audio splicing / pitch artifacts, generative inpainting / cloning, or screen-recording borders.
5. HOW IT SPREAD & EVOLVED: Map lineage mutations across distribution platforms (e.g. Origin raw -> Telegram channel crop -> WhatsApp recompressed -> Misleading text added -> Viral social thread), estimating generation depth.

CRITICAL RULES:
- Decouple Media from Narrative: Strictly differentiate between manipulated media vs unmanipulated authentic media paired with false context (recycled footage, wrong date, wrong location, altered caption).
- Forensic Reconstruction (Origin Echo): Synthesize surviving attributes to describe the earliest known/estimated state. Always designate this as "ESTIMATED — NOT ORIGINAL EVIDENCE".
- No Black-Box Verdicts: Provide verifiable visual evidence, confidence metrics, and deterministic rationales for every conclusion.

Return valid JSON adhering exactly to the requested ANAMNESIS schema.
`;

      const contents: any[] = [];

      // Add image if base64 provided
      if (imageBase64) {
        // Strip data prefix if present
        const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      contents.push({
        text: promptText,
      });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          abortSignal: abort.signal,
          httpOptions: { timeout: GEMINI_TIMEOUT_MS },
          systemInstruction: `You are ANAMNESIS, the uncompromising digital crime-scene media forensics engine for OSINT, law enforcement, and investigative journalism. Your mission is to reconstruct forensic truth, decouple media from deceptive narratives, and provide deterministic evidence chains. Always respond with strict, valid JSON matching the requested ANAMNESIS forensic format.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              case_summary: {
                type: Type.OBJECT,
                properties: {
                  evidence_id: { type: Type.STRING, description: 'e.g. ANAM-2026-8941' },
                  primary_hash_sha256: { type: Type.STRING },
                  verdict_summary: { type: Type.STRING, description: '1-2 sentence executive forensic verdict' },
                },
                required: ['evidence_id', 'primary_hash_sha256', 'verdict_summary'],
              },
              the_five_questions: {
                type: Type.OBJECT,
                properties: {
                  who: {
                    type: Type.OBJECT,
                    properties: {
                      observation: { type: Type.STRING },
                      confidence: { type: Type.NUMBER, description: '0.00 to 1.00' },
                      entities_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
                      synthetic_artifacts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['observation', 'confidence'],
                  },
                  where: {
                    type: Type.OBJECT,
                    properties: {
                      claimed: { type: Type.STRING },
                      observed: { type: Type.STRING },
                      status: { type: Type.STRING, description: 'Consistent | Inconsistent | Needs Verification' },
                      geolocation_clues: { type: Type.ARRAY, items: { type: Type.STRING } },
                      coordinates_estimate: { type: Type.STRING },
                    },
                    required: ['claimed', 'observed', 'status'],
                  },
                  when: {
                    type: Type.OBJECT,
                    properties: {
                      claimed: { type: Type.STRING },
                      observed: { type: Type.STRING },
                      status: { type: Type.STRING, description: 'Consistent | Inconsistent | Needs Verification' },
                      temporal_markers: { type: Type.ARRAY, items: { type: Type.STRING } },
                      solar_shadow_analysis: { type: Type.STRING },
                    },
                    required: ['claimed', 'observed', 'status'],
                  },
                  what_changed: {
                    type: Type.OBJECT,
                    properties: {
                      mutations_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
                      details: { type: Type.STRING },
                      ela_findings: { type: Type.STRING },
                      sensor_noise_findings: { type: Type.STRING },
                    },
                    required: ['mutations_detected', 'details'],
                  },
                  how_it_spread: {
                    type: Type.OBJECT,
                    properties: {
                      lineage_notes: { type: Type.STRING },
                      estimated_generations: { type: Type.INTEGER },
                      platforms_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
                      virality_pattern: { type: Type.STRING },
                    },
                    required: ['lineage_notes', 'estimated_generations'],
                  },
                },
                required: ['who', 'where', 'when', 'what_changed', 'how_it_spread'],
              },
              forensic_replay_timeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.INTEGER },
                    label: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estimated_timestamp: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    is_origin_echo: { type: Type.BOOLEAN },
                  },
                  required: ['stage', 'label', 'description'],
                },
              },
              context_integrity_check: {
                type: Type.OBJECT,
                properties: {
                  raw_media_status: { type: Type.STRING, description: '🟢 Consistent | 🟠 Tampered | 🔴 Synthetic' },
                  claimed_location_status: { type: Type.STRING, description: '🟢 Verified | 🟠 Needs Verification | 🔴 Inconsistent' },
                  claimed_time_status: { type: Type.STRING, description: '🟢 Verified | 🟠 Needs Verification | 🔴 Inconsistent' },
                  audio_integrity_status: { type: Type.STRING, description: '🟢 Untampered | 🟠 Spliced/Manipulated | 🔴 Out of Sync' },
                },
                required: ['raw_media_status', 'claimed_location_status', 'claimed_time_status', 'audio_integrity_status'],
              },
              investigator_notes: { type: Type.STRING, description: 'Actionable next steps and forensic leads.' },
              technical_metrics: {
                type: Type.OBJECT,
                properties: {
                  synthetic_probability_score: { type: Type.NUMBER, description: '0 to 100' },
                  manipulation_confidence: { type: Type.NUMBER, description: '0 to 100' },
                  compression_generations: { type: Type.INTEGER },
                  metadata_tamper_flag: { type: Type.BOOLEAN },
                  chromatic_aberration_consistency: { type: Type.STRING },
                  lighting_vector_consistency: { type: Type.STRING },
                  shadow_sun_angle_match: { type: Type.STRING },
                  exif_anomaly_notes: { type: Type.STRING },
                },
              },
              origin_echo: {
                type: Type.OBJECT,
                properties: {
                  is_estimated: { type: Type.BOOLEAN },
                  label: { type: Type.STRING, description: 'ESTIMATED — NOT ORIGINAL EVIDENCE' },
                  original_resolution_estimate: { type: Type.STRING },
                  earliest_known_timestamp: { type: Type.STRING },
                  likely_capture_device: { type: Type.STRING },
                  unmanipulated_scene_description: { type: Type.STRING },
                  surviving_attributes: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
            required: ['case_summary', 'the_five_questions', 'forensic_replay_timeline', 'context_integrity_check', 'investigator_notes'],
          },
        },
      });

      const rawText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (err) {
        // G16: raw output is logged, never returned. Echoing it back put
        // unvalidated model text on the investigator's screen.
        console.error('Failed to parse Gemini JSON output. Raw text follows:');
        console.error(rawText);
        return res.status(502).json({
          error: 'The model returned a malformed report. Retry the analysis.',
        });
      }

      // Ensure evidence ID and hash are preserved if provided
      if (fileHash && (!parsedData.case_summary.primary_hash_sha256 || parsedData.case_summary.primary_hash_sha256 === 'SIMULATED_OR_EXTRACTED_SHA256')) {
        parsedData.case_summary.primary_hash_sha256 = fileHash;
      }

      res.json(parsedData);
    } catch (error: any) {
      // Full detail to the log; only the mapped, safe message to the client.
      console.error('Error during forensic analysis:', error);
      if (res.headersSent || res.writableEnded) return;
      const failure = mapUpstreamFailure(error, abort.timedOut());
      res.status(failure.status).json({ error: failure.message });
    } finally {
      abort.dispose();
    }
  });

  // Forensic Cross-Examination Chat endpoint
  app.post('/api/forensics/chat', rateLimit, requireSharedSecret, async (req, res) => {
    const abort = requestAbort(res);
    try {
      const { message, reportContext, imageBase64, mimeType } = req.body;
      const ai = getGeminiClient();

      const systemPrompt = `
You are ANAMNESIS Forensic Assistant & Cross-Examiner.
You are assisting an investigator, OSINT researcher, or journalist inspecting digital media evidence.

Current Case Report Context:
${JSON.stringify(reportContext, null, 2)}

Provide forensic, rigorous, and technically precise answers. Reference Error Level Analysis (ELA), shadow vectors, sun elevation geometry, sensor PRNU noise, JPEG quantization tables, reverse OSINT methods, metadata provenance, and evidentiary chain of custody. Decouple raw visual media from deceptive narrative claims.
`;

      const contents: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      contents.push({
        text: `Investigator Query: ${message}`,
      });

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          abortSignal: abort.signal,
          httpOptions: { timeout: GEMINI_TIMEOUT_MS },
          systemInstruction: systemPrompt,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Error in forensic chat:', error);
      if (res.headersSent || res.writableEnded) return;
      const failure = mapUpstreamFailure(error, abort.timedOut());
      res.status(failure.status).json({ error: failure.message });
    } finally {
      abort.dispose();
    }
  });

  // Vite middleware in dev / Static files in production
  /* G13: the check was `!== 'production'`, so an unset NODE_ENV booted a
   * Vite dev server in production. Inverting it makes the safe path the one
   * that happens by accident. */
  if (process.env.NODE_ENV === 'development') {
    /* Imported lazily and only on the development branch. A top-level import
     * compiles to `require("vite")` at module scope, which meant the
     * production server could not boot unless the whole Vite toolchain was
     * installed beside it — so the runtime image had to ship a build tool,
     * and pruning devDependencies broke startup with a module-not-found. */
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ANAMNESIS Server running on http://0.0.0.0:${PORT}`);
    console.log(`ANAMNESIS model:   ${GEMINI_MODEL}`);
    console.log(`ANAMNESIS timeout: ${GEMINI_TIMEOUT_MS}ms per model call`);
    if (requestedTimeout < GEMINI_MIN_TIMEOUT_MS) {
      console.warn(
        `ANAMNESIS warning: GEMINI_TIMEOUT_MS=${requestedTimeout} is below the API minimum of ${GEMINI_MIN_TIMEOUT_MS}ms and was raised to ${GEMINI_TIMEOUT_MS}ms.`
      );
    }
    console.log(`ANAMNESIS API key: ${process.env.GEMINI_API_KEY ? 'configured' : 'MISSING - analysis will fail'}`);
    console.log(
      `ANAMNESIS auth:    ${
        API_SHARED_SECRET
          ? 'shared secret required on POST routes'
          : IS_PRODUCTION
          ? 'MISSING - POST routes will refuse every request'
          : 'not set (development only; POST routes are open)'
      }`
    );
    console.log(`ANAMNESIS limit:   ${RATE_LIMIT_MAX} requests / ${RATE_LIMIT_WINDOW_MS}ms per IP`);
    console.log(`ANAMNESIS mode:    ${IS_PRODUCTION ? 'production (static dist/)' : 'development (vite middleware)'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
