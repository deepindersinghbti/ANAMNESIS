import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Activity,
  Scissors,
  AlertTriangle,
  AudioWaveform,
} from 'lucide-react';

interface AudioForensicLabProps {
  status: string;
}

export const AudioForensicLab: React.FC<AudioForensicLabProps> = ({ status }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPos, setPlaybackPos] = useState(35); // 0-100%
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate simulated audio waveform & spectrogram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = 140);

    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, width, height);

    // Draw baseline grid
    ctx.strokeStyle = '#1a1a2b';
    ctx.lineWidth = 1;
    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Waveform with Logo-Themed Gradient
    const bars = Math.floor(width / 4);
    const spliceX = Math.floor(bars * 0.48); // Splice anomaly at ~48%

    for (let i = 0; i < bars; i++) {
      const x = i * 4;
      const progress = i / bars;
      let amp = Math.sin(progress * 18) * 0.4 + Math.sin(progress * 42) * 0.3 + 0.3;

      // Inject splice drop & phase jump at 48%
      if (Math.abs(i - spliceX) < 3) {
        amp = i === spliceX ? 0.95 : 0.05; // Transient click spike + silence gap
      }

      const barHeight = Math.max(4, amp * (height * 0.75));
      const y = (height - barHeight) / 2;

      if (Math.abs(i - spliceX) < 4) {
        ctx.fillStyle = '#f43f5e'; // Red for splice glitch
      } else if (i < (playbackPos / 100) * bars) {
        // Multi-color played gradient
        const ratio = i / Math.max(1, (playbackPos / 100) * bars);
        ctx.fillStyle = ratio < 0.33 ? '#3b82f6' : ratio < 0.66 ? '#ec4899' : '#f97316';
      } else {
        ctx.fillStyle = '#262638'; // Dark unplayed
      }

      ctx.fillRect(x, y, 2.5, barHeight);
    }

    // Draw Playback Head
    const headX = (playbackPos / 100) * width;
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX, 0);
    ctx.lineTo(headX, height);
    ctx.stroke();

    // Splice Marker Annotation
    const splicePixelX = (spliceX / bars) * width;
    ctx.strokeStyle = '#f43f5e';
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(splicePixelX, 0);
    ctx.lineTo(splicePixelX, height);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [playbackPos]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackPos((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="rounded-3xl border border-pink-900/40 bg-gradient-to-b from-[#140e1c] to-[#08050e] p-5 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AudioWaveform className="w-4 h-4 text-[#ec4899]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-100 uppercase">
            Acoustic &amp; Audio Stream Forensic Spectrogram
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-400">Integrity:</span>
          <span className="font-bold text-pink-300 bg-pink-950/60 px-2.5 py-0.5 rounded-full border border-pink-500/40 shadow-sm">
            {status}
          </span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#06060c]">
        <canvas
          ref={canvasRef}
          className="w-full h-36 block cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            setPlaybackPos(Math.floor((clickX / rect.width) * 100));
          }}
        />

        {/* Splice Flag Annotation HUD */}
        <div className="absolute top-2.5 left-[49%] -translate-x-1/2 bg-rose-950/90 border border-rose-500/60 rounded-xl px-2.5 py-1 text-[10px] font-mono text-rose-300 font-bold pointer-events-none flex items-center gap-1.5 shadow-lg">
          <Scissors className="w-3 h-3 text-rose-400" />
          <span>SPLICE TRANSIENT DETECTED (00:01.42)</span>
        </div>
      </div>

      {/* Playback Controls & Diagnostics */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-xl logo-gradient-bg text-white font-bold transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <span className="text-zinc-300">
            00:0{(playbackPos * 0.03).toFixed(2)}s / 00:03.00s
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
          <span>Room Tone Floor: <strong className="text-zinc-200">-42.8 dBFS</strong></span>
          <span>Sample Rate: <strong className="text-zinc-200">44.1 kHz (16-bit PCM)</strong></span>
          <span>Cadence Anomaly: <strong className="text-amber-400">High Variance</strong></span>
        </div>
      </div>
    </div>
  );
};
