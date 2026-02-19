'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/cases', label: 'Casos' },
  { href: '/cases/new', label: 'Nuevo Caso' },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md border border-[#D8E0EA] bg-white shadow-sm transition-colors duration-150 hover:bg-[#F1F4F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2"
        aria-label="Abrir menú"
      >
        <span aria-hidden>☰</span>
      </button>
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40',
          'w-64 bg-white border-r border-[#D8E0EA]',
          'transform transition-transform duration-[180ms] ease-out',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full pt-16 md:pt-5">
          <Link
            href="/dashboard"
            className="px-5 py-3 block"
            onClick={() => setOpen(false)}
          >
            <span className="font-semibold text-[#0B1220] text-base">
              Negocios Universales
            </span>
            <span className="block text-xs text-[#6B7280] mt-0.5">
              Valuation OS
            </span>
          </Link>
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 py-2.5 rounded-md font-medium transition-colors duration-150 border-l-[3px] pl-4 pr-3',
                    isActive
                      ? 'bg-[#1D4ED8]/8 text-[#1D4ED8] border-l-[#1D4ED8]'
                      : 'border-l-transparent text-[#4B5563] hover:bg-[#F1F4F8]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {open && (
          <div
            className="md:hidden fixed inset-0 bg-black/15 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}
      </aside>
    </>
  );
}
