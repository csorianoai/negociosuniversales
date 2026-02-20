/**
 * Demo data for DEMO_MODE when API is unavailable.
 * FRONTEND ONLY — visible when NEXT_PUBLIC_DEMO_MODE === 'true'.
 */
import type { Case } from '@/core/types';

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const now = new Date().toISOString();
const past = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const demoCases: Case[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    tenant_id: 't1',
    case_number: 'NU-2025-101',
    status: 'delivered',
    case_type: 'real_estate',
    property_data: { address: 'Av. Lincoln 101, Naco', city: 'Santo Domingo', sector: 'Naco' },
    assigned_appraiser: null,
    ai_confidence: null,
    ai_cost_usd: 0.47,
    created_by: null,
    created_at: past(3),
    updated_at: past(2),
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    tenant_id: 't1',
    case_number: 'NU-2025-102',
    status: 'report_completed',
    case_type: 'real_estate',
    property_data: { address: 'Calle El Vergel 45', city: 'Santiago', sector: 'Centro' },
    assigned_appraiser: null,
    ai_confidence: null,
    ai_cost_usd: 0,
    created_by: null,
    created_at: past(1),
    updated_at: now,
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    tenant_id: 't1',
    case_number: 'NU-2025-103',
    status: 'pending_intake',
    case_type: 'real_estate',
    property_data: { address: 'Sector Los Prados', city: 'Santo Domingo', sector: 'Los Prados' },
    assigned_appraiser: null,
    ai_confidence: null,
    ai_cost_usd: 0,
    created_by: null,
    created_at: now,
    updated_at: now,
  },
];
