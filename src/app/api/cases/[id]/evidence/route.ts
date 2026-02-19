export const runtime = 'nodejs';

import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAuth } from '@/lib/api-auth';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { id: caseId } = await context.params;

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileHash = createHash('sha256').update(buffer).digest('hex');

    const filePath = `evidence/${auth.tenantId}/${caseId}/${file.name}`;

    const admin = createAdminClient();
    const { error: uploadErr } = await admin.storage
      .from('evidence')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadErr.message },
        { status: 500 }
      );
    }

    const { data: evidence, error: insertErr } = await admin
      .from('evidence')
      .insert({
        case_id: caseId,
        tenant_id: auth.tenantId,
        file_path: filePath,
        file_name: file.name,
        file_hash: fileHash,
        mime_type: file.type || null,
        file_size: buffer.length,
      })
      .select('id, file_path, file_name, file_hash, mime_type, file_size, created_at')
      .single();

    if (insertErr) {
      return NextResponse.json(
        { error: 'Failed to save evidence', details: insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ evidence }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
