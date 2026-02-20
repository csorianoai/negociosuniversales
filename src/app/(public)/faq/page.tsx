import { Section } from '@/components/marketing/Section';

const FAQ_ITEMS = [
  {
    q: '¿Qué es Negocios Universales?',
    a: 'Una plataforma de tasación asistida por IA para instituciones financieras en República Dominicana. Incluye pipeline operacional, evidencia, comparables e informe con trazabilidad.',
  },
  {
    q: '¿Cómo se garantiza la trazabilidad?',
    a: 'Cada tasación documenta HECHOS, SUPUESTOS, CÁLCULOS y OPINIÓN. La evidencia y metodología quedan asociadas al caso.',
  },
  {
    q: '¿Es compatible con auditoría SIB?',
    a: 'La estructura está diseñada con criterios SIB-friendly. No constituye certificación de cumplimiento regulatorio.',
  },
  {
    q: '¿Puedo controlar los costos por tasación?',
    a: 'Sí. Hay visibilidad de costos por vertical y por caso, y control operacional.',
  },
  {
    q: '¿Funciona para múltiples instituciones?',
    a: 'Sí. Arquitectura multi-tenant con aislamiento de datos por institución.',
  },
  {
    q: '¿En cuánto tiempo se procesa una tasación?',
    a: 'El procesamiento puede completarse en minutos, según la complejidad del caso.',
  },
  {
    q: '¿Qué verticales soportan?',
    a: 'Inmobiliaria, vehículos, equipos, equipamiento hotelero y otros.',
  },
  {
    q: '¿Cómo se generan los comparables?',
    a: 'El pipeline incluye una etapa de investigación y comparables asistida por IA, con ajustes documentados.',
  },
  {
    q: '¿Qué incluye el audit pack?',
    a: 'Evidencia, comparables, informe y trazabilidad de decisiones, exportables para supervisión.',
  },
  {
    q: '¿Cómo solicito una demo?',
    a: 'Use el formulario de contacto o la página de solicitud de demo. Nos pondremos en contacto pronto.',
  },
];

export default function FAQPage() {
  return (
    <div className="py-12 md:py-20">
      <Section title="Preguntas frecuentes" subtitle="Para equipos de riesgos, crédito, valuaciones y cumplimiento">
        <div className="space-y-4 max-w-3xl">
          {FAQ_ITEMS.map((faq, i) => (
            <details
              key={i}
              className="group rounded-lg border border-white/10 bg-white/5 overflow-hidden"
            >
              <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between text-slate-200 font-medium hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-inset">
                {faq.q}
                <span className="ml-2 text-slate-500 shrink-0" aria-hidden>▼</span>
              </summary>
              <p className="px-4 pb-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  );
}
