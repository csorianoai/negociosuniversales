'use client';

import { FileInput, Search, BarChart3, FileText, CheckCircle, Shield } from 'lucide-react';
import { Section } from './Section';

const STEPS = [
  { icon: FileInput, label: 'Recepción', desc: 'Intake y validación' },
  { icon: Search, label: 'Investigación', desc: 'Contexto de mercado' },
  { icon: BarChart3, label: 'Comparables', desc: 'Análisis y ajustes' },
  { icon: FileText, label: 'Informe', desc: 'Generación del informe' },
  { icon: CheckCircle, label: 'QA', desc: 'Control de calidad' },
  { icon: Shield, label: 'Compliance', desc: 'SIB-friendly' },
];

export function Pipeline() {
  return (
    <Section title="Pipeline de tasación" subtitle="Desde la recepción hasta el checklist de auditoría">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 overflow-x-auto pb-4">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center shrink-0 w-full md:w-auto md:flex-1"
          >
            <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[var(--nu-gold)]">
              <s.icon className="w-7 h-7" />
            </div>
            <p className="mt-3 font-medium text-white">{s.label}</p>
            <p className="text-xs text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-500 text-center max-w-xl mx-auto">
        Diseñado para auditoría. Proceso SIB-friendly. No constituye certificación de cumplimiento.
      </p>
    </Section>
  );
}
