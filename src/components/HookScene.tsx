import React, { useState } from 'react';
import {
  Film,
  Share2,
  AlertTriangle,
  ArrowRight,
  Shield,
  EyeOff,
  Video,
  Play,
  RotateCcw,
} from 'lucide-react';

interface HookSceneProps {
  onNext: () => void;
}

export const HookScene: React.FC<HookSceneProps> = ({ onNext }) => {
  const [phase, setPhase] = useState<'viral' | 'lost' | 'question'>('viral');

  const platforms = [
    { name: 'WhatsApp', copies: 'Forwarded many times', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800' },
    { name: 'Telegram', copies: 'Re-encoded in 360p', color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800' },
    { name: 'Instagram', copies: 'Cropped to 9:16 + Stickers', color: 'text-pink-400', bg: 'bg-pink-950/40 border-pink-800' },
    { name: 'X (Twitter)', copies: 'Viral thread (4.2M views)', color: 'text-zinc-200', bg: 'bg-zinc-900 border-zinc-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Scene Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span>0:00–0:25 // SCENE 1: THE HOOK</span>
          </span>
          <span className="text-xs font-mono text-zinc-400">Speaker Camera &amp; Screen Simulation</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "Imagine this video suddenly goes viral."
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Everyone is sharing it. Everyone has a different version. But by the time investigators or the public see it... the original is gone.
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: The Viral Wave / Degradation Pipeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-black p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                <span>OBSERVED EVIDENCE: viral_clip_unverified.mp4</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-bold">
                HIGH DEGRADATION
              </span>
            </div>

            {/* Video Canvas Box */}
            <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

              {phase === 'viral' && (
                <div className="space-y-3 relative z-10 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500 flex items-center justify-center mx-auto text-purple-300 shadow-lg">
                    <Play className="w-6 h-6 ml-0.5 text-purple-400" />
                  </div>
                  <p className="text-sm font-mono font-bold text-white max-w-sm">
                    "Breaking: Explosion reported near industrial hub"
                  </p>
                  <p className="text-xs text-zinc-400 font-mono">
                    Spreading rapidly across multiple channels with conflicting claims
                  </p>
                </div>
              )}

              {phase === 'lost' && (
                <div className="space-y-3 relative z-10 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-600 flex items-center justify-center mx-auto text-rose-400">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-mono font-black text-rose-300 tracking-wider">
                    ORIGINAL SOURCE: GONE
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] font-bold">
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                      CROPPED
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                      COMPRESSED
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                      SCREEN-RECORDED
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                      RE-UPLOADED
                    </span>
                  </div>
                </div>
              )}

              {phase === 'question' && (
                <div className="space-y-4 relative z-10 animate-in fade-in">
                  <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/80 text-center">
                    <p className="text-xs font-mono text-purple-300 uppercase font-bold">
                      THE CORE PARADIGM SHIFT
                    </p>
                    <p className="text-base sm:text-lg font-mono font-black text-white mt-1">
                      "Do we just ask... is it fake?"
                    </p>
                    <p className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                      "Or do we ask what actually happened here?"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Phase Switcher Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPhase('viral')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    phase === 'viral'
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  1. Viral Wave
                </button>
                <button
                  onClick={() => setPhase('lost')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    phase === 'lost'
                      ? 'bg-rose-700 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  2. Original Gone
                </button>
                <button
                  onClick={() => setPhase('question')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    phase === 'question'
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  3. The Big Question
                </button>
              </div>

              <button
                onClick={() => setPhase('viral')}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                title="Replay Hook"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Cuts across Platforms */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-3.5">
            <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Multi-Platform Distortion Vectors</span>
            </h3>

            <div className="space-y-2.5">
              {platforms.map((p, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${p.bg} flex items-center justify-between font-mono text-xs`}
                >
                  <div>
                    <span className={`font-bold ${p.color}`}>{p.name}</span>
                    <p className="text-[11px] text-zinc-400">{p.copies}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold">Vector 0{i + 1}</span>
                </div>
              ))}
            </div>

            {/* Next Chapter Card */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/60 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-300">
                  NEXT: 0:25–0:55
                </span>
                <p className="text-xs font-mono font-bold text-white">
                  The Big Idea: Digital Crime-Scene Clue Collection
                </p>
              </div>

              <button
                onClick={onNext}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Step 2: The Big Idea</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
