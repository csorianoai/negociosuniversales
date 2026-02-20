'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; bg: string; text: string; pulse?: boolean }
> = {
  pending_intake: { label: 'Pendiente', dot: 'bg-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  intake_processing: { label: 'Intake...', dot: 'bg-blue-400', bg: 'bg-blue-400/10', text: 'text-blue-400', pulse: true },
  intake_completed: { label: 'Intake OK', dot: 'bg-blue-400', bg: 'bg-blue-400/10', text: 'text-blue-400' },
  research_processing: { label: 'Research...', dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', pulse: true },
  research_completed: { label: 'Research OK', dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500' },
  comparable_processing: { label: 'Comparables...', dot: 'bg-indigo-400', bg: 'bg-indigo-400/10', text: 'text-indigo-400', pulse: true },
  comparable_completed: { label: 'Comparables OK', dot: 'bg-indigo-400', bg: 'bg-indigo-400/10', text: 'text-indigo-400' },
  report_processing: { label: 'Informe...', dot: 'bg-purple-400', bg: 'bg-purple-400/10', text: 'text-purple-400', pulse: true },
  report_completed: { label: 'Informe OK', dot: 'bg-purple-400', bg: 'bg-purple-400/10', text: 'text-purple-400' },
  qa_processing: { label: 'QA...', dot: 'bg-orange-400', bg: 'bg-orange-400/10', text: 'text-orange-400', pulse: true },
  qa_passed: { label: 'QA Aprobado', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  qa_failed: { label: 'QA Rechazado', dot: 'bg-red-400', bg: 'bg-red-400/10', text: 'text-red-400' },
  compliance_processing: { label: 'Compliance...', dot: 'bg-orange-400', bg: 'bg-orange-400/10', text: 'text-orange-400', pulse: true },
  compliance_passed: { label: 'Compliance OK', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  compliance_failed: { label: 'Compliance Fallido', dot: 'bg-red-400', bg: 'bg-red-400/10', text: 'text-red-400' },
  human_review: { label: 'Revisión humana', dot: 'bg-purple-400', bg: 'bg-purple-400/10', text: 'text-purple-400' },
  approved: { label: 'Aprobado', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  delivered: { label: 'Entregado', dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  cancelled: { label: 'Cancelado', dot: 'bg-slate-400', bg: 'bg-slate-400/10', text: 'text-slate-400' },
};

const DEFAULT_CONFIG = { label: '', dot: 'bg-slate-400', bg: 'bg-slate-400/10', text: 'text-slate-500' };

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const config = STATUS_CONFIG[key] ?? { ...DEFAULT_CONFIG, label: status };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full py-1 px-3 text-xs font-semibold',
        config.bg,
        config.text
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          config.dot,
          config.pulse && 'nu-pulse'
        )}
        aria-hidden
      />
      {config.label}
      {status === 'delivered' && <Check className="w-3 h-3 ml-0.5" />}
    </span>
  );
}
