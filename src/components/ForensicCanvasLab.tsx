import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Sliders,
  Crosshair,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  Sun,
  Scan,
} from 'lucide-react';
import {
  computeELA,
  computeNoiseAnalysis,
  computeSobelEdges,
  computeLuminance,
  computeInverted,
  computeSolarize,
  computeBlueChannel,
} from '../lib/imageForensics';
import { ForensicFilterMode } from '../types';

interface ForensicCanvasLabProps {
  mediaUrl: string;
  evidenceId: string;
  originEchoDescription?: string;
}

interface ShadowRay {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id: string;
  color: string;
}

export const ForensicCanvasLab: React.FC<ForensicCanvasLabProps> = ({
  mediaUrl,
  evidenceId,
  originEchoDescription,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeFilter, setActiveFilter] = useState<ForensicFilterMode['id']>('raw');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Split Wipe Slider (0 to 100%)
  const [showSplitSlider, setShowSplitSlider] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);

  // ELA Configs
  const [elaQuality, setElaQuality] = useState(0.75);
  const [elaScale, setElaScale] = useState(20);

  // Shadow Ray Tool
  const [isDrawingRays, setIsDrawingRays] = useState(false);
  const [shadowRays, setShadowRays] = useState<ShadowRay[]>([]);
  const [currentRay, setCurrentRay] = useState<{ startX: number; startY: number } | null>(null);

  // Inspector Pixel Data
  const [inspectData, setInspectData] = useState<{
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
    hex: string;
  } | null>(null);

  // Load Source Image onto Raw Canvas
  useEffect(() => {
    if (!mediaUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const rawCanvas = rawCanvasRef.current;
      const displayCanvas = displayCanvasRef.current;
      if (!rawCanvas || !displayCanvas) return;

      rawCanvas.width = img.naturalWidth || 800;
      rawCanvas.height = img.naturalHeight || 500;
      displayCanvas.width = rawCanvas.width;
      displayCanvas.height = rawCanvas.height;

      const rawCtx = rawCanvas.getContext('2d');
      if (rawCtx) {
        rawCtx.drawImage(img, 0, 0);
      }

      applyFilter(activeFilter);
    };
    img.src = mediaUrl;
  }, [mediaUrl]);

  // Re-apply filter when settings change
  useEffect(() => {
    applyFilter(activeFilter);
  }, [activeFilter, elaQuality, elaScale]);

  const applyFilter = async (filterId: ForensicFilterMode['id']) => {
    const rawCanvas = rawCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    if (!rawCanvas || !displayCanvas) return;

    const displayCtx = displayCanvas.getContext('2d');
    const rawCtx = rawCanvas.getContext('2d');
    if (!displayCtx || !rawCtx) return;

    setIsProcessing(true);

    try {
      if (filterId === 'raw') {
        displayCtx.drawImage(rawCanvas, 0, 0);
      } else if (filterId === 'ela') {
        const elaData = await computeELA(rawCanvas, {
          quality: elaQuality,
          scaleMultiplier: elaScale,
        });
        displayCtx.putImageData(elaData, 0, 0);
      } else if (filterId === 'noise') {
        const noiseData = computeNoiseAnalysis(rawCanvas);
        displayCtx.putImageData(noiseData, 0, 0);
      } else if (filterId === 'sobel') {
        const sobelData = computeSobelEdges(rawCanvas);
        displayCtx.putImageData(sobelData, 0, 0);
      } else if (filterId === 'luminance') {
        const lumData = computeLuminance(rawCanvas);
        displayCtx.putImageData(lumData, 0, 0);
      } else if (filterId === 'inverted') {
        const invData = computeInverted(rawCanvas);
        displayCtx.putImageData(invData, 0, 0);
      } else if (filterId === 'solarize') {
        const solData = computeSolarize(rawCanvas);
        displayCtx.putImageData(solData, 0, 0);
      } else if (filterId === 'blue_channel') {
        const blueData = computeBlueChannel(rawCanvas);
        displayCtx.putImageData(blueData, 0, 0);
      }
    } catch (err) {
      console.error('Filter application error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Canvas Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawingRays) {
      const rect = displayCanvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * (displayCanvasRef.current?.width || 1);
      const y = ((e.clientY - rect.top) / rect.height) * (displayCanvasRef.current?.height || 1);
      setCurrentRay({ startX: x, startY: y });
    } else {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning && !isDrawingRays) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }

    // Inspect Pixel Under Cursor
    const displayCanvas = displayCanvasRef.current;
    if (displayCanvas) {
      const rect = displayCanvas.getBoundingClientRect();
      const scaleX = displayCanvas.width / rect.width;
      const scaleY = displayCanvas.height / rect.height;
      const px = Math.floor((e.clientX - rect.left) * scaleX);
      const py = Math.floor((e.clientY - rect.top) * scaleY);

      if (px >= 0 && px < displayCanvas.width && py >= 0 && py < displayCanvas.height) {
        const ctx = displayCanvas.getContext('2d');
        if (ctx) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
          setInspectData({ x: px, y: py, r: pixel[0], g: pixel[1], b: pixel[2], hex });
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawingRays && currentRay) {
      const rect = displayCanvasRef.current?.getBoundingClientRect();
      if (rect && displayCanvasRef.current) {
        const endX = ((e.clientX - rect.left) / rect.width) * displayCanvasRef.current.width;
        const endY = ((e.clientY - rect.top) / rect.height) * displayCanvasRef.current.height;
        const colors = ['#f97316', '#ec4899', '#3b82f6', '#10b981', '#fbbf24'];
        const randomColor = colors[shadowRays.length % colors.length];

        setShadowRays([
          ...shadowRays,
          {
            startX: currentRay.startX,
            startY: currentRay.startY,
            endX,
            endY,
            id: `ray-${Date.now()}`,
            color: randomColor,
          },
        ]);
      }
      setCurrentRay(null);
    }
    setIsPanning(false);
  };

  const handleResetView = () => {
    setZoomLevel(100);
    setPanOffset({ x: 0, y: 0 });
    setShadowRays([]);
  };

  const handleDownloadSnapshot = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ANAMNESIS_${evidenceId}_${activeFilter.toUpperCase()}_FILTER.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const FILTERS: { id: ForensicFilterMode['id']; label: string; desc: string; color: string }[] = [
    { id: 'raw', label: 'Source (Raw)', desc: 'Unprocessed intake pixel matrix', color: 'from-blue-500 to-indigo-500' },
    {
      id: 'ela',
      label: 'Error Level (ELA)',
      desc: 'Differential JPEG re-compression error; spliced regions glow brighter',
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 'sobel',
      label: 'Sobel Seam Edge',
      desc: 'Gradient boundary map exposing compositing edges and cloning seams',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      id: 'noise',
      label: 'Sensor Noise High-Pass',
      desc: '3x3 Laplacian isolating physical camera PRNU vs generative smoothing',
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'luminance',
      label: 'Luminance Gradients',
      desc: 'High-contrast lighting map for shadow and specular vector validation',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'blue_channel',
      label: 'Blue Plane (CFA)',
      desc: 'Sensor blue channel isolating chromatic aberrations and high-frequency sensor noise',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'inverted',
      label: 'Negative / Invert',
      desc: 'Inverted luminances highlighting dark-region splicing',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'solarize',
      label: 'Solarization (Sabattier)',
      desc: 'Non-linear tone inversion exposing subtle retouching gradients',
      color: 'from-fuchsia-500 to-pink-500',
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-4 lg:p-6 space-y-4 shadow-xl">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-purple-400">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-black tracking-wider text-white uppercase">
              FORENSIC CANVAS LAB
            </h3>
            <p className="text-xs text-zinc-400 font-sans">Pixel tensor transformations, ELA &amp; lighting ray analysis</p>
          </div>
          {isProcessing && (
            <span className="text-xs font-mono text-purple-400 flex items-center gap-1.5 ml-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              Processing Tensor...
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Zoom In/Out */}
          <div className="flex items-center bg-[#07070f] border border-zinc-800 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(25, prev - 25))}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] text-zinc-300 font-bold min-w-[50px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(400, prev + 25))}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#07070f] border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reset Pan and Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          {/* Split Wipe Toggle */}
          <button
            onClick={() => setShowSplitSlider(!showSplitSlider)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
              showSplitSlider
                ? 'bg-[#ec4899]/20 border-[#ec4899] text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                : 'bg-[#07070f] border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Split-Screen Compare"
          >
            <Sliders className="w-3.5 h-3.5 text-[#ec4899]" />
            <span>SPLIT WIPE</span>
          </button>

          {/* Shadow Vector Ray Tool */}
          <button
            onClick={() => setIsDrawingRays(!isDrawingRays)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
              isDrawingRays
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-200 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                : 'bg-[#07070f] border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Draw Shadow Vector Rays to test light source convergence"
          >
            <Sun className="w-3.5 h-3.5 text-[#f97316]" />
            <span>SHADOW VECTORS {shadowRays.length > 0 && `(${shadowRays.length})`}</span>
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleDownloadSnapshot}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#07070f] border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Export Current Filtered Image"
          >
            <Download className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>SNAPSHOT</span>
          </button>
        </div>
      </div>

      {/* Filter Mode Selector & Tools Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#08080f] border border-zinc-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-xs font-mono font-bold text-zinc-300 whitespace-nowrap">
            TRANSFORM FILTER:
          </span>
          <select
            id="forensic-filter-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="flex-1 bg-[#12121e] border border-zinc-700 text-white font-mono text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {FILTERS.map((f) => (
              <option key={f.id} value={f.id} className="bg-[#12121e] text-white">
                {f.label} — {f.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {FILTERS.slice(0, 4).map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer hidden md:inline-block ${
                activeFilter === f.id
                  ? 'bg-purple-900/60 border border-purple-500 text-purple-200'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Sub-Controls for ELA */}
      {activeFilter === 'ela' && (
        <div className="p-3.5 rounded-2xl bg-[#07070f] border border-pink-900/40 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-inner">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">JPEG Baseline Quality:</span>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={elaQuality}
                onChange={(e) => setElaQuality(parseFloat(e.target.value))}
                className="w-24 accent-[#ec4899]"
              />
              <span className="text-pink-300 font-bold">{(elaQuality * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Error Multiplier (Δ):</span>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={elaScale}
                onChange={(e) => setElaScale(parseInt(e.target.value))}
                className="w-24 accent-[#ec4899]"
              />
              <span className="text-pink-300 font-bold">{elaScale}x</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 italic">
            *High error brightness indicates localized modification or double JPEG compression.
          </p>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative w-full h-[460px] md:h-[540px] rounded-2xl overflow-hidden bg-black border border-zinc-800 select-none flex items-center justify-center ${
          isDrawingRays ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Hidden Raw Reference Canvas */}
        <canvas ref={rawCanvasRef} className="hidden" />

        {/* Display Canvas with Transformations */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
            transformOrigin: 'center center',
            transition: isPanning || isDrawingRays ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative inline-block max-w-full max-h-full"
        >
          <canvas
            ref={displayCanvasRef}
            className="block max-h-[500px] w-auto object-contain pointer-events-auto rounded shadow-2xl"
          />

          {/* Split Wipe Overlay (Shows Raw Image on Left, Filter on Right) */}
          {showSplitSlider && rawCanvasRef.current && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${splitPercent}%`,
                height: '100%',
                overflow: 'hidden',
                borderRight: '2px solid #ec4899',
                boxShadow: '0 0 16px rgba(236,72,153,0.8)',
                pointerEvents: 'none',
              }}
            >
              <img
                src={rawCanvasRef.current.toDataURL()}
                alt="Raw Compare"
                className="block max-h-[500px] w-auto object-contain"
                style={{
                  minWidth: displayCanvasRef.current?.width || '100%',
                  minHeight: displayCanvasRef.current?.height || '100%',
                }}
              />
              <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-pink-300 border border-[#ec4899]/50">
                RAW SOURCE
              </div>
            </div>
          )}

          {/* Shadow Vector Rays SVG Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${displayCanvasRef.current?.width || 800} ${displayCanvasRef.current?.height || 500}`}
          >
            {shadowRays.map((ray) => (
              <g key={ray.id}>
                {/* Extended Ray line */}
                <line
                  x1={ray.startX}
                  y1={ray.startY}
                  x2={ray.endX}
                  y2={ray.endY}
                  stroke={ray.color}
                  strokeWidth="3"
                  strokeDasharray="6,4"
                />
                {/* Ray Start Pin */}
                <circle cx={ray.startX} cy={ray.startY} r="5" fill={ray.color} />
                {/* Ray Tip */}
                <polygon
                  points={`${ray.endX},${ray.endY} ${ray.endX - 8},${ray.endY - 4} ${ray.endX - 8},${ray.endY + 4}`}
                  fill={ray.color}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Split Wipe Handle Slider (Bottom Bar) */}
        {showSplitSlider && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#07070f]/95 border border-[#ec4899]/60 backdrop-blur rounded-full px-4 py-2 flex items-center gap-3 z-30 shadow-2xl">
            <span className="text-[11px] font-mono text-pink-300 font-bold">RAW SOURCE</span>
            <input
              type="range"
              min="0"
              max="100"
              value={splitPercent}
              onChange={(e) => setSplitPercent(parseInt(e.target.value))}
              className="w-40 accent-[#ec4899] cursor-ew-resize"
            />
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {activeFilter.toUpperCase()}
            </span>
          </div>
        )}

        {/* Pixel Coordinates & RGB Inspector HUD (Bottom Left) */}
        {inspectData && (
          <div className="absolute top-3 left-3 bg-[#07070f]/90 backdrop-blur border border-zinc-800 rounded-2xl p-2.5 font-mono text-[11px] text-zinc-300 space-y-1 z-20 pointer-events-none shadow-lg">
            <div className="flex items-center gap-1.5 text-pink-300 font-bold">
              <Crosshair className="w-3.5 h-3.5 text-[#ec4899]" />
              <span>PIXEL INSPECTOR</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 text-zinc-400 text-[10px]">
              <span>COORD: X:{inspectData.x} Y:{inspectData.y}</span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm border border-zinc-700 inline-block"
                  style={{ backgroundColor: inspectData.hex }}
                />
                {inspectData.hex}
              </span>
              <span>RGB: ({inspectData.r}, {inspectData.g}, {inspectData.b})</span>
              <span>ZOOM: {zoomLevel}%</span>
            </div>
          </div>
        )}

        {/* Active Filter Badge (Top Right) */}
        <div className="absolute top-3 right-3 bg-[#07070f]/90 backdrop-blur border border-zinc-800 rounded-2xl px-3 py-1.5 font-mono text-[11px] text-zinc-300 z-20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse" />
          <span className="font-bold text-pink-300">
            FILTER: {FILTERS.find((f) => f.id === activeFilter)?.label}
          </span>
        </div>

        {/* Shadow Ray Tool Helper Instruction */}
        {isDrawingRays && (
          <div className="absolute top-14 right-3 bg-amber-950/90 backdrop-blur border border-amber-500/60 rounded-2xl p-3 font-mono text-[11px] text-amber-200 z-20 max-w-xs shadow-xl space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>LIGHT SOURCE VECTOR MODE</span>
            </div>
            <p className="text-[10px] text-amber-300/80 leading-tight">
              Click &amp; drag from object shadow tip towards object base to cast light rays. Authentic photos have rays converging at a single vanishing point.
            </p>
          </div>
        )}
      </div>

      {/* Filter Explanation Bento Footer */}
      <div className="p-3.5 rounded-2xl bg-[#07070f] border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-300 font-mono">
        <Info className="w-4 h-4 text-[#ec4899] shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-100">{FILTERS.find((f) => f.id === activeFilter)?.label}: </strong>
          <span className="text-zinc-400 font-sans">{FILTERS.find((f) => f.id === activeFilter)?.desc}</span>
        </div>
      </div>
    </div>
  );
};
