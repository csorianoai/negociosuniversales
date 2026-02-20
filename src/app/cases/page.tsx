'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Banner } from '@/components/ui/Banner';
import { DataTable } from '@/components/ui/DataTable';
import type { Case } from '@/core/types';
import type { DataTableColumn } from '@/components/ui/DataTable';
import { formatDateDO } from '@/lib/format';
import { getPropertyAddress } from '@/lib/property-data';
import { DEMO_MODE, demoCases } from '@/lib/demo-data';

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

const columns: DataTableColumn<Case>[] = [
  { key: 'case_number', header: 'Caso', render: (r) => <span className="font-mono text-[#4B5563]">{r.case_number}</span> },
  { key: 'address', header: 'Dirección', render: (r) => getPropertyAddress(r.property_data) ?? 'Sin dirección' },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'date', header: 'Fecha', render: (r) => formatDateDO(r.created_at) },
  {
    key: 'action',
    header: 'Acción',
    render: (r) => (
      <Link
        href={`/cases/${r.id}`}
        className="font-medium text-[#1D4ED8] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2 rounded"
      >
        Ver
      </Link>
    ),
  },
];

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
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
          setCases(demoCases);
          setDegraded(true);
        } else {
          setError('Error al cargar datos.');
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCases(Array.isArray(data) ? data : []);
    } catch {
      if (DEMO_MODE) {
        setCases(demoCases);
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
      list = list.filter((c) => (getPropertyAddress(c.property_data) ?? '').toLowerCase().includes(q));
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
          <h1 className="text-2xl font-bold text-[#0B1220]">Casos</h1>
          <Link
            href="/cases/new"
            className="inline-flex items-center justify-center px-4 py-2 font-medium text-white rounded-md bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2 shrink-0"
          >
            Nuevo Caso
          </Link>
        </div>

        {degraded && (
          <Banner
            variant="degraded"
            message="Modo degradado: mostrando datos de demostración."
            onRetry={load}
          />
        )}

        {error && <Banner variant="error" message={error} onRetry={load} />}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden>
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por dirección..."
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[#D8E0EA] rounded-md bg-white text-[#0B1220] placeholder:text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:border-[#1D4ED8] transition-colors duration-150"
            />
            {searchRaw && (
              <button
                type="button"
                onClick={() => setSearchRaw('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B1220] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 rounded"
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
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2 ${
                  active
                    ? 'bg-[#1D4ED8] text-white'
                    : 'bg-white border border-[#D8E0EA] text-[#4B5563] hover:bg-[#F1F4F8]'
                }`}
              >
                {g.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-lg border border-[#D8E0EA] shadow-[0_1px_2px_rgba(11,18,32,0.04)] overflow-hidden">
          {loading ? (
            <DataTable columns={columns} data={[]} keyFn={(r) => r.id} loading />
          ) : paginated.length === 0 ? (
            <EmptyState title="No hay casos" description="Ajuste filtros o cree un caso." />
          ) : (
            <>
              <DataTable columns={columns} data={paginated} keyFn={(r) => r.id} />
              <div className="px-6 py-4 border-t border-[#D8E0EA] flex items-center justify-between text-sm text-[#4B5563]">
                <span>
                  Mostrando {from}–{to} de {filtered.length}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded border border-[#D8E0EA] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F1F4F8] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35"
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
                    className="px-3 py-1 rounded border border-[#D8E0EA] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F1F4F8] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35"
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
