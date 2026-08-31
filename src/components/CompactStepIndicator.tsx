import React from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CompactStepIndicatorProps {
  stepNumber: number;
  stepTitle: string;
  subtitle: string;
  badgeText?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  children?: React.ReactNode;
}

export const CompactStepIndicator: React.FC<CompactStepIndicatorProps> = ({
  stepNumber,
  stepTitle,
  subtitle,
  badgeText,
  isExpanded = false,
  onToggleExpand,
  children,
}) => {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-[#0a0a12] transition-all overflow-hidden shadow-sm">
      <div
        onClick={onToggleExpand}
        className={`flex items-center justify-between p-3 sm:px-4 cursor-pointer hover:bg-zinc-900/60 transition-colors ${
          isExpanded ? 'border-b border-zinc-800/80 bg-zinc-900/40' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/70 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-zinc-200">
              ✓ Step {stepNumber} — {stepTitle}
            </span>
            <span className="text-zinc-600 text-xs hidden sm:inline">•</span>
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {badgeText && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
              {badgeText}
            </span>
          )}
          <button
            type="button"
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Toggle step details"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && children && (
        <div className="p-4 bg-black/60 border-t border-zinc-800/50 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};
