'use client';

import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 py-12 mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/servicios" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Valoración
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Monitoreo
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Auditoría
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Industrias</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/industrias" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Banca
                </Link>
              </li>
              <li>
                <Link href="/industrias" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Hipotecario
                </Link>
              </li>
              <li>
                <Link href="/industrias" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Leasing
                </Link>
              </li>
              <li>
                <Link href="/industrias" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Hospitalidad
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/plataforma" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Plataforma
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Insights
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Seguridad
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/nosotros" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5">
          <p className="text-sm text-slate-500">informacion@negociosuniversales.ai · República Dominicana</p>
          <p className="mt-2 text-xs text-slate-600">
            DEMO / sin claims regulatorios absolutos. Precios de referencia. Diseñado para auditoría SIB-friendly. No constituye certificación de cumplimiento regulatorio.
          </p>
        </div>
      </div>
    </footer>
  );
}
