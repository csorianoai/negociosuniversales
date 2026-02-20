'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const SERVICIOS_ITEMS = [
  { href: '#servicios', label: 'Valoración' },
  { href: '#servicios', label: 'Monitoreo' },
  { href: '#servicios', label: 'Auditoría' },
];

const INDUSTRIAS_ITEMS = [
  { href: '#industrias', label: 'Banca Comercial' },
  { href: '#industrias', label: 'Hipotecario' },
  { href: '#industrias', label: 'Leasing' },
  { href: '#industrias', label: 'Hospitalidad' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [industriasOpen, setIndustriasOpen] = useState(false);
  const [mobileServicios, setMobileServicios] = useState(false);
  const [mobileIndustrias, setMobileIndustrias] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMobileOpen(false);
      setServiciosOpen(false);
      setIndustriasOpen(false);
    }
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, handleEsc]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--nu-gold)] focus:text-slate-950 focus:font-medium"
      >
        Saltar al contenido
      </a>
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"
        aria-label="Navegación principal"
      >
        <Link
          href="/"
          className="text-xl font-serif text-[var(--nu-gold)] hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          Negocios Universales
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => setServiciosOpen(true)}
            onMouseLeave={() => setServiciosOpen(false)}
          >
            <button
              type="button"
              onClick={() => scrollTo('servicios')}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
              aria-expanded={serviciosOpen}
              aria-haspopup="true"
              aria-label="Servicios"
            >
              Servicios
              <ChevronDown className={cn('w-4 h-4 transition-transform', serviciosOpen && 'rotate-180')} />
            </button>
            {serviciosOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur py-2 shadow-xl">
                {SERVICIOS_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => scrollTo('servicios')}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-inset rounded mx-1"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => setIndustriasOpen(true)}
            onMouseLeave={() => setIndustriasOpen(false)}
          >
            <button
              type="button"
              onClick={() => scrollTo('industrias')}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
              aria-expanded={industriasOpen}
              aria-haspopup="true"
              aria-label="Industrias"
            >
              Industrias
              <ChevronDown className={cn('w-4 h-4 transition-transform', industriasOpen && 'rotate-180')} />
            </button>
            {industriasOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur py-2 shadow-xl">
                {INDUSTRIAS_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => scrollTo('industrias')}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-inset rounded mx-1"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => scrollTo('plataforma')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          >
            Plataforma
          </button>
          <button
            type="button"
            onClick={() => scrollTo('insights')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          >
            Insights
          </button>
          <button
            type="button"
            onClick={() => scrollTo('nosotros')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          >
            Nosotros
          </button>
          <button
            type="button"
            onClick={() => scrollTo('contacto')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          >
            Contacto
          </button>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-slate-200 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Ver Plataforma
          </Link>
          <button
            type="button"
            onClick={() => scrollTo('contacto')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold)] text-slate-950 hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Solicitar Demo
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          'lg:hidden fixed inset-0 top-[57px] z-40 transition-opacity duration-300',
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar overlay"
        />
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-white/10 p-6 flex flex-col gap-2 overflow-y-auto">
          <button
            type="button"
            onClick={() => setMobileServicios((o) => !o)}
            className="flex items-center justify-between px-4 py-2 text-left text-slate-200 font-medium rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
            aria-expanded={mobileServicios}
          >
            Servicios
            <ChevronDown className={cn('w-4 h-4 transition-transform', mobileServicios && 'rotate-180')} />
          </button>
          {mobileServicios && (
            <div className="pl-4 space-y-1">
              {SERVICIOS_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollTo('servicios')}
                  className="block w-full px-2 py-1 text-sm text-slate-400 hover:text-white text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileIndustrias((o) => !o)}
            className="flex items-center justify-between px-4 py-2 text-left text-slate-200 font-medium rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
            aria-expanded={mobileIndustrias}
          >
            Industrias
            <ChevronDown className={cn('w-4 h-4 transition-transform', mobileIndustrias && 'rotate-180')} />
          </button>
          {mobileIndustrias && (
            <div className="pl-4 space-y-1">
              {INDUSTRIAS_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollTo('industrias')}
                  className="block w-full px-2 py-1 text-sm text-slate-400 hover:text-white text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => scrollTo('plataforma')}
            className="px-4 py-2 text-left text-slate-200 hover:text-[var(--nu-gold)] font-medium"
          >
            Plataforma
          </button>
          <button
            type="button"
            onClick={() => scrollTo('insights')}
            className="px-4 py-2 text-left text-slate-200 hover:text-[var(--nu-gold)] font-medium"
          >
            Insights
          </button>
          <button
            type="button"
            onClick={() => scrollTo('nosotros')}
            className="px-4 py-2 text-left text-slate-200 hover:text-[var(--nu-gold)] font-medium"
          >
            Nosotros
          </button>
          <button
            type="button"
            onClick={() => scrollTo('contacto')}
            className="px-4 py-2 text-left text-slate-200 hover:text-[var(--nu-gold)] font-medium"
          >
            Contacto
          </button>
          <hr className="border-white/10 my-2" />
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-slate-200 hover:bg-white/5 text-center block"
          >
            Ver Plataforma
          </Link>
          <button
            type="button"
            onClick={() => scrollTo('contacto')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold)] text-slate-950 hover:opacity-90 text-center w-full"
          >
            Solicitar Demo
          </button>
        </div>
      </div>
    </header>
  );
}
