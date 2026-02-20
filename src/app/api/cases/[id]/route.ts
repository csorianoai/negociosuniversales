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
      .select('id, tenant_id, case_number, status, case_type, property_data, assigned_appraiser, ai_confidence, ai_cost_usd, created_by, created_at, updated_at')
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
      .select('id, file_path, file_hash, file_type, metadata, uploaded_by, created_at')
      .eq('case_id', caseId)
      .eq('tenant_id', auth.tenantId);

    const { data: comparables } = await admin
      .from('comparables')
      .select('id, source, source_id, address, price, price_per_sqm, date_sold, similarity_score, adjustments, created_at')
      .eq('case_id', caseId)
      .eq('tenant_id', auth.tenantId);

    let reports: unknown[] = [];
    try {
      const { data: reportsData } = await admin
        .from('reports')
        .select('id, report_markdown, report_data, vrs_score, version, created_at')
        .eq('case_id', caseId)
        .eq('tenant_id', auth.tenantId)
        .order('version', { ascending: false });
      reports = reportsData ?? [];
    } catch {
      // reports table may not exist
    }

    const report = Array.isArray(reports) && reports.length > 0 ? reports[0] : null;
    const report_markdown =
      (caseRow.property_data as Record<string, unknown> | null)?.report_markdown ??
      (report && typeof report === 'object' && report !== null && 'report_markdown' in report
        ? (report as { report_markdown: string | null }).report_markdown
        : null);

    return NextResponse.json({
      ...caseRow,
      evidence: evidence ?? [],
      comparables: comparables ?? [],
      report,
      report_markdown,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
