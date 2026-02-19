import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { callClaude } from '@/lib/anthropic';
import { createAdminClient } from '@/lib/supabase-admin';
import type { AgentResult } from '@/core/types';

const MAX_AUDIT_RETRIES = 3;

const promptCache = new Map<string, string>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Base class for all AI agents. Handles prompt loading, AI calls,
 * cost logging, and hash-chained audit logging.
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
   * Inserts cost entry into ai_cost_log via admin client.
   * Logs to console on error but does not throw.
   */
  protected async logCost(
    caseId: string,
    tenantId: string,
    result: {
      tokens_in: number;
      tokens_out: number;
      cost_usd: number;
      duration_ms: number;
    }
  ): Promise<void> {
    try {
      const admin = createAdminClient();
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

      if (error) {
        console.error('[BaseAgent] logCost failed:', error.message);
      }
    } catch (err) {
      console.error('[BaseAgent] logCost error:', err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Appends audit_log entry with hash chain. Retries on conflict (23505).
   * Uses safe payload serialization. Does not throw on failure.
   */
  protected async logAudit(
    caseId: string,
    tenantId: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    let payloadStr: string;
    try {
      payloadStr = JSON.stringify(payload);
    } catch {
      payloadStr = '{}';
    }

    const admin = createAdminClient();

    for (let attempt = 1; attempt <= MAX_AUDIT_RETRIES; attempt++) {
      try {
        const { data: lastRow } = await admin
          .from('audit_log')
          .select('current_hash')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const prevHash = lastRow?.current_hash ?? 'GENESIS';
        const timestamp = new Date().toISOString();
        const nonce = randomUUID();
        const hashInput =
          prevHash + action + timestamp + payloadStr + nonce;
        const currentHash = createHash('sha256')
          .update(hashInput)
          .digest('hex');

        const { error } = await admin.from('audit_log').insert({
          tenant_id: tenantId,
          case_id: caseId,
          action,
          agent_name: this.name,
          payload: payload as Record<string, unknown>,
          prev_hash: prevHash,
          current_hash: currentHash,
        });

        if (!error) {
          return;
        }

        const isConflict =
          (error as { code?: string } | null)?.code === '23505';
        if (isConflict && attempt < MAX_AUDIT_RETRIES) {
          await sleep(50 * attempt);
          continue;
        }

        console.error('[BaseAgent] logAudit failed:', error.message);
        return;
      } catch (err) {
        console.error(
          '[BaseAgent] logAudit error:',
          err instanceof Error ? err.message : String(err)
        );
        return;
      }
    }
  }

  /**
   * Execute agent logic. Must be implemented by subclasses.
   */
  abstract execute(caseId: string, tenantId: string): Promise<AgentResult>;
}
