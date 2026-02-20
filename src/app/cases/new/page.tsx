'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Banner } from '@/components/ui/Banner';
import { cn } from '@/lib/cn';

const PROPERTY_TYPES = ['residential', 'commercial', 'land'] as const;
const CONDITION_OPTIONS = ['Excelente', 'Bueno', 'Regular', 'Malo'] as const;
const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;

interface FormData {
  property_type: string;
  address: string;
  city: string;
  sector: string;
  area_m2: string;
  rooms: string;
  bathrooms: string;
  parking: string;
  floors: string;
  year_built: string;
  condition: string;
}

const initialForm: FormData = {
  property_type: 'residential',
  address: '',
  city: 'Santo Domingo',
  sector: '',
  area_m2: '',
  rooms: '',
  bathrooms: '',
  parking: '',
  floors: '',
  year_built: '',
  condition: 'Bueno',
};

interface FileItem {
  file: File;
  id: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const steps = 4;
  const progress = (currentStep / steps) * 100;

  function updateField<K extends keyof FormData>(k: K, v: FormData[K]) {
    setFormData((prev) => ({ ...prev, [k]: v }));
    setFieldErrors((prev) => ({ ...prev, [k]: '' }));
  }

  function validateStep(step: number): boolean {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!formData.address.trim()) errs.address = 'La dirección es requerida.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const added = Array.from(e.target.files ?? []);
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    setFiles((prev) => {
      const next = [...prev];
      for (const f of added) {
        if (next.length >= MAX_FILES) break;
        if (f.size > maxBytes) continue;
        next.push({ file: f, id: `${Date.now()}-${Math.random()}` });
      }
      return next.slice(0, MAX_FILES);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_type: formData.property_type,
          address: formData.address,
          city: formData.city,
          sector: formData.sector || null,
          property_type: formData.property_type,
          property_data: {
            address: formData.address,
            city: formData.city,
            sector: formData.sector || null,
            property_type: formData.property_type,
            area_m2: formData.area_m2 ? Number(formData.area_m2) : null,
            rooms: formData.rooms ? Number(formData.rooms) : null,
            bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
            parking: formData.parking ? Number(formData.parking) : null,
            floors: formData.floors ? Number(formData.floors) : null,
            year_built: formData.year_built ? Number(formData.year_built) : null,
            condition: formData.condition || null,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? `Error ${res.status}. Intente de nuevo.`);
        setSubmitting(false);
        return;
      }

      const json = await res.json();
      const caseId = json.id ?? json.case_id ?? json.data?.id;
      if (!caseId) {
        setError('No se recibió ID del caso.');
        setSubmitting(false);
        return;
      }

      for (const { file } of files) {
        const fd = new FormData();
        fd.append('file', file);
        const er = await fetch(`/api/cases/${caseId}/evidence`, { method: 'POST', body: fd });
        if (!er.ok) setError(`Error al subir ${file.name}. Continuando...`);
      }

      const runRes = await fetch(`/api/cases/${caseId}/run`, { method: 'POST' });
      if (!runRes.ok) setError('Caso creado pero no se pudo iniciar el pipeline.');

      router.push(`/cases/${caseId}`);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 border rounded-md text-[#0B1220] placeholder:text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:border-[#1D4ED8] transition-colors duration-150';
  const inputErrorClass = 'border-[#B91C1C]';

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <Link
          href="/cases"
          className="text-sm font-medium text-[#1D4ED8] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 rounded"
        >
          ← Volver a Casos
        </Link>

        <h1 className="text-2xl font-bold text-[#0B1220]">Nuevo Caso</h1>

        <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1D4ED8] transition-all duration-[180ms]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {error && <Banner variant="error" message={error} />}

        {currentStep === 1 && (
          <div className="space-y-4 bg-white rounded-lg border border-[#D8E0EA] p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
            <h2 className="font-semibold text-[#0B1220]">Paso 1: Datos básicos</h2>
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-1">Tipo de propiedad *</label>
              <select
                value={formData.property_type}
                onChange={(e) => updateField('property_type', e.target.value)}
                className={inputClass}
              >
                <option value="residential">Residencial</option>
                <option value="commercial">Comercial</option>
                <option value="land">Terreno</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-1">Dirección *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
                className={cn(inputClass, fieldErrors.address && inputErrorClass)}
              />
              {fieldErrors.address && <p className="text-sm text-[#B91C1C] mt-1">{fieldErrors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-1">Ciudad</label>
              <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-1">Sector</label>
              <input type="text" value={formData.sector} onChange={(e) => updateField('sector', e.target.value)} className={inputClass} />
            </div>
            <button
              type="button"
              onClick={() => validateStep(1) && setCurrentStep(2)}
              className="w-full py-3 text-white font-medium rounded-md bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2"
            >
              Siguiente
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 bg-white rounded-lg border border-[#D8E0EA] p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
            <h2 className="font-semibold text-[#0B1220]">Paso 2: Características</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: 'area_m2' as const, l: 'Área m²' },
                { k: 'rooms' as const, l: 'Habitaciones' },
                { k: 'bathrooms' as const, l: 'Baños' },
                { k: 'parking' as const, l: 'Estacionamientos' },
                { k: 'floors' as const, l: 'Pisos' },
                { k: 'year_built' as const, l: 'Año construcción' },
              ].map(({ k, l }) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-[#0B1220] mb-1">{l}</label>
                  <input type="number" value={formData[k]} onChange={(e) => updateField(k, e.target.value)} className={inputClass} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-1">Condición</label>
              <select value={formData.condition} onChange={(e) => updateField('condition', e.target.value)} className={inputClass}>
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 border border-[#D8E0EA] font-medium rounded-md text-[#4B5563] hover:bg-[#F1F4F8] transition-colors duration-150"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-3 text-white font-medium rounded-md bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 transition-colors duration-150"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 bg-white rounded-lg border border-[#D8E0EA] p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
            <h2 className="font-semibold text-[#0B1220]">Paso 3: Evidencia</h2>
            <p className="text-sm text-[#4B5563]">Imágenes o PDF. Máx. {MAX_FILES} archivos, {MAX_FILE_SIZE_MB} MB c/u.</p>
            <div
              className="border-2 border-dashed border-[#D8E0EA] rounded-lg p-8 text-center cursor-pointer hover:border-[#1D4ED8]/50 hover:bg-[#1D4ED8]/[0.02] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[#1D4ED8]/35"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple onChange={handleFileChange} className="hidden" />
              <p className="text-[#4B5563]">Clic para subir</p>
              <p className="text-sm text-[#6B7280] mt-1">
                {files.length} / {MAX_FILES} archivos
              </p>
            </div>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map(({ file, id }) => (
                  <li key={id} className="flex items-center justify-between py-2 border-b border-[#D8E0EA]/60">
                    <span className="text-sm truncate text-[#0B1220]">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(id)}
                      className="text-[#B91C1C] hover:text-[#B91C1C]/80 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 rounded"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-3 border border-[#D8E0EA] font-medium rounded-md text-[#4B5563] hover:bg-[#F1F4F8] transition-colors duration-150"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex-1 py-3 text-white font-medium rounded-md bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 transition-colors duration-150"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 bg-white rounded-lg border border-[#D8E0EA] p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
            <h2 className="font-semibold text-[#0B1220]">Paso 4: Resumen</h2>
            <div className="space-y-2 text-sm text-[#4B5563]">
              <p><strong className="text-[#0B1220]">Tipo:</strong> {formData.property_type}</p>
              <p><strong className="text-[#0B1220]">Dirección:</strong> {formData.address}</p>
              <p><strong className="text-[#0B1220]">Ciudad:</strong> {formData.city}</p>
              <p><strong className="text-[#0B1220]">Sector:</strong> {formData.sector || '—'}</p>
              <p><strong className="text-[#0B1220]">Área:</strong> {formData.area_m2 || '—'} m²</p>
              <p><strong className="text-[#0B1220]">Archivos:</strong> {files.length}</p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 text-white font-semibold rounded-md bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2"
            >
              {submitting ? 'Creando...' : 'Crear Caso e Iniciar Tasación'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full py-2 border border-[#D8E0EA] font-medium rounded-md text-[#4B5563] hover:bg-[#F1F4F8] transition-colors duration-150"
            >
              Atrás
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
