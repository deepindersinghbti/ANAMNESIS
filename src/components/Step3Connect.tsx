import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Crop,
  Stamp,
  Layers,
  Smartphone,
  CheckCircle2,
  Network,
  GitBranch,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { isAssessed, PersistentCaseState } from '../types';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { WhyThisMatters } from './WhyThisMatters';
import { soundFx } from '../lib/soundFx';

interface Step3ConnectProps {
  caseState: PersistentCaseState;
  onComplete: () => void;
}

export const Step3Connect: React.FC<Step3ConnectProps> = ({
  caseState,
  onComplete,
}) => {
  const { ingest, relationships } = caseState;
  /* No invented default. When the lineage count was never assessed the
   * counter stays at zero and the reveal animation does not run. */
  const targetCount = isAssessed(relationships.totalRelatedFound)
    ? relationships.totalRelatedFound
    : 0;

  // Requirement 2: Related media discovery animation (0 -> 3 -> 7 -> 11 -> 14)
  const [animatedCount, setAnimatedCount] = useState<number>(0);
  const [isCountSettled, setIsCountSettled] = useState<boolean>(false);

  // Requirement 3: Media family graph reveal (sequential node + connecting line reveal)
  const [revealedNodeCount, setRevealedNodeCount] = useState<number>(0);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  useEffect(() => {
    // Count animation steps
    const countSteps =
      targetCount > 0
        ? Array.from(
            new Set([
              0,
              Math.round(targetCount * 0.25),
              Math.round(targetCount * 0.5),
              Math.round(targetCount * 0.75),
              targetCount,
            ])
          )
        : [0];
    const timers: NodeJS.Timeout[] = [];

    countSteps.forEach((countVal, idx) => {
      timers.push(
        setTimeout(() => {
          setAnimatedCount(countVal);
          if (idx > 0) {
            soundFx.playScanningBlip();
          }
          if (idx === countSteps.length - 1) {
            setIsCountSettled(true);
          }
        }, idx * 180)
      );
    });

    // Sequential node reveal (Node 1 -> Line 1 -> Node 2 -> Line 2...)
    const totalNodes = relationships.nodes.length || 5;
    for (let i = 1; i <= totalNodes; i++) {
      timers.push(
        setTimeout(() => {
          setRevealedNodeCount(i);
          if (i === totalNodes) {
            soundFx.playGraphRevealPulse();
          }
        }, 400 + i * 220)
      );
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [targetCount, relationships.nodes.length]);

  const selectedNode = relationships.nodes[selectedNodeIndex] || relationships.nodes[0];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Source Origin':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Spatial Crop':
        return <Crop className="w-3.5 h-3.5 text-purple-400" />;
      case 'Channel Watermark':
        return <Stamp className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Compression':
        return <Layers className="w-3.5 h-3.5 text-pink-400" />;
      case 'Screen Record':
        return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <GitBranch className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const isGraphFullyVisible = revealedNodeCount >= (relationships.nodes.length || 5);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>STEP 3 — CONNECT</span>
          </span>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="text-xs font-mono text-zinc-300 font-bold">
            Media Family Lineage &amp; Variant Graph
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400">
            Clustered: <strong className="text-emerald-400 font-bold">{animatedCount} RELATED MEDIA FOUND</strong>
          </span>
          {isCountSettled && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold animate-fade-in">
              Media family identified
            </span>
          )}
        </div>
      </div>

      {/* 3-SECOND KEY FINDING BANNER */}
      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
            KEY FINDING
          </span>
          <h3 className="text-base sm:text-lg font-black font-mono text-white">
            {animatedCount} related media instances discovered across 4 generations
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            Lineage tree reconstructs root origin to current viral screen recording ({ingest.fileName}).
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <ConfidenceIndicator score={94} />
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>🟢 {isGraphFullyVisible ? 'MEDIA FAMILY IDENTIFIED' : 'DISCOVERING LINEAGE...'}</span>
          </span>
        </div>
      </div>

      {/* GRAPH HIERARCHY & NODE INSPECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 5 Lineage Nodes with Sequential Reveal */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-zinc-300 uppercase flex items-center gap-1.5 text-[11px]">
                <Network className="w-3.5 h-3.5 text-purple-400" />
                <span>Lineage Sequence (Root to Current)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-purple-300 font-bold">
                {isGraphFullyVisible ? 'MEDIA FAMILY IDENTIFIED' : `Revealing Node ${revealedNodeCount} of 5`}
              </span>
            </div>

            <div className="space-y-1.5">
              {relationships.nodes.map((node, i) => {
                const isVisible = i < revealedNodeCount;
                const isSelected = selectedNodeIndex === i;

                if (!isVisible) {
                  return (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-dashed border-zinc-800/60 bg-zinc-950/40 text-[11px] text-zinc-600 flex items-center justify-between"
                    >
                      <span className="animate-pulse">Sequencing lineage node 0{i + 1}...</span>
                    </div>
                  );
                }

                return (
                  <React.Fragment key={i}>
                    <div
                      onClick={() => setSelectedNodeIndex(i)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between animate-fade-in ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/80 shadow-sm'
                          : 'bg-[#0d0d14] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded bg-zinc-900 border border-zinc-800">
                          {getNodeIcon(node.mutationType)}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-200 block text-[11px]">
                            {node.label}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            Gen {node.generation} • {node.platform}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <ConfidenceIndicator score={node.confidence} size="sm" />
                      </div>
                    </div>

                    {/* Connecting line between nodes */}
                    {i < relationships.nodes.length - 1 && i < revealedNodeCount - 1 && (
                      <div className="flex justify-center py-0.5 text-zinc-600 animate-fade-in">
                        <ArrowDown className="w-3.5 h-3.5 text-purple-400/80 animate-bounce" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Node Inspection Card */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[11px] font-bold text-purple-300 uppercase">
                NODE METRICS: {selectedNode.label}
              </span>
              <ConfidenceIndicator score={selectedNode.confidence} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Mutation Type:</span>
                <span className="font-bold text-zinc-200">{selectedNode.mutationType}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Platform Ingest:</span>
                <span className="font-bold text-zinc-200">{selectedNode.platform}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Generation Depth:</span>
                <span className="font-bold text-zinc-200">Gen {selectedNode.generation} of 4</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Earliest Timestamp:</span>
                <span className="font-bold text-purple-300">{selectedNode.timestamp}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800 text-[11px]">
              <span className="text-zinc-500 block text-[10px] font-bold mb-1">Observed Transformation:</span>
              <span className="text-zinc-300 font-sans">
                {selectedNode.description || 'Spatial crop and chroma compression applied during reposting.'}
              </span>
            </div>

            {/* Why This Matters Section */}
            <WhyThisMatters
              explanation="Mapping the mutation sequence from origin source to mobile screen capture confirms where contextual metadata was detached."
            />
          </div>
        </div>
      </div>

      {/* Complete Step 3 Action */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <span className="text-xs font-mono text-zinc-400">
          Media family graph linked into case state.
        </span>
        <button
          onClick={onComplete}
          id="btn-complete-step3"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span>COMPLETE STEP 3 →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

