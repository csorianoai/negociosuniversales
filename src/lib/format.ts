/**
 * Formatters for Dominican Republic locale.
 * Uses Intl with es-DO and America/Santo_Domingo TZ.
 */

const localeDO = 'es-DO';
const tz = 'America/Santo_Domingo';

export function formatDOP(value: number): string {
  return new Intl.NumberFormat(localeDO, {
    style: 'currency',
    currency: 'DOP',
  }).format(value);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat(localeDO, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatPct(value: number, decimals = 1): string {
  return new Intl.NumberFormat(localeDO, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDateDO(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(localeDO, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: tz,
    });
  } catch {
    return '—';
  }
}

export function formatRelativeDO(iso: string, base = new Date()): string {
  try {
    const d = new Date(iso);
    const diff = base.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semana(s)`;
    return formatDateDO(iso);
  } catch {
    return '—';
  }
}
