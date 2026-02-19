'use client';

import { cn } from '@/lib/cn';
import { Skeleton } from './Skeleton';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  skeleton?: boolean;
}

export function KPICard({ title, value, subtitle, skeleton }: KPICardProps) {
  if (skeleton) {
    return (
      <div className="bg-white border border-[#D8E0EA] rounded-lg p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-16 mt-3" />
        {subtitle && <Skeleton className="h-3 w-12 mt-2" />}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#D8E0EA] rounded-lg p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
      <p className="text-sm font-medium text-[#4B5563]">{title}</p>
      <p className={cn('text-3xl font-bold text-[#0B1220] mt-1 font-tabular')}>
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
