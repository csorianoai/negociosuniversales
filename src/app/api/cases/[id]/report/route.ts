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
    const { data: report, error } = await admin
      .from('reports')
      .select('id, report_markdown, report_data, vrs_score, version, created_at')
      .eq('case_id', caseId)
      .eq('tenant_id', auth.tenantId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
