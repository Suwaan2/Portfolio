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

// In-memory stand-in for the `content` collection
type Doc = { _id: string; data: unknown; version: number; updatedAt: Date };
const docs = new Map<string, Doc>();
const collection = {
  find: () => ({ toArray: async () => [...docs.values()] }),
  findOne: async (q: { _id: string }) => docs.get(q._id) ?? null,
  insertOne: async (doc: Doc) => {
    if (docs.has(doc._id)) throw Object.assign(new Error('duplicate key'), { code: 11000 });
    docs.set(doc._id, doc);
  },
  findOneAndUpdate: async (q: { _id: string; version: number }, u: { $set: { data: unknown; updatedAt: Date } }) => {
    const doc = docs.get(q._id);
    if (!doc || doc.version !== q.version) return null;
    Object.assign(doc, u.$set, { version: doc.version + 1 });
    return doc;
  },
};
vi.mock('../../server/db', () => ({ getDb: async () => ({ collection: () => collection }) }));

import handler, { resetLoginLimits } from '../../api/admin';

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
  docs.clear();
  resetLoginLimits();
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

async function call(method: string, action: string, opts: { body?: unknown; cookie?: string; csrf?: boolean } = {}) {
  const headers: Record<string, string> = { 'x-forwarded-for': '9.9.9.9' };
  if (opts.csrf !== false && method !== 'GET') headers['x-admin-request'] = '1';
  if (opts.cookie) headers.cookie = opts.cookie;
  const { res, state } = makeRes();
  await handler({ method, query: { action }, headers, body: opts.body } as unknown as VercelRequest, res);
  return state;
}

const loggedIn = () => `admin_session=${createSessionToken(SECRET)}`;

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
    const r = await call('POST', 'login', { body: { password: 'nope' } });
    expect(r.status).toBe(401);
    expect(r.headers['Set-Cookie']).toBeUndefined();
  });

  it('sets a secure HttpOnly session cookie for the right password', async () => {
    const r = await call('POST', 'login', { body: { password: PASSWORD } });
    expect(r.status).toBe(200);
    const cookie = String(r.headers['Set-Cookie']);
    expect(cookie).toMatch(/^admin_session=\d+\./);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
  });

  it('blocks after 5 attempts', async () => {
    for (let i = 0; i < 5; i++) await call('POST', 'login', { body: { password: 'nope' } });
    const r = await call('POST', 'login', { body: { password: PASSWORD } });
    expect(r.status).toBe(429);
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
  it('requires login', async () => {
    expect((await call('GET', 'content')).status).toBe(401);
    expect((await call('PUT', 'section', { body: { section: 'availability', data: {}, version: 0 } })).status).toBe(401);
  });

  it('returns every section, using the file copy (version 0) for ones not in the database', async () => {
    const r = await call('GET', 'content', { cookie: loggedIn() });
    expect(r.status).toBe(200);
    expect(r.body.sections.profile).toEqual({ data: loadContent().profile, version: 0, updatedAt: null });
  });

  it('rejects invalid data with field-level issues', async () => {
    const r = await call('PUT', 'section', {
      cookie: loggedIn(),
      body: { section: 'contact', data: { email: 'not-an-email' }, version: 0 },
    });
    expect(r.status).toBe(400);
    expect(r.body.issues).toContainEqual(expect.objectContaining({ path: 'email' }));
  });

  it('saves and bumps the version, then rejects a stale save', async () => {
    const data = { available: false, message: 'Booked until March' };
    const first = await call('PUT', 'section', { cookie: loggedIn(), body: { section: 'availability', data, version: 0 } });
    expect(first.status).toBe(200);
    expect(first.body.version).toBe(1);

    const second = await call('PUT', 'section', { cookie: loggedIn(), body: { section: 'availability', data, version: 1 } });
    expect(second.body.version).toBe(2);

    // An editor still holding version 1 must not overwrite version 2
    const stale = await call('PUT', 'section', { cookie: loggedIn(), body: { section: 'availability', data, version: 1 } });
    expect(stale.status).toBe(409);
    expect(stale.body.version).toBe(2);
    expect(docs.get('availability')?.version).toBe(2);
  });

  it('rejects an unknown section', async () => {
    const r = await call('PUT', 'section', { cookie: loggedIn(), body: { section: 'passwords', data: {}, version: 0 } });
    expect(r.status).toBe(400);
  });
});

describe('uploads', () => {
  it('signs folder and timestamp the way Cloudinary expects', () => {
    // Example from Cloudinary's signature docs
    expect(signParams({ timestamp: 1315060510, public_id: 'sample_image', eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop' }, 'abcd')).toBe(
      'bfd09f95f331f558cbd1320e67aa8d488770583e',
    );
    const sig = createUploadSignature('resume', { cloudName: 'c', apiKey: 'k', apiSecret: 's' }, 1_700_000_000_000);
    expect(sig.uploadUrl).toBe('https://api.cloudinary.com/v1_1/c/raw/upload');
    expect(sig.fields.signature).toBe(signParams({ folder: 'portfolio/resume', timestamp: 1_700_000_000 }, 's'));
  });

  it('returns a signed upload for logged-in users only', async () => {
    expect((await call('POST', 'upload-signature', { body: { kind: 'image' } })).status).toBe(401);
    const r = await call('POST', 'upload-signature', { cookie: loggedIn(), body: { kind: 'image' } });
    expect(r.status).toBe(200);
    expect(r.body.uploadUrl).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    expect(r.body.fields).toMatchObject({ api_key: 'demo-key', folder: 'portfolio/images' });
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
