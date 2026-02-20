import Link from 'next/link';

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: 'var(--nu-navy)' }}
    >
      <p
        className="text-2xl font-serif text-[var(--nu-gold)]"
        style={{ fontFamily: '"DM Serif Display", serif' }}
      >
        Negocios Universales
      </p>
      <p className="mt-1 text-xs text-[var(--nu-text-muted)] uppercase tracking-widest">
        Valuation OS
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-lg bg-[var(--nu-gold)] px-6 py-3 font-medium text-[var(--nu-navy)] hover:opacity-90"
      >
        Iniciar Sesión
      </Link>
    </div>
  );
}
