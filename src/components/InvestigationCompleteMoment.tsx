import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface InvestigationCompleteMomentProps {
  caseId: string;
  onViewCompleteCase: () => void;
}

export const InvestigationCompleteMoment: React.FC<InvestigationCompleteMomentProps> = ({
  caseId,
  onViewCompleteCase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [checkedCount, setCheckedCount] = useState<number>(0);
  const [isAssembled, setIsAssembled] = useState<boolean>(false);

  const checklist = [
    'Media secured & SHA-256 sealed',
    'Multimodal signal analysis completed',
    'Media family lineage connected',
    'Origin Echo & context decoupling completed',
    'Cryptographic forensic package ready',
  ];

  // Progressive checklist reveal and sound
  useEffect(() => {
    soundFx.playFinalCaseComplete();

    const timers: NodeJS.Timeout[] = [];
    checklist.forEach((_, idx) => {
      timers.push(
        setTimeout(() => {
          setCheckedCount(idx + 1);
        }, (idx + 1) * 220)
      );
    });

    const assembleTimer = setTimeout(() => {
      setIsAssembled(true);
    }, checklist.length * 220 + 300);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(assembleTimer);
    };
  }, []);

  // Minimal professional forensic confetti effect (subtle 1.8s particle burst)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ['#a855f7', '#06b6d4', '#10b981', '#c084fc', '#38bdf8'];
    const particleCount = 38;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 80,
      y: canvas.height * 0.35 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 1) * 4 - 1.5,
      size: Math.random() * 2.5 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.012,
    }));

    let animationFrameId: number;
    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      particles.forEach((p) => {
        if (p.alpha > 0.01) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.07; // subtle gravity
          p.vx *= 0.98;
          p.alpha = Math.max(0, p.alpha - p.decay);

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive && elapsed < 2200) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative rounded-2xl border border-purple-500/50 bg-[#0a0a14] p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden max-w-2xl mx-auto my-4 text-center">
      {/* Background canvas for minimal confetti particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Header */}
      <div className="space-y-2 relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>INVESTIGATION COMPLETE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
          05 / 05 STEPS COMPLETED
        </h2>
        <p className="text-xs font-mono text-zinc-400">
          Case <strong className="text-purple-300">#{caseId}</strong> evidence matrix verified and locked.
        </p>
      </div>

      {/* Sequential Checkmarks */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 space-y-2.5 font-mono text-xs text-left max-w-lg mx-auto relative z-20">
        {checklist.map((item, idx) => {
          const isDone = idx < checkedCount;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 transition-all duration-300 ${
                isDone ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-1'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/80'
                    : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                }`}
              >
                ✓
              </div>
              <span className={isDone ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>
                {item}
              </span>
            </div>
          );
        })}
      </div>

      {/* Case Assembled Callout & View Case Action */}
      <div className="pt-2 space-y-4 relative z-20">
        <div className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
          {isAssembled ? '✓ CASE ASSEMBLED' : 'ASSEMBLING DOSSIER...'}
        </div>

        <button
          onClick={onViewCompleteCase}
          id="btn-view-complete-case"
          disabled={!isAssembled}
          className={`px-8 py-3.5 rounded-xl font-mono text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950 ${
            isAssembled
              ? 'bg-purple-600 hover:bg-purple-500 text-white scale-100 hover:scale-[1.02]'
              : 'bg-zinc-800 text-zinc-400 cursor-not-allowed scale-95 opacity-70'
          }`}
        >
          <span>VIEW COMPLETE CASE →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
