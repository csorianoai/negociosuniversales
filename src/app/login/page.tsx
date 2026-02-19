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
    <div className="min-h-screen flex items-start justify-center pt-20 px-4 bg-[#F6F8FB]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(11,18,32,0.06)] border border-[#D8E0EA] p-8">
          <h1 className="text-2xl font-bold text-[#1D4ED8] mb-6">
            Negocios Universales
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0B1220] mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#D8E0EA] rounded-md text-[#0B1220] placeholder:text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:border-[#1D4ED8] transition-colors duration-150"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0B1220] mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#D8E0EA] rounded-md text-[#0B1220] placeholder:text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:border-[#1D4ED8] transition-colors duration-150"
              />
            </div>
            {error && (
              <p className="text-sm text-[#B91C1C]" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 font-medium text-white rounded-md bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/35 focus-visible:ring-offset-2"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
