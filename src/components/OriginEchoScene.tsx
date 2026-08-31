import React, { useState } from 'react';
import {
  Ghost,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  HelpCircle,
  Eye,
  Camera,
  Scale,
} from 'lucide-react';
import { OriginEchoEstimate } from '../types';

interface OriginEchoSceneProps {
  originEcho?: OriginEchoEstimate;
  onNext: () => void;
}

export const OriginEchoScene: React.FC<OriginEchoSceneProps> = ({
  originEcho,
  onNext,
}) => {
  const [activeTab, setActiveTab] = useState<'surviving' | 'estimated'>('estimated');

  const survivingCopies = [
    { source: 'Telegram Forward', resolution: '1280x720', intactFeature: 'Ambient background audio spectrum & crowd noise' },
    { source: 'WhatsApp Compress', resolution: '640x360', intactFeature: 'High-contrast edge boundaries & solar elevation' },
    { source: 'Screen Recording', resolution: '1080x1920', intactFeature: 'Preserved center-crop uncompressed facial region' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Ghost className="w-3.5 h-3.5" />
            <span>3:10–3:40 // SCENE 7: THE "WAIT..." MOMENT</span>
          </span>
          <span className="text-xs font-mono text-zinc-400">Missing Pristine Baseline</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "What if the original is gone? Anamnesis compares what survived."
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          We're not pretending we recovered a deleted file. We're showing what the surviving evidence can tell us about it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Surviving Copies Overlap */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>3 Surviving Derivative Copies</span>
              </span>
              <span className="text-xs font-mono text-rose-400 font-bold">Original = Unavailable</span>
            </div>

            <div className="space-y-3">
              {survivingCopies.map((copy, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      {copy.source}
                    </span>
                    <span className="text-[10px] text-zinc-400">{copy.resolution}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    <strong className="text-zinc-300">Surviving invariant:</strong> {copy.intactFeature}
                  </p>
                </div>
              ))}
            </div>

            {/* Overlap synthesis indicator */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/50 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-xs font-mono text-purple-200 leading-tight">
                Consensus synthesis across invariant features computes common geometric and spectral anchor points.
              </p>
            </div>
          </div>
        </div>

        {/* Right: The Origin Echo Estimate Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-purple-900/60 bg-[#0d0d14] p-5 space-y-4 shadow-xl relative overflow-hidden">
            {/* MANDATORY WARNING BADGE */}
            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/80 flex items-center gap-2.5 text-amber-300 text-xs font-mono font-black tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ESTIMATED — NOT ORIGINAL EVIDENCE</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Synthesized Origin Echo Baseline</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                {originEcho?.unmanipulated_scene_description ||
                  'Earliest uncropped scene baseline estimated from overlapping invariant attributes across observed derivatives.'}
              </p>
            </div>

            {/* Hardware & Spec Estimates */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Estimated Resolution:</span>
                <span className="text-white font-bold">
                  {originEcho?.original_resolution_estimate || '1920x1080 Native'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Estimated Capture Sensor:</span>
                <span className="text-white font-bold truncate block">
                  {originEcho?.likely_capture_device || 'Physical CMOS Sensor'}
                </span>
              </div>
            </div>

            {/* Invariant Attributes Checklist */}
            {originEcho?.surviving_attributes && (
              <div className="space-y-2 font-mono text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  Verified Invariant Characteristics:
                </span>
                <div className="space-y-1.5">
                  {originEcho.surviving_attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2 text-zinc-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-sans">{attr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Chapter CTA */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-400">
                Next: 3:40–4:10 Context Check (The Story Behind the Story)
              </span>
              <button
                onClick={onNext}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Step 8: Context Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
