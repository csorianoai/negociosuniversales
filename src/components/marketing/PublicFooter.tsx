'use client';

import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 py-12 mt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p
              className="text-lg font-serif text-[var(--nu-gold)]"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Negocios Universales
            </p>
            <p className="text-xs text-slate-500 mt-1">Valuation OS</p>
          </div>
          <nav className="flex flex-wrap gap-6" aria-label="Enlaces del footer">
            <Link href="/security" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
              Seguridad
            </Link>
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
              Precios
            </Link>
            <Link href="/faq" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
              Contacto
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded">
              Iniciar sesión
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-sm text-slate-500">
          <p>informacion@negociosuniversales.ai · República Dominicana</p>
          <p className="mt-2 text-xs text-slate-600">
            Precios de referencia. Diseñado para auditoría SIB-friendly. No constituye certificación de cumplimiento regulatorio.
          </p>
        </div>
      </div>
    </footer>
  );
}
