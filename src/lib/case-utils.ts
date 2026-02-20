/**
 * Safe helpers for property_data and API response parsing.
 * NO any / as any.
 */

export function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function normalizeCasesResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (isRecord(data)) {
    if (Array.isArray(data.cases)) return data.cases;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

export function normalizeCaseDetail(
  data: unknown
): Record<string, unknown> | null {
  if (!isRecord(data)) return null;
  if (typeof data.case_number === 'string') return data;
  const caseVal = data.case;
  if (isRecord(caseVal) && typeof caseVal.case_number === 'string')
    return caseVal;
  const dataVal = data.data;
  if (isRecord(dataVal) && typeof dataVal.case_number === 'string')
    return dataVal;
  return null;
}

export interface CaseLike {
  case_number: string;
  status: string;
  case_type?: string;
  created_at: string;
  updated_at?: string;
  property_data?: unknown;
  ai_cost_usd?: number | null;
  ai_confidence?: number | null;
}

export function isCaseLike(obj: unknown): obj is CaseLike {
  if (!isRecord(obj)) return false;
  return (
    typeof obj.case_number === 'string' &&
    obj.case_number.length > 0 &&
    typeof obj.status === 'string' &&
    obj.status.length > 0 &&
    typeof obj.created_at === 'string' &&
    obj.created_at.length > 0
  );
}

export function extractPropertyField(
  propertyData: unknown,
  field: string,
  fallback = '—'
): string {
  if (!isRecord(propertyData) || !(field in propertyData)) return fallback;
  const val = propertyData[field];
  if (typeof val === 'string' && val.length > 0) return val;
  if (typeof val === 'number' && Number.isFinite(val)) return String(val);
  if (isRecord(val) && 'full' in val) {
    const full = val.full;
    if (typeof full === 'string' && full.length > 0) return full;
  }
  return fallback;
}

export function extractPropertyNumber(
  propertyData: unknown,
  field: string,
  fallback = 0
): number {
  if (!isRecord(propertyData) || !(field in propertyData)) return fallback;
  const val = propertyData[field];
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const parsed = Number.parseFloat(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function extractPropertyArray(
  propertyData: unknown,
  field: string
): unknown[] {
  if (!isRecord(propertyData) || !(field in propertyData)) return [];
  const val = propertyData[field];
  return Array.isArray(val) ? val : [];
}

export function extractArrayField(
  record: Record<string, unknown> | null,
  field: string
): unknown[] {
  if (!record) return [];
  const v = record[field];
  return Array.isArray(v) ? v : [];
}

export function parseValidDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
