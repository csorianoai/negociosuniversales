import 'server-only';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase-admin';
import { BaseAgent } from './base-agent';
import { AI_MODELS } from '@/core/types';

const ComplianceCheckSchema = z.object({
  id: z.string(),
  rule: z.string(),
  passed: z.boolean(),
  regulation: z.string(),
  details: z.string().optional(),
});

const ComplianceSchema = z.object({
  compliance_checks: z.array(ComplianceCheckSchema),
  overall_compliant: z.boolean(),
});

export class ComplianceAgent extends BaseAgent {
  constructor() {
    super('compliance', AI_MODELS.HAIKU, 'COMPLIANCE.md');
  }

  async execute(caseId: string, tenantId: string) {
    const admin = createAdminClient();
    const start = Date.now();

    const { data: reportRow, error: reportErr } = await admin
      .from('reports')
      .select('report_markdown')
      .eq('case_id', caseId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reportErr || !reportRow) {
      return {
        success: false,
        data: null,
        error: reportErr?.message ?? 'Report not found',
        cost_usd: 0,
        tokens_in: 0,
        tokens_out: 0,
        duration_ms: Date.now() - start,
        agent_name: this.name,
      };
    }

    const { data: caseRow } = await admin
      .from('cases')
      .select('property_data, status')
      .eq('id', caseId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    const { data: tenantRow } = await admin
      .from('tenants')
      .select('settings, plan')
      .eq('id', tenantId)
      .maybeSingle();

    const userMessage = JSON.stringify({
      report_markdown: reportRow.report_markdown,
      property_data: caseRow?.property_data ?? {},
      case_status: caseRow?.status ?? null,
      tenant_settings: tenantRow?.settings ?? {},
      tenant_plan: tenantRow?.plan ?? null,
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

    let parsed: z.infer<typeof ComplianceSchema>;
    try {
      const json = JSON.parse(aiResult.content) as unknown;
      const parseResult = ComplianceSchema.safeParse(json);
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

    const newStatus = parsed.overall_compliant ? 'delivered' : 'compliance';

    const { error: updateErr } = await admin
      .from('cases')
      .update({
        status: newStatus,
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

    await this.logAudit(caseId, tenantId, 'agent.compliance.completed', {
      overall_compliant: parsed.overall_compliant,
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
