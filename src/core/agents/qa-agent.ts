import 'server-only';
import { extractJson } from '@/lib/extract-json';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase-admin';
import { BaseAgent } from './base-agent';
import { AI_MODELS } from '@/core/types';

const QACheckSchema = z.object({
  id: z.string(),
  name: z.string(),
  passed: z.boolean(),
  details: z.string().optional(),
});

const QASchema = z.object({
  checks: z.array(QACheckSchema),
  overall_pass: z.boolean(),
  vrs_score: z.number(),
});

export class QAAgent extends BaseAgent {
  constructor() {
    super('qa', AI_MODELS.HAIKU, 'QA.md');
  }

  async execute(caseId: string, tenantId: string) {
    const admin = createAdminClient();
    const start = Date.now();

    let report_markdown: string | null = null;
    let report_data: Record<string, unknown> = {};
    let report_id: string | null = null;

    try {
      const { data: reportRow } = await admin
        .from('reports')
        .select('id, report_markdown, report_data')
        .eq('case_id', caseId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reportRow) {
        report_markdown = reportRow.report_markdown ?? null;
        report_data = (reportRow.report_data ?? {}) as Record<string, unknown>;
        report_id = reportRow.id;
      }
    } catch {
      // reports table may not exist
    }

    if (!report_markdown) {
      const { data: caseRow } = await admin
        .from('cases')
        .select('property_data')
        .eq('id', caseId)
        .eq('tenant_id', tenantId)
        .maybeSingle();
      const pd = (caseRow?.property_data ?? {}) as Record<string, unknown>;
      report_markdown = (pd?.report_markdown as string) ?? null;
    }

    if (!report_markdown) {
      return {
        success: false,
        data: null,
        error: 'Report not found',
        cost_usd: 0,
        tokens_in: 0,
        tokens_out: 0,
        duration_ms: Date.now() - start,
        agent_name: this.name,
      };
    }

    const { data: caseRow } = await admin
      .from('cases')
      .select('property_data')
      .eq('id', caseId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    const { count } = await admin
      .from('comparables')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId);

    const userMessage = JSON.stringify({
      report_markdown,
      report_data,
      property_data: caseRow?.property_data ?? {},
      comparable_count: count ?? 0,
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

    let parsed: z.infer<typeof QASchema>;
    try {
      const cleaned = extractJson(aiResult.content);
      const json = JSON.parse(cleaned) as unknown;
      const parseResult = QASchema.safeParse(json);
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

    if (report_id) {
      try {
        const { error: updateReportErr } = await admin
          .from('reports')
          .update({ vrs_score: parsed.vrs_score })
          .eq('id', report_id);

        if (updateReportErr) {
          return {
            success: false,
            data: null,
            error: updateReportErr.message,
            cost_usd: aiResult.cost_usd,
            tokens_in: aiResult.tokens_in,
            tokens_out: aiResult.tokens_out,
            duration_ms: aiResult.duration_ms,
            agent_name: this.name,
          };
        }
      } catch {
        // reports table may not exist, continue
      }
    }

    const qaStatus = parsed.overall_pass ? 'qa_passed' : 'qa_failed';

    const { error: updateCaseErr } = await admin
      .from('cases')
      .update({
        status: qaStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .eq('tenant_id', tenantId);

    if (updateCaseErr) {
      return {
        success: false,
        data: null,
        error: updateCaseErr.message,
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

    await this.logAudit(caseId, tenantId, 'agent.qa.completed', {
      vrs_score: parsed.vrs_score,
      overall_pass: parsed.overall_pass,
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

