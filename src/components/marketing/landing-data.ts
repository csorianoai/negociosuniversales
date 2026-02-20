/**
 * Demo data for landing page. No backend. Tags for filtering.
 */
import type { Vertical } from '@/lib/billing-utils';

export type Profile = 'banco' | 'cooperativa' | 'empresa' | 'broker';
export type Need = 'valuacion' | 'monitoreo' | 'auditoria' | 'cumplimiento';

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  bullets: string[];
  badge: 'core' | 'enterprise' | 'roadmap';
  tags: { profile?: Profile; need?: Need; vertical?: Vertical | 'all' }[];
}

export interface IndustryItem {
  id: string;
  title: string;
  desc: string;
  vertical: Vertical;
}

export interface CaseStudyItem {
  id: string;
  name: string;
  metric: string;
  desc: string;
  tags: { profile?: Profile; need?: Need; vertical?: Vertical | 'all' }[];
}

export interface InsightItem {
  id: string;
  title: string;
  category: string;
  topic?: string;
  tags: { need?: Need; vertical?: Vertical | 'all' }[];
  soon?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  tag: string;
  date: string;
  need?: Need;
}

export interface StatItem {
  label: string;
  value: string;
  suffix?: string;
  vertical?: Vertical;
}

export const LANDING_DEMO = {
  services: [
    {
      id: 's1',
      title: 'Valuación de Garantías',
      desc: 'Pipeline asistido por IA: inmuebles, vehículos, equipos, hotel. En minutos, según complejidad.',
      bullets: ['Evidencia documentada', 'Comparables y ajustes', 'Informe con metodología'],
      badge: 'core' as const,
      tags: [{ need: 'valuacion' }, { vertical: 'all' }],
    },
    {
      id: 's2',
      title: 'Monitoreo de Cartera',
      desc: 'Alertas por zona, dispersión y casos estancados. Re-tasación programada.',
      bullets: ['Alertas por vencimiento', 'Dispersión geográfica', 'SLA operativo'],
      badge: 'enterprise' as const,
      tags: [{ need: 'monitoreo' }],
    },
    {
      id: 's3',
      title: 'Auditoría y Trazabilidad',
      desc: 'Audit pack exportable para supervisión. HECHOS, SUPUESTOS, CÁLCULOS, OPINIÓN.',
      bullets: ['Audit pack', 'Trazabilidad completa', 'Exportable para regulatorio'],
      badge: 'core' as const,
      tags: [{ need: 'auditoria' }, { need: 'cumplimiento' }],
    },
    {
      id: 's4',
      title: 'Cumplimiento SIB-friendly',
      desc: 'Checklist guía para entornos regulados. Diseñado para auditoría.',
      bullets: ['Checklist asistido', 'Guía regulatoria', 'Sin certificación implícita'],
      badge: 'core' as const,
      tags: [{ need: 'cumplimiento' }],
    },
    {
      id: 's5',
      title: 'Radar de Fraude Documental',
      desc: 'Detección de inconsistencias documentales. Roadmap.',
      bullets: ['Análisis de documentos', 'Alertas de consistencia'],
      badge: 'roadmap' as const,
      tags: [{ need: 'auditoria' }],
    },
    {
      id: 's6',
      title: 'Riesgo por Zona y Dispersión',
      desc: 'Análisis geográfico de cartera. Roadmap.',
      bullets: ['Mapas de concentración', 'Alertas por zona'],
      badge: 'roadmap' as const,
      tags: [{ need: 'monitoreo' }],
    },
  ] as ServiceItem[],

  industries: [
    { id: 'i1', title: 'Banca Comercial', desc: 'Valuación de garantías para carteras comerciales e hipotecarias.', vertical: 'real_estate' as Vertical },
    { id: 'i2', title: 'Hipotecario', desc: 'Evaluación de inmuebles como garantía hipotecaria.', vertical: 'real_estate' as Vertical },
    { id: 'i3', title: 'Leasing', desc: 'Valuación de activos para arrendamiento financiero.', vertical: 'equipment' as Vertical },
    { id: 'i4', title: 'Hospitalidad', desc: 'Equipamiento hotelero y activos turísticos.', vertical: 'hotel_equipment' as Vertical },
  ] as IndustryItem[],

  caseStudies: [
    { id: 'c1', name: 'Banco Regional (DEMO)', metric: 'Reducción significativa de tiempos', desc: 'Pipeline asistido por IA.', tags: [{ profile: 'banco' }, { need: 'valuacion' }] },
    { id: 'c2', name: 'Cooperativa Nacional (DEMO)', metric: 'Consistencia en metodología', desc: 'Audit pack para supervisión.', tags: [{ profile: 'cooperativa' }, { need: 'auditoria' }] },
    { id: 'c3', name: 'Financiera (DEMO)', metric: 'Mejor preparación de auditoría', desc: 'Trazabilidad completa.', tags: [{ need: 'cumplimiento' }] },
    { id: 'c4', name: 'Banco Hipotecario (DEMO)', metric: 'Eficiencia en inmuebles', desc: 'Valuación inmobiliaria.', tags: [{ profile: 'banco' }, { vertical: 'real_estate' }] },
    { id: 'c5', name: 'Leasing Corp (DEMO)', metric: 'Inventario FF&E', desc: 'Equipos y activos.', tags: [{ profile: 'empresa' }, { vertical: 'equipment' }] },
    { id: 'c6', name: 'Hotel Group (DEMO)', metric: 'Valuación equipamiento', desc: 'Vertical hotelera.', tags: [{ vertical: 'hotel_equipment' }] },
  ] as CaseStudyItem[],

  insights: [
    { id: 'ins1', title: 'Boletín mercado RD (DEMO)', category: 'Mercado', topic: 'mercado_rd', tags: [{ need: 'valuacion' }], soon: true },
    { id: 'ins2', title: 'Riesgo por zona (DEMO)', category: 'Riesgo', topic: 'riesgo_zona', tags: [{ need: 'monitoreo' }], soon: true },
    { id: 'ins3', title: 'Tendencias garantías (DEMO)', category: 'Tendencias', topic: 'tendencias', tags: [], soon: true },
    { id: 'ins4', title: 'Guía SIB-friendly (DEMO)', category: 'Cumplimiento', topic: 'sib', tags: [{ need: 'cumplimiento' }], soon: true },
    { id: 'ins5', title: 'Audit pack v2 (DEMO)', category: 'Auditoría', topic: 'audit_pack', tags: [{ need: 'auditoria' }], soon: true },
    { id: 'ins6', title: 'SLA operativo (DEMO)', category: 'Operación', topic: 'sla', tags: [{ need: 'monitoreo' }], soon: true },
    { id: 'ins7', title: 'Control costos IA (DEMO)', category: 'Producto', topic: 'costos', tags: [], soon: true },
    { id: 'ins8', title: 'Vertical vehículos (DEMO)', category: 'Vertical', topic: 'vehiculos', tags: [{ vertical: 'vehicles' }], soon: true },
    { id: 'ins9', title: 'Vertical hotel (DEMO)', category: 'Vertical', topic: 'hotel', tags: [{ vertical: 'hotel_equipment' }], soon: true },
  ] as InsightItem[],

  news: [
    { id: 'n1', title: 'Actualización pipeline Q1', tag: 'Producto', date: 'Mar 2026', need: 'valuacion' as Need },
    { id: 'n2', title: 'Nueva vertical equipos', tag: 'Producto', date: 'Feb 2026' },
    { id: 'n3', title: 'Audit pack v2', tag: 'Cumplimiento', date: 'Ene 2026', need: 'auditoria' as Need },
    { id: 'n4', title: 'Guía SIB-friendly', tag: 'Regulación', date: 'Dic 2025', need: 'cumplimiento' as Need },
    { id: 'n5', title: 'Control de costos IA', tag: 'Producto', date: 'Nov 2025' },
    { id: 'n6', title: 'Monitoreo de cartera', tag: 'Producto', date: 'Oct 2025', need: 'monitoreo' as Need },
    { id: 'n7', title: 'Re-tasación programada', tag: 'Roadmap', date: 'Sep 2025' },
    { id: 'n8', title: 'Integración core bancario', tag: 'Roadmap', date: 'Ago 2025' },
  ] as NewsItem[],

  stats: [
    { label: 'Casos procesados*', value: '12,000+', suffix: '', vertical: undefined },
    { label: 'Tiempo promedio*', value: 'En minutos', suffix: 'según complejidad', vertical: undefined },
    { label: 'Consistencia*', value: 'Metodología', suffix: 'por vertical', vertical: 'vehicles' as Vertical },
    { label: 'Inventario FF&E*', value: 'Hotel', suffix: 'equipamiento', vertical: 'hotel_equipment' as Vertical },
  ] as StatItem[],
};

