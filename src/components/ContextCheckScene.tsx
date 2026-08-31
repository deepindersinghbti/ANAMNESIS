import React from 'react';
import {
  Split,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowDown,
  Quote,
  ShieldCheck,
  FileSearch,
} from 'lucide-react';
import { ContextIntegrityCheck, CaseSummary, MediaIntakeData } from '../types';

interface ContextCheckSceneProps {
  check: ContextIntegrityCheck;
  summary: CaseSummary;
  intake: MediaIntakeData;
  onNext: () => void;
}

export const ContextCheckScene: React.FC<ContextCheckSceneProps> = ({
  check,
  summary,
  intake,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5" />
            <span>3:40–4:10 // SCENE 8: THE STORY BEHIND THE STORY</span>
          </span>
          <span className="text-xs font-mono text-amber-400 font-bold">Context Decoupling</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "Sometimes the video itself isn't fake. The lie is the story around it."
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Anamnesis helps investigators separate the physical media from the deceptive narrative claim attached to it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Decoupling Flow Ladder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-purple-400" />
              <span>Decoupling Cascade</span>
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 block font-bold">1. RAW MEDIA STREAM</span>
                  <span className="font-bold text-white">REAL VIDEO CAPTURE</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="flex justify-center my-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-400 block font-bold">2. TEMPORAL METRIC</span>
                  <span className="font-bold text-white">WRONG / RECYCLED DATE</span>
                </div>
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>

              <div className="flex justify-center my-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 block font-bold">3. GEOGRAPHIC METRIC</span>
                  <span className="font-bold text-white">WRONG CLAIMED LOCATION</span>
                </div>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>

              <div className="flex justify-center my-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-purple-400 block font-bold">4. SOCIAL VECTOR</span>
                  <span className="font-bold text-white">MISLEADING VIRAL CAPTION</span>
                </div>
                <Quote className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Context Verification Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            {/* Attached Claimed Caption Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                <Quote className="w-3 h-3 text-purple-400" />
                <span>Viral Headline / Claimed Narrative:</span>
              </span>
              <p className="text-white font-sans text-sm italic font-medium">
                "{intake.claimedNarrative || 'Breaking: Clashes and disruption reported yesterday.'}"
              </p>
            </div>

            {/* Matrix Vector Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 block font-bold">MEDIA AUTHENTICITY</span>
                <span className="text-white font-bold text-sm block">
                  {check.raw_media_status || '🟢 Appears Consistent'}
                </span>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Photons match natural camera sensor noise distribution.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 block font-bold">CLAIMED LOCATION</span>
                <span className="text-amber-400 font-bold text-sm block">
                  {check.claimed_location_status || '🟠 Needs Verification'}
                </span>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Road architecture does not match target region.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 block font-bold">CLAIMED TIME</span>
                <span className="text-rose-400 font-bold text-sm block">
                  {check.claimed_time_status || '🔴 Inconsistent'}
                </span>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Solar angle and shadows verify footage is from 2021.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 block font-bold">AUDIO INTEGRITY</span>
                <span className="text-amber-400 font-bold text-sm block">
                  {check.audio_integrity_status || '🟠 Possible Manipulation'}
                </span>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Background siren track overlaid from external archive.
                </p>
              </div>
            </div>

            {/* Next Chapter CTA */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-400">
                Next: 4:10–4:40 The Digital Crime Scene (Unified View)
              </span>
              <button
                onClick={onNext}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Step 9: Digital Crime Scene</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
