/* =========================================================================
 * THE GAP SENTINEL
 *
 * NOT_ASSESSED is a first-class value, not an empty string and not a zero.
 * It means: the model omitted this field, or analysis has not run.
 *
 * Every panel that can display a finding must also be able to render this
 * state — grey, unemphasised, no verdict colour, no percentage, and never
 * a green tick. It exists so that deleting an invented constant has
 * somewhere honest to put the gap it leaves behind.
 * ========================================================================= */

export const NOT_ASSESSED = 'NOT_ASSESSED' as const;
export type NotAssessed = typeof NOT_ASSESSED;

/** A value the file or the model supplied, or the explicit absence of one. */
export type Assessable<T> = T | NotAssessed;

/** Narrowing helper: true when a real measurement or model answer is present. */
export function isAssessed<T>(value: Assessable<T>): value is T {
  return value !== NOT_ASSESSED;
}

export interface CaseSummary {
  evidence_id: string;
  primary_hash_sha256: string;
  verdict_summary: string;
}

export interface WhoAnalysis {
  observation: string;
  confidence: number; // 0.00 to 1.00
  entities_detected?: string[];
  synthetic_artifacts?: string[];
}

export interface WhereAnalysis {
  claimed: string;
  observed: string;
  status: 'Consistent' | 'Inconsistent' | 'Needs Verification';
  geolocation_clues?: string[];
  coordinates_estimate?: string;
}

export interface WhenAnalysis {
  claimed: string;
  observed: string;
  status: 'Consistent' | 'Inconsistent' | 'Needs Verification';
  temporal_markers?: string[];
  solar_shadow_analysis?: string;
}

export interface WhatChangedAnalysis {
  mutations_detected: string[]; // e.g. ["Crop", "Compression", "Watermark", "Audio Splice", "Generative Fill"]
  details: string;
  ela_findings?: string;
  sensor_noise_findings?: string;
}

export interface HowItSpreadAnalysis {
  lineage_notes: string;
  estimated_generations: number;
  platforms_detected?: string[];
  virality_pattern?: string;
}

export interface FiveQuestions {
  who: WhoAnalysis;
  where: WhereAnalysis;
  when: WhenAnalysis;
  what_changed: WhatChangedAnalysis;
  how_it_spread: HowItSpreadAnalysis;
}

/* -------------------------------------------------------------------------
 * View-side projections of the five questions.
 *
 * The wire interfaces above are exactly what the Gemini responseSchema
 * produces and must not be altered. These aliases widen only the fields
 * that carry a verdict or a number, so that a case which has not been
 * analysed can render the gap instead of a fabricated zero.
 * ---------------------------------------------------------------------- */

export type AssessedWho = Omit<WhoAnalysis, 'confidence'> & {
  confidence: Assessable<number>;
};
export type AssessedWhere = Omit<WhereAnalysis, 'status'> & {
  status: Assessable<WhereAnalysis['status']>;
};
export type AssessedWhen = Omit<WhenAnalysis, 'status'> & {
  status: Assessable<WhenAnalysis['status']>;
};
export type AssessedHowItSpread = Omit<HowItSpreadAnalysis, 'estimated_generations'> & {
  estimated_generations: Assessable<number>;
};

export interface ForensicTimelineStage {
  stage: number;
  label: string;
  description: string;
  estimated_timestamp?: string;
  platform?: string;
  is_origin_echo?: boolean;
}

export interface ContextIntegrityCheck {
  raw_media_status: '🟢 Consistent' | '🟠 Tampered' | '🔴 Synthetic' | string;
  claimed_location_status: '🟢 Verified' | '🟠 Needs Verification' | '🔴 Inconsistent' | string;
  claimed_time_status: '🟢 Verified' | '🟠 Needs Verification' | '🔴 Inconsistent' | string;
  audio_integrity_status: '🟢 Untampered' | '🟠 Spliced/Manipulated' | '🔴 Out of Sync' | string;
}

