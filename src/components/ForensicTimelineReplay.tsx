import React from 'react';
import {
  GitCommit,
  GitBranch,
  History,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Clock,
  Zap,
} from 'lucide-react';
import { ForensicTimelineStage, OriginEchoEstimate } from '../types';

interface ForensicTimelineReplayProps {
  timeline: ForensicTimelineStage[];
  originEcho?: OriginEchoEstimate;
}

export const ForensicTimelineReplay: React.FC<ForensicTimelineReplayProps> = ({
  timeline,
  originEcho,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-gradient-to-r from-[#3b82f6] to-[#ec4899]">
            <History className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-200 uppercase">
            Forensic Lineage Replay &amp; Origin Echo
          </h2>
        </div>
        <span className="text-[11px] text-pink-300 font-mono font-semibold">Mutation Propagation Trace</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Forensic Replay Timeline Bento Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#0c0c16] to-[#07070e] p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#ec4899]" />
              <span>Step-by-Step Lineage Evolution</span>
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#3b82f6] before:via-[#ec4899] before:to-[#f97316]">
              {timeline.map((stage, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#06060c] border-2 border-[#ec4899] flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.6)] group-hover:scale-110 transition-transform">
                    <span className="text-[10px] font-mono font-black text-pink-300">
                      {stage.stage}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-zinc-800/90 bg-[#06060c] p-3.5 space-y-1.5 hover:border-[#ec4899]/50 transition-colors shadow-inner">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-2">
                        <span>{stage.label}</span>
                        {stage.is_origin_echo && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3b82f6]/20 via-[#ec4899]/20 to-[#f97316]/20 border border-[#ec4899]/40 text-pink-300 font-bold">
                            ROOT STAGE
                          </span>
                        )}
                      </h4>
                      {stage.estimated_timestamp && (
                        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#3b82f6]" />
                          {stage.estimated_timestamp}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {stage.description}
                    </p>

                    {stage.platform && (
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                        <Share2 className="w-3 h-3 text-purple-400" />
                        <span>Platform / Environment: <strong className="text-zinc-200">{stage.platform}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Forensic Reconstruction (Origin Echo) Bento Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-purple-900/40 bg-gradient-to-b from-[#120d1c] to-[#07050d] p-5 space-y-4 relative overflow-hidden backdrop-blur shadow-xl">
            {/* Watermark Flag Header */}
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center gap-2.5 text-amber-300 text-xs font-mono font-black tracking-wider shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ESTIMATED — NOT ORIGINAL EVIDENCE</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f97316]" />
                <span>Forensic Origin Echo Synthesis</span>
              </h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                When the pristine raw file is missing, ANAMESIS synthesizes common surviving attributes across observed copies to estimate the earliest known baseline state.
              </p>
            </div>

            {originEcho && (
              <div className="space-y-3 pt-2 text-xs font-mono">
                {originEcho.unmanipulated_scene_description && (
                  <div className="p-3.5 rounded-2xl bg-[#06060c] border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-pink-300 uppercase font-bold block">
                      Estimated Unmanipulated Scene Baseline:
                    </span>
                    <p className="text-zinc-300 leading-relaxed font-sans">
                      {originEcho.unmanipulated_scene_description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#06060c] border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Estimated Resolution:</span>
                    <span className="text-zinc-200 font-bold text-xs">
                      {originEcho.original_resolution_estimate || '1920x1080 Native'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#06060c] border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Estimated Sensor / Device:</span>
                    <span className="text-zinc-200 font-bold text-xs truncate block">
                      {originEcho.likely_capture_device || 'Physical CMOS Sensor'}
                    </span>
                  </div>
                </div>

                {originEcho.surviving_attributes && originEcho.surviving_attributes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                      Surviving Invariant Attributes:
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-zinc-300 font-sans">
                      {originEcho.surviving_attributes.map((attr, i) => (
                        <li key={i} className="flex items-start gap-1.5 bg-[#06060c] p-2.5 rounded-xl border border-zinc-800/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{attr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
