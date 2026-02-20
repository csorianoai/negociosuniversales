'use client';

import { FileCheck, Settings, ShieldCheck } from 'lucide-react';
import { Section } from './Section';

const FEATURES = [
  {
    icon: FileCheck,
    title: 'Trazabilidad',
    description: 'Cada tasación genera evidencia, comparables e informe con metodología documentada. HECHOS, SUPUESTOS, CÁLCULOS y OPINIÓN claramente separados.',
  },
  {
    icon: Settings,
    title: 'Control operacional',
    description: 'Pipeline visual por etapas. Costos por tasación, monitoreo de colas y métricas por institución. Multi-tenant con aislamiento de datos.',
  },
  {
    icon: ShieldCheck,
    title: 'Diseñado para auditoría',
    description: 'Estructura SIB-friendly. Audit pack exportable. Trazabilidad completa para supervisión y cumplimiento regulatorio.',
  },
];

export function FeatureGrid() {
  return (
    <Section title="Por qué Negocios Universales" subtitle="Plataforma de tasación para instituciones financieras en República Dominicana">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)]">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
