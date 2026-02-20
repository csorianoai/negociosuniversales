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

    try {
      const { data: report, error } = await admin
        .from('reports')
        .select('id, report_markdown, report_data, vrs_score, version, created_at')
        .eq('case_id', caseId)
        .eq('tenant_id', auth.tenantId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !report) {
        const { data: caseRow } = await admin
          .from('cases')
          .select('property_data')
          .eq('id', caseId)
          .eq('tenant_id', auth.tenantId)
          .maybeSingle();

        const pd = (caseRow?.property_data ?? {}) as Record<string, unknown>;
        const fallback = pd?.report_markdown;
        if (typeof fallback === 'string') {
          return NextResponse.json({ report: { report_markdown: fallback } });
        }
        return NextResponse.json(
          { error: 'Reports table not available yet' },
          { status: 404 }
        );
      }

      return NextResponse.json({ report });
    } catch {
      return NextResponse.json(
        { error: 'Reports table not available yet' },
        { status: 404 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
