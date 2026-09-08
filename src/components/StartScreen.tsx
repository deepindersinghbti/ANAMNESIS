import React from 'react';
import { Logo } from './Logo';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    soundFx.playStartInvestigation();
    onStart();
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-sm w-full space-y-7 flex flex-col items-center">
        {/* Logo */}
        <div className="start-logo-box p-4 rounded-3xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800/80 shadow-2xl shadow-purple-950/30">
          <Logo size="xl" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-white uppercase">
            ANAMNESIS
          </h1>
          <p className="text-xs font-mono font-medium text-zinc-400">
            Digital Crime-Scene Intelligence
          </p>

          {/* Event Identifier & Creator */}
          <div className="pt-2 space-y-1">
            <p className="text-[10px] font-mono font-semibold tracking-widest text-zinc-500 uppercase">
              FOR CHANDIGARH POLICE NATIONAL HACKATHON 2026
            </p>
            <p className="text-xs sm:text-sm font-mono font-medium text-zinc-200 tracking-wide">
              Khushi Lakhanpal
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="w-full pt-2">
          <button
            onClick={handleStart}
            id="btn-start"
            className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/50 hover:shadow-purple-900/60 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>START</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Unobtrusive Trust Tag */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
          <ShieldCheck className="w-3 h-3 text-zinc-500" />
          <span>INVESTIGATOR ASSISTANCE • AI-assisted findings • Human verification</span>
        </div>
      </div>
    </div>
  );
};