export interface TechnicalForensicMetrics {
  synthetic_probability_score: number; // 0-100
  manipulation_confidence: number; // 0-100
  compression_generations: number;
  metadata_tamper_flag: boolean;
  chromatic_aberration_consistency: 'Natural' | 'Synthetic' | 'Distorted';
  lighting_vector_consistency: 'Consistent' | 'Conflicting' | 'Inconclusive';
  shadow_sun_angle_match: 'Matched' | 'Mismatched' | 'Indeterminate';
  exif_anomaly_notes?: string;
}

export interface OriginEchoEstimate {
  is_estimated: true;
  label: 'ESTIMATED — NOT ORIGINAL EVIDENCE';
  original_resolution_estimate?: string;
  earliest_known_timestamp?: string;
  likely_capture_device?: string;
  unmanipulated_scene_description?: string;
  surviving_attributes: string[];
}

export interface AnamnesisForensicReport {
  case_summary: CaseSummary;
  the_five_questions: FiveQuestions;
  forensic_replay_timeline: ForensicTimelineStage[];
  context_integrity_check: ContextIntegrityCheck;
  investigator_notes: string;
  technical_metrics?: TechnicalForensicMetrics;
  origin_echo?: OriginEchoEstimate;
}

/**
 * The dossier shape handed to the export modal.
 *
 * Mirrors AnamnesisForensicReport but is built from the view model, so it
 * carries gaps rather than zero-filling them. Optional blocks are omitted
 * entirely when nothing in them was assessed.
 */
export interface ExportableDossier {
  case_summary: {
    evidence_id: string;
    primary_hash_sha256: Assessable<string>;
    verdict_summary: Assessable<string>;
  };
  the_five_questions: {
    who: AssessedWho;
    where: AssessedWhere;
    when: AssessedWhen;
    what_changed: WhatChangedAnalysis;
    how_it_spread: AssessedHowItSpread;
  };
  forensic_replay_timeline: ForensicTimelineStage[];
  context_integrity_check: ContextIntegrityCheck;
  investigator_notes: Assessable<string>;
  technical_metrics?: Partial<TechnicalForensicMetrics>;
  origin_echo?: OriginEchoEstimate;
}

export interface MediaIntakeData {
  evidenceId: string;
  title: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  mediaUrl: string;
  previewUrl: string;
  fileName: string;
  fileSize: number;
  fileHashSha256: string;
  fileHashMd5?: string;
  claimedLocation: string;
  claimedDateTime: string;
  claimedNarrative: string;
  sourcePlatform: string;
  sourceUrl?: string;
  exifData?: Record<string, string | number | boolean>;
  uploadTimestamp: string;
}

export interface ForensicFilterMode {
  id: 'raw' | 'ela' | 'noise' | 'sobel' | 'luminance' | 'solarize' | 'inverted' | 'blue_channel';
  label: string;
  description: string;
  icon: string;
}

export type StandardEvidenceStatus =
  | '🟢 OBSERVED / CONSISTENT'
  | '🟠 NEEDS VERIFICATION'
  | '🔴 INCONSISTENT'
  | '🔵 ESTIMATED'
  | '⚪ NOT ASSESSED';

/** The neutral status. Carries no verdict; must never render in a verdict colour. */
export const STATUS_NOT_ASSESSED: StandardEvidenceStatus = '⚪ NOT ASSESSED';

export interface SourceCompletenessData {
  submittedDuration: string;
  completenessAssessment: 'APPEARS COMPLETE' | 'POSSIBLE EXTRACTED CLIP' | 'INSUFFICIENT EVIDENCE';
  possibleExtractedClip: boolean;
  canVerifyFullSource: boolean;
  fullSourceFoundInEvidence: boolean;
  detectedIndicators: string[];
  sourceVerificationStatus: string;
  confidence: number;
  investigativeFlag: boolean;
  investigativeLead: string;
  originalProvided?: boolean;
  comparison?: {
    originalDuration: string;
    submittedClipTiming: string;
    extractedSegment: string;
    omittedPortions: string[];
    matchStatus: string;
  };
}

