import 'server-only';
import { createAdminClient } from '@/lib/supabase-admin';
import type { AgentResult, PipelineResult } from '@/core/types';
import { IntakeAgent } from './intake-agent';
import { ResearchAgent } from './research-agent';
import { ComparableAgent } from './comparable-agent';
import { ReportWriterAgent } from './report-writer-agent';
import { QAAgent } from './qa-agent';
import { ComplianceAgent } from './compliance-agent';

export async function runPipeline(
  caseId: string,
  tenantId: string
): Promise<PipelineResult> {
  const admin = createAdminClient();

  const { data: caseRow, error: caseErr } = await admin
    .from('cases')
    .select('id, tenant_id, status')
    .eq('id', caseId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (caseErr || !caseRow) {
    return {
      steps: [],
      total_cost_usd: 0,
      total_duration_ms: 0,
      success: false,
      case_id: caseId,
    };
  }

  const steps: AgentResult[] = [];
  const agents = [
    new IntakeAgent(),
    new ResearchAgent(),
    new ComparableAgent(),
    new ReportWriterAgent(),
    new QAAgent(),
    new ComplianceAgent(),
  ];

  for (const agent of agents) {
    try {
      const result = await agent.execute(caseId, tenantId);
      steps.push(result);

      if (!result.success) {
        break;
      }

      if (agent.agentName === 'qa') {
        const data = result.data as { overall_pass?: boolean } | null;
        if (data?.overall_pass === false) {
          break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      steps.push({
        success: false,
        data: null,
        error: message,
        cost_usd: 0,
        tokens_in: 0,
        tokens_out: 0,
        duration_ms: 0,
        agent_name: agent.agentName,
      });
      break;
    }
  }

  const total_cost_usd = steps.reduce((sum, s) => sum + s.cost_usd, 0);
  const total_duration_ms = steps.reduce((sum, s) => sum + s.duration_ms, 0);

  await admin
    .from('cases')
    .update({ total_cost_usd })
    .eq('id', caseId)
    .eq('tenant_id', tenantId);

  const success =
    steps.length === 6 && steps.every((s) => s.success);

  return {
    steps,
    total_cost_usd,
    total_duration_ms,
    success,
    case_id: caseId,
  };
}
