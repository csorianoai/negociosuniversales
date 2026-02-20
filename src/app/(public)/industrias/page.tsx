'use client';

import Link from 'next/link';
import { Building2, Car, Hotel, Briefcase, ArrowRight } from 'lucide-react';
import { LANDING_DEMO } from '@/lib/landing-demo';
import { DemoBadge } from '@/components/marketing/DemoBadge';

const INDUSTRY_ICONS: Record<string, typeof Building2> = {
  i1: Building2,
  i2: Building2,
  i3: Car,
  i4: Hotel,
};

export default function IndustriasPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Industrias
        </h1>
        <p className="text-slate-400 text-lg mb-16">Sectores que atendemos y cómo NU ayuda</p>

        {LANDING_DEMO.industries.map((ind) => {
          const Icon = INDUSTRY_ICONS[ind.id] ?? Briefcase;
          const cases = LANDING_DEMO.caseStudies.filter((c) => {
            const ci = c.industry ?? '';
            return (ind.id === 'i1' && ci === 'banca') || (ind.id === 'i2' && (ci === 'banca' || ci === 'cooperativa')) || (ind.id === 'i3' && ci === 'leasing');
          });
          return (
            <section key={ind.id} className="mb-16">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-white" style={{ fontFamily: '"DM Serif Display", serif' }}>
                      {ind.title}
                    </h2>
                    <p className="text-slate-400 mt-2">{ind.desc}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Problemas típicos</h3>
                    <ul className="space-y-2">
                      {ind.problems.map((p, i) => (
                        <li key={i} className="text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Cómo NU ayuda</h3>
                    <ul className="space-y-2">
                      {ind.howNu.map((h, i) => (
                        <li key={i} className="text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--nu-gold)]" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {cases.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Mini-casos (DEMO)</h3>
                    <div className="flex flex-wrap gap-4">
                      {cases.map((c) => (
                        <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4 min-w-[200px]">
                          <DemoBadge />
                          <p className="mt-2 font-medium text-white">{c.name}</p>
                          <p className="text-sm text-[var(--nu-gold)]">{c.metric}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}

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
