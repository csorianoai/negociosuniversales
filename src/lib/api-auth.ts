import { NextResponse } from 'next/server';
import { createServerSupabase } from './supabase-server';
import { createAdminClient } from './supabase-admin';

export type AuthResult =
  | { ok: true; userId: string; tenantId: string }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ),
      };
    }

    const admin = createAdminClient();
    const { data: userRow } = await admin
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .limit(1)
      .maybeSingle();

    if (!userRow?.tenant_id) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Forbidden', details: 'No tenant assigned' },
          { status: 403 }
        ),
      };
    }

    return { ok: true, userId: user.id, tenantId: userRow.tenant_id };
  } catch (err) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      ),
    };
  }
}
