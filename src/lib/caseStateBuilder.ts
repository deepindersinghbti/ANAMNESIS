import {
  AnamnesisForensicReport,
  MediaIntakeData,
  NOT_ASSESSED,
  PersistentCaseState,
  STATUS_NOT_ASSESSED,
  StandardEvidenceStatus,
} from '../types';
import { deriveManipulationAssessment } from './manipulationAssessment';

/* =========================================================================
 * THE ADAPTER
 *
 * One function crosses the boundary between the wire type the model returns
 * and the view type the five-step wizard reads. Its contract:
 *
 *   • Pure.    Same inputs produce the same output. No Date.now(), no
 *              Math.random(), no reads of ambient state.
 *   • Total.   Accepts report === null and returns a valid "not analysed"
 *              state rather than throwing.
 *   • Honest.  Every field is copied from `intake` or from `report`, or is
 *              the explicit NOT_ASSESSED sentinel. It may never originate
 *              a fact.
 *
 * Both branches satisfy all three. Where a comment below says a field is
 * not measured, that is a statement about the forensic schema rather than a
 * placeholder: the model returns no per-copy lineage, no acoustic envelope
 * and no container metadata, so those fields are gaps and stay gaps until
 * something actually measures them.
 * ========================================================================= */

/**
 * A case that carries real intake measurements and nothing else.
 *
 * Reached when analysis has not run, or when it ran and failed. The hash,
 * the EXIF tags and the claimed context are genuine and are shown; every
 * interpretive field renders as the gap. This is a legitimate, displayable
 * state — a failed analyse call must land here, not on a green tick.
 */
function buildUnanalysedCaseState(intake: MediaIntakeData): PersistentCaseState {
  return {
    ingest: intake,
    analysis: {
      visual: {
        frameCharacteristics: NOT_ASSESSED,
        visualIndicators: [],
        chromaticAberration: NOT_ASSESSED,
        lightingConsistency: NOT_ASSESSED,
        shadowSunAngleMatch: NOT_ASSESSED,
        confidence: NOT_ASSESSED,
      },
      audio: {
        audioCharacteristics: NOT_ASSESSED,
        audioIndicators: [],
        enfStatus: NOT_ASSESSED,
        acousticEnvelope: NOT_ASSESSED,
        ambientReverbConsistency: NOT_ASSESSED,
        confidence: NOT_ASSESSED,
      },
      structural: {
        streamCharacteristics: NOT_ASSESSED,
        compressionGenerations: NOT_ASSESSED,
        metadataTamperFlag: NOT_ASSESSED,
        confidence: NOT_ASSESSED,
      },
      manipulation: {
        mutationsDetected: [],
        syntheticProbabilityScore: NOT_ASSESSED,
        manipulationConfidence: NOT_ASSESSED,
        status: STATUS_NOT_ASSESSED,
      },
    },
    relationships: {
      totalRelatedFound: NOT_ASSESSED,
      nodes: [],
      lineageHierarchy: [],
    },
    investigation: {
      forensicReplay: [],
      originEcho: NOT_ASSESSED,
      contextCheck: {
        rawMediaStatus: STATUS_NOT_ASSESSED,
        claimedLocationStatus: STATUS_NOT_ASSESSED,
        claimedTimeStatus: STATUS_NOT_ASSESSED,
        audioStatus: STATUS_NOT_ASSESSED,
        cascade: {
          rawMedia: NOT_ASSESSED,
          // The claims are real: the investigator typed them. Only the
          // observation against which they would be checked is missing.
          claimedDate: intake.claimedDateTime || NOT_ASSESSED,
          claimedLocation: intake.claimedLocation || NOT_ASSESSED,
          claimedCaption: intake.claimedNarrative || NOT_ASSESSED,
        },
        summary: NOT_ASSESSED,
      },
    },
    report: {
      digitalCrimeScene: {
        who: { observation: NOT_ASSESSED, confidence: NOT_ASSESSED },
        where: {
          claimed: intake.claimedLocation || NOT_ASSESSED,
          observed: NOT_ASSESSED,
          status: NOT_ASSESSED,
        },
        when: {
          claimed: intake.claimedDateTime || NOT_ASSESSED,
          observed: NOT_ASSESSED,
          status: NOT_ASSESSED,
        },
        what: { mutations_detected: [], details: NOT_ASSESSED },
        how: {
          lineage_notes: NOT_ASSESSED,
          estimated_generations: NOT_ASSESSED,
        },
        source: {
          earliestKnownSource: NOT_ASSESSED,
          platform: intake.sourcePlatform || NOT_ASSESSED,
        },
      },
      forensicPackage: {
        evidenceId: intake.evidenceId,
        // Genuinely measured in the browser, so genuinely shown.
        sha256: intake.fileHashSha256 || NOT_ASSESSED,
        findings: NOT_ASSESSED,
        confidenceScores: {},
        processingHistory: [],
        generatedAt: intake.uploadTimestamp,
      },
    },
  };
}

