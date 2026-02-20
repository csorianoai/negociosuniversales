import Link from 'next/link';
import { Section } from '@/components/marketing/Section';
import { SecuritySection } from '@/components/marketing/SecuritySection';

export default function SecurityPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h1
          className="text-3xl md:text-4xl font-serif text-white"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          Seguridad y trazabilidad
        </h1>
        <p className="mt-2 text-slate-400 text-lg">
          Principios de diseño para instituciones reguladas
        </p>
      </div>
      <SecuritySection />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        <Section title="SIB-friendly" subtitle="Diseñado para auditoría">
          <p className="text-slate-400 leading-relaxed">
            La estructura de informes y evidencia está diseñada para facilitar la supervisión y auditoría. 
            Cada tasación documenta claramente los hechos, supuestos, cálculos y opinión. 
            No constituye certificación de cumplimiento regulatorio.
          </p>
        </Section>
        <div className="pb-12">
          <Link
            href="/contact"
            className="inline-flex px-6 py-3 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Solicitar demo
          </Link>
        </div>
      </div>
    </div>
  );
}
