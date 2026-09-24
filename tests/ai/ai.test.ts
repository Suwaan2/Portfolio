import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const generateContentStream = vi.fn();

vi.mock('../../api/lib/gemini', () => ({
  getGemini: () => ({ models: { generateContentStream } }),
  getModelName: () => 'mock-model',
}));

import handler from '../../api/ai/chat';
import { chatRequestSchema } from '../../api/lib/validation';
import { isRateLimited, resetRateLimits } from '../../api/lib/rate-limit';
import { loadKnowledge } from '../../api/lib/knowledge';
import { buildSystemPrompt } from '../../api/lib/prompt';
import { detectTopic, recordAnalytics, getAnalytics, resetAnalytics } from '../../api/lib/analytics';

function chunk(text: string) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

function makeReq(overrides: Partial<Record<string, unknown>> = {}): VercelRequest {
  return {
    method: 'POST',
    body: { message: "What is Suan's name?", history: [] },
    headers: { 'x-forwarded-for': '1.2.3.4' },
    ...overrides,
  } as unknown as VercelRequest;
}

function makeRes() {
  const state: {
    statusCode: number;
    headers: Record<string, unknown>;
    jsonBody: unknown;
    written: string[];
  } = { statusCode: 200, headers: {}, jsonBody: null, written: [] };
  const res = {
    setHeader: (k: string, v: unknown) => {
      state.headers[k] = v;
    },
    status: (code: number) => {
      state.statusCode = code;
      return res;
    },
    json: (body: unknown) => {
      state.jsonBody = body;
      return res;
    },
    write: (s: string) => {
      state.written.push(s);
      return true;
    },
    end: () => {},
  } as unknown as VercelResponse;
  return { res, state };
}

function parseEvents(written: string[]) {
  return written
    .map((line) => JSON.parse(line))
    .filter((e: { type?: string }) => typeof e.type === 'string');
}

describe('chatRequestSchema validation', () => {
  it('rejects empty message', () => {
    expect(chatRequestSchema.safeParse({ message: ' ' }).success).toBe(false);
  });

  it('rejects message longer than 500 chars', () => {
    expect(chatRequestSchema.safeParse({ message: 'a'.repeat(501) }).success).toBe(false);
  });

  it('accepts valid message', () => {
    expect(chatRequestSchema.safeParse({ message: 'Tell me about Vault.' }).success).toBe(true);
  });

  it('rejects history with more than 20 entries', () => {
    const history = Array.from({ length: 21 }, () => ({ role: 'user' as const, content: 'hi' }));
    expect(chatRequestSchema.safeParse({ message: 'hi', history }).success).toBe(false);
  });

  it('rejects invalid history role', () => {
    expect(
      chatRequestSchema.safeParse({ message: 'hi', history: [{ role: 'model', content: 'x' }] }).success,
    ).toBe(false);
  });
});

