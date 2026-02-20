'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  CheckCircle,
  DollarSign,
  PlusCircle,
  AlertCircle,
  Clock,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PipelineTimeline } from '@/components/ui/PipelineTimeline';
import { ServiceStatus } from '@/components/ui/ServiceStatus';
import { formatDateDO, formatRelativeShort } from '@/lib/format';
import {
  normalizeCasesResponse,
  isCaseLike,
  parseValidDate,
  extractPropertyNumber,
  getCaseId,
  isRecord,
} from '@/lib/case-utils';
import { mergeWithDemoData } from '@/lib/demo-data';
import { mapCaseTypeToVertical, VERTICAL_LABELS } from '@/lib/billing-utils';
import type { CaseLike } from '@/lib/case-utils';
import { DEMO_MODE, demoCases } from '@/lib/demo-data';

function getAddress(c: CaseLike): string {
  const pd = c.property_data;
  if (pd && isRecord(pd) && 'address' in pd) {
    const a = pd.address;
    return typeof a === 'string' ? a : 'Sin dirección';
  }
  return 'Sin dirección';
}

function getVertical(c: CaseLike): string {
  const v = mapCaseTypeToVertical(c.case_type ?? '');
  return VERTICAL_LABELS[v] ?? c.case_type ?? '—';
}

