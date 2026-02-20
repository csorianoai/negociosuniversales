'use client';

import { FileCheck, FolderOpen, Lock, DollarSign } from 'lucide-react';
import { Section } from './Section';

const ITEMS = [
  {
    icon: FileCheck,
    title: 'Trazabilidad',
    text: 'HECHOS, SUPUESTOS, CÁLCULOS y OPINIÓN en cada informe. Metodología documentada y evidencia asociada.',
  },
  {
    icon: FolderOpen,
    title: 'Audit pack',
    text: 'Exportable para supervisión. Incluye evidencia, comparables y trazabilidad de decisiones.',
  },
  {
    icon: Lock,
    title: 'Multi-tenant',
    text: 'Aislamiento por institución. Cada tenant gestiona sus propios casos y configuraciones.',
  },
  {
    icon: DollarSign,
    title: 'Control de costos',
    text: 'Costos por tasación y por vertical. Visibilidad de uso de IA y facturación.',
  },
];

export function SecuritySection() {
  return (
    <Section title="Seguridad y trazabilidad" subtitle="Diseñado para instituciones reguladas">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-slate-400 text-sm leading-relaxed">{item.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
