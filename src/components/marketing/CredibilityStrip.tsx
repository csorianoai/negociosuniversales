'use client';

const DEMO_NAMES = ['Banco Caribe (Demo)', 'Banco Confisa (Demo)', 'Banco Fihogar (Demo)'];

export function CredibilityStrip() {
  return (
    <section className="py-8 border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-6">
        <span className="text-sm font-medium text-slate-400">Diseñado para banca</span>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {DEMO_NAMES.map((name, i) => (
            <span key={i} className="text-sm text-slate-500 font-medium">
              {name}
            </span>
          ))}
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          DEMO
        </span>
      </div>
    </section>
  );
}