const PIPELINE_STATUS = new Set(['pending_intake', 'intake_processing', 'intake_completed', 'research_processing', 'research_completed', 'comparable_processing', 'comparable_completed', 'report_processing', 'report_completed', 'qa_processing', 'compliance_processing']);
const ENTREGADOS_STATUS = new Set(['delivered', 'approved']);

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseLike[]>([]);
  const [usedDemo, setUsedDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.status === 401) {
        router.push('/login');
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
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const total = cases.length;
  const enPipeline = cases.filter((c) => PIPELINE_STATUS.has(c.status)).length;
  const entregados = cases.filter((c) => ENTREGADOS_STATUS.has(c.status)).length;
  const costoTotal = cases.reduce((sum, c) => sum + (Number.isFinite(c.ai_cost_usd) ? (c.ai_cost_usd ?? 0) : 0), 0);
  const valorTotal = useMemo(() => {
    let s = 0;
    for (const c of cases) {
      const v = c.property_data && isRecord(c.property_data) ? extractPropertyNumber(c.property_data, 'valuation_point', 0) : 0;
      if (Number.isFinite(v)) s += v;
    }
    return s;
  }, [cases]);
  const confianzaValues = useMemo(() => {
    const arr: number[] = [];
    for (const c of cases) {
      const v = c.ai_confidence;
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1) arr.push(v);
    }
    return arr;
  }, [cases]);
  const confianzaProm = confianzaValues.length > 0
    ? (confianzaValues.reduce((a, b) => a + b, 0) / confianzaValues.length) * 100
    : null;
  const qaPassed = cases.filter((c) => c.status === 'qa_passed').length;
  const qaFailed = cases.filter((c) => c.status === 'qa_failed').length;
  const tasaExito =
    qaPassed + qaFailed > 0 ? (qaPassed / (qaPassed + qaFailed)) * 100 : 0;

  const recentCases = useMemo(() => {
    return [...cases]
      .sort((a, b) => {
        const da = parseValidDate(a.created_at)?.getTime() ?? 0;
        const db = parseValidDate(b.created_at)?.getTime() ?? 0;
        return db - da;
      })
      .slice(0, 12);
  }, [cases]);

  const chartByDay = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const c of cases) {
      const d = parseValidDate(c.created_at);
      if (!d) continue;
      const key = d.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] ?? 0) + 1;
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({ day: day.slice(8) + '/' + day.slice(5, 7), count }));
  }, [cases]);

  const activities = useMemo(() => {
    return [...cases]
      .sort((a, b) => {
        const da = parseValidDate(a.created_at)?.getTime() ?? 0;
        const db = parseValidDate(b.created_at)?.getTime() ?? 0;
        return db - da;
      })
      .slice(0, 5)
      .map((c) => {
        let action = 'actualizado';
        if (c.status === 'delivered') action = 'entregado';
        else if (c.status.includes('report')) action = 'en informe';
        else if (c.status.includes('qa_failed') || c.status.includes('compliance_failed'))
          action = 'fallido';
        else if (
          ['pending_intake', 'intake_processing', 'intake_completed'].includes(c.status)
        )
          action = 'pendiente';
        return {
          case_number: c.case_number,
          action,
          created_at: c.created_at,
          status: c.status,
        };
      });
  }, [cases]);

  if (error && !degraded) {
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
        {usedDemo && (
          <div className="rounded-lg px-3 py-2 bg-amber-500/15 border border-amber-500/40 flex items-center gap-2">
            <span className="text-xs font-medium text-amber-400 rounded-full px-2 py-0.5 bg-amber-500/25">DEMO</span>
            <span className="text-sm text-[var(--nu-text-muted)]">Datos demo como complemento para la presentación</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-serif text-[var(--nu-text)]"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Dashboard
            </h1>
            <p className="text-sm text-[var(--nu-text-muted)] mt-0.5">
              {enPipeline} activos · {new Date().toLocaleDateString('es-DO')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--nu-border)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)] transition-colors"
            >
              Exportar
            </button>
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-4 h-4" />
              Nuevo Caso
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Total Casos"
            value={loading ? '—' : total}
            icon={LayoutDashboard}
            trend={enPipeline > 0 ? `+${enPipeline} activos` : undefined}
            color="gold"
            skeleton={loading}
          />
          <KPICard
            title="En Pipeline"
            value={loading ? '—' : enPipeline}
            icon={Activity}
            color="blue"
            skeleton={loading}
          />
          <KPICard
            title="Entregados"
            value={loading ? '—' : entregados}
            icon={CheckCircle}
            trend={tasaExito > 0 ? `${tasaExito.toFixed(1)}% éxito` : undefined}
            color="emerald"
            skeleton={loading}
          />
          <KPICard
            title="Costo AI Total (US$)"
            value={loading ? '—' : `$${costoTotal.toFixed(2)}`}
            icon={DollarSign}
            trend={
              total > 0 ? `~$${(costoTotal / total).toFixed(3)}/caso` : undefined
            }
            color="purple"
            skeleton={loading}
          />
          <KPICard
            title="Valor Total Est. (RD$)"
            value={loading ? '—' : valorTotal > 0 ? `RD$${Math.round(valorTotal).toLocaleString('es-DO')}` : '—'}
            icon={TrendingUp}
            color="gold"
            skeleton={loading}
          />
          <KPICard
            title="Confianza Prom."
            value={loading ? '—' : confianzaProm != null ? `${confianzaProm.toFixed(1)}%` : '—'}
            icon={Shield}
            color="emerald"
            skeleton={loading}
          />
        </div>

        <PipelineTimeline cases={cases} />

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-4 md:p-6">
          <h2 className="font-semibold text-[var(--nu-text)] mb-4">Casos por día</h2>
          {chartByDay.length >= 3 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fill: 'var(--nu-text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--nu-text-muted)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--nu-navy-light)', border: '1px solid var(--nu-border)' }}
                    labelStyle={{ color: 'var(--nu-text)' }}
                  />
                  <Bar dataKey="count" fill="var(--nu-gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[var(--nu-border)] rounded-lg bg-[var(--nu-navy-light)]/30">
              <TrendingUp className="w-10 h-10 text-[var(--nu-gold)]/50 mb-2" />
              <p className="text-sm text-[var(--nu-text-secondary)]">Actividad reciente</p>
              <p className="text-xs text-[var(--nu-text-muted)] mt-1">El gráfico se mostrará con más días de datos</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--nu-border)]">
              <h2 className="font-semibold text-[var(--nu-text)]">Casos Recientes</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--nu-gold-dim)] text-[var(--nu-gold)]">
                Últimos 12
              </span>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="nu-shimmer h-12 rounded" />
                ))}
              </div>
            ) : recentCases.length === 0 ? (
              <p className="p-6 text-center text-[var(--nu-text-muted)]">
                No hay casos
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
                        Propiedad
                      </th>
                      <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                        Vertical
                      </th>
                      <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                        Confianza
                      </th>
                      <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                        Costo USD
                      </th>
                      <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[var(--nu-text-muted)]">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.map((c) => {
                      const caseId = getCaseId(c);
                      const conf = c.ai_confidence;
                      const confPct =
                        typeof conf === 'number' && Number.isFinite(conf) && conf >= 0 && conf <= 1
                          ? `${(conf * 100).toFixed(0)}%`
                          : '—';
                      return (
                        <tr
                          key={caseId ?? c.case_number}
                          className="border-b border-[var(--nu-border)]/60 hover:bg-[var(--nu-card-hover)] transition-colors"
                        >
                          <td className="px-6 py-4">
                            {caseId ? (
                              <Link
                                href={`/cases/${caseId}`}
                                className="font-mono text-xs font-semibold text-[var(--nu-gold)] hover:text-[var(--nu-gold)]/80"
                              >
                                {c.case_number}
                              </Link>
                            ) : (
                              <span className="font-mono text-xs font-semibold text-[var(--nu-gold)]">
                                {c.case_number}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                            {getAddress(c)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--nu-text-muted)]">
                            {getVertical(c)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                            {confPct}
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--nu-text-secondary)]">
                            {c.ai_cost_usd != null && Number.isFinite(c.ai_cost_usd)
                              ? `$${c.ai_cost_usd.toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--nu-text-muted)]">
                            {formatDateDO(c.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--nu-border)]">
              <h2 className="font-semibold text-[var(--nu-text)]">Actividad Reciente</h2>
            </div>
            <div className="p-4 space-y-4">
              {activities.length === 0 ? (
                <p className="text-center text-sm text-[var(--nu-text-muted)]">
                  Sin actividad reciente
                </p>
              ) : (
                activities.map((a, i) => {
                  let dotColor = 'bg-[var(--nu-gold)]';
                  if (a.status === 'delivered') dotColor = 'bg-[var(--nu-emerald)]';
                  else if (
                    a.status.includes('failed') ||
                    a.status.includes('qa_failed') ||
                    a.status.includes('compliance_failed')
                  )
                    dotColor = 'bg-[var(--nu-red)]';
                  else if (
                    ['report_processing', 'report_completed', 'comparable_processing'].some(
                      (s) => a.status.includes(s)
                    )
                  )
                    dotColor = 'bg-[var(--nu-blue)]';
                  return (
                    <div key={i} className="flex gap-3">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotColor}`}
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm text-[var(--nu-text)]">
                          {a.case_number} {a.action}
                        </p>
                        <p className="text-xs text-[var(--nu-text-muted)]">
                          {formatRelativeShort(a.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--nu-text-muted)]" />
            <div>
              <p className="text-xs text-[var(--nu-text-muted)]">Tiempo Promedio</p>
              <p className="text-lg font-semibold text-[var(--nu-text)]">—</p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[var(--nu-text-muted)]" />
            <div>
              <p className="text-xs text-[var(--nu-text-muted)]">Tasa Éxito</p>
              <p className="text-lg font-semibold text-[var(--nu-text)]">
                {tasaExito.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-4 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-[var(--nu-text-muted)]" />
            <div>
              <p className="text-xs text-[var(--nu-text-muted)]">Costo Total</p>
              <p className="text-lg font-semibold text-[var(--nu-text)]">
                ${costoTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[var(--nu-text-muted)]" />
            <div>
              <p className="text-xs text-[var(--nu-text-muted)]">Casos/Día</p>
              <p className="text-lg font-semibold text-[var(--nu-text)]">—</p>
            </div>
          </div>
        </div>
      </div>
      <ServiceStatus />
    </AppLayout>
  );
}
