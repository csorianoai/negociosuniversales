'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Banner } from '@/components/ui/Banner';
import { DataTable } from '@/components/ui/DataTable';
import type { Case } from '@/core/types';
import type { DataTableColumn } from '@/components/ui/DataTable';
import { formatDateDO, formatUSD } from '@/lib/format';
import { DEMO_MODE, demoCases } from '@/lib/demo-data';

const columns: DataTableColumn<Case>[] = [
  { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-[#4B5563]">{r.id.slice(0, 8)}</span> },
  { key: 'address', header: 'Dirección', render: (r) => r.address ?? 'Sin dirección' },
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

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.status === 401) {
        setError('Sesión expirada. Redirigiendo...');
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

  const total = cases.length;
  const enProgreso = cases.filter(
    (c) => !['draft', 'delivered', 'archived'].includes(c.status)
  ).length;
  const completados = cases.filter((c) => c.status === 'delivered').length;
  const costo = cases.reduce((sum, c) => sum + (c.total_cost_usd ?? 0), 0);
  const recentCases = cases.slice(0, 10);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#0B1220]">Dashboard</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Casos" value={loading ? '—' : total} skeleton={loading} />
          <KPICard title="En Progreso" value={loading ? '—' : enProgreso} skeleton={loading} />
          <KPICard title="Completados" value={loading ? '—' : completados} skeleton={loading} />
          <KPICard
            title="Costo Acumulado"
            value={loading ? '—' : formatUSD(costo)}
            subtitle="USD"
            skeleton={loading}
          />
        </div>

        <div className="bg-white rounded-lg border border-[#D8E0EA] shadow-[0_1px_2px_rgba(11,18,32,0.04)] overflow-hidden">
          <h2 className="px-6 py-4 text-lg font-semibold text-[#0B1220] border-b border-[#D8E0EA]">
            Actividad Reciente
          </h2>
          {loading ? (
            <DataTable columns={columns} data={[]} keyFn={(r) => r.id} loading />
          ) : recentCases.length === 0 ? (
            <EmptyState title="No hay casos" description="Cree un caso para comenzar." />
          ) : (
            <DataTable columns={columns} data={recentCases} keyFn={(r) => r.id} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
