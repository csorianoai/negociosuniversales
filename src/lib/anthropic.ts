import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { AI_COST_RATES } from '@/core/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

export interface CallClaudeResult {
  content: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  error?: string;
}

/**
 * Calls Claude API with system and user messages.
 * Never throws; returns error in result on failure.
 *
 * @param params - model, systemPrompt, userMessage, optional maxTokens
 * @returns content, token counts, cost_usd, and optional error
 */
export async function callClaude(params: {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<CallClaudeResult> {
  const { model, systemPrompt, userMessage, maxTokens = 4096 } = params;

  const rate = AI_COST_RATES[model as keyof typeof AI_COST_RATES] ?? null;
  if (!rate) {
    return {
      content: '',
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: 0,
      error: 'Unknown model rate',
    };
  }

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    const cost_usd =
      (inputTokens / 1e6) * rate.input_per_mtok +
      (outputTokens / 1e6) * rate.output_per_mtok;

    const blocks = Array.isArray(response.content) ? response.content : [];
    const content = blocks
      .map((c) => (c.type === 'text' && 'text' in c ? (c as { text: string }).text : ''))
      .join('');

    return {
      content,
      tokens_in: inputTokens,
      tokens_out: outputTokens,
      cost_usd,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown API error';
    return {
      content: '',
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: 0,
      error: message,
    };
  }
}
