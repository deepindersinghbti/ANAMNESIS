import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  MapPin,
  Clock,
  Mic,
  Users,
  Globe,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  Crop,
  Layers,
  FileCheck2,
} from 'lucide-react';

interface BigIdeaSceneProps {
  onNext: () => void;
}

export const BigIdeaScene: React.FC<BigIdeaSceneProps> = ({ onNext }) => {
  const [selectedClue, setSelectedClue] = useState<number>(0);

  const mutationSteps = [
    { title: '1. Original Source', desc: '1080p pristine camera capture, unedited audio stream', tag: 'Pristine' },
    { title: '2. Cropped', desc: '16:9 converted to 1:1 square; key contextual landmarks removed', tag: 'Spatial Crop' },
    { title: '3. Watermarked', desc: 'Aggregator channel branding overlaid to obscure native timestamp', tag: 'Overlay' },
    { title: '4. Compressed', desc: 'Aggressive quantization across messaging platforms (360p)', tag: 'Lossy Encode' },
    { title: '5. Screen-Recorded', desc: 'Mobile UI boundaries & battery icons baked into video stream', tag: 'Re-encode' },
    { title: '6. Viral Outbreak', desc: 'Sensationalized claim attached and forwarded millions of times', tag: 'Virality' },
  ];

  const clues = [
    {
      icon: <Search className="w-4 h-4 text-purple-400" />,
      title: 'Video & Pixels',
      detail: 'ELA error level analysis, sensor noise fingerprint, compression block anomalies',
    },
    {
      icon: <MapPin className="w-4 h-4 text-amber-400" />,
      title: 'Location & Landmarks',
      detail: 'Architectural features, road signs, solar elevation angles, geographic verification',
    },
    {
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      title: 'Time & Temporal Markers',
      detail: 'Shadow azimuth, weather telemetry, solar position calculations, event timestamps',
    },
    {
      icon: <Mic className="w-4 h-4 text-cyan-400" />,
      title: 'Audio & Acoustics',
      detail: 'ENF (Electrical Network Frequency), ambient background acoustics, vocal synthesis checks',
    },
    {
      icon: <Users className="w-4 h-4 text-pink-400" />,
      title: 'People & Entities',
      detail: 'Facial landmarks, anatomical geometry, uniform insignia, synthetic deepfake detection',
    },
    {
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      title: 'Sources & Lineage',
      detail: 'Reverse image matching, cross-platform propagation vectors, earliest known seeds',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>0:25–0:55 // SCENE 2: THE BIG IDEA</span>
          </span>
          <span className="text-xs font-mono text-zinc-400">The Crime-Scene Metaphor</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "Think about a crime scene. Investigators collect clues."
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          An investigator doesn't just look at one piece of evidence and say, "Yep, crime." They collect clues across multiple vectors. Anamnesis does the same thing for digital media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Visual Example of Mutation Ladder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>The Media Mutation Cascade</span>
            </h3>

            <div className="space-y-2 relative font-mono text-xs">
              {mutationSteps.map((m, idx) => (
                <React.Fragment key={idx}>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{m.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-purple-300">
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">{m.desc}</p>
                  </div>
                  {idx < mutationSteps.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right: The 6 Clue Vectors */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                <span>Multimodal Forensic Clue Framework</span>
              </h3>
              <span className="text-xs font-mono text-purple-400 font-bold">6 Vectors</span>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Instead of relying on a fragile single-model confidence score, Anamnesis corroborates clues across physical, temporal, digital, and social dimensions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clues.map((clue, i) => {
                const isSelected = selectedClue === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedClue(i)}
                    className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer font-mono ${
                      isSelected
                        ? 'bg-zinc-800 border-purple-500 text-white shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {clue.icon}
                      <span className="text-xs font-bold">{clue.title}</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      {clue.detail}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Next Chapter CTA */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-400">
                Next: 0:55–1:25 The 5 Core Questions
              </span>
              <button
                onClick={onNext}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Step 3: The 5 Questions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
