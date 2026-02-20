import Link from 'next/link';
import { DEFAULT_PRICING, VERTICAL_LABELS } from '@/lib/billing-utils';
import type { Vertical } from '@/lib/billing-utils';
import { Section } from '@/components/marketing/Section';

const VERTICALS: Vertical[] = ['real_estate', 'vehicles', 'equipment', 'hotel_equipment', 'other'];

function formatPrice(n: number): string {
  return 'RD$' + n.toLocaleString('es-DO');
}

export default function PricingPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h1
          className="text-3xl md:text-4xl font-serif text-white"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          Precios
        </h1>
        <p className="mt-2 text-slate-400 text-lg">
          Tarifas de referencia por vertical
        </p>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Vertical
                </th>
                <th className="py-3 text-right text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Desde
                </th>
              </tr>
            </thead>
            <tbody>
              {VERTICALS.map((v) => (
                <tr key={v} className="border-b border-white/5">
                  <td className="py-4 text-white font-medium">{VERTICAL_LABELS[v]}</td>
                  <td className="py-4 text-right text-[var(--nu-gold)] font-semibold">
                    {formatPrice(DEFAULT_PRICING[v])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-sm text-slate-500">
          Precios de referencia. Pueden variar por volumen y acuerdo institucional.
        </p>
        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-flex px-6 py-3 rounded-lg bg-[var(--nu-gold)] text-slate-950 font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Solicitar demo
          </Link>
        </div>
      </div>
    </div>
  );
}
