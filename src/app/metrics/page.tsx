'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard,
  Activity,
  CheckCircle,
  Shield,
  AlertCircle,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { ServiceStatus } from '@/components/ui/ServiceStatus';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PipelineTimeline } from '@/components/ui/PipelineTimeline';
import { mapCaseTypeToVertical } from '@/lib/billing-utils';
import type { Case } from '@/core/types';

function parseCasesResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data !== null && typeof data === 'object' && 'cases' in data) {
    const c = (data as Record<string, unknown>).cases;
    return Array.isArray(c) ? c : [];
  }
  return [];
}

function toCase(c: unknown): Case | null {
  if (c === null || typeof c !== 'object') return null;
  const o = c as Record<string, unknown>;
  const id = o.id;
  const cn = o.case_number;
  const st = o.status;
  const ct = o.case_type;
  const pd = o.property_data;
  const aa = o.assigned_appraiser;
  const ac = o.ai_confidence;
  const acu = o.ai_cost_usd;
  const cb = o.created_by;
  const ca = o.created_at;
  const ua = o.updated_at;
  const tid = o.tenant_id;
  if (
    typeof cn !== 'string' ||
    typeof st !== 'string' ||
    typeof ct !== 'string' ||
    typeof ca !== 'string' ||
    typeof tid !== 'string'
  ) {
    return null;
  }
  return {
    id: typeof id === 'string' ? id : '',
    tenant_id: tid,
    case_number: cn,
    status: st,
    case_type: ct,
    property_data:
      pd !== null && typeof pd === 'object' && !Array.isArray(pd)
        ? (pd as Record<string, unknown>)
        : {},
    assigned_appraiser: typeof aa === 'string' ? aa : null,
    ai_confidence: typeof ac === 'number' && Number.isFinite(ac) ? ac : null,
    ai_cost_usd: typeof acu === 'number' && Number.isFinite(acu) ? acu : null,
    created_by: typeof cb === 'string' ? cb : null,
    created_at: ca,
    updated_at: typeof ua === 'string' ? ua : ca,
  };
}

function getAddress(c: unknown): string {
  if (c === null || typeof c !== 'object') return '—';
  const o = c as Record<string, unknown>;
  const pd = o.property_data;
  if (pd !== null && typeof pd === 'object' && !Array.isArray(pd)) {
    const a = (pd as Record<string, unknown>).address;
    if (typeof a === 'string') return a;
  }
  return '—';
}

