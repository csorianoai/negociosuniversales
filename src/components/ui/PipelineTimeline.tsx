'use client';

import { cn } from '@/lib/cn';

/** Minimal case shape for pipeline counts */
export interface CaseWithStatus {
  status: string;
}

const STAGES = ['intake', 'research', 'comparable', 'report', 'qa', 'compliance'] as const;

const STAGE_LABELS: Record<string, string> = {
  intake: 'Intake',
  research: 'Research',
  comparable: 'Comparables',
  report: 'Informe',
  qa: 'QA',
  compliance: 'Compliance',
};

function statusToStage(status: string): (typeof STAGES)[number] {
  const s = status.toLowerCase();
  if (['pending_intake', 'intake_processing', 'intake_completed'].includes(s)) return 'intake';
  if (['research_processing', 'research_completed'].includes(s)) return 'research';
  if (['comparable_processing', 'comparable_completed'].includes(s)) return 'comparable';
  if (['report_processing', 'report_completed'].includes(s)) return 'report';
  if (['qa_processing', 'qa_passed', 'qa_failed'].includes(s)) return 'qa';
  if (['compliance_processing', 'compliance_passed', 'compliance_failed'].includes(s)) return 'compliance';
  return 'intake';
}

function countByStage(cases: CaseWithStatus[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const stage of STAGES) counts[stage] = 0;
  for (const c of cases) {
    const stage = statusToStage(c.status);
    counts[stage] = (counts[stage] ?? 0) + 1;
  }
  return counts;
}

interface PipelineTimelineProps {
  cases?: CaseWithStatus[];
  currentStatus?: string;
}

export function PipelineTimeline({ cases = [], currentStatus }: PipelineTimelineProps) {
  const resolvedCases: CaseWithStatus[] =
    cases.length > 0
      ? cases
      : currentStatus
        ? [{ status: currentStatus }]
        : [];
  const counts = countByStage(resolvedCases);

  return (
    <div className="flex gap-0.5">
      {STAGES.map((stage, i) => {
        const count = counts[stage] ?? 0;
        const hasCount = count > 0;
        return (
          <div
            key={stage}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3.5 px-2 bg-[var(--nu-card)] text-center',
              hasCount && 'bg-[var(--nu-gold-dim)]',
              i === 0 && 'rounded-l-xl',
              i === STAGES.length - 1 && 'rounded-r-xl'
            )}
          >
            <span
              className={cn(
                'text-xl font-serif',
                hasCount ? 'text-[var(--nu-gold)]' : 'text-[var(--nu-text-muted)]'
              )}
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              {count}
            </span>
            <span className="text-xs text-[var(--nu-text-muted)] uppercase mt-0.5">
              {STAGE_LABELS[stage] ?? stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}
