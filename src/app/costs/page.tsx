'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FileDown,
  BarChart3,
  DollarSign,
  TrendingUp,
  Cpu,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ServiceStatus } from '@/components/ui/ServiceStatus';

interface CaseLike {
  case_number: string;
  status: string;
  case_type: string;
  created_at: string;
  updated_at?: string;
  property_data: unknown;
  ai_cost_usd?: unknown;
  ai_confidence?: unknown;
}

function isCaseLike(obj: unknown): obj is CaseLike {
  if (obj === null || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.case_number === 'string' &&
    typeof o.status === 'string' &&
    typeof o.case_type === 'string' &&
    typeof o.created_at === 'string' &&
    (o.property_data === null || (typeof o.property_data === 'object' && !Array.isArray(o.property_data)))
  );
}

function getNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function getAddress(propertyData: unknown): string {
  if (propertyData === null || typeof propertyData !== 'object') return '—';
  const pd = propertyData as Record<string, unknown>;
  const a = pd.address;
  if (typeof a === 'string') return a;
  if (a !== null && typeof a === 'object' && !Array.isArray(a)) {
    const full = (a as Record<string, unknown>).full;
    if (typeof full === 'string') return full;
  }
  return '—';
}

function getConfidencePercent(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return `${(v * 100).toFixed(0)}%`;
  }
  return '—';
}

function parseCasesResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data !== null && typeof data === 'object' && 'cases' in data) {
    const c = (data as Record<string, unknown>).cases;
    return Array.isArray(c) ? c : [];
  }
  return [];
}

