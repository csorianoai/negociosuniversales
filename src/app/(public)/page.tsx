'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  BarChart3,
  Shield,
  Building2,
  Car,
  Hotel,
  FileInput,
  Search,
  FileText,
  CheckCircle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { DEFAULT_PRICING } from '@/lib/billing-utils';
import type { Vertical } from '@/lib/billing-utils';
import { CTAForm } from '@/components/marketing/CTAForm';

// --- Hero Section ---
function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-28 md:py-36">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--nu-gold)]/5 rounded-full blur-[120px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[var(--nu-gold)]/15 text-[var(--nu-gold)] border border-[var(--nu-gold)]/30 animate-pulse">
          Valuación de garantías · pipeline asistido por IA
        </span>
        <h1
          className="mt-8 text-3xl sm:text-4xl md:text-5xl font-serif text-white leading-tight"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          Valuación de Garantías
        </h1>
        <p className="mt-4 text-xl sm:text-2xl text-[var(--nu-gold)] font-medium" style={{ fontFamily: '"DM Serif Display", serif' }}>
          en minutos, según complejidad
        </p>
        <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
          Pipeline asistido por IA: evidencia, comparables, informe y checklist de auditoría. Diseñado para entornos regulados (SIB-friendly).
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]"
          >
            Solicitar Demo
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-white/20 text-slate-200 font-medium hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]"
          >
            Ver Plataforma
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <span>5 verticales</span>
          <span>·</span>
          <span>auditoría trazable</span>
          <span>·</span>
          <span>control de costos</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">DEMO</span>
        </div>
      </div>
    </section>
  );
}

// --- Wizard Section ---
type WizardWho = 'banco' | 'cooperativa' | 'empresa' | 'broker';
type WizardNeed = 'valuacion' | 'monitoreo' | 'auditoria' | 'cumplimiento';
type WizardCollateral = 'inmueble' | 'vehiculo' | 'equipo_industrial' | 'equipo_hotelero' | 'otro';

const WHO_OPTIONS: { value: WizardWho; label: string }[] = [
  { value: 'banco', label: 'Banco' },
  { value: 'cooperativa', label: 'Cooperativa' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'broker', label: 'Broker' },
];

const NEED_OPTIONS: { value: WizardNeed; label: string }[] = [
  { value: 'valuacion', label: 'Valuación' },
  { value: 'monitoreo', label: 'Monitoreo' },
  { value: 'auditoria', label: 'Auditoría' },
  { value: 'cumplimiento', label: 'Cumplimiento' },
];

const COLLATERAL_OPTIONS: { value: WizardCollateral; label: string; vertical: Vertical }[] = [
  { value: 'inmueble', label: 'Inmueble', vertical: 'real_estate' },
  { value: 'vehiculo', label: 'Vehículo', vertical: 'vehicles' },
  { value: 'equipo_industrial', label: 'Equipo Industrial', vertical: 'equipment' },
  { value: 'equipo_hotelero', label: 'Equipo Hotelero', vertical: 'hotel_equipment' },
  { value: 'otro', label: 'Otro', vertical: 'other' },
];

