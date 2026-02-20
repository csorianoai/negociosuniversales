'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LANDING_DEMO } from '@/lib/landing-demo';
import { DemoBadge } from '@/components/marketing/DemoBadge';

export default function InsightsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Insights
        </h1>
        <p className="text-slate-400 text-lg mb-16">Recursos, análisis y tendencias (contenido demo)</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {LANDING_DEMO.insights.map((ins) => (
            <div key={ins.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <DemoBadge />
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/30 text-slate-400">{ins.category}</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{ins.title}</h2>
              <p className="text-slate-400 text-sm mb-4">{ins.desc}</p>
              <button
                type="button"
                disabled
                className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-slate-500 cursor-not-allowed inline-flex items-center gap-2"
              >
                Leer más
                <span className="text-xs text-slate-500">(Próximamente)</span>
              </button>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-xl font-serif text-white mb-4" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Newsroom
          </h2>
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
        </section>

        <section className="mt-12 flex flex-col sm:flex-row gap-4">
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
