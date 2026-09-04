import { BenchmarkCase } from '../types';

// Helper to create an SVG data URL for crisp, instant testing across forensic filters
function createSvgDataUrl(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

// Case 1: Recycled 2018 Disaster Footage Captioned as 2026 Coastal Tsunami
const svgCase1 = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a5568"/>
      <stop offset="60%" stop-color="#718096"/>
      <stop offset="100%" stop-color="#a0aec0"/>
    </linearGradient>
    <linearGradient id="flood1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4a3b2c"/>
      <stop offset="50%" stop-color="#5c4837"/>
      <stop offset="100%" stop-color="#3d2f23"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky1)"/>
  <!-- Distant Mountains & Tropical Palms -->
  <polygon points="50,300 200,180 350,300" fill="#2d3748" opacity="0.8"/>
  <polygon points="280,300 450,150 620,300" fill="#1a202c" opacity="0.9"/>
  <!-- Southeast Asian style tin roof houses and palm trees -->
  <rect x="120" y="240" width="110" height="70" fill="#744210"/>
  <polygon points="100,240 175,200 250,240" fill="#9b2c2c"/>
  <rect x="480" y="230" width="140" height="80" fill="#718096"/>
  <polygon points="460,230 550,190 640,230" fill="#2b6cb0"/>
  <!-- Flood water with debris -->
  <rect x="0" y="290" width="800" height="210" fill="url(#flood1)"/>
  <path d="M0 310 Q 200 290, 400 315 T 800 300 L 800 500 L 0 500 Z" fill="#423223" opacity="0.6"/>
  <!-- Submerged 2010s Toyota Hilux with Palu Indonesia tropical foliage -->
  <rect x="310" y="320" width="160" height="50" rx="10" fill="#e2e8f0"/>
  <rect x="340" y="290" width="90" height="35" rx="5" fill="#a0aec0"/>
  <!-- Tropical Palm Tree silhouette -->
  <path d="M 680 350 Q 690 200 700 120" stroke="#2d3748" stroke-width="8" fill="none"/>
  <path d="M 700 120 Q 640 90 600 130 M 700 120 Q 750 90 780 130 M 700 120 Q 660 150 620 180 M 700 120 Q 740 150 770 175" stroke="#22543d" stroke-width="6" fill="none"/>
  <!-- Telemetry overlay simulation typical of 2018 smartphone capture -->
  <text x="25" y="465" font-family="monospace" font-size="14" fill="#f6e05e" font-weight="bold">PALU_CENTRAL_SULAWESI_28-09-2018_ARCHIVE</text>
  <text x="25" y="485" font-family="monospace" font-size="12" fill="#cbd5e0">SRC_RES: 1280x720 (H.264 / 29.97 FPS)</text>
</svg>`;

// Case 2: Synthetic GenAI Deepfake of Diplomat
const svgCase2 = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <radialGradient id="podiumGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fdba74"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#podiumGrad)"/>
  <!-- Official backdrop flags with blurry generative text -->
  <rect x="100" y="80" width="160" height="220" fill="#1e3a8a" opacity="0.7"/>
  <rect x="540" y="80" width="160" height="220" fill="#991b1b" opacity="0.7"/>
  <!-- Person silhouette with characteristic generative diffusion smoothness -->
  <!-- Suit Body -->
  <path d="M 280 500 L 320 330 L 480 330 L 520 500 Z" fill="#1e293b"/>
  <polygon points="370,330 400,420 430,330" fill="#f8fafc"/>
  <polygon points="392,350 400,450 408,350" fill="#b91c1c"/>
  <!-- Head & Face with uncanny symmetry and plasticized skin -->
  <ellipse cx="400" cy="240" rx="75" ry="95" fill="url(#faceGrad)"/>
  <path d="M 320 220 Q 400 120 480 220 Q 400 180 320 220 Z" fill="#475569"/>
  <!-- Unnatural iris reflection & asymmetric collar pins -->
  <ellipse cx="375" cy="240" rx="10" ry="10" fill="#0f172a"/>
  <circle cx="377" cy="238" r="3" fill="#ffffff"/>
  <ellipse cx="425" cy="240" rx="10" ry="10" fill="#0f172a"/>
  <!-- Missing specular highlight on right eye (Classic diffusion defect) -->
  <!-- Morphological finger distortion on podium hand -->
  <ellipse cx="400" cy="480" rx="110" ry="30" fill="#334155"/>
  <!-- 6-finger artifact cluster -->
  <circle cx="330" cy="460" r="8" fill="#fdba74"/>
  <circle cx="342" cy="455" r="8" fill="#fdba74"/>
  <circle cx="355" cy="452" r="8" fill="#fdba74"/>
  <circle cx="368" cy="454" r="8" fill="#fdba74"/>
  <circle cx="380" cy="458" r="8" fill="#fdba74"/>
  <circle cx="392" cy="462" r="8" fill="#fdba74"/>
  <!-- Microphones -->
  <line x1="360" y1="440" x2="385" y2="350" stroke="#94a3b8" stroke-width="4"/>
  <circle cx="385" cy="350" r="10" fill="#0f172a"/>
  <!-- Forensic Overlay Annotations -->
  <text x="30" y="45" font-family="monospace" font-size="14" fill="#ef4444" font-weight="bold">SYNTHETIC_DIFFUSION_SIGNATURE: MIDJOURNEY_V6 / SORA_AUDIO_SPLICED</text>
  <text x="30" y="70" font-family="monospace" font-size="12" fill="#94a3b8">POLYDACTYLY_DETECTED: 6 PHALANGES ON LEFT METACARPAL</text>
</svg>`;

