import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  Sparkles,
  Layers,
  Crop,
  Stamp,
  Maximize2,
  Film,
  Smartphone,
  Share2,
  CheckCircle2,
  AlertCircle,
  Network,
} from 'lucide-react';

interface MediaFamilySceneProps {
  onNext: () => void;
}

export const MediaFamilyScene: React.FC<MediaFamilySceneProps> = ({ onNext }) => {
  const [selectedNode, setSelectedNode] = useState<number>(0);

  const copies = [
    {
      id: 'COPY 01',
      title: 'Original-Looking Source Seed',
      platform: 'Vimeo / Direct Upload',
      resolution: '1920x1080 (30fps)',
      status: 'Earliest Observed',
      badgeColor: 'bg-emerald-950/60 border-emerald-700 text-emerald-300',
      clues: 'Full uncropped frame showing street signage on left corner; pristine audio channel.',
    },
    {
      id: 'COPY 02',
      title: 'Cropped Variant',
      platform: 'TikTok / Reels',
      resolution: '1080x1080 (1:1 Square)',
      status: 'Spatially Altered',
      badgeColor: 'bg-blue-950/60 border-blue-700 text-blue-300',
      clues: 'Street signage cropped out; focus tightened on central disturbance.',
    },
    {
      id: 'COPY 03',
      title: 'Watermarked Channel Ingest',
      platform: 'Telegram News Channel',
      resolution: '1280x720 (H.264)',
      status: 'Channel Brand Injected',
      badgeColor: 'bg-purple-950/60 border-purple-700 text-purple-300',
      clues: 'Opaque @BreakingNow channel logo stamped across top-right quadrant.',
    },
    {
      id: 'COPY 04',
      title: 'Heavily Compressed Re-encode',
      platform: 'WhatsApp Viral Forward',
      resolution: '640x360 (Low Bitrate)',
      status: 'Severe Quantization',
      badgeColor: 'bg-amber-950/60 border-amber-700 text-amber-300',
      clues: 'DCT block artifacts, high frequency edge smear, stripped audio high-ends.',
    },
    {
      id: 'COPY 05',
      title: 'Screen Recording with UI',
      platform: 'X (Twitter) Viral Post',
      resolution: '1170x2532 (Mobile Capture)',
      status: 'Current Ingest Evidence',
      badgeColor: 'bg-rose-950/60 border-rose-700 text-rose-300',
      clues: 'iOS control center header, battery percentage (64%), volume slider overlay.',
    },
  ];

  const graphNodes = [
    { label: 'Possible Source (01)', sub: 'Root Camera Stream', type: 'root' },
    { label: 'Edited Version (02)', sub: 'Spatial Crop', type: 'edit' },
    { label: 'Watermarked (03)', sub: 'Channel Stamped', type: 'watermark' },
    { label: 'Compressed Version (04)', sub: '360p Quantization', type: 'compress' },
    { label: 'Screen Recording (05)', sub: 'Viral Evidence', type: 'current' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5" />
            <span>2:00–2:35 // SCENE 5: THE FIRST WOW</span>
          </span>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/60 text-purple-300 font-bold">
            Related Media Found — 14 Copies
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "Instead of treating every upload as a different file, Anamnesis builds the Media Family."
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          "We're not just looking at a video anymore. We're looking at its story."
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Media Family Lineage Graph */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" />
                <span>Lineage Family Tree (Graph)</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">14 Related Instances</span>
            </div>

            {/* Step-by-step lineage graph cards */}
            <div className="space-y-2.5 font-mono text-xs">
              {graphNodes.map((node, i) => (
                <div key={i} className="relative">
                  <div
                    onClick={() => setSelectedNode(i)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedNode === i
                        ? 'bg-zinc-800 border-purple-500 text-white shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="font-bold">{node.label}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 pl-4">{node.sub}</span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold">
                      {i === 0 ? 'SOURCE' : i === 4 ? 'EVIDENCE' : `MUTATION 0${i}`}
                    </span>
                  </div>

                  {i < graphNodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-3 bg-zinc-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Detailed Inspection of Selected Variant */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                Variant Deep Inspection: {copies[selectedNode]?.id}
              </span>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${copies[selectedNode]?.badgeColor}`}
              >
                {copies[selectedNode]?.status}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <h4 className="text-sm font-bold text-white">
                {copies[selectedNode]?.title}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Distribution Platform:</span>
                  <span className="font-bold text-zinc-200">{copies[selectedNode]?.platform}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Resolution &amp; Format:</span>
                  <span className="font-bold text-zinc-200">{copies[selectedNode]?.resolution}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-bold text-purple-300 uppercase block">
                  Forensic Mutation Signature:
                </span>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {copies[selectedNode]?.clues}
                </p>
              </div>
            </div>

            {/* Interactive Selector Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {copies.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedNode(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    selectedNode === idx
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>

            {/* Next Chapter CTA */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-400">
                Next: 2:35–3:10 Forensic Replay™ Signature Feature
              </span>
              <button
                onClick={onNext}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Step 6: Forensic Replay™</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