function getAiCostUsd(c: unknown): number {
  if (c === null || typeof c !== 'object') return 0;
  const o = c as Record<string, unknown>;
  const v = o.ai_cost_usd;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function getCreatedAt(c: unknown): string {
  if (c === null || typeof c !== 'object') return '';
  const o = c as Record<string, unknown>;
  const v = o.created_at;
  return typeof v === 'string' ? v : '';
}

export default function MetricsPage() {
  const [cases, setCases] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setCases(parseCasesResponse(data));
    } catch {
      setError('Error al conectar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolvedCases = useMemo(
    () => cases.map(toCase).filter((c): c is Case => c !== null),
    [cases]
  );

  const totalCases = resolvedCases.length;
  const inPipeline = resolvedCases.filter(
    (c) => !['delivered', 'approved', 'cancelled'].includes(c.status)
  ).length;
  const delivered = resolvedCases.filter((c) => c.status === 'delivered').length;
  const approved = resolvedCases.filter((c) => c.status === 'approved').length;
  const qaFailed = resolvedCases.filter((c) => c.status === 'qa_failed').length;
  const qaPassed = resolvedCases.filter((c) => c.status === 'qa_passed').length;

  const confidences = resolvedCases
    .map((c) => c.ai_confidence)
    .filter((v): v is number => v != null && Number.isFinite(v));
  const avgConfidence =
    confidences.length > 0
      ? (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100
      : null;

  const costosPorVertical = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const c of resolvedCases) {
      const v = mapCaseTypeToVertical(c.case_type);
      if (!map[v]) map[v] = { count: 0, total: 0 };
      map[v].count += 1;
      map[v].total += c.ai_cost_usd ?? 0;
    }
    return map;
  }, [resolvedCases]);

  const top10ByCost = useMemo(() => {
    return [...resolvedCases]
      .filter((c) => (c.ai_cost_usd ?? 0) > 0)
      .sort((a, b) => (b.ai_cost_usd ?? 0) - (a.ai_cost_usd ?? 0))
      .slice(0, 10);
  }, [resolvedCases]);

  const trendData = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const c of resolvedCases) {
      const d = getCreatedAt(c).slice(0, 10);
      if (d) byDay[d] = (byDay[d] ?? 0) + 1;
    }
    const arr = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
    return arr;
  }, [resolvedCases]);

  const qaPassRate =
    qaPassed + qaFailed > 0
      ? (qaPassed / (qaPassed + qaFailed)) * 100
      : null;

  const totalAiCost = resolvedCases.reduce(
    (sum, c) => sum + (c.ai_cost_usd ?? 0),
    0
  );
  const avgCostPerCase =
    totalCases > 0 ? totalAiCost / totalCases : null;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const completadosEsteMes = resolvedCases.filter((c) => {
    if (c.status !== 'delivered') return false;
    const d = new Date(c.updated_at ?? c.created_at);
    return d >= firstOfMonth && d <= now;
  }).length;

  const verticals = [
    ['real_estate', 'Inmobiliaria'],
    ['vehicles', 'Vehículos'],
    ['equipment', 'Equipos'],
    ['hotel_equipment', 'Equip. Hotel'],
    ['other', 'Otros'],
  ] as const;

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
        <div>
          <h1
            className="text-2xl font-serif text-[var(--nu-text)]"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Métricas & Analytics
          </h1>
          <p className="text-sm text-[var(--nu-text-muted)] mt-0.5">
            Visión general del pipeline y costos
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="nu-shimmer rounded-xl p-6 min-h-[120px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard
              title="Total Casos"
              value={totalCases}
              icon={LayoutDashboard}
              color="gold"
            />
            <KPICard
              title="En Pipeline"
              value={inPipeline}
              icon={Activity}
              color="blue"
            />
            <KPICard
              title="Entregados"
              value={delivered}
              icon={CheckCircle}
              color="emerald"
            />
            <KPICard
              title="Aprobados"
              value={approved}
              icon={Shield}
              color="emerald"
            />
            <KPICard
              title="QA Fallidos"
              value={qaFailed}
              icon={AlertCircle}
              color="purple"
            />
            <KPICard
              title="Confianza Prom."
              value={
                avgConfidence != null ? `${avgConfidence.toFixed(1)}%` : '—'
              }
              icon={Target}
              color="gold"
            />
          </div>
        )}

        {!loading && (
          <div>
            <h2 className="font-semibold text-[var(--nu-text)] mb-4">
              Distribución del Pipeline
            </h2>
            <PipelineTimeline cases={resolvedCases} />
          </div>
        )}

        {!loading && (
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
            <h2 className="font-semibold text-[var(--nu-text)] px-6 py-4 border-b border-[var(--nu-border)]">
              Costos por Vertical
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--nu-border)]">
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Vertical
                    </th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Casos
                    </th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Costo AI Total US$
                    </th>
                    <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Costo AI Promedio US$
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {verticals.map(([key, label]) => {
                    const d = costosPorVertical[key] ?? {
                      count: 0,
                      total: 0,
                    };
                    const avg = d.count > 0 ? d.total / d.count : 0;
                    return (
                      <tr
                        key={key}
                        className="border-b border-[var(--nu-border)]/60 hover:bg-[var(--nu-card-hover)]"
                      >
                        <td className="px-6 py-4 text-sm text-[var(--nu-text)]">
                          {label}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                          {d.count}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                          ${d.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                          ${avg.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-medium">
                    <td className="px-6 py-4 text-sm text-[var(--nu-text)]">
                      Total
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                      {totalCases}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                      ${totalAiCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                      ${avgCostPerCase != null ? avgCostPerCase.toFixed(2) : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && (
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
            <h2 className="font-semibold text-[var(--nu-text)] px-6 py-4 border-b border-[var(--nu-border)]">
              Top 10 por costo AI
            </h2>
            {top10ByCost.length === 0 ? (
              <p className="p-6 text-center text-[var(--nu-text-muted)]">
                No hay casos con costo AI registrado.
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                        Costo AI US$
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {top10ByCost.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-[var(--nu-border)]/60 hover:bg-[var(--nu-card-hover)]"
                      >
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--nu-gold)]">
                          {c.case_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                          {getAddress(c)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                          ${(c.ai_cost_usd ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <h2 className="font-semibold text-[var(--nu-text)] mb-4">
              Tendencia casos por día
            </h2>
            {trendData.length >= 3 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient
                      id="trendFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--nu-gold)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--nu-gold)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--nu-text-muted)', fontSize: 11 }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString('es-DO', {
                        day: '2-digit',
                        month: 'short',
                      })
                    }
                  />
                  <YAxis
                    tick={{ fill: 'var(--nu-text-muted)', fontSize: 11 }}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--nu-navy-mid)',
                      border: '1px solid var(--nu-border)',
                      borderRadius: '8px',
                      color: 'var(--nu-text)',
                    }}
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString('es-DO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    }
                    formatter={(val: unknown) => [`${val} casos`, 'Casos']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--nu-gold)"
                    strokeWidth={1.5}
                    fill="url(#trendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[var(--nu-text-muted)] py-8">
                Disponible con más datos históricos (mín. 3 días distintos)
              </p>
            )}
          </div>
        )}

        {!loading && (
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <h2 className="font-semibold text-[var(--nu-text)] mb-4">
              Eficiencia del Pipeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[var(--nu-text-muted)] uppercase tracking-wide">
                  QA Pass Rate
                </p>
                <p className="text-2xl font-serif text-[var(--nu-text)] mt-1">
                  {qaPassRate != null ? `${qaPassRate.toFixed(1)}%` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--nu-text-muted)] uppercase tracking-wide">
                  Costo promedio/caso
                </p>
                <p className="text-2xl font-serif text-[var(--nu-text)] mt-1">
                  {avgCostPerCase != null
                    ? `$${avgCostPerCase.toFixed(2)}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--nu-text-muted)] uppercase tracking-wide">
                  Completados este mes
                </p>
                <p className="text-2xl font-serif text-[var(--nu-text)] mt-1">
                  {completadosEsteMes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <ServiceStatus />
    </AppLayout>
  );
}
