'use client';

import { Clock, Layers, DollarSign, FileCheck } from 'lucide-react';
import { Section } from './Section';

const STATS = [
  { icon: Clock, label: 'En minutos', value: 'Tiempo de procesamiento', disclaimer: true },
  { icon: Layers, label: '5 verticales', value: 'Inmobiliaria, vehículos, equipos, hotel, otros' },
  { icon: DollarSign, label: 'Control de costos', value: 'Por tasación' },
  { icon: FileCheck, label: 'Trazabilidad completa', value: 'Evidencia y metodología' },
];

export function RoiStats() {
  return (
    <Section title="Ventajas operacionales" subtitle="Diseñado para instituciones con requisitos de trazabilidad">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)]">
              <s.icon className="w-5 h-5" />
            </div>
            <p className="mt-3 font-semibold text-white">{s.label}</p>
            <p className="mt-1 text-sm text-slate-400">{s.value}</p>
            {s.disclaimer && (
              <p className="mt-2 text-xs text-slate-500">*Según complejidad del caso</p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