function matchesTag<T extends { tags: { profile?: Profile; need?: Need; vertical?: Vertical | 'all' }[] }>(
  item: T,
  profile: Profile,
  need: Need,
  vertical: Vertical
): boolean {
  for (const tagSet of item.tags) {
    const matchProfile = !tagSet.profile || tagSet.profile === profile;
    const matchNeed = !tagSet.need || tagSet.need === need;
    const matchVertical = !tagSet.vertical || tagSet.vertical === vertical || tagSet.vertical === 'all';
    if (matchProfile && matchNeed && matchVertical) return true;
  }
  return item.tags.length === 0;
}

export function filterServices(items: ServiceItem[], profile: Profile, need: Need, vertical: Vertical): ServiceItem[] {
  return items.filter((s) => matchesTag(s, profile, need, vertical));
}

export function filterCaseStudies(items: CaseStudyItem[], profile: Profile, need: Need, vertical: Vertical): CaseStudyItem[] {
  const filtered = items.filter((c) => matchesTag(c, profile, need, vertical));
  return filtered.length >= 3 ? filtered.slice(0, 3) : [...filtered, ...items.filter((c) => !filtered.includes(c))].slice(0, 3);
}

export function filterInsights(items: InsightItem[], profile: Profile, need: Need, vertical: Vertical): InsightItem[] {
  const filtered = items.filter((i) => matchesTag(i, profile, need, vertical));
  return filtered.length >= 3 ? filtered.slice(0, 3) : [...filtered, ...items].slice(0, 3);
}

