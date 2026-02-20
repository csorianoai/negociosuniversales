import 'server-only';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase-admin';
import { BaseAgent } from './base-agent';
import { AI_MODELS } from '@/core/types';

const IntakeSchema = z.object({
  property_data: z.record(z.string(), z.unknown()),
  confidence: z.number(),
  missing_fields: z.array(z.string()).optional(),
  needs_human_review: z.boolean().optional(),
});

/**
 * Extracts the first JSON object from a string that may contain
 * markdown fences, preamble text, or trailing explanation.
 */
function extractJson(text: string): string {
  let raw = text.trim();
  // Remove markdown code fences if present
  raw = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  raw = raw.trim();
  // Find first { and last }
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return raw.slice(jsonStart, jsonEnd + 1);
  }
  return raw;
}

export class IntakeAgent extends BaseAgent {
  constructor() {
    super('intake', AI_MODELS.HAIKU, 'INTAKE.md');
  }

  async execute(caseId: string, tenantId: string) {
    const admin = createAdminClient();
    const start = Date.now();

    const { data: caseRow, error: caseErr } = await admin
      .from('cases')
      .select('id, property_data')
      .eq('id', caseId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (caseErr || !caseRow) {
      return {
        success: false,
        data: null,
        error: caseErr?.message ?? 'Case not found',
        cost_usd: 0,
        tokens_in: 0,
        tokens_out: 0,
        duration_ms: Date.now() - start,
        agent_name: this.name,
      };
    }

    const { data: evidenceRows } = await admin
      .from('evidence')
      .select('id, file_path, file_hash, file_type')
      .eq('case_id', caseId)
      .eq('tenant_id', tenantId);

    const evidence_files = (evidenceRows ?? []).map((r) => ({
      id: r.id,
      file_path: r.file_path,
      file_hash: r.file_hash,
      file_type: r.file_type,
    }));

    const userMessage = JSON.stringify({
      property_data: caseRow.property_data,
      evidence_files,
    });

    const aiResult = await this.callAI(userMessage);

    if (aiResult.error) {
      return {
        success: false,
        data: null,
        error: aiResult.error,
        cost_usd: aiResult.cost_usd,
        tokens_in: aiResult.tokens_in,
        tokens_out: aiResult.tokens_out,
        duration_ms: aiResult.duration_ms,
        agent_name: this.name,
      };
    }

    let parsed: z.infer<typeof IntakeSchema>;
    try {
      const cleaned = extractJson(aiResult.content);
      const json = JSON.parse(cleaned) as unknown;
      const parseResult = IntakeSchema.safeParse(json);
      if (!parseResult.success) {
        return {
          success: false,
          data: null,
          error: `Invalid AI response: ${parseResult.error.message}`,
          cost_usd: aiResult.cost_usd,
          tokens_in: aiResult.tokens_in,
          tokens_out: aiResult.tokens_out,
          duration_ms: aiResult.duration_ms,
          agent_name: this.name,
        };
      }
      parsed = parseResult.data;
    } catch {
      return {
        success: false,
        data: null,
        error: 'Invalid AI response: invalid JSON',
        cost_usd: aiResult.cost_usd,
        tokens_in: aiResult.tokens_in,
        tokens_out: aiResult.tokens_out,
        duration_ms: aiResult.duration_ms,
        agent_name: this.name,
      };
    }

    const { error: updateErr } = await admin
      .from('cases')
      .update({
        property_data: parsed.property_data,
        status: 'intake_completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .eq('tenant_id', tenantId);

    if (updateErr) {
      return {
        success: false,
        data: null,
        error: updateErr.message,
        cost_usd: aiResult.cost_usd,
        tokens_in: aiResult.tokens_in,
        tokens_out: aiResult.tokens_out,
        duration_ms: aiResult.duration_ms,
        agent_name: this.name,
      };
    }

    await this.logCost(caseId, tenantId, {
      tokens_in: aiResult.tokens_in,
      tokens_out: aiResult.tokens_out,
      cost_usd: aiResult.cost_usd,
      duration_ms: aiResult.duration_ms,
    });

    await this.logAudit(caseId, tenantId, 'agent.intake.completed', {
      confidence: parsed.confidence,
    });

    return {
      success: true,
      data: parsed,
      error: null,
      cost_usd: aiResult.cost_usd,
      tokens_in: aiResult.tokens_in,
      tokens_out: aiResult.tokens_out,
      duration_ms: aiResult.duration_ms,
      agent_name: this.name,
    };
  }
}