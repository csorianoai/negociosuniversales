'use client';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center">
      <p className="text-[#4B5563] font-medium">{title}</p>
      {description && <p className="text-sm text-[#6B7280] mt-1">{description}</p>}
    </div>
  );
}
