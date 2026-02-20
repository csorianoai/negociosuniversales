'use client';

import { cn } from '@/lib/cn';

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; bg: string; border: string; text: string }
> = {
  pending_intake: { label: 'Pendiente recepción', dot: 'bg-[#EAB308]', bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]/25', text: 'text-[#A16207]' },
  intake_processing: { label: 'Procesando recepción', dot: 'bg-[#EAB308]', bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]/25', text: 'text-[#A16207]' },
  intake_completed: { label: 'Recepción ok', dot: 'bg-[#38BDF8]', bg: 'bg-[#38BDF8]/10', border: 'border-[#38BDF8]/25', text: 'text-[#0284C7]' },
  research_processing: { label: 'Investigando', dot: 'bg-[#38BDF8]', bg: 'bg-[#38BDF8]/10', border: 'border-[#38BDF8]/25', text: 'text-[#0284C7]' },
  research_completed: { label: 'Investigación ok', dot: 'bg-[#38BDF8]', bg: 'bg-[#38BDF8]/10', border: 'border-[#38BDF8]/25', text: 'text-[#0284C7]' },
  comparable_processing: { label: 'Comparables', dot: 'bg-[#1D4ED8]', bg: 'bg-[#1D4ED8]/10', border: 'border-[#1D4ED8]/25', text: 'text-[#1D4ED8]' },
  comparable_completed: { label: 'Comparables ok', dot: 'bg-[#1D4ED8]', bg: 'bg-[#1D4ED8]/10', border: 'border-[#1D4ED8]/25', text: 'text-[#1D4ED8]' },
  report_processing: { label: 'Informe', dot: 'bg-[#4F46E5]', bg: 'bg-[#4F46E5]/10', border: 'border-[#4F46E5]/25', text: 'text-[#4F46E5]' },
  report_completed: { label: 'Informe ok', dot: 'bg-[#4F46E5]', bg: 'bg-[#4F46E5]/10', border: 'border-[#4F46E5]/25', text: 'text-[#4F46E5]' },
  qa_processing: { label: 'Revisión QA', dot: 'bg-[#F97316]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/25', text: 'text-[#C2410C]' },
  qa_passed: { label: 'QA aprobado', dot: 'bg-[#86EFAC]', bg: 'bg-[#86EFAC]/30', border: 'border-[#22C55E]/25', text: 'text-[#15803D]' },
  qa_failed: { label: 'QA rechazado', dot: 'bg-[#F87171]', bg: 'bg-[#F87171]/20', border: 'border-[#DC2626]/25', text: 'text-[#B91C1C]' },
  compliance_processing: { label: 'Cumplimiento', dot: 'bg-[#F97316]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/25', text: 'text-[#C2410C]' },
  compliance_passed: { label: 'Cumplimiento ok', dot: 'bg-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/25', text: 'text-[#15803D]' },
  compliance_failed: { label: 'Cumplimiento fallido', dot: 'bg-[#F87171]', bg: 'bg-[#F87171]/20', border: 'border-[#DC2626]/25', text: 'text-[#B91C1C]' },
  human_review: { label: 'Revisión humana', dot: 'bg-[#A855F7]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/25', text: 'text-[#7C3AED]' },
  approved: { label: 'Aprobado', dot: 'bg-[#15803D]', bg: 'bg-[#15803D]/10', border: 'border-[#15803D]/25', text: 'text-[#15803D]' },
  delivered: { label: 'Entregado', dot: 'bg-[#15803D]', bg: 'bg-[#15803D]/10', border: 'border-[#15803D]/25', text: 'text-[#15803D]' },
  cancelled: { label: 'Cancelado', dot: 'bg-[#6B7280]', bg: 'bg-[#6B7280]/10', border: 'border-[#6B7280]/25', text: 'text-[#4B5563]' },
};

const DEFAULT_CONFIG = { label: 'Desconocido', dot: 'bg-[#6B7280]', bg: 'bg-[#6B7280]/8', border: 'border-[#6B7280]/20', text: 'text-[#4B5563]' };

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const config = STATUS_CONFIG[key] ?? DEFAULT_CONFIG;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border',
        config.bg,
        config.border,
        config.text
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} aria-hidden />
      {config.label}
    </span>
  );
}
