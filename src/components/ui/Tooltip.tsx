'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
            'px-3 py-2 text-xs text-white bg-slate-800 rounded-lg',
            'whitespace-nowrap z-50',
            'before:content-[""] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2',
            'before:border-4 before:border-transparent before:border-t-slate-800'
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
