'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  BarChart3,
  Shield,
  Building2,
  Car,
  Hotel,
  Cpu,
  DollarSign,
  FileInput,
  Search,
  FileText,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { CTAForm } from '@/components/marketing/CTAForm';
import { WizardNU } from '@/components/marketing/WizardNU';
import { DemoBadge } from '@/components/marketing/DemoBadge';
import {
  LANDING_DEMO,
  getRecommendedService,
  getServicesForWizard,
  type Profile,
  type Need,
  type Garantia,
} from '@/lib/landing-demo';
import type { Vertical } from '@/lib/billing-utils';
import { cn } from '@/lib/cn';

const ICON_BY_NEED: Record<Need, typeof FileCheck> = {
  valuacion: FileCheck,
  monitoreo: BarChart3,
  auditoria: Shield,
  costos: DollarSign,
};

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
          Pipeline asistido por IA: evidencia, comparables, informe y checklist de auditoría. Diseñado para entornos regulados.
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

function ServiceTilesSection({ need, garantia }: { need: Need; garantia: Garantia }) {
  const ordered = useMemo(() => {
    const services = getServicesForWizard(need, garantia);
    return services.slice(0, 3);
  }, [need, garantia]);

  return (
    <section id="servicios" className="py-16 md:py-24 px-4 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Servicios
        </h2>
        <p className="text-slate-400 mb-10">Soluciones para valuación y evaluación de garantías</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ordered.map((s) => {
            const Icon = s.need ? ICON_BY_NEED[s.need] ?? FileCheck : FileCheck;
            return (
              <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  {s.badge === 'roadmap' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">Próximamente</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                {s.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {s.bullets.slice(0, 2).map((b, i) => (
                      <li key={i} className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[var(--nu-gold)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/servicios"
            className="text-sm font-medium text-[var(--nu-gold)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded"
          >
            Ver todos los servicios →
          </Link>
        </div>
      </div>
    </section>
  );
}

const VERTICAL_ICONS: Record<Vertical, typeof Building2> = {
  real_estate: Building2,
  vehicles: Car,
  equipment: Cpu,
  hotel_equipment: Hotel,
  other: FileCheck,
};

function VerticalsSection({ garantia }: { garantia: Garantia }) {
  const ordered = useMemo(() => {
    const v = [...LANDING_DEMO.verticals];
    const sel = v.find((x) => x.vertical === garantia);
    if (!sel) return v;
    const rest = v.filter((x) => x.vertical !== garantia);
    return [sel, ...rest];
  }, [garantia]);

  return (
    <section id="industrias" className="py-16 md:py-24 px-4 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Verticales
        </h2>
        <p className="text-slate-400 mb-10">Inmuebles, vehículos, equipos, hotel y más</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {ordered.map((v) => {
            const Icon = VERTICAL_ICONS[v.vertical];
            const isSelected = v.vertical === garantia;
            return (
              <div
                key={v.id}
                className={cn(
                  'rounded-xl border p-6 backdrop-blur-sm transition-colors',
                  isSelected ? 'border-[var(--nu-gold)]/50 bg-[var(--nu-gold)]/5' : 'border-white/10 bg-white/5'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{v.label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/industrias"
            className="text-sm font-medium text-[var(--nu-gold)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded"
          >
            Ver industrias →
          </Link>
        </div>
      </div>
    </section>
  );
}

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
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="plataforma" ref={ref} className="py-16 md:py-24 px-4 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Pipeline de tasación
        </h2>
        <p className="text-slate-400 mb-10">Tiempo en minutos. Audit pack exportable. Diseñado para auditoría.</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 overflow-x-auto pb-4">
          {PIPELINE_STEPS.map((s, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center shrink-0 w-full md:w-auto md:flex-1 transition-all duration-500',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[var(--nu-gold)]">
                <s.icon className="w-7 h-7" />
              </div>
              <p className="mt-3 font-medium text-white">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/plataforma"
            className="text-sm font-medium text-[var(--nu-gold)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded"
          >
            Conocer la plataforma →
          </Link>
        </div>
      </div>
    </section>
  );
}

function CaseStudiesSection() {
  return (
    <section id="casos" className="py-16 md:py-24 px-4 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Casos de éxito
        </h2>
        <p className="text-slate-400 mb-10">Historias ilustrativas (DEMO)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANDING_DEMO.caseStudies.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <DemoBadge />
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

function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LANDING_DEMO.stats.map((s, i) => (
            <div
              key={i}
              className={cn(
                'text-center transition-all duration-500',
                visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              )}
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

function InsightsSection() {
  return (
    <section id="insights" className="py-16 md:py-24 px-4 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Insights
        </h2>
        <p className="text-slate-400 mb-10">Recursos y análisis</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANDING_DEMO.insights.map((ins) => (
            <div key={ins.id} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm relative">
              <DemoBadge />
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-500/30 text-slate-400">{ins.category}</span>
              <h3 className="mt-2 font-semibold text-white">{ins.title}</h3>
              <p className="mt-2 text-slate-400 text-sm">{ins.desc}</p>
              <div className="mt-4">
                <span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">Próximamente</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/insights"
            className="text-sm font-medium text-[var(--nu-gold)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded"
          >
            Ver insights →
          </Link>
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Actualizaciones
        </h2>
        <p className="text-slate-400 mb-10">Newsroom</p>
        <ul className="space-y-4">
          {LANDING_DEMO.news.map((n) => (
            <li key={n.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4 border-b border-white/5">
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 w-fit">{n.tag}</span>
              <span className="text-white font-medium flex-1">{n.title}</span>
              <span className="text-sm text-slate-500">{n.date}</span>
              <DemoBadge />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contacto" className="py-16 md:py-24 px-4 scroll-mt-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Solicitar demo
        </h2>
        <p className="text-slate-400 mb-10">Complete el formulario y nos pondremos en contacto</p>
        <CTAForm />
        <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
          <Link href="/contacto" className="text-[var(--nu-gold)] hover:underline">
            Más opciones de contacto →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [profile, setProfile] = useState<Profile>('banco');
  const [need, setNeed] = useState<Need>('valuacion');
  const [garantia, setGarantia] = useState<Garantia>('real_estate');

  return (
    <>
      <HeroSection />
      <WizardNU
        profile={profile}
        need={need}
        garantia={garantia}
        onProfile={setProfile}
        onNeed={setNeed}
        onGarantia={setGarantia}
      />
      <ServiceTilesSection need={need} garantia={garantia} />
      <VerticalsSection garantia={garantia} />
      <PipelineSection />
      <CaseStudiesSection />
      <StatsSection />
      <InsightsSection />
      <NewsSection />
      <CTASection />
    </>
  );
}
