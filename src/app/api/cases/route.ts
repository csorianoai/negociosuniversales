export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const admin = createAdminClient();
    const { data: cases, error } = await admin
      .from('cases')
      .select('id, tenant_id, case_number, status, case_type, property_data, ai_confidence, ai_cost_usd, created_at, updated_at')
      .eq('tenant_id', auth.tenantId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cases', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(cases ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;
    const case_type = (typeof body.case_type === 'string' ? body.case_type : 'real_estate') as string;
    const pd = (body.property_data ?? body) as Record<string, unknown>;
    const property_data: Record<string, unknown> = {
      ...(typeof pd === 'object' && pd !== null ? pd : {}),
      address: body.address ?? pd?.address ?? null,
      city: body.city ?? pd?.city ?? null,
      sector: body.sector ?? pd?.sector ?? null,
      property_type: body.property_type ?? pd?.property_type ?? null,
    };

    const case_number = 'NU-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900) + 100);

    const admin = createAdminClient();
    const { data: caseRow, error } = await admin
      .from('cases')
      .insert({
        tenant_id: auth.tenantId,
        case_number,
        status: 'pending_intake',
        case_type,
        property_data,
        created_by: auth.userId,
      })
      .select('id, tenant_id, case_number, status, case_type, property_data, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create case', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ case: caseRow, id: caseRow.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
