import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    res.json({ status: 'ok', engine: 'ANAMNESIS v3.4 Forensics Engine', timestamp: new Date().toISOString() });
  });

  // Forensic Analysis endpoint
  app.post('/api/forensics/analyze', async (req, res) => {
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
        model: 'gemini-3.7-flash',
        contents,
        config: {
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
        console.error('Failed to parse Gemini JSON output:', rawText);
        return res.status(500).json({ error: 'Forensics parsing error', raw: rawText });
      }

      // Ensure evidence ID and hash are preserved if provided
      if (fileHash && (!parsedData.case_summary.primary_hash_sha256 || parsedData.case_summary.primary_hash_sha256 === 'SIMULATED_OR_EXTRACTED_SHA256')) {
        parsedData.case_summary.primary_hash_sha256 = fileHash;
      }

      res.json(parsedData);
    } catch (error: any) {
      console.error('Error during forensic analysis:', error);
      res.status(500).json({
        error: error.message || 'Internal server error in forensic engine',
      });
    }
  });

  // Forensic Cross-Examination Chat endpoint
  app.post('/api/forensics/chat', async (req, res) => {
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
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Error in forensic chat:', error);
      res.status(500).json({ error: error.message || 'Failed to process inquiry.' });
    }
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
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
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
