import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { RotateCcw, FolderLock, User, LogOut, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface NavbarProps {
  caseId?: string;
  hasStartedCase?: boolean;
  currentStep?: number;
  totalSteps?: number;
  workflowStage?: number;
  statusMessage?: string;
  onGoToCases?: () => void;
  onNewCase?: () => void;
  onGoToProfile?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  caseId,
  hasStartedCase = false,
  currentStep = 1,
  totalSteps = 5,
  workflowStage = 1,
  statusMessage,
  onGoToCases,
  onNewCase,
  onGoToProfile,
  onLogout,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    setSoundEnabled(soundFx.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const newState = soundFx.toggleMute();
    setSoundEnabled(newState);
  };
  // Determine contextual status line if not explicitly passed
  const getContextualStatus = () => {
    if (statusMessage) return statusMessage;
    if (workflowStage >= 6) return 'Dossier assembled & sealed';
    switch (Math.min(5, Math.max(1, Math.floor(currentStep)))) {
      case 1:
        return 'Awaiting evidence';
      case 2:
        return 'Analysing submitted media';
      case 3:
        return 'Searching for related media';
      case 4:
        return 'Building the evidence picture';
      case 5:
        return 'Preparing forensic package';
      default:
        return 'Active Case';
    }
  };

  const stepDisplayNum = Math.min(5, Math.max(1, Math.floor(currentStep)));

  return (
    <header className="border-b border-zinc-800/80 bg-[#06060a]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Group & Contextual Status */}
        <div
          onClick={onGoToCases}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="hover:scale-105 transition-transform">
            <Logo size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-black tracking-wider text-white uppercase">
                ANAMNESIS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-zinc-900 border border-zinc-700 text-purple-300">
                INVESTIGATOR ASSISTANCE
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
              <span>AI-assisted findings • Human verification</span>
              {hasStartedCase && caseId && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-purple-300 font-semibold">{getContextualStatus()}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Bar & Case Progress Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {caseId && hasStartedCase && (
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg">
              <span>
                CASE <strong className="text-purple-300">#{caseId}</strong>
              </span>
              <span className="text-zinc-700">|</span>
              <span className="text-[11px] font-bold text-zinc-300">
                {workflowStage >= 6 ? (
                  <span className="text-emerald-400">05 / 05 Complete</span>
                ) : (
                  <span>Step {stepDisplayNum} of {totalSteps}</span>
                )}
              </span>
            </div>
          )}

          {/* Sound Effect Toggle */}
          <button
            onClick={handleToggleSound}
            id="nav-btn-toggle-sound"
            className={`px-2 py-1 rounded-lg border font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-purple-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-400'
            }`}
            title={soundEnabled ? 'Sound Effects: ON (Click to Mute)' : 'Sound Effects: OFF (Click to Unmute)'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span className="hidden md:inline text-[10px]">
              {soundEnabled ? 'SOUND ON' : 'MUTED'}
            </span>
          </button>

          {onGoToCases && (
            <button
              onClick={onGoToCases}
              id="nav-btn-my-cases"
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View all saved cases"
            >
              <FolderLock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">MY CASES</span>
            </button>
          )}

          {onNewCase && (
            <button
              onClick={onNewCase}
              id="nav-btn-new-case"
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-purple-600 border border-zinc-700 hover:border-purple-500 text-zinc-300 hover:text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Start a new investigation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>NEW CASE</span>
            </button>
          )}

          {onGoToProfile && (
            <button
              onClick={onGoToProfile}
              id="nav-btn-profile"
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Investigator Profile"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">PROFILE</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              id="nav-btn-logout"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Sign out of workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
