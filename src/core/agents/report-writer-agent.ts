import 'server-only';
import { createAdminClient } from '@/lib/supabase-admin';
import { BaseAgent } from './base-agent';
import { AI_MODELS } from '@/core/types';

export class ReportWriterAgent extends BaseAgent {
  constructor() {
    super('report-writer', AI_MODELS.SONNET, 'REPORT_WRITER.md');
  }

  async execute(caseId: string, tenantId: string) {
    const admin = createAdminClient();
    const start = Date.now();

    const { data: caseRow, error: caseErr } = await admin
      .from('cases')
      .select('property_data, market_context, address, city, sector, property_type')
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
      .select('address, area_m2, value_usd, adjustments, adjusted_value_usd')
      .eq('case_id', caseId);

    const { data: evidenceRows } = await admin
      .from('evidence')
      .select('file_hash, file_name')
      .eq('case_id', caseId);

    const { data: tenantRow } = await admin
      .from('tenants')
      .select('name')
      .eq('id', tenantId)
      .maybeSingle();

    const userMessage = JSON.stringify({
      property_data: caseRow.property_data,
      market_context: caseRow.market_context,
      address: caseRow.address,
      city: caseRow.city,
      sector: caseRow.sector,
      property_type: caseRow.property_type,
      comparables: compRows ?? [],
      evidence: evidenceRows ?? [],
      tenant_name: tenantRow?.name ?? null,
    });

    const aiResult = await this.callAI(userMessage, { maxTokens: 8192 });

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

    const markdown = aiResult.content.trim();
    const word_count = markdown.split(/\s+/).filter(Boolean).length;

    const { error: insertErr } = await admin.from('reports').insert({
      case_id: caseId,
      tenant_id: tenantId,
      report_markdown: markdown,
      report_data: { word_count },
      version: 1,
    });

    if (insertErr) {
      return {
        success: false,
        data: null,
        error: insertErr.message,
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
        status: 'report',
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .eq('tenant_id', tenantId);

    if (updateErr) {
      return {
        success: false,
        data: { markdown, word_count },
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

    await this.logAudit(caseId, tenantId, 'agent.report_writer.completed', {
      word_count,
    });

    return {
      success: true,
      data: { markdown, word_count },
      error: null,
      cost_usd: aiResult.cost_usd,
      tokens_in: aiResult.tokens_in,
      tokens_out: aiResult.tokens_out,
      duration_ms: aiResult.duration_ms,
      agent_name: this.name,
    };
  }
}
