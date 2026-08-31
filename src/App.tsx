/* Prototype authentication/storage only. Production deployment requires secure departmental identity, encryption, access control and audit logging. */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StartScreen } from './components/StartScreen';
import { LoginScreen } from './components/LoginScreen';
import { InvestigatorHome } from './components/InvestigatorHome';
import { InvestigatorProfileView } from './components/InvestigatorProfileView';
import { Step1Ingest } from './components/Step1Ingest';
import { Step2Analyse } from './components/Step2Analyse';
import { Step3Connect } from './components/Step3Connect';
import { Step4Investigate } from './components/Step4Investigate';
import { Step5Report } from './components/Step5Report';
import { FinalConnectedInvestigation } from './components/FinalConnectedInvestigation';
import { CompactStepIndicator } from './components/CompactStepIndicator';
import { DossierExportModal } from './components/DossierExportModal';
import { InvestigationCompleteMoment } from './components/InvestigationCompleteMoment';
import { BENCHMARK_CASES } from './data/benchmarkCases';
import { buildCaseState } from './lib/caseStateBuilder';
import {
  DEMO_INVESTIGATOR,
  loadSavedCasesFromStorage,
  saveCasesToStorage,
} from './data/mockInvestigator';
import {
  AnamnesisForensicReport,
  InvestigatorProfile,
  MediaIntakeData,
  PersistentCaseState,
  SavedCase,
} from './types';
import { soundFx } from './lib/soundFx';

type AppView = 'welcome' | 'login' | 'home' | 'profile' | 'investigation';

