'use client';

import { cn } from '@/lib/cn';

const STEPS = ['intake', 'research', 'comparable', 'report', 'qa', 'compliance'] as const;

function getStepIndex(status: string): number {
  const i = STEPS.indexOf(status as (typeof STEPS)[number]);
  return i >= 0 ? i : 0;
}

const stepLabels: Record<string, string> = {
  intake: 'Recepción',
  research: 'Investigación',
  comparable: 'Comparables',
  report: 'Informe',
  qa: 'Revisión QA',
  compliance: 'Cumplimiento',
};

interface PipelineTimelineProps {
  currentStatus: string;
}

export function PipelineTimeline({ currentStatus }: PipelineTimelineProps) {
  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 md:flex-wrap">
      {STEPS.map((step, i) => {
        const state: 'done' | 'active' | 'pending' =
          i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending';
        const label = stepLabels[step] ?? step;

        return (
          <div
            key={step}
            className="flex items-center gap-3 py-2 md:py-0"
            title={label}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors duration-150',
                state === 'done' && 'bg-[#15803D] text-white',
                state === 'active' && 'bg-[#1D4ED8] text-white ring-2 ring-[#1D4ED8]/25',
                state === 'pending' && 'bg-[#E5E7EB] text-[#6B7280]'
              )}
            >
              {state === 'done' ? '✓' : label.charAt(0)}
            </div>
            <span
              className={cn(
                'font-medium text-sm',
                state === 'done' && 'text-[#15803D]',
                state === 'active' && 'text-[#1D4ED8]',
                state === 'pending' && 'text-[#6B7280]'
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'hidden md:block w-8 h-0.5 flex-shrink-0',
                  state === 'done' ? 'bg-[#15803D]' : 'bg-[#E5E7EB]'
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
