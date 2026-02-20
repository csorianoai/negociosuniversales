/**
 * Demo data for landing. No backend. NO rentas/ventas/admin.
 */
import type { Vertical } from '@/lib/billing-utils';

export type Profile = 'banco' | 'cooperativa' | 'empresa' | 'broker';
export type Need = 'valuacion' | 'monitoreo' | 'auditoria' | 'costos';
export type Garantia = Vertical;

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  bullets: string[];
  badge: 'core' | 'enterprise' | 'roadmap';
  need?: Need;
  vertical?: Vertical | 'all';
}

export interface VerticalItem {
  id: string;
  label: string;
  desc: string;
  vertical: Vertical;
}

export interface IndustryItem {
  id: string;
  title: string;
  desc: string;
  problems: string[];
  howNu: string[];
}

export interface CaseStudyItem {
  id: string;
  name: string;
  metric: string;
  desc: string;
  industry?: string;
}

export interface InsightItem {
  id: string;
  title: string;
  category: string;
  desc: string;
}

export interface NewsItem {
  id: string;
  title: string;
  tag: string;
  date: string;
}

export interface StatItem {
  label: string;
  value: string;
  suffix?: string;
}

export const LANDING_DEMO = {
  services: [
    { id: 's1', title: 'Valuación de Garantías', desc: 'Pipeline asistido por IA: inmuebles, vehículos, equipos, hotel. En minutos, según complejidad.', bullets: ['Evidencia documentada', 'Comparables y ajustes', 'Informe con metodología'], badge: 'core' as const, need: 'valuacion' as Need },
    { id: 's2', title: 'Monitoreo de Cartera', desc: 'Alertas por zona, dispersión y casos estancados.', bullets: ['Re-tasación programada', 'SLA operativo'], badge: 'core' as const, need: 'monitoreo' as Need },
    { id: 's3', title: 'Auditoría Técnica', desc: 'Audit pack exportable. Trazabilidad HECHOS/SUPUESTOS/CÁLCULOS/OPINIÓN.', bullets: ['Audit pack', 'Checklist SIB-friendly'], badge: 'core' as const, need: 'auditoria' as Need },
    { id: 's4', title: 'Control de Costos AI', desc: 'Visibilidad y policy por tasación.', bullets: ['Costos por caso', 'Policy por complejidad'], badge: 'enterprise' as const, need: 'costos' as Need },
    { id: 's5', title: 'Radar de Riesgos', desc: 'Detección de inconsistencias documentales.', bullets: ['Análisis de documentos'], badge: 'roadmap' as const },
    { id: 's6', title: 'Integraciones', desc: 'Listo para integrar con core bancario y BPM.', bullets: ['APIs documentadas'], badge: 'roadmap' as const },
  ] as ServiceItem[],

  verticals: [
    { id: 'v1', label: 'Inmuebles', desc: 'Residencial, comercial, terreno.', vertical: 'real_estate' as Vertical },
    { id: 'v2', label: 'Vehículos', desc: 'Autos, motos, flotas.', vertical: 'vehicles' as Vertical },
    { id: 'v3', label: 'Equipos', desc: 'Maquinaria industrial.', vertical: 'equipment' as Vertical },
    { id: 'v4', label: 'Equipos Hoteleros', desc: 'FF&E, activos turísticos.', vertical: 'hotel_equipment' as Vertical },
    { id: 'v5', label: 'Otros', desc: 'Activos diversos.', vertical: 'other' as Vertical },
  ] as VerticalItem[],

  industries: [
    { id: 'i1', title: 'Banca Comercial', desc: 'Valuación de garantías para carteras.', problems: ['Tiempos largos', 'Inconsistencia metodológica'], howNu: ['Pipeline asistido', 'Trazabilidad'] },
    { id: 'i2', title: 'Hipotecario', desc: 'Inmuebles como garantía.', problems: ['Re-tasación programada'], howNu: ['Monitoreo de cartera'] },
    { id: 'i3', title: 'Leasing', desc: 'Activos para arrendamiento.', problems: ['Inventario FF&E'], howNu: ['Vertical equipos'] },
    { id: 'i4', title: 'Hospitalidad', desc: 'Equipamiento hotelero.', problems: ['Valuación especializada'], howNu: ['Vertical hotel'] },
  ] as IndustryItem[],

  caseStudies: [
    { id: 'c1', name: 'Banco Comercial (DEMO)', metric: 'Reducción significativa de tiempos', desc: 'Pipeline asistido por IA.', industry: 'banca' },
    { id: 'c2', name: 'Cooperativa (DEMO)', metric: 'Consistencia en metodología', desc: 'Audit pack para supervisión.', industry: 'cooperativa' },
    { id: 'c3', name: 'Financiera (DEMO)', metric: 'Mejor preparación de auditoría', desc: 'Trazabilidad completa.', industry: 'leasing' },
  ] as CaseStudyItem[],

  insights: [
    { id: 'i1', title: 'Boletín mercado RD (DEMO)', category: 'Mercado', desc: 'Tendencias y contexto.' },
    { id: 'i2', title: 'Riesgo por zona (DEMO)', category: 'Riesgo', desc: 'Análisis geográfico.' },
    { id: 'i3', title: 'Guía SIB-friendly (DEMO)', category: 'Cumplimiento', desc: 'Checklist orientativo.' },
  ] as InsightItem[],

  news: [
    { id: 'n1', title: 'Actualización pipeline Q1', tag: 'Producto', date: 'Mar 2026' },
    { id: 'n2', title: 'Nueva vertical equipos', tag: 'Producto', date: 'Feb 2026' },
    { id: 'n3', title: 'Audit pack v2', tag: 'Cumplimiento', date: 'Ene 2026' },
    { id: 'n4', title: 'Control costos IA', tag: 'Producto', date: 'Dic 2025' },
    { id: 'n5', title: 'Radar de riesgos', tag: 'Roadmap', date: 'Nov 2025' },
  ] as NewsItem[],

  stats: [
    { label: 'Casos procesados*', value: '12,000+', suffix: 'demo' },
    { label: 'Tiempo promedio*', value: 'En minutos', suffix: 'según complejidad' },
    { label: 'Cobertura*', value: '5', suffix: 'verticales' },
  ] as StatItem[],

  entregables: [
    'Informe de tasación',
    'Comparables y ajustes',
    'Checklist de auditoría',
    'Trazabilidad documentada',
  ],
};

export function getRecommendedService(need: Need): ServiceItem {
  const match = LANDING_DEMO.services.find((s) => s.need === need);
  return match ?? LANDING_DEMO.services[0];
}

export function getServicesForWizard(need: Need, garantia: Garantia): ServiceItem[] {
  const byNeed = LANDING_DEMO.services.filter((s) => !s.need || s.need === need);
  const main = getRecommendedService(need);
  const rest = byNeed.filter((s) => s.id !== main.id);
  return [main, ...rest].slice(0, 4);
}
