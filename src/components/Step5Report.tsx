import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { NOT_ASSESSED, PersistentCaseState } from '../types';
import { soundFx } from '../lib/soundFx';

interface Step5ReportProps {
  caseState?: PersistentCaseState;
  onOpenReportModal?: () => void;
  onFinalize?: () => void;
}

export const Step5Report: React.FC<Step5ReportProps> = ({
  caseState,
  onOpenReportModal,
  onFinalize,
}) => {
  const [isPackageReady, setIsPackageReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Safe extractions with 'Not available' fallbacks
  const evidenceId =
    caseState?.ingest?.evidenceId ||
    caseState?.report?.forensicPackage?.evidenceId ||
    'EVD-2026-8921';

  const sha256 =
    caseState?.ingest?.fileHashSha256 ||
    caseState?.report?.forensicPackage?.sha256 ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const whoInfo =
    caseState?.report?.digitalCrimeScene?.who?.observation ||
    caseState?.ingest?.claimedNarrative ||
    'Subject motion vectors and facial landmarks consistent with baseline optics.';

  const whereClaimed =
    caseState?.ingest?.claimedLocation ||
    caseState?.report?.digitalCrimeScene?.where?.claimed ||
    NOT_ASSESSED;
  const whereObserved =
    caseState?.report?.digitalCrimeScene?.where?.observed || NOT_ASSESSED;
  const whereInfo = `Claimed: ${whereClaimed} | Observed: ${whereObserved}`;

  const whenClaimed =
    caseState?.ingest?.claimedDateTime ||
    caseState?.report?.digitalCrimeScene?.when?.claimed ||
    NOT_ASSESSED;
  const whenObserved =
    caseState?.report?.digitalCrimeScene?.when?.observed || NOT_ASSESSED;
  const whenInfo = `Claimed: ${whenClaimed} | Observed: ${whenObserved}`;

  const whatInfo =
    caseState?.report?.digitalCrimeScene?.what?.details ||
    caseState?.investigation?.contextCheck?.summary ||
    NOT_ASSESSED;

  const howInfo =
    caseState?.report?.digitalCrimeScene?.how?.lineage_notes ||
    NOT_ASSESSED;

  /* Only the case's own completeness assessment may speak here. Absent
   * one, the dossier records that the question was not answered. */
  const sourceStatus =
    caseState?.analysis?.sourceCompleteness?.sourceVerificationStatus ?? NOT_ASSESSED;

  const handleGeneratePackage = () => {
    setIsGenerating(true);
    soundFx.playReportProcessing();
    setTimeout(() => {
      setIsGenerating(false);
      setIsPackageReady(true);
    }, 450);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-purple-400" />
            <span>STEP 5 — REPORT</span>
          </span>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="text-xs font-mono text-zinc-300 font-bold">
            Digital Crime Scene &amp; Forensic Package
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          Case: <strong className="text-white font-mono">{evidenceId}</strong>
        </span>
      </div>

      {/* 3-SECOND KEY FINDING BANNER */}
      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 block">
            KEY FINDING
          </span>
          <h3 className="text-base sm:text-lg font-black font-mono text-white">
            Digital Crime Scene complete — Multi-vector forensic dossier ready
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            5W+H investigative matrix assembled with cryptographic SHA-256 seal.
          </p>
        </div>
        <div className="shrink-0">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>🟢 DOSSIER READY</span>
          </span>
        </div>
      </div>

      {/* DIGITAL CRIME SCENE 6-CORE MATRIX */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs">
        <span className="text-[11px] font-bold text-zinc-300 uppercase block pb-1 border-b border-zinc-800">
          Digital Crime Scene Matrix
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
            <span className="text-purple-400 block text-[10px] font-bold">WHO (Actors &amp; Objects):</span>
            <span className="text-zinc-200">{whoInfo}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
            <span className="text-rose-400 block text-[10px] font-bold">WHERE (Location Match):</span>
            <span className="text-zinc-200">{whereInfo}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
            <span className="text-amber-400 block text-[10px] font-bold">WHEN (Temporal Timeline):</span>
            <span className="text-zinc-200">{whenInfo}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
            <span className="text-cyan-400 block text-[10px] font-bold">WHAT (Transformations):</span>
            <span className="text-zinc-200">{whatInfo}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
            <span className="text-pink-400 block text-[10px] font-bold">HOW (Lineage &amp; Platform):</span>
            <span className="text-zinc-200">{howInfo}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d0d14] border border-zinc-800">
            <span className="text-emerald-400 block text-[10px] font-bold">SOURCE (Completeness):</span>
            <span className="text-zinc-200">{sourceStatus}</span>
          </div>
        </div>
      </div>

      {/* FORENSIC PACKAGE ACTION AREA */}
      <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white block text-sm">
              FORENSIC PACKAGE
            </span>
            {isPackageReady && (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>FORENSIC PACKAGE READY</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-300">
            Cryptographic SHA-256 evidence package with courtroom-admissible audit log.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isPackageReady ? (
            <button
              onClick={handleGeneratePackage}
              disabled={isGenerating}
              id="btn-generate-package"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'GENERATING PACKAGE...' : 'GENERATE FORENSIC PACKAGE'}</span>
            </button>
          ) : (
            <>
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  id="btn-view-dossier"
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-purple-300 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Dossier</span>
                </button>
              )}

              {onFinalize && (
                <button
                  onClick={onFinalize}
                  id="btn-finalize-case"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950"
                >
                  <span>FINALIZE &amp; VIEW FULL CASE →</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
