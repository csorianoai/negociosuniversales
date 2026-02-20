'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error al conectar. Intente de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--nu-navy)' }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl border border-[var(--nu-border)] p-8 shadow-2xl"
          style={{ background: 'var(--nu-navy-light)' }}
        >
          <p
            className="text-2xl font-serif text-[var(--nu-gold)] mb-1"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            Negocios Universales
          </p>
          <p className="text-xs text-[var(--nu-text-muted)] uppercase tracking-widest mb-8">
            Valuation OS
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--nu-text-secondary)] mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@empresa.com"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--nu-border)] bg-[var(--nu-navy)] text-[var(--nu-text)] placeholder:text-[var(--nu-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)]/50 focus:border-[var(--nu-gold)] transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--nu-text-secondary)] mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--nu-border)] bg-[var(--nu-navy)] text-[var(--nu-text)] placeholder:text-[var(--nu-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--nu-gold)]/50 focus:border-[var(--nu-gold)] transition-colors"
              />
            </div>
            {error && (
              <p className="text-sm text-[var(--nu-red)]" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 font-semibold rounded-lg bg-gradient-to-r from-[var(--nu-gold)] to-amber-600 text-[var(--nu-navy)] hover:shadow-lg hover:shadow-[var(--nu-gold)]/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nu-gold)]/50"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