export interface PersistentCaseState {
  ingest: MediaIntakeData;
  analysis: {
    visual: {
      frameCharacteristics: Assessable<string>;
      visualIndicators: string[];
      chromaticAberration: Assessable<string>;
      lightingConsistency: Assessable<string>;
      shadowSunAngleMatch: Assessable<string>;
      confidence: Assessable<number>;
    };
    audio: {
      audioCharacteristics: Assessable<string>;
      audioIndicators: string[];
      enfStatus: Assessable<string>;
      acousticEnvelope: Assessable<string>;
      ambientReverbConsistency: Assessable<string>;
      confidence: Assessable<number>;
    };
    structural: {
      streamCharacteristics: Assessable<string>;
      compressionGenerations: Assessable<number>;
      metadataTamperFlag: Assessable<boolean>;
      confidence: Assessable<number>;
    };
    manipulation: {
      mutationsDetected: string[];
      syntheticProbabilityScore: Assessable<number>;
      manipulationConfidence: Assessable<number>;
      status: StandardEvidenceStatus;
    };
    sourceCompleteness?: SourceCompletenessData;
  };
  relationships: {
    totalRelatedFound: Assessable<number>;
    nodes: Array<{
      id: string;
      title: string;
      relationshipType: string;
      confidence: Assessable<number>;
      platform: string;
      resolution: Assessable<string>;
      observedTransformations: string[];
      badgeColor: string;
      /* Per-copy lineage detail. The forensic schema returns no per-node
       * label, description, mutation type, generation depth or timestamp,
       * so these are NOT_ASSESSED until a source of them exists. */
      label: Assessable<string>;
      description: Assessable<string>;
      mutationType: Assessable<string>;
      generation: Assessable<number>;
      timestamp: Assessable<string>;
    }>;
    lineageHierarchy: Array<{ label: string; sub: string; type: string }>;
  };
  investigation: {
    forensicReplay: ForensicTimelineStage[];
    originEcho: Assessable<OriginEchoEstimate>;
    contextCheck: {
      rawMediaStatus: StandardEvidenceStatus;
      claimedLocationStatus: StandardEvidenceStatus;
      claimedTimeStatus: StandardEvidenceStatus;
      audioStatus: StandardEvidenceStatus;
      cascade: {
        rawMedia: string;
        claimedDate: string;
        claimedLocation: string;
        claimedCaption: string;
      };
      summary: string;
    };
  };
  report: {
    digitalCrimeScene: {
      who: AssessedWho;
      where: AssessedWhere;
      when: AssessedWhen;
      what: WhatChangedAnalysis;
      how: AssessedHowItSpread;
      source: {
        earliestKnownSource: Assessable<string>;
        platform: Assessable<string>;
      };
    };
    forensicPackage: {
      evidenceId: string;
      sha256: Assessable<string>;
      findings: Assessable<string>;
      confidenceScores: Record<string, number>;
      processingHistory: string[];
      generatedAt: string;
    };
  };
}

export interface InvestigatorProfile {
  id: string;
  name: string;
  officialEmail: string;
  departmentUnit: string;
  activeCasesCount: number;
  completedCasesCount: number;
  recentActivity: Array<{
    id: string;
    caseId: string;
    description: string;
    timestamp: string;
  }>;
}

export interface SavedCase {
  id: string; // e.g. "ANM-0147"
  title: string;
  lastUpdated: string;
  currentStepNumber: number; // 1, 2, 3, 4, 5
  workflowStage: number; // 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6
  completedSteps: number[];
  expandedCompletedSteps?: { [key: number]: boolean };
  status: 'Investigation in progress' | 'Completed / Dossier Ready' | string;
  caseState: PersistentCaseState;
  investigatorId: string;
}

export interface BenchmarkCase {
  id: string;
  title: string;
  category: 'False Narrative / Recycled' | 'Deepfake / Synthetic AI' | 'Pixel Tampered / Spliced' | 'Audio-Visual Desync';
  badgeColor: string;
  description: string;
  intake: MediaIntakeData;
  precomputedReport: AnamnesisForensicReport;
}

