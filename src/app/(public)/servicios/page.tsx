'use client';

import Link from 'next/link';
import { FileCheck, BarChart3, Shield, DollarSign, Radar, Plug, ArrowRight, Building2, Car, Cpu, Hotel } from 'lucide-react';
import { LANDING_DEMO } from '@/lib/landing-demo';
import { cn } from '@/lib/cn';

const ICON_MAP: Record<string, typeof FileCheck> = {
  s1: FileCheck,
  s2: BarChart3,
  s3: Shield,
  s4: DollarSign,
  s5: Radar,
  s6: Plug,
};

const VERTICAL_ICONS = {
  real_estate: Building2,
  vehicles: Car,
  equipment: Cpu,
  hotel_equipment: Hotel,
} as const;

const ENTREGABLES = [
  'Informe de tasación con metodología',
  'Evidencia documentada (fotos, planos, documentos)',
  'Comparables y ajustes justificados',
  'Checklist de auditoría',
  'Trazabilidad HECHOS / SUPUESTOS / CÁLCULOS / OPINIÓN',
];

export default function ServiciosPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Servicios
        </h1>
        <p className="text-slate-400 text-lg mb-16">Soluciones para valuación y evaluación de garantías</p>

        <section className="mb-20">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Servicios principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDING_DEMO.services.map((s) => {
              const Icon = ICON_MAP[s.id] ?? FileCheck;
              const isRoadmap = s.badge === 'roadmap';
              return (
                <div
                  key={s.id}
                  className={cn(
                    'rounded-2xl border p-6',
                    isRoadmap ? 'border-white/5 bg-white/[0.02]' : 'border-white/10 bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    {isRoadmap && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/30 text-slate-400">Próximamente</span>
                    )}
                    {s.badge === 'enterprise' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">Enterprise</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{s.desc}</p>
                  {s.bullets.length > 0 && (
                    <ul className="space-y-1">
                      {s.bullets.map((b, i) => (
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
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Verticales
          </h2>
          <p className="text-slate-400 mb-6">Qué se incluye por tipo de activo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {LANDING_DEMO.verticals.map((v) => {
              const Icon = VERTICAL_ICONS[v.vertical as keyof typeof VERTICAL_ICONS] ?? Building2;
              return (
                <div key={v.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{v.label}</h3>
                  <p className="text-slate-400 text-sm">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Entregables por tasación
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <ul className="space-y-3">
              {ENTREGABLES.map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-[var(--nu-gold)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--nu-gold)]" />
                  </span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          >
            Solicitar demo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-slate-200 font-medium hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          >
            Ver plataforma
          </Link>
        </section>
      </div>
    </div>
  );
}
