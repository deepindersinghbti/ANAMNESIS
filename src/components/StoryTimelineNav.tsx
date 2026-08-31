import React from 'react';
import {
  Film,
  Sparkles,
  Layers,
  HelpCircle,
  Upload,
  GitFork,
  PlayCircle,
  Ghost,
  Split,
  ShieldAlert,
  FileCheck,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type StoryStepId =
  | 'hook'
  | 'big_idea'
  | 'five_questions'
  | 'evidence_intake'
  | 'media_family'
  | 'forensic_replay'
  | 'origin_echo'
  | 'context_check'
  | 'crime_scene'
  | 'forensic_report'
  | 'final_line';

export interface StoryStep {
  id: StoryStepId;
  timeRange: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const STORY_STEPS: StoryStep[] = [
  {
    id: 'hook',
    timeRange: '0:00–0:25',
    title: 'THE HOOK',
    subtitle: 'The Viral Wave & "What actually happened?"',
    icon: <Film className="w-3.5 h-3.5" />,
  },
  {
    id: 'big_idea',
    timeRange: '0:25–0:55',
    title: 'THE BIG IDEA',
    subtitle: 'Digital Crime Scene & Multimodal Clues',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: 'five_questions',
    timeRange: '0:55–1:25',
    title: 'THE 5 QUESTIONS',
    subtitle: 'Who, Where, When, What Changed, How It Spread',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
  },
  {
    id: 'evidence_intake',
    timeRange: '1:25–2:00',
    title: 'EVIDENCE INTAKE',
    subtitle: 'Give Anamnesis viral_video_360p.mp4',
    icon: <Upload className="w-3.5 h-3.5" />,
  },
  {
    id: 'media_family',
    timeRange: '2:00–2:35',
    title: 'MEDIA FAMILY',
    subtitle: 'Related Media Found (14 Copies) & Lineage Tree',
    icon: <GitFork className="w-3.5 h-3.5" />,
  },
  {
    id: 'forensic_replay',
    timeRange: '2:35–3:10',
    title: 'FORENSIC REPLAY™',
    subtitle: 'Step-by-step timeline of media mutations',
    icon: <PlayCircle className="w-3.5 h-3.5" />,
  },
  {
    id: 'origin_echo',
    timeRange: '3:10–3:40',
    title: 'ORIGIN ECHO',
    subtitle: 'When original is gone: Surviving evidence synthesis',
    icon: <Ghost className="w-3.5 h-3.5" />,
  },
  {
    id: 'context_check',
    timeRange: '3:40–4:10',
    title: 'CONTEXT CHECK',
    subtitle: 'Real Video vs Wrong Location, Time & Caption',
    icon: <Split className="w-3.5 h-3.5" />,
  },
  {
    id: 'crime_scene',
    timeRange: '4:10–4:40',
    title: 'DIGITAL CRIME SCENE',
    subtitle: 'Unified Case Dashboard & Multimodal Verification',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
  {
    id: 'forensic_report',
    timeRange: '4:40–4:50',
    title: 'FORENSIC REPORT',
    subtitle: 'Generate Forensic Package & Cryptographic Dossier',
    icon: <FileCheck className="w-3.5 h-3.5" />,
  },
  {
    id: 'final_line',
    timeRange: '4:50–5:00',
    title: 'THE FINAL LINE',
    subtitle: '"Don\'t just detect the fake. Trace its story."',
    icon: <Award className="w-3.5 h-3.5" />,
  },
];

interface StoryTimelineNavProps {
  currentStep: StoryStepId;
  onSelectStep: (step: StoryStepId) => void;
}

export const StoryTimelineNav: React.FC<StoryTimelineNavProps> = ({
  currentStep,
  onSelectStep,
}) => {
  const currentIndex = STORY_STEPS.findIndex((s) => s.id === currentStep);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStep(STORY_STEPS[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < STORY_STEPS.length - 1) {
      onSelectStep(STORY_STEPS[currentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Header & Prev/Next Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d0d14] border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
                🎬 ANAMNESIS WALKTHROUGH
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-purple-300 border border-zinc-700">
                {STORY_STEPS[currentIndex].timeRange}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Reconstruct the story. Expose the manipulation.
            </p>
          </div>
        </div>

        {/* Step Progress & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-zinc-400 px-2 font-bold">
            Step {currentIndex + 1} of {STORY_STEPS.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === STORY_STEPS.length - 1}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ordered Timeline Buttons (Horizontal scrollable button bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {STORY_STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-zinc-800 border-purple-500 text-white shadow-md'
                  : 'bg-[#0d0d14] border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span className="text-[10px] text-zinc-500 font-bold">
                {step.timeRange.split('–')[0]}
              </span>
              <span className={isActive ? 'text-purple-400' : 'text-zinc-400'}>
                {step.icon}
              </span>
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
