import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface WhyThisMattersProps {
  title?: string;
  explanation: string;
  defaultExpanded?: boolean;
}

export const WhyThisMatters: React.FC<WhyThisMattersProps> = ({
  title = 'WHY THIS MATTERS',
  explanation,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 overflow-hidden font-mono text-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2.5 py-1.5 flex items-center justify-between text-left hover:bg-zinc-900/40 transition-colors cursor-pointer text-[10px]"
      >
        <span className="flex items-center gap-1 text-zinc-400 font-bold tracking-wider uppercase">
          <HelpCircle className="w-3 h-3 text-purple-400" />
          <span>{title}</span>
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-zinc-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-2.5 pb-2 pt-0.5 border-t border-zinc-800/60 font-sans text-xs text-zinc-300 leading-relaxed bg-[#0a0a12]">
          {explanation}
        </div>
      )}
    </div>
  );
};
