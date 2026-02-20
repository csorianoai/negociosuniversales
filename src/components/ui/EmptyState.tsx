'use client';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      <p className="text-[var(--nu-text-secondary)] font-medium">{title}</p>
      {description && <p className="text-sm text-[var(--nu-text-muted)] mt-1">{description}</p>}
    </div>
  );
}
