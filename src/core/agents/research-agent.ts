import 'server-only';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase-admin';
import { BaseAgent } from './base-agent';
import { AI_MODELS } from '@/core/types';

const ResearchSchema = z.object({
  market_context: z.record(z.string(), z.unknown()),
  data_sources: z.array(z.unknown()).optional(),
  confidence: z.number(),
});

export class ResearchAgent extends BaseAgent {
  constructor() {
    super('research', AI_MODELS.SONNET, 'RESEARCH.md');
  }

  async execute(caseId: string, tenantId: string) {
    const admin = createAdminClient();
    const start = Date.now();

    const { data: caseRow, error: caseErr } = await admin
      .from('cases')
      .select('property_data')
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

    const { data: ragRows } = await admin
      .from('rag_chunks')
      .select('content, source_type, metadata')
      .limit(10);

    const rag_context = (ragRows ?? []).map((r) => ({
      content: r.content,
      source_type: r.source_type,
      metadata: r.metadata,
    }));

    const userMessage = JSON.stringify({
      property_data: caseRow.property_data,
      rag_context,
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

    let parsed: z.infer<typeof ResearchSchema>;
    try {
      const json = JSON.parse(aiResult.content) as unknown;
      const parseResult = ResearchSchema.safeParse(json);
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

    const pd = (caseRow?.property_data ?? {}) as Record<string, unknown>;
    const merged = { ...pd, market_context: parsed.market_context };

    const { error: updateErr } = await admin
      .from('cases')
      .update({
        property_data: merged,
        status: 'research_completed',
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

    await this.logAudit(caseId, tenantId, 'agent.research.completed', {
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
