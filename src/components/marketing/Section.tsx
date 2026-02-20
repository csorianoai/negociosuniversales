'use client';

import { cn } from '@/lib/cn';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, subtitle, children, className }: SectionProps) {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2
          className="text-2xl md:text-3xl font-serif text-white"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-slate-400 text-lg">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
