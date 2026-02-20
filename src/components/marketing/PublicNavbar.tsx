'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/security', label: 'Seguridad' },
  { href: '/pricing', label: 'Precios' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contacto' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMobileOpen(false);
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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      )}
    >
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

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-slate-200 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold)] text-slate-950 hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Solicitar demo
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]"
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
          'md:hidden fixed inset-0 top-[57px] z-40 transition-opacity duration-300',
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar overlay"
        />
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-white/10 p-6 flex flex-col gap-4 slide-in">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-slate-200 hover:text-[var(--nu-gold)] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] rounded px-2 py-1"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-white/10 my-2" />
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-slate-200 hover:bg-white/5 text-center"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nu-gold)] text-slate-950 hover:opacity-90 text-center"
          >
            Solicitar demo
          </Link>
        </div>
      </div>
    </header>
  );
}
