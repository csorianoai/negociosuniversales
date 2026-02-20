'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Banner } from '@/components/ui/Banner';
import { DataTable } from '@/components/ui/DataTable';
import type { DataTableColumn } from '@/components/ui/DataTable';
import { formatDateDO } from '@/lib/format';
import {
  extractPropertyField,
  getCaseId,
  normalizeCasesResponse,
  isCaseLike,
} from '@/lib/case-utils';
import { DEMO_MODE, demoCases, mergeWithDemoData } from '@/lib/demo-data';
import type { CaseLike } from '@/lib/case-utils';

function getAddress(c: CaseLike): string {
  return extractPropertyField(c.property_data ?? {}, 'address', 'Sin dirección');
}

const PAGE_SIZE = 20;

const STATUS_GROUPS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending_intake', label: 'Pendiente' },
  { key: 'intake_completed', label: 'Recepción' },
  { key: 'research_completed', label: 'Investigación' },
  { key: 'comparable_completed', label: 'Comparables' },
  { key: 'report_completed', label: 'Informe' },
  { key: 'qa_passed', label: 'QA Aprobado' },
  { key: 'qa_failed', label: 'QA Rechazado' },
  { key: 'compliance_passed', label: 'Cumplimiento' },
  { key: 'compliance_failed', label: 'Cumplimiento Fallido' },
  { key: 'delivered', label: 'Entregado' },
  { key: 'cancelled', label: 'Cancelado' },
] as const;

const columns: DataTableColumn<CaseLike>[] = [
  { key: 'case_number', header: 'Caso', render: (r) => <span className="font-mono text-[var(--nu-gold)]">{r.case_number}</span> },
  { key: 'address', header: 'Dirección', render: (r) => <span className="text-[var(--nu-text-secondary)]">{getAddress(r)}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'date', header: 'Fecha', render: (r) => <span className="text-[var(--nu-text-muted)]">{formatDateDO(r.created_at)}</span> },
  {
    key: 'action',
    header: 'Acción',
    render: (r) => {
      const id = getCaseId(r);
      return id ? (
        <Link
          href={`/cases/${id}`}
          className="font-medium text-[var(--nu-gold)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 rounded"
        >
          Ver
        </Link>
      ) : (
        <span className="text-[var(--nu-text-muted)]">—</span>
      );
    },
  },
];

export default function CasesPage() {
  const [cases, setCases] = useState<CaseLike[]>([]);
  const [usedDemo, setUsedDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchRaw, setSearchRaw] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchDebounced(searchRaw);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchRaw]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.status === 401) {
        setError('Sesión expirada.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        if (DEMO_MODE) {
          const { merged, usedDemo: ud } = mergeWithDemoData(demoCases, 12);
          setCases(merged);
          setUsedDemo(ud);
          setDegraded(true);
        } else {
          setError('Error al cargar datos.');
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      const raw = normalizeCasesResponse(data);
      const realCases = raw.filter(isCaseLike) as CaseLike[];
      const { merged, usedDemo: ud } = mergeWithDemoData(realCases, 12);
      setCases(merged);
      setUsedDemo(ud);
    } catch {
      if (DEMO_MODE) {
        const { merged, usedDemo: ud } = mergeWithDemoData(demoCases, 12);
        setCases(merged);
        setUsedDemo(ud);
        setDegraded(true);
      } else {
        setError('Error al conectar.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = cases;
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (searchDebounced.trim()) {
      const q = searchDebounced.trim().toLowerCase();
      list = list.filter((c) => {
        const addr = getAddress(c).toLowerCase();
        const num = c.case_number.toLowerCase();
        return addr.includes(q) || num.includes(q);
      });
    }
    return list;
  }, [cases, statusFilter, searchDebounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );
  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-serif text-[var(--nu-text)]" style={{ fontFamily: '"DM Serif Display", serif' }}>Casos</h1>
          <Link
            href="/cases/new"
            className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 shrink-0"
          >
            Nuevo Caso
          </Link>
        </div>

        {usedDemo && (
          <div className="rounded-lg px-3 py-2 bg-amber-500/15 border border-amber-500/40 flex items-center gap-2">
            <span className="text-xs font-medium text-amber-400 rounded-full px-2 py-0.5 bg-amber-500/25">DEMO</span>
            <span className="text-sm text-[var(--nu-text-muted)]">Datos demo como complemento</span>
          </div>
        )}

        {degraded && !usedDemo && (
          <Banner
            variant="degraded"
            message="Modo degradado: mostrando datos de demostración."
            onRetry={load}
          />
        )}

        {error && <Banner variant="error" message={error} onRetry={load} />}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nu-text-muted)]" aria-hidden>
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por caso o dirección..."
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[var(--nu-border)] rounded-lg bg-[var(--nu-navy-light)] text-[var(--nu-text)] placeholder:text-[var(--nu-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)]/50 focus:border-[var(--nu-gold)] transition-colors"
            />
            {searchRaw && (
              <button
                type="button"
                onClick={() => setSearchRaw('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nu-text-muted)] hover:text-[var(--nu-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 rounded"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_GROUPS.map((g) => {
            const count = g.key === 'all' ? cases.length : cases.filter((c) => c.status === g.key).length;
            const active = statusFilter === g.key;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => { setStatusFilter(g.key); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 ${
                  active
                    ? 'bg-[var(--nu-gold)] text-[var(--nu-navy)]'
                    : 'bg-[var(--nu-card)] border border-[var(--nu-border)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]'
                }`}
              >
                {g.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
          {loading ? (
            <DataTable columns={columns} data={[]} keyFn={(r) => getCaseId(r) ?? r.case_number} loading />
          ) : paginated.length === 0 ? (
            <EmptyState title="No hay casos" description="Ajuste filtros o cree un caso." />
          ) : (
            <>
              <DataTable columns={columns} data={paginated} keyFn={(r) => getCaseId(r) ?? r.case_number} />
              <div className="px-6 py-4 border-t border-[var(--nu-border)] flex items-center justify-between text-sm text-[var(--nu-text-muted)]">
                <span>
                  Mostrando {from}–{to} de {filtered.length}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded border border-[var(--nu-border)] bg-[var(--nu-card)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--nu-card-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded border border-[var(--nu-border)] bg-[var(--nu-card)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--nu-card-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
