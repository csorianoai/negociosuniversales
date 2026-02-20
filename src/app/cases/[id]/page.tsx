'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Image, File } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PipelineTimeline } from '@/components/ui/PipelineTimeline';
import { Banner } from '@/components/ui/Banner';
import { DEMO_MODE, demoCases, enrichCaseDetailWithDemo } from '@/lib/demo-data';
import {
  isRecord,
  normalizeCaseDetail,
  extractArrayField,
  extractPropertyField,
  extractPropertyNumber,
  getCaseId,
} from '@/lib/case-utils';

const TABS = ['Valor', 'Criterio', 'Evidencia', 'Pipeline'] as const;
type TabId = (typeof TABS)[number];

function isEvidenceLike(obj: unknown): obj is Record<string, unknown> & { id: string } {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.id === 'string';
}

function isComparableLike(obj: unknown): obj is Record<string, unknown> & {
  id: string;
  address?: string | null;
  price?: string | number | null;
  source?: string;
} {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof (o.id ?? o.address) === 'string';
}

function isVirtualPath(path: unknown): path is string {
  return typeof path === 'string' && path.startsWith('virtual/');
}

function getEvidenceLabel(e: Record<string, unknown>): string {
  if (isRecord(e.metadata) && typeof e.metadata.label === 'string' && e.metadata.label.length > 0) {
    return e.metadata.label;
  }
  const p = e.file_path;
  if (typeof p === 'string') {
    const name = p.split('/').pop();
    if (name) return name;
  }
  return 'Archivo';
}

