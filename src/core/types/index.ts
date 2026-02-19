/** @fileoverview Core domain types for Negocios Universales appraisal platform. */

export type CaseStatus =
  | 'draft'
  | 'intake'
  | 'research'
  | 'comparable'
  | 'report'
  | 'qa'
  | 'compliance'
  | 'review'
  | 'delivered'
  | 'archived';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'pro' | 'enterprise';
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  role: 'superadmin' | 'admin' | 'analyst' | 'appraiser' | 'viewer';
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  tenant_id: string;
  status: CaseStatus;
  property_type: 'residential' | 'commercial' | 'land' | 'vehicle' | 'mixed' | null;
  address: string | null;
  city: string | null;
  sector: string | null;
  property_data: Record<string, unknown>;
  market_context: Record<string, unknown>;
  created_by: string | null;
  assigned_to: string | null;
  total_cost_usd: number;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  tenant_id: string;
  file_path: string;
  file_name: string | null;
  file_hash: string;
  mime_type: string | null;
  file_size: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Comparable {
  id: string;
  case_id: string | null;
  tenant_id: string;
  address: string | null;
  city: string | null;
  sector: string | null;
  property_type: string | null;
  area_m2: number | null;
  value_usd: number | null;
  value_dop: number | null;
  adjustments: Record<string, unknown>;
  adjusted_value_usd: number | null;
  source: string | null;
  confidence: number | null;
  created_at: string;
}

export interface Report {
  id: string;
  case_id: string;
  tenant_id: string;
  pdf_path: string | null;
  report_data: Record<string, unknown>;
  report_markdown: string | null;
  vrs_score: number | null;
  estimated_value_usd: number | null;
  estimated_value_dop: number | null;
  version: number;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  tenant_id: string;
  case_id: string | null;
  user_id: string | null;
  action: string;
  agent_name: string | null;
  payload: Record<string, unknown>;
  prev_hash: string | null;
  current_hash: string | null;
  created_at: string;
}

export interface AICostEntry {
  id: string;
  tenant_id: string | null;
  case_id: string | null;
  agent_name: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  duration_ms: number | null;
  confidence: number | null;
  created_at: string;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  cost_usd: number;
  tokens_in: number;
  tokens_out: number;
  duration_ms: number;
  agent_name: string;
}

export interface PipelineResult {
  steps: AgentResult[];
  total_cost_usd: number;
  total_duration_ms: number;
  success: boolean;
  case_id: string;
}

export const AI_MODELS = {
  HAIKU: 'claude-haiku-4-5-20251001',
  SONNET: 'claude-sonnet-4-5-20250929',
} as const;

export const AI_COST_RATES = {
  [AI_MODELS.HAIKU]: { input_per_mtok: 1, output_per_mtok: 5 },
  [AI_MODELS.SONNET]: { input_per_mtok: 3, output_per_mtok: 15 },
} as const;