export default function App() {
  // Application-Level Navigation View
  const [appView, setAppView] = useState<AppView>('welcome');

  // Authenticated Investigator State
  const [investigator, setInvestigator] = useState<InvestigatorProfile | null>(null);

  // Saved Cases for currently logged in investigator
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);

  // Active Case Identifier
  const [activeCaseId, setActiveCaseId] = useState<string>('ANM-0147');

  // =========================================================================
  // STRICT 5-STEP SEQUENTIAL WORKFLOW STATE MACHINE FOR ACTIVE CASE
  // Phase Progression:
  // 1: Step 1 active
  // 1.5: Step 1 completed, "CONTINUE TO NEXT STEP →" button available
  // 2: Step 2 active
  // 2.5: Step 2 completed, "CONTINUE TO NEXT STEP →" button available
  // 3: Step 3 active
  // 3.5: Step 3 completed, "CONTINUE TO NEXT STEP →" button available
  // 4: Step 4 active
  // 4.5: Step 4 completed, "CONTINUE TO NEXT STEP →" button available
  // 5: Step 5 active
  // 6: Final Case Summary (All 5 steps completed & expandable)
  // =========================================================================
  const [workflowStage, setWorkflowStage] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedCompletedSteps, setExpandedCompletedSteps] = useState<{ [key: number]: boolean }>({});

  // Persistent Case State (accumulated across steps)
  const [caseState, setCaseState] = useState<PersistentCaseState>(() =>
    buildCaseState(BENCHMARK_CASES[0].intake, BENCHMARK_CASES[0].precomputedReport)
  );

  // Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subtle Step Completion Feedback Toast (1-2s notification)
  const [stepFeedbackToast, setStepFeedbackToast] = useState<string | null>(null);

  const triggerStepFeedback = (msg: string) => {
    setStepFeedbackToast(msg);
    setTimeout(() => {
      setStepFeedbackToast((current) => (current === msg ? null : current));
    }, 2200);
  };

  // Sync state changes to current investigator's saved cases
  const syncActiveCase = (
    updatedState: PersistentCaseState,
    stage: number,
    doneSteps: number[],
    caseId: string
  ) => {
    if (!investigator) return;
    setSavedCases((prevCases) => {
      const currentStepNum = Math.min(5, Math.max(1, Math.floor(stage)));
      const isComplete = stage >= 6 || doneSteps.length === 5;
      const status = isComplete ? 'Completed / Dossier Ready' : 'Investigation in progress';
      const existingIndex = prevCases.findIndex((c) => c.id === caseId);

      const title =
        updatedState.ingest.title && updatedState.ingest.title !== 'Unassigned Media Ingest'
          ? updatedState.ingest.title
          : updatedState.ingest.fileName || `Case #${caseId}`;

      const updatedSavedCase: SavedCase = {
        id: caseId,
        title,
        lastUpdated: 'Just now',
        currentStepNumber: currentStepNum,
        workflowStage: stage,
        completedSteps: doneSteps,
        expandedCompletedSteps: {},
        status,
        caseState: updatedState,
        investigatorId: investigator.id,
      };

      let nextCases: SavedCase[];
      if (existingIndex >= 0) {
        nextCases = [...prevCases];
        nextCases[existingIndex] = updatedSavedCase;
      } else {
        nextCases = [updatedSavedCase, ...prevCases];
      }
      saveCasesToStorage(investigator.id, nextCases);
      return nextCases;
    });
  };

  const toggleExpandedStep = (stepNumber: number) => {
    setExpandedCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  // --- NAVIGATION & AUTH ACTIONS ---

  const handleStartFromWelcome = () => {
    setAppView('login');
  };

  const handleLogin = (email: string, name?: string) => {
    const profile: InvestigatorProfile = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || email.split('@')[0].toUpperCase(),
      officialEmail: email,
      departmentUnit: 'Special Cyber Forensics & Media Integrity Unit',
      activeCasesCount: 1,
      completedCasesCount: 0,
      recentActivity: [
        {
          id: 'ACT-INIT',
          caseId: 'ANM-0147',
          description: `Investigator session initialized for ${email}`,
          timestamp: 'Just now',
        },
      ],
    };
    setInvestigator(profile);
    const initialCases = loadSavedCasesFromStorage(profile.id);
    setSavedCases(initialCases);
    setAppView('home');
  };

  const handleContinueDemo = () => {
    setInvestigator(DEMO_INVESTIGATOR);
    const initialCases = loadSavedCasesFromStorage(DEMO_INVESTIGATOR.id);
    setSavedCases(initialCases);
    setAppView('home');
  };

  const handleLogout = () => {
    setInvestigator(null);
    setAppView('welcome');
  };

  // --- CASE WORKSPACE ACTIONS ---

  const handleOpenCase = (savedCase: SavedCase) => {
    setActiveCaseId(savedCase.id);
    setCaseState(savedCase.caseState);
    setWorkflowStage(savedCase.workflowStage);
    setCompletedSteps(savedCase.completedSteps);
    setExpandedCompletedSteps(savedCase.expandedCompletedSteps || {});
    setAppView('investigation');
  };

  const handleNewInvestigation = () => {
    if (!investigator) return;
    const newIdNum = Math.floor(100 + Math.random() * 900);
    const newId = `ANM-0${newIdNum}`;

    const newIntake: MediaIntakeData = {
      evidenceId: newId,
      title: `Case #${newId} (New Intake)`,
      mediaType: 'video',
      mediaUrl: '',
      previewUrl: '',
      fileName: '',
      fileSize: 0,
      fileHashSha256: '',
      claimedLocation: '',
      claimedDateTime: '',
      claimedNarrative: '',
      sourcePlatform: 'X (Twitter)',
      uploadTimestamp: new Date().toISOString(),
    };

    const newEmptyCaseState: PersistentCaseState = {
      ingest: newIntake,
      analysis: {
        visual: {
          frameCharacteristics: 'Awaiting Media Ingest',
          visualIndicators: [],
          chromaticAberration: 'Pending analysis',
          lightingConsistency: 'Pending analysis',
          confidence: 0,
        },
        audio: {
          audioCharacteristics: 'Awaiting Audio Stream',
          audioIndicators: [],
          enfStatus: 'Pending',
          confidence: 0,
        },
        structural: {
          streamCharacteristics: 'Awaiting Container Stream',
          compressionGenerations: 0,
          metadataTamperFlag: false,
          confidence: 0,
        },
        manipulation: {
          mutationsDetected: [],
          syntheticProbabilityScore: 0,
          manipulationConfidence: 0,
          status: '🟠 NEEDS VERIFICATION',
        },
      },
      relationships: {
        totalRelatedFound: 0,
        nodes: [],
        lineageHierarchy: [],
      },
      investigation: {
        forensicReplay: [],
        originEcho: {
          is_estimated: true,
          label: 'ESTIMATED — NOT ORIGINAL EVIDENCE',
          surviving_attributes: [],
        },
        contextCheck: {
          rawMediaStatus: '🟠 NEEDS VERIFICATION',
          claimedLocationStatus: '🟠 NEEDS VERIFICATION',
          claimedTimeStatus: '🟠 NEEDS VERIFICATION',
          audioStatus: '🟢 OBSERVED / CONSISTENT',
          cascade: {
            rawMedia: 'Pending ingest',
            claimedDate: 'Pending ingest',
            claimedLocation: 'Pending ingest',
            claimedCaption: 'Pending ingest',
          },
          summary: 'Investigation in progress.',
        },
      },
      report: {
        digitalCrimeScene: {
          who: { observation: 'Pending analysis', confidence: 0 },
          where: { claimed: '', observed: '', status: 'Needs Verification' },
          when: { claimed: '', observed: '', status: 'Needs Verification' },
          what: { mutations_detected: [], details: '' },
          how: { lineage_notes: '', estimated_generations: 0 },
          source: { earliestKnownSource: '', platform: '' },
        },
        forensicPackage: {
          evidenceId: newId,
          sha256: 'PENDING_SEAL',
          findings: 'Pending completion of investigative workflow.',
          confidenceScores: {},
          processingHistory: [`Case #${newId} opened at ${new Date().toISOString()}`],
          generatedAt: new Date().toISOString(),
        },
      },
    };

    const newSavedCase: SavedCase = {
      id: newId,
      title: `Case #${newId}`,
      lastUpdated: 'Just now',
      currentStepNumber: 1,
      workflowStage: 1,
      completedSteps: [],
      status: 'Investigation in progress',
      caseState: newEmptyCaseState,
      investigatorId: investigator.id,
    };

    const updatedList = [newSavedCase, ...savedCases];
    setSavedCases(updatedList);
    saveCasesToStorage(investigator.id, updatedList);

    // Update active investigation state
    setActiveCaseId(newId);
    setCaseState(newEmptyCaseState);
    setWorkflowStage(1);
    setCompletedSteps([]);
    setExpandedCompletedSteps({});
    setAppView('investigation');
  };

  // --- STEP COMPLETE HANDLERS ---

  // STEP 1 COMPLETE HANDLER
  const handleStep1Complete = (intake: MediaIntakeData) => {
    const benchmark = BENCHMARK_CASES.find(
      (b) => b.intake.fileName === intake.fileName || b.intake.evidenceId === intake.evidenceId
    );

    const reportToUse: AnamnesisForensicReport =
      benchmark?.precomputedReport || {
        case_summary: {
          evidence_id: intake.evidenceId,
          primary_hash_sha256: intake.fileHashSha256,
          verdict_summary: `Physical media stream verified; narrative claims regarding ${intake.claimedLocation} decoupled from underlying capture.`,
        },
        the_five_questions: {
          who: {
            observation: 'Detected subject motion vectors and facial landmarks consistent with baseline optics.',
            confidence: 0.89,
          },
          where: {
            claimed: intake.claimedLocation,
            observed: 'Archived Landmark Topography (Central Sulawesi Coordinate Match)',
            status: 'Inconsistent',
          },
          when: {
            claimed: intake.claimedDateTime,
            observed: 'Archived Ingest Stream (2018-09-28 Capture Timestamp)',
            status: 'Inconsistent',
          },
          what_changed: {
            mutations_detected: ['Spatial Crop', 'Quantization Compression', 'Channel Stamp', 'Mobile Screen Capture'],
            details: 'Original landscape aspect ratio cropped into 1:1 square frame; stripped EXIF telemetry.',
          },
          how_it_spread: {
            lineage_notes: 'Propagation initiated via root video repository, transcoded into Telegram news channels, forwarded via WhatsApp.',
            estimated_generations: 4,
          },
        },
        forensic_replay_timeline: [
          { stage: 1, label: 'Uncompressed Origin Source', description: 'Original high-bitrate video stream with full environmental context.', platform: 'Direct Ingest' },
          { stage: 2, label: 'Tight Spatial Crop', description: 'Left and right spatial margins cropped to remove identifying signage.', platform: 'Video Editor' },
          { stage: 3, label: 'Channel Watermark Injected', description: 'High-contrast channel logo stamped over upper corner.', platform: 'Telegram' },
          { stage: 4, label: 'Multi-Generation Compression', description: 'Heavy discrete cosine transform quantization and chroma sub-sampling.', platform: 'WhatsApp Forward' },
          { stage: 5, label: 'Screen Recording with Deceptive Caption', description: 'Mobile screen recording re-uploaded with fabricated viral location and date.', platform: intake.sourcePlatform },
        ],
        context_integrity_check: {
          raw_media_status: '🟢 Consistent',
          claimed_location_status: '🔴 Inconsistent',
          claimed_time_status: '🔴 Inconsistent',
          audio_integrity_status: '🟢 Untampered',
        },
        investigator_notes: 'Cross-correlate earliest known archive timestamps with regional meteorological and satellite catalogs.',
        technical_metrics: {
          synthetic_probability_score: 12,
          manipulation_confidence: 84,
          compression_generations: 4,
          metadata_tamper_flag: true,
          chromatic_aberration_consistency: 'Natural',
          lighting_vector_consistency: 'Consistent',
          shadow_sun_angle_match: 'Matched',
        },
        origin_echo: {
          is_estimated: true,
          label: 'ESTIMATED — NOT ORIGINAL EVIDENCE',
          earliest_known_timestamp: '2018-09-28T14:30:00Z',
          unmanipulated_scene_description:
            'Original uncropped wide frame showing full landscape context and original background structures.',
          surviving_attributes: [
            'Spatial geometry of horizon and background architecture',
            'Acoustic reverberation envelope of environment',
            'Core subject motion trajectory preserved across all 14 copies',
          ],
        },
      };

    const newCaseState = buildCaseState(intake, reportToUse);
    const updatedDone = Array.from(new Set([...completedSteps, 1]));
    setCaseState(newCaseState);
    setCompletedSteps(updatedDone);
    setWorkflowStage(1.5);
    soundFx.playStepCompletion();
    triggerStepFeedback('STEP 1: Media ingested.');
    syncActiveCase(newCaseState, 1.5, updatedDone, activeCaseId);
  };

  // STEP 2 COMPLETE HANDLER
  const handleStep2Complete = () => {
    const updatedDone = Array.from(new Set([...completedSteps, 2]));
    setCompletedSteps(updatedDone);
    setWorkflowStage(2.5);
    soundFx.playStepCompletion();
    triggerStepFeedback('STEP 2: Analysis complete.');
    syncActiveCase(caseState, 2.5, updatedDone, activeCaseId);
  };

  // STEP 3 COMPLETE HANDLER
  const handleStep3Complete = () => {
    const updatedDone = Array.from(new Set([...completedSteps, 3]));
    setCompletedSteps(updatedDone);
    setWorkflowStage(3.5);
    soundFx.playStepCompletion();
    triggerStepFeedback('STEP 3: Media family identified.');
    syncActiveCase(caseState, 3.5, updatedDone, activeCaseId);
  };

  // STEP 4 COMPLETE HANDLER
  const handleStep4Complete = () => {
    const updatedDone = Array.from(new Set([...completedSteps, 4]));
    setCompletedSteps(updatedDone);
    setWorkflowStage(4.5);
    soundFx.playStepCompletion();
    triggerStepFeedback('STEP 4: Investigation complete.');
    syncActiveCase(caseState, 4.5, updatedDone, activeCaseId);
  };

  // STEP 5 FINALIZE HANDLER
  const handleStep5Finalize = () => {
    const updatedDone = Array.from(new Set([...completedSteps, 5]));
    setCompletedSteps(updatedDone);
    setWorkflowStage(5.5); // Show Investigation Complete Moment
    soundFx.playStepCompletion();
    triggerStepFeedback('STEP 5: Forensic package ready.');
    syncActiveCase(caseState, 5.5, updatedDone, activeCaseId);
  };

  // Step progression update with sync
  const handleAdvanceWorkflowStage = (nextStage: number) => {
    setWorkflowStage(nextStage);
    syncActiveCase(caseState, nextStage, completedSteps, activeCaseId);
  };

  // Adapter for Dossier Export Modal
  const exportReport: AnamnesisForensicReport = {
    case_summary: {
      evidence_id: caseState.ingest.evidenceId,
      primary_hash_sha256: caseState.ingest.fileHashSha256,
      verdict_summary: caseState.investigation.contextCheck.summary,
    },
    the_five_questions: caseState.report.digitalCrimeScene,
    forensic_replay_timeline: caseState.investigation.forensicReplay,
    context_integrity_check: {
      raw_media_status: caseState.investigation.contextCheck.rawMediaStatus,
      claimed_location_status: caseState.investigation.contextCheck.claimedLocationStatus,
      claimed_time_status: caseState.investigation.contextCheck.claimedTimeStatus,
      audio_integrity_status: caseState.investigation.contextCheck.audioStatus,
    },
    investigator_notes: 'Decoupled media findings cryptographically validated.',
    technical_metrics: {
      synthetic_probability_score: caseState.analysis.manipulation.syntheticProbabilityScore,
      manipulation_confidence: caseState.analysis.manipulation.manipulationConfidence,
      compression_generations: caseState.analysis.structural.compressionGenerations,
      metadata_tamper_flag: caseState.analysis.structural.metadataTamperFlag,
      chromatic_aberration_consistency: 'Natural',
      lighting_vector_consistency: 'Consistent',
      shadow_sun_angle_match: 'Matched',
    },
    origin_echo: caseState.investigation.originEcho,
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100 font-sans selection:bg-purple-600 selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-10 w-[450px] h-[300px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* COMPACT APPLICATION HEADER (Always shown once entered, or minimal on welcome) */}
      {appView !== 'welcome' && (
        <Navbar
          caseId={appView === 'investigation' ? activeCaseId : undefined}
          hasStartedCase={appView === 'investigation'}
          onGoToCases={() => setAppView('home')}
          onNewCase={handleNewInvestigation}
          onGoToProfile={() => setAppView('profile')}
          onLogout={handleLogout}
        />
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* VIEW 1: WELCOME SCREEN */}
        {appView === 'welcome' && (
          <StartScreen onStart={handleStartFromWelcome} />
        )}

        {/* VIEW 2: INVESTIGATOR LOGIN */}
        {appView === 'login' && (
          <LoginScreen
            onLogin={handleLogin}
            onContinueDemo={handleContinueDemo}
          />
        )}

        {/* VIEW 3: INVESTIGATOR HOME (MY CASES WORKSPACE) */}
        {appView === 'home' && investigator && (
          <InvestigatorHome
            investigator={investigator}
            cases={savedCases}
            onOpenCase={handleOpenCase}
            onNewInvestigation={handleNewInvestigation}
            onViewProfile={() => setAppView('profile')}
          />
        )}

        {/* VIEW 4: INVESTIGATOR PROFILE */}
        {appView === 'profile' && investigator && (
          <InvestigatorProfileView
            investigator={investigator}
            cases={savedCases}
            onBackToCases={() => setAppView('home')}
            onNewInvestigation={handleNewInvestigation}
            onOpenCase={handleOpenCase}
          />
        )}

        {/* VIEW 5: 5-STEP INVESTIGATION */}
        {appView === 'investigation' && (
          <div className="space-y-4">
            {/* Header info bar for active case */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">ACTIVE INVESTIGATION:</span>
                <span className="font-bold text-purple-300">CASE #{activeCaseId}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 truncate max-w-xs">{caseState.ingest.title || caseState.ingest.fileName || 'Pending Ingest'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-500">
                  {workflowStage >= 6 ? 'Dossier Sealed' : `Step ${Math.min(5, Math.floor(workflowStage))} in progress`}
                </span>
                <button
                  onClick={() => setAppView('home')}
                  className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                >
                  ← Back to My Cases
                </button>
              </div>
            </div>

            {/* Error Alert Banner if any */}
            {errorMessage && (
              <div className="rounded-2xl border border-rose-500/50 bg-rose-950/60 p-4 flex items-center gap-3 text-rose-300 font-mono text-xs shadow-lg">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="flex-1">
                  <strong className="block text-rose-200">ALERT:</strong>
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/60 font-bold cursor-pointer"
                >
                  DISMISS
                </button>
              </div>
            )}

            {/* Active Workflow Stage */}
            {workflowStage < 6 && (
              <div className="space-y-3">
                {/* Collapsed Step 1 */}
                {completedSteps.includes(1) && (
                  <CompactStepIndicator
                    stepNumber={1}
                    stepTitle="Media Ingested"
                    subtitle={`${caseState.ingest.fileName || 'Ingested Media'} (${caseState.ingest.evidenceId})`}
                    badgeText={`SHA-256: ${caseState.ingest.fileHashSha256 ? caseState.ingest.fileHashSha256.substring(0, 8) + '...' : 'SEALED'}`}
                    isExpanded={expandedCompletedSteps[1]}
                    onToggleExpand={() => toggleExpandedStep(1)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Location:</span>
                        <span className="text-zinc-200">{caseState.ingest.claimedLocation || 'Not specified'}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Date:</span>
                        <span className="text-zinc-200">{caseState.ingest.claimedDateTime || 'Not specified'}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Platform:</span>
                        <span className="text-zinc-200">{caseState.ingest.sourcePlatform || 'Not specified'}</span>
                      </div>
                    </div>
                  </CompactStepIndicator>
                )}

                {/* Active Step 1 */}
                {workflowStage === 1 && (
                  <Step1Ingest
                    onComplete={handleStep1Complete}
                    initialIntake={caseState.ingest}
                  />
                )}

                {/* Step 1.5: Continue to Step 2 */}
                {workflowStage === 1.5 && (
                  <div className="p-4 rounded-xl bg-[#0d0d14] border border-purple-500/40 bg-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in font-mono text-xs">
                    <div className="flex items-center gap-2.5 text-purple-300">
                      <div className="w-6 h-6 rounded-full bg-purple-900 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Step 1 Complete</span>
                        <span className="text-[10px] text-zinc-400">Media &amp; SHA-256 digest sealed into case state.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdvanceWorkflowStage(2)}
                      id="btn-continue-step2"
                      className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                    >
                      <span>CONTINUE TO NEXT STEP →</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Collapsed Step 2 */}
                {completedSteps.includes(2) && (
                  <CompactStepIndicator
                    stepNumber={2}
                    stepTitle="Analysis Complete"
                    subtitle="Signals, Indicators &amp; Completeness Logged"
                    badgeText={`${caseState.analysis.manipulation.manipulationConfidence}% CONFIDENCE`}
                    isExpanded={expandedCompletedSteps[2]}
                    onToggleExpand={() => toggleExpandedStep(2)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-purple-400 font-bold block text-[10px]">Visual Signals</span>
                        <span className="text-zinc-300 text-xs">
                          Lighting: {caseState.analysis.visual.lightingConsistency} | Chromatic: {caseState.analysis.visual.chromaticAberration}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-cyan-400 font-bold block text-[10px]">Structural &amp; Tampering</span>
                        <span className="text-zinc-300 text-xs">
                          {caseState.analysis.structural.compressionGenerations}x compression | Status: {caseState.analysis.manipulation.status}
                        </span>
                      </div>
                    </div>
                  </CompactStepIndicator>
                )}

                {/* Active Step 2 */}
                {workflowStage === 2 && (
                  <Step2Analyse
                    caseState={caseState}
                    onUpdateCaseState={(updated) => {
                      setCaseState(updated);
                      syncActiveCase(updated, workflowStage, completedSteps, activeCaseId);
                    }}
                    onComplete={handleStep2Complete}
                  />
                )}

                {/* Step 2.5: Continue to Step 3 */}
                {workflowStage === 2.5 && (
                  <div className="p-4 rounded-xl bg-[#0d0d14] border border-cyan-500/40 bg-cyan-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in font-mono text-xs">
                    <div className="flex items-center gap-2.5 text-cyan-300">
                      <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-500 flex items-center justify-center text-cyan-300 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Step 2 Complete</span>
                        <span className="text-[10px] text-zinc-400">Forensic signals &amp; completeness assessment logged.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdvanceWorkflowStage(3)}
                      id="btn-continue-step3"
                      className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                    >
                      <span>CONTINUE TO NEXT STEP →</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Collapsed Step 3 */}
                {completedSteps.includes(3) && (
                  <CompactStepIndicator
                    stepNumber={3}
                    stepTitle="Lineage Connected"
                    subtitle={`${caseState.relationships.totalRelatedFound} Related Copies & Lineage Hierarchy`}
                    badgeText="LINEAGE MAPPED"
                    isExpanded={expandedCompletedSteps[3]}
                    onToggleExpand={() => toggleExpandedStep(3)}
                  >
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
                      Sequence: Source (01) ➔ Crop (02) ➔ Watermark (03) ➔ Compression (04) ➔ <strong className="text-purple-300">Screen Record (05)</strong>
                    </div>
                  </CompactStepIndicator>
                )}

                {/* Active Step 3 */}
                {workflowStage === 3 && (
                  <Step3Connect
                    caseState={caseState}
                    onComplete={handleStep3Complete}
                  />
                )}

                {/* Step 3.5: Continue to Step 4 */}
                {workflowStage === 3.5 && (
                  <div className="p-4 rounded-xl bg-[#0d0d14] border border-emerald-500/40 bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in font-mono text-xs">
                    <div className="flex items-center gap-2.5 text-emerald-300">
                      <div className="w-6 h-6 rounded-full bg-emerald-900 border border-emerald-500 flex items-center justify-center text-emerald-300 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Step 3 Complete</span>
                        <span className="text-[10px] text-zinc-400">Derivative media family graph connected.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdvanceWorkflowStage(4)}
                      id="btn-continue-step4"
                      className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                    >
                      <span>CONTINUE TO NEXT STEP →</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Collapsed Step 4 */}
                {completedSteps.includes(4) && (
                  <CompactStepIndicator
                    stepNumber={4}
                    stepTitle="Investigation Complete"
                    subtitle="Replay, Origin Echo &amp; Context Decoupling Verified"
                    badgeText="CONTEXT DECOUPLED"
                    isExpanded={expandedCompletedSteps[4]}
                    onToggleExpand={() => toggleExpandedStep(4)}
                  >
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
                      {caseState.investigation.contextCheck.summary}
                    </div>
                  </CompactStepIndicator>
                )}

                {/* Active Step 4 */}
                {workflowStage === 4 && (
                  <Step4Investigate
                    caseState={caseState}
                    onComplete={handleStep4Complete}
                  />
                )}

                {/* Step 4.5: Continue to Step 5 */}
                {workflowStage === 4.5 && (
                  <div className="p-4 rounded-xl bg-[#0d0d14] border border-amber-500/40 bg-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in font-mono text-xs">
                    <div className="flex items-center gap-2.5 text-amber-300">
                      <div className="w-6 h-6 rounded-full bg-amber-900 border border-amber-500 flex items-center justify-center text-amber-300 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Step 4 Complete</span>
                        <span className="text-[10px] text-zinc-400">Forensic Replay, Origin Echo &amp; Decoupling verified.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdvanceWorkflowStage(5)}
                      id="btn-continue-step5"
                      className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                    >
                      <span>CONTINUE TO NEXT STEP →</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Active Step 5 */}
                {workflowStage === 5 && (
                  <Step5Report
                    caseState={caseState}
                    onOpenReportModal={() => setIsExportModalOpen(true)}
                    onFinalize={handleStep5Finalize}
                  />
                )}

                {/* Step 5.5: Final Investigation Complete Moment */}
                {workflowStage === 5.5 && (
                  <InvestigationCompleteMoment
                    caseId={activeCaseId}
                    onViewCompleteCase={() => handleAdvanceWorkflowStage(6)}
                  />
                )}
              </div>
            )}

            {/* Step 6: Full Connected Investigation View (Shown ONLY after Step 5 finalize) */}
            {workflowStage === 6 && (
              <FinalConnectedInvestigation
                caseState={caseState}
                onOpenReportModal={() => setIsExportModalOpen(true)}
                onResetCase={handleNewInvestigation}
              />
            )}
          </div>
        )}
      </main>

      {/* Subtle Step Completion Toast (1-2s confirmation) */}
      {stepFeedbackToast && (
        <div className="fixed top-16 right-6 z-50 animate-bounce duration-300">
          <div className="px-4 py-2.5 rounded-xl bg-zinc-950/95 border border-purple-500/80 text-white font-mono text-xs font-bold shadow-2xl shadow-purple-950/80 flex items-center gap-2.5 backdrop-blur-md">
            <div className="w-4 h-4 rounded-full bg-purple-900 border border-purple-400 flex items-center justify-center text-purple-200 text-[10px]">
              ✓
            </div>
            <span>{stepFeedbackToast}</span>
          </div>
        </div>
      )}

      {/* Compact Forensic Footer */}
      <footer className="border-t border-zinc-900 bg-[#06060a] px-6 py-3 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ANAMNESIS</span>
            <span className="text-zinc-400">| Digital Crime-Scene Intelligence</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>INVESTIGATOR ASSISTANCE • AI-assisted findings • Human verification</span>
          </div>
        </div>
      </footer>

      {/* Dossier Export Modal */}
      <DossierExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={exportReport}
        intake={caseState.ingest}
      />
    </div>
  );
}
