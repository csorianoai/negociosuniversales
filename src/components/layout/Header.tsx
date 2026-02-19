'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { cn } from '@/lib/cn';
import { DEMO_MODE } from '@/lib/demo-data';

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  cases: 'Casos',
  new: 'Nuevo',
};

function getBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let href = '';
  for (let i = 0; i < segments.length; i++) {
    href += '/' + segments[i];
    const seg = segments[i];
    const label =
      pathLabels[seg] ??
      (seg.length === 36 ? 'Detalle' : seg.charAt(0).toUpperCase() + seg.slice(1));
    crumbs.push({ href, label });
  }
  return crumbs;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string>('');

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

  const breadcrumbs = getBreadcrumbs(pathname);

  function getInitials(e: string): string {
    const parts = e.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return e.slice(0, 2).toUpperCase();
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-20 h-16 bg-white border-b border-[#D8E0EA]',
        'flex items-center justify-between px-6',
        'shadow-[0_1px_2px_rgba(11,18,32,0.04)]'
      )}
    >
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[#6B7280]" aria-hidden>
                ›
              </span>
            )}
            <Link
              href={crumb.href}
              className={cn(
                'font-medium transition-colors duration-150',
                i === breadcrumbs.length - 1
                  ? 'text-[#0B1220]'
                  : 'text-[#4B5563] hover:text-[#1D4ED8]'
              )}
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        {DEMO_MODE && (
          <span className="text-xs font-medium px-2 py-1 rounded bg-[#FEF3C7] text-[#92400E]">
            DEMO
          </span>
        )}
        <span
          className="text-sm text-[#4B5563] truncate max-w-[180px]"
          title={email || ''}
        >
          {email || (DEMO_MODE ? 'Usuario Demo' : 'Cargando...')}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-[#1D4ED8]/8 text-[#1D4ED8]"
          aria-hidden
        >
          {email ? getInitials(email) : '—'}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'px-3 py-1.5 text-sm font-medium text-[#4B5563]',
            'rounded-md transition-colors duration-150',
            'hover:bg-[#FEE2E2] hover:text-[#B91C1C]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2'
          )}
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
