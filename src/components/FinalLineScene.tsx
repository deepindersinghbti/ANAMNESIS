import React from 'react';
import {
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Play,
  FileCheck,
  Flame,
} from 'lucide-react';
import { Logo } from './Logo';

interface FinalLineSceneProps {
  onRestart: () => void;
  onOpenReportModal: () => void;
}

export const FinalLineScene: React.FC<FinalLineSceneProps> = ({
  onRestart,
  onOpenReportModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Scene Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>4:50–5:00 // SCENE 11: THE FINAL LINE</span>
          </span>
          <span className="text-xs font-mono text-zinc-400">Conclusion &amp; Core Thesis</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "Don't just detect the fake. Trace its story."
        </h2>
      </div>

      {/* Main Hero Card */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-[#120d1c] via-[#0d0d14] to-black p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight uppercase">
              ANAMNESIS
            </h1>
            <p className="text-base sm:text-lg font-mono font-bold text-purple-400">
              Digital Crime-Scene Intelligence for Manipulated Media
            </p>
            <p className="text-xs sm:text-sm font-mono text-zinc-400">
              Reconstruct the story. Expose the manipulation.
            </p>
          </div>

          {/* Core Quotes */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-left space-y-3 font-mono text-xs sm:text-sm">
            <p className="text-zinc-400">
              "A normal detector might tell you that a video is probably fake."
            </p>
            <p className="text-white font-bold text-base">
              "Anamnesis asks a much bigger question: What happened here?"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-purple-300 font-bold">
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                1. Where did it come from?
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                2. What changed?
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                3. And how did it spread?
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onOpenReportModal}
              className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <FileCheck className="w-4 h-4" />
              <span>GENERATE FORENSIC PACKAGE</span>
            </button>

            <button
              onClick={onRestart}
              className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Replay Walkthrough from 0:00</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
