'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { ComponentType } from 'react';
import {
  Circle,
  FileInput,
  FileSearch,
  Search,
  GitCompare,
  FileText,
  ShieldCheck,
  Shield,
  Send,
  User,
  Building2,
  Car,
  Wrench,
  Hotel,
  Package,
  Download,
  Receipt,
  FileCheck,
  HelpCircle,
  Workflow,
  BarChart3,
  AlertCircle,
  Clock,
  Calculator,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/ui/KPICard';
import { ServiceStatus } from '@/components/ui/ServiceStatus';
import {
  normalizeCasesResponse,
  isCaseLike,
  parseValidDate,
} from '@/lib/case-utils';
import {
  AGENT_REGISTRY,
  getPipelineAgents,
  getAgentsByCategory,
  PIPELINE_COST_ESTIMATE,
  PIPELINE_DURATION_ESTIMATE,
  TOTAL_AGENT_COUNT,
  type AgentMetadata,
  type Vertical,
} from '@/core/agents/registry';
import { VERTICAL_LABELS } from '@/lib/billing-utils';

const ICON_MAP: Record<
  string,
  ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Circle,
  FileInput,
  FileSearch,
  Search,
  GitCompare,
  FileText,
  ShieldCheck,
  Shield,
  Send,
  User,
  Building2,
  Car,
  Wrench,
  Hotel,
  Package,
  Download,
  Receipt,
  FileCheck,
  HelpCircle,
};

function getIcon(
  name: string
): ComponentType<{ className?: string; style?: React.CSSProperties }> {
  return ICON_MAP[name] ?? Circle;
}

function getNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function AIStudioPage() {
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

  const validCases = useMemo(() => cases.filter(isCaseLike), [cases]);

  const validDatesThisMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const firstOfMonth = new Date(y, m, 1);
    const lastOfMonth = new Date(y, m + 1, 0);
    const valid: Date[] = [];
    for (const c of validCases) {
      const d = parseValidDate(c.created_at);
      if (d && d >= firstOfMonth && d <= lastOfMonth) valid.push(d);
    }
    return valid;
  }, [validCases]);

  const costThisMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const firstOfMonth = new Date(y, m, 1);
    const lastOfMonth = new Date(y, m + 1, 0);
    return validCases
      .filter((c) => {
        const d = parseValidDate(c.created_at);
        return d && d >= firstOfMonth && d <= lastOfMonth;
      })
      .reduce((sum, c) => sum + getNumber(c.ai_cost_usd), 0);
  }, [validCases]);

  const daysElapsed = new Date().getDate();
  const monthlyProjection =
    validDatesThisMonth.length > 0 && daysElapsed > 0
      ? (costThisMonth / daysElapsed) * 30
      : 0;

  const totalAiCost = useMemo(
    () => validCases.reduce((sum, c) => sum + getNumber(c.ai_cost_usd), 0),
    [validCases]
  );

  const pipelineAgents = getPipelineAgents();
  const evaluators = getAgentsByCategory('evaluator');
  const operational = getAgentsByCategory('operational');

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-serif text-[var(--nu-text)]"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              AI Studio
            </h1>
            <p className="text-sm text-[var(--nu-text-muted)] mt-0.5">
              Agentes, pipeline y métricas de costos
            </p>
          </div>
          <Link
            href="/metrics"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--nu-border)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]"
          >
            <BarChart3 className="w-4 h-4" />
            Ver Métricas
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="nu-shimmer rounded-xl p-6 min-h-[120px]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Agentes"
              value={TOTAL_AGENT_COUNT}
              icon={Workflow}
              color="gold"
            />
            <KPICard
              title="Costo Estimado/Caso"
              value={`$${PIPELINE_COST_ESTIMATE.toFixed(3)}`}
              icon={Calculator}
              color="blue"
            />
            <KPICard
              title="Duración Est. Pipeline"
              value={`${PIPELINE_DURATION_ESTIMATE}s`}
              icon={Clock}
              color="emerald"
            />
            <KPICard
              title="Proyección Mensual"
              value={
                validDatesThisMonth.length > 0
                  ? `$${monthlyProjection.toFixed(2)}`
                  : '—'
              }
              icon={Receipt}
              color="purple"
            />
          </div>
        )}

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm text-amber-400">
          Datos de agentes estáticos (DEMO). Ejecución real en backend.
        </div>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
          <h2 className="font-semibold text-[var(--nu-text)] px-6 py-4 border-b border-[var(--nu-border)] flex items-center gap-2">
            Pipeline ({pipelineAgents.length} agentes)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--nu-border)] text-left text-[var(--nu-text-muted)]">
                  <th className="px-6 py-3 font-medium">Orden</th>
                  <th className="px-6 py-3 font-medium">Agente</th>
                  <th className="px-6 py-3 font-medium">Modelo</th>
                  <th className="px-6 py-3 font-medium">Costo/ejec.</th>
                  <th className="px-6 py-3 font-medium">Duración</th>
                </tr>
              </thead>
              <tbody>
                {pipelineAgents.map((a) => {
                  const Icon = getIcon(a.iconName);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-[var(--nu-border)] hover:bg-[var(--nu-card-hover)]"
                    >
                      <td className="px-6 py-3 font-tabular text-[var(--nu-text-muted)]">
                        {a.pipelineOrder}
                      </td>
                      <td className="px-6 py-3 flex items-center gap-2">
                        <Icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: a.color }}
                        />
                        {a.nameShort}
                      </td>
                      <td className="px-6 py-3 text-[var(--nu-text-secondary)]">
                        {a.model}
                      </td>
                      <td className="px-6 py-3 font-tabular text-[var(--nu-text)]">
                        ${a.estimatedCostPerRun.toFixed(3)}
                      </td>
                      <td className="px-6 py-3 text-[var(--nu-text-muted)]">
                        {a.estimatedDurationSeconds}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
            <h2 className="font-semibold text-[var(--nu-text)] px-6 py-4 border-b border-[var(--nu-border)]">
              Evaluadores por Vertical
            </h2>
            <div className="divide-y divide-[var(--nu-border)]">
              {evaluators.map((a) => {
                const Icon = getIcon(a.iconName);
                const v = a.vertical as Vertical | null;
                return (
                  <div
                    key={a.id}
                    className="px-6 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: a.color }}
                      />
                      <span className="text-[var(--nu-text)]">
                        {a.nameShort}
                      </span>
                      {v && (
                        <span className="text-xs text-[var(--nu-text-muted)]">
                          {VERTICAL_LABELS[v]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--nu-text-muted)]">
                      RD$ {a.evaluator?.priceDop?.toLocaleString() ?? '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
            <h2 className="font-semibold text-[var(--nu-text)] px-6 py-4 border-b border-[var(--nu-border)]">
              Agentes Operacionales
            </h2>
            <div className="divide-y divide-[var(--nu-border)]">
              {operational.map((a) => {
                const Icon = getIcon(a.iconName);
                return (
                  <div
                    key={a.id}
                    className="px-6 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: a.color }}
                      />
                      <span className="text-[var(--nu-text)]">
                        {a.nameShort}
                      </span>
                      {a.status === 'coming_soon' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400">
                          Próximamente
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--nu-text-muted)]">
                      {a.hasImplementation ? 'Activo' : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
          <h2 className="font-semibold text-[var(--nu-text)] mb-4">
            Resumen de Costos (desde /api/cases)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[var(--nu-text-muted)]">Costo Total AI US$</p>
              <p className="text-xl font-serif text-[var(--nu-gold)] mt-0.5">
                ${totalAiCost.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[var(--nu-text-muted)]">Casos válidos</p>
              <p className="text-xl font-serif text-[var(--nu-text)] mt-0.5">
                {validCases.length}
              </p>
            </div>
            <div>
              <p className="text-[var(--nu-text-muted)]">Proyección mensual</p>
              <p className="text-xl font-serif text-[var(--nu-text)] mt-0.5">
                {validDatesThisMonth.length > 0
                  ? `$${monthlyProjection.toFixed(2)}`
                  : 'Sin datos de fechas válidas'}
              </p>
            </div>
          </div>
        </div>

        <ServiceStatus />
      </div>
    </AppLayout>
  );
}
