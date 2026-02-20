/** @fileoverview Core domain types for Negocios Universales appraisal platform. */

export type KnownCaseStatus =
  | 'pending_intake'
  | 'intake_processing'
  | 'intake_completed'
  | 'research_processing'
  | 'research_completed'
  | 'comparable_processing'
  | 'comparable_completed'
  | 'report_processing'
  | 'report_completed'
  | 'qa_processing'
  | 'qa_passed'
  | 'qa_failed'
  | 'compliance_processing'
  | 'compliance_passed'
  | 'compliance_failed'
  | 'human_review'
  | 'approved'
  | 'delivered'
  | 'cancelled';

export type CaseStatus = KnownCaseStatus | (string & {});

export interface Tenant {
  id: string;
  name: string;
  rnc: string | null;
  plan: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  role_id: string;
  full_name: string | null;
  phone: string | null;
  mfa_enabled: boolean;
  created_at: string;
}

export interface Role {
  id: string;
  name: string | null;
  permissions: Record<string, unknown> | null;
  description: string | null;
}

export interface Case {
  id: string;
  tenant_id: string;
  case_number: string;
  status: CaseStatus;
  case_type: string;
  property_data: Record<string, unknown>;
  assigned_appraiser: string | null;
  ai_confidence: number | null;
  ai_cost_usd: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  tenant_id: string;
  case_id: string;
  file_path: string;
  file_hash: string;
  file_type: string | null;
  metadata: Record<string, unknown>;
  uploaded_by: string | null;
  created_at: string;
}

export interface Comparable {
  id: string;
  tenant_id: string;
  case_id: string;
  source: string;
  source_id: string | null;
  address: string | null;
  price: string | null;
  price_per_sqm: string | null;
  date_sold: string | null;
  similarity_score: number | null;
  adjustments: Record<string, unknown>;
  created_at: string;
}

/** FUTURE TABLE - no existe en DB aún. Envolver uso en try/catch. */
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
  action: string;
  actor: string | null;
  prev_hash: string | null;
  current_hash: string | null;
  payload: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

/** FUTURE TABLE - no existe en DB aún. Envolver uso en try/catch. */
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

/** Contrato estándar de payload para costos AI. */
export interface AICostPayload {
  agent_name: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  duration_ms: number;
  confidence?: number;
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
