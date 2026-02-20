'use client';

interface BannerProps {
  variant: 'degraded' | 'error' | 'warning';
  message: string;
  onRetry?: () => void;
}

export function Banner({ variant, message, onRetry }: BannerProps) {
  const styles = {
    degraded: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    error: 'bg-red-500/10 border-red-500/20 text-[var(--nu-red)]',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
      role="alert"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-3 font-medium underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 focus-visible:ring-offset-2 rounded"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
