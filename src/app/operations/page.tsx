'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  normalizeCasesResponse,
  isCaseLike,
  isRecord,
  extractPropertyField,
  parseValidDate,
  getCaseId,
  type CaseLike,
} from '@/lib/case-utils';
import { mergeWithDemoData } from '@/lib/demo-data';
import { mapCaseTypeToVertical, VERTICAL_LABELS, type Vertical } from '@/lib/billing-utils';
import { getPipelineAgents } from '@/core/agents/registry';

const safeNumber = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

function getCaseHref(c: CaseLike): string | null {
  const id = getCaseId(c);
  return id ? '/cases/' + id : null;
}

const FINAL_SET = new Set(['delivered', 'approved']);
const isFinal = (s: string): boolean => FINAL_SET.has(s);
const isProcessing = (s: string): boolean => s.endsWith('_processing');

function getStatusCategory(
  s: string
): 'pending' | 'in_progress' | 'done' | 'failed' {
  if (isFinal(s)) return 'done';
  if (['qa_failed', 'compliance_failed', 'cancelled'].includes(s)) return 'failed';
  if (isProcessing(s) || s.endsWith('_completed')) return 'in_progress';
  return 'pending';
}

async function fetchCasesWithRetry(
  setData: (d: CaseLike[]) => void,
  setError: (e: string | null) => void,
  setLoading: (l: boolean) => void,
  setUsedDemo?: (u: boolean) => void,
  retries = 3
): Promise<void> {
  setLoading(true);
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const data: unknown = await res.json();
      const raw = normalizeCasesResponse(data);
      const realCases = raw.filter(isCaseLike) as CaseLike[];
      const { merged, usedDemo } = mergeWithDemoData(realCases, 12);
      setData(merged);
      setUsedDemo?.(usedDemo);
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

function formatRelative(d: Date): string {
  const now = Date.now();
  const diff = now - d.getTime();
  const h = diff / 3600000;
  const d2 = diff / 86400000;
  if (d2 >= 1) return 'hace ' + Math.round(d2) + 'd';
  if (h >= 1) return 'hace ' + Math.round(h) + 'h';
  const m = diff / 60000;
  return m >= 1 ? 'hace ' + Math.round(m) + 'm' : 'ahora';
}

const TENANTS = [
  { id: 'banco-caribe', name: 'Banco Caribe' },
  { id: 'banco-confisa', name: 'Banco Confisa' },
  { id: 'banco-fihogar', name: 'Banco Fihogar' },
  { id: 'banco-demo', name: 'Banco Demo SA' },
  { id: 'financiera-test', name: 'Financiera Test' },
] as const;

const VERTICAL_COLORS: Record<Vertical, string> = {
  real_estate: '#C9A84C',
  vehicles: '#60A5FA',
  equipment: '#A78BFA',
  hotel_equipment: '#34D399',
  other: '#94A3B8',
};

type TabId = 'queues' | 'sla' | 'trends' | 'distribution';

export default function OperationsPage() {
  const [cases, setCases] = useState<CaseLike[]>([]);
  const [usedDemo, setUsedDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('queues');

  const load = useCallback(
    () => fetchCasesWithRetry(setCases, setError, setLoading, setUsedDemo),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const agents = getPipelineAgents();

  const byCategory = useMemo(() => {
    const m: Record<string, CaseLike[]> = {
      pending: [],
      in_progress: [],
      done: [],
      failed: [],
    };
    for (const c of cases) {
      const cat = getStatusCategory(c.status);
      m[cat].push(c);
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => {
        const da = parseValidDate(a.created_at)?.getTime() ?? 0;
        const db = parseValidDate(b.created_at)?.getTime() ?? 0;
        return db - da;
      });
    }
    return m;
  }, [cases]);

  const stuck = useMemo(() => {
    const ms24 = 24 * 60 * 60 * 1000;
    return cases.filter((c) => {
      if (!isProcessing(c.status)) return false;
      const u = parseValidDate(c.updated_at ?? c.created_at);
      if (!u) return false;
      return now.getTime() - u.getTime() > ms24;
    });
  }, [cases]);

  const delivered = useMemo(
    () => cases.filter((c) => isFinal(c.status)),
    [cases]
  );

  const e2eHours = useMemo(() => {
    const hrs: number[] = [];
    for (const c of delivered) {
      const created = parseValidDate(c.created_at);
      const updated = parseValidDate(c.updated_at ?? c.created_at);
      if (created && updated && updated > created) {
        hrs.push((updated.getTime() - created.getTime()) / 3600000);
      }
    }
    return hrs;
  }, [delivered]);

  const slaByVertical = useMemo(() => {
    const m: Record<Vertical, number[]> = {} as Record<Vertical, number[]>;
    for (const v of ['real_estate', 'vehicles', 'equipment', 'hotel_equipment', 'other'] as const) {
      m[v] = [];
    }
    for (const c of delivered) {
      const created = parseValidDate(c.created_at);
      const updated = parseValidDate(c.updated_at ?? c.created_at);
      if (created && updated && updated > created) {
        const v = mapCaseTypeToVertical(c.case_type ?? 'other');
        m[v].push((updated.getTime() - created.getTime()) / 3600000);
      }
    }
    return m;
  }, [delivered]);

  const trendDaily = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const c of cases) {
      const d = parseValidDate(c.created_at);
      if (d) {
        const k = d.toISOString().slice(0, 10);
        byDay[k] = (byDay[k] ?? 0) + 1;
      }
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [cases]);

  const costDaily = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const c of cases) {
      const d = parseValidDate(c.created_at);
      const cost = safeNumber(c.ai_cost_usd);
      if (d && cost > 0) {
        const k = d.toISOString().slice(0, 10);
        byDay[k] = (byDay[k] ?? 0) + cost;
      }
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost]) => ({ date, cost }));
  }, [cases]);

  const qaPassed = cases.filter((c) => c.status === 'qa_passed').length;
  const qaFailed = cases.filter((c) => c.status === 'qa_failed').length;
  const qaTotal = qaPassed + qaFailed;

  const byVertical = useMemo(() => {
    const m: Record<Vertical, number> = {
      real_estate: 0,
      vehicles: 0,
      equipment: 0,
      hotel_equipment: 0,
      other: 0,
    };
    for (const c of cases) {
      m[mapCaseTypeToVertical(c.case_type ?? 'other')]++;
    }
    return Object.entries(m).map(([v, count]) => ({
      name: VERTICAL_LABELS[v as Vertical],
      value: count,
      color: VERTICAL_COLORS[v as Vertical],
    }));
  }, [cases]);

  const byStatus = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of cases) {
      m[c.status] = (m[c.status] ?? 0) + 1;
    }
    return Object.entries(m)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([status, count]) => ({
        status: status.replace(/_/g, ' '),
        count,
      }));
  }, [cases]);

  const timeBins = useMemo(() => {
    if (e2eHours.length < 5) return [];
    const bins = [
      { range: '0–2h', min: 0, max: 2, count: 0 },
      { range: '2–4h', min: 2, max: 4, count: 0 },
      { range: '4–8h', min: 4, max: 8, count: 0 },
      { range: '8–24h', min: 8, max: 24, count: 0 },
      { range: '24h+', min: 24, max: Infinity, count: 0 },
    ];
    for (const h of e2eHours) {
      for (const b of bins) {
        if (h >= b.min && h < b.max) {
          b.count++;
          break;
        }
      }
    }
    const colors = ['#34d399', '#84cc16', '#eab308', '#f97316', '#ef4444'];
    return bins.map((b, i) => ({ ...b, fill: colors[i] }));
  }, [e2eHours]);

  const formatHours = (h: number): string =>
    h >= 24 ? (h / 24).toFixed(1) + 'd' : Math.round(h) + 'h';

  const totalPipelineSec = agents.reduce((s, a) => s + a.estimatedDurationSeconds, 0);

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
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
            {[1, 2, 3, 4].map((i) => (
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

  const tabs: { id: TabId; label: string }[] = [
    { id: 'queues', label: 'Colas' },
    { id: 'sla', label: 'SLAs' },
    { id: 'trends', label: 'Tendencias' },
    { id: 'distribution', label: 'Distribución' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {usedDemo && (
          <div className="rounded-lg px-3 py-2 bg-amber-500/15 border border-amber-500/40 flex items-center gap-2">
            <span className="text-xs font-medium text-amber-400 rounded-full px-2 py-0.5 bg-amber-500/25">DEMO</span>
            <span className="text-sm text-slate-400">Datos demo como complemento</span>
          </div>
        )}
        <div>
          <h1
            className="text-2xl font-serif text-white"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Operaciones
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitoreo de colas, SLAs y rendimiento
          </p>
        </div>

        <div className="flex gap-0 border-b border-slate-700 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'border-b-2 border-[var(--nu-gold)] text-[var(--nu-gold)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'queues' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  cat: 'pending' as const,
                  title: 'Pendientes',
                  icon: Clock,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10',
                },
                {
                  cat: 'in_progress' as const,
                  title: 'En Proceso',
                  icon: Activity,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                },
                {
                  cat: 'done' as const,
                  title: 'Terminadas',
                  icon: CheckCircle,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
                },
                {
                  cat: 'failed' as const,
                  title: 'Fallidas',
                  icon: XCircle,
                  color: 'text-red-400',
                  bg: 'bg-red-500/10',
                },
              ].map((q) => {
                const list = byCategory[q.cat].slice(0, 5);
                const Icon = q.icon;
                return (
                  <div
                    key={q.cat}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden"
                  >
                    <div
                      className={`px-4 py-3 flex items-center justify-between ${q.bg}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${q.color}`} />
                        <span className="font-semibold text-white">
                          {q.title}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {byCategory[q.cat].length}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      {list.map((c) => {
                        const href = getCaseHref(c);
                        const created = parseValidDate(c.created_at);
                        return (
                          <div
                            key={c.case_number}
                            className="text-sm"
                          >
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
                            <p className="text-slate-400 truncate">
                              {extractPropertyField(c.property_data, 'address')}
                            </p>
                            <p className="text-xs text-slate-500">
                              {created ? formatRelative(created) : '—'}
                            </p>
                          </div>
                        );
                      })}
                      {byCategory[q.cat].length > 5 && (
                        <Link
                          href="/cases"
                          className="text-sm text-[var(--nu-gold)] hover:underline"
                        >
                          Ver todos →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between bg-red-500/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-white">
                    Casos Estancados
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {stuck.length}
                </span>
              </div>
              <div className="p-4">
                {stuck.length > 0 ? (
                  <div className="space-y-2">
                    {stuck.slice(0, 10).map((c) => {
                      const updated = parseValidDate(c.updated_at ?? c.created_at);
                      const hrs = updated
                        ? Math.round(
                            (now.getTime() - updated.getTime()) / 3600000
                          )
                        : 0;
                      return (
                        <div
                          key={c.case_number}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-mono text-[var(--nu-gold)]">
                            {c.case_number}
                          </span>
                          <span className="text-slate-400">{c.status}</span>
                          <span className="text-red-400">{hrs}h estancado</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                    Sin casos estancados
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sla' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                Tiempos por Etapa del Pipeline
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Estimado/DEMO
                </span>
              </h3>
              <div className="space-y-2">
                {agents.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-300">{a.nameShort}</span>
                    <span className="text-slate-400">
                      {a.estimatedDurationSeconds}s
                      <span className="ml-2 text-xs text-amber-400">
                        Estimado
                      </span>
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-700 font-medium text-white">
                  Total estimado: ~{totalPipelineSec >= 60 ? (totalPipelineSec / 60).toFixed(0) + 'm' : totalPipelineSec + 's'}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">
                Tiempo End-to-End Real
              </h3>
              {e2eHours.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Mín</p>
                    <p className="text-xl font-serif text-white">
                      {formatHours(Math.min(...e2eHours))}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Promedio</p>
                    <p className="text-xl font-serif text-white">
                      {formatHours(
                        e2eHours.reduce((a, b) => a + b, 0) / e2eHours.length
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Máx</p>
                    <p className="text-xl font-serif text-white">
                      {formatHours(Math.max(...e2eHours))}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Sin datos de entrega aún</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              <h3 className="font-semibold text-white px-6 py-4 border-b border-slate-700">
                SLA por Vertical
              </h3>
              {delivered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="px-6 py-3 text-left">Vertical</th>
                        <th className="px-6 py-3 text-right">Casos</th>
                        <th className="px-6 py-3 text-right">Promedio</th>
                        <th className="px-6 py-3 text-right">Min</th>
                        <th className="px-6 py-3 text-right">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(['real_estate', 'vehicles', 'equipment', 'hotel_equipment', 'other'] as const).map(
                        (v) => {
                          const arr = slaByVertical[v];
                          const n = arr.length;
                          const avg =
                            n > 0
                              ? arr.reduce((a, b) => a + b, 0) / n
                              : 0;
                          return (
                            <tr
                              key={v}
                              className="border-b border-slate-700 hover:bg-slate-800/30"
                            >
                              <td className="px-6 py-3 text-white">
                                {VERTICAL_LABELS[v]}
                              </td>
                              <td className="px-6 py-3 text-right text-slate-300">
                                {n}
                              </td>
                              <td className="px-6 py-3 text-right text-slate-300">
                                {n > 0 ? formatHours(avg) : '—'}
                              </td>
                              <td className="px-6 py-3 text-right text-slate-300">
                                {n > 0 ? formatHours(Math.min(...arr)) : '—'}
                              </td>
                              <td className="px-6 py-3 text-right text-slate-300">
                                {n > 0 ? formatHours(Math.max(...arr)) : '—'}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-6 text-slate-400">Sin datos de entrega aún</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">
                Distribución de Tiempos
              </h3>
              {timeBins.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timeBins} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="range"
                      tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }} width={32} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(30 41 59)',
                        border: '1px solid rgb(51 65 85)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Bar dataKey="count" fill="#C9A84C" radius={[4, 4, 0, 0]}>
                      {timeBins.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400">Disponible con más datos de entrega</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">Casos por Día</h3>
              {trendDaily.length >= 3 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={trendDaily}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="trendFill2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--nu-gold)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--nu-gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }} width={32} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(30 41 59)',
                        border: '1px solid rgb(51 65 85)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--nu-gold)"
                      fill="url(#trendFill2)"
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400">
                  Disponible con más datos históricos (mín. 3 días)
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">
                Tasa QA Pass/Fail
              </h3>
              {qaTotal > 0 ? (
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Passed', value: qaPassed, color: '#34d399' },
                          { name: 'Failed', value: qaFailed, color: '#ef4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Passed', value: qaPassed, color: '#34d399' },
                          { name: 'Failed', value: qaFailed, color: '#ef4444' },
                        ].map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div>
                    <p className="text-slate-300">
                      Passed: {qaPassed} ({qaTotal > 0 ? ((qaPassed / qaTotal) * 100).toFixed(0) : 0}%)
                    </p>
                    <p className="text-slate-300">
                      Failed: {qaFailed} ({qaTotal > 0 ? ((qaFailed / qaTotal) * 100).toFixed(0) : 0}%)
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Sin datos QA aún</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">
                Costo AI Diario
              </h3>
              {costDaily.length >= 3 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={costDaily}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }} width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(30 41 59)',
                        border: '1px solid rgb(51 65 85)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                      formatter={(v: unknown) => [`$${Number(v).toFixed(4)}`, 'Costo']}
                    />
                    <Bar dataKey="cost" fill="var(--nu-gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400">
                  Disponible con más datos (mín. 3 días con costo)
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">Throughput</h3>
              {delivered.length >= 14 ? (
                <p className="text-slate-300">
                  ~{(delivered.length / 4).toFixed(1)} casos/semana (últimas 4 semanas)
                </p>
              ) : delivered.length > 0 ? (
                <p className="text-slate-300">
                  ~{(delivered.length / 7).toFixed(1)} casos/día (últimos 7 días)
                </p>
              ) : (
                <p className="text-slate-400">Sin datos de entrega aún</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">Por Vertical</h3>
              {byVertical.some((x) => x.value > 0) ? (
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={byVertical}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {byVertical.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1">
                    {byVertical.map((e) => (
                      <div key={e.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                        {e.name}: {e.value} (
                        {cases.length > 0
                          ? ((e.value / cases.length) * 100).toFixed(0)
                          : 0}
                        %)
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Sin datos</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4">Por Status</h3>
              {byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(200, byStatus.length * 32)}>
                  <BarChart
                    data={byStatus}
                    layout="vertical"
                    margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                  >
                    <XAxis type="number" tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="status"
                      width={120}
                      tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(30 41 59)',
                        border: '1px solid rgb(51 65 85)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Bar dataKey="count" fill="var(--nu-gold)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400">Sin datos</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                Por Banco
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  DEMO
                </span>
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Distribución por banco en v2 (requiere tenant_id)
              </p>
              <div className="space-y-2">
                {TENANTS.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-300">{t.name}</span>
                    <span className="text-slate-500">—</span>
                    <div className="w-24 h-2 rounded-full bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
