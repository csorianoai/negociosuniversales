export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { IntakeAgent } from '@/core/agents/intake-agent';
import { ResearchAgent } from '@/core/agents/research-agent';
import { ComparableAgent } from '@/core/agents/comparable-agent';
import { ReportWriterAgent } from '@/core/agents/report-writer-agent';
import { QAAgent } from '@/core/agents/qa-agent';
import { ComplianceAgent } from '@/core/agents/compliance-agent';

const AGENT_MAP: Record<string, () => IntakeAgent | ResearchAgent | ComparableAgent | ReportWriterAgent | QAAgent | ComplianceAgent> = {
  intake: () => new IntakeAgent(),
  research: () => new ResearchAgent(),
  comparable: () => new ComparableAgent(),
  'report-writer': () => new ReportWriterAgent(),
  qa: () => new QAAgent(),
  compliance: () => new ComplianceAgent(),
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { name: agentName } = await context.params;

    const body = await request.json();
    const caseId = body.case_id as string | undefined;

    if (!caseId) {
      return NextResponse.json(
        { error: 'Missing case_id in body' },
        { status: 400 }
      );
    }

    const createAgent = AGENT_MAP[agentName];
    if (!createAgent) {
      return NextResponse.json(
        { error: 'Unknown agent' },
        { status: 400 }
      );
    }

    const agent = createAgent();
    const result = await agent.execute(caseId, auth.tenantId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
