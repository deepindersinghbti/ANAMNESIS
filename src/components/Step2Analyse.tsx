import React, { useState, useEffect } from 'react';
import {
  Eye,
  Volume2,
  Cpu,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Clock,
  Scissors,
  UploadCloud,
  Check,
  XCircle,
  Info,
  Layers,
  Film,
  Sparkles,
} from 'lucide-react';
import { PersistentCaseState, SourceCompletenessData } from '../types';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { WhyThisMatters } from './WhyThisMatters';
import { soundFx } from '../lib/soundFx';

interface Step2AnalyseProps {
  caseState: PersistentCaseState;
  onUpdateCaseState?: (updated: PersistentCaseState) => void;
  onComplete: () => void;
}

export const Step2Analyse: React.FC<Step2AnalyseProps> = ({
  caseState,
  onUpdateCaseState,
  onComplete,
}) => {
  const { ingest, analysis } = caseState;

  // Source completeness state
  const currentSC: SourceCompletenessData = analysis.sourceCompleteness || {
    submittedDuration: '12.4 sec',
    completenessAssessment: 'POSSIBLE EXTRACTED CLIP',
    possibleExtractedClip: true,
    canVerifyFullSource: false,
    fullSourceFoundInEvidence: false,
    detectedIndicators: [
      'Abrupt opening (movement already in progress at 00:00.0)',
      'Possible audio cut boundary at head of clip',
      'Speech cut off unnaturally at 00:12.4 tail',
      'Incomplete scene continuity',
    ],
    sourceVerificationStatus: 'Full source not available in current evidence',
    confidence: 0.86,
    investigativeFlag: false,
    investigativeLead:
      'The submitted media may be incomplete. The full source could not be verified from the available evidence.',
    originalProvided: false,
  };

  const [isFlagged, setIsFlagged] = useState<boolean>(currentSC.investigativeFlag || false);
  const [originalProvided, setOriginalProvided] = useState<boolean>(currentSC.originalProvided || false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    currentSC.originalProvided ? 'master_camera_raw_0100.mp4' : null
  );

  // Play subtle warning tone on mount for possible extracted clip
  useEffect(() => {
    if (currentSC.possibleExtractedClip) {
      soundFx.playSourceCompletenessWarning();
    }
  }, []);

  const handleToggleFlag = () => {
    const newFlagStatus = !isFlagged;
    setIsFlagged(newFlagStatus);

    if (newFlagStatus) {
      soundFx.playInvestigativeLeadConfirm();
    }

    if (onUpdateCaseState) {
      const updatedSC: SourceCompletenessData = {
        ...currentSC,
        investigativeFlag: newFlagStatus,
        originalProvided,
      };
      onUpdateCaseState({
        ...caseState,
        analysis: {
          ...caseState.analysis,
          sourceCompleteness: updatedSC,
        },
      });
    }
  };

  const handleProvideOriginal = (fileName: string = 'master_camera_raw_0100.mp4') => {
    setOriginalProvided(true);
    setUploadedFileName(fileName);

    if (onUpdateCaseState) {
      const updatedSC: SourceCompletenessData = {
        ...currentSC,
        originalProvided: true,
        comparison: {
          originalDuration: '01:00.0',
          submittedClipTiming: '00:17.2 – 00:29.6',
          extractedSegment: '00:17.2 – 00:29.6',
          omittedPortions: ['00:00.0 – 00:17.2 (Prior Context)', '00:29.6 – 01:00.0 (Subsequent Context)'],
          matchStatus: '🟢 SOURCE MATCH — CONFIRMED',
        },
      };
      onUpdateCaseState({
        ...caseState,
        analysis: {
          ...caseState.analysis,
          sourceCompleteness: updatedSC,
        },
      });
    }
  };

  const handleRemoveOriginal = () => {
    setOriginalProvided(false);
    setUploadedFileName(null);

    if (onUpdateCaseState) {
      const updatedSC: SourceCompletenessData = {
        ...currentSC,
        originalProvided: false,
        comparison: undefined,
      };
      onUpdateCaseState({
        ...caseState,
        analysis: {
          ...caseState.analysis,
          sourceCompleteness: updatedSC,
        },
      });
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>STEP 2 — ANALYSE</span>
          </span>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="text-xs font-mono text-zinc-300 font-bold">
            Evidence Signal Analysis &amp; Completeness
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          Target: <strong className="text-white">{ingest.fileName}</strong>
        </span>
      </div>

      {/* 3-SECOND KEY FINDING BANNER */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
            KEY FINDING
          </span>
          <h3 className="text-base sm:text-lg font-black font-mono text-white">
            Possible manipulation detected — {analysis.manipulation.manipulationConfidence}% confidence
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            Abrupt boundary indicators suggest <span className="text-amber-300 font-bold">Possible extracted clip</span> ({currentSC.submittedDuration || '12.4s'}). Full master source unverified.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <ConfidenceIndicator score={analysis.manipulation.manipulationConfidence} />
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-950 border border-amber-600 text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>🟠 {analysis.manipulation.status}</span>
          </span>
        </div>
      </div>

      {/* 4 CORE EVIDENCE SIGNAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        {/* Visual Signals */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-purple-400 font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>VISUAL</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              NATURAL
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Lighting:</span>
              <span>{analysis.visual.lightingConsistency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Chromatic:</span>
              <span>{analysis.visual.chromaticAberration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Shadow Vector:</span>
              <span>{analysis.visual.shadowSunAngleMatch}</span>
            </div>
          </div>
          <ConfidenceIndicator score={88} size="sm" showPercentage={false} />
        </div>

        {/* Audio Signals */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>AUDIO</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              UNTAMPERED
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Acoustics:</span>
              <span>{analysis.audio.acousticEnvelope}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Background:</span>
              <span>{analysis.audio.ambientReverbConsistency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Cut Marks:</span>
              <span className="text-amber-300">Head / Tail Cut</span>
            </div>
          </div>
          <ConfidenceIndicator score={92} size="sm" showPercentage={false} />
        </div>

        {/* Structural Signals */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-pink-400 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>STRUCTURAL</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
              MODIFIED
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Compression:</span>
              <span className="text-amber-300">{analysis.structural.compressionGenerations}x Generations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">EXIF Stripped:</span>
              <span className="text-rose-400 font-bold">YES</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Aspect Ratio:</span>
              <span>1:1 Square Crop</span>
            </div>
          </div>
          <ConfidenceIndicator score={84} size="sm" showPercentage={false} />
        </div>

        {/* Manipulation Confidence */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>MANIPULATION</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              {analysis.manipulation.manipulationConfidence}%
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Synthetic AI:</span>
              <span>{analysis.manipulation.syntheticProbabilityScore}% (Low)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Dissemination:</span>
              <span className="text-amber-300">Viral Transcode</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Tamper Score:</span>
              <span className="text-rose-400 font-bold">High (Context Crop)</span>
            </div>
          </div>
          <ConfidenceIndicator score={analysis.manipulation.manipulationConfidence} size="sm" />
        </div>
      </div>

      {/* SOURCE COMPLETENESS CHECK & MISSING CONTEXT DETECTOR */}
      <div className="rounded-xl border border-purple-500/40 bg-[#0a0a12] p-4 space-y-4 shadow-md font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white uppercase">
              SOURCE COMPLETENESS CHECK
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 border border-purple-800 text-purple-300">
              Missing Context Detector
            </span>
          </div>
          <div className="text-zinc-400 text-[11px]">
            Submitted: <strong className="text-purple-300">{currentSC.submittedDuration || '12.4 sec'}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Result Matrix */}
          <div className="lg:col-span-6 p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Full source verified in evidence:</span>
              <span className="font-bold text-rose-400">🔴 NO</span>
            </div>
            <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/40">
              <span className="text-amber-300 font-bold">Possible extracted clip:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <span>🟠 YES</span>
              </span>
            </div>
            <div className="pt-1 text-[11px] text-zinc-400">
              <span className="text-zinc-500 block text-[10px] font-bold">DETECTED INDICATORS:</span>
              <span className="text-zinc-200">Abrupt opening • possible audio cut • incomplete scene continuity</span>
            </div>
          </div>

          {/* Finding & Flag Button */}
          <div className="lg:col-span-6 space-y-2.5">
            {/* Highlighted Result Box with Investigative Lead */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/60 text-[11px] space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>POSSIBLE EXTRACTED CLIP</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-600 text-amber-300 uppercase tracking-wider">
                  INVESTIGATIVE LEAD
                </span>
              </div>
              <p className="text-zinc-200 font-sans text-xs">
                Full source not available in current evidence.
              </p>
            </div>

            {/* Why this matters expandable note */}
            <WhyThisMatters
              explanation="Abrupt opening and audio discontinuity indicate that the submitted media is only a segment of a longer recording."
            />

            <button
              onClick={handleToggleFlag}
              id="btn-flag-investigation"
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isFlagged
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isFlagged ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>✓ FLAGGED FOR FURTHER INVESTIGATION</span>
                </>
              ) : (
                <span>FLAG FOR FURTHER INVESTIGATION →</span>
              )}
            </button>
          </div>
        </div>

        {/* Forensic Limitation */}
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Forensic Limitation: Anamnesis cannot determine the contents of media that is not available as evidence.</span>
        </div>

        {/* Compare with Original Section */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-400">
            Compare with Original Source (when second file is available):
          </span>
          {!originalProvided ? (
            <button
              onClick={() => handleProvideOriginal('master_camera_raw_0100.mp4')}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-purple-300 text-[11px] font-bold cursor-pointer flex items-center gap-1 shrink-0"
            >
              <UploadCloud className="w-3 h-3" />
              <span>Provide Master Recording (01:00.0)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-[11px]">🟢 Matched: 00:17.2 – 00:29.6</span>
              <button
                onClick={handleRemoveOriginal}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] cursor-pointer"
              >
                Detach
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Complete Step 2 Action */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <span className="text-xs font-mono text-zinc-400">
          Signals &amp; completeness recorded for <strong className="text-zinc-200">{ingest.fileName}</strong>.
        </span>
        <button
          onClick={onComplete}
          id="btn-complete-step2"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span>COMPLETE STEP 2 →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