export default function CaseDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [raw, setRaw] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('Valor');

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
          const demo = demoCases.find((c) => getCaseId(c) === id) ?? demoCases[0];
          if (demo && isRecord(demo)) {
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
        const demo = demoCases.find((c) => getCaseId(c) === id) ?? demoCases[0];
        if (demo && isRecord(demo)) {
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

  const baseComparables = useMemo(() => {
    const fromParsed = extractArrayField(parsed, 'comparables');
    if (fromParsed.length > 0) return fromParsed;
    return extractArrayField(wrapperRecord, 'comparables');
  }, [parsed, wrapperRecord]);

  const baseEvidence = useMemo(() => {
    const fromParsed = extractArrayField(parsed, 'evidence');
    if (fromParsed.length > 0) return fromParsed;
    return extractArrayField(wrapperRecord, 'evidence');
  }, [parsed, wrapperRecord]);

  const enriched = useMemo(
    () =>
      enrichCaseDetailWithDemo({
        caseData: parsed ?? {},
        comparables: baseComparables,
        evidence: baseEvidence,
      }),
    [parsed, baseComparables, baseEvidence]
  );

  const comparables = enriched.comparables;
  const evidence = enriched.evidence;

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

        {enriched.usedDemo && (
          <div className="rounded-lg px-3 py-2 bg-amber-500/15 border border-amber-500/40 flex items-center gap-2">
            <span className="text-xs font-medium text-amber-400 rounded-full px-2 py-0.5 bg-amber-500/25">DEMO</span>
            <span className="text-sm text-[var(--nu-text-muted)]">Datos demo como complemento</span>
          </div>
        )}

        {degraded && !enriched.usedDemo && (
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

        <div className="flex gap-1 border-b border-[var(--nu-border)] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 shrink-0 ${
                activeTab === tab
                  ? 'bg-[var(--nu-card)] text-[var(--nu-gold)] border border-[var(--nu-border)] border-b-transparent -mb-px'
                  : 'text-[var(--nu-text-muted)] hover:text-[var(--nu-text)] hover:bg-[var(--nu-card-hover)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="rounded-b-xl border border-[var(--nu-border)] border-t-0 bg-[var(--nu-card)] p-6">
          {activeTab === 'Valor' && (
            <>
              <h2 className="font-semibold text-[var(--nu-text)] mb-4">Valoración</h2>
              {(() => {
                const vMin = propertyData && isRecord(propertyData) ? extractPropertyNumber(propertyData, 'valuation_min') : null;
                const vPoint = propertyData && isRecord(propertyData) ? extractPropertyNumber(propertyData, 'valuation_point') : null;
                const vMax = propertyData && isRecord(propertyData) ? extractPropertyNumber(propertyData, 'valuation_max') : null;
                const hasVal = vPoint != null && Number.isFinite(vPoint) && vPoint > 0;
                const isPending = status === 'pending_intake' || status === 'intake_processing' || status === 'intake_completed';
                if (isPending && !hasVal) {
                  return (
                    <p className="text-[var(--nu-text-muted)] italic">
                      Valor en proceso
                    </p>
                  );
                }
                return (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4">
                      {vMin != null && Number.isFinite(vMin) && (
                        <div>
                          <span className="text-xs text-[var(--nu-text-muted)]">Mínimo</span>
                          <p className="text-lg font-semibold text-[var(--nu-text)]">RD$ {Math.round(vMin).toLocaleString('es-DO')}</p>
                        </div>
                      )}
                      {vPoint != null && Number.isFinite(vPoint) && (
                        <div>
                          <span className="text-xs text-[var(--nu-text-muted)]">Punto</span>
                          <p className="text-lg font-semibold text-[var(--nu-gold)]">RD$ {Math.round(vPoint).toLocaleString('es-DO')}</p>
                        </div>
                      )}
                      {vMax != null && Number.isFinite(vMax) && (
                        <div>
                          <span className="text-xs text-[var(--nu-text-muted)]">Máximo</span>
                          <p className="text-lg font-semibold text-[var(--nu-text)]">RD$ {Math.round(vMax).toLocaleString('es-DO')}</p>
                        </div>
                      )}
                    </div>
                    {typeof aiConfidence === 'number' && Number.isFinite(aiConfidence) && aiConfidence >= 0 && aiConfidence <= 1 && (
                      <p className="text-sm text-[var(--nu-text-secondary)]">Confianza: {(aiConfidence * 100).toFixed(0)}%</p>
                    )}
                    {comparables.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-[var(--nu-text-muted)] mb-2">Comparables</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {comparables.filter(isComparableLike).map((c, idx) => {
                            const src = c.source;
                            const isDemoSource = typeof src === 'string' && src.toLowerCase().includes('demo');
                            const priceVal = c.price;
                            const priceNum = typeof priceVal === 'number' && Number.isFinite(priceVal) ? priceVal : typeof priceVal === 'string' ? Number.parseFloat(priceVal) : NaN;
                            return (
                              <div
                                key={c.id ?? String(idx)}
                                className="border border-[var(--nu-border)] rounded-md p-4 bg-[var(--nu-navy-light)]"
                              >
                                {isDemoSource && (
                                  <p className="text-xs text-amber-400 mb-1">Fuente (Demo): {src}</p>
                                )}
                                <p className="text-sm font-medium text-[var(--nu-text)]">{c.address ?? 'Sin dirección'}</p>
                                <p className="text-sm text-[var(--nu-text-secondary)]">
                                  Precio: {Number.isFinite(priceNum) ? priceNum.toLocaleString('es-DO') : '—'} RD$
                                </p>
                                {c.similarity_score != null && Number.isFinite(c.similarity_score) && (
                                  <p className="text-xs text-[var(--nu-text-muted)]">Similitud: {(Number(c.similarity_score) * 100).toFixed(0)}%</p>
                                )}
                                {(() => {
                                  const adj = c.adjustments;
                                  if (!adj || !isRecord(adj) || Object.keys(adj).length === 0) return null;
                                  return (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Object.entries(adj).map(([k, v]) => (
                                        <span key={k} className="text-xs px-1.5 py-0.5 rounded bg-[var(--nu-border)] text-[var(--nu-text-muted)]">
                                          {`${k}: ${String(v)}`}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {activeTab === 'Criterio' && (
            <>
              <h2 className="font-semibold text-[var(--nu-text)] mb-4">Criterio de tasación</h2>
              {status === 'qa_failed' && (
                <div className="rounded-lg px-4 py-3 bg-red-500/15 border border-red-500/40 mb-4">
                  <p className="text-sm font-medium text-red-400">Banderas rojas QA</p>
                  <p className="text-sm text-[var(--nu-text-muted)] mt-1">Este caso no superó el control de calidad. Requiere revisión.</p>
                </div>
              )}
              <div className="space-y-4 text-sm text-[var(--nu-text-secondary)]">
                <div>
                  <h3 className="font-medium text-[var(--nu-text)] mb-1">Hechos</h3>
                  <p className="whitespace-pre-wrap">{extractPropertyField(propertyData, 'hechos') !== '—' ? extractPropertyField(propertyData, 'hechos') : 'Datos de la propiedad y contexto de mercado.'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--nu-text)] mb-1">Supuestos</h3>
                  <p className="whitespace-pre-wrap">{extractPropertyField(parsed, 'supuestos') !== '—' ? extractPropertyField(parsed, 'supuestos') : 'Supuestos estándar de tasación aplicables.'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--nu-text)] mb-1">Cálculos</h3>
                  <p className="whitespace-pre-wrap">{extractPropertyField(parsed, 'calculos') !== '—' ? extractPropertyField(parsed, 'calculos') : reportMarkdown ?? 'Análisis comparativo y ajustes aplicados.'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--nu-text)] mb-1">Opinión</h3>
                  <p className="whitespace-pre-wrap">{extractPropertyField(parsed, 'opinion') !== '—' ? extractPropertyField(parsed, 'opinion') : 'Valoración según metodología y evidencia disponible.'}</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Evidencia' && (
            <>
              <h2 className="font-semibold text-[var(--nu-text)] mb-4">Evidencia</h2>
              {evidence.length === 0 ? (
                <p className="text-[var(--nu-text-muted)]">Sin evidencia</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-x-auto">
                  {evidence
                    .filter(isEvidenceLike)
                    .map((e) => {
                      const fp = e.file_path;
                      const isVirtual = isVirtualPath(fp);
                      const label = getEvidenceLabel(e);
                      return (
                        <div
                          key={e.id}
                          className="border border-[var(--nu-border)] rounded-md p-4 bg-[var(--nu-navy-light)] flex items-start gap-3"
                        >
                          {isVirtual ? (
                            <>
                              {String(e.file_type).toLowerCase().includes('image') ? (
                                <Image className="w-8 h-8 shrink-0 text-[var(--nu-gold)]" />
                              ) : (
                                <FileText className="w-8 h-8 shrink-0 text-[var(--nu-gold)]" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[var(--nu-text)] truncate">{label}</p>
                                <p className="text-xs text-[var(--nu-text-muted)] mt-1">Virtual (Demo)</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <File className="w-8 h-8 shrink-0 text-[var(--nu-text-muted)]" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[var(--nu-text)] truncate">{label}</p>
                                <p className="text-xs text-[var(--nu-text-muted)] font-mono mt-1">
                                  {typeof e.file_hash === 'string' ? e.file_hash.slice(0, 12) : '—'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}

          {activeTab === 'Pipeline' && (
            <>
              <h2 className="font-semibold text-[var(--nu-text)] mb-4">Pipeline</h2>
              <PipelineTimeline currentStatus={status} />
            </>
          )}
        </section>

        <section className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6 mt-6">
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
