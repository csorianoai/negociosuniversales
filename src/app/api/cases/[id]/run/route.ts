export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';
import { runPipeline } from '@/core/agents/orchestrator';

export async function POST(
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
      .select('id')
      .eq('id', caseId)
      .eq('tenant_id', auth.tenantId)
      .maybeSingle();

    if (caseErr || !caseRow) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    const result = await runPipeline(caseId, auth.tenantId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
