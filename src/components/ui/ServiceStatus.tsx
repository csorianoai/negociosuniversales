'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

interface HealthResponse {
  status?: string;
}

export function ServiceStatus() {
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = (await res.json()) as HealthResponse;
        if (data.status === 'ok') {
          setError(null);
          return;
        }
      }
      setError('Servicio no disponible');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    }
  }, []);

  useEffect(() => {
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [check]);

  if (!error) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400"
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">Modo Degradado</span>
      <span className="text-sm text-orange-300/90">{error}</span>
      <button
        type="button"
        onClick={check}
        className="ml-2 px-3 py-1 text-sm font-medium rounded bg-orange-500/20 hover:bg-orange-500/30 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
