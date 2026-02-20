'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { cn } from '@/lib/cn';
import { DEMO_MODE } from '@/lib/demo-data';

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  cases: 'Casos',
  new: 'Nuevo Caso',
  billing: 'Facturación',
  metrics: 'Métricas & Analytics',
};

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  const last = segments[segments.length - 1];
  if (pathLabels[last]) return pathLabels[last];
  if (last.length === 36) return 'Detalle del Caso';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function formatHeaderDate(): string {
  const d = new Date();
  const day = d.getDate();
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${day} ${month} ${year} · ${time}`;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    setDateStr(formatHeaderDate());
    const t = setInterval(() => setDateStr(formatHeaderDate()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? '');
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between px-8 py-4',
        'bg-[var(--nu-navy)]/80 backdrop-blur-[20px] border-b border-[var(--nu-border)]'
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h1
          className="text-xl font-serif text-[var(--nu-text)]"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          {pageTitle}
        </h1>
        <p className="text-sm text-[var(--nu-text-muted)]">{dateStr}</p>
      </div>
      <div className="flex items-center gap-4">
        {DEMO_MODE && (
          <span className="text-xs font-medium px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            DEMO
          </span>
        )}
        <span
          className="text-sm text-[var(--nu-text-secondary)] truncate max-w-[200px]"
          title={email || ''}
        >
          {email || (DEMO_MODE ? 'Usuario Demo' : 'Cargando...')}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium',
            'text-[var(--nu-text-muted)] hover:text-[var(--nu-text)]',
            'rounded-lg transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]'
          )}
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
