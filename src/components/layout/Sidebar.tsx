'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Receipt,
  DollarSign,
  BarChart3,
  Settings2,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const principalItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cases', label: 'Casos', icon: FolderOpen },
  { href: '/cases/new', label: 'Nuevo Caso', icon: PlusCircle },
];

const gerenciaItems: NavItem[] = [
  { href: '/billing', label: 'Facturación', icon: Receipt },
  { href: '/costs', label: 'Costos AI', icon: DollarSign },
  { href: '/metrics', label: 'Métricas', icon: BarChart3 },
];

const adminItems: NavItem[] = [
  { href: '/costs', label: 'Costos AI', icon: DollarSign },
  { href: '/settings', label: 'Configuración', icon: Settings2 },
  { href: '/audit', label: 'Auditoría', icon: Shield },
];

function getInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const [casesCount, setCasesCount] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [tenantName, setTenantName] = useState<string>('Tu organización');
  const [adminOpen, setAdminOpen] = useState(false);

  const isAdminRoute =
    pathname.startsWith('/settings') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/costs');

  useEffect(() => {
    if (isAdminRoute) setAdminOpen(true);
  }, [isAdminRoute]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? '');
    });
  }, []);

  useEffect(() => {
    fetch('/api/cases')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCasesCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, [pathname]);

  const itemsWithBadge = principalItems.map((item) =>
    item.href === '/cases' ? { ...item, badge: casesCount } : item
  );

  function NavSection({
    title,
    items,
  }: {
    title: string;
    items: NavItem[];
  }) {
    return (
      <div className="mt-6">
        <p className="px-4 mb-2 text-xs uppercase tracking-widest text-[var(--nu-text-muted)]">
          {title}
        </p>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 py-2.5 px-4 rounded-r-md font-medium transition-colors border-l-[3px] border-l-transparent',
                  isActive
                    ? 'bg-[var(--nu-gold-dim)] border-l-[var(--nu-gold)] text-[var(--nu-gold)]'
                    : 'text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--nu-gold-dim)] text-[var(--nu-gold)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-30 w-64 h-screen bg-[var(--nu-navy-light)] border-r border-[var(--nu-border)] overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-7 pb-4 border-b border-[var(--nu-border)] shrink-0">
          <p
            className="text-lg font-serif text-[var(--nu-gold)]"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Negocios Universales
          </p>
          <p className="mt-0.5 text-xs text-[var(--nu-text-muted)] uppercase tracking-widest">
            Valuation OS
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full bg-[var(--nu-emerald)] nu-pulse"
              aria-hidden
            />
            <span className="text-xs text-[var(--nu-emerald)]">Sistema operativo</span>
          </div>
        </div>

        <div className="flex-1 py-4">
          <NavSection title="Principal" items={itemsWithBadge} />
          <NavSection title="Gerencia" items={gerenciaItems} />
          <div className="mt-6">
            <p className="px-4 mb-2 text-xs uppercase tracking-widest text-[var(--nu-text-muted)]">
              Administración
            </p>
            <div className="space-y-0.5">
              <div>
                <button
                  type="button"
                  onClick={() => setAdminOpen((o) => !o)}
                  aria-expanded={adminOpen}
                  className={cn(
                    'w-full flex items-center gap-3 py-2.5 px-4 rounded-r-md font-medium transition-colors border-l-[3px] border-l-transparent text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nu-navy)]',
                    isAdminRoute
                      ? 'bg-[var(--nu-gold-dim)] border-l-[var(--nu-gold)] text-[var(--nu-gold)]'
                      : 'text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]'
                  )}
                >
                  <Settings2 className="w-5 h-5 shrink-0" />
                  <span className="flex-1">Administración</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 shrink-0 transition-transform',
                      adminOpen && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-200"
                  style={{ gridTemplateRows: adminOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <nav className="space-y-0.5 pl-10 pr-4 pb-2">
                      {adminItems.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/dashboard' &&
                            pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 py-2 px-3 rounded-md font-medium transition-colors border-l-[3px] border-l-transparent',
                              isActive
                                ? 'bg-[var(--nu-gold-dim)] border-l-[var(--nu-gold)] text-[var(--nu-gold)]'
                                : 'text-[var(--nu-text-secondary)] hover:bg-[var(--nu-card-hover)] hover:text-[var(--nu-text)]'
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--nu-border)] p-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-[var(--nu-gold)] to-amber-600 text-[var(--nu-navy)] shrink-0"
              aria-hidden
            >
              {email ? getInitials(email) : '—'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--nu-text)] truncate">
                {email || 'Usuario'}
              </p>
              <p className="text-xs text-[var(--nu-text-muted)] truncate">
                {tenantName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
