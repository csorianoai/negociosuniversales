export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { id: caseId } = await context.params;

    const admin = createAdminClient();
    const { data: caseRow, error: caseErr } = await admin
      .from('cases')
      .select('id, tenant_id, status, property_type, address, city, sector, property_data, market_context, total_cost_usd, created_at, updated_at')
      .eq('id', caseId)
      .eq('tenant_id', auth.tenantId)
      .maybeSingle();

    if (caseErr || !caseRow) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    const { data: evidence } = await admin
      .from('evidence')
      .select('id, file_path, file_name, file_hash, mime_type, file_size, created_at')
      .eq('case_id', caseId)
      .eq('tenant_id', auth.tenantId);

    const { data: comparables } = await admin
      .from('comparables')
      .select('id, address, area_m2, value_usd, value_dop, adjustments, adjusted_value_usd, source, created_at')
      .eq('case_id', caseId)
      .eq('tenant_id', auth.tenantId);

    const { data: reports } = await admin
      .from('reports')
      .select('id, report_markdown, report_data, vrs_score, version, created_at')
      .eq('case_id', caseId)
      .eq('tenant_id', auth.tenantId)
      .order('version', { ascending: false });

    return NextResponse.json({
      case: caseRow,
      evidence: evidence ?? [],
      comparables: comparables ?? [],
      reports: reports ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
