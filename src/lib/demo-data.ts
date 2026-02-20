/**
 * Demo data for polish and fallback when API returns few cases.
 * FRONTEND ONLY. Uses case-utils (no backend).
 */
import {
  type CaseLike,
  isRecord,
  parseValidDate,
} from '@/lib/case-utils';

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export interface DemoComparable {
  source: string;
  address: string;
  price: number;
  price_per_sqm?: number;
  date_sold?: string;
  similarity_score?: number;
  adjustments?: Record<string, string>;
}

export interface DemoEvidence {
  file_type: string;
  file_path: string;
  metadata: { label: string; date?: string; size?: number };
  created_at?: string;
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function clamp01(n: number): number {
  if (Number.isFinite(n)) {
    if (n < 0) return 0;
    if (n > 1) return 1;
    return n;
  }
  return 0;
}

function safeNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

type CaseLikeWithId = CaseLike & { id: string; tenant_id?: string };

const genId = (i: number) =>
  `a1b2c3d4-${String(i).padStart(4, '0')}-4000-8000-00000000000${String(i).padStart(2, '0')}`;

export const DEMO_CASES: CaseLikeWithId[] = [
  {
    id: genId(1),
    case_number: 'NU-2026-101',
    status: 'delivered',
    case_type: 'real_estate_residential',
    created_at: daysAgoIso(5),
    updated_at: daysAgoIso(2),
    property_data: {
      address: 'Av. Lincoln 101, Naco',
      city: 'Santo Domingo',
      sector: 'Naco',
      property_type: 'residential',
      sqm: 185,
      valuation_point: 285000,
      valuation_min: 270000,
      valuation_max: 300000,
    },
    ai_confidence: 0.92,
    ai_cost_usd: 0.47,
  },
  {
    id: genId(2),
    case_number: 'NU-2026-102',
    status: 'report_completed',
    case_type: 'real_estate_residential',
    created_at: daysAgoIso(3),
    updated_at: daysAgoIso(1),
    property_data: {
      address: 'Calle El Vergel 45',
      city: 'Santiago',
      sector: 'Centro',
      property_type: 'residential',
      sqm: 120,
      valuation_point: 145000,
    },
    ai_confidence: 0.88,
    ai_cost_usd: 0.42,
  },
  {
    id: genId(3),
    case_number: 'NU-2026-103',
    status: 'pending_intake',
    case_type: 'real_estate',
    created_at: daysAgoIso(0),
    updated_at: daysAgoIso(0),
    property_data: {
      address: 'Sector Los Prados',
      city: 'Santo Domingo',
      sector: 'Los Prados',
    },
    ai_confidence: null,
    ai_cost_usd: 0,
  },
  {
    id: genId(4),
    case_number: 'NU-2026-104',
    status: 'comparable_completed',
    case_type: 'real_estate_commercial',
    created_at: daysAgoIso(4),
    updated_at: daysAgoIso(3),
    property_data: {
      address: 'Av. Sarasota 78',
      city: 'Santo Domingo',
      sector: 'Piantini',
      property_type: 'commercial',
      sqm: 320,
      valuation_point: 520000,
    },
    ai_confidence: 0.85,
    ai_cost_usd: 0.38,
  },
  {
    id: genId(5),
    case_number: 'NU-2026-105',
    status: 'delivered',
    case_type: 'vehicles',
    created_at: daysAgoIso(8),
    updated_at: daysAgoIso(6),
    property_data: {
      address: 'Toyota Hilux 2022',
      city: 'Santo Domingo',
      sector: 'N/A',
      valuation_point: 18500,
    },
    ai_confidence: 0.9,
    ai_cost_usd: 0.22,
  },
  {
    id: genId(6),
    case_number: 'NU-2026-106',
    status: 'qa_passed',
    case_type: 'equipment',
    created_at: daysAgoIso(6),
    updated_at: daysAgoIso(4),
    property_data: {
      address: 'Maquinaria Industrial',
      city: 'Santiago',
      sector: 'Zona Franca',
      valuation_point: 45000,
    },
    ai_confidence: 0.87,
    ai_cost_usd: 0.35,
  },
  {
    id: genId(7),
    case_number: 'NU-2026-107',
    status: 'research_processing',
    case_type: 'real_estate_land',
    created_at: daysAgoIso(2),
    updated_at: daysAgoIso(1),
    property_data: {
      address: 'Terreno La Romana',
      city: 'La Romana',
      sector: 'Casa de Campo',
      property_type: 'land',
      sqm: 500,
    },
    ai_confidence: null,
    ai_cost_usd: 0.18,
  },
  {
    id: genId(8),
    case_number: 'NU-2026-108',
    status: 'qa_failed',
    case_type: 'real_estate_residential',
    created_at: daysAgoIso(7),
    updated_at: daysAgoIso(5),
    property_data: {
      address: 'Calle Las Américas 12',
      city: 'Santiago',
      sector: 'Ensanche Libertad',
      property_type: 'residential',
      sqm: 95,
      valuation_point: 98000,
    },
    ai_confidence: 0.72,
    ai_cost_usd: 0.41,
  },
  {
    id: genId(9),
    case_number: 'NU-2026-109',
    status: 'delivered',
    case_type: 'hotel_equipment',
    created_at: daysAgoIso(10),
    updated_at: daysAgoIso(8),
    property_data: {
      address: 'Equipos Hotel Barceló',
      city: 'Punta Cana',
      sector: 'Bávaro',
      valuation_point: 125000,
    },
    ai_confidence: 0.91,
    ai_cost_usd: 0.52,
  },
  {
    id: genId(10),
    case_number: 'NU-2026-110',
    status: 'pending_intake',
    case_type: 'real_estate',
    created_at: daysAgoIso(0),
    updated_at: daysAgoIso(0),
    property_data: {
      address: 'Apto. Torre Empresarial',
      city: 'Santo Domingo',
      sector: 'Naco',
    },
    ai_confidence: null,
    ai_cost_usd: 0,
  },
  {
    id: genId(11),
    case_number: 'NU-2026-111',
    status: 'compliance_passed',
    case_type: 'other',
    created_at: daysAgoIso(9),
    updated_at: daysAgoIso(7),
    property_data: {
      address: 'Activo Diverso',
      city: 'Santo Domingo',
      sector: 'N/A',
      valuation_point: 22000,
    },
    ai_confidence: 0.84,
    ai_cost_usd: 0.29,
  },
  {
    id: genId(12),
    case_number: 'NU-2026-112',
    status: 'intake_completed',
    case_type: 'vehicles',
    created_at: daysAgoIso(1),
    updated_at: daysAgoIso(1),
    property_data: {
      address: 'Honda CR-V 2021',
      city: 'Santiago',
      sector: 'N/A',
    },
    ai_confidence: null,
    ai_cost_usd: 0.008,
  },
];

export const DEMO_COMPARABLES: Record<string, DemoComparable[]> = {
  'NU-2026-101': [
    { source: 'Demo MLS', address: 'Naco, Av. Lincoln 95', price: 278000, price_per_sqm: 1502, date_sold: '2025-11-15', similarity_score: 0.94, adjustments: { 'Área': '+3%' } },
    { source: 'Demo MLS', address: 'Naco, Calle Lope de Vega 22', price: 292000, price_per_sqm: 1589, date_sold: '2025-10-20', similarity_score: 0.91, adjustments: { 'Ubicación': '-2%' } },
    { source: 'Demo MLS', address: 'Piantini, Av. Sarasota 45', price: 310000, price_per_sqm: 1650, date_sold: '2025-09-10', similarity_score: 0.88, adjustments: { 'Área': '-5%', 'Estado': '+1%' } },
    { source: 'Demo MLS', address: 'Naco, Av. Abraham Lincoln 88', price: 265000, price_per_sqm: 1450, date_sold: '2025-12-01', similarity_score: 0.92 },
  ],
  'NU-2026-102': [
    { source: 'Demo Registro', address: 'Santiago Centro', price: 138000, similarity_score: 0.89 },
    { source: 'Demo Registro', address: 'Ensanche Libertad', price: 152000, similarity_score: 0.86 },
  ],
  'NU-2026-104': [
    { source: 'Demo Commercial', address: 'Piantini Oficina', price: 500000, similarity_score: 0.9 },
    { source: 'Demo Commercial', address: 'Naco Local', price: 535000, similarity_score: 0.87 },
  ],
  'NU-2026-108': [
    { source: 'Demo MLS', address: 'Santiago Comparable', price: 95000, similarity_score: 0.78, adjustments: { 'Estado': '-8%' } },
  ],
};

export const DEMO_EVIDENCE: Record<string, DemoEvidence[]> = {
  'NU-2026-101': [
    { file_type: 'pdf', file_path: 'virtual/escritura-nu-2026-101.pdf', metadata: { label: 'Escritura de propiedad' }, created_at: daysAgoIso(5) },
    { file_type: 'pdf', file_path: 'virtual/plano-nu-2026-101.pdf', metadata: { label: 'Plano catastral' }, created_at: daysAgoIso(5) },
    { file_type: 'image', file_path: 'virtual/foto-fachada-101.jpg', metadata: { label: 'Foto fachada' }, created_at: daysAgoIso(5) },
    { file_type: 'image', file_path: 'virtual/foto-interior-101.jpg', metadata: { label: 'Foto interior' }, created_at: daysAgoIso(5) },
    { file_type: 'pdf', file_path: 'virtual/avaluo-previo-101.pdf', metadata: { label: 'Avalúo previo' }, created_at: daysAgoIso(4) },
  ],
  'NU-2026-102': [
    { file_type: 'pdf', file_path: 'virtual/escritura-102.pdf', metadata: { label: 'Escritura' } },
    { file_type: 'image', file_path: 'virtual/fotos-102.jpg', metadata: { label: 'Fotos de la propiedad' } },
  ],
  'NU-2026-108': [
    { file_type: 'pdf', file_path: 'virtual/escritura-108.pdf', metadata: { label: 'Escritura' } },
    { file_type: 'pdf', file_path: 'virtual/plano-108.pdf', metadata: { label: 'Plano' } },
  ],
  'NU-2026-110': [
    { file_type: 'pdf', file_path: 'virtual/solicitud-110.pdf', metadata: { label: 'Solicitud de tasación' } },
  ],
};

export function getDemoCases(): CaseLike[] {
  return [...DEMO_CASES];
}

export function getDemoComparables(caseNumber: string): DemoComparable[] {
  return DEMO_COMPARABLES[caseNumber] ?? [];
}

export function getDemoEvidence(caseNumber: string): DemoEvidence[] {
  return DEMO_EVIDENCE[caseNumber] ?? [];
}

function getId(c: Record<string, unknown>): string | null {
  const v = c.id;
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function getCaseNumber(c: Record<string, unknown>): string | null {
  const v = c.case_number;
  return typeof v === 'string' && v.length > 0 ? v : null;
}

export function mergeWithDemoData(
  realCases: CaseLike[],
  minCases = 12
): { merged: CaseLike[]; usedDemo: boolean } {
  if (realCases.length >= minCases) {
    return { merged: realCases, usedDemo: false };
  }

  const seenByNumber = new Set<string>();
  const seenById = new Set<string>();
  const merged: CaseLike[] = [];

  for (const c of realCases) {
    const rec = isRecord(c) ? c : null;
    if (!rec) continue;
    const num = getCaseNumber(rec);
    if (num) seenByNumber.add(num);
    const id = getId(rec);
    if (id) seenById.add(id);
    merged.push(c);
  }

  let usedDemo = false;
  for (const dc of DEMO_CASES) {
    if (merged.length >= minCases) break;
    const rec = isRecord(dc) ? dc : null;
    if (!rec) continue;
    const num = getCaseNumber(rec);
    const id = getId(rec);
    if (num && seenByNumber.has(num)) continue;
    if (id && seenById.has(id)) continue;
    seenByNumber.add(num ?? '');
    if (id) seenById.add(id);
    merged.push(dc);
    usedDemo = true;
  }

  merged.sort((a, b) => {
    const da = parseValidDate(a.created_at)?.getTime() ?? 0;
    const db = parseValidDate(b.created_at)?.getTime() ?? 0;
    return db - da;
  });

  return { merged, usedDemo };
}

export function enrichCaseDetailWithDemo(input: {
  caseData: Record<string, unknown>;
  comparables: unknown[];
  evidence: unknown[];
}): { comparables: unknown[]; evidence: unknown[]; usedDemo: boolean } {
  const { caseData, comparables, evidence } = input;
  let usedDemo = false;

  const caseNumber = getCaseNumber(caseData);
  if (!caseNumber) return { comparables, evidence, usedDemo: false };

  let outComparables = comparables;
  if (comparables.length === 0) {
    const demo = getDemoComparables(caseNumber);
    if (demo.length > 0) {
      outComparables = demo.map((d) => ({
        id: `demo-comp-${caseNumber}-${d.address.slice(0, 8)}`,
        source: d.source,
        address: d.address,
        price: d.price,
        price_per_sqm: d.price_per_sqm,
        date_sold: d.date_sold,
        similarity_score: d.similarity_score,
        adjustments: d.adjustments ?? {},
      }));
      usedDemo = true;
    }
  }

  let outEvidence = evidence;
  if (evidence.length === 0) {
    const demo = getDemoEvidence(caseNumber);
    if (demo.length > 0) {
      outEvidence = demo.map((d, i) => ({
        id: `demo-evid-${caseNumber}-${i}`,
        file_path: d.file_path,
        file_hash: `demo${i}`,
        file_type: d.file_type,
        metadata: d.metadata,
        created_at: d.created_at ?? new Date().toISOString(),
      }));
      usedDemo = true;
    }
  }

  return { comparables: outComparables, evidence: outEvidence, usedDemo };
}

// Backward compatibility: demoCases for existing consumers
export const demoCases: CaseLikeWithId[] = DEMO_CASES;
