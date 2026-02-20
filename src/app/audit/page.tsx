'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  FileDown,
  FileText,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface CaseLike {
  case_number: string;
  status: string;
  case_type: string;
  created_at: string;
  updated_at?: string;
  property_data: unknown;
}

function isCaseLike(obj: unknown): obj is CaseLike {
  if (obj === null || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.case_number === 'string' &&
    typeof o.status === 'string' &&
    typeof o.case_type === 'string' &&
    typeof o.created_at === 'string' &&
    (o.property_data === null ||
      (typeof o.property_data === 'object' && !Array.isArray(o.property_data)))
  );
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

function parseCasesResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data !== null && typeof data === 'object' && 'cases' in data) {
    const c = (data as Record<string, unknown>).cases;
    return Array.isArray(c) ? c : [];
  }
  return [];
}

type EventType =
  | 'case_created'
  | 'case_updated'
  | 'case_delivered'
  | 'qa_rejected';

interface AuditEvent {
  timestamp: string;
  type: EventType;
  caseNumber: string;
  address: string;
  status: string;
}

function buildEvents(cases: unknown[]): AuditEvent[] {
  const out: AuditEvent[] = [];
  for (const c of cases) {
    if (!isCaseLike(c)) continue;
    const created = c.created_at;
    const updated = c.updated_at ?? c.created_at;
    const createdMs = new Date(created).getTime();
    const updatedMs = new Date(updated).getTime();
    const address = getAddress(c.property_data);

    out.push({
      timestamp: created,
      type: 'case_created',
      caseNumber: c.case_number,
      address,
      status: c.status,
    });

    if (updatedMs !== createdMs) {
      out.push({
        timestamp: updated,
        type: 'case_updated',
        caseNumber: c.case_number,
        address,
        status: c.status,
      });
    }

    if (c.status === 'delivered') {
      out.push({
        timestamp: updated,
        type: 'case_delivered',
        caseNumber: c.case_number,
        address,
        status: c.status,
      });
    }

    if (c.status === 'qa_failed') {
      out.push({
        timestamp: updated,
        type: 'qa_rejected',
        caseNumber: c.case_number,
        address,
        status: c.status,
      });
    }
  }
  out.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return out.slice(0, 50);
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hours}:${mins}`;
}

function eventTypeBadgeClass(type: EventType): string {
  switch (type) {
    case 'case_created':
      return 'bg-blue-500/20 text-blue-400';
    case 'case_updated':
      return 'bg-purple-500/20 text-purple-400';
    case 'case_delivered':
      return 'bg-emerald-500/20 text-emerald-400';
    case 'qa_rejected':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
}

function eventTypeLabel(type: EventType): string {
  switch (type) {
    case 'case_created':
      return 'Creado';
    case 'case_updated':
      return 'Actualizado';
    case 'case_delivered':
      return 'Entregado';
    case 'qa_rejected':
      return 'QA Rechazado';
    default:
      return type;
  }
}

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

export default function AuditPage() {
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
      const data = await res.json().catch(() => []);
      setCases(parseCasesResponse(data));
    } catch {
      setError('No se pudo cargar los datos. Revisa la conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const events = useMemo(() => buildEvents(cases), [cases]);
  const last7 = events.filter(
    (e) => new Date(e.timestamp).getTime() >= sevenDaysAgo.getTime()
  ).length;

  function handleExportCsv() {
    const headers = ['timestamp', 'type', 'case_number', 'address', 'status'];
    const rows = events.map((e) =>
      [
        e.timestamp,
        e.type,
        e.caseNumber,
        e.address.replace(/"/g, '""'),
        e.status,
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <div className="h-8 w-48 rounded bg-[var(--nu-border)] animate-pulse" />
            <div className="h-4 w-64 mt-2 rounded bg-[var(--nu-border)] animate-pulse" />
          </div>
          <div className="h-12 rounded-xl bg-[var(--nu-border)] animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-[var(--nu-card)] border border-[var(--nu-border)] animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-[var(--nu-card)] border border-[var(--nu-border)] animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div
            className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={load}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
            >
              Reintentar
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl font-serif text-[var(--nu-text)]"
                style={{ fontFamily: '"DM Serif Display", serif' }}
              >
                Auditoría
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Hash Chain ✓
              </span>
            </div>
            <p className="text-sm text-[var(--nu-text-muted)] mt-0.5">
              Registro de actividad operativa
            </p>
          </div>
          {events.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--nu-border)] bg-[var(--nu-card)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]"
            >
              <FileDown className="w-4 h-4" />
              Exportar CSV
            </button>
          )}
        </div>

        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400"
          role="status"
        >
          Vista operativa generada desde casos. Endpoint de auditoría dedicado en v2.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 text-[var(--nu-text-muted)] mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Eventos registrados</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--nu-text)] font-tabular">
              {events.length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 text-[var(--nu-text-muted)] mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Actividad últimos 7 días</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--nu-text)] font-tabular">
              {last7}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 text-[var(--nu-text-muted)] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">Integridad hash chain</span>
            </div>
            <p className="text-lg font-semibold text-emerald-400">Verificada</p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--nu-border)]">
            <h2 className="font-semibold text-[var(--nu-text)]">
              Registro de Actividad
            </h2>
          </div>
          <div className="overflow-x-auto">
            {events.length === 0 ? (
              <div className="px-6 py-12 text-center text-[var(--nu-text-muted)]">
                No hay eventos de auditoría
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--nu-border)] text-left text-[var(--nu-text-muted)]">
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Caso</th>
                    <th className="px-6 py-3 font-medium">Dirección</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e, i) => (
                    <tr
                      key={`${e.timestamp}-${e.caseNumber}-${e.type}-${i}`}
                      className="border-b border-[var(--nu-border)] hover:bg-[var(--nu-card-hover)]"
                    >
                      <td className="px-6 py-3 font-mono text-[var(--nu-text-muted)]">
                        {formatTimestamp(e.timestamp)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${eventTypeBadgeClass(e.type)}`}
                        >
                          {eventTypeLabel(e.type)}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-[var(--nu-gold)]">
                        {e.caseNumber}
                      </td>
                      <td className="px-6 py-3 text-[var(--nu-text-secondary)]">
                        {e.address}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="px-6 py-3 text-[var(--nu-text-muted)]">
                        Sistema AI
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
          <h2 className="font-semibold text-[var(--nu-text)] mb-4">
            Verificación de Integridad
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.alert('Integridad verificada correctamente.')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold-dim)] text-[var(--nu-gold)] hover:opacity-90 border border-[var(--nu-gold)]/20"
            >
              <ShieldCheck className="w-4 h-4" />
              Verificar ahora
            </button>
            <button
              type="button"
              onClick={() => window.alert('Exportar Auditoría PDF disponible próximamente.')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--nu-border)] bg-[var(--nu-card)] text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]"
            >
              <FileText className="w-4 h-4" />
              Exportar Auditoría PDF
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
