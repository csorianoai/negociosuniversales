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
      .select('id, tenant_id, status, property_type, address, city, sector, total_cost_usd, created_at, updated_at')
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

    const body = await request.json();
    const property_type = body.property_type ?? null;
    const address = body.address ?? null;
    const city = body.city ?? null;
    const sector = body.sector ?? null;

    const admin = createAdminClient();
    const { data: caseRow, error } = await admin
      .from('cases')
      .insert({
        tenant_id: auth.tenantId,
        status: 'draft',
        created_by: auth.userId,
        property_type,
        address,
        city,
        sector,
        property_data: {},
        market_context: {},
        total_cost_usd: 0,
      })
      .select('id, tenant_id, status, property_type, address, city, sector, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create case', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ case: caseRow }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
