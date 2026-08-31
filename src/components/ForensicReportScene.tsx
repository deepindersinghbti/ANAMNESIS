import React from 'react';
import {
  FileCheck,
  Hash,
  FileText,
  ShieldCheck,
  Download,
  Share2,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AnamnesisForensicReport, MediaIntakeData } from '../types';

interface ForensicReportSceneProps {
  report: AnamnesisForensicReport;
  intake: MediaIntakeData;
  onOpenReportModal: () => void;
  onNext: () => void;
}

export const ForensicReportScene: React.FC<ForensicReportSceneProps> = ({
  report,
  intake,
  onOpenReportModal,
  onNext,
}) => {
  const summary = report.case_summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            <span>4:40–4:50 // SCENE 10: FORENSIC REPORT</span>
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">Cryptographically Sealed</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
          "Every step is recorded in a tamper-evident forensic package."
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Investigators can see what was analysed, what was found, and how every result was produced.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Forensic Package Breakdown Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>GENERATE FORENSIC PACKAGE (DOSSIER)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-purple-300">
                {summary.evidence_id}
              </span>
            </div>

            {/* Checklist of 7 Core Pillars */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">1. Evidence Identifier:</span>
                <span className="font-bold text-white">{summary.evidence_id}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">2. SHA-256 Digest:</span>
                  <span className="text-[10px] text-emerald-400 font-bold">256-BIT VERIFIED</span>
                </div>
                <p className="text-[11px] text-zinc-300 break-all select-all font-mono">
                  {summary.primary_hash_sha256}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">3. Decoupling Findings:</span>
                <span className="font-bold text-amber-400 truncate max-w-[220px]">
                  {summary.verdict_summary}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">4. Media Relationships:</span>
                <span className="text-purple-300 font-bold">14 Family Graph Nodes</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">5. Timeline Evolution:</span>
                <span className="text-white font-bold">
                  {report.forensic_replay_timeline.length} Mutation Stages
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">6. Confidence Scores:</span>
                <span className="text-emerald-400 font-bold">
                  {(report.the_five_questions.who.confidence * 100).toFixed(0)}% Overall Sensor Match
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">7. Processing Chain:</span>
                <span className="text-zinc-300 font-bold">ISO-17025 Compliant Trail</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Export Actions & Final Step */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" />
              <span>Export Dossier Artifacts</span>
            </h3>

            <p className="text-xs text-zinc-400 font-sans">
              Generate an official, court-admissible forensic PDF briefing or export machine-readable JSON telemetry for external intelligence databases.
            </p>

            <button
              id="generate-package-action-btn"
              onClick={onOpenReportModal}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FileCheck className="w-4 h-4" />
              <span>OPEN FORENSIC PACKAGE DOSSIER</span>
            </button>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs font-mono">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">
                Export Formats Included:
              </span>
              <p className="text-zinc-300 font-sans text-xs">
                • High-Resolution Forensic Summary Sheet<br />
                • JSON Evidence Telemetry with SHA-256 Signature<br />
                • Full 5-Question Integrity Matrix
              </p>
            </div>

            {/* Next Chapter CTA */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-400">
                Next: 4:50–5:00 The Final Line (Conclusion)
              </span>
              <button
                onClick={onNext}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Step 11: The Final Line</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
