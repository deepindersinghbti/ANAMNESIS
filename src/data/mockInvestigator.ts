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
  // Customize Case 1 as ANM-0147 at Step 3 (In progress)
  case1State.ingest.evidenceId = 'ANM-0147';
  case1State.report.forensicPackage.evidenceId = 'ANM-0147';

  const case2State = buildCaseState(
    BENCHMARK_CASES[1].intake,
    BENCHMARK_CASES[1].precomputedReport
  );
  // Customize Case 2 as ANM-0142 at Step 5 (In progress)
  case2State.ingest.evidenceId = 'ANM-0142';
  case2State.report.forensicPackage.evidenceId = 'ANM-0142';

  const case3State = buildCaseState(
    BENCHMARK_CASES[2].intake,
    BENCHMARK_CASES[2].precomputedReport
  );
  // Customize Case 3 as ANM-0138 (Completed)
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

export function saveCasesToStorage(investigatorId: string, cases: SavedCase[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${investigatorId}`, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases to localStorage:', err);
  }
}
