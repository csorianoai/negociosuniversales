'use client';

import Link from 'next/link';
import { FileInput, Search, BarChart3, FileText, CheckCircle, Shield, ArrowRight, Database, DollarSign } from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: FileInput, label: 'Recepción', desc: 'Ingreso de solicitud y documentación' },
  { icon: Search, label: 'Investigación', desc: 'Recopilación de datos de mercado' },
  { icon: BarChart3, label: 'Comparables', desc: 'Análisis y ajustes metodológicos' },
  { icon: FileText, label: 'Informe', desc: 'Generación del documento de tasación' },
  { icon: CheckCircle, label: 'QA', desc: 'Revisión de calidad' },
  { icon: Shield, label: 'Compliance', desc: 'Validación y exportación' },
];

export default function PlataformaPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          Plataforma
        </h1>
        <p className="text-slate-400 text-lg mb-16">Pipeline de tasación, trazabilidad y operaciones</p>

        <section className="mb-20">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Pipeline de tasación
          </h2>
          <p className="text-slate-400 mb-8">
            Proceso asistido por IA que reduce tiempos a minutos según complejidad. Cada etapa está documentada y preparada para auditoría.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PIPELINE_STEPS.map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] mb-4">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white mb-2">{s.label}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Trazabilidad y auditoría
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <p className="text-slate-300 mb-6">
              Cada informe separa claramente hechos, supuestos, cálculos y opinión profesional. Diseñado para preparar auditorías y cumplimiento regulatorio.
            </p>
            <ul className="space-y-3">
              {['Hechos verificables (evidencia documentada)', 'Supuestos metodológicos (justificados)', 'Cálculos trazables', 'Opinión profesional'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-[var(--nu-gold)]/20 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--nu-gold)]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Operaciones
          </h2>
          <p className="text-slate-400 mb-6">
            Colas de trabajo, métricas de SLA y visibilidad del estado de cada caso. Acceso desde el portal privado.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Operaciones y colas</h3>
                <p className="text-slate-400 text-sm">Visibilidad del pipeline y SLA por caso</p>
              </div>
            </div>
            <Link
              href="/login?returnTo=/operations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-medium hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
            >
              Acceder
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-serif text-white mb-6" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Control de costos
          </h2>
          <p className="text-slate-400 mb-6">
            Visibilidad de costos por tasación y políticas por complejidad. Gestión desde el portal privado.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Costos y política</h3>
                <p className="text-slate-400 text-sm">Control por caso y configuración de tarifas</p>
              </div>
            </div>
            <Link
              href="/login?returnTo=/costs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-medium hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
            >
              Acceder
              <ArrowRight className="w-4 h-4" />
            </Link>
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
