/* Prototype authentication/storage only. Production deployment requires secure departmental identity, encryption, access control and audit logging. */

import { InvestigatorProfile, SavedCase } from '../types';
import { BENCHMARK_CASES } from './benchmarkCases';
import { buildCaseState } from '../lib/caseStateBuilder';

export const DEMO_INVESTIGATOR: InvestigatorProfile = {
  id: 'INV-7409-ELENA',
  name: 'Lead Inv. Elena Rostova',
  officialEmail: 'e.rostova@cyberforensics.gov.int',
  departmentUnit: 'Special Cyber Forensics & Media Integrity Unit (SCMIU)',
  activeCasesCount: 2,
  completedCasesCount: 1,
  recentActivity: [
    {
      id: 'ACT-001',
      caseId: 'ANM-0147',
      description: 'Case #ANM-0147 — Step 3 completed (Lineage family mapped)',
      timestamp: '12 mins ago',
    },
    {
      id: 'ACT-002',
      caseId: 'ANM-0142',
      description: 'Case #ANM-0142 — Context Decoupling verified',
      timestamp: '2 hours ago',
    },
    {
      id: 'ACT-003',
      caseId: 'ANM-0138',
      description: 'Case #ANM-0138 — Forensic dossier finalized & sealed',
      timestamp: 'Yesterday',
    },
  ],
};

export function getDefaultDemoCases(investigatorId: string = DEMO_INVESTIGATOR.id): SavedCase[] {
  const case1State = buildCaseState(
    BENCHMARK_CASES[0].intake,
    BENCHMARK_CASES[0].precomputedReport
  );
  /* These three are stored fixtures, not investigations anyone ran. The flag
   * is what makes the PRECOMPUTED REFERENCE CASE badge appear, and without it
   * a visitor opening My Cases sees three complete forensic reports that look
   * like live results. */
  // Customize Case 1 as ANM-0147 at Step 3 (In progress)
  case1State.ingest.isPrecomputed = true;
  case1State.ingest.evidenceId = 'ANM-0147';
  case1State.report.forensicPackage.evidenceId = 'ANM-0147';

  const case2State = buildCaseState(
    BENCHMARK_CASES[1].intake,
    BENCHMARK_CASES[1].precomputedReport
  );
  // Customize Case 2 as ANM-0142 at Step 5 (In progress)
  case2State.ingest.isPrecomputed = true;
  case2State.ingest.evidenceId = 'ANM-0142';
  case2State.report.forensicPackage.evidenceId = 'ANM-0142';

  const case3State = buildCaseState(
    BENCHMARK_CASES[2].intake,
    BENCHMARK_CASES[2].precomputedReport
  );
  // Customize Case 3 as ANM-0138 (Completed)
  case3State.ingest.isPrecomputed = true;
  case3State.ingest.evidenceId = 'ANM-0138';
  case3State.report.forensicPackage.evidenceId = 'ANM-0138';

  return [
    {
      id: 'ANM-0147',
      title: 'Possible manipulated media (Viral Coastal Tsunami Clip)',
      lastUpdated: '12 mins ago',
      currentStepNumber: 3,
      workflowStage: 3.5, // Completed step 3, ready to continue to Step 4
      completedSteps: [1, 2, 3],
      expandedCompletedSteps: {},
      status: 'Investigation in progress',
      caseState: case1State,
      investigatorId,
    },
    {
      id: 'ANM-0142',
      title: 'Synthesized Diplomatic Speech Video (Deepfake Signature)',
      lastUpdated: '2 hours ago',
      currentStepNumber: 4,
      workflowStage: 4.5, // Completed step 4, ready for Step 5
      completedSteps: [1, 2, 3, 4],
      expandedCompletedSteps: {},
      status: 'Investigation in progress',
      caseState: case2State,
      investigatorId,
    },
    {
      id: 'ANM-0138',
      title: 'Manipulated Rally Banner & Spliced Broadcast',
      lastUpdated: 'Yesterday',
      currentStepNumber: 5,
      workflowStage: 6, // Fully completed
      completedSteps: [1, 2, 3, 4, 5],
      expandedCompletedSteps: {},
      status: 'Completed / Dossier Ready',
      caseState: case3State,
      investigatorId,
    },
  ];
}

const STORAGE_KEY_PREFIX = 'anamnesis_investigator_cases_';

export function loadSavedCasesFromStorage(investigatorId: string): SavedCase[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${investigatorId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load cases from localStorage:', err);
  }
  return getDefaultDemoCases(investigatorId);
}

/* G18: media bytes are never persisted.
 *
 * previewUrl and mediaUrl hold full base64 data URLs. Writing them into
 * localStorage blows the ~5 MB quota on the first real photograph, and the
 * failure used to be swallowed by a console.error — the investigator's case
 * simply vanished on reload with no indication why. The bytes live in memory
 * for the session; everything else round-trips.
 */
function toPersistable(saved: SavedCase): SavedCase {
  return {
    ...saved,
    caseState: {
      ...saved.caseState,
      ingest: {
        ...saved.caseState.ingest,
        mediaUrl: '',
        previewUrl: '',
      },
    },
  };
}

/**
 * Persist the investigator's cases.
 *
 * Returns null on success, or a human-readable reason on failure. The caller
 * must surface that reason: silent persistence loss during a demonstration is
 * worse than an honest warning.
 */
export function saveCasesToStorage(
  investigatorId: string,
  cases: SavedCase[]
): string | null {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${investigatorId}`,
      JSON.stringify(cases.map(toPersistable))
    );
    return null;
  } catch (err) {
    console.error('Failed to save cases to localStorage:', err);
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return isQuota
      ? 'Browser storage is full, so this case was not saved. Export the dossier before navigating away.'
      : 'This case could not be saved to browser storage. Export the dossier before navigating away.';
  }
}
