/**
 * Billing utilities: types, type guards, and helpers.
 * NO lucide icons here.
 */

export type Vertical =
  | 'real_estate'
  | 'vehicles'
  | 'equipment'
  | 'hotel_equipment'
  | 'other';

export interface VerticalPricing {
  real_estate: number;
  vehicles: number;
  equipment: number;
  hotel_equipment: number;
  other: number;
}

export interface BillingPeriod {
  from: Date;
  to: Date;
  label: string;
}

export interface BillableCase {
  case_number: string;
  address: string;
  vertical: Vertical;
  verticalLabel: string;
  status: string;
  unitPriceDop: number;
  aiCostUsd: number;
  createdAt: string;
}

export interface BillingSummary {
  billableCases: BillableCase[];
  totalDop: number;
  totalAiCostUsd: number;
  byVertical: Record<Vertical, { count: number; totalDop: number }>;
}

export interface CaseLike {
  case_number: string;
  status: string;
  case_type: string;
  created_at: string;
  property_data: unknown;
  ai_cost_usd?: unknown;
  ai_confidence?: unknown;
}

export function isValidCase(obj: unknown): obj is CaseLike {
  if (obj === null || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  const cn = o.case_number;
  const st = o.status;
  const ct = o.case_type;
  const ca = o.created_at;
  const pd = o.property_data;
  if (typeof cn !== 'string' || cn.trim() === '') return false;
  if (typeof st !== 'string' || st.trim() === '') return false;
  if (typeof ct !== 'string' || ct.trim() === '') return false;
  if (typeof ca !== 'string' || ca.trim() === '') return false;
  if (pd !== null && (typeof pd !== 'object' || Array.isArray(pd))) return false;
  return true;
}

export const DEFAULT_PRICING: VerticalPricing = {
  real_estate: 6500,
  vehicles: 3500,
  equipment: 5500,
  hotel_equipment: 5000,
  other: 6000,
};

export const DEFAULT_BILLABLE_STATUSES = ['approved', 'delivered'];

export const VERTICAL_LABELS: Record<Vertical, string> = {
  real_estate: 'Inmobiliaria',
  vehicles: 'Vehículos',
  equipment: 'Equipos',
  hotel_equipment: 'Equip. Hotel',
  other: 'Otros',
};

export function mapCaseTypeToVertical(caseType: string): Vertical {
  const t = caseType.toLowerCase();
  if (
    t.includes('residential') ||
    t.includes('commercial') ||
    t.includes('land') ||
    t.includes('real_estate')
  ) {
    return 'real_estate';
  }
  if (
    t.includes('vehicle') ||
    t.includes('car') ||
    t.includes('moto') ||
    t.includes('motorcycle')
  ) {
    return 'vehicles';
  }
  if (
    t.includes('hotel') ||
    t.includes('hoteleria') ||
    t.includes('hotelería')
  ) {
    return 'hotel_equipment';
  }
  if (t.includes('machinery') || t.includes('equipment') || t.includes('assets')) {
    return 'equipment';
  }
  return 'other';
}

const PRICING_KEYS: (keyof VerticalPricing)[] = [
  'real_estate',
  'vehicles',
  'equipment',
  'hotel_equipment',
  'other',
];

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function getPricing(): VerticalPricing {
  if (typeof window === 'undefined') return DEFAULT_PRICING;
  try {
    const raw = localStorage.getItem('nu_pricing_v1');
    if (!raw) return DEFAULT_PRICING;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== 'object') return DEFAULT_PRICING;
    const p = parsed as Record<string, unknown>;
    const merged: VerticalPricing = { ...DEFAULT_PRICING };
    for (const k of PRICING_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(p, k)) continue;
      const val = p[k];
      if (isFiniteNumber(val)) merged[k] = val;
    }
    return merged;
  } catch {
    /* ignore */
  }
  return DEFAULT_PRICING;
}

export function savePricing(pricing: VerticalPricing): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('nu_pricing_v1', JSON.stringify(pricing));
  } catch {
    /* ignore */
  }
}

