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

/** The limit the dropzone advertises, now actually enforced. */
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const ACCEPTED_TYPE_PREFIXES = ['image/', 'video/'];

interface Step1IngestProps {
  onComplete: (intake: MediaIntakeData, imageBase64?: string, mimeType?: string) => void;
  initialIntake?: MediaIntakeData;
  isAnalysing?: boolean;
}

export const Step1Ingest: React.FC<Step1IngestProps> = ({
  onComplete,
  initialIntake,
  isAnalysing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* G2: every field below starts empty. It previously opened pre-filled with
   * a tsunami filename, a Jakarta location, a benchmark preview raster and a
   * hash of e3b0c442…b855 — which is the SHA-256 of the empty string, shown
   * beside a green VERIFIED chip. That was a fabricated measurement on the
   * first screen of the application. Demo Mode still loads a benchmark, but
   * only when the investigator explicitly picks one. */
  const [fileName, setFileName] = useState(initialIntake?.fileName || '');
  const [fileSize, setFileSize] = useState(initialIntake?.fileSize || 0);
  const [fileHash, setFileHash] = useState(initialIntake?.fileHashSha256 || '');
  const [previewUrl, setPreviewUrl] = useState(initialIntake?.previewUrl || '');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [exifTags, setExifTags] = useState<Record<string, any>>(initialIntake?.exifData || {});

  const [claimedLocation, setClaimedLocation] = useState(initialIntake?.claimedLocation || '');
  const [claimedDateTime, setClaimedDateTime] = useState(initialIntake?.claimedDateTime || '');
  const [claimedNarrative, setClaimedNarrative] = useState(initialIntake?.claimedNarrative || '');
  const [sourcePlatform, setSourcePlatform] = useState(initialIntake?.sourcePlatform || '');
  const [sourceUrl, setSourceUrl] = useState(initialIntake?.sourceUrl || '');
  const [isPrecomputed, setIsPrecomputed] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [mimeType, setMimeType] = useState<string>('');
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('');

  /** Promisified FileReader. The callback form cannot be awaited, and the
   *  original code did not try — it cleared the "computing" flag while both
   *  reads were still outstanding. */
  const readAs = <T extends string | ArrayBuffer>(
    file: File,
    as: 'dataURL' | 'arrayBuffer'
  ): Promise<T> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as T);
      reader.onerror = () => reject(reader.error ?? new Error('File could not be read.'));
      if (as === 'dataURL') reader.readAsDataURL(file);
      else reader.readAsArrayBuffer(file);
    });

  const handleFile = async (file: File) => {
    if (!file) return;

    // G23: the dropzone advertises a limit, so enforce it before hashing.
    if (file.size > MAX_FILE_BYTES) {
      setIntakeError(
        `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_FILE_BYTES)}.`
      );
      return;
    }
    if (!ACCEPTED_TYPE_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      setIntakeError(
        `${file.name} is ${file.type || 'of an unrecognised type'}. Accepted: image or video files.`
      );
      return;
    }

    setIntakeError(null);
    setFileName(file.name);
    setFileSize(file.size);
    // G17: the server must not have to guess the mime type.
    setMimeType(file.type);
    setIsComputingHash(true);

    try {
      /* G24: all three reads settle before the UI stops saying COMPUTING.
       * Previously the hash chip flipped to VERIFIED while imageBase64 was
       * still undefined — submitting in that window posted the claimed
       * context with no image, and the model answered about a picture it
       * had never received. */
      const [hash, dataUrl, buffer] = await Promise.all([
        calculateSha256(file),
        readAs<string>(file, 'dataURL'),
        readAs<ArrayBuffer>(file, 'arrayBuffer'),
      ]);

      setFileHash(hash);
      setPreviewUrl(dataUrl);
      setImageBase64(dataUrl);
      setExifTags(extractExifFromDataView(new DataView(buffer)));
    } catch (err) {
      console.error('Error processing file intake:', err);
      setIntakeError(
        `${file.name} could not be read. Try re-selecting the file.`
      );
      // Leave nothing half-populated: a stale hash beside a new file name
      // would be a fabricated measurement.
      setFileHash('');
      setPreviewUrl('');
      setImageBase64(undefined);
      setMimeType('');
      setExifTags({});
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
      /* Demo Mode. The badge is not decoration: these previews are SVG
       * fixtures, not photographs, and the case must never be mistaken for
       * a live result. */
      setIsPrecomputed(true);
      setImageBase64(undefined);
      setMimeType('');
      setIntakeError(null);
    }
  };

  const hasMedia = Boolean(fileHash && (imageBase64 || isPrecomputed));
  const canSubmit = hasMedia && !isComputingHash && !isAnalysing;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setIntakeError('Select a media file, or choose a benchmark case, before completing Step 1.');
      return;
    }
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

    // G22/G17: both the bytes and the mime type reach the caller.
    onComplete(intakeData, imageBase64, mimeType);
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
            <option value="">- none (live intake) -</option>
            {BENCHMARK_CASES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* INTAKE STATUS. Reports what has actually happened to the file.
          Nothing here may read as a verdict before a file exists. */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
          hasMedia ? 'bg-purple-950/40 border-purple-500/50' : 'bg-zinc-950/60 border-zinc-800'
        }`}
      >
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
            INTAKE STATUS
          </span>
          <h3 className="text-base sm:text-lg font-black font-mono text-white">
            {isComputingHash
              ? 'Hashing and reading file…'
              : hasMedia
              ? 'Media loaded & SHA-256 computed in this browser'
              : 'No media loaded'}
          </h3>
          <p className="text-xs text-zinc-300 font-sans">
            {hasMedia ? (
              <>
                Evidence record: <strong className="text-white font-mono">{fileName}</strong>
                {fileSize > 0 && <> ({formatBytes(fileSize)})</>}
              </>
            ) : (
              <>Drop a file to hash and inspect it locally. Nothing is uploaded until you complete this step.</>
            )}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          {isPrecomputed && (
            <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-950 border border-amber-600 text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>PRECOMPUTED REFERENCE CASE</span>
            </span>
          )}
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
              hasMedia
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-zinc-900 border border-dashed border-zinc-700 text-zinc-500'
            }`}
          >
            {hasMedia ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
            <span>{hasMedia ? 'READY FOR INGEST' : 'AWAITING MEDIA'}</span>
          </span>
        </div>
      </div>

      {/* Intake rejection: size, type, or an unreadable file. */}
      {intakeError && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2.5 text-rose-200 font-mono text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block text-rose-100">FILE REJECTED</strong>
            <span className="text-rose-300 font-sans">{intakeError}</span>
          </div>
          <button
            type="button"
            onClick={() => setIntakeError(null)}
            className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/60 font-bold cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

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
                  <div className="text-zinc-600 font-mono text-xs">NOT_ASSESSED — no media loaded</div>
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
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                    isComputingHash
                      ? 'bg-zinc-900 border-zinc-700 text-amber-300'
                      : fileHash
                      ? 'bg-zinc-900 border-zinc-700 text-emerald-400'
                      : 'bg-zinc-900 border-dashed border-zinc-700 text-zinc-500'
                  }`}
                >
                  {isComputingHash ? 'COMPUTING…' : fileHash ? 'COMPUTED' : 'NOT ASSESSED'}
                </span>
              </div>
              <div
                className={`p-2 rounded bg-black border border-zinc-800 text-[10px] break-all select-all font-mono ${
                  fileHash ? 'text-zinc-300' : 'text-zinc-600'
                }`}
              >
                {fileHash || 'NOT_ASSESSED — no file hashed yet'}
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
            disabled={!canSubmit}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
              canSubmit
                ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span>
              {isAnalysing
                ? 'ANALYSING…'
                : isComputingHash
                ? 'READING FILE…'
                : 'COMPLETE STEP 1 & ANALYSE →'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
