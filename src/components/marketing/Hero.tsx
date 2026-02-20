'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

const BULLETS = [
  'Evidencia, comparables e informe generados por IA con trazabilidad completa.',
  'Pipeline operacional: desde recepción hasta compliance, con control de costos.',
  'Diseñado para auditoría: HECHOS, SUPUESTOS, CÁLCULOS, OPINIÓN documentados.',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-28 md:py-36">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--nu-gold)]/5 rounded-full blur-[120px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-serif text-white leading-tight"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          Tasaciones trazables en minutos para la banca dominicana.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          Pipeline asistido por IA: evidencia, comparables, informe y checklist de auditoría, con control de costos y trazabilidad.
        </p>
        <ul className="mt-10 space-y-3 text-left max-w-xl mx-auto sm:mx-auto">
          {BULLETS.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-300">
              <Check className="w-5 h-5 shrink-0 text-[var(--nu-gold)] mt-0.5" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Solicitar demo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/security"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-white/20 text-slate-200 font-medium hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Ver cómo funciona
          </Link>
        </div>
      </div>
    </section>
  );
}