describe('POST /api/ai/chat handler', () => {
  beforeEach(() => {
    generateContentStream.mockReset();
    resetRateLimits();
  });

  it('returns 405 for non-POST', async () => {
    const { res, state } = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(state.statusCode).toBe(405);
  });

  it('returns 400 for invalid input without calling Gemini', async () => {
    const { res, state } = makeRes();
    await handler(makeReq({ body: { message: '' } }), res);
    expect(state.statusCode).toBe(400);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it('returns 400 for empty message (Test 9 — Empty input)', async () => {
    const { res, state } = makeRes();
    await handler(makeReq({ body: { message: '   ' } }), res);
    expect(state.statusCode).toBe(400);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it('returns 400 for excessively long input (Test 10)', async () => {
    const { res, state } = makeRes();
    await handler(makeReq({ body: { message: 'a'.repeat(501) } }), res);
    expect(state.statusCode).toBe(400);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it('streams chunks and a done event', async () => {
    generateContentStream.mockImplementation(async function* () {
      yield chunk('Suan KC ');
      yield chunk('is a student.');
    });
    const { res, state } = makeRes();
    await handler(makeReq(), res);
    const events = parseEvents(state.written);
    const text = events.filter((e: { type: string }) => e.type === 'chunk').map((e: { text: string }) => e.text).join('');
    expect(text).toBe('Suan KC is a student.');
    expect(events[events.length - 1].type).toBe('done');
  });

  it('strips a known REFERENCE marker and emits a ref event', async () => {
    generateContentStream.mockImplementation(async function* () {
      yield chunk('Vault is a great project.');
      yield chunk('\nREFERENCE:project:vault\n');
      yield chunk('More info.');
    });
    const { res, state } = makeRes();
    await handler(makeReq({ body: { message: 'Tell me about Vault.' } }), res);
    const events = parseEvents(state.written);
    const allText = events.filter((e: { type: string }) => e.type === 'chunk').map((e) => e.text).join('');
    expect(allText).not.toContain('REFERENCE:');
    const refEvent = events.find((e: { type: string }) => e.type === 'ref');
    expect(refEvent).toBeDefined();
    expect(refEvent.references[0]).toMatchObject({ type: 'project', id: 'vault', url: '/projects' });
  });

  it('ignores unknown / injected reference ids', async () => {
    generateContentStream.mockImplementation(async function* () {
      yield chunk('Cool project.');
      yield chunk('\nREFERENCE:project:not-a-real-project\n');
    });
    const { res, state } = makeRes();
    await handler(makeReq(), res);
    const events = parseEvents(state.written);
    expect(events.some((e: { type: string }) => e.type === 'ref')).toBe(false);
    expect(events[events.length - 1].type).toBe('done');
  });

  it('returns 500 when Gemini setup fails (Test 11 — API failure)', async () => {
    generateContentStream.mockRejectedValue(new Error('upstream down'));
    const { res, state } = makeRes();
    await handler(makeReq(), res);
    expect(state.statusCode).toBe(500);
    expect(state.jsonBody).toEqual({ success: false, error: expect.any(String) });
  });

  it('writes an error event for an empty model response', async () => {
    generateContentStream.mockImplementation(async function* () {
      yield { candidates: [] };
    });
    const { res, state } = makeRes();
    await handler(makeReq(), res);
    const events = parseEvents(state.written);
    expect(events[0].type).toBe('error');
    expect(events[0].message).toContain('Empty response');
  });
});

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('allows up to the limit then blocks the same IP (Test 12)', () => {
    const req = makeReq();
    for (let i = 0; i < 10; i++) {
      expect(isRateLimited(req)).toBe(false);
    }
    expect(isRateLimited(req)).toBe(true);
  });

  it('treats different IPs independently', () => {
    const a = makeReq();
    const b = makeReq({ headers: { 'x-forwarded-for': '9.9.9.9' } });
    for (let i = 0; i < 10; i++) isRateLimited(a);
    expect(isRateLimited(a)).toBe(true);
    expect(isRateLimited(b)).toBe(false);
  });
});

describe('analytics', () => {
  beforeEach(() => {
    resetAnalytics();
  });

  it('detects topics from questions', () => {
    expect(detectTopic('Tell me about Vault')).toBe('projects');
    expect(detectTopic('Does Suan know React?')).toBe('skills');
    expect(detectTopic('Where did Suan work?')).toBe('experience');
    expect(detectTopic('What is Suan studying?')).toBe('education');
    expect(detectTopic('Is Suan available for hire?')).toBe('availability');
    expect(detectTopic('random unrelated text')).toBeNull();
  });

  it('tracks totals, errors, avg latency, and popular topics', () => {
    recordAnalytics('Tell me about Vault', { ok: true, durationMs: 200 });
    recordAnalytics('What is Suan studying?', { ok: true, durationMs: 400 });
    recordAnalytics('broken request', { ok: false, durationMs: 100 });

    const s = getAnalytics();
    expect(s.total).toBe(3);
    expect(s.questionsToday).toBe(3);
    expect(s.questionsThisMonth).toBe(3);
    expect(s.avgResponseTimeMs).toBe(Math.round((200 + 400 + 100) / 3));
    expect(s.errorRate).toBeCloseTo(1 / 3);
    expect(s.popularTopics).toHaveLength(2);
    expect(s.popularTopics[0].name).toBe('projects');
    expect(s.popularTopics[0].count).toBe(1);
  });

  it('does not count untagged messages as topics', () => {
    recordAnalytics('hello there', { ok: true, durationMs: 10 });
    const s = getAnalytics();
    expect(s.popularTopics).toHaveLength(0);
    expect(s.total).toBe(1);
  });
});

describe('knowledge base + prompt', () => {
  it('loads all knowledge files with expected profile', () => {
    const knowledge = loadKnowledge();
    expect(knowledge.profile.name).toBe('Suan KC');
    expect(knowledge.projects.some((p) => p.id === 'vault')).toBe(true);
    expect(knowledge.education.length).toBeGreaterThan(0);
  });

  it('prompt includes anti-hallucination and injection rules', () => {
    const prompt = buildSystemPrompt(loadKnowledge());
    expect(prompt).toContain('NO HALLUCINATION');
    expect(prompt).toContain('PROMPT INJECTION');
    expect(prompt).toContain('REFERENCE:project:');
    expect(prompt).toContain('Suan KC');
  });

  it('questions.json evaluation dataset is valid', () => {
    const questions = JSON.parse(readFileSync(join(process.cwd(), 'tests', 'ai', 'questions.json'), 'utf-8'));
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThanOrEqual(8);
    for (const q of questions) {
      expect(typeof q.question).toBe('string');
      expect(q.question.length).toBeGreaterThan(0);
    }
  });
});