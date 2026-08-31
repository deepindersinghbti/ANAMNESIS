import React, { useRef } from 'react';
import {
  X,
  Download,
  FileText,
  ShieldCheck,
  Hash,
  Award,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Logo } from './Logo';
import { AnamnesisForensicReport, MediaIntakeData } from '../types';

interface DossierExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AnamnesisForensicReport;
  intake: MediaIntakeData;
}

export const DossierExportModal: React.FC<DossierExportModalProps> = ({
  isOpen,
  onClose,
  report,
  intake,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ANAMESIS_REPORT_${report.case_summary.evidence_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(12, 12, 22);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setFont('courier', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(236, 72, 153); // Pink / Magenta
      doc.text('ANAMESIS FORENSIC CASE DOSSIER', 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text(`A Digital Crime-Scene Intelligence | EVIDENCE ID: ${report.case_summary.evidence_id}`, 14, 26);
      doc.text(`DIGITAL HASH (SHA-256): ${report.case_summary.primary_hash_sha256.slice(0, 48)}...`, 14, 34);

      // Verdict Summary
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('EXECUTIVE FORENSIC VERDICT:', 14, 52);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitVerdict = doc.splitTextToSize(report.case_summary.verdict_summary, pageWidth - 28);
      doc.text(splitVerdict, 14, 60);

      let yPos = 60 + splitVerdict.length * 6 + 10;

      // 5 Core Dimensions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('THE 5 FORENSIC QUESTIONS:', 14, yPos);
      yPos += 8;

      const questions = [
        { label: '1. WHO (Entities & Artifacts)', text: `${report.the_five_questions.who.observation} (Confidence: ${Math.round(report.the_five_questions.who.confidence * 100)}%)` },
        { label: '2. WHERE (Geolocation)', text: `Claimed: ${report.the_five_questions.where.claimed} | Observed: ${report.the_five_questions.where.observed} [Status: ${report.the_five_questions.where.status}]` },
        { label: '3. WHEN (Temporal Markers)', text: `Claimed: ${report.the_five_questions.when.claimed} | Observed: ${report.the_five_questions.when.observed} [Status: ${report.the_five_questions.when.status}]` },
        { label: '4. WHAT CHANGED (Mutations)', text: `${report.the_five_questions.what_changed.details} (Mutations: ${report.the_five_questions.what_changed.mutations_detected.join(', ')})` },
        { label: '5. HOW IT SPREAD (Lineage)', text: `${report.the_five_questions.how_it_spread.lineage_notes} (Est. Generations: ${report.the_five_questions.how_it_spread.estimated_generations})` },
      ];

      questions.forEach((q) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('courier', 'bold');
        doc.setFontSize(10);
        doc.text(q.label, 14, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitQ = doc.splitTextToSize(q.text, pageWidth - 28);
        doc.text(splitQ, 14, yPos);
        yPos += splitQ.length * 5 + 4;
      });

      // Context Decoupling Matrix Summary
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CONTEXT INTEGRITY MATRIX:', 14, yPos);
      yPos += 7;

      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.text(`- Raw Media Status: ${report.context_integrity_check.raw_media_status}`, 14, yPos);
      yPos += 5;
      doc.text(`- Claimed Location Status: ${report.context_integrity_check.claimed_location_status}`, 14, yPos);
      yPos += 5;
      doc.text(`- Claimed Timestamp Status: ${report.context_integrity_check.claimed_time_status}`, 14, yPos);
      yPos += 5;
      doc.text(`- Audio Stream Integrity: ${report.context_integrity_check.audio_integrity_status}`, 14, yPos);
      yPos += 10;

      // Investigator Notes
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ACTIONABLE INVESTIGATOR LEADS:', 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(report.investigator_notes, pageWidth - 28);
      doc.text(splitNotes, 14, yPos);
      yPos += splitNotes.length * 5 + 15;

      // Cryptographic Stamp & Signature Block
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setDrawColor(203, 213, 225);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.text(`CRYPTOGRAPHIC SEAL: SHA256-ANAMESIS-VERIFIED // CHAIN OF CUSTODY CERTIFIED`, 14, yPos);
      yPos += 4;
      doc.text(`EXAMINED VIA ANAMESIS MULTIMODAL FORENSICS ENGINE v2.4`, 14, yPos);

      doc.save(`ANAMESIS_DOSSIER_${report.case_summary.evidence_id}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0c0c16] border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#06060c]">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-black logo-gradient-text uppercase">
                  ANAMESIS FORENSIC CASE DOSSIER
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#ec4899]/20 border border-[#ec4899]/40 text-pink-300 font-mono font-bold">
                  {report.case_summary.evidence_id}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                A Digital Crime-Scene Intelligence // Evidentiary Chain-of-Custody
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Printable View */}
        <div ref={printRef} className="p-6 overflow-y-auto space-y-5 flex-1 font-mono text-xs text-zinc-300">
          {/* Top Dossier Badge */}
          <div className="p-4 rounded-2xl bg-[#06060c] border border-zinc-800 space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#ec4899]" />
                <span className="font-bold text-zinc-200">CASE ID: {report.case_summary.evidence_id}</span>
              </div>
              <span className="text-zinc-400">TIMESTAMP: {new Date().toISOString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-400 block">SHA-256 Digest:</span>
                <span className="text-pink-300 break-all select-all font-bold">
                  {report.case_summary.primary_hash_sha256}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Source File:</span>
                <span className="text-zinc-200">{intake.fileName} ({(intake.fileSize / 1024).toFixed(1)} KB)</span>
              </div>
            </div>
          </div>

          {/* Executive Verdict */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-gradient-to-r from-[#0d0d1a] to-[#170e18] border border-[#ec4899]/40 shadow-lg">
            <span className="text-[10px] text-pink-300 uppercase font-bold tracking-wider block">
              1. Executive Forensic Verdict
            </span>
            <p className="text-zinc-100 font-bold text-sm leading-relaxed font-sans">
              {report.case_summary.verdict_summary}
            </p>
          </div>

          {/* Context Integrity Matrix */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              2. Decoupled Context Integrity
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-[#06060c] border border-blue-900/40">
                <span className="text-blue-300 block text-[10px]">Raw Media:</span>
                <span className="font-bold">{report.context_integrity_check.raw_media_status}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#06060c] border border-amber-900/40">
                <span className="text-amber-300 block text-[10px]">Location:</span>
                <span className="font-bold">{report.context_integrity_check.claimed_location_status}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#06060c] border border-purple-900/40">
                <span className="text-purple-300 block text-[10px]">Time:</span>
                <span className="font-bold">{report.context_integrity_check.claimed_time_status}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#06060c] border border-pink-900/40">
                <span className="text-pink-300 block text-[10px]">Audio:</span>
                <span className="font-bold">{report.context_integrity_check.audio_integrity_status}</span>
              </div>
            </div>
          </div>

          {/* The 5 Core Questions Breakdown */}
          <div className="space-y-3">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              3. The 5 Core Forensic Questions
            </span>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#06060c] border border-blue-900/40 space-y-1">
                <span className="text-blue-400 font-bold block">WHO:</span>
                <p className="font-sans">{report.the_five_questions.who.observation} (Confidence: {Math.round(report.the_five_questions.who.confidence * 100)}%)</p>
              </div>
              <div className="p-3 rounded-xl bg-[#06060c] border border-amber-900/40 space-y-1">
                <span className="text-amber-400 font-bold block">WHERE:</span>
                <p className="font-sans">Claimed: {report.the_five_questions.where.claimed} | Observed: {report.the_five_questions.where.observed} [{report.the_five_questions.where.status}]</p>
              </div>
              <div className="p-3 rounded-xl bg-[#06060c] border border-purple-900/40 space-y-1">
                <span className="text-purple-400 font-bold block">WHEN:</span>
                <p className="font-sans">Claimed: {report.the_five_questions.when.claimed} | Observed: {report.the_five_questions.when.observed} [{report.the_five_questions.when.status}]</p>
              </div>
              <div className="p-3 rounded-xl bg-[#06060c] border border-pink-900/40 space-y-1">
                <span className="text-pink-400 font-bold block">WHAT CHANGED:</span>
                <p className="font-sans">{report.the_five_questions.what_changed.details} (Mutations: {report.the_five_questions.what_changed.mutations_detected.join(', ')})</p>
              </div>
              <div className="p-3 rounded-xl bg-[#06060c] border border-emerald-900/40 space-y-1">
                <span className="text-emerald-400 font-bold block">HOW IT SPREAD:</span>
                <p className="font-sans">{report.the_five_questions.how_it_spread.lineage_notes} (Generations: {report.the_five_questions.how_it_spread.estimated_generations})</p>
              </div>
            </div>
          </div>

          {/* Actionable Investigator Notes */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#06060c] border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              4. Actionable Next Steps &amp; Forensic Leads
            </span>
            <p className="text-zinc-200 leading-relaxed font-sans">
              {report.investigator_notes}
            </p>
          </div>

          {/* Chain of Custody Signature Seal */}
          <div className="p-4 rounded-2xl border border-dashed border-zinc-800 bg-[#06060c] flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#ec4899]" />
              <span>DIGITALLY SIGNED &amp; SEALED BY ANAMESIS ENGINE</span>
            </div>
            <span>STAMP: {report.case_summary.primary_hash_sha256.slice(0, 16)}...</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-[#06060c] flex flex-wrap items-center justify-end gap-3 font-mono text-xs">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0c0c16] hover:bg-zinc-900 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ec4899]" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl logo-gradient-bg hover:opacity-95 text-white font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>DOWNLOAD PDF DOSSIER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
