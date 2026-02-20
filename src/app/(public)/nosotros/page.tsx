'use client';

import Link from 'next/link';
import { ArrowRight, Target, FileCheck, Shield } from 'lucide-react';

const CRITERIOS = [
  'Metodología documentada y consistente',
  'Evidencia verificable en cada tasación',
  'Separación clara hechos / supuestos / cálculos / opinión',
  'Preparado para auditoría regulatoria',
];

const ENTREGABLES = [
  'Informe de tasación con metodología aplicada',
  'Evidencia documentada (fotos, planos, documentos)',
  'Comparables y ajustes justificados',
  'Checklist de auditoría',
];

export default function NosotrosPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Nosotros
        </h1>
        <p className="text-slate-400 text-lg mb-16">Quiénes somos y cómo trabajamos</p>

        <section className="mb-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-serif text-white mb-4" style={{ fontFamily: '"DM Serif Display", serif' }}>
              Negocios Universales
            </h2>
            <p className="text-slate-300 mb-4">
              Fundada en 2020, con experiencia en valuación desde 1995. Especializados en inmuebles, vehículos, equipos industriales y equipos hoteleros.
            </p>
            <p className="text-slate-400 text-sm">
              Áreas de especialización: residencial, comercial, terreno, vehículos, flotas, maquinaria industrial, FF&E y activos turísticos.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Criterios técnicos
          </h2>
          <ul className="space-y-3">
            {CRITERIOS.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[var(--nu-gold)]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="w-3 h-3 text-[var(--nu-gold)]" />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Entregables del informe
          </h2>
          <ul className="space-y-3">
            {ENTREGABLES.map((e, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-[var(--nu-gold)]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-3 h-3 text-[var(--nu-gold)]" />
                </span>
                {e}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16 rounded-2xl border border-[var(--nu-gold)]/20 bg-[var(--nu-gold)]/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
                Posicionamiento
              </h2>
              <p className="text-slate-300">
                Precisión, objetividad y respaldo documental. Diseñado para entornos regulados y auditoría.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          >
            Contactar
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