// Case 3: Spliced Protest Banner & Clone-Stamped Crowd
const svgCase3 = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky3)"/>
  <!-- European Architecture (Brandenburg Gate style pillars) -->
  <rect x="150" y="100" width="40" height="250" fill="#cbd5e1"/>
  <rect x="250" y="100" width="40" height="250" fill="#cbd5e1"/>
  <rect x="350" y="100" width="40" height="250" fill="#cbd5e1"/>
  <rect x="450" y="100" width="40" height="250" fill="#cbd5e1"/>
  <rect x="550" y="100" width="40" height="250" fill="#cbd5e1"/>
  <rect x="120" y="70" width="500" height="35" fill="#94a3b8"/>
  <!-- Crowd silhouettes -->
  <path d="M 0 500 C 100 420, 200 440, 300 500 C 400 430, 500 450, 600 500 C 700 440, 750 460, 800 500 Z" fill="#1e293b"/>
  <!-- Clone Stamped Identical Crowd Groups -->
  <g id="crowdGroup">
    <circle cx="200" cy="380" r="14" fill="#334155"/>
    <circle cx="225" cy="375" r="15" fill="#475569"/>
    <circle cx="250" cy="385" r="13" fill="#1e293b"/>
  </g>
  <!-- Cloned at x=420 (Copy-Move anomaly) -->
  <use href="#crowdGroup" x="220" y="5"/>
  <!-- Cloned at x=580 -->
  <use href="#crowdGroup" x="380" y="-3"/>
  <!-- Spliced Banner with sharp unfeathered digital edges and compression mismatch -->
  <rect x="260" y="270" width="280" height="75" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <text x="280" y="315" font-family="sans-serif" font-size="20" font-weight="900" fill="#dc2626">EXTREME DISINFO BANNER</text>
  <text x="282" y="335" font-family="sans-serif" font-size="12" font-weight="bold" fill="#000000">DIGITALLY INSERTED IN PHOTOSHOP</text>
  <!-- Forensic Markings -->
  <rect x="258" y="268" width="284" height="79" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="30" y="475" font-family="monospace" font-size="13" fill="#f59e0b" font-weight="bold">ELA_ANOMALY: High Error Level in Banner Box (Δ=48.2%) vs Background (Δ=6.4%)</text>
</svg>`;

// Case 4: Recycled Conflict Artillery Strike with Misleading Battlefield Claim
const svgCase4 = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#090d16"/>
  <!-- Night thermal / IR signature look -->
  <rect x="0" y="320" width="800" height="180" fill="#172554"/>
  <!-- Distant grain silos / industrial shapes -->
  <rect x="180" y="240" width="90" height="90" fill="#1e3a8a"/>
  <rect x="280" y="220" width="60" height="110" fill="#1e3a8a"/>
  <!-- Explosion fireball with distinct Grad 122mm rocket signature (2014 archive) -->
  <radialGradient id="blast" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="25%" stop-color="#fef08a"/>
    <stop offset="60%" stop-color="#f97316"/>
    <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0"/>
  </radialGradient>
  <circle cx="500" cy="270" r="130" fill="url(#blast)"/>
  <!-- Smoke plumes -->
  <ellipse cx="510" cy="180" rx="90" ry="70" fill="#334155" opacity="0.6"/>
  <!-- TikTok / Telegram UI watermarks stripped in corner -->
  <rect x="680" y="20" width="100" height="40" fill="#000000" opacity="0.8" rx="6"/>
  <text x="692" y="45" font-family="monospace" font-size="12" fill="#ef4444">BLUR_CROP</text>
  <text x="25" y="475" font-family="monospace" font-size="13" fill="#38bdf8">WEAPON SIGNATURE: BM-21 GRAD ROCKET (122MM) — 2014 DONBAS ARCHIVE</text>
</svg>`;

// Case 5: Viral Doctored Screenshot of Forged Classified Memo
const svgCase5 = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#0f172a"/>
  <!-- Paper Memo -->
  <rect x="180" y="30" width="440" height="440" fill="#f8fafc" rx="4" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))"/>
  <!-- Header with misaligned font kerning -->
  <text x="220" y="80" font-family="Courier New, monospace" font-size="18" font-weight="900" fill="#0f172a">DEPARTMENT OF SPECIAL AFFAIRS</text>
  <line x1="220" y1="95" x2="580" y2="95" stroke="#cbd5e1" stroke-width="2"/>
  <text x="220" y="130" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#475569">MEMORANDUM FOR RECORD // TOP SECRET</text>
  <text x="220" y="155" font-family="Arial, sans-serif" font-size="11" fill="#64748b">DATE: 22 AUGUST 2026</text>
  <text x="220" y="175" font-family="Arial, sans-serif" font-size="11" fill="#64748b">SUBJECT: PROJECT ARCHON DEPLOYMENT</text>
  <!-- Text body with digital aliasing and inconsistent DPI -->
  <rect x="220" y="200" width="360" height="15" fill="#e2e8f0"/>
  <rect x="220" y="225" width="340" height="15" fill="#e2e8f0"/>
  <rect x="220" y="250" width="300" height="15" fill="#e2e8f0"/>
  <!-- Forged Red Stamp (Digital overlay perfectly square to pixel grid without scanner distortion) -->
  <rect x="360" y="300" width="180" height="60" rx="8" fill="none" stroke="#dc2626" stroke-width="4" transform="rotate(-8 450 330)"/>
  <text x="385" y="338" font-family="Impact, sans-serif" font-size="24" fill="#dc2626" transform="rotate(-8 450 330)">DECLASSIFIED</text>
  <!-- Digital Crop boundary warning -->
  <text x="25" y="485" font-family="monospace" font-size="12" fill="#f43f5e">TYPOGRAPHIC ANOMALY: Arial 2020s typeface in claimed 1980s Typewriter memo</text>
