'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck, BarChart3, Shield, DollarSign } from 'lucide-react';
import { DEFAULT_PRICING, VERTICAL_LABELS } from '@/lib/billing-utils';
import type { Vertical } from '@/lib/billing-utils';
import { cn } from '@/lib/cn';
import { LANDING_DEMO, getRecommendedService, getServicesForWizard, type Profile, type Need, type Garantia } from '@/lib/landing-demo';

const PROFILES: { value: Profile; label: string }[] = [
  { value: 'banco', label: 'Banco' },
  { value: 'cooperativa', label: 'Cooperativa' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'broker', label: 'Broker' },
];

const NEEDS: { value: Need; label: string }[] = [
  { value: 'valuacion', label: 'Valuación' },
  { value: 'monitoreo', label: 'Monitoreo' },
  { value: 'auditoria', label: 'Auditoría' },
  { value: 'costos', label: 'Costos' },
];

const GARANTIAS: { value: Garantia; label: string }[] = [
  { value: 'real_estate', label: 'Inmueble' },
  { value: 'vehicles', label: 'Vehículo' },
  { value: 'equipment', label: 'Equipo' },
  { value: 'hotel_equipment', label: 'Hotel' },
  { value: 'other', label: 'Otro' },
];

const ICON_MAP = {
  valuacion: FileCheck,
  monitoreo: BarChart3,
  auditoria: Shield,
  costos: DollarSign,
};

export interface WizardNUProps {
  profile: Profile;
  need: Need;
  garantia: Garantia;
  onProfile: (p: Profile) => void;
  onNeed: (n: Need) => void;
  onGarantia: (g: Garantia) => void;
}

export function WizardNU({
  profile,
  need,
  garantia,
  onProfile,
  onNeed,
  onGarantia,
}: WizardNUProps) {
  const [step, setStep] = useState(1);

  const recommended = useMemo(() => getRecommendedService(need), [need]);
  const servicesForWizard = useMemo(() => getServicesForWizard(need, garantia), [need, garantia]);
  const priceFrom = useMemo(() => DEFAULT_PRICING[garantia], [garantia]);
  const loginUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('ref', 'wizard');
    params.set('perfil', profile);
    params.set('necesidad', need);
    params.set('garantia', garantia);
    return `/login?${params.toString()}`;
  }, [profile, need, garantia]);

  const IconComp = ICON_MAP[need] ?? FileCheck;

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <section id="wizard" className="py-16 md:py-24 px-4 scroll-mt-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-serif text-white text-center mb-2" style={{ fontFamily: '"DM Serif Display", serif' }}>
          ¿Cómo podemos ayudarte hoy?
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 mt-10">
          <div className="flex gap-2 mb-8" role="tablist" aria-label="Pasos del asistente">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                role="tab"
                aria-selected={step === s}
                className={cn('flex-1 h-1 rounded transition-colors', step === s ? 'bg-[var(--nu-gold)]' : 'bg-white/10')}
                aria-label={`Paso ${s}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div role="radiogroup" aria-label="Soy">
              <p className="text-sm font-medium text-slate-400 mb-4">1. Soy</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROFILES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => { onProfile(p.value); handleNext(); }}
                    className={cn(
                      'px-4 py-3 rounded-xl border text-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]',
                      profile === p.value ? 'border-[var(--nu-gold)] bg-[var(--nu-gold)]/15 text-[var(--nu-gold)]' : 'border-white/10 hover:bg-white/5 text-slate-300'
                    )}
                    aria-pressed={profile === p.value}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div role="radiogroup" aria-label="Necesito">
              <p className="text-sm font-medium text-slate-400 mb-4">2. Necesito</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {NEEDS.map((n) => (
                  <button
                    key={n.value}
                    type="button"
                    onClick={() => { onNeed(n.value); handleNext(); }}
                    className={cn(
                      'px-4 py-3 rounded-xl border text-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]',
                      need === n.value ? 'border-[var(--nu-gold)] bg-[var(--nu-gold)]/15 text-[var(--nu-gold)]' : 'border-white/10 hover:bg-white/5 text-slate-300'
                    )}
                    aria-pressed={need === n.value}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div role="radiogroup" aria-label="Garantía">
              <p className="text-sm font-medium text-slate-400 mb-4">3. Garantía</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {GARANTIAS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => onGarantia(g.value)}
                    className={cn(
                      'px-4 py-3 rounded-xl border text-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]',
                      garantia === g.value ? 'border-[var(--nu-gold)] bg-[var(--nu-gold)]/15 text-[var(--nu-gold)]' : 'border-white/10 hover:bg-white/5 text-slate-300'
                    )}
                    aria-pressed={garantia === g.value}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-6 text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded px-2 py-1"
            >
              ← Atrás
            </button>
          )}
        </div>

        {step === 3 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <p className="text-sm font-medium text-slate-400 mb-2">Recomendación</p>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)] shrink-0">
                <IconComp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{recommended.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{recommended.desc}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-400 mb-2">Qué recibirás</p>
            <ul className="space-y-1 mb-6">
              {LANDING_DEMO.entregables.map((e, i) => (
                <li key={i} className="text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--nu-gold)]" />
                  {e}
                </li>
              ))}
            </ul>
            <p className="text-slate-400 text-sm mb-2">SLA orientativo: en minutos / según complejidad</p>
            <p className="text-[var(--nu-gold)] font-semibold mb-6">
              Desde RD${priceFrom.toLocaleString('es-DO')} ({VERTICAL_LABELS[garantia]})
            </p>
            <Link
              href={loginUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]"
            >
              Empezar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {step === 3 && servicesForWizard.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-medium text-slate-400 mb-4">Servicios relacionados</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {servicesForWizard.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'rounded-xl border p-4 transition-colors',
                    s.id === recommended.id ? 'border-[var(--nu-gold)]/50 bg-[var(--nu-gold)]/5' : 'border-white/10 bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded', s.badge === 'core' ? 'bg-emerald-500/20 text-emerald-400' : s.badge === 'roadmap' ? 'bg-slate-500/20 text-slate-400' : 'bg-violet-500/20 text-violet-400')}>
                      {s.badge === 'roadmap' ? 'Próximamente' : s.badge}
                    </span>
                    {s.id === recommended.id && <span className="text-xs text-[var(--nu-gold)]">Recomendado</span>}
                  </div>
                  <h4 className="font-medium text-white text-sm">{s.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
