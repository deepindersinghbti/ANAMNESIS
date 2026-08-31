import React from 'react';

interface ConfidenceIndicatorProps {
  score: number; // 0 to 100 or 0 to 1
  label?: string;
  size?: 'sm' | 'md';
  showPercentage?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score,
  label,
  size = 'sm',
  showPercentage = true,
}) => {
  // Normalize score between 0 and 100
  const normalized = score <= 1 ? Math.round(score * 100) : Math.round(score);

  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let colorClass = 'text-amber-400';
  let barBgClass = 'bg-amber-400';
  let activeSegments = 1;

  if (normalized >= 75) {
    level = 'HIGH';
    colorClass = 'text-emerald-400';
    barBgClass = 'bg-emerald-400';
    activeSegments = 3;
  } else if (normalized >= 40) {
    level = 'MEDIUM';
    colorClass = 'text-purple-300';
    barBgClass = 'bg-purple-400';
    activeSegments = 2;
  } else {
    level = 'LOW';
    colorClass = 'text-zinc-400';
    barBgClass = 'bg-zinc-400';
    activeSegments = 1;
  }

  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs" title={`Confidence: ${normalized}%`}>
      {label && <span className="text-zinc-400 text-[10px] uppercase font-bold">{label}</span>}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
        {/* 3-segment visual meter */}
        <div className="flex items-center gap-0.5">
          <span
            className={`w-1.5 h-2.5 rounded-xs transition-colors ${
              activeSegments >= 1 ? barBgClass : 'bg-zinc-800'
            }`}
          />
          <span
            className={`w-1.5 h-2.5 rounded-xs transition-colors ${
              activeSegments >= 2 ? barBgClass : 'bg-zinc-800'
            }`}
          />
          <span
            className={`w-1.5 h-2.5 rounded-xs transition-colors ${
              activeSegments >= 3 ? barBgClass : 'bg-zinc-800'
            }`}
          />
        </div>

        {/* Level text */}
        <span className={`text-[10px] font-bold tracking-wider ${colorClass}`}>
          {level}
        </span>

        {/* Subtle percentage in parenthesis */}
        {showPercentage && (
          <span className="text-[9px] text-zinc-400 font-normal">
            ({normalized}%)
          </span>
        )}
      </div>
    </div>
  );
};