export function buildCaseState(
  intake: MediaIntakeData,
  report: AnamnesisForensicReport | null
): PersistentCaseState {
  if (!report) {
    return buildUnanalysedCaseState(intake);
  }

  const q = report.the_five_questions;
  const tech = report.technical_metrics;
  const ctx = report.context_integrity_check;

  // Convert status to standard labels
  const getStdStatus = (val: string): StandardEvidenceStatus => {
    if (val.includes('Consistent') || val.includes('Verified') || val.includes('Untampered') || val.includes('🟢')) {
      return '🟢 OBSERVED / CONSISTENT';
    }
    if (val.includes('Needs Verification') || val.includes('Tampered') || val.includes('🟠')) {
      return '🟠 NEEDS VERIFICATION';
    }
    if (val.includes('Inconsistent') || val.includes('Synthetic') || val.includes('🔴')) {
      return '🔴 INCONSISTENT';
    }
    return '🔵 ESTIMATED';
  };

  const syntheticScore = tech?.synthetic_probability_score ?? NOT_ASSESSED;
  const manipulationScore = tech?.manipulation_confidence ?? NOT_ASSESSED;

  const manipulationStatus: StandardEvidenceStatus =
    manipulationScore === NOT_ASSESSED && syntheticScore === NOT_ASSESSED
      ? STATUS_NOT_ASSESSED
      : (manipulationScore !== NOT_ASSESSED && manipulationScore > 70) ||
        (syntheticScore !== NOT_ASSESSED && syntheticScore > 70)
      ? '🔴 INCONSISTENT'
      : manipulationScore !== NOT_ASSESSED && manipulationScore > 40
      ? '🟠 NEEDS VERIFICATION'
      : '🟢 OBSERVED / CONSISTENT';

  const state: PersistentCaseState = {
    ingest: intake,
    analysis: {
      visual: {
        frameCharacteristics: `${intake.fileName} (${(intake.fileSize / 1024).toFixed(1)} KB) — Visual Frame Raster`,
        visualIndicators: [
          tech?.lighting_vector_consistency
            ? `Lighting vector consistency: ${tech.lighting_vector_consistency}`
            : `Lighting vector consistency: ${NOT_ASSESSED}`,
          tech?.chromatic_aberration_consistency
            ? `Chromatic aberration: ${tech.chromatic_aberration_consistency}`
            : `Chromatic aberration: ${NOT_ASSESSED}`,
          tech?.shadow_sun_angle_match
            ? `Shadow-sun alignment: ${tech.shadow_sun_angle_match}`
            : `Shadow-sun alignment: ${NOT_ASSESSED}`,
          q.what_changed.ela_findings ?? NOT_ASSESSED,
        ],
        chromaticAberration: tech?.chromatic_aberration_consistency ?? NOT_ASSESSED,
        lightingConsistency: tech?.lighting_vector_consistency ?? NOT_ASSESSED,
        shadowSunAngleMatch: tech?.shadow_sun_angle_match ?? NOT_ASSESSED,
        confidence: NOT_ASSESSED,
      },
      audio: {
        /* The schema returns exactly one audio field: audio_integrity_status.
         * Everything else an audio panel might want — envelope, reverb,
         * electrical network frequency, a confidence — is not measured
         * anywhere in this system, so none of it is claimed. */
        audioCharacteristics: NOT_ASSESSED,
        audioIndicators: [`Integrity status: ${ctx.audio_integrity_status}`],
        enfStatus: NOT_ASSESSED,
        acousticEnvelope: NOT_ASSESSED,
        ambientReverbConsistency: NOT_ASSESSED,
        confidence: NOT_ASSESSED,
      },
      structural: {
        // Nothing measures the container format or colour primaries.
        streamCharacteristics: NOT_ASSESSED,
        compressionGenerations: tech?.compression_generations ?? NOT_ASSESSED,
        metadataTamperFlag: tech?.metadata_tamper_flag ?? NOT_ASSESSED,
        confidence: NOT_ASSESSED,
      },
      manipulation: {
        mutationsDetected: q.what_changed.mutations_detected,
        syntheticProbabilityScore: syntheticScore,
        manipulationConfidence: manipulationScore,
        status: manipulationStatus,
      },
      /* sourceCompleteness is omitted. Establishing whether a clip is an
       * extract requires the full source, which the system never has. The
       * field is optional precisely so this can be absent rather than
       * guessed at. */
    },
    relationships: {
      /* No per-copy lineage is available. The schema returns a generation
       * estimate and free-text notes, but nothing that identifies an
       * individual related copy, so there are no nodes to show. */
      totalRelatedFound: NOT_ASSESSED,
      nodes: [],
      lineageHierarchy: [],
    },
    investigation: {
      forensicReplay: report.forensic_replay_timeline,
      originEcho: report.origin_echo ?? NOT_ASSESSED,
      contextCheck: {
        rawMediaStatus: getStdStatus(ctx.raw_media_status),
        claimedLocationStatus: getStdStatus(ctx.claimed_location_status),
        claimedTimeStatus: getStdStatus(ctx.claimed_time_status),
        audioStatus: getStdStatus(ctx.audio_integrity_status),
        cascade: {
          rawMedia: ctx.raw_media_status,
          claimedDate: `CLAIMED: ${intake.claimedDateTime || NOT_ASSESSED} ➔ OBSERVED: ${q.when.observed}`,
          claimedLocation: `CLAIMED: ${intake.claimedLocation || NOT_ASSESSED} ➔ OBSERVED: ${q.where.observed}`,
          claimedCaption: `NARRATIVE: "${intake.claimedNarrative || report.case_summary.verdict_summary}"`,
        },
        summary: report.case_summary.verdict_summary,
      },
    },
    report: {
      digitalCrimeScene: {
        who: q.who,
        where: q.where,
        when: q.when,
        what: q.what_changed,
        how: q.how_it_spread,
        source: {
          // No reverse-image search runs, so the earliest source is unknown.
          earliestKnownSource: NOT_ASSESSED,
          platform: intake.sourcePlatform || NOT_ASSESSED,
        },
      },
      forensicPackage: {
        /* The case number belongs to the investigation, not to the model.
         * Left to its own devices the model returns the example string from
         * the responseSchema description verbatim, so every live case came
         * back as the same evidence id and every exported dossier carried
         * it. The intake's id is the real one; the model's is a fallback
         * for a case that somehow has none. */
        evidenceId: intake.evidenceId || report.case_summary.evidence_id,
        sha256: report.case_summary.primary_hash_sha256,
        findings: report.case_summary.verdict_summary,
        // Per-dimension confidence is not part of the schema.
        confidenceScores: {},
        // Pure: derived from intake, not from the clock.
        processingHistory: [
          `Ingest & SHA-256 hash computed: ${intake.uploadTimestamp}`,
        ],
        generatedAt: intake.uploadTimestamp,
      },
    },
  };

  // Manipulation Type Assessment is derived from the signals assembled above
  // (transformations, synthetic probability, structure, source completeness).
  state.analysis.manipulationAssessment = deriveManipulationAssessment(state);

  return state;
}
