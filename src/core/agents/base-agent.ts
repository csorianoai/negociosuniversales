import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { callClaude } from '@/lib/anthropic';
import { createAdminClient } from '@/lib/supabase-admin';
import type { AgentResult, AICostPayload } from '@/core/types';

const promptCache = new Map<string, string>();

/**
 * Base class for all AI agents. Handles prompt loading, AI calls,
 * cost logging, and audit logging. Hash chain is computed by DB trigger.
 */
export abstract class BaseAgent {
  protected readonly name: string;
  protected readonly model: string;
  protected readonly promptFileName: string;

  constructor(name: string, model: string, promptFileName: string) {
    this.name = name;
    this.model = model;
    this.promptFileName = promptFileName;
  }

  get agentName(): string {
    return this.name;
  }

  /**
   * Loads system prompt from prompts/system/{promptFileName}.
   * Caches in memory. Fallback to generic string on fs error.
   */
  protected async getSystemPrompt(): Promise<string> {
    const cacheKey = this.promptFileName;
    const cached = promptCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const path = join(process.cwd(), 'prompts', 'system', this.promptFileName);
      const content = await readFile(path, 'utf-8');
      promptCache.set(cacheKey, content);
      return content;
    } catch (err) {
      console.warn(
        `[BaseAgent] Failed to load prompt ${this.promptFileName}:`,
        err instanceof Error ? err.message : String(err)
      );
      const fallback =
        'You are an AI assistant for property appraisal. Follow instructions carefully.';
      promptCache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * Calls Claude with system prompt and user message.
   * Measures duration and returns token/cost info.
   */
  protected async callAI(userMessage: string, options?: { maxTokens?: number }): Promise<{
    content: string;
    tokens_in: number;
    tokens_out: number;
    cost_usd: number;
    duration_ms: number;
    error?: string;
  }> {
    const systemPrompt = await this.getSystemPrompt();
    const start = Date.now();

    const result = await callClaude({
      model: this.model,
      systemPrompt,
      userMessage,
      maxTokens: options?.maxTokens,
    });

    const duration_ms = Date.now() - start;
    return {
      ...result,
      duration_ms,
    };
  }

  /**
   * Logs cost: tries ai_cost_log first; on failure, fallback to audit_log with action='ai_cost'.
   * Always updates cases.ai_cost_usd. Does not throw.
   */
  protected async logCost(
    caseId: string,
    tenantId: string,
    result: {
      tokens_in: number;
      tokens_out: number;
      cost_usd: number;
      duration_ms: number;
      confidence?: number;
    }
  ): Promise<void> {
    const payload: AICostPayload = {
      agent_name: this.name,
      model: this.model,
      tokens_in: result.tokens_in,
      tokens_out: result.tokens_out,
      cost_usd: result.cost_usd,
      duration_ms: result.duration_ms,
      confidence: result.confidence,
    };

    const admin = createAdminClient();

    try {
      const { error } = await admin.from('ai_cost_log').insert({
        tenant_id: tenantId,
        case_id: caseId,
        agent_name: this.name,
        model: this.model,
        tokens_in: result.tokens_in,
        tokens_out: result.tokens_out,
        cost_usd: result.cost_usd,
        duration_ms: result.duration_ms,
      });
      if (error) throw error;
    } catch {
      try {
        await admin.from('audit_log').insert({
          tenant_id: tenantId,
          case_id: caseId,
          action: 'ai_cost',
          actor: null,
          payload,
        });
      } catch (err) {
        console.error('[BaseAgent] logCost audit fallback:', err instanceof Error ? err.message : String(err));
      }
    }

    try {
      const { data: current } = await admin
        .from('cases')
        .select('ai_cost_usd')
        .eq('id', caseId)
        .eq('tenant_id', tenantId)
        .maybeSingle();
      const prev = (current?.ai_cost_usd as number | null) ?? 0;
      await admin
        .from('cases')
        .update({
          ai_cost_usd: prev + result.cost_usd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId)
        .eq('tenant_id', tenantId);
    } catch (err) {
      console.error('[BaseAgent] logCost ai_cost_usd update failed:', err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Appends audit_log entry. DB trigger computes prev_hash and current_hash.
   * No hash calculation in code.
   */
  protected async logAudit(
    caseId: string,
    tenantId: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from('audit_log').insert({
        tenant_id: tenantId,
        case_id: caseId,
        action,
        actor: null,
        payload,
      });

      if (error) {
        console.error('[BaseAgent] logAudit failed:', error.message);
      }
    } catch (err) {
      console.error('[BaseAgent] logAudit error:', err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Execute agent logic. Must be implemented by subclasses.
   */
  abstract execute(caseId: string, tenantId: string): Promise<AgentResult>;
}
