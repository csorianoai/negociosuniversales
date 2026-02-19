import 'server-only';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase-admin';
import { BaseAgent } from './base-agent';
import { AI_MODELS } from '@/core/types';

const ComparableItemSchema = z.object({
  address: z.string(),
  area_m2: z.number(),
  original_value_usd: z.number(),
  adjustments: z.record(z.string(), z.unknown()),
  adjusted_value_usd: z.number(),
  source: z.string(),
});

const ComparableSchema = z.object({
  comparables: z.array(ComparableItemSchema),
  valuation_summary: z.record(z.string(), z.unknown()),
  confidence: z.number(),
});

export class ComparableAgent extends BaseAgent {
  constructor() {
    super('comparable', AI_MODELS.HAIKU, 'COMPARABLE.md');
  }

  async execute(caseId: string, tenantId: string) {
    const admin = createAdminClient();
    const start = Date.now();

    const { data: caseRow, error: caseErr } = await admin
      .from('cases')
      .select('property_data, market_context')
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

    const { data: compRows } = await admin
      .from('comparables')
      .select('address, city, sector, area_m2, value_usd, value_dop, source')
      .eq('tenant_id', tenantId)
      .limit(20);

    const known_comparables = (compRows ?? []).map((r) => ({
      address: r.address,
      city: r.city,
      sector: r.sector,
      area_m2: r.area_m2,
      value_usd: r.value_usd,
      value_dop: r.value_dop,
      source: r.source,
    }));

    const userMessage = JSON.stringify({
      property_data: caseRow.property_data,
      market_context: caseRow.market_context,
      known_comparables,
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

    let parsed: z.infer<typeof ComparableSchema>;
    try {
      const json = JSON.parse(aiResult.content) as unknown;
      const parseResult = ComparableSchema.safeParse(json);
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

    for (const comp of parsed.comparables) {
      await admin.from('comparables').insert({
        case_id: caseId,
        tenant_id: tenantId,
        address: comp.address,
        area_m2: comp.area_m2,
        value_usd: comp.original_value_usd,
        value_dop: null,
        adjustments: comp.adjustments,
        adjusted_value_usd: comp.adjusted_value_usd,
        source: comp.source,
      });
    }

    const { error: updateErr } = await admin
      .from('cases')
      .update({
        status: 'comparable',
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

    await this.logAudit(caseId, tenantId, 'agent.comparable.completed', {
      count: parsed.comparables.length,
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