export function getDefaultPeriods(): BillingPeriod[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const mesActual: BillingPeriod = {
    from: firstOfMonth,
    to: today,
    label: 'Mes actual',
  };

  const firstOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastOfPrev = new Date(now.getFullYear(), now.getMonth(), 0);
  const mesAnterior: BillingPeriod = {
    from: firstOfPrev,
    to: lastOfPrev,
    label: 'Mes anterior',
  };

  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const ultimoTrimestre: BillingPeriod = {
    from: threeMonthsAgo,
    to: today,
    label: 'Último trimestre',
  };

  return [mesActual, mesAnterior, ultimoTrimestre];
}

export function filterByPeriod(
  cases: unknown[],
  period: BillingPeriod
): unknown[] {
  const fromTs = period.from.getTime();
  const toTs = period.to.getTime();
  return cases.filter((c) => {
    if (!isValidCase(c)) return false;
    const ts = Date.parse((c as CaseLike).created_at);
    if (Number.isNaN(ts)) return false;
    return ts >= fromTs && ts <= toTs;
  });
}

function safeAddress(propertyData: unknown): string {
  if (propertyData === null || typeof propertyData !== 'object') return '—';
  const pd = propertyData as Record<string, unknown>;
  const a = pd.address;
  if (typeof a === 'string') return a;
  if (a !== null && typeof a === 'object' && !Array.isArray(a)) {
    const full = (a as Record<string, unknown>).full;
    if (typeof full === 'string') return full;
  }
  return '—';
}

function normalizeAiCostUsd(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function calculateBilling(
  cases: unknown[],
  pricing: VerticalPricing,
  billableStatuses: string[] = DEFAULT_BILLABLE_STATUSES
): BillingSummary {
  const statusSet = new Set(billableStatuses.map((s) => s.toLowerCase()));
  const billableCases: BillableCase[] = [];
  let totalDop = 0;
  let totalAiCostUsd = 0;
  const byVertical: Record<Vertical, { count: number; totalDop: number }> = {
    real_estate: { count: 0, totalDop: 0 },
    vehicles: { count: 0, totalDop: 0 },
    equipment: { count: 0, totalDop: 0 },
    hotel_equipment: { count: 0, totalDop: 0 },
    other: { count: 0, totalDop: 0 },
  };

  for (const raw of cases) {
    if (!isValidCase(raw)) continue;
    const c = raw as CaseLike;
    const st = c.status.toLowerCase();
    if (!statusSet.has(st)) continue;

    const vertical = mapCaseTypeToVertical(c.case_type);
    const unitPrice = pricing[vertical];
    const address = safeAddress(c.property_data);
    const aiCostUsd = normalizeAiCostUsd(c.ai_cost_usd);

    billableCases.push({
      case_number: c.case_number,
      address,
      vertical,
      verticalLabel: VERTICAL_LABELS[vertical],
      status: c.status,
      unitPriceDop: unitPrice,
      aiCostUsd,
      createdAt: c.created_at,
    });

    totalDop += unitPrice;
    totalAiCostUsd += aiCostUsd;
    byVertical[vertical].count += 1;
    byVertical[vertical].totalDop += unitPrice;
  }

  billableCases.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    billableCases,
    totalDop,
    totalAiCostUsd,
    byVertical,
  };
}

function escapeCsvCell(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportBillingCsv(
  cases: BillableCase[],
  filename?: string
): void {
  const headers = [
    'Caso',
    'Dirección',
    'Vertical',
    'Status',
    'Precio DOP',
    'Costo AI USD',
    'Fecha',
  ];
  const rows = cases.map((c) => [
    escapeCsvCell(c.case_number),
    escapeCsvCell(c.address),
    escapeCsvCell(c.verticalLabel),
    escapeCsvCell(c.status),
    String(c.unitPriceDop),
    String(c.aiCostUsd.toFixed(2)),
    escapeCsvCell(c.createdAt),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `facturacion-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
