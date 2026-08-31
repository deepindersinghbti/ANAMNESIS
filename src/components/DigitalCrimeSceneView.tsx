import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  MapPin,
  Clock,
  AlertTriangle,
  Share2,
  Search,
  ArrowRight,
  Layers,
  Volume2,
  MessageSquare,
  Sparkles,
  FileText,
} from 'lucide-react';
import { FiveQuestions, CaseSummary, MediaIntakeData, AnamnesisForensicReport } from '../types';
import { ForensicCanvasLab } from './ForensicCanvasLab';
import { MetadataInspector } from './MetadataInspector';
import { AudioForensicLab } from './AudioForensicLab';
import { ForensicCopilotChat } from './ForensicCopilotChat';

interface DigitalCrimeSceneViewProps {
  report: AnamnesisForensicReport;
  intake: MediaIntakeData;
  imageBase64?: string;
  onNext: () => void;
  onOpenReportModal: () => void;
}

export const DigitalCrimeSceneView: React.FC<DigitalCrimeSceneViewProps> = ({
  report,
  intake,
  imageBase64,
  onNext,
  onOpenReportModal,
}) => {
  const [subTool, setSubTool] = useState<'crime_scene' | 'canvas_ela' | 'audio_meta' | 'copilot'>(
    'crime_scene'
  );

  const q = report.the_five_questions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>4:10–4:40 // SCENE 9: THE DIGITAL CRIME SCENE</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Forensic Package</span>
            </button>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "All the clues now come together into one digital crime scene."
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Instead of giving investigators one black-box answer, Anamnesis shows them the evidence behind the answer.
        </p>
      </div>

      {/* Sub-tool switcher pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        <button
          onClick={() => setSubTool('crime_scene')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTool === 'crime_scene'
              ? 'bg-zinc-800 border border-purple-500 text-white shadow-sm'
              : 'bg-[#0d0d14] border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>UNIFIED CRIME SCENE GRID</span>
        </button>

        <button
          onClick={() => setSubTool('canvas_ela')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTool === 'canvas_ela'
              ? 'bg-zinc-800 border border-purple-500 text-white shadow-sm'
              : 'bg-[#0d0d14] border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>CANVAS LAB &amp; ELA</span>
        </button>

        <button
          onClick={() => setSubTool('audio_meta')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTool === 'audio_meta'
              ? 'bg-zinc-800 border border-purple-500 text-white shadow-sm'
              : 'bg-[#0d0d14] border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>AUDIO &amp; EXIF LAB</span>
        </button>

        <button
          onClick={() => setSubTool('copilot')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTool === 'copilot'
              ? 'bg-zinc-800 border border-purple-500 text-white shadow-sm'
              : 'bg-[#0d0d14] border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
          <span>AI CROSS-EXAMINER</span>
        </button>
      </div>

      {/* Main Subtool Content */}
      {subTool === 'crime_scene' && (
        <div className="space-y-5">
          {/* Crime Scene 6-Vector Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* 1. WHO */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>👤 WHO (ENTITIES)</span>
                </span>
                <span className="text-[10px] text-purple-300 font-bold">
                  {(q.who.confidence * 100).toFixed(0)}% Conf
                </span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">{q.who.observation}</p>
            </div>

            {/* 2. WHERE */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>📍 WHERE (LOCATION)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold">{q.where.status}</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">{q.where.observed}</p>
            </div>

            {/* 3. WHEN */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>🕐 WHEN (TEMPORAL)</span>
                </span>
                <span className="text-[10px] text-rose-400 font-bold">{q.when.status}</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">{q.when.observed}</p>
            </div>

            {/* 4. WHAT CHANGED */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>⚠️ WHAT CHANGED</span>
                </span>
                <span className="text-[10px] text-purple-300 font-bold">Mutations Detected</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">{q.what_changed.details}</p>
            </div>

            {/* 5. HOW DID IT SPREAD */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>🌐 HOW DID IT SPREAD</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">
                  {q.how_it_spread.estimated_generations} Generations
                </span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                {q.how_it_spread.lineage_notes}
              </p>
            </div>

            {/* 6. SOURCE INVARIANT */}
            <div className="p-4 rounded-xl bg-[#0d0d14] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>🔎 EARLIEST SOURCE</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-bold">Origin Trace</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                {report.origin_echo?.unmanipulated_scene_description ||
                  'Earliest known uncropped capture traced to unmanipulated camera stream.'}
              </p>
            </div>
          </div>

          {/* Actionable Leads Banner */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Investigator Case Leads:</span>
            </span>
            <p className="text-xs font-sans text-zinc-300 leading-relaxed">
              {report.investigator_notes}
            </p>
          </div>

          {/* Next Chapter CTA */}
          <div className="p-4 rounded-2xl bg-[#0d0d14] border border-zinc-800 flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-zinc-400">
              Next: 4:40–4:50 Generate Complete Forensic Package
            </span>
            <button
              onClick={onNext}
              className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Continue to Step 10: Forensic Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {subTool === 'canvas_ela' && (
        <ForensicCanvasLab
          mediaUrl={intake.previewUrl}
          evidenceId={report.case_summary.evidence_id}
          originEchoDescription={report.origin_echo?.unmanipulated_scene_description}
        />
      )}

      {subTool === 'audio_meta' && (
        <div className="space-y-6">
          <MetadataInspector intake={intake} technicalMetrics={report.technical_metrics} />
          <AudioForensicLab status={report.context_integrity_check.audio_integrity_status} />
        </div>
      )}

      {subTool === 'copilot' && (
        <ForensicCopilotChat report={report} intake={intake} imageBase64={imageBase64} />
      )}
    </div>
  );
};
