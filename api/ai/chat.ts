import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGemini, getModelName } from '../lib/gemini.js';
import { loadKnowledge } from '../lib/knowledge.js';
import { buildSystemPrompt } from '../lib/prompt.js';
import { chatRequestSchema } from '../lib/validation.js';
import { isRateLimited, rateLimitHeaders, RATE_LIMIT } from '../lib/rate-limit.js';
import { recordAnalytics } from '../lib/analytics.js';

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

  let stream;
  let knowledge;
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

    stream = await withRetry(() =>
      gemini.models.generateContentStream({
        model: getModelName(),
        contents,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 500,
        },
      }),
    );
  } catch (err) {
    console.error('Ask Suan AI setup error:', err);
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.status(200);

  const write = (payload: object) => res.write(`${JSON.stringify(payload)}\n`);

  const startedAt = Date.now();
  try {
    let receivedText = false;
    const refIds: string[] = [];
    for await (const chunk of stream) {
      let text = chunkText(chunk.candidates?.[0]);
      if (text) {
        receivedText = true;
        text = splitReferenceMarkers(text, refIds);
        if (text) write({ type: 'chunk', text });
      }
    }

    const references: Reference[] = resolveReferences(refIds, knowledge);

    if (!receivedText) {
      write({ type: 'error', message: 'Empty response from model' });
      recordAnalytics(message, { ok: false, durationMs: Date.now() - startedAt });
    } else {
      if (references.length > 0) write({ type: 'ref', references });
      write({ type: 'done' });
      recordAnalytics(message, { ok: true, durationMs: Date.now() - startedAt });
    }
  } catch (err) {
    console.error('Ask Suan AI stream error:', err);
    write({ type: 'error', message: 'Something went wrong. Please try again.' });
    recordAnalytics(message, { ok: false, durationMs: Date.now() - startedAt });
  } finally {
    res.end();
  }
}