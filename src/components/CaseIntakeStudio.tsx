import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSearch,
  Hash,
  MapPin,
  Calendar,
  AlertTriangle,
  Flame,
  Globe,
  Camera,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { calculateSha256, extractExifFromDataView, formatBytes } from '../lib/cryptoUtils';
import { BENCHMARK_CASES } from '../data/benchmarkCases';
import { BenchmarkCase, MediaIntakeData } from '../types';

interface CaseIntakeStudioProps {
  onAnalyze: (intake: MediaIntakeData, imageBase64?: string) => Promise<void>;
  onSelectBenchmark: (benchmark: BenchmarkCase) => void;
  isAnalyzing: boolean;
  activeIntake: MediaIntakeData | null;
}

export const CaseIntakeStudio: React.FC<CaseIntakeStudioProps> = ({
  onAnalyze,
  onSelectBenchmark,
  isAnalyzing,
  activeIntake,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState(activeIntake?.fileName || '');
  const [fileSize, setFileSize] = useState(activeIntake?.fileSize || 0);
  const [fileHash, setFileHash] = useState(activeIntake?.fileHashSha256 || '');
  const [previewUrl, setPreviewUrl] = useState(activeIntake?.previewUrl || '');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [exifTags, setExifTags] = useState<Record<string, any>>(activeIntake?.exifData || {});

  const [claimedLocation, setClaimedLocation] = useState(activeIntake?.claimedLocation || '');
  const [claimedDateTime, setClaimedDateTime] = useState(activeIntake?.claimedDateTime || '');
  const [claimedNarrative, setClaimedNarrative] = useState(activeIntake?.claimedNarrative || '');
  const [sourcePlatform, setSourcePlatform] = useState(activeIntake?.sourcePlatform || 'X (Twitter) Viral Post');
  const [sourceUrl, setSourceUrl] = useState(activeIntake?.sourceUrl || '');
  const [customNotes, setCustomNotes] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [isComputingHash, setIsComputingHash] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setIsComputingHash(true);

    try {
      // 1. Calculate Real SHA-256
      const hash = await calculateSha256(file);
      setFileHash(hash);

      // 2. Read as Data URL & ArrayBuffer for EXIF
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setImageBase64(result);
      };
      reader.readAsDataURL(file);

      const bufferReader = new FileReader();
      bufferReader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        if (buffer) {
          const dataView = new DataView(buffer);
          const parsed = extractExifFromDataView(dataView);
          setExifTags(parsed);
        }
      };
      bufferReader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error processing file intake:', err);
    } finally {
      setIsComputingHash(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    const intake: MediaIntakeData = {
      evidenceId: `ANAM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: claimedNarrative ? claimedNarrative.slice(0, 50) + '...' : fileName || 'Evidence Ingest',
      mediaType: fileName.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
      mediaUrl: previewUrl,
      previewUrl: previewUrl,
      fileName: fileName || 'unknown_evidence.jpg',
      fileSize: fileSize || 102400,
      fileHashSha256: fileHash || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      claimedLocation: claimedLocation || 'Unspecified Location',
      claimedDateTime: claimedDateTime || 'Unspecified Timestamp',
      claimedNarrative: claimedNarrative || 'No descriptive narrative provided with submission.',
      sourcePlatform: sourcePlatform || 'Direct Intake',
      sourceUrl: sourceUrl,
      exifData: exifTags,
      uploadTimestamp: new Date().toISOString(),
    };

    onAnalyze(intake, imageBase64);
  };

  return (
    <div className="space-y-6">
      {/* Benchmark Cases Dropdown Selector */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-mono font-black tracking-wider text-white uppercase">
              LOAD PRESET BENCHMARK SCENARIO
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Select a scenario to test forensic verification</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            id="benchmark-case-select"
            defaultValue=""
            onChange={(e) => {
              const selected = BENCHMARK_CASES.find((b) => b.id === e.target.value);
              if (selected) {
                onSelectBenchmark(selected);
              }
            }}
            className="flex-1 bg-[#12121e] border border-zinc-700 text-white font-mono text-xs font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="" disabled>
              -- Select a Benchmark Scenario to Test Pipeline --
            </option>
            {BENCHMARK_CASES.map((bCase) => (
              <option key={bCase.id} value={bCase.id} className="bg-[#12121e] text-white">
                [{bCase.intake.evidenceId}] {bCase.title} — {bCase.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Intake Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Media File Ingestion */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-mono font-black tracking-wider text-white uppercase">
                  1. EVIDENCE FILE INGEST
                </h3>
              </div>
              {fileHash && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> SHA-256 Ready
                </span>
              )}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px] ${
                isDragging
                  ? 'border-purple-500 bg-purple-950/20'
                  : previewUrl
                  ? 'border-zinc-700 bg-zinc-950'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {previewUrl ? (
                <div className="w-full space-y-3">
                  <div className="relative max-h-44 mx-auto rounded-lg overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Evidence Preview"
                      className="max-h-44 w-auto object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-zinc-800">
                      {formatBytes(fileSize)}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono truncate">{fileName}</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-purple-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-white">
                      Drop evidence file here or browse
                    </p>
                    <p className="text-xs text-zinc-400 font-sans">
                      Images (JPG, PNG, WEBP), Videos, Audio files
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Cryptographic Hash Verification Box */}
            <div className="space-y-2 rounded-xl bg-zinc-950 p-3.5 border border-zinc-800/90 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
                  <Hash className="w-3.5 h-3.5 text-purple-400" />
                  <span>SHA-256 HASH</span>
                </span>
                {isComputingHash ? (
                  <span className="text-amber-400 animate-pulse text-xs">Computing...</span>
                ) : fileHash ? (
                  <span className="text-emerald-400 text-xs font-bold">VERIFIED 256-BIT</span>
                ) : (
                  <span className="text-zinc-500 text-xs">Pending file</span>
                )}
              </div>
              <p className="text-xs text-zinc-300 break-all bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 font-mono select-all">
                {fileHash || 'Awaiting file ingestion to compute cryptographic digest...'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Claimed Context & Narrative Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-black tracking-wider text-white uppercase">
                2. CLAIMED NARRATIVE &amp; CONTEXT
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Specify what the source claims about this media to enable rigorous context-decoupling analysis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Claimed Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Claimed Location</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Santa Barbara Coast, California, USA"
                  value={claimedLocation}
                  onChange={(e) => setClaimedLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none text-zinc-100 text-xs font-mono placeholder:text-zinc-600 transition-colors"
                />
              </div>

              {/* Claimed Date / Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Claimed Date / Timestamp</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. August 23, 2026 — 14:30 PST"
                  value={claimedDateTime}
                  onChange={(e) => setClaimedDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none text-zinc-100 text-xs font-mono placeholder:text-zinc-600 transition-colors"
                />
              </div>

              {/* Source Platform Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>Source Platform</span>
                </label>
                <select
                  value={sourcePlatform}
                  onChange={(e) => setSourcePlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none text-zinc-100 text-xs font-mono cursor-pointer"
                >
                  <option value="X (Twitter) Viral Post">X (Twitter) Viral Post</option>
                  <option value="Telegram Channel / Group">Telegram Channel / Group</option>
                  <option value="TikTok Viral Video">TikTok Viral Video</option>
                  <option value="Reddit Discussion Thread">Reddit Discussion Thread</option>
                  <option value="Direct Whistleblower Intake">Direct Whistleblower Intake</option>
                  <option value="News Media Broadcast">News Media Broadcast</option>
                </select>
              </div>

              {/* Origin Post / Reference URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-pink-400" />
                  <span>Source URL / Channel Handle</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://x.com/breaking_news/status/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none text-zinc-100 text-xs font-mono placeholder:text-zinc-600 transition-colors"
                />
              </div>
            </div>

            {/* Claimed Caption / Narrative Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Claimed Caption / Headline / Narrative Text</span>
              </label>
              <textarea
                rows={3}
                placeholder="Paste the accompanying claim, headline, or tweet text exactly as posted..."
                value={claimedNarrative}
                onChange={(e) => setClaimedNarrative(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none text-zinc-100 text-xs font-mono placeholder:text-zinc-600 leading-relaxed transition-colors"
              />
            </div>

            {/* Investigator Annotations */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Investigator Case Notes / Hypothesis (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Check for solar shadow azimuth mismatch or splice boundaries"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none text-zinc-100 text-xs font-mono placeholder:text-zinc-600 transition-colors"
              />
            </div>

            {/* Execute Analysis Action */}
            <div className="pt-2">
              <button
                id="execute-forensic-btn"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || !previewUrl}
                className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>EXECUTING FORENSIC DECOUPLING PIPELINE...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>LAUNCH FORENSIC INVESTIGATION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