function WizardSection() {
  const [step, setStep] = useState(1);
  const [who, setWho] = useState<WizardWho | null>(null);
  const [need, setNeed] = useState<WizardNeed | null>(null);
  const [collateral, setCollateral] = useState<WizardCollateral | null>(null);

  const selectedCollateral = useMemo(() => COLLATERAL_OPTIONS.find((c) => c.value === collateral), [collateral]);
  const priceFrom = useMemo(() => {
    if (!selectedCollateral) return null;
    return DEFAULT_PRICING[selectedCollateral.vertical];
  }, [selectedCollateral]);

  const returnToUrl = useMemo(() => {
    const returnParams = new URLSearchParams();
    if (who) returnParams.set('profile', who);
    if (need) returnParams.set('need', need);
    if (collateral) returnParams.set('collateral', collateral);
    const returnPath = `/cases/new${returnParams.toString() ? `?${returnParams.toString()}` : ''}`;
    const loginParams = new URLSearchParams({ returnTo: returnPath });
    return `/login?${loginParams.toString()}`;
  }, [who, need, collateral]);

  const handleNext = useCallback(() => {
    if (step < 4) setStep((s) => s + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleReset = useCallback(() => {
    setStep(1);
    setWho(null);
    setNeed(null);
    setCollateral(null);
  }, []);

  return (
    <section id="wizard" className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white text-center mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          ¿Cómo podemos ayudarte?
        </h2>
        <p className="text-slate-400 text-center mb-10">Selecciona tu perfil y necesidades</p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex gap-2 mb-8" role="tablist" aria-label="Pasos del asistente">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                role="tab"
                aria-selected={step === s}
                tabIndex={step === s ? 0 : -1}
                className={`flex-1 h-1 rounded transition-colors ${step === s ? 'bg-[var(--nu-gold)]' : 'bg-white/10'}`}
                aria-label={`Paso ${s}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div role="radiogroup" aria-label="Soy" className="space-y-2">
              <p className="text-sm font-medium text-slate-300 mb-4">Soy</p>
              {WHO_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { setWho(o.value); handleNext(); }}
                  className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)] ${
                    who === o.value ? 'border-[var(--nu-gold)] bg-[var(--nu-gold)]/10' : 'border-white/10 hover:bg-white/5'
                  }`}
                  role="radio"
                  aria-checked={who === o.value}
                >
                  <span className="text-white">{o.label}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div role="radiogroup" aria-label="Necesito" className="space-y-2">
              <p className="text-sm font-medium text-slate-300 mb-4">Necesito</p>
              {NEED_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { setNeed(o.value); handleNext(); }}
                  className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)] ${
                    need === o.value ? 'border-[var(--nu-gold)] bg-[var(--nu-gold)]/10' : 'border-white/10 hover:bg-white/5'
                  }`}
                  role="radio"
                  aria-checked={need === o.value}
                >
                  <span className="text-white">{o.label}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div role="radiogroup" aria-label="Garantía" className="space-y-2">
              <p className="text-sm font-medium text-slate-300 mb-4">Garantía</p>
              {COLLATERAL_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { setCollateral(o.value); handleNext(); }}
                  className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)] ${
                    collateral === o.value ? 'border-[var(--nu-gold)] bg-[var(--nu-gold)]/10' : 'border-white/10 hover:bg-white/5'
                  }`}
                  role="radio"
                  aria-checked={collateral === o.value}
                >
                  <span className="text-white">{o.label}</span>
                  <span className="text-sm text-[var(--nu-gold)]">Desde RD${DEFAULT_PRICING[o.vertical].toLocaleString('es-DO')}</span>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-sm text-slate-400">Resumen</p>
                <p className="text-white font-medium">{WHO_OPTIONS.find((o) => o.value === who)?.label ?? '—'}</p>
                <p className="text-white font-medium">{NEED_OPTIONS.find((o) => o.value === need)?.label ?? '—'}</p>
                <p className="text-white font-medium">{COLLATERAL_OPTIONS.find((o) => o.value === collateral)?.label ?? '—'}</p>
                {priceFrom != null && (
                  <p className="text-[var(--nu-gold)] font-semibold mt-2">Desde RD${priceFrom.toLocaleString('es-DO')}</p>
                )}
              </div>
              <div className="flex gap-4">
                <Link
                  href={returnToUrl}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]"
                >
                  Empezar
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-lg border border-white/20 text-slate-300 text-sm hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          )}

          {step < 4 && step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-6 text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded px-2 py-1"
            >
              ← Atrás
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// --- Service Tiles ---
const SERVICE_TILES = [
  { icon: FileCheck, title: 'Valorar una garantía', desc: 'Pipeline asistido por IA con evidencia, comparables e informe. En minutos, según complejidad.' },
  { icon: BarChart3, title: 'Monitorear cartera', desc: 'Alertas por zona, dispersión y casos estancados. Roadmap.' },
  { icon: Shield, title: 'Cumplimiento y auditoría', desc: 'Audit pack exportable. Trazabilidad HECHOS/SUPUESTOS/CÁLCULOS/OPINIÓN. SIB-friendly.' },
];

const CAPABILITIES = [
  'Re-tasación programada (roadmap)',
  'Control de SLA operativo',
  'Control de costos IA por tasación (roadmap)',
  'Integración con core bancario (listo para integrar)',
];

function ServiceTilesSection() {
  return (
    <section id="servicios" className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Servicios
        </h2>
        <p className="text-slate-400 mb-10">Soluciones para valuación y evaluación de garantías</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICE_TILES.map((t, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] mb-4">
                <t.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-slate-400 mb-2">Capacidades integrables (roadmap)</p>
          <ul className="flex flex-wrap gap-2">
            {CAPABILITIES.map((c, i) => (
              <li key={i} className="text-xs px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// --- Industries ---
const INDUSTRIES = [
  { icon: Building2, title: 'Banca Comercial', desc: 'Valuación de garantías para carteras comerciales e hipotecarias.' },
  { icon: Building2, title: 'Hipotecario', desc: 'Evaluación de inmuebles como garantía hipotecaria.' },
  { icon: Car, title: 'Leasing', desc: 'Valuación de activos para arrendamiento financiero.' },
  { icon: Hotel, title: 'Hospitalidad', desc: 'Equipamiento hotelero y activos turísticos.' },
];

function IndustriesSection() {
  return (
    <section id="industrias" className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Industrias
        </h2>
        <p className="text-slate-400 mb-10">Sectores que atendemos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INDUSTRIES.map((t, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] mb-4">
                <t.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2">{t.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Pipeline ---
const PIPELINE_STEPS = [
  { icon: FileInput, label: 'Recepción' },
  { icon: Search, label: 'Investigación' },
  { icon: BarChart3, label: 'Comparables' },
  { icon: FileText, label: 'Informe' },
  { icon: CheckCircle, label: 'QA' },
  { icon: Shield, label: 'Compliance' },
];

function PipelineSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="plataforma" ref={ref} className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Pipeline de tasación
        </h2>
        <p className="text-slate-400 mb-10">Tiempo en minutos. Audit pack exportable. Diseñado para entornos SIB-friendly.</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 overflow-x-auto pb-4">
          {PIPELINE_STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col items-center shrink-0 w-full md:w-auto md:flex-1 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[var(--nu-gold)]">
                <s.icon className="w-7 h-7" />
              </div>
              <p className="mt-3 font-medium text-white">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Case Studies ---
const CASE_STUDIES = [
  { name: 'Banco Regional (DEMO)', metric: 'Reducción significativa de tiempos de valuación', desc: 'Pipeline asistido por IA.' },
  { name: 'Cooperativa Nacional (DEMO)', metric: 'Consistencia en metodología', desc: 'Audit pack para supervisión.' },
  { name: 'Financiera (DEMO)', metric: 'Mejor preparación de auditoría', desc: 'Trazabilidad completa.' },
];

function CaseStudiesSection() {
  return (
    <section id="nosotros" className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Casos de éxito
        </h2>
        <p className="text-slate-400 mb-10">Historias ilustrativas (DEMO)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CASE_STUDIES.map((c, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">DEMO</span>
              <h3 className="mt-2 font-semibold text-white">{c.name}</h3>
              <p className="mt-1 text-[var(--nu-gold)] text-sm font-medium">{c.metric}</p>
              <p className="mt-2 text-slate-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Stats ---
const STAT_ITEMS = [
  { label: 'Casos procesados*', value: '12,000+', suffix: '' },
  { label: 'Tiempo promedio*', value: 'En minutos', suffix: 'según complejidad' },
  { label: 'Cobertura*', value: '5', suffix: 'verticales' },
];

function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STAT_ITEMS.map((s, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <p className="text-3xl md:text-4xl font-serif text-[var(--nu-gold)]" style={{ fontFamily: '"DM Serif Display", serif' }}>
                {s.value}
              </p>
              <p className="mt-1 text-white font-medium">{s.label}</p>
              {s.suffix && <p className="text-sm text-slate-500">{s.suffix}</p>}
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">*Ejemplo de demostración. No constituye garantía.</p>
      </div>
    </section>
  );
}

// --- Insights ---
const INSIGHTS = [
  { title: 'Boletín mercado RD (DEMO)', tag: 'Mercado' },
  { title: 'Riesgo por zona (DEMO)', tag: 'Riesgo' },
  { title: 'Tendencias garantías (DEMO)', tag: 'Tendencias' },
];

function InsightsSection() {
  return (
    <section id="insights" className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Insights
        </h2>
        <p className="text-slate-400 mb-10">Recursos y análisis</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INSIGHTS.map((i, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm relative">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/30 text-slate-400">{i.tag}</span>
              <h3 className="mt-2 font-semibold text-white">{i.title}</h3>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled
                  className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-slate-500 cursor-not-allowed"
                >
                  Leer más
                </button>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">Próximamente</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- News ---
const NEWS_ITEMS = [
  { title: 'Actualización pipeline Q1', tag: 'Producto', date: 'Mar 2026' },
  { title: 'Nueva vertical equipos', tag: 'Producto', date: 'Feb 2026' },
  { title: 'Audit pack v2', tag: 'Cumplimiento', date: 'Ene 2026' },
  { title: 'Guía SIB-friendly', tag: 'Regulación', date: 'Dic 2025' },
  { title: 'Control de costos IA', tag: 'Producto', date: 'Nov 2025' },
];

function NewsSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Actualizaciones
        </h2>
        <p className="text-slate-400 mb-10">Newsroom</p>
        <ul className="space-y-4">
          {NEWS_ITEMS.map((n, i) => (
            <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4 border-b border-white/5">
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 w-fit">{n.tag}</span>
              <span className="text-white font-medium flex-1">{n.title}</span>
              <span className="text-sm text-slate-500">{n.date}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 w-fit">DEMO</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// --- CTA Section ---
function CTASection() {
  return (
    <section id="contacto" className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Solicitar demo
        </h2>
        <p className="text-slate-400 mb-10">Complete el formulario y nos pondremos en contacto</p>
        <CTAForm />
      </div>
    </section>
  );
}

// --- Main Page ---
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <WizardSection />
      <ServiceTilesSection />
      <IndustriesSection />
      <PipelineSection />
      <CaseStudiesSection />
      <StatsSection />
      <InsightsSection />
      <NewsSection />
      <CTASection />
    </>
  );
}
