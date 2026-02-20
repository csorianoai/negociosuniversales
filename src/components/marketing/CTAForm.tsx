'use client';

import { useState, useCallback } from 'react';

type FormState = {
  name: string;
  email: string;
  institution: string;
  phone: string;
  message: string;
  vertical: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const VERTICAL_OPTIONS = [
  { value: '', label: 'Seleccione...' },
  { value: 'real_estate', label: 'Inmobiliaria' },
  { value: 'vehicles', label: 'Vehículos' },
  { value: 'equipment', label: 'Equipos' },
  { value: 'hotel_equipment', label: 'Equip. Hotel' },
  { value: 'other', label: 'Otros' },
];

const INITIAL_STATE: FormState = {
  name: '',
  email: '',
  institution: '',
  phone: '',
  message: '',
  vertical: '',
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'El nombre es requerido';
  if (!form.email.trim()) errors.email = 'El email es requerido';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Email inválido';
  if (!form.institution.trim()) errors.institution = 'La institución es requerida';
  return errors;
}

export function CTAForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormState];
        return next;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitted(true);
    setForm(INITIAL_STATE);
    setErrors({});
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('Gracias. Hemos recibido su solicitud y nos pondremos en contacto pronto.');
    }
  }, [form]);

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-lg font-medium text-[var(--nu-gold)]">Solicitud enviada</p>
        <p className="mt-2 text-slate-400 text-sm">
          Nos pondremos en contacto pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label htmlFor="cta-name" className="block text-sm font-medium text-slate-300 mb-1">
          Nombre *
        </label>
        <input
          id="cta-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)] focus:border-transparent"
          placeholder="Su nombre"
          autoComplete="name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="cta-email" className="block text-sm font-medium text-slate-300 mb-1">
          Email *
        </label>
        <input
          id="cta-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)] focus:border-transparent"
          placeholder="email@institucion.com"
          autoComplete="email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="cta-institution" className="block text-sm font-medium text-slate-300 mb-1">
          Institución *
        </label>
        <input
          id="cta-institution"
          name="institution"
          type="text"
          value={form.institution}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)] focus:border-transparent"
          placeholder="Nombre de la institución"
        />
        {errors.institution && <p className="mt-1 text-sm text-red-400">{errors.institution}</p>}
      </div>
      <div>
        <label htmlFor="cta-phone" className="block text-sm font-medium text-slate-300 mb-1">
          Teléfono (opcional)
        </label>
        <input
          id="cta-phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)] focus:border-transparent"
          placeholder="+1 (809) 000-0000"
          autoComplete="tel"
        />
      </div>
      <div>
        <label htmlFor="cta-vertical" className="block text-sm font-medium text-slate-300 mb-1">
          Vertical de interés
        </label>
        <select
          id="cta-vertical"
          name="vertical"
          value={form.vertical}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)] focus:border-transparent"
        >
          {VERTICAL_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="cta-message" className="block text-sm font-medium text-slate-300 mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          id="cta-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)] focus:border-transparent resize-none"
          placeholder="Cuéntanos sobre su caso de uso"
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Enviar solicitud
      </button>
    </form>
  );
}
