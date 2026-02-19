'use client';

interface BannerProps {
  variant: 'degraded' | 'error' | 'warning';
  message: string;
  onRetry?: () => void;
}

export function Banner({ variant, message, onRetry }: BannerProps) {
  const styles = {
    degraded: 'bg-[#FEF3C7] border-[#F59E0B]/30 text-[#92400E]',
    error: 'bg-[#FEE2E2] border-[#B91C1C]/30 text-[#B91C1C]',
    warning: 'bg-[#FEF3C7] border-[#B45309]/30 text-[#B45309]',
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
          className="ml-3 font-medium underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 rounded"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