export function filterNews(items: NewsItem[], _profile: Profile, need: Need, _vertical: Vertical): NewsItem[] {
  const byNeed = items.filter((n) => !n.need || n.need === need);
  return byNeed.length >= 5 ? byNeed.slice(0, 8) : items.slice(0, 8);
}

export function getPipelineCopy(need: Need, _vertical: Vertical): { title: string; bullets: string[] } {
  switch (need) {
    case 'valuacion':
      return { title: 'Pipeline de valuación', bullets: ['Comparables y ajustes', 'Informe con evidencia', 'Tiempo en minutos'] };
    case 'monitoreo':
      return { title: 'Monitoreo y alertas', bullets: ['Re-tasación programada', 'Alertas por zona y SLA', 'Control operativo'] };
    case 'auditoria':
    case 'cumplimiento':
      return { title: 'Trazabilidad y auditoría', bullets: ['Audit pack exportable', 'Checklist SIB-friendly', 'HECHOS/SUPUESTOS/CÁLCULOS/OPINIÓN'] };
    default:
      return { title: 'Pipeline de tasación', bullets: ['Recepción → Informe → QA → Compliance'] };
  }
}

export function getResultModules(need: Need): string[] {
  const base = ['Pipeline', 'Audit Pack'];
  if (need === 'monitoreo') return [...base, 'SLA', 'Alertas'];
  if (need === 'auditoria' || need === 'cumplimiento') return [...base, 'Checklist', 'Trazabilidad'];
  return [...base, 'Comparables', 'Cost Control'];
}
