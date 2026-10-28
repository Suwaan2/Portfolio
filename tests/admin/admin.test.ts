import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createSessionToken,
  hashPassword,
  readCookie,
  verifyPassword,
  verifySessionToken,
  SESSION_TTL_MS,
} from '../../server/admin-auth';
import { createUploadSignature, signParams } from '../../server/cloudinary';
import { loadContent } from '../../server/knowledge';

// In-memory stand-ins for the three collections the admin uses
type ContentDoc = { _id: string; data: unknown; version: number; updatedAt: Date };
type HistoryDoc = { _id: number; section: string; version: number; data: unknown; savedAt: Date };
type FailureDoc = { ipHash: string; at: Date };

const content = new Map<string, ContentDoc>();
let history: HistoryDoc[] = [];
let failures: FailureDoc[] = [];
let dbDown = false;

const contentCollection = {
  find: () => ({ toArray: async () => [...content.values()] }),
  findOne: async (q: { _id: string }) => content.get(q._id) ?? null,
  insertOne: async (doc: ContentDoc) => {
    if (content.has(doc._id)) throw Object.assign(new Error('duplicate key'), { code: 11000 });
    content.set(doc._id, doc);
  },
  findOneAndUpdate: async (q: { _id: string; version: number }, u: { $set: { data: unknown; updatedAt: Date } }) => {
    const doc = content.get(q._id);
    if (!doc || doc.version !== q.version) return null;
    const before = { ...doc };
    Object.assign(doc, u.$set, { version: doc.version + 1 });
    return before;
  },
};

const historyCollection = {
  insertOne: async (doc: Omit<HistoryDoc, '_id'>) => void history.push({ ...doc, _id: history.length + 1 }),
  find: (q: { section: string }) => {
    let rows = history.filter((h) => h.section === q.section);
    const cursor = {
      sort: () => ((rows = [...rows].sort((a, b) => b.version - a.version)), cursor),
      skip: (n: number) => ((rows = rows.slice(n)), cursor),
      limit: (n: number) => ((rows = rows.slice(0, n)), cursor),
      project: () => cursor,
      toArray: async () => rows,
    };
    return cursor;
  },
  deleteMany: async (q: { _id: { $in: number[] } }) => void (history = history.filter((h) => !q._id.$in.includes(h._id))),
};

const failuresCollection = {
  createIndex: async () => 'at_1',
  countDocuments: async (q: { ipHash: string; at: { $gte: Date } }) => failures.filter((f) => f.ipHash === q.ipHash && f.at >= q.at.$gte).length,
  insertOne: async (doc: FailureDoc) => void failures.push(doc),
  deleteMany: async (q: { ipHash: string }) => void (failures = failures.filter((f) => f.ipHash !== q.ipHash)),
};

const collections: Record<string, unknown> = { content: contentCollection, content_history: historyCollection, login_failures: failuresCollection };

vi.mock('../../server/db', () => ({
  getDb: async () => {
    if (dbDown) throw new Error('connection refused');
    return { collection: (name: string) => collections[name] };
  },
}));

import handler from '../../api/admin';
import { resetLoginFailures, MAX_LOGIN_FAILURES } from '../../server/login-guard';

const PASSWORD = 'correct horse battery staple';
const SECRET = 'test-session-secret-that-is-long-enough-123';

beforeAll(() => {
  process.env.ADMIN_PASSWORD_HASH = hashPassword(PASSWORD);
  process.env.ADMIN_SESSION_SECRET = SECRET;
  process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  process.env.CLOUDINARY_API_KEY = 'demo-key';
  process.env.CLOUDINARY_API_SECRET = 'demo-secret';
});

