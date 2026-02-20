'use client';

import Link from 'next/link';
import { Section } from './Section';

const PREVIEW_FAQS = [
  { q: '¿Cómo se garantiza la trazabilidad?', a: 'Cada tasación documenta HECHOS, SUPUESTOS, CÁLCULOS y OPINIÓN.' },
  { q: '¿Es compatible con auditoría SIB?', a: 'Diseñado con estructura SIB-friendly. No constituye certificación.' },
  { q: '¿Puedo controlar los costos por tasación?', a: 'Sí. Visibilidad de costos por vertical y por caso.' },
  { q: '¿Funciona para múltiples instituciones?', a: 'Sí. Multi-tenant con aislamiento de datos por institución.' },
];

export function FAQPreview() {
  return (
    <Section title="Preguntas frecuentes" subtitle="Respuestas breves para equipos de riesgos y valuación">
      <div className="space-y-4 max-w-2xl">
        {PREVIEW_FAQS.map((faq, i) => (
          <details
            key={i}
            className="group rounded-lg border border-white/10 bg-white/5 overflow-hidden"
          >
            <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between text-slate-200 font-medium hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-inset">
              {faq.q}
              <span className="ml-2 text-slate-500 transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="px-4 pb-3 text-sm text-slate-400">{faq.a}</p>
          </details>
        ))}
      </div>
      <Link
        href="/faq"
        className="mt-8 inline-flex items-center px-6 py-3 rounded-lg border border-white/20 text-slate-200 font-medium hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Ver todas las preguntas
      </Link>
    </Section>
  );
}
