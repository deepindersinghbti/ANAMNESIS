import React, { useState, useEffect } from 'react';
import {
  ScanSearch,
  Bot,
  Scissors,
  Puzzle,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import {
  Assessable,
  isAssessed,
  ManipulationAssessment,
  ManipulationTypeClass,
} from '../types';
import {
  formatAssessedPct,
  MANIPULATION_SCOPE_NOTE,
  MANIPULATION_TYPE_SHORT,
  manipulationTypeTheme,
} from '../lib/manipulationAssessment';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { WhyThisMatters } from './WhyThisMatters';
import { soundFx } from '../lib/soundFx';

interface ManipulationAssessmentCardProps {
  assessment: ManipulationAssessment;
  /** Play the short forensic reveal sequence before showing the card. */
  enableReveal?: boolean;
  /** Condensed read-only rendering for Connect / Investigate / Report stages. */
  compact?: boolean;
}

const TYPE_ICON: Record<ManipulationTypeClass, React.ElementType> = {
  AI_BASED: Bot,
  CONVENTIONAL: Scissors,
  MIXED: Puzzle,
  NONE: ShieldCheck,
  INCONCLUSIVE: HelpCircle,
};

const CATEGORY_BADGE: Record<string, string> = {
  ai: 'bg-rose-950 border-rose-800 text-rose-300',
  conventional: 'bg-amber-950 border-amber-800 text-amber-300',
  neutral: 'bg-zinc-900 border-zinc-700 text-zinc-400',
};

const CATEGORY_LABEL: Record<string, string> = {
  ai: '🤖 AI',
  conventional: '✂️ MANUAL',
  neutral: '• NEUTRAL',
};

/** Renders a percentage, or the gap. Never prints "0%" for a missing number.
 *  Uses the spaced human form so it reads the same as the ConfidenceIndicator
 *  sitting beside it in this card. */
const pct = formatAssessedPct;

/** Bar width for a signal strength; a gap draws an empty bar. */
const barWidth = (value: Assessable<number>) => (isAssessed(value) ? value : 0);

export const ManipulationAssessmentCard: React.FC<ManipulationAssessmentCardProps> = ({
  assessment,
  enableReveal = false,
  compact = false,
}) => {
  const theme = manipulationTypeTheme(assessment.likelyType);
  const TypeIcon = TYPE_ICON[assessment.likelyType] ?? HelpCircle;

  // Short forensic-style reveal: ANALYSING → COMPLETE → TYPE → CONFIDENCE
  const [revealStep, setRevealStep] = useState<number>(enableReveal ? 0 : 4);

  useEffect(() => {
    if (!enableReveal) {
      setRevealStep(4);
      return;
    }
    setRevealStep(0);
    const timers = [
      setTimeout(() => {
        setRevealStep(1);
        soundFx.playScanningBlip();
      }, 420),
      setTimeout(() => setRevealStep(2), 820),
      setTimeout(() => {
        setRevealStep(3);
        soundFx.playScanningBlip();
      }, 1180),
      setTimeout(() => {
        setRevealStep(4);
        soundFx.playStepCompletion();
      }, 1600),
    ];
    return () => timers.forEach(clearTimeout);
    // Plays once when the ANALYSE stage opens. Later changes to the assessment
    // (e.g. an original source being attached) update the card in place.
  }, [enableReveal]);

  const isDetected = assessment.manipulationDetected === true;
  const isInconclusive = assessment.manipulationDetected === 'inconclusive';

  /* ---------------------------------------------------------------------
     Reveal sequence overlay
     --------------------------------------------------------------------- */
  if (enableReveal && revealStep < 4) {
    const lines = [
      { at: 0, text: 'ANALYSING MEDIA...', tone: 'text-zinc-400' },
      { at: 1, text: 'MANIPULATION ASSESSMENT COMPLETE', tone: 'text-white' },
      {
        at: 2,
        text: `TYPE: ${MANIPULATION_TYPE_SHORT[assessment.likelyType]}`,
        tone: theme.text,
      },
      {
        at: 3,
        text: isAssessed(assessment.confidence)
          ? `CONFIDENCE: ${assessment.confidence}%`
          : 'CONFIDENCE: NOT ASSESSED',
        tone: theme.text,
      },
    ];

    return (
      <div
        className={`rounded-xl border ${theme.border} bg-[#0a0a12] p-4 space-y-2.5 shadow-md font-mono text-xs min-h-[152px]`}
      >
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <ScanSearch className={`w-4 h-4 ${theme.accent} animate-pulse`} />
          <span className="font-bold text-white uppercase tracking-wider">
            MEDIA MANIPULATION ASSESSMENT
          </span>
        </div>
        <div className="space-y-1.5 pt-1">
          {lines.map((line) => (
            <div
              key={line.at}
              className={`flex items-center gap-2 transition-opacity duration-300 ${
                revealStep >= line.at ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className="text-zinc-600">{line.at === 0 ? '›' : '↓'}</span>
              <span className={`font-bold tracking-wide ${line.tone}`}>{line.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------
     Assessment card
     --------------------------------------------------------------------- */
  const visibleIndicators = compact
    ? assessment.indicators.slice(0, 5)
    : assessment.indicators.slice(0, 8);
  const hiddenIndicatorCount = assessment.indicators.length - visibleIndicators.length;

  return (
    <div
      className={`rounded-xl border ${theme.border} bg-[#0a0a12] p-4 space-y-3.5 shadow-md font-mono text-xs animate-fade-in`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <ScanSearch className={`w-4 h-4 ${theme.accent}`} />
          <span className="font-bold text-white uppercase tracking-wider">
            MEDIA MANIPULATION ASSESSMENT
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-400">
            AI-assisted
          </span>
        </div>
        <ConfidenceIndicator score={assessment.confidence} label="Confidence" />
      </div>

      {/* Verdict block */}
      <div className={`p-3 rounded-xl ${theme.panel} border ${theme.border} space-y-2`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isDetected ? (
              <AlertTriangle className={`w-4 h-4 ${theme.accent}`} />
            ) : isInconclusive ? (
              <HelpCircle className={`w-4 h-4 ${theme.accent}`} />
            ) : (
              <CheckCircle2 className={`w-4 h-4 ${theme.accent}`} />
            )}
            <span className="text-sm font-black text-white">{assessment.headline}</span>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${theme.badge}`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            <span>{MANIPULATION_TYPE_SHORT[assessment.likelyType]}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 block text-[10px] font-bold uppercase">
              Likely manipulation type
            </span>
            <span className={`font-bold ${theme.text}`}>{assessment.likelyTypeLabel}</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 block text-[10px] font-bold uppercase">
              Confidence (based on available evidence)
            </span>
            <span className={`font-bold ${theme.text}`}>{pct(assessment.confidence)}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-sans leading-relaxed">{assessment.summary}</p>
      </div>

      {/* Signal split — makes "manipulated ≠ AI-generated" explicit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-rose-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Bot className="w-3.5 h-3.5" />
              <span>AI-BASED SIGNAL</span>
            </span>
            <span className="text-zinc-300 font-bold">{pct(assessment.aiSignalStrength)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-700"
              style={{ width: `${barWidth(assessment.aiSignalStrength)}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block">
            Face swap, generative fill, synthetic voice or visual artifacts.
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Scissors className="w-3.5 h-3.5" />
              <span>CONVENTIONAL SIGNAL</span>
            </span>
            <span className="text-zinc-300 font-bold">
              {pct(assessment.conventionalSignalStrength)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${barWidth(assessment.conventionalSignalStrength)}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block">
            Cutting, cropping, splicing, overlays, speed change, retouching.
          </span>
        </div>
      </div>

      {/* Indicators */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          {assessment.indicators.length > 0
            ? 'Indicators detected'
            : isAssessed(assessment.confidence)
            ? 'Indicators detected — none'
            : 'Indicators detected — not assessed'}
        </span>

        {visibleIndicators.length > 0 ? (
          <ul className="space-y-1">
            {visibleIndicators.map((indicator, i) => (
              <li
                key={`${indicator.label}-${i}`}
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="text-zinc-200 font-bold block text-[11px]">
                    {indicator.label}
                  </span>
                  <span className="text-zinc-400 text-[10px] font-sans block">
                    {indicator.detail}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                    CATEGORY_BADGE[indicator.category]
                  }`}
                  title={`Signal origin: ${indicator.origin}`}
                >
                  {CATEGORY_LABEL[indicator.category]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
            {isAssessed(assessment.confidence)
              ? 'Note: No significant indicators identified in the available evidence.'
              : 'Note: No analysis has run for this media, so no indicators have been looked for.'}
          </div>
        )}

        {hiddenIndicatorCount > 0 && (
          <span className="text-[10px] text-zinc-400 block">
            + {hiddenIndicatorCount} further indicator
            {hiddenIndicatorCount === 1 ? '' : 's'} recorded in the forensic dossier.
          </span>
        )}
      </div>

      {/* Source completeness linkage */}
      {assessment.sourceCompletenessWarning && (
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/50 text-[11px] space-y-1">
          <span className="text-amber-400 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠️ SOURCE COMPLETENESS WARNING</span>
          </span>
          <p className="text-zinc-200 font-sans text-xs">
            {assessment.sourceCompletenessWarning}
          </p>
        </div>
      )}

      {/* Limitations — what we do not know */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Important limitations
        </span>
        <ul className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1 text-[10px] text-zinc-400 font-sans">
          {assessment.limitations.map((limitation, i) => (
            <li key={i}>• {limitation}</li>
          ))}
        </ul>
      </div>

      {!compact && (
        <WhyThisMatters
          title="MANIPULATED ≠ AI-GENERATED"
          explanation="A video can be manually edited without any AI involvement. For example, a 60-second recording with 20 seconds removed and the remaining 40 seconds re-uploaded is conventional / manual editing — not AI manipulation. ANAMNESIS reports these as separate signals so an investigator can tell the difference, and reports both when a file shows evidence of each."
        />
      )}

      {/* Honest capability label */}
      <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{assessment.assessmentLabel}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>AI-assisted forensic assessment — not a legal conclusion.</span>
        </span>
      </div>
    </div>
  );
};

/** Small persistent note used across the ANALYSE interface. */
export const ManipulationScopeNote: React.FC = () => (
  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 flex items-start gap-2 font-mono">
    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
    <span>{MANIPULATION_SCOPE_NOTE}</span>
  </div>
);

/**
 * One-line carry-forward strip. Keeps the ANALYSE-stage manipulation finding
 * visible as the investigator moves through CONNECT and INVESTIGATE.
 */
export const ManipulationCarryForward: React.FC<{
  assessment: ManipulationAssessment;
  context?: string;
}> = ({ assessment, context = 'Carried forward from ANALYSE' }) => {
  const theme = manipulationTypeTheme(assessment.likelyType);
  const TypeIcon = TYPE_ICON[assessment.likelyType] ?? HelpCircle;

  return (
    <div
      className={`p-2.5 rounded-lg bg-zinc-950 border ${theme.border} font-mono text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <TypeIcon className={`w-3.5 h-3.5 shrink-0 ${theme.accent}`} />
        <span className="text-zinc-400 uppercase text-[10px] font-bold shrink-0">
          Manipulation assessment:
        </span>
        <span className={`font-bold truncate ${theme.text}`}>
          {assessment.headline} • {assessment.likelyTypeLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {assessment.sourceCompletenessWarning && (
          <span
            className="text-amber-400 text-[10px] font-bold"
            title={assessment.sourceCompletenessWarning}
          >
            ⚠️ SOURCE COMPLETENESS
          </span>
        )}
        <span className="text-zinc-400 text-[10px]">{context}</span>
        <ConfidenceIndicator score={assessment.confidence} showPercentage />
      </div>
    </div>
  );
};