beforeEach(() => {
  content.clear();
  history = [];
  failures = [];
  dbDown = false;
  resetLoginFailures();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function makeRes() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- response bodies differ per action
  const state = { status: 0, headers: {} as Record<string, unknown>, body: undefined as any };
  const res = {
    setHeader: (k: string, v: unknown) => ((state.headers[k] = v), res),
    status: (s: number) => ((state.status = s), res),
    json: (b: unknown) => ((state.body = b), res),
  };
  return { res: res as unknown as VercelResponse, state };
}

async function call(
  method: string,
  action: string,
  opts: { body?: unknown; cookie?: string; csrf?: boolean; ip?: string; query?: Record<string, string> } = {},
) {
  const headers: Record<string, string> = { 'x-forwarded-for': opts.ip ?? '9.9.9.9' };
  if (opts.csrf !== false && method !== 'GET') headers['x-admin-request'] = '1';
  if (opts.cookie) headers.cookie = opts.cookie;
  const { res, state } = makeRes();
  await handler({ method, query: { action, ...opts.query }, headers, body: opts.body } as unknown as VercelRequest, res);
  return state;
}

const loggedIn = () => `admin_session=${createSessionToken(SECRET)}`;
const wrongLogin = (ip?: string) => call('POST', 'login', { body: { password: 'nope' }, ip });
const rightLogin = (ip?: string) => call('POST', 'login', { body: { password: PASSWORD }, ip });

describe('password and session helpers', () => {
  it('verifies only the right password', () => {
    const stored = hashPassword('s3cret-password');
    expect(verifyPassword('s3cret-password', stored)).toBe(true);
    expect(verifyPassword('wrong', stored)).toBe(false);
    expect(verifyPassword('s3cret-password', 'garbage')).toBe(false);
  });

  it('rejects tampered, foreign and expired session tokens', () => {
    const now = Date.now();
    const token = createSessionToken(SECRET, now);
    expect(verifySessionToken(token, SECRET, now)).toBe(true);
    expect(verifySessionToken(token.replace(/^\d+/, String(now + 10 * SESSION_TTL_MS)), SECRET, now)).toBe(false);
    expect(verifySessionToken(token, 'another-secret-another-secret-123', now)).toBe(false);
    expect(verifySessionToken(token, SECRET, now + SESSION_TTL_MS + 1)).toBe(false);
    expect(verifySessionToken(undefined, SECRET)).toBe(false);
  });

  it('reads a cookie by name', () => {
    expect(readCookie('a=1; admin_session=abc.def; b=2', 'admin_session')).toBe('abc.def');
    expect(readCookie(undefined, 'admin_session')).toBeUndefined();
  });
});

describe('login', () => {
  it('rejects a wrong password and sets no cookie', async () => {
    const r = await wrongLogin();
    expect(r.status).toBe(401);
    expect(r.headers['Set-Cookie']).toBeUndefined();
  });

  it('sets a secure HttpOnly session cookie for the right password', async () => {
    const r = await rightLogin();
    expect(r.status).toBe(200);
    const cookie = String(r.headers['Set-Cookie']);
    expect(cookie).toMatch(/^admin_session=\d+\./);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
  });

  it(`blocks an IP after ${MAX_LOGIN_FAILURES} failures, even with the right password`, async () => {
    for (let i = 0; i < MAX_LOGIN_FAILURES; i++) await wrongLogin();
    expect((await rightLogin()).status).toBe(429);
    // Other IPs are unaffected
    expect((await rightLogin('1.2.3.4')).status).toBe(200);
  });

  it('does not count successful logins, and a success clears earlier failures', async () => {
    for (let i = 0; i < 10; i++) expect((await rightLogin()).status).toBe(200);
    for (let i = 0; i < MAX_LOGIN_FAILURES - 1; i++) await wrongLogin();
    expect((await rightLogin()).status).toBe(200);
    for (let i = 0; i < MAX_LOGIN_FAILURES - 1; i++) await wrongLogin();
    expect((await rightLogin()).status).toBe(200);
  });

  it('stores failures in the database (shared by all instances) and never the raw IP', async () => {
    await wrongLogin('203.0.113.7');
    expect(failures).toHaveLength(1);
    expect(JSON.stringify(failures)).not.toContain('203.0.113.7');
  });

  it('still limits logins when the database is down', async () => {
    dbDown = true;
    for (let i = 0; i < MAX_LOGIN_FAILURES; i++) await wrongLogin();
    expect((await rightLogin()).status).toBe(429);
  });

  it('requires the X-Admin-Request header on writes', async () => {
    const r = await call('POST', 'login', { body: { password: PASSWORD }, csrf: false });
    expect(r.status).toBe(403);
  });

  it('reports the session state', async () => {
    expect((await call('GET', 'session')).body.authenticated).toBe(false);
    expect((await call('GET', 'session', { cookie: loggedIn() })).body.authenticated).toBe(true);
  });
});

describe('content editing', () => {
  const save = (data: unknown, version: number, section = 'availability') =>
    call('PUT', 'section', { cookie: loggedIn(), body: { section, data, version } });

  it('requires login', async () => {
    expect((await call('GET', 'content')).status).toBe(401);
    expect((await call('PUT', 'section', { body: { section: 'availability', data: {}, version: 0 } })).status).toBe(401);
    expect((await call('GET', 'history', { query: { section: 'availability' } })).status).toBe(401);
  });

  it('returns every section, using the file copy (version 0) for ones not in the database', async () => {
    const r = await call('GET', 'content', { cookie: loggedIn() });
    expect(r.status).toBe(200);
    expect(r.body.sections.profile).toEqual({ data: loadContent().profile, version: 0, updatedAt: null });
  });

  it('rejects invalid data with field-level issues', async () => {
    const r = await save({ email: 'not-an-email' }, 0, 'contact');
    expect(r.status).toBe(400);
    expect(r.body.issues).toContainEqual(expect.objectContaining({ path: 'email' }));
  });

  it('reports empty required fields as "Required"', async () => {
    const r = await save({ available: true, message: '  ' }, 0);
    expect(r.body.issues).toContainEqual({ path: 'message', message: 'Required' });
  });

  it('saves and bumps the version, then rejects a stale save', async () => {
    const data = { available: false, message: 'Booked until March' };
    expect((await save(data, 0)).body.version).toBe(1);
    expect((await save(data, 1)).body.version).toBe(2);

    // An editor still holding version 1 must not overwrite version 2
    const stale = await save(data, 1);
    expect(stale.status).toBe(409);
    expect(stale.body.version).toBe(2);
    expect(content.get('availability')?.version).toBe(2);
  });

  it('keeps each replaced version in the history, newest first', async () => {
    await save({ available: true, message: 'First' }, 0);
    await save({ available: true, message: 'Second' }, 1);
    await save({ available: false, message: 'Third' }, 2);

    const r = await call('GET', 'history', { cookie: loggedIn(), query: { section: 'availability' } });
    expect(r.status).toBe(200);
    expect(r.body.history.map((h: { version: number; data: { message: string } }) => [h.version, h.data.message])).toEqual([
      [2, 'Second'],
      [1, 'First'],
    ]);
  });

  it('keeps at most 20 history entries per section', async () => {
    await save({ available: true, message: 'v1' }, 0);
    for (let v = 1; v <= 25; v++) await save({ available: true, message: `v${v + 1}` }, v);
    const r = await call('GET', 'history', { cookie: loggedIn(), query: { section: 'availability' } });
    expect(r.body.history).toHaveLength(20);
    expect(r.body.history[0].version).toBe(25);
  });

  it('rejects an unknown section', async () => {
    expect((await save({}, 0, 'passwords')).status).toBe(400);
    expect((await call('GET', 'history', { cookie: loggedIn(), query: { section: 'passwords' } })).status).toBe(400);
  });
});

describe('uploads', () => {
  it('signs parameters the way Cloudinary expects', () => {
    // Example from Cloudinary's signature docs
    expect(signParams({ timestamp: 1315060510, public_id: 'sample_image', eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop' }, 'abcd')).toBe(
      'bfd09f95f331f558cbd1320e67aa8d488770583e',
    );
  });

  it('gives resume uploads a .pdf public id so the file downloads as a PDF', () => {
    const sig = createUploadSignature('resume', { cloudName: 'c', apiKey: 'k', apiSecret: 's' }, 1_700_000_000_000);
    expect(sig.uploadUrl).toBe('https://api.cloudinary.com/v1_1/c/raw/upload');
    expect(sig.fields.public_id).toBe('resume-1700000000.pdf');
    expect(sig.fields.signature).toBe(signParams({ folder: 'portfolio/resume', timestamp: 1_700_000_000, public_id: 'resume-1700000000.pdf' }, 's'));
  });

  it('returns a signed upload for logged-in users only', async () => {
    expect((await call('POST', 'upload-signature', { body: { kind: 'image' } })).status).toBe(401);
    const r = await call('POST', 'upload-signature', { cookie: loggedIn(), body: { kind: 'image' } });
    expect(r.status).toBe(200);
    expect(r.body.uploadUrl).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    expect(r.body.fields).toMatchObject({ api_key: 'demo-key', folder: 'portfolio/images' });
    expect(r.body.fields).not.toHaveProperty('public_id');
    expect(r.body.fields).not.toHaveProperty('api_secret');
  });
});

describe('configuration', () => {
  it('refuses to run without admin secrets', async () => {
    const saved = process.env.ADMIN_SESSION_SECRET;
    process.env.ADMIN_SESSION_SECRET = 'short';
    expect((await call('GET', 'session')).status).toBe(503);
    process.env.ADMIN_SESSION_SECRET = saved;
  });
});
