import React from 'react';
import {
  FileText,
  Camera,
  MapPin,
  Cpu,
  AlertTriangle,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { MediaIntakeData, TechnicalForensicMetrics } from '../types';

interface MetadataInspectorProps {
  intake: MediaIntakeData;
  technicalMetrics?: TechnicalForensicMetrics;
}

export const MetadataInspector: React.FC<MetadataInspectorProps> = ({
  intake,
  technicalMetrics,
}) => {
  const exif = intake.exifData || {};
  const hasExif = Object.keys(exif).length > 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-zinc-800 text-purple-400">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-mono font-black tracking-wider text-white uppercase">
            DEEP METADATA &amp; CONTAINER PROVENANCE
          </h3>
        </div>
        <span className="text-xs font-mono text-zinc-400">EXIF / XMP / Container Stream</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {/* File Stream Attributes */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block flex items-center gap-1.5 pb-1 border-b border-zinc-900">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>FILE CHARACTERISTICS</span>
          </span>

          <div className="space-y-2 text-zinc-300">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-400">Filename:</span>
              <span className="font-bold truncate max-w-[160px] text-white">{intake.fileName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-400">Byte Size:</span>
              <span className="text-white">{(intake.fileSize / 1024).toFixed(1)} KB ({intake.fileSize} bytes)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-400">Container:</span>
              <span className="uppercase text-purple-300 font-bold">{intake.mediaType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-400">Timestamp:</span>
              <span className="text-xs text-zinc-400">{intake.uploadTimestamp}</span>
            </div>
          </div>
        </div>

        {/* Camera / Hardware Tags */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block flex items-center gap-1.5 pb-1 border-b border-zinc-900">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>EXIF SENSOR TAGS</span>
          </span>

          {hasExif ? (
            <div className="space-y-2 text-zinc-300">
              {Object.entries(exif).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">{key}:</span>
                  <span className="font-bold text-white text-right truncate max-w-[160px]">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-zinc-400 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1.5 opacity-80" />
              <span>EXIF hardware tags stripped or wiped during re-compression.</span>
            </div>
          )}
        </div>

        {/* Technical Forensics Metrics */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block flex items-center gap-1.5 pb-1 border-b border-zinc-900">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>DIGITAL ANOMALY INDICES</span>
          </span>

          {technicalMetrics ? (
            <div className="space-y-1.5 text-zinc-300">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Synthetic AI Prob:</span>
                <span className={`font-bold ${technicalMetrics.synthetic_probability_score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {technicalMetrics.synthetic_probability_score}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Manipulation Conf:</span>
                <span className="font-bold text-amber-400">{technicalMetrics.manipulation_confidence}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Lighting Consistency:</span>
                <span className="font-bold text-zinc-200">{technicalMetrics.lighting_vector_consistency}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Chromatic Aberration:</span>
                <span className="font-bold text-zinc-200">{technicalMetrics.chromatic_aberration_consistency}</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-zinc-400 text-xs">
              <span>Run forensic pipeline to generate quantitative anomaly indicators.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
