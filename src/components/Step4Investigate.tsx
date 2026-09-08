import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  Split,
  Sparkles,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
  History,
  Play,
  Pause,
  RotateCcw,
  Info,
} from 'lucide-react';
import { isAssessed, NOT_ASSESSED, PersistentCaseState } from '../types';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { WhyThisMatters } from './WhyThisMatters';
import { soundFx } from '../lib/soundFx';
import { getStatusBadge } from '../lib/statusStyles';
import { ForensicCopilotChat } from './ForensicCopilotChat';
import { mimeTypeFromDataUrl } from '../lib/api';

interface Step4InvestigateProps {
  caseState: PersistentCaseState;
  onComplete: () => void;
}

export const Step4Investigate: React.FC<Step4InvestigateProps> = ({
  caseState,
  onComplete,
}) => {
  const { ingest, investigation } = caseState;
  const { forensicReplay, originEcho, contextCheck } = investigation;

  const [activeSection, setActiveSection] = useState<
    'replay' | 'origin_echo' | 'context_check' | 'cross_examine'
  >('replay');
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);

  // Origin Echo staged reveal state (1. Window -> 2. Signal -> 3. Parent Candidate -> 4. Confidence)
  const [echoRevealStep, setEchoRevealStep] = useState<number>(0);

  useEffect(() => {
    if (activeSection === 'origin_echo') {
      setEchoRevealStep(0);
      soundFx.playOriginEchoScan(); // 1. Quiet scanning sound
      const timers = [
        setTimeout(() => {
          setEchoRevealStep(1);
        }, 150),
        setTimeout(() => {
          setEchoRevealStep(2);
          soundFx.playOriginEchoPulse(); // 2. Common evidence pulse
        }, 350),
        setTimeout(() => {
          setEchoRevealStep(3);
        }, 550),
        setTimeout(() => {
          setEchoRevealStep(4);
          soundFx.playOriginEchoCinematicReveal(); // 3. Deeper cinematic reveal
        }, 750),
      ];
      return () => timers.forEach(clearTimeout);
    } else if (activeSection === 'context_check') {
      // 6. Context Check: Inconsistent warning pulse
      soundFx.playWarningPulse();
    }
  }, [activeSection]);

  // Replay playback controller
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingReplay) {
      interval = setInterval(() => {
        setActiveStageIdx((prev) => {
          if (prev >= forensicReplay.length - 1) {
            setIsPlayingReplay(false);
            return prev;
          }
          soundFx.playReplayTick();
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlayingReplay, forensicReplay.length]);

  const handleManualStageSelect = (idx: number) => {
    setActiveStageIdx(idx);
    setIsPlayingReplay(false);
    soundFx.playReplayTick();
  };

  /* The replay timeline is legitimately empty on an un-analysed case, and
   * indexing it crashed the step. Same defect as Step 3's lineage nodes. */
  /** True when the model actually produced a context assessment. */
  const hasContextFinding = isAssessed(contextCheck.summary);

  const activeStage: (typeof forensicReplay)[number] | undefined =
    forensicReplay[activeStageIdx] ?? forensicReplay[0];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4 text-amber-400" />
            <span>STEP 4 — INVESTIGATE</span>
          </span>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="text-xs font-mono text-zinc-300 font-bold">
            Evolution Replay, Origin Echo &amp; Context Decoupling
          </span>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 font-mono text-xs">
          <button
            onClick={() => setActiveSection('replay')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSection === 'replay'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            A. REPLAY
          </button>
          <button
            onClick={() => setActiveSection('origin_echo')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSection === 'origin_echo'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            B. ORIGIN ECHO
          </button>
          <button
            onClick={() => setActiveSection('context_check')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSection === 'context_check'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            C. CONTEXT CHECK
          </button>
          <button
            onClick={() => setActiveSection('cross_examine')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSection === 'cross_examine'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            D. CROSS-EXAMINE
          </button>
        </div>
      </div>

      {/* KEY FINDING. Reads the context check for this case. It previously
          asserted a 2018 Indonesian tsunami for every case regardless of
          what had been ingested. */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
          hasContextFinding ? 'bg-rose-950/30 border-rose-500/50' : 'bg-zinc-950/60 border-zinc-800'
        }`}
      >
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
            KEY FINDING
          </span>
          <h3 className="text-base sm:text-lg font-black font-mono text-white">
            {isAssessed(contextCheck.summary)
              ? contextCheck.summary
              : 'No context assessment available for this case'}
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            {isAssessed(contextCheck.cascade.claimedLocation)
              ? contextCheck.cascade.claimedLocation
              : 'Claimed location and date have not been checked against the media.'}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${getStatusBadge(
              contextCheck.claimedLocationStatus
            )}`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{contextCheck.claimedLocationStatus}</span>
          </span>
        </div>
      </div>

      {/* SECTION A: FORENSIC REPLAY */}
      {activeSection === 'replay' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Controls Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 px-2 uppercase">
              Forensic Replay Progression (5 Stages)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                className="px-2.5 py-1 rounded bg-purple-950 border border-purple-700 text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors text-[10px]"
              >
                {isPlayingReplay ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>AUTO-PLAY REPLAY</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveStageIdx(0);
                  setIsPlayingReplay(false);
                }}
                className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                title="Reset Replay"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Horizontal Step Timeline Bar with Active Glow */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {forensicReplay.map((stage, idx) => {
              const isSelected = activeStageIdx === idx;
              return (
                <button
                  key={stage.stage}
                  onClick={() => handleManualStageSelect(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 text-white ring-2 ring-purple-500/60 shadow-lg shadow-purple-950/60'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-purple-400">
                      STAGE 0{stage.stage}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    )}
                  </div>
                  <div className="font-bold text-[11px] truncate text-zinc-200">
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">{stage.platform}</div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detail Card */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800">
                  STAGE 0{activeStage.stage}
                </span>
                <span>{activeStage.label}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-purple-300">
                {activeStage.platform}
              </span>
            </div>
            <p className="text-zinc-300 font-sans text-xs">
              {activeStage.description}
            </p>

            {/* Why this matters */}
            <WhyThisMatters
              explanation="Spatial crop removed situational context, altering the perceived meaning of the encounter."
            />
          </div>
        </div>
      )}

      {/* SECTION B: ORIGIN ECHO (Staged Reveal 1 -> 4) */}
      {activeSection === 'origin_echo' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-zinc-950 border border-blue-500/40 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <span className="text-blue-400 font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>ORIGIN ECHO RECONSTRUCTION</span>
              </span>
              {/* Mandatory Forensic Disclaimer */}
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 border border-blue-700 text-blue-300 flex items-center gap-1">
                <Info className="w-3 h-3 text-blue-400" />
                <span>Estimated • Based on known evidence</span>
              </span>
            </div>

            {/* Staged Reveal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              {/* 1. Estimated Creation Window */}
              <div
                className={`p-3 rounded-lg bg-[#0d0d14] border transition-all duration-300 ${
                  echoRevealStep >= 1
                    ? 'border-zinc-800 opacity-100 translate-y-0'
                    : 'border-transparent opacity-0 translate-y-1'
                }`}
              >
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">
                  1. Estimated Creation Window
                </span>
                <span className="font-bold text-white text-xs">
                  {(isAssessed(originEcho) && originEcho.earliest_known_timestamp) || NOT_ASSESSED}
                </span>
              </div>

              {/* 2. Earliest Detected Signal */}
              <div
                className={`p-3 rounded-lg bg-[#0d0d14] border transition-all duration-300 ${
                  echoRevealStep >= 2
                    ? 'border-zinc-800 opacity-100 translate-y-0'
                    : 'border-transparent opacity-0 translate-y-1'
                }`}
              >
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">
                  2. Earliest Detected Signal
                </span>
                <span className="font-bold text-cyan-300 text-xs">
                  Raw 1080p60 Uncompressed Broadcast Feed
                </span>
              </div>

              {/* 3. Parent Media Candidate */}
              <div
                className={`p-3 rounded-lg bg-[#0d0d14] border transition-all duration-300 ${
                  echoRevealStep >= 3
                    ? 'border-zinc-800 opacity-100 translate-y-0'
                    : 'border-transparent opacity-0 translate-y-1'
                }`}
              >
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">
                  3. Parent Media Candidate
                </span>
                {/* No archive lookup exists, so no parent is named. */}
                <span className="font-bold text-zinc-500 text-xs">{NOT_ASSESSED}</span>
              </div>

              {/* 4. Confidence Level */}
              <div
                className={`p-3 rounded-lg bg-[#0d0d14] border flex items-center justify-between transition-all duration-300 ${
                  echoRevealStep >= 4
                    ? 'border-zinc-800 opacity-100 translate-y-0'
                    : 'border-transparent opacity-0 translate-y-1'
                }`}
              >
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">
                    4. Origin Confidence
                  </span>
                  <span className="font-bold text-zinc-500 text-xs">
                    {NOT_ASSESSED}
                  </span>
                </div>
                {/* Nothing scores the origin reconstruction, so nothing claims to. */}
                <ConfidenceIndicator score={NOT_ASSESSED} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d0d14] border border-zinc-800 space-y-1.5">
              <span className="text-zinc-500 block text-[10px] font-bold">RECONSTRUCTED SCENE PARAMETERS:</span>
              <p className="text-zinc-300 font-sans text-xs">
                {(isAssessed(originEcho) && originEcho.unmanipulated_scene_description) || NOT_ASSESSED}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: CONTEXT CHECK (Significant Finding Mismatch Highlight) */}
      {activeSection === 'context_check' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Mismatch Alert Banner */}
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-200 text-xs flex items-center justify-between shadow-inner">
            <span className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>⚠️ CONTEXT MISMATCH DETECTED</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-600 font-bold uppercase">
              HIGH PRIORITY FINDING
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-500 block text-[10px]">MEDIA INTEGRITY</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${getStatusBadge(contextCheck.rawMediaStatus)}`}>
                {contextCheck.rawMediaStatus}
              </span>
            </div>

            {/* Claimed Location (Mismatched) */}
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-1.5 shadow-sm">
              <span className="text-rose-400 block text-[10px] font-bold">CLAIMED LOCATION (MISMATCH)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${getStatusBadge(contextCheck.claimedLocationStatus)}`}>
                {contextCheck.claimedLocationStatus}
              </span>
            </div>

            {/* Claimed Time (Mismatched) */}
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-1.5 shadow-sm">
              <span className="text-rose-400 block text-[10px] font-bold">CLAIMED TIME (MISMATCH)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${getStatusBadge(contextCheck.claimedTimeStatus)}`}>
                {contextCheck.claimedTimeStatus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-500 block text-[10px]">AUDIO INTEGRITY</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${getStatusBadge(contextCheck.audioStatus)}`}>
                {contextCheck.audioStatus}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
            <span className="text-zinc-400 block text-[10px] font-bold uppercase">Investigator Summary:</span>
            <p className="text-zinc-300 font-sans text-xs">
              {contextCheck.summary}
            </p>
          </div>

          {/* Why this matters */}
          <WhyThisMatters
            explanation="Decoupling asks a separate question from authenticity: media can be entirely genuine and still be presented with a false date, place or caption. That is why the claimed context is checked against the media rather than assumed from it."
          />
        </div>
      )}

      {/* SECTION D: CROSS-EXAMINATION */}
      {activeSection === 'cross_examine' && (
        <div className="space-y-2">
          <p className="text-[11px] text-zinc-400 font-sans">
            Each question is one request, sent only when you ask. Answers are
            assisted findings and require human verification.
          </p>
          {/* Demo Mode fixtures carry an SVG placeholder rather than real
              evidence. Sending it guarantees a rejection and tells the model
              nothing, so a reference case is cross-examined on its stored
              report alone — which keeps Demo Mode working with no network
              dependency on the media itself. */}
          <ForensicCopilotChat
            caseState={caseState}
            imageBase64={ingest.isPrecomputed ? undefined : ingest.previewUrl || undefined}
            mimeType={
              ingest.isPrecomputed || !ingest.previewUrl
                ? undefined
                : mimeTypeFromDataUrl(ingest.previewUrl)
            }
          />
        </div>
      )}

      {/* Complete Step 4 Action */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <span className="text-xs font-mono text-zinc-400">
          Decoupling findings logged into case state.
        </span>
        <button
          onClick={onComplete}
          id="btn-complete-step4"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span>COMPLETE STEP 4 →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

