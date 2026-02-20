'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileDown,
  Receipt,
  DollarSign,
  Building2,
  Car,
  Cpu,
  Hotel,
  Package,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ServiceStatus } from '@/components/ui/ServiceStatus';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  type VerticalPricing,
  type BillingPeriod,
  type BillingSummary,
  type BillableCase,
  DEFAULT_PRICING,
  getDefaultPeriods,
  getPricing,
  savePricing,
  filterByPeriod,
  calculateBilling,
  exportBillingCsv,
} from '@/lib/billing-utils';

import { normalizeCasesResponse } from '@/lib/case-utils';

function formatPeriodRange(period: BillingPeriod): string {
  return `${period.from.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} – ${period.to.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`;
}

function formatDop(n: number): string {
  return new Intl.NumberFormat('es-DO').format(n);
}

function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

const VERTICAL_ICONS = {
  real_estate: Building2,
  vehicles: Car,
  equipment: Cpu,
  hotel_equipment: Hotel,
  other: Package,
} as const;

export default function BillingPage() {
  const [cases, setCases] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<VerticalPricing>(() => getPricing());
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>(
    () => getDefaultPeriods()[0]
  );

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
      const data = await res.json();
      setCases(normalizeCasesResponse(data));
    } catch {
      setError('Error al conectar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const periods = getDefaultPeriods();
  const filtered = useMemo(
    () => filterByPeriod(cases, selectedPeriod),
    [cases, selectedPeriod]
  );
  const summary: BillingSummary | null = useMemo(
    () => (filtered.length >= 0 ? calculateBilling(filtered, pricing) : null),
    [filtered, pricing]
  );

  const billableCount = summary?.billableCases.length ?? 0;
  const totalDop = summary?.totalDop ?? 0;
  const avgTicket = billableCount > 0 ? totalDop / billableCount : 0;
  const totalAiUsd = summary?.totalAiCostUsd ?? 0;
  const maxByVertical =
    summary && Object.values(summary.byVertical).some((v) => v.totalDop > 0)
      ? Math.max(
          ...Object.values(summary.byVertical).map((v) => v.totalDop),
          1
        )
      : 1;

  function handlePricingChange(vertical: keyof VerticalPricing, value: number) {
    const next = { ...pricing, [vertical]: Math.max(0, value) };
    setPricing(next);
    savePricing(next);
  }

  function handleRestoreDefaults() {
    setPricing(DEFAULT_PRICING);
    savePricing(DEFAULT_PRICING);
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-[var(--nu-red)] mb-4" />
          <p className="text-[var(--nu-text)] font-medium mb-2">{error}</p>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
        <ServiceStatus />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-serif text-[var(--nu-text)]"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Facturación
            </h1>
            <p className="text-sm text-[var(--nu-text-muted)] mt-0.5">
              Tasaciones facturables y prefacturación
            </p>
          </div>
          <div className="flex gap-2">
            {summary && summary.billableCases.length > 0 && (
              <button
                type="button"
                onClick={() => exportBillingCsv(summary.billableCases)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--nu-border)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]"
              >
                <FileDown className="w-4 h-4" />
                Exportar CSV
              </button>
            )}
            <button
              type="button"
              onClick={() => alert('Disponible próximamente')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90"
            >
              <Receipt className="w-4 h-4" />
              Generar Prefactura
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map((p) => {
            const active = p.label === selectedPeriod.label;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setSelectedPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--nu-gold-dim)] text-[var(--nu-gold)] border border-[var(--nu-gold)]/20'
                    : 'bg-[var(--nu-card)] border border-[var(--nu-border)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-[var(--nu-text-muted)]">
          Rango visible: {formatPeriodRange(selectedPeriod)}
        </p>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[var(--nu-gold)]" />
            <h2 className="font-semibold text-[var(--nu-text)]">
              Tarifas por Tasación (RD$)
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(['real_estate', 'vehicles', 'equipment', 'hotel_equipment', 'other'] as const).map(
              (v) => (
                <div key={v}>
                  <label className="block text-xs text-[var(--nu-text-muted)] mb-1">
                    {v === 'real_estate'
                      ? 'Inmobiliaria'
                      : v === 'vehicles'
                        ? 'Vehículos'
                        : v === 'equipment'
                          ? 'Equipos'
                          : v === 'hotel_equipment'
                            ? 'Equip. Hotel'
                            : 'Otros'}
                  </label>
                  <input
                    type="number"
                    value={pricing[v]}
                    onChange={(e) =>
                      handlePricingChange(v, Number(e.target.value) || 0)
                    }
                    min={0}
                    className="w-full px-3 py-2 text-right rounded-lg border border-[var(--nu-border)] bg-[var(--nu-navy-light)] text-[var(--nu-text)]"
                  />
                </div>
              )
            )}
          </div>
          <p className="text-xs text-[var(--nu-text-muted)] mt-3">
            Configuración local (localStorage). No afecta otros usuarios.
          </p>
          {JSON.stringify(pricing) !== JSON.stringify(DEFAULT_PRICING) && (
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="mt-3 text-sm text-[var(--nu-gold)] hover:underline"
            >
              Restaurar defaults
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="nu-shimmer rounded-xl p-6 min-h-[140px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Tasaciones Facturables"
              value={billableCount}
              icon={Receipt}
              color="gold"
            />
            <KPICard
              title="Total Estimado RD$"
              value={formatDop(totalDop)}
              icon={DollarSign}
              color="emerald"
            />
            <KPICard
              title="Ticket Promedio RD$"
              value={billableCount > 0 ? formatDop(avgTicket) : '—'}
              icon={DollarSign}
              color="blue"
            />
            <KPICard
              title="Costo AI Interno US$"
              value={`$${totalAiUsd.toFixed(2)}`}
              icon={DollarSign}
              color="purple"
            />
          </div>
        )}

        {!loading && summary && (
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <h2 className="font-semibold text-[var(--nu-text)] mb-4">
              Desglose por vertical
            </h2>
            <div className="space-y-4">
              {(
                [
                  ['real_estate', 'Inmobiliaria'],
                  ['vehicles', 'Vehículos'],
                  ['equipment', 'Equipos'],
                  ['hotel_equipment', 'Equip. Hotel'],
                  ['other', 'Otros'],
                ] as const
              ).map(([v, label]) => {
                const data = summary.byVertical[v];
                const Icon = VERTICAL_ICONS[v];
                const pct =
                  maxByVertical > 0 ? (data.totalDop / maxByVertical) * 100 : 0;
                return (
                  <div key={v} className="flex items-center gap-4">
                    <Icon className="w-5 h-5 text-[var(--nu-text-muted)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--nu-text)]">{label}</span>
                        <span className="text-[var(--nu-text-muted)]">
                          {data.count} · RD$ {formatDop(data.totalDop)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--nu-navy-mid)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--nu-gold)]"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
          <h2 className="font-semibold text-[var(--nu-text)] px-6 py-4 border-b border-[var(--nu-border)]">
            Casos incluidos
          </h2>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="nu-shimmer h-10 rounded" />
              ))}
            </div>
          ) : !summary || summary.billableCases.length === 0 ? (
            <p className="p-8 text-center text-[var(--nu-text-muted)]">
              No hay casos facturables en este período.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--nu-border)]">
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Caso
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Vertical
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Precio DOP
                    </th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Costo AI USD
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.billableCases.slice(0, 50).map((c) => (
                    <tr
                      key={c.case_number}
                      className="border-b border-[var(--nu-border)]/60 hover:bg-[var(--nu-card-hover)]"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--nu-gold)]">
                        {c.case_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                        {c.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                        {c.verticalLabel}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                        {formatDop(c.unitPriceDop)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                        ${c.aiCostUsd.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--nu-text-muted)]">
                        {formatDateShort(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ServiceStatus />
    </AppLayout>
  );
}
