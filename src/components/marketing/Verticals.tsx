'use client';

import Link from 'next/link';
import { Building2, Car, Wrench, Hotel, Package } from 'lucide-react';
import { Section } from './Section';
import { VERTICAL_LABELS } from '@/lib/billing-utils';
import type { Vertical } from '@/lib/billing-utils';

const ICONS: Record<Vertical, typeof Building2> = {
  real_estate: Building2,
  vehicles: Car,
  equipment: Wrench,
  hotel_equipment: Hotel,
  other: Package,
};

const VERTICALS: Vertical[] = ['real_estate', 'vehicles', 'equipment', 'hotel_equipment', 'other'];

export function Verticals() {
  return (
    <Section title="Verticales" subtitle="Inmobiliaria, vehículos, equipos y más">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {VERTICALS.map((v) => {
          const Icon = ICONS[v];
          return (
            <div
              key={v}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--nu-gold)]/20 flex items-center justify-center text-[var(--nu-gold)]">
                <Icon className="w-6 h-6" />
              </div>
              <p className="mt-2 font-medium text-white text-sm">{VERTICAL_LABELS[v]}</p>
              <p className="text-xs text-slate-500 mt-0.5">desde</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-slate-500 text-center">
        <Link href="/pricing" className="text-[var(--nu-gold)] hover:underline">
          Ver precios →
        </Link>
      </p>
    </Section>
  );
}
