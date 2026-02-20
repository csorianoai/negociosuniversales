'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Timer,
  Target,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  normalizeCasesResponse,
  isCaseLike,
  isRecord,
  extractPropertyField,
  parseValidDate,
  type CaseLike,
} from '@/lib/case-utils';
import {
  mapCaseTypeToVertical,
  VERTICAL_LABELS,
  DEFAULT_PRICING,
  calculateBilling,
  type Vertical,
} from '@/lib/billing-utils';

const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);

const formatMoneyDop = (n: number): string =>
  'RD$' + Math.round(n).toLocaleString('es-DO');

const formatUsd = (n: number): string => '$' + n.toFixed(4);

const safeNumber = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

function getCaseId(c: CaseLike): string | null {
  const u: unknown = c;
  if (!isRecord(u)) return null;
  const v: unknown = u.id;
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function getCaseHref(c: CaseLike): string | null {
  const id = getCaseId(c);
  return id ? '/cases/' + id : null;
}

const FINAL_SET = new Set(['delivered', 'approved']);
const FAILED_SET = new Set(['qa_failed', 'compliance_failed', 'cancelled']);

const isFinal = (s: string): boolean => FINAL_SET.has(s);
const isFailed = (s: string): boolean => FAILED_SET.has(s);
const isProcessing = (s: string): boolean => s.endsWith('_processing');
const isCompletedStep = (s: string): boolean => s.endsWith('_completed');

function getStatusCategory(
  s: string
): 'pending' | 'in_progress' | 'done' | 'failed' {
  if (isFinal(s)) return 'done';
  if (isFailed(s)) return 'failed';
  if (isProcessing(s) || isCompletedStep(s)) return 'in_progress';
  return 'pending';
}

async function fetchCasesWithRetry(
  setData: (d: CaseLike[]) => void,
  setError: (e: string | null) => void,
  setLoading: (l: boolean) => void,
  retries = 3
): Promise<void> {
  setLoading(true);
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const data: unknown = await res.json();
      const raw = normalizeCasesResponse(data);
      setData(raw.filter(isCaseLike));
      setError(null);
      setLoading(false);
      return;
    } catch {
      if (i === retries - 1) {
        setError('Error al cargar datos');
        setLoading(false);
      } else {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
}

const TENANTS = [
  { id: 'banco-caribe', name: 'Banco Caribe', plan: 'enterprise', rnc: '101-012345-6' },
  { id: 'banco-confisa', name: 'Banco Confisa', plan: 'enterprise', rnc: '101-678901-2' },
  { id: 'banco-fihogar', name: 'Banco Fihogar', plan: 'pro', rnc: '101-234567-8' },
  { id: 'banco-demo', name: 'Banco Demo SA', plan: 'basic', rnc: '101-000000-0' },
  { id: 'financiera-test', name: 'Financiera Test', plan: 'basic', rnc: '101-999999-9' },
] as const;

const VERTICALS: Vertical[] = [
  'real_estate',
  'vehicles',
  'equipment',
  'hotel_equipment',
  'other',
];

export default function TenantsPage() {
  const [cases, setCases] = useState<CaseLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'in_progress' | 'done' | 'failed'
  >('all');
  const [verticalFilter, setVerticalFilter] = useState<'all' | Vertical>('all');

  const load = useCallback(
    () => fetchCasesWithRetry(setCases, setError, setLoading),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const tasacionesMes = useMemo(
    () =>
      cases.filter((c) => {
        const d = parseValidDate(c.created_at);
        return d && d >= monthStart;
      }).length,
    [cases]
  );

  const entregadas = useMemo(
    () => cases.filter((c) => isFinal(c.status)).length,
    [cases]
  );

  const pendientes = useMemo(
    () => cases.filter((c) => getStatusCategory(c.status) === 'pending').length,
    [cases]
  );

  const qaFallidas = useMemo(
    () => cases.filter((c) => c.status === 'qa_failed').length,
    [cases]
  );

  const costoTotal = useMemo(
    () => cases.reduce((sum, c) => sum + safeNumber(c.ai_cost_usd), 0),
    [cases]
  );

  const costoProm = useMemo(
    () => costoTotal / Math.max(cases.length, 1),
    [costoTotal, cases.length]
  );

  const slaPromedio = useMemo(() => {
    const delivered = cases.filter((c) => isFinal(c.status));
    const diffs: number[] = [];
    for (const c of delivered) {
      const created = parseValidDate(c.created_at);
      const updated = parseValidDate(c.updated_at ?? c.created_at);
      if (created && updated && updated > created) {
        diffs.push((updated.getTime() - created.getTime()) / 3600000);
      }
    }
    if (diffs.length === 0) return '—';
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return avg >= 24
      ? (avg / 24).toFixed(1) + 'd'
      : Math.round(avg) + 'h';
  }, [cases]);

  const confianzaProm = useMemo(() => {
    const vals = cases
      .map((c) => c.ai_confidence)
      .filter(
        (v): v is number =>
          typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1
      );
    if (vals.length === 0) return '—';
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return (avg * 100).toFixed(0) + '%';
  }, [cases]);

  const filteredCases = useMemo(() => {
    let out = cases;
    if (statusFilter !== 'all') {
      out = out.filter((c) => getStatusCategory(c.status) === statusFilter);
    }
    if (verticalFilter !== 'all') {
      out = out.filter(
        (c) =>
          mapCaseTypeToVertical(c.case_type ?? 'other') === verticalFilter
      );
    }
    out = [...out].sort((a, b) => {
      const da = parseValidDate(a.created_at)?.getTime() ?? Infinity;
      const db = parseValidDate(b.created_at)?.getTime() ?? Infinity;
      return db - da;
    });
    return out.slice(0, 50);
  }, [cases, statusFilter, verticalFilter]);

  const summary = useMemo(
    () =>
      calculateBilling(cases, DEFAULT_PRICING, ['approved', 'delivered']),
    [cases]
  );

  const historialMensual = useMemo(() => {
    const byMonth: Record<string, number> = {};
    for (const c of cases) {
      const d = parseValidDate(c.created_at);
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        byMonth[key] = (byMonth[key] ?? 0) + 1;
      }
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [cases]);

  const selectedTenantInfo = useMemo(
    () =>
      selectedTenant !== 'all'
        ? TENANTS.find((t) => t.id === selectedTenant)
        : null,
    [selectedTenant]
  );

  const maxByVertical =
    Math.max(...VERTICALS.map((v) => summary.byVertical[v].totalDop), 1);

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-white font-medium mb-2">{error}</p>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <div className="h-8 w-48 rounded bg-slate-700 animate-pulse" />
            <div className="h-4 w-64 mt-2 rounded bg-slate-700 animate-pulse" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-24 rounded bg-slate-700 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-slate-800/50 border border-slate-700 animate-pulse"
              />
            ))}
          </div>
          <div className="h-80 rounded-xl bg-slate-800/50 border border-slate-700 animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1
              className="text-2xl font-serif text-white"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Portal Bancos
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Gestión de clientes institucionales
            </p>
          </div>
          <span className="px-2 py-1 text-xs font-medium rounded bg-amber-500/5 border border-amber-500/20 text-amber-400">
            DEMO
          </span>
        </div>

        <div
          className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm text-amber-400"
          role="status"
        >
          V1: Datos globales. Filtro por banco en v2 (requiere tenant_id).
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedTenant('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTenant === 'all'
                ? 'bg-[var(--nu-gold)]/10 border border-[var(--nu-gold)]/20 text-[var(--nu-gold)]'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            Todos
          </button>
          {TENANTS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTenant(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedTenant === t.id
                  ? 'bg-[var(--nu-gold)]/10 border border-[var(--nu-gold)]/20 text-[var(--nu-gold)]'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {t.name}
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  t.plan === 'enterprise'
                    ? 'bg-[var(--nu-gold)]/10 text-[var(--nu-gold)] border border-[var(--nu-gold)]/20'
                    : t.plan === 'pro'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                {t.plan}
              </span>
            </button>
          ))}
        </div>

        {selectedTenantInfo && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Banco seleccionado</p>
            <p className="text-white font-medium">{selectedTenantInfo.name}</p>
            <p className="text-xs text-slate-400">
              Plan: {selectedTenantInfo.plan} · RNC: {selectedTenantInfo.rnc}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Tasaciones del Mes',
                value: tasacionesMes,
                icon: FileText,
                color: 'var(--nu-gold)',
              },
              {
                label: 'Entregadas',
                value: entregadas,
                icon: CheckCircle,
                color: '#34d399',
              },
              {
                label: 'Pendientes',
                value: pendientes,
                icon: Clock,
                color: '#f59e0b',
              },
              {
                label: 'QA Fallidas',
                value: qaFallidas,
                icon: AlertCircle,
                color: '#ef4444',
              },
              {
                label: 'Costo AI Total US$',
                value: formatUsd(costoTotal),
                icon: DollarSign,
                color: '#a78bfa',
              },
              {
                label: 'Costo Promedio/Caso',
                value: formatUsd(costoProm),
                icon: TrendingUp,
                color: '#60a5fa',
              },
              {
                label: 'SLA Promedio',
                value: slaPromedio,
                icon: Timer,
                color: '#22d3ee',
              },
              {
                label: 'Confianza Promedio',
                value: confianzaProm,
                icon: Target,
                color: '#34d399',
              },
            ].map((k) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.label}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 border-t-2"
                  style={{ borderTopColor: k.color }}
                >
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {k.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className="w-5 h-5 shrink-0" style={{ color: k.color }} />
                    <p
                      className="text-2xl font-serif text-white"
                      style={{ fontFamily: '"DM Serif Display", serif' }}
                    >
                      {k.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Casos</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {filteredCases.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 p-4 border-b border-slate-700">
            {(
              [
                ['all', 'Todos'],
                ['pending', 'Pendientes'],
                ['in_progress', 'En Proceso'],
                ['done', 'Terminados'],
                ['failed', 'Fallidos'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setStatusFilter(v)}
                className={`px-3 py-1.5 rounded text-sm ${
                  statusFilter === v
                    ? 'bg-[var(--nu-gold)]/20 text-[var(--nu-gold)]'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
            <span className="text-slate-500 mx-1">|</span>
            {(['all', ...VERTICALS] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVerticalFilter(v)}
                className={`px-3 py-1.5 rounded text-sm ${
                  verticalFilter === v
                    ? 'bg-[var(--nu-gold)]/20 text-[var(--nu-gold)]'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {v === 'all' ? 'Todos' : VERTICAL_LABELS[v]}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            {filteredCases.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Sin tasaciones registradas
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-slate-400">
                    <th className="px-6 py-3 font-medium">Caso</th>
                    <th className="px-6 py-3 font-medium">Propiedad</th>
                    <th className="px-6 py-3 font-medium">Vertical</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Costo AI</th>
                    <th className="px-6 py-3 font-medium">Confianza</th>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((c) => {
                    const href = getCaseHref(c);
                    const created = parseValidDate(c.created_at);
                    const conf =
                      typeof c.ai_confidence === 'number' &&
                      Number.isFinite(c.ai_confidence)
                        ? (c.ai_confidence * 100).toFixed(0) + '%'
                        : '—';
                    const cost = safeNumber(c.ai_cost_usd);
                    return (
                      <tr
                        key={c.case_number}
                        className="border-b border-slate-700/60 hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-3">
                          {href ? (
                            <Link
                              href={href}
                              className="font-mono text-[var(--nu-gold)] hover:underline"
                            >
                              {c.case_number}
                            </Link>
                          ) : (
                            <span className="font-mono text-[var(--nu-gold)] opacity-50 cursor-not-allowed">
                              {c.case_number}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-300">
                          {extractPropertyField(c.property_data, 'address')}
                        </td>
                        <td className="px-6 py-3 text-slate-300">
                          {VERTICAL_LABELS[
                            mapCaseTypeToVertical(c.case_type ?? 'other')
                          ]}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-3 text-slate-300">
                          {cost > 0 ? formatUsd(cost) : '—'}
                        </td>
                        <td className="px-6 py-3 text-slate-300">{conf}</td>
                        <td className="px-6 py-3 text-slate-400">
                          {created ? formatDate(created) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
            <h2 className="font-semibold text-white">Facturación Estimada</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              DEMO
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-slate-400">Total facturable RD$</p>
                <p className="text-xl font-serif text-white">
                  {formatMoneyDop(summary.totalDop)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Total AI US$</p>
                <p className="text-xl font-serif text-white">
                  {formatUsd(summary.totalAiCostUsd)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {VERTICALS.map((v) => {
                const d = summary.byVertical[v];
                const pct = maxByVertical > 0 ? (d.totalDop / maxByVertical) * 100 : 0;
                return (
                  <div key={v} className="flex items-center gap-4">
                    <span className="w-24 text-sm text-slate-300">
                      {VERTICAL_LABELS[v]}
                    </span>
                    <span className="text-sm text-slate-400">
                      {d.count} · RD$ {Math.round(d.totalDop).toLocaleString('es-DO')}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--nu-gold)]"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              Precios por defecto. Ajustar en /billing
            </p>
            <Link
              href="/billing"
              className="text-sm font-medium text-[var(--nu-gold)] hover:underline"
            >
              Ir a Facturación →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="font-semibold text-white mb-4">Historial Mensual</h2>
          {historialMensual.length >= 2 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={historialMensual} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Date(v + '-01').toLocaleDateString('es-DO', {
                      month: 'short',
                      year: '2-digit',
                    })
                  }
                />
                <YAxis tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }} width={32} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(30 41 59)',
                    border: '1px solid rgb(51 65 85)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  labelFormatter={(v) =>
                    new Date(String(v) + '-01').toLocaleDateString('es-DO', {
                      month: 'long',
                      year: 'numeric',
                    })
                  }
                />
                <Bar dataKey="count" fill="var(--nu-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-400 py-8">
              Disponible con más datos históricos
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
