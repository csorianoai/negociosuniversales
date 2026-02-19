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
    status: 'delivered',
    property_type: 'residential',
    address: 'Av. Lincoln 101, Naco',
    city: 'Santo Domingo',
    sector: 'Naco',
    property_data: {},
    market_context: {},
    created_by: null,
    assigned_to: null,
    total_cost_usd: 0.47,
    created_at: past(3),
    updated_at: past(2),
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    tenant_id: 't1',
    status: 'report',
    property_type: 'commercial',
    address: 'Calle El Vergel 45',
    city: 'Santiago',
    sector: 'Centro',
    property_data: {},
    market_context: {},
    created_by: null,
    assigned_to: null,
    total_cost_usd: 0,
    created_at: past(1),
    updated_at: now,
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    tenant_id: 't1',
    status: 'draft',
    property_type: 'residential',
    address: 'Sector Los Prados',
    city: 'Santo Domingo',
    sector: 'Los Prados',
    property_data: {},
    market_context: {},
    created_by: null,
    assigned_to: null,
    total_cost_usd: 0,
    created_at: now,
    updated_at: now,
  },
];
