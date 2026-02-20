'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PipelineTimeline } from '@/components/ui/PipelineTimeline';
import { Banner } from '@/components/ui/Banner';
import { DEMO_MODE, demoCases } from '@/lib/demo-data';
import {
  isRecord,
  normalizeCaseDetail,
  extractArrayField,
  extractPropertyField,
} from '@/lib/case-utils';

function isEvidenceLike(obj: unknown): obj is {
  id: string;
  file_path?: string;
  file_hash?: string;
} {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.id === 'string';
}

function isComparableLike(obj: unknown): obj is {
  id: string;
  address?: string | null;
  price?: string | number | null;
  similarity_score?: number | null;
} {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.id === 'string';
}

export default function CaseDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [raw, setRaw] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (res.status === 401) {
        setError('Sesión expirada.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        if (DEMO_MODE) {
          const demo = demoCases.find((c) => c.id === id) ?? demoCases[0];
          if (demo) {
            setRaw({
              ...demo,
              evidence: [],
              comparables: [],
              report: null,
              report_markdown: null,
            });
          }
          setDegraded(true);
        } else {
          setError('Error al cargar el caso.');
        }
        setLoading(false);
        return;
      }
      const json = await res.json();
      setRaw(json);
    } catch {
      if (DEMO_MODE) {
        const demo = demoCases.find((c) => c.id === id) ?? demoCases[0];
        if (demo) {
          setRaw({
            ...demo,
            evidence: [],
            comparables: [],
            report: null,
            report_markdown: null,
          });
        }
        setDegraded(true);
      } else {
        setError('Error al conectar.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const wrapperRecord = useMemo(
    () => (raw !== null && isRecord(raw) ? raw : null),
    [raw]
  );

  const parsed = useMemo(() => normalizeCaseDetail(raw), [raw]);

  const comparables = useMemo(() => {
    const fromParsed = extractArrayField(parsed, 'comparables');
    if (fromParsed.length > 0) return fromParsed;
    return extractArrayField(wrapperRecord, 'comparables');
  }, [parsed, wrapperRecord]);

  const evidence = useMemo(() => {
    const fromParsed = extractArrayField(parsed, 'evidence');
    if (fromParsed.length > 0) return fromParsed;
    return extractArrayField(wrapperRecord, 'evidence');
  }, [parsed, wrapperRecord]);

  const reportMarkdown = useMemo(() => {
    if (!parsed) return null;
    const rm = parsed.report_markdown;
    if (typeof rm === 'string' && rm.length > 0) return rm;
    const r = parsed.report;
    if (r && isRecord(r) && typeof r.report_markdown === 'string') {
      return r.report_markdown as string;
    }
    return null;
  }, [parsed]);

  const propertyData = parsed?.property_data ?? null;
  const propertyTypeVal = propertyData && isRecord(propertyData)
    ? propertyData.property_type
    : undefined;
  const propertyTypeLabel =
    propertyTypeVal === 'residential'
      ? 'Residencial'
      : propertyTypeVal === 'commercial'
        ? 'Comercial'
        : propertyTypeVal === 'land'
          ? 'Terreno'
          : typeof propertyTypeVal === 'string'
            ? propertyTypeVal
            : '—';
  const addressDisplay =
    extractPropertyField(propertyData, 'address') !== '—'
      ? extractPropertyField(propertyData, 'address')
      : 'Sin dirección';

  const caseNumber = parsed?.case_number;
  const status = parsed?.status;
  const aiConfidence = parsed?.ai_confidence;

  async function handleRunPipeline() {
    if (!id) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${id}/run`, { method: 'POST' });
      if (!res.ok) setError('No se pudo ejecutar el pipeline.');
      else await load();
    } catch {
      setError('Error de conexión.');
    } finally {
      setRunning(false);
    }
  }

  const reportObj = parsed?.report;
  const pdfPath =
    reportObj && isRecord(reportObj) && typeof reportObj.pdf_path === 'string'
      ? reportObj.pdf_path
      : null;

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl">
          <Link
            href="/cases"
            className="text-sm font-medium text-[var(--nu-gold)] hover:underline"
          >
            ← Volver a Casos
          </Link>
          <div className="py-12 text-center text-[var(--nu-text-muted)]">
            Cargando...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && !degraded) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl">
          <Link
            href="/cases"
            className="text-sm font-medium text-[var(--nu-gold)] hover:underline"
          >
            ← Volver a Casos
          </Link>
          <Banner variant="error" message={error} onRetry={load} />
        </div>
      </AppLayout>
    );
  }

  if (!parsed || typeof caseNumber !== 'string' || typeof status !== 'string') {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl">
          <Link
            href="/cases"
            className="text-sm font-medium text-[var(--nu-gold)] hover:underline"
          >
            ← Volver a Casos
          </Link>
          <div className="py-12 text-center text-[var(--nu-text-muted)]">
            Caso no encontrado
          </div>
        </div>
      </AppLayout>
    );
  }

  const pd = isRecord(propertyData) ? propertyData : {};

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <Link
          href="/cases"
          className="text-sm font-medium text-[var(--nu-gold)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 rounded"
        >
          ← Volver a Casos
        </Link>

        {degraded && (
          <Banner
            variant="degraded"
            message="Modo degradado: datos de demostración."
            onRetry={load}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--nu-text-muted)] font-mono">
              {caseNumber}
            </p>
            <h1
              className="text-xl font-serif text-[var(--nu-text)]"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              {propertyTypeLabel} — {addressDisplay}
            </h1>
            {typeof aiConfidence === 'number' &&
              Number.isFinite(aiConfidence) && (
              <p className="text-sm text-[var(--nu-text-secondary)] mt-1">
                Confianza AI: {(aiConfidence * 100).toFixed(0)}%
              </p>
            )}
            <StatusBadge status={status} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(status === 'pending_intake' || status === 'intake_completed') && (
              <button
                type="button"
                onClick={handleRunPipeline}
                disabled={running}
                className="px-4 py-2 font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50"
              >
                {running ? 'Ejecutando...' : 'Ejecutar Pipeline'}
              </button>
            )}
            {pdfPath && (
              <a
                href={pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 font-medium rounded-lg bg-[var(--nu-gold)] text-[var(--nu-navy)] hover:opacity-90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50"
              >
                Ver Informe
              </a>
            )}
          </div>
        </div>

        <section className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
          <h2 className="font-semibold text-[var(--nu-text)] mb-4">Pipeline</h2>
          <PipelineTimeline currentStatus={status} />
        </section>

        <section className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
          <h2 className="font-semibold text-[var(--nu-text)] mb-4">
            Evidencia
          </h2>
          {evidence.length === 0 ? (
            <p className="text-[var(--nu-text-muted)]">Sin evidencia</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {evidence
                .filter(isEvidenceLike)
                .map((e) => (
                  <div
                    key={e.id}
                    className="border border-[var(--nu-border)] rounded-md p-4 bg-[var(--nu-navy-light)]"
                  >
                    <p className="text-sm font-medium text-[var(--nu-text)] truncate">
                      {typeof e.file_path === 'string'
                        ? e.file_path.split('/').pop() ?? 'Archivo'
                        : 'Archivo'}
                    </p>
                    <p className="text-xs text-[var(--nu-text-muted)] font-mono mt-1">
                      {typeof e.file_hash === 'string'
                        ? e.file_hash.slice(0, 12)
                        : '—'}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </section>

        {comparables.length > 0 && (
          <section className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <h2 className="font-semibold text-[var(--nu-text)] mb-4">
              Comparables
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comparables
                .filter(isComparableLike)
                .map((c) => (
                  <div
                    key={c.id}
                    className="border border-[var(--nu-border)] rounded-md p-4 bg-[var(--nu-navy-light)]"
                  >
                    <p className="text-sm font-medium text-[var(--nu-text)]">
                      {c.address ?? 'Sin dirección'}
                    </p>
                    <p className="text-sm text-[var(--nu-text-secondary)]">
                      Precio:{' '}
                      {c.price != null
                        ? Number(c.price).toLocaleString()
                        : '—'}{' '}
                      USD
                    </p>
                    {c.similarity_score != null &&
                      Number.isFinite(c.similarity_score) && (
                        <p className="text-xs text-[var(--nu-text-muted)]">
                          Similitud:{' '}
                          {(c.similarity_score * 100).toFixed(0)}%
                        </p>
                      )}
                  </div>
                ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
          <h2 className="font-semibold text-[var(--nu-text)] mb-4">
            Datos de la propiedad
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(pd)
              .filter(
                ([k, v]) =>
                  v != null &&
                  v !== '' &&
                  !['market_context', 'report_markdown'].includes(k) &&
                  typeof v !== 'object'
              )
              .map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-[var(--nu-text-muted)] capitalize">
                    {k.replace(/_/g, ' ')}:
                  </dt>
                  <dd className="text-[var(--nu-text)]">{String(v)}</dd>
                </div>
              ))}
          </dl>
        </section>

        <section className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
          <h2 className="font-semibold text-[var(--nu-text)] mb-4">
            Informe
          </h2>
          {reportMarkdown ? (
            <div className="whitespace-pre-wrap text-sm text-[var(--nu-text-secondary)] font-mono max-h-96 overflow-auto bg-[var(--nu-navy-light)] rounded-lg p-4">
              {reportMarkdown}
            </div>
          ) : (
            <p className="text-[var(--nu-text-muted)]">Informe pendiente.</p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
