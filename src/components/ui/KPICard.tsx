'use client';

import type { LucideIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/cn';

type KPIColor = 'gold' | 'blue' | 'emerald' | 'purple';

const colorMap: Record<KPIColor, { gradient: string; accent: string }> = {
  gold: { gradient: 'from-[var(--nu-gold)]', accent: 'var(--nu-gold)' },
  blue: { gradient: 'from-[var(--nu-blue)]', accent: 'var(--nu-blue)' },
  emerald: { gradient: 'from-[var(--nu-emerald)]', accent: 'var(--nu-emerald)' },
  purple: { gradient: 'from-[var(--nu-purple)]', accent: 'var(--nu-purple)' },
};

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: KPIColor;
  sparkData?: number[];
  skeleton?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'gold',
  sparkData,
  skeleton,
}: KPICardProps) {
  const { gradient, accent } = colorMap[color];
  const isTrendUp = trend?.startsWith('+') || trend?.includes('% éxito');
  const isTrendDown = trend?.includes('Rechazado');

  if (skeleton) {
    return (
      <div className="nu-shimmer rounded-xl p-6 min-h-[140px]" />
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--nu-border)] p-6',
        'bg-[var(--nu-card)] hover:bg-[var(--nu-card-hover)]',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg'
      )}
    >
      <div
        className={cn('h-0.5 -mx-6 -mt-6 mb-4 rounded-t-xl bg-gradient-to-r', gradient, 'to-transparent')}
        aria-hidden
      />
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
          {title}
        </p>
        <Icon
          className="w-5 h-5 shrink-0"
          style={{ color: accent }}
          aria-hidden
        />
      </div>
      <p
        className="mt-1 text-3xl font-serif text-white"
        style={{ fontFamily: '"DM Serif Display", serif' }}
      >
        {value}
      </p>
      {trend && (
        <p
          className={cn(
            'text-xs mt-1',
            isTrendDown ? 'text-[var(--nu-red)]' : 'text-[var(--nu-emerald)]'
          )}
        >
          {trend}
        </p>
      )}
      {sparkData && sparkData.length > 0 && (
        <div className="mt-3 h-8 w-full max-w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sparkData.map((v, i) => ({ v, i }))}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <Line
                type="monotone"
                dataKey="v"
                stroke={accent}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
