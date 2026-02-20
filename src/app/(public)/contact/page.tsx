import { Section } from '@/components/marketing/Section';
import { CTAForm } from '@/components/marketing/CTAForm';

export default function ContactPage() {
  return (
    <div className="py-12 md:py-20">
      <Section
        title="Contacto"
        subtitle="Solicite una demo o escríbanos para más información"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <CTAForm />
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white">Email</h3>
              <p className="text-slate-400 text-sm mt-1">informacion@negociosuniversales.ai</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">República Dominicana</h3>
              <p className="text-slate-400 text-sm mt-1">Santo Domingo</p>
            </div>
            <p className="text-sm text-slate-500">
              Responderemos en un plazo de 24-48 horas hábiles.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