</svg>`;

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    isPrecomputed: true,
    id: 'case-recycled-disaster',
    title: 'Recycled 2018 Palu Tsunami Captioned as 2026 Coastal Catastrophe',
    category: 'False Narrative / Recycled',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
    description:
      'A viral clip circulating on Telegram and X alleging an active catastrophic coastal disaster in Southern California. Forensic analysis decouples the authentic raw video from deceptive 2026 narrative claims.',
    intake: {
      evidenceId: 'ANAM-2026-9104',
      title: 'Breaking Southern California Coastal Tsunami Claim',
      mediaType: 'image',
      mediaUrl: createSvgDataUrl(svgCase1),
      previewUrl: createSvgDataUrl(svgCase1),
      fileName: 'breaking_socal_tsunami_leak_hd.mp4_frame042.jpg',
      fileSize: 489201,
      fileHashSha256: '9A7B3E4122DF88C901AE45C721087F03C5D44219E866113A78BF201445DDC819',
      fileHashMd5: '3c8f9021dae44512b98e1a662f9011ab',
      claimedLocation: 'Santa Barbara Coast, California, USA',
      claimedDateTime: 'August 23, 2026 — 14:30 PST',
      claimedNarrative:
        'URGENT: Massive 25ft tsunami waves smashing into Santa Barbara coastal town following offshore magnitude 7.8 earthquake! Evacuate now!',
      sourcePlatform: 'Telegram Channel (@BreakingIntelWorld) -> Reposted on X',
      sourceUrl: 'https://t.me/breakingintelworld/44910',
      uploadTimestamp: '2026-08-23T17:15:00Z',
      exifData: {
        Software: 'CapCut 12.1 Mobile Video Editor',
        VideoCodec: 'H.264 / AVC 8-bit',
        OriginalResolution: '1280x720',
        TargetBitrate: '1850 kbps',
        AudioSampleRate: '44100 Hz (Mono downmixed)',
      },
    },
    precomputedReport: {
      case_summary: {
        evidence_id: 'ANAM-2026-9104',
        primary_hash_sha256: '9A7B3E4122DF88C901AE45C721087F03C5D44219E866113A78BF201445DDC819',
        verdict_summary:
          'AUTHENTIC MEDIA IN MALICIOUS FALSE CONTEXT. Raw footage depicts the September 28, 2018 tsunami in Palu, Central Sulawesi, Indonesia. No visual manipulation detected; the narrative of a 2026 California disaster is completely fabricated.',
      },
      the_five_questions: {
        who: {
          observation:
            'Indonesian coastal infrastructure, tropical coconut palms (Cocos nucifera), regional Southeast Asian corrugated zinc gabled architecture, and a submerged white Asian-spec Toyota Hilux Vigo utility truck.',
          confidence: 0.98,
          entities_detected: [
            'Tropical Flora (Southeast Asian Cocos nucifera)',
            'Indonesian Kampong Architectural Archetype',
            'Submerged Utility Vehicle (Right-Hand Drive Asian Market Model)',
          ],
          synthetic_artifacts: [],
        },
        where: {
          claimed: 'Santa Barbara Coast, California, USA',
          observed: 'Talise Beach, Palu Bay, Central Sulawesi, Indonesia (-0.8917° S, 119.8707° E)',
          status: 'Inconsistent',
          geolocation_clues: [
            'Distant Gawalise Mountain ridge profile matches Palu Bay topography.',
            'Flora composition is strictly equatorial tropical, inconsistent with Santa Barbara coastal scrub / Mediterranean chaparral.',
            'Architectural building materials (lightweight timber frame and uninsulated zinc sheets) match Sulawesi coastal settlements.',
          ],
          coordinates_estimate: '-0.8917, 119.8707',
        },
        when: {
          claimed: 'August 23, 2026 — 14:30 PST',
          observed: 'September 28, 2018 — Approximately 17:22 UTC+8',
          status: 'Inconsistent',
          temporal_markers: [
            'Solar shadow vectors correspond to late afternoon sun in equatorial Southern Hemisphere.',
            'Archival sensor resolution and 720p compression artifacts are consistent with 2018 mobile phone sensors.',
            'Historical satellite and disaster registries verify the Palu liquefaction and tsunami event occurred on 28-09-2018.',
          ],
          solar_shadow_analysis: 'Sun elevation ~18° West azimuth, matching late afternoon equatorial Indonesia.',
        },
        what_changed: {
          mutations_detected: ['Crop', 'Compression', 'Watermark Removal', 'Audio Splicing'],
          details:
            'Original 2018 video was cropped by 15% to eliminate historical Indonesian news agency bug in top right corner. Audio was replaced with generic siren SFX and panic screaming track.',
          ela_findings: 'Uniform error level across natural frame; no localized pixel compositing detected.',
          sensor_noise_findings: 'Sensor noise pattern is uniform across all quadrants (consistent authentic sensor).',
        },
        how_it_spread: {
          lineage_notes:
            'Root capture on 2018-09-28 -> Re-encoded on CapCut on 2026-08-23 -> Uploaded to Russian/English OSINT aggregator Telegram -> Reposted to X with engagement-bait alarmist headline.',
          estimated_generations: 4,
          platforms_detected: ['Original Android Capture', 'CapCut Editor', 'Telegram', 'X (Twitter)'],
          virality_pattern: 'Disaster disinformation panic cycle leveraging recycled archival footage.',
        },
      },
      forensic_replay_timeline: [
        {
          stage: 1,
          label: 'Earliest Available / Estimated Root (2018-09-28)',
          description:
            'Eyewitness mobile recording of Palu tsunami wave landfall in Sulawesi, Indonesia. 1920x1080 native resolution with natural Indonesian audio dialogue.',
          estimated_timestamp: '2018-09-28 17:22:10 UTC+8',
          platform: 'Local Smartphone Storage',
          is_origin_echo: true,
        },
        {
          stage: 2,
          label: 'Archival Re-broadcast (2018-10)',
          description: 'Uploaded to Indonesian national news archive with station digital corner bug and lower third.',
          estimated_timestamp: '2018-10-01',
          platform: 'Broadcaster YouTube / TV',
        },
        {
          stage: 3,
          label: 'Weaponized Mutation & Re-edit (2026-08-23 16:40 UTC)',
          description:
            'Video cropped 15% top-right to strip news logo, downscaled to 720p, overlaid with heavy siren audio, and exported via CapCut.',
          estimated_timestamp: '2026-08-23 16:40:00 UTC',
          platform: 'CapCut Video Editor',
        },
        {
          stage: 4,
          label: 'Malicious Social Broadcast (2026-08-23 17:15 UTC)',
          description:
            'Posted to Telegram channel @BreakingIntelWorld with false Santa Barbara tsunami claim, amplified across X bot network.',
          estimated_timestamp: '2026-08-23 17:15:00 UTC',
          platform: 'Telegram & X',
        },
      ],
      context_integrity_check: {
        raw_media_status: '🟢 Consistent',
        claimed_location_status: '🔴 Inconsistent',
        claimed_time_status: '🔴 Inconsistent',
        audio_integrity_status: '🟠 Spliced/Manipulated',
      },
      investigator_notes:
        'Actionable Next Steps: 1. Issue context debunking referencing Palu 2018 archive (Reuters / BNPB Indonesia record ID 2018-EQ-0928). 2. Request platform hash-matching to suppress panicked evacuation hoaxes in California civil defense channels.',
      technical_metrics: {
        synthetic_probability_score: 2,
        manipulation_confidence: 96,
        compression_generations: 4,
        metadata_tamper_flag: true,
        chromatic_aberration_consistency: 'Natural',
        lighting_vector_consistency: 'Consistent',
        shadow_sun_angle_match: 'Mismatched',
        exif_anomaly_notes: 'Missing original camera EXIF; CapCut container metadata present.',
      },
      origin_echo: {
        is_estimated: true,
        label: 'ESTIMATED — NOT ORIGINAL EVIDENCE',
        original_resolution_estimate: '1920x1080 @ 30fps (Uncropped)',
        earliest_known_timestamp: '2018-09-28 17:22 UTC+8',
        likely_capture_device: 'Samsung Galaxy A-series or Xiaomi Redmi mobile sensor',
        unmanipulated_scene_description:
          'Original footage captured from 2nd story balcony of hotel near Talise beach during the 2018 Sulawesi earthquake-triggered tsunami.',
        surviving_attributes: [
          'Gawalise mountain silhouette geometry',
          'Palm tree wave dynamics',
          'Submerged white utility truck position',
        ],
      },
    },
  },
  {
    isPrecomputed: true,
    id: 'case-deepfake-diplomat',
    title: 'Synthetic GenAI Deepfake of High-Level Diplomat at Geneva Summit',
    category: 'Deepfake / Synthetic AI',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-950/30',
    description:
      'A hyper-realistic synthetic video and audio clip claiming an international ambassador declared emergency military mobilization. Detailed biometrics and generative frequency analysis expose diffusion synthesis.',
    intake: {
      evidenceId: 'ANAM-2026-4421',
      title: 'Ambassador Emergency Declaration Leak',
      mediaType: 'image',
      mediaUrl: createSvgDataUrl(svgCase2),
      previewUrl: createSvgDataUrl(svgCase2),
      fileName: 'ambassador_un_declaration_emergency.png',
      fileSize: 812400,
      fileHashSha256: '7F21B903E5C8D44A102B901198CEFA3048592113EA89012478BCDE9011442199',
      fileHashMd5: 'e108849bca02117845ba890122cd5601',
      claimedLocation: 'United Nations Palais des Nations, Geneva, Switzerland',
      claimedDateTime: 'August 22, 2026 — 10:00 CEST',
      claimedNarrative:
        'CONFIDENTIAL LEAK: Ambassador officially declares bilateral treaty dissolution and authorizes immediate naval mobilization at closed-door Geneva summit.',
      sourcePlatform: 'Anonymous Drop on Mastodon / DarkWeb Mirror',
      sourceUrl: 'https://infoleaks.onion/archive/78912',
      uploadTimestamp: '2026-08-23T11:00:00Z',
      exifData: {
        Software: 'Generated via Diffusion Pipeline (ComfyUI / Stable Diffusion 3)',
        ColorSpace: 'sRGB',
        BitsPerSample: '8 8 8',
        AlphaChannel: 'None',
      },
    },
    precomputedReport: {
      case_summary: {
        evidence_id: 'ANAM-2026-4421',
        primary_hash_sha256: '7F21B903E5C8D44A102B901198CEFA3048592113EA89012478BCDE9011442199',
        verdict_summary:
          'HIGHLY SOPHISTICATED SYNTHETIC GENERATIVE MEDIA (DEEPFAKE). The image exhibits classic diffusion model artifacts, including severe polydactyly on the left hand, corneal specular desynchronization, and plasticized high-frequency skin textures.',
      },
      the_five_questions: {
        who: {
          observation:
            'Synthetic likeness mimicking senior diplomat. Critical morphological defects detected: 6 distinct phalanges on the left hand resting on the lectern, asymmetric corneal light reflection in right eye, and unnatural hair-to-background edge melting.',
          confidence: 0.99,
          entities_detected: ['Faked Diplomat Likeness', 'UN Seal Simulation'],
          synthetic_artifacts: [
            'Polydactyly (6 fingers on left metacarpal)',
            'Corneal specular reflection mismatch',
            'Diffusion latent noise smoothing across epidermis',
            'Nonsensical garbled lettering on podium plaque',
          ],
        },
        where: {
          claimed: 'United Nations Palais des Nations, Geneva, Switzerland',
          observed: 'Synthetic AI Hallucination mimicking generic diplomatic conference chamber',
          status: 'Inconsistent',
          geolocation_clues: [
            'Podium architectural moldings do not match any known conference room in Palais des Nations.',
            'UN flag insignia in background has distorted olive branch count (17 leaves instead of standard 8 pairs / 16 total).',
          ],
          coordinates_estimate: 'N/A — Virtual Environment',
        },
        when: {
          claimed: 'August 22, 2026 — 10:00 CEST',
          observed: 'Synthesized recently (late 2025/2026 diffusion model weights)',
          status: 'Inconsistent',
          temporal_markers: [
            'Official Geneva UN schedule shows Room XVII was dark and undergoing acoustic maintenance on claimed date.',
            'Actual ambassador was documented attending public bilateral talks in Vienna on August 22.',
          ],
          solar_shadow_analysis: 'Artificial multi-point ambient studio lighting with zero physical ray consistency.',
        },
        what_changed: {
          mutations_detected: ['Generative Fill', 'AI Prompt Synthesis', 'Voice Clone TTS Splicing'],
          details:
            'Entire image is natively generated from text/latent seed. Synthetic voice cloned using 12-second sample of ambassador’s 2024 UN General Assembly address.',
          ela_findings: 'Completely flat high-frequency error distribution characteristic of neural generative renders.',
          sensor_noise_findings: 'Zero Bayer CFA sensor pattern or physical photon noise detected; pure latent smoothing.',
        },
        how_it_spread: {
          lineage_notes:
            'Synthesized locally using open-source diffusion checkpoint -> Seeded to anonymous darkweb drop -> Amplified by state-affiliated Telegram sockpuppets.',
          estimated_generations: 2,
          platforms_detected: ['Local ComfyUI Environment', 'Tor Onion Service', 'Mastodon / Telegram'],
          virality_pattern: 'Targeted geopolitical influence operation seeking to trigger financial market turbulence.',
        },
      },
      forensic_replay_timeline: [
        {
          stage: 1,
          label: 'AI Model Synthesis (Root Generation)',
          description:
            'Diffusion model prompt executed with LoRA adapter trained on public press conference photographs of the ambassador.',
          estimated_timestamp: '2026-08-22 23:14:00 UTC',
          platform: 'ComfyUI / Local PyTorch GPU',
          is_origin_echo: true,
        },
        {
          stage: 2,
          label: 'Audio Cloning & Lip Sync (ElevenLabs / Wav2Lip)',
          description: 'Synthetic TTS voice track aligned to synthesized video keyframes.',
          estimated_timestamp: '2026-08-23 01:20:00 UTC',
          platform: 'Neural Audio Synthesizer',
        },
        {
          stage: 3,
          label: 'Coordinated Distribution Launch',
          description: 'Broadcasted to social channels with inflammatory breaking headline.',
          estimated_timestamp: '2026-08-23 11:00:00 UTC',
          platform: 'Mastodon / Telegram Channels',
        },
      ],
      context_integrity_check: {
        raw_media_status: '🔴 Synthetic',
        claimed_location_status: '🔴 Inconsistent',
        claimed_time_status: '🔴 Inconsistent',
        audio_integrity_status: '🟠 Spliced/Manipulated',
      },
      investigator_notes:
        'Actionable Next Steps: 1. Preserve SHA-256 hash for forensic registry. 2. Cross-reference Austrian Ministry of Foreign Affairs press registry confirming ambassador was physically in Vienna at the claimed timestamp. 3. Alert diplomatic communications desk.',
      technical_metrics: {
        synthetic_probability_score: 99.4,
        manipulation_confidence: 99,
        compression_generations: 2,
        metadata_tamper_flag: true,
        chromatic_aberration_consistency: 'Synthetic',
        lighting_vector_consistency: 'Conflicting',
        shadow_sun_angle_match: 'Indeterminate',
        exif_anomaly_notes: 'Missing camera make/model/shutter tags. ComfyUI generator string detected in PNG chunks.',
      },
      origin_echo: {
        is_estimated: true,
        label: 'ESTIMATED — NOT ORIGINAL EVIDENCE',
        original_resolution_estimate: '1024x1024 (Native Latent Diffusion Output)',
        earliest_known_timestamp: '2026-08-22 23:14 UTC',
        likely_capture_device: 'NVIDIA RTX 4090 / CUDA Tensor Core Pipeline',
        unmanipulated_scene_description:
          'No physical origin scene exists. Virtual prompt composed of [ambassador likeness] + [conference podium] + [fictitious UN seal].',
        surviving_attributes: [
          'Hand polydactyly deformity',
          'Asymmetrical facial specular highlights',
          'Corrupted typography on background banner',
        ],
      },
    },
  },
  {
    isPrecomputed: true,
    id: 'case-spliced-protest',
    title: 'Digitally Spliced Extremist Banner & Cloned Crowd at Capitol Rally',
    category: 'Pixel Tampered / Spliced',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
    description:
      'A widely shared photograph claiming thousands of protesters displayed banned extremist hate symbols. Error Level Analysis (ELA) and Sobel seam detection pinpoint precise Photoshop compositing boundaries.',
    intake: {
      evidenceId: 'ANAM-2026-1188',
      title: 'Capitol Protest Extremist Banner Allegation',
      mediaType: 'image',
      mediaUrl: createSvgDataUrl(svgCase3),
      previewUrl: createSvgDataUrl(svgCase3),
      fileName: 'capitol_rally_extremist_banners_proof.jpg',
      fileSize: 624100,
      fileHashSha256: 'B18C4402A7E89F0123BD8821094ECA5512998341AE780012AABC459012334812',
      fileHashMd5: 'f89012ab45de890123ab45cdef789012',
      claimedLocation: 'Reichstag Plaza / Brandenburg Gate, Berlin, Germany',
      claimedDateTime: 'August 20, 2026 — 15:00 CEST',
      claimedNarrative:
        'SHOCKING: Over 50,000 demonstrators march in Berlin openly carrying illegal violent extremist banners. Media blackout in effect!',
      sourcePlatform: 'X (Twitter) Viral Post with 2.4M Impressions',
      sourceUrl: 'https://x.com/truth_patriot_news/status/198234710',
      uploadTimestamp: '2026-08-21T09:30:00Z',
      exifData: {
        Software: 'Adobe Photoshop 25.4 (Macintosh)',
        ModifyDate: '2026-08-20T21:44:12',
        ColorSpace: 'Adobe RGB (1998)',
        Compression: 'JPEG (old-style)',
      },
    },
    precomputedReport: {
      case_summary: {
        evidence_id: 'ANAM-2026-1188',
        primary_hash_sha256: 'B18C4402A7E89F0123BD8821094ECA5512998341AE780012AABC459012334812',
        verdict_summary:
          'DIRECT PIXEL TAMPERING AND CLONE-STAMP MANIPULATION. Error Level Analysis reveals that the central yellow banner was digitally pasted into the scene with an error discrepancy of Δ=48.2%. Additionally, identical crowd clusters were copy-pasted to simulate massive attendance.',
      },
      the_five_questions: {
        who: {
          observation:
            'Peaceful civilian protest crowd from a 2023 labor union rally. The extremist banner is a digital insertion with unmatched raster resolution and missing physical wind tension wrinkles.',
          confidence: 0.97,
          entities_detected: ['Berlin Trade Union Marchers', 'Digitally Pasted Banner Graphic'],
          synthetic_artifacts: [
            'Hard unfeathered boundary along banner perimeter',
            'Triplicated identical crowd silhouettes (Copy-Move forgery)',
          ],
        },
        where: {
          claimed: 'Reichstag Plaza / Brandenburg Gate, Berlin, Germany',
          observed: 'Brandenburg Gate, Berlin, Germany (Real architectural background)',
          status: 'Consistent',
          geolocation_clues: [
            'Doric column geometry and entablature match Brandenburg Gate Western facade.',
          ],
          coordinates_estimate: '52.5163° N, 13.3777° E',
        },
        when: {
          claimed: 'August 20, 2026 — 15:00 CEST',
          observed: 'May 1, 2023 (May Day Labor Rally)',
          status: 'Inconsistent',
          temporal_markers: [
            'Clothing thickness and blooming spring linden trees correspond to early May, not late August.',
            'Berlin Police crowd event register ID 2023-BER-0501 confirms the original baseline gathering.',
          ],
          solar_shadow_analysis: 'Sun azimuth ~210° South-Southwest, consistent with midday Central European summer time.',
        },
        what_changed: {
          mutations_detected: ['Inpainting', 'Copy-Move Clone Stamp', 'Color Splice', 'Banner Insertion'],
          details:
            '1. Central original green trade union banner replaced with inflammatory yellow extremist graphic. 2. Clone-stamp brush applied twice to duplicate crowd heads, inflating apparent density by ~300%.',
          ela_findings: 'Massive ELA spike (Δ=48.2%) inside the banner box against 6.4% background baseline.',
          sensor_noise_findings: 'Banner box shows total absence of authentic ISO 400 camera sensor noise.',
        },
        how_it_spread: {
          lineage_notes:
            'May 2023 press photo -> Edited in Adobe Photoshop on 2026-08-20 at 21:44 -> Posted to fringe forum -> Re-tweeted by political bot network.',
          estimated_generations: 3,
          platforms_detected: ['DPA Press Agency', 'Adobe Photoshop', 'Fringe Forum', 'X (Twitter)'],
          virality_pattern: 'Rage-bait political manipulation designed to stigmatize peaceful civic gatherings.',
        },
      },
      forensic_replay_timeline: [
        {
          stage: 1,
          label: 'Original Authentic Photojournalism (2023-05-01)',
          description:
            'Legitimate press photograph taken by accredited photojournalist during May Day rally in Berlin. Natural green banners.',
          estimated_timestamp: '2023-05-01 14:10:00 CEST',
          platform: 'Nikon D850 DSLR Raw File',
          is_origin_echo: true,
        },
        {
          stage: 2,
          label: 'Photoshop Compositing & Crowd Cloning (2026-08-20)',
          description:
            'Image modified in Adobe Photoshop 25.4. Extremist text pasted; crowd multiplied via clone tool.',
          estimated_timestamp: '2026-08-20 21:44:12 CEST',
          platform: 'Adobe Photoshop macOS',
        },
        {
          stage: 3,
          label: 'Viral Misinformation Campaign (2026-08-21)',
          description: 'Published on X claiming active 2026 riots with fabricated attendance statistics.',
          estimated_timestamp: '2026-08-21 09:30:00 CEST',
          platform: 'X (Twitter)',
        },
      ],
      context_integrity_check: {
        raw_media_status: '🟠 Tampered',
        claimed_location_status: '🟢 Verified',
        claimed_time_status: '🔴 Inconsistent',
        audio_integrity_status: '🟢 Untampered',
      },
      investigator_notes:
        'Actionable Next Steps: 1. Overlay original DPA May Day 2023 reference photo to demonstrate exact pixel-for-pixel alignment. 2. Highlight EXIF metadata tag showing Adobe Photoshop modification timestamp.',
      technical_metrics: {
        synthetic_probability_score: 12,
        manipulation_confidence: 98,
        compression_generations: 3,
        metadata_tamper_flag: true,
        chromatic_aberration_consistency: 'Distorted',
        lighting_vector_consistency: 'Conflicting',
        shadow_sun_angle_match: 'Matched',
        exif_anomaly_notes: 'Photoshop History Tag present in XMP metadata stream.',
      },
      origin_echo: {
        is_estimated: true,
        label: 'ESTIMATED — NOT ORIGINAL EVIDENCE',
        original_resolution_estimate: '4096x2730 (Nikon FX Full Frame)',
        earliest_known_timestamp: '2023-05-01 14:10 CEST',
        likely_capture_device: 'Nikon D850 + AF-S NIKKOR 24-70mm f/2.8E ED VR',
        unmanipulated_scene_description:
          'Original photo shows a peaceful labor union assembly holding green banners demanding fair wages; crowd size approximately 4,000.',
        surviving_attributes: [
          'Brandenburg Gate structural geometry',
          'Left foreground marcher profiles',
          'Background sky and lighting gradients',
        ],
      },
    },
  },
  {
    isPrecomputed: true,
    id: 'case-recycled-conflict',
    title: 'Recycled 2014 Grad Artillery Strike Recaptioned as 2026 Border Incursion',
    category: 'False Narrative / Recycled',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
    description:
      'Night-time thermal footage claiming an active armored breakthrough. Weapon blast velocity physics, thermal signatures, and topographic features prove it is a recycled 2014 archive clip.',
    intake: {
      evidenceId: 'ANAM-2026-6632',
      title: 'Night Armor Incursion Thermal Footage',
      mediaType: 'image',
      mediaUrl: createSvgDataUrl(svgCase4),
      previewUrl: createSvgDataUrl(svgCase4),
      fileName: 'night_strike_flir_thermal_leaked.jpg',
      fileSize: 395000,
      fileHashSha256: '44C0198EFA901233B89012ACDF89012489012478BCDE901198AAB01245CD9901',
      fileHashMd5: 'a89012cd456789012345bcde67890123',
      claimedLocation: 'Suwalki Gap Border Corridor, Poland / Lithuania',
      claimedDateTime: 'August 23, 2026 — 02:15 CET',
      claimedNarrative:
        'BREAKING: Massive night artillery bombardment and armored column attack reported across the border corridor right now!',
      sourcePlatform: 'Military OSINT Telegram Channel -> TikTok Mirror',
      sourceUrl: 'https://t.me/frontlinereport_leak/1982',
      uploadTimestamp: '2026-08-23T04:00:00Z',
      exifData: {
        Software: 'FFmpeg 6.1 (stripped audio stream)',
        ColorProfile: 'Rec.709',
        FrameRate: '25.00 fps',
      },
    },
    precomputedReport: {
      case_summary: {
        evidence_id: 'ANAM-2026-6632',
        primary_hash_sha256: '44C0198EFA901233B89012ACDF89012489012478BCDE901198AAB01245CD9901',
        verdict_summary:
          'UNMANIPULATED ARCHIVAL MEDIA PAIRED WITH FABRICATED BATTLEFIELD CONTEXT. Thermal signature, detonation dispersion speed, and landscape contours match a July 2014 BM-21 Grad salvo near Zelenopillya, Ukraine. Zero border activity occurred in the Suwalki corridor.',
      },
      the_five_questions: {
        who: {
          observation:
            'Thermal infrared imaging of a 122mm BM-21 Grad multiple rocket launcher barrage striking an agricultural grain depot.',
          confidence: 0.96,
          entities_detected: ['BM-21 Grad Rocket Salvo', 'Agricultural Grain Silo Array'],
          synthetic_artifacts: [],
        },
        where: {
          claimed: 'Suwalki Gap Border Corridor, Poland / Lithuania',
          observed: 'Luhansk / Zelenopillya Sector, Eastern Ukraine (47.9250° N, 39.6380° E)',
          status: 'Inconsistent',
          geolocation_clues: [
            'Silo cluster layout matches industrial farming complex mapped in Luhansk Oblast.',
            'Flat steppe terrain is inconsistent with the dense forestry and rolling moraine hills of the Suwalki Gap.',
          ],
          coordinates_estimate: '47.9250° N, 39.6380° E',
        },
        when: {
          claimed: 'August 23, 2026 — 02:15 CET',
          observed: 'July 11, 2014 — 04:30 UTC+3',
          status: 'Inconsistent',
          temporal_markers: [
            'Thermal sensor resolution and analog noise lines match generation-2 FLIR optics used in 2014.',
            'Lithuanian Border Guard & NATO Air Shield radar logs show zero kinetic or acoustic activity in the Suwalki corridor on August 23, 2026.',
          ],
          solar_shadow_analysis: 'Night-time thermal infrared with zero solar illumination.',
        },
        what_changed: {
          mutations_detected: ['Cropping', 'Audio Stripping', 'Resolution Downsampling'],
          details:
            'Watermark of Russian military liveleak uploader was cropped out of top-right quadrant. Video was re-encoded via FFmpeg to erase original file creation timestamps.',
          ela_findings: 'Normal thermal frame compression with uniform noise floor.',
          sensor_noise_findings: 'Consistent analog thermal detector line scanning noise.',
        },
        how_it_spread: {
          lineage_notes:
            '2014 archive footage on YouTube -> Downloaded in August 2026 -> Striped of watermarks -> Re-uploaded to sensationalist Telegram channels to manufacture panic.',
          estimated_generations: 4,
          platforms_detected: ['YouTube (2014)', 'FFmpeg Re-encoder', 'Telegram', 'TikTok'],
          virality_pattern: 'Geopolitical fear-mongering and military disinformation.',
        },
      },
      forensic_replay_timeline: [
        {
          stage: 1,
          label: 'Original 2014 Combat Recording',
          description: 'Thermal camera recording of 2014 artillery strike in Eastern Ukraine.',
          estimated_timestamp: '2014-07-11',
          platform: 'Military Thermal Reconnaissance Unit',
          is_origin_echo: true,
        },
        {
          stage: 2,
          label: 'Re-encoding & Metadata Scrape',
          description: 'Processed through FFmpeg to crop top right logo and remove audio.',
          estimated_timestamp: '2026-08-23 03:10 UTC',
          platform: 'FFmpeg CLI Tool',
        },
        {
          stage: 3,
          label: 'Viral Disinformation Release',
          description: 'Posted to Telegram alleging active attack on NATO corridor.',
          estimated_timestamp: '2026-08-23 04:00 UTC',
          platform: 'Telegram Channel',
        },
      ],
      context_integrity_check: {
        raw_media_status: '🟢 Consistent',
        claimed_location_status: '🔴 Inconsistent',
        claimed_time_status: '🔴 Inconsistent',
        audio_integrity_status: '🟠 Spliced/Manipulated',
      },
      investigator_notes:
        'Actionable Next Steps: 1. Confirm with Polish Border Guard (Straż Graniczna) official SITREP. 2. Publish geolocation comparison showing exact match to 2014 Luhansk agricultural complex.',
      technical_metrics: {
        synthetic_probability_score: 1,
        manipulation_confidence: 97,
        compression_generations: 4,
        metadata_tamper_flag: true,
        chromatic_aberration_consistency: 'Natural',
        lighting_vector_consistency: 'Consistent',
        shadow_sun_angle_match: 'Matched',
        exif_anomaly_notes: 'Standard stripped video stream container.',
      },
      origin_echo: {
        is_estimated: true,
        label: 'ESTIMATED — NOT ORIGINAL EVIDENCE',
        original_resolution_estimate: '720x576 PAL / Thermal Recon Stream',
        earliest_known_timestamp: '2014-07-11 04:30 UTC+3',
        likely_capture_device: 'Military FLIR Pod / Thermal Reconnaissance Sensor',
        unmanipulated_scene_description:
          'Original footage recorded during the 2014 conflict in the Donbas region showing night rocket artillery fire hitting military staging area.',
        surviving_attributes: [
          'Silo thermal heat dissipation signature',
          'Rocket motor trajectory arc',
          'Analog thermal scanlines',
        ],
      },
    },
  },
  {
    isPrecomputed: true,
    id: 'case-forged-memo',
    title: 'Fabricated Declassified Intelligence Memorandum on Covert Program',
    category: 'Pixel Tampered / Spliced',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
    description:
      'A photographed document alleging government authorization of a secret domestic surveillance program. Forensic typography, kerning analysis, and digital stamp vector alignment reveal a modern digital forgery.',
    intake: {
      evidenceId: 'ANAM-2026-3390',
      title: 'Project Archon Classified Memo Leak',
      mediaType: 'image',
      mediaUrl: createSvgDataUrl(svgCase5),
      previewUrl: createSvgDataUrl(svgCase5),
      fileName: 'declassified_project_archon_memo_leaked.png',
      fileSize: 512000,
      fileHashSha256: '55E01982BA770123AC901248BC8901241198AAB01245CD990144C0198EFA9012',
      fileHashMd5: 'c901248bc8901241198aab01245cd990',
      claimedLocation: 'Washington, D.C., USA (National Archives / Pentagon)',
      claimedDateTime: 'Claimed Document Date: 22 August 2026',
      claimedNarrative:
        'WHISTLEBLOWER BOMBSHELL: Official Department of Special Affairs memorandum confirming covert surveillance program Project Archon.',
      sourcePlatform: 'Reddit (r/conspiracy) & Substack Leak Post',
      sourceUrl: 'https://reddit.com/r/conspiracy/comments/192837',
      uploadTimestamp: '2026-08-23T14:00:00Z',
      exifData: {
        Software: 'Canva Web Graphic Designer',
        DPI: '72 DPI (Inconsistent with physical 300+ DPI document scanners)',
        ColorModel: 'RGB',
      },
    },
    precomputedReport: {
      case_summary: {
        evidence_id: 'ANAM-2026-3390',
        primary_hash_sha256: '55E01982BA770123AC901248BC8901241198AAB01245CD990144C0198EFA9012',
        verdict_summary:
          'TOTAL DOCUMENT FABRICATION (DIGITAL FORGERY). Document features modern digital fonts (Arial/Impact) created in Canva with synthetic paper drop shadows. The red "DECLASSIFIED" stamp exhibits perfectly sharp vector edges with zero ink bleeding, paper grain absorption, or scanner skew.',
      },
      the_five_questions: {
        who: {
          observation:
            'Purported government memorandum from non-existent agency ("Department of Special Affairs"). Typographic kerning and modern digital drop-shadow filters indicate amateur digital compilation.',
          confidence: 0.99,
          entities_detected: ['Fictitious Agency Header', 'Digital Stamp Overlay'],
          synthetic_artifacts: [
            'Perfect pixel grid alignment on rotated stamp (mathematical vector rotation without physical distortion)',
            'Screen-resolution 72 DPI rendering rather than 300-600 DPI flatbed document scan',
            'Artificial CSS-style drop shadow behind paper perimeter',
          ],
        },
        where: {
          claimed: 'Washington, D.C., USA',
          observed: 'Digital Graphic Design Software (Canva / Figma)',
          status: 'Inconsistent',
          geolocation_clues: [
            'Agency name does not correspond to any US Federal agency or active classification authority.',
          ],
          coordinates_estimate: 'N/A — Digital Document Canvas',
        },
        when: {
          claimed: 'August 22, 2026',
          observed: 'Created on Canva on August 23, 2026',
          status: 'Inconsistent',
          temporal_markers: [
            'Header typography mixes modern web-safe Arial font with retro typewriter font, a signature of modern digital mockups.',
          ],
          solar_shadow_analysis: 'Pure synthetic 2D box-shadow algorithm.',
        },
        what_changed: {
          mutations_detected: ['Synthetic Document Generation', 'Digital Stamp Overlay', 'Artificial Aging Filter'],
          details:
            'Created entirely from a blank template. Text, header, classification markers, and stamp are all synthetic vector layers.',
          ela_findings: 'Severe contrast difference between anti-aliased font vector edges and flat background plane.',
          sensor_noise_findings: 'Zero paper pulp texture noise or CCD scanner sensor noise.',
        },
        how_it_spread: {
          lineage_notes:
            'Generated in Canva -> Exported as PNG -> Uploaded to Reddit r/conspiracy -> Shared on Substack newsletter.',
          estimated_generations: 2,
          platforms_detected: ['Canva', 'Reddit', 'Substack'],
          virality_pattern: 'Conspiracy theory viral seeding.',
        },
      },
      forensic_replay_timeline: [
        {
          stage: 1,
          label: 'Digital Composition (Canva)',
          description: 'Document designed using web graphics tool. Fake agency title and text composed.',
          estimated_timestamp: '2026-08-23 13:10 UTC',
          platform: 'Canva Cloud Editor',
          is_origin_echo: true,
        },
        {
          stage: 2,
          label: 'PNG Export & Social Upload',
          description: 'Saved as 72 DPI web image and published to forum claiming real leak.',
          estimated_timestamp: '2026-08-23 14:00 UTC',
          platform: 'Reddit r/conspiracy',
        },
      ],
      context_integrity_check: {
        raw_media_status: '🔴 Synthetic',
        claimed_location_status: '🔴 Inconsistent',
        claimed_time_status: '🔴 Inconsistent',
        audio_integrity_status: '🟢 Untampered',
      },
      investigator_notes:
        'Actionable Next Steps: 1. Note Canva software signature in PNG chunk headers. 2. Verify non-existence of claimed agency in the United States Government Manual. 3. Document 72 DPI screen rendering proof.',
      technical_metrics: {
        synthetic_probability_score: 95,
        manipulation_confidence: 99,
        compression_generations: 1,
        metadata_tamper_flag: true,
        chromatic_aberration_consistency: 'Synthetic',
        lighting_vector_consistency: 'Conflicting',
        shadow_sun_angle_match: 'Indeterminate',
        exif_anomaly_notes: 'Software tag: Canva Web Designer. Resolution: 72 DPI.',
      },
      origin_echo: {
        is_estimated: true,
        label: 'ESTIMATED — NOT ORIGINAL EVIDENCE',
        original_resolution_estimate: '800x500 (Canva Template Dimensions)',
        earliest_known_timestamp: '2026-08-23 13:10 UTC',
        likely_capture_device: 'Chrome Browser on macOS (Canva Web App)',
        unmanipulated_scene_description:
          'Entire artifact is a synthetic graphic design file; no authentic underlying government memo exists.',
        surviving_attributes: [
          'Canva standard template margin dimensions',
          'Digital red stamp vector typography',
          'Fictitious classification mark placement',
        ],
      },
    },
  },
];
