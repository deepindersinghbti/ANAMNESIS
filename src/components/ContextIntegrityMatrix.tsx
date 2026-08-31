import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  Volume2,
  FileCheck,
  AlertTriangle,
  Hash,
} from 'lucide-react';
import { ContextIntegrityCheck, CaseSummary } from '../types';

interface ContextIntegrityMatrixProps {
  check: ContextIntegrityCheck;
  summary: CaseSummary;
}

export const ContextIntegrityMatrix: React.FC<ContextIntegrityMatrixProps> = ({
  check,
  summary,
}) => {
  const getStatusBadge = (statusStr: string) => {
    const isOk =
      statusStr.includes('🟢') ||
      statusStr.toLowerCase().includes('consistent') ||
      statusStr.toLowerCase().includes('verified') ||
      statusStr.toLowerCase().includes('untampered');

    const isWarn =
      statusStr.includes('🟠') ||
      statusStr.toLowerCase().includes('tampered') ||
      statusStr.toLowerCase().includes('spliced') ||
      statusStr.toLowerCase().includes('needs verification');

    if (isOk) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{statusStr}</span>
        </span>
      );
    }
    if (isWarn) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950/70 border border-amber-500/40 text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{statusStr}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/70 border border-rose-500/40 text-rose-300">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>{statusStr}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Executive Forensic Verdict Hero Panel */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-300 uppercase tracking-wider">
                CORE VERDICT // {summary.evidence_id}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Context Decoupling Protocol</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-mono leading-snug">
              {summary.verdict_summary}
            </h2>
          </div>

          <div className="shrink-0 bg-[#06060a] border border-zinc-800/90 rounded-xl p-3 font-mono text-xs text-right">
            <div className="flex items-center gap-1.5 justify-end text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              <span>SHA-256 Digest</span>
            </div>
            <span className="text-zinc-200 font-mono font-bold tracking-tight block max-w-[210px] truncate select-all mt-1">
              {summary.primary_hash_sha256}
            </span>
          </div>
        </div>
      </div>

      {/* 4-Quadrant Decoupling Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Raw Media */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-extrabold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>RAW MEDIA PIXELS</span>
            </span>
          </div>
          <div className="space-y-2">
            <div>{getStatusBadge(check.raw_media_status)}</div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              PRNU sensor noise, compression quantization, and generative tensor artifacts.
            </p>
          </div>
        </div>

        {/* 2. Claimed Location */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-extrabold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>CLAIMED LOCATION</span>
            </span>
          </div>
          <div className="space-y-2">
            <div>{getStatusBadge(check.claimed_location_status)}</div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Architectural biomes, typography, landmarks, and satellite terrain matching.
            </p>
          </div>
        </div>

        {/* 3. Claimed Timestamp */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-extrabold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>CLAIMED TIMESTAMP</span>
            </span>
          </div>
          <div className="space-y-2">
            <div>{getStatusBadge(check.claimed_time_status)}</div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Solar shadow azimuth, seasonal vegetation, and historical weather records.
            </p>
          </div>
        </div>

        {/* 4. Audio Integrity */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-extrabold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-pink-400" />
              <span>AUDIO INTEGRITY</span>
            </span>
          </div>
          <div className="space-y-2">
            <div>{getStatusBadge(check.audio_integrity_status)}</div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Acoustic room tone noise floor, voice cadence, and splice cut transients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
