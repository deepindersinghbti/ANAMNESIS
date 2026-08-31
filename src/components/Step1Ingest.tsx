import React, { useState, useRef } from 'react';
import {
  Upload,
  Hash,
  MapPin,
  Calendar,
  Globe,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { calculateSha256, extractExifFromDataView, formatBytes } from '../lib/cryptoUtils';
import { BENCHMARK_CASES } from '../data/benchmarkCases';
import { MediaIntakeData } from '../types';
import { soundFx } from '../lib/soundFx';

interface Step1IngestProps {
  onComplete: (intake: MediaIntakeData, imageBase64?: string) => void;
  initialIntake?: MediaIntakeData;
}

export const Step1Ingest: React.FC<Step1IngestProps> = ({
  onComplete,
  initialIntake,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState(initialIntake?.fileName || 'tsunami_jakarta_viral_clip.mp4');
  const [fileSize, setFileSize] = useState(initialIntake?.fileSize || 18432000);
  const [fileHash, setFileHash] = useState(
    initialIntake?.fileHashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
  const [previewUrl, setPreviewUrl] = useState(
    initialIntake?.previewUrl || BENCHMARK_CASES[0].intake.previewUrl
  );
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [exifTags, setExifTags] = useState<Record<string, any>>(initialIntake?.exifData || {});

  const [claimedLocation, setClaimedLocation] = useState(
    initialIntake?.claimedLocation || 'Jakarta Coast, Indonesia'
  );
  const [claimedDateTime, setClaimedDateTime] = useState(
    initialIntake?.claimedDateTime || '2026-08-14 09:30 UTC'
  );
  const [claimedNarrative, setClaimedNarrative] = useState(
    initialIntake?.claimedNarrative ||
      'Massive tsunami inundation hits central coastal infrastructure following 7.8M earthquake.'
  );
  const [sourcePlatform, setSourcePlatform] = useState(
    initialIntake?.sourcePlatform || 'X (Twitter) Viral Post'
  );
  const [sourceUrl, setSourceUrl] = useState(
    initialIntake?.sourceUrl || 'https://x.com/viral_news_tracker/status/1948201948'
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>(BENCHMARK_CASES[0].id);

  const handleFile = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    setIsComputingHash(true);

    try {
      const hash = await calculateSha256(file);
      setFileHash(hash);

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

  const handleSelectPreset = (caseId: string) => {
    setSelectedBenchmarkId(caseId);
    soundFx.playStartInvestigation();
    const benchmark = BENCHMARK_CASES.find((b) => b.id === caseId);
    if (benchmark) {
      setFileName(benchmark.intake.fileName);
      setFileSize(benchmark.intake.fileSize);
      setFileHash(benchmark.intake.fileHashSha256);
      setPreviewUrl(benchmark.intake.previewUrl);
      setClaimedLocation(benchmark.intake.claimedLocation);
      setClaimedDateTime(benchmark.intake.claimedDateTime);
      setClaimedNarrative(benchmark.intake.claimedNarrative);
      setSourcePlatform(benchmark.intake.sourcePlatform);
      setSourceUrl(benchmark.intake.sourceUrl || '');
      setExifTags(benchmark.intake.exifData || {});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evidenceId = initialIntake?.evidenceId || `EVD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const intakeData: MediaIntakeData = {
      evidenceId,
      title: fileName,
      mediaType: fileName.endsWith('.mp4') || fileName.endsWith('.mov') ? 'video' : 'image',
      mediaUrl: previewUrl,
      previewUrl,
      fileName,
      fileSize,
      fileHashSha256: fileHash,
      claimedLocation,
      claimedDateTime,
      claimedNarrative,
      sourcePlatform,
      sourceUrl,
      exifData: exifTags,
      uploadTimestamp: new Date().toISOString(),
    };

    onComplete(intakeData, imageBase64);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-purple-400" />
            <span>STEP 1 — INGEST</span>
          </span>
          <span className="text-zinc-600 text-xs">•</span>
          <span className="text-xs font-mono text-zinc-300 font-bold">
            Upload Suspicious Media
          </span>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">Benchmark:</span>
          <select
            id="benchmark-preset-select"
            value={selectedBenchmarkId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            aria-label="Select benchmark test scenario"
            className="text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
          >
            {BENCHMARK_CASES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-SECOND KEY FINDING BANNER */}
      <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 block">
            KEY FINDING
          </span>
          <h3 className="text-base sm:text-lg font-black font-mono text-white">
            Media target loaded &amp; SHA-256 cryptographically indexed
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            Ready to initialize evidence record: <strong className="text-white font-mono">{fileName}</strong> ({formatBytes(fileSize)})
          </p>
        </div>
        <div className="shrink-0">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>🟢 READY FOR INGEST</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Media File Upload / Dropzone & Preview */}
          <div className="lg:col-span-6 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              accept="image/*,video/*"
              aria-label="Upload suspicious media file"
            />

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-950/20'
                  : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/60'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-mono font-bold text-zinc-200">
                    Drop file here or <span className="text-purple-400 underline">browse</span>
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">
                    MP4, MOV, JPG, PNG (Max 100MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence Preview Box */}
            <div className="rounded-xl border border-zinc-800 bg-black p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>PREVIEW RASTER</span>
                <span className="text-zinc-400 font-bold">{fileName}</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Evidence Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-zinc-400 font-mono text-xs">No media loaded</div>
                )}
              </div>
            </div>

            {/* Cryptographic Hash Digest */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300 font-bold text-[11px]">
                  <Hash className="w-3.5 h-3.5 text-purple-400" />
                  <span>SHA-256 Hash Digest:</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold">
                  {isComputingHash ? 'COMPUTING...' : 'VERIFIED'}
                </span>
              </div>
              <div className="p-2 rounded bg-black border border-zinc-800 text-[10px] text-zinc-300 break-all select-all font-mono">
                {fileHash}
              </div>
            </div>
          </div>

          {/* Right Column: Claimed Context Metadata Form */}
          <div className="lg:col-span-6 space-y-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-3 font-mono text-xs">
              <span className="text-[11px] font-bold text-zinc-300 uppercase block pb-1 border-b border-zinc-800">
                Claimed Context &amp; Dissemination
              </span>

              {/* Claimed Location */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span>Claimed Geolocation:</span>
                </label>
                <input
                  type="text"
                  value={claimedLocation}
                  onChange={(e) => setClaimedLocation(e.target.value)}
                  placeholder="e.g. Jakarta, Indonesia"
                  className="w-full text-xs bg-[#0d0d14] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Claimed Date / Time */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  <span>Claimed Date &amp; Time:</span>
                </label>
                <input
                  type="text"
                  value={claimedDateTime}
                  onChange={(e) => setClaimedDateTime(e.target.value)}
                  placeholder="e.g. 2026-08-14 09:30 UTC"
                  className="w-full text-xs bg-[#0d0d14] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Source Platform */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-purple-400" />
                  <span>Platform / Dissemination Channel:</span>
                </label>
                <input
                  type="text"
                  value={sourcePlatform}
                  onChange={(e) => setSourcePlatform(e.target.value)}
                  placeholder="e.g. X (Twitter), Telegram, WhatsApp"
                  className="w-full text-xs bg-[#0d0d14] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Claimed Viral Narrative */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 block">
                  Viral Caption / Claim:
                </label>
                <textarea
                  rows={2}
                  value={claimedNarrative}
                  onChange={(e) => setClaimedNarrative(e.target.value)}
                  placeholder="Accompanying caption..."
                  className="w-full text-xs font-sans bg-[#0d0d14] border border-zinc-800 rounded-lg p-2 text-zinc-200 outline-none focus:border-purple-500 resize-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Complete Step 1 Button */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
          <button
            type="submit"
            id="btn-complete-step1"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>COMPLETE STEP 1 →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
