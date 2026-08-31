import React, { useState } from 'react';
import {
  UserCheck,
  MapPin,
  Clock,
  Scissors,
  Share2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from 'lucide-react';
import { FiveQuestions } from '../types';

interface FiveQuestionsGridProps {
  questions: FiveQuestions;
}

export const FiveQuestionsGrid: React.FC<FiveQuestionsGridProps> = ({ questions }) => {
  // Collapsible Drop Boxes State (defaults to all expanded or first 2 expanded)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    q1: true,
    q2: true,
    q3: true,
    q4: true,
    q5: true,
  });

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Consistent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
            <CheckCircle className="w-3 h-3" /> Consistent
          </span>
        );
      case 'Inconsistent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950/70 border border-rose-500/40 text-rose-300">
            <AlertCircle className="w-3 h-3" /> Inconsistent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/70 border border-amber-500/40 text-amber-300">
            <HelpCircle className="w-3 h-3" /> Needs Verification
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-purple-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-mono font-black tracking-wider text-white uppercase">
              THE 5 FORENSIC QUESTIONS
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Decoupling content reality from dissemination claims
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const allOpen = Object.values(expanded).every(Boolean);
            setExpanded({
              q1: !allOpen,
              q2: !allOpen,
              q3: !allOpen,
              q4: !allOpen,
              q5: !allOpen,
            });
          }}
          className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1 rounded-lg border border-zinc-800 bg-[#0d0d14] cursor-pointer"
        >
          {Object.values(expanded).every(Boolean) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-3">
        {/* 1. WHO */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] overflow-hidden transition-all">
          <button
            onClick={() => toggleExpand('q1')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-mono font-black text-white uppercase tracking-wider block">
                  1. WHO (ENTITIES &amp; ARTIFACTS)
                </span>
                <span className="text-xs text-zinc-400 font-sans line-clamp-1">
                  {questions.who.observation}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Confidence: {Math.round(questions.who.confidence * 100)}%
              </span>
              {expanded.q1 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </div>
          </button>

          {expanded.q1 && (
            <div className="p-4 pt-0 border-t border-zinc-800/60 mt-1 space-y-3 font-sans text-xs">
              <p className="text-zinc-300 leading-relaxed pt-3">
                {questions.who.observation}
              </p>

              {questions.who.entities_detected && questions.who.entities_detected.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Identified Subject Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {questions.who.entities_detected.map((ent, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {questions.who.synthetic_artifacts && questions.who.synthetic_artifacts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                    Synthetic / AI Artifacts Detected:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {questions.who.synthetic_artifacts.map((art, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono px-2.5 py-1 rounded bg-rose-950/50 border border-rose-800/40 text-rose-300 font-bold"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. WHERE */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] overflow-hidden transition-all">
          <button
            onClick={() => toggleExpand('q2')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-mono font-black text-white uppercase tracking-wider block">
                  2. WHERE (GEOLOCATION)
                </span>
                <span className="text-xs text-zinc-400 font-sans line-clamp-1">
                  Claimed: {questions.where.claimed} | Observed: {questions.where.observed}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {getStatusBadge(questions.where.status)}
              {expanded.q2 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </div>
          </button>

          {expanded.q2 && (
            <div className="p-4 pt-0 border-t border-zinc-800/60 mt-1 space-y-3 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-mono text-zinc-400 font-bold block uppercase">
                    Claimed Location:
                  </span>
                  <p className="text-zinc-200 font-bold font-mono">{questions.where.claimed}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-mono text-amber-400 font-bold block uppercase">
                    Observed Reality:
                  </span>
                  <p className="text-zinc-300 font-sans">{questions.where.observed}</p>
                </div>
              </div>

              {questions.where.geolocation_clues && questions.where.geolocation_clues.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Topographic &amp; Architectural Markers:
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                    {questions.where.geolocation_clues.map((clue, i) => (
                      <li key={i}>{clue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. WHEN */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] overflow-hidden transition-all">
          <button
            onClick={() => toggleExpand('q3')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-mono font-black text-white uppercase tracking-wider block">
                  3. WHEN (TEMPORAL INTEGRITY)
                </span>
                <span className="text-xs text-zinc-400 font-sans line-clamp-1">
                  Claimed: {questions.when.claimed} | Observed: {questions.when.observed}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {getStatusBadge(questions.when.status)}
              {expanded.q3 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </div>
          </button>

          {expanded.q3 && (
            <div className="p-4 pt-0 border-t border-zinc-800/60 mt-1 space-y-3 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-mono text-zinc-400 font-bold block uppercase">
                    Claimed Timestamp:
                  </span>
                  <p className="text-zinc-200 font-bold font-mono">{questions.when.claimed}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-mono text-blue-400 font-bold block uppercase">
                    Observed Chrono-Evidence:
                  </span>
                  <p className="text-zinc-300 font-sans">{questions.when.observed}</p>
                </div>
              </div>

              {questions.when.temporal_markers && questions.when.temporal_markers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Solar &amp; Chronological Indicators:
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                    {questions.when.temporal_markers.map((mark, i) => (
                      <li key={i}>{mark}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. WHAT CHANGED */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] overflow-hidden transition-all">
          <button
            onClick={() => toggleExpand('q4')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Scissors className="w-4 h-4 text-pink-400 shrink-0" />
              <div>
                <span className="text-xs font-mono font-black text-white uppercase tracking-wider block">
                  4. WHAT CHANGED (MUTATIONS &amp; SPLICING)
                </span>
                <span className="text-xs text-zinc-400 font-sans line-clamp-1">
                  {questions.what_changed.details}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1">
                {questions.what_changed.mutations_detected.map((mut, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-pink-950/70 border border-pink-700/50 text-pink-300"
                  >
                    {mut}
                  </span>
                ))}
              </div>
              {expanded.q4 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </div>
          </button>

          {expanded.q4 && (
            <div className="p-4 pt-0 border-t border-zinc-800/60 mt-1 space-y-3 font-sans text-xs">
              <p className="text-zinc-300 leading-relaxed pt-3">
                {questions.what_changed.details}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questions.what_changed.ela_findings && (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1 font-mono">
                    <span className="text-[11px] font-bold text-pink-400 uppercase block">
                      Error Level Analysis (ELA):
                    </span>
                    <p className="text-zinc-300 text-xs font-sans">{questions.what_changed.ela_findings}</p>
                  </div>
                )}
                {questions.what_changed.sensor_noise_findings && (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1 font-mono">
                    <span className="text-[11px] font-bold text-purple-400 uppercase block">
                      Sensor PRNU Noise Analysis:
                    </span>
                    <p className="text-zinc-300 text-xs font-sans">{questions.what_changed.sensor_noise_findings}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. HOW IT SPREAD */}
        <div className="rounded-xl border border-zinc-800 bg-[#0d0d14] overflow-hidden transition-all">
          <button
            onClick={() => toggleExpand('q5')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-mono font-black text-white uppercase tracking-wider block">
                  5. HOW IT SPREAD (LINEAGE &amp; EVOLUTION)
                </span>
                <span className="text-xs text-zinc-400 font-sans line-clamp-1">
                  {questions.how_it_spread.lineage_notes}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Gen Depth: <strong className="text-emerald-400">{questions.how_it_spread.estimated_generations}</strong>
              </span>
              {expanded.q5 ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </div>
          </button>

          {expanded.q5 && (
            <div className="p-4 pt-0 border-t border-zinc-800/60 mt-1 space-y-3 font-sans text-xs">
              <p className="text-zinc-300 leading-relaxed pt-3">
                {questions.how_it_spread.lineage_notes}
              </p>

              {questions.how_it_spread.platforms_detected && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Dissemination Flow Vector:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {questions.how_it_spread.platforms_detected.map((plat, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200"
                      >
                        {i > 0 && <span className="text-emerald-400 mr-1.5">→</span>}
                        {plat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
