'use client';

import { Section } from '@/components/marketing/Section';
import { CTAForm } from '@/components/marketing/CTAForm';
import Link from 'next/link';

export default function ContactoPage() {
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
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-white/20 text-slate-200 font-medium hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
            >
              Iniciar sesión en la plataforma →
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
