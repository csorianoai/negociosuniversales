'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isRecord } from '@/lib/case-utils';
import {
  Building2,
  Receipt,
  Plug,
  Bell,
  Shield,
  Server,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const VERTICAL_LABELS: Record<string, string> = {
  real_estate: 'Inmobiliaria',
  vehicles: 'Vehículos',
  equipment: 'Equipos',
  hotel_equipment: 'Equip. Hotel',
  other: 'Otros',
};

export default function SettingsPage() {
  const [pricing, setPricing] = useState<Record<string, number> | null>(null);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPipeline, setNotifPipeline] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('nu_pricing_v1');
      if (raw) {
        const p = JSON.parse(raw) as unknown;
        if (p !== null && typeof p === 'object') {
          setPricing(p as Record<string, number>);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const plan = 'pro';
  const tenantName = 'Banco Demo SA';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1
            className="text-2xl font-serif text-[var(--nu-text)]"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Configuración
          </h1>
          <p className="text-sm text-[var(--nu-text-muted)] mt-0.5">
            Ajustes del tenant y preferencias
          </p>
        </div>

        <div
          className="rounded-xl border border-[var(--nu-blue)]/30 bg-[var(--nu-blue)]/10 px-4 py-3 text-sm text-[var(--nu-blue)]"
          role="status"
        >
          Configuraciones avanzadas por banco en v2
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[var(--nu-text-muted)]" />
              <h2 className="font-semibold text-[var(--nu-text)]">
                Perfil del Tenant
              </h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[var(--nu-text-muted)]">Nombre Banco</dt>
                <dd className="text-[var(--nu-text)] font-medium">{tenantName}</dd>
              </div>
              <div>
                <dt className="text-[var(--nu-text-muted)]">Plan</dt>
                <dd>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--nu-gold-dim)] text-[var(--nu-gold)]">
                    {plan}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--nu-text-muted)]">RNC</dt>
                <dd className="text-[var(--nu-text-muted)]">Disponible en v2</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-[var(--nu-text-muted)]" />
              <h2 className="font-semibold text-[var(--nu-text)]">
                Configuración de Facturación
              </h2>
            </div>
            {pricing ? (
              <div className="space-y-2 mb-4">
                {Object.entries(pricing).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-[var(--nu-text-muted)]">
                      {VERTICAL_LABELS[k] ?? k}
                    </span>
                    <span className="text-[var(--nu-text)] font-tabular">
                      RD$ {Number(v).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--nu-text-muted)] mb-4">
                Sin configuración guardada
              </p>
            )}
            <Link
              href="/billing"
              className="text-sm font-medium text-[var(--nu-gold)] hover:underline"
            >
              Ir a Facturación →
            </Link>
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plug className="w-5 h-5 text-[var(--nu-text-muted)]" />
              <h2 className="font-semibold text-[var(--nu-text)]">
                Integraciones
              </h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-[var(--nu-text-secondary)]">Supabase DB</span>
                <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400">
                  Conectado
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--nu-text-secondary)]">Anthropic</span>
                <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400">
                  Conectado
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--nu-text-secondary)]">Storage Evidencia</span>
                <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400">
                  Conectado
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--nu-text-secondary)]">API Comparables</span>
                <span className="px-2 py-0.5 text-xs rounded bg-slate-500/20 text-slate-400">
                  Próximamente
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--nu-text-secondary)]">Firma Digital</span>
                <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400">
                  No configurado
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[var(--nu-text-muted)]" />
              <h2 className="font-semibold text-[var(--nu-text)]">
                Notificaciones
              </h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--nu-text-secondary)]">
                  Email por caso nuevo
                </span>
                <input
                  type="checkbox"
                  checked={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.checked)}
                  className="rounded border-[var(--nu-border)]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--nu-text-secondary)]">
                  Pipeline completado
                </span>
                <input
                  type="checkbox"
                  checked={notifPipeline}
                  onChange={(e) => setNotifPipeline(e.target.checked)}
                  className="rounded border-[var(--nu-border)]"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[var(--nu-text-muted)]" />
              <h2 className="font-semibold text-[var(--nu-text)]">Seguridad</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[var(--nu-text-muted)]">Email</dt>
                <dd className="text-[var(--nu-text)]">Usuario actual</dd>
              </div>
              <label className="flex items-center justify-between cursor-pointer block">
                <span className="text-[var(--nu-text-secondary)]">MFA</span>
                <input
                  type="checkbox"
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                  disabled
                  className="rounded border-[var(--nu-border)] opacity-50"
                />
              </label>
              <p className="text-xs text-[var(--nu-text-muted)]">Deshabilitado</p>
            </dl>
          </div>

          <div className="rounded-xl border border-[var(--nu-border)] bg-[var(--nu-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-[var(--nu-text-muted)]" />
              <h2 className="font-semibold text-[var(--nu-text)]">Sistema</h2>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-[var(--nu-text-muted)]">Versión</dt>
                <dd className="text-[var(--nu-text)] font-mono">v1.0.0-beta</dd>
              </div>
              <div>
                <dt className="text-[var(--nu-text-muted)]">Ambiente</dt>
                <dd className="text-[var(--nu-text)]">
                  {(() => {
                    const p: unknown = typeof process !== 'undefined' ? process : null;
                    if (!p || !isRecord(p)) return 'development';
                    const env = p.env;
                    if (!env || !isRecord(env)) return 'development';
                    const v = env.NODE_ENV;
                    return typeof v === 'string' ? v : 'development';
                  })()}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--nu-text-muted)]">Soporte</dt>
                <dd>
                  <a
                    href="mailto:soporte@negociosuniversales.ai"
                    className="text-[var(--nu-gold)] hover:underline"
                  >
                    soporte@negociosuniversales.ai
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
