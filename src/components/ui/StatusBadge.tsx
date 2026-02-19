'use client';

import { cn } from '@/lib/cn';

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; bg: string; border: string; text: string }
> = {
  draft: { label: 'Borrador', dot: 'bg-[#6B7280]', bg: 'bg-[#6B7280]/10', border: 'border-[#6B7280]/25', text: 'text-[#4B5563]' },
  intake: { label: 'Recepción', dot: 'bg-[#1D4ED8]', bg: 'bg-[#1D4ED8]/8', border: 'border-[#1D4ED8]/25', text: 'text-[#1D4ED8]' },
  research: { label: 'Investigación', dot: 'bg-[#1D4ED8]', bg: 'bg-[#1D4ED8]/8', border: 'border-[#1D4ED8]/25', text: 'text-[#1D4ED8]' },
  comparable: { label: 'Comparables', dot: 'bg-[#1D4ED8]', bg: 'bg-[#1D4ED8]/8', border: 'border-[#1D4ED8]/25', text: 'text-[#1D4ED8]' },
  report: { label: 'Informe', dot: 'bg-[#4F46E5]', bg: 'bg-[#4F46E5]/10', border: 'border-[#4F46E5]/25', text: 'text-[#4F46E5]' },
  qa: { label: 'Revisión QA', dot: 'bg-[#B45309]', bg: 'bg-[#B45309]/10', border: 'border-[#B45309]/25', text: 'text-[#B45309]' },
  compliance: { label: 'Cumplimiento', dot: 'bg-[#B45309]', bg: 'bg-[#B45309]/10', border: 'border-[#B45309]/25', text: 'text-[#B45309]' },
  review: { label: 'Revisión', dot: 'bg-[#7C3AED]', bg: 'bg-[#7C3AED]/10', border: 'border-[#7C3AED]/25', text: 'text-[#7C3AED]' },
  delivered: { label: 'Entregado', dot: 'bg-[#15803D]', bg: 'bg-[#15803D]/10', border: 'border-[#15803D]/25', text: 'text-[#15803D]' },
  archived: { label: 'Archivado', dot: 'bg-[#6B7280]', bg: 'bg-[#6B7280]/8', border: 'border-[#6B7280]/20', text: 'text-[#6B7280]' },
};

const DEFAULT_CONFIG = STATUS_CONFIG.draft;

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const config = STATUS_CONFIG[key] ?? { ...DEFAULT_CONFIG, label: status };

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
