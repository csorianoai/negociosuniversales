'use client';

import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('nu-shimmer rounded-md', className)}
      aria-hidden
    />
  );
}
