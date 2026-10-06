import type { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGemini, getModelName, getFallbackModelName } from '../lib/gemini.js';
import { loadKnowledge } from '../lib/knowledge.js';
import { buildSystemPrompt } from '../lib/prompt.js';
import { chatRequestSchema } from '../lib/validation.js';
import { isRateLimited, rateLimitHeaders, RATE_LIMIT } from '../lib/rate-limit.js';
import { recordAnalytics } from '../lib/analytics.js';
import { classifyAiError } from '../lib/errors.js';

function chunkText(candidate: { content?: { parts?: { text?: string }[] } } | undefined): string {
  return (candidate?.content?.parts ?? []).map((p) => p.text ?? '').join('');
}

interface Reference {
  type: 'project' | 'experience' | 'contact';
  id: string;
  label: string;
  url: string;
}

const REF_MARKER = /^REFERENCE:(\w+):([\w-]+)$/;

function splitReferenceMarkers(text: string, out: string[]): string {
  const lines = text.split('\n');
  const kept: string[] = [];
  for (const line of lines) {
    const m = line.trim().match(REF_MARKER);
    if (m) {
      out.push(`${m[1]}:${m[2]}`);
    } else if (line.trim()) {
      kept.push(line);
    }
  }
  return kept.join('\n');
}

function resolveReferences(refIds: string[], knowledge: Awaited<ReturnType<typeof loadKnowledge>>): Reference[] {
  const seen = new Set<string>();
  const refs: Reference[] = [];

  for (const raw of refIds) {
    const [type, id] = raw.split(':');
    if (type !== 'project' || !id || seen.has(id)) continue;
    seen.add(id);

    const project = knowledge.projects.find((p) => p.id === id);
    if (!project) continue;

    refs.push({
      type: 'project',
      id: project.id,
      label: `View ${project.name} →`,
      url: `/projects`,
    });
  }

  return refs;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err: unknown): boolean {
  const status = (err as { status?: number; code?: number } | undefined)?.status ?? (err as { code?: number } | undefined)?.code;
  return status === 503 || status === 429;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 1000): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === attempts - 1) throw err;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
  throw lastErr;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  const { message, history = [] } = parsed.data;

  if (isRateLimited(req)) {
    res.setHeader('Retry-After', Math.ceil(RATE_LIMIT.blockMs / 1000));
    return res.status(429).json({ success: false, error: 'Too many requests' });
  }
  res.setHeader('X-RateLimit-Limit', rateLimitHeaders(req)['X-RateLimit-Limit']);
  res.setHeader('X-RateLimit-Remaining', rateLimitHeaders(req)['X-RateLimit-Remaining']);

  let knowledge;
  let generate: (model: string) => ReturnType<GoogleGenAI['models']['generateContentStream']>;
  try {
    knowledge = loadKnowledge();
    const systemPrompt = buildSystemPrompt(knowledge);
    const gemini = getGemini();

    const contents = [
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    generate = (model: string) =>
      gemini.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 500,
        },
      });
  } catch (err) {
    console.error('Ask Suan AI setup error:', err);
    const info = classifyAiError(err);
    return res.status(info.status).json({ success: false, error: info.message, code: info.code });
  }

  const write = (payload: object) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Accel-Buffering', 'no');
      res.status(200);
    }
    res.write(`${JSON.stringify(payload)}
`);
  };

  const models = [...new Set([getModelName(), getFallbackModelName()])];
  const refIds: string[] = [];
  const startedAt = Date.now();
  let receivedText = false;
  let lastErr: unknown;

  // Try each model in turn. Gemini can fail on the initial request (503/429) or drop
  // the stream mid-response; either way, if nothing has been sent yet, move on to the
  // next model. Once text has reached the client we keep what we have.
  for (const model of models) {
    try {
      const stream = await withRetry(() => generate(model), 2);
      for await (const chunk of stream) {
        let text = chunkText(chunk.candidates?.[0]);
        if (text) {
          receivedText = true;
          text = splitReferenceMarkers(text, refIds);
          if (text) write({ type: 'chunk', text });
        }
      }
      if (receivedText) break;
      lastErr = new Error(`Empty response from ${model}`);
    } catch (err) {
      lastErr = err;
      console.warn(`Ask Suan AI: model ${model} failed`, err);
      if (receivedText) break;
    }
  }

  if (receivedText) {
    const references: Reference[] = resolveReferences(refIds, knowledge);
    if (references.length > 0) write({ type: 'ref', references });
    write({ type: 'done' });
    recordAnalytics(message, { ok: true, durationMs: Date.now() - startedAt });
    return res.end();
  }

  console.error('Ask Suan AI: all models failed', lastErr);
  recordAnalytics(message, { ok: false, durationMs: Date.now() - startedAt });
  // Report the last model's failure: it is the one the visitor would have to wait on.
  const info = classifyAiError(lastErr);
  return res.status(info.status).json({ success: false, error: info.message, code: info.code });
}
