'use client';

import { cn } from '@/lib/cn';
import { Skeleton } from './Skeleton';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyFn: (row: T) => string;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyFn,
  loading,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--nu-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-[var(--nu-text-muted)] uppercase tracking-wider sticky top-0 bg-[var(--nu-card)]',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--nu-border)]/60">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--nu-border)] bg-[var(--nu-card)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-[var(--nu-text-muted)] uppercase tracking-wider sticky top-0 bg-[var(--nu-card)]',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyFn(row)}
              className="border-b border-[var(--nu-border)]/60 transition-colors duration-150 hover:bg-[var(--nu-card-hover)]"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-6 py-4 text-sm text-[var(--nu-text)]',
                    col.align === 'right' && 'text-right font-tabular'
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
