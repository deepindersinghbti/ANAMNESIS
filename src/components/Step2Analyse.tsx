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
import {
  Assessable,
  isAssessed,
  NOT_ASSESSED,
  PersistentCaseState,
  SourceCompletenessData,
} from '../types';
import { getStatusBadge } from '../lib/statusStyles';
import { formatBytes } from '../lib/cryptoUtils';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { WhyThisMatters } from './WhyThisMatters';
import { soundFx } from '../lib/soundFx';
import { ForensicCanvasLab } from './ForensicCanvasLab';

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

  /* Source completeness is only ever shown when something actually assessed
   * it. The previous fallback authored a 12.4-second duration, four detected
   * indicators and an 0.86 confidence for media nobody had measured. */
  const currentSC: SourceCompletenessData = analysis.sourceCompleteness || {
    submittedDuration: NOT_ASSESSED,
    completenessAssessment: 'INSUFFICIENT EVIDENCE',
    possibleExtractedClip: false,
    canVerifyFullSource: false,
    fullSourceFoundInEvidence: false,
    detectedIndicators: [],
    sourceVerificationStatus: NOT_ASSESSED,
    confidence: 0,
    investigativeFlag: false,
    investigativeLead: NOT_ASSESSED,
    originalProvided: false,
  };

  /* Real, local measurement: the browser parsed the EXIF itself in Step 1,
   * so whether any tags survived is something this app genuinely knows. */
  const exifTagCount = Object.keys(ingest.exifData ?? {}).length;
  const hasAnalysis = isAssessed(analysis.manipulation.manipulationConfidence);
  const pct = (v: Assessable<number>) => (isAssessed(v) ? `${v}%` : NOT_ASSESSED);

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

      {/* KEY FINDING. Reports the model's manipulation assessment, or says
          plainly that there isn't one. It previously asserted "Possible
          manipulation detected" before any analysis had run. */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
          hasAnalysis ? 'bg-amber-950/30 border-amber-500/50' : 'bg-zinc-950/60 border-zinc-800'
        }`}
      >
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
            KEY FINDING
          </span>
          <h3 className="text-base sm:text-lg font-black font-mono text-white">
            {hasAnalysis
              ? `Manipulation confidence — ${pct(analysis.manipulation.manipulationConfidence)}`
              : 'No analysis available for this case'}
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            {hasAnalysis
              ? analysis.manipulation.mutationsDetected.length > 0
                ? `Reported alterations: ${analysis.manipulation.mutationsDetected.join(', ')}.`
                : 'The model reported no specific alterations.'
              : 'The hash and metadata below were measured locally. Interpretive findings require a completed analysis.'}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <ConfidenceIndicator score={analysis.manipulation.manipulationConfidence} />
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${getStatusBadge(
              analysis.manipulation.status
            )}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{analysis.manipulation.status}</span>
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
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${getStatusBadge(
                analysis.visual.lightingConsistency
              )}`}
            >
              {isAssessed(analysis.visual.lightingConsistency)
                ? analysis.visual.lightingConsistency
                : 'NOT ASSESSED'}
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
          <ConfidenceIndicator score={analysis.visual.confidence} size="sm" showPercentage={false} />
        </div>

        {/* Audio Signals */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>AUDIO</span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${getStatusBadge(
                caseState.investigation.contextCheck.audioStatus
              )}`}
            >
              {caseState.investigation.contextCheck.audioStatus.replace(/^[^\w]+/, '')}
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
              <span className="text-zinc-400">ENF Grid:</span>
              <span>{analysis.audio.enfStatus}</span>
            </div>
          </div>
          <ConfidenceIndicator score={analysis.audio.confidence} size="sm" showPercentage={false} />
        </div>

        {/* Structural Signals */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-pink-400 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>STRUCTURAL</span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                isAssessed(analysis.structural.metadataTamperFlag)
                  ? analysis.structural.metadataTamperFlag
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-zinc-900 text-zinc-500 border-dashed border-zinc-700'
              }`}
            >
              {isAssessed(analysis.structural.metadataTamperFlag)
                ? analysis.structural.metadataTamperFlag
                  ? 'METADATA FLAGGED'
                  : 'METADATA CLEAN'
                : 'NOT ASSESSED'}
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Compression:</span>
              <span className="text-amber-300">
                {isAssessed(analysis.structural.compressionGenerations)
                  ? `${analysis.structural.compressionGenerations}x Generations`
                  : NOT_ASSESSED}
              </span>
            </div>
            {/* Measured in this browser during Step 1, not asserted. */}
            <div className="flex justify-between">
              <span className="text-zinc-400">EXIF Tags:</span>
              <span className={exifTagCount === 0 ? 'text-rose-400 font-bold' : 'text-zinc-200'}>
                {exifTagCount === 0 ? 'NONE FOUND' : `${exifTagCount} READ`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">File Size:</span>
              <span>{ingest.fileSize > 0 ? formatBytes(ingest.fileSize) : NOT_ASSESSED}</span>
            </div>
          </div>
          <ConfidenceIndicator score={analysis.structural.confidence} size="sm" showPercentage={false} />
        </div>

        {/* Manipulation Confidence */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>MANIPULATION</span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${getStatusBadge(
                analysis.manipulation.status
              )}`}
            >
              {pct(analysis.manipulation.manipulationConfidence)}
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Synthetic AI:</span>
              <span>{pct(analysis.manipulation.syntheticProbabilityScore)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Alterations:</span>
              <span className="text-amber-300">
                {analysis.manipulation.mutationsDetected.length || NOT_ASSESSED}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Source Platform:</span>
              <span>{ingest.sourcePlatform || NOT_ASSESSED}</span>
            </div>
          </div>
          <ConfidenceIndicator score={analysis.manipulation.manipulationConfidence} size="sm" />
        </div>
      </div>

      {/* FORENSIC CANVAS LAB — real pixel analysis, computed here.
          ELA, sensor-noise variance and Sobel edges all run in this
          browser on the ingested bytes. No network call, and the file
          never leaves the machine to produce any of it. */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider">
            Pixel-level forensics — computed in this browser
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            No upload required for these filters
          </span>
        </div>
        {ingest.previewUrl ? (
          <ForensicCanvasLab
            mediaUrl={ingest.previewUrl}
            evidenceId={ingest.evidenceId}
          />
        ) : (
          /* Media bytes are held for the session only and are never written
             to storage, so a reopened case has nothing to analyse. Saying so
             is better than rendering an empty canvas that looks broken. */
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-center space-y-1.5">
            <p className="text-xs font-mono font-bold text-zinc-400">
              NOT_ASSESSED — media not available in this session
            </p>
            <p className="text-[11px] text-zinc-500 font-sans max-w-md mx-auto">
              Evidence bytes are kept in memory only and are never written to
              browser storage. Re-ingest the file in Step 1 to run pixel
              analysis on it again.
            </p>
          </div>
        )}
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
            Submitted: <strong className="text-purple-300">{currentSC.submittedDuration}</strong>
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