function escapeCsvCell(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const AGENT_DEMO_DATA = [
  { agent: 'Intake', model: 'Claude Haiku', costPerRun: 0.008, color: '#C9A84C' },
  { agent: 'Research', model: 'Claude Sonnet', costPerRun: 0.045, color: '#60A5FA' },
  { agent: 'Comparable', model: 'Claude Haiku', costPerRun: 0.012, color: '#A78BFA' },
  { agent: 'Report Writer', model: 'Claude Sonnet', costPerRun: 0.078, color: '#34D399' },
  { agent: 'QA', model: 'Claude Haiku', costPerRun: 0.009, color: '#F87171' },
  { agent: 'Compliance', model: 'Claude Haiku', costPerRun: 0.008, color: '#FBBF24' },
];

export default function CostsPage() {
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

  const validCases = useMemo(
    () => cases.filter(isCaseLike),
    [cases]
  );

  const totalAiCostUsd = useMemo(
    () => validCases.reduce((sum, c) => sum + getNumber(c.ai_cost_usd), 0),
    [validCases]
  );

  const avgCostPerCase = validCases.length > 0 ? totalAiCostUsd / validCases.length : 0;
  const casesWithCost = validCases.filter((c) => getNumber(c.ai_cost_usd) > 0).length;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const costThisMonth = useMemo(
    () =>
      validCases
        .filter((c) => {
          const d = new Date(c.created_at);
          return d >= firstOfMonth && d <= now;
        })
        .reduce((sum, c) => sum + getNumber(c.ai_cost_usd), 0),
    [validCases]
  );

  const daysElapsed = now.getDate();
  const monthlyProjection =
    daysElapsed > 0 ? (costThisMonth / daysElapsed) * 30 : 0;

  const top10 = useMemo(
    () =>
      [...validCases]
        .filter((c) => getNumber(c.ai_cost_usd) > 0)
        .sort((a, b) => getNumber(b.ai_cost_usd) - getNumber(a.ai_cost_usd))
        .slice(0, 10),
    [validCases]
  );

  const trendDaily = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const c of validCases) {
      const d = c.created_at.slice(0, 10);
      if (d) byDay[d] = (byDay[d] ?? 0) + getNumber(c.ai_cost_usd);
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost]) => ({ date, cost }));
  }, [validCases]);

  const estimatedPerAgent = validCases.length / 6;

  function handleExportCsv() {
    const headers = [
      'date',
      'case_number',
      'address',
      'status',
      'ai_cost_usd',
      'ai_confidence',
      'created_at',
    ];
    const rows = validCases.map((c) => [
      c.created_at.slice(0, 10),
      escapeCsvCell(c.case_number),
      escapeCsvCell(getAddress(c.property_data)),
      escapeCsvCell(c.status),
      String(getNumber(c.ai_cost_usd).toFixed(2)),
      getConfidencePercent(c.ai_confidence),
      escapeCsvCell(c.created_at),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `costos-ai-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  const accentMap: Record<string, string> = {
    gold: 'var(--nu-gold)',
    blue: 'var(--nu-blue)',
    purple: 'var(--nu-purple)',
    emerald: 'var(--nu-emerald)',
  };
  const kpiCards = [
    { title: 'Costo Total US$', value: `$${totalAiCostUsd.toFixed(2)}`, icon: DollarSign, gradient: 'from-[var(--nu-gold)]', accent: accentMap.gold },
    { title: 'Costo Promedio/Caso', value: `$${avgCostPerCase.toFixed(3)}`, icon: TrendingUp, gradient: 'from-[var(--nu-blue)]', accent: accentMap.blue },
    { title: 'Casos con Costo', value: casesWithCost, icon: Cpu, gradient: 'from-[var(--nu-purple)]', accent: accentMap.purple },
    { title: 'Proyección Mensual', value: `$${monthlyProjection.toFixed(2)}`, icon: Clock, gradient: 'from-[var(--nu-emerald)]', accent: accentMap.emerald },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-serif text-[var(--nu-text)]"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Costos AI
            </h1>
            <p className="text-sm text-[var(--nu-text-muted)] mt-0.5">
              Análisis de costos por caso y proyecciones
            </p>
          </div>
          <div className="flex gap-2">
            {validCases.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--nu-border)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)]"
              >
                <FileDown className="w-4 h-4" />
                Exportar CSV
              </button>
            )}
            <Link
              href="/metrics"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90"
            >
              <BarChart3 className="w-4 h-4" />
              Ver Métricas
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="nu-shimmer rounded-xl p-6 min-h-[120px]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((k, i) => {
              const Icon = k.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--nu-border)] p-6 bg-[var(--nu-card)] hover:bg-[var(--nu-card-hover)] transition-all"
                >
                  <div
                    className={`h-0.5 -mx-6 -mt-6 mb-4 rounded-t-xl bg-gradient-to-r ${k.gradient} to-transparent`}
                    aria-hidden
                  />
                  <div className="flex justify-between">
                    <p className="text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      {k.title}
                    </p>
                    <Icon className="w-5 h-5 shrink-0" style={{ color: k.accent }} />
                  </div>
                  <p
                    className="mt-1 text-2xl font-serif text-[var(--nu-text)]"
                    style={{ fontFamily: '"DM Serif Display", serif' }}
                  >
                    {k.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <h2 className="font-semibold text-[var(--nu-text)] mb-4">
              Tendencia de Costos
            </h2>
            {loading ? (
              <div className="nu-shimmer h-[250px] rounded" />
            ) : trendDaily.length >= 3 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={trendDaily}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--nu-gold)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--nu-gold)" stopOpacity={0} />
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
                    width={40}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--nu-navy-mid)',
                      border: '1px solid var(--nu-border)',
                      borderRadius: '8px',
                      color: 'var(--nu-text)',
                    }}
                    formatter={(val: unknown) => [`$${Number(val).toFixed(2)}`, 'Costo']}
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString('es-DO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="var(--nu-gold)"
                    strokeWidth={1.5}
                    fill="url(#costFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-[var(--nu-text-muted)]">
                Disponible con más datos históricos (mín. 3 días)
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-400">
                DEMO
              </span>
              <h2 className="font-semibold text-[var(--nu-text)]">
                Distribución por Agente
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={AGENT_DEMO_DATA}
                  dataKey="costPerRun"
                  nameKey="agent"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  label={false}
                >
                  {AGENT_DEMO_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value, entry) => {
                    const d = AGENT_DEMO_DATA.find((a) => a.agent === value);
                    return `${value} $${d?.costPerRun.toFixed(3) ?? '0'}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--nu-border)]">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-400">
              DEMO
            </span>
            <h2 className="font-semibold text-[var(--nu-text)]">
              Detalle por Agente
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--nu-border)]">
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                    Costo/Ejecución
                  </th>
                  <th className="px-6 py-3 text-right text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                    Costo Estimado Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {AGENT_DEMO_DATA.map((a, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--nu-border)]/60 hover:bg-[var(--nu-card-hover)]"
                  >
                    <td className="px-6 py-4 text-sm text-[var(--nu-text)]">
                      {a.agent}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                      {a.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                      ${a.costPerRun.toFixed(3)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                      ${(a.costPerRun * estimatedPerAgent).toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
          <h2 className="font-semibold text-[var(--nu-text)] px-6 py-4 border-b border-[var(--nu-border)]">
            Top 10 Casos Más Costosos
          </h2>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="nu-shimmer h-12 rounded" />
              ))}
            </div>
          ) : top10.length === 0 ? (
            <p className="p-8 text-center text-[var(--nu-text-muted)]">
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
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                      Confianza
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map((c) => (
                    <tr
                      key={c.case_number}
                      className="border-b border-[var(--nu-border)]/60 hover:bg-[var(--nu-card-hover)]"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--nu-gold)]">
                        {c.case_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                        {getAddress(c.property_data)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-tabular text-[var(--nu-text)]">
                        ${getNumber(c.ai_cost_usd).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--nu-text-muted)]">
                        {getConfidencePercent(c.ai_confidence)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--nu-gold)]/20 bg-[var(--nu-gold-dim)] p-6">
          <p className="text-sm text-[var(--nu-text)]">
            <strong>Insight:</strong> El costo promedio por caso es $
            {avgCostPerCase.toFixed(2)} USD. Con el modelo híbrido Haiku/Sonnet el
            costo estimado es ~$0.16/caso.
          </p>
        </div>
      </div>
      <ServiceStatus />
    </AppLayout>
  );
}
