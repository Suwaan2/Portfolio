import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { sectionSchemas, SECTION_KEYS, type SectionKey } from '../shared/schema.js';
import { getEnv } from '../server/env.js';
import { createRateLimiter } from '../server/rate-limit.js';
import {
  SESSION_COOKIE,
  clearedSessionCookie,
  createSessionToken,
  readCookie,
  sessionCookie,
  verifyPassword,
  verifySessionToken,
} from '../server/admin-auth.js';
import { getAdminSections, saveSection } from '../server/content-store.js';
import { createUploadSignature } from '../server/cloudinary.js';

// One function for every admin action (keeps the Vercel function count down):
//   POST ?action=login            { password }
//   POST ?action=logout
//   GET  ?action=session
//   GET  ?action=content          every section with its version
//   PUT  ?action=section          { section, data, version }
//   POST ?action=upload-signature { kind: 'image' | 'resume' }
// Mutating requests must send `X-Admin-Request: 1`; browsers won't add a custom header
// to a cross-site request without a CORS preflight, which this endpoint never allows.

const loginLimiter = createRateLimiter({ windowMs: 15 * 60_000, maxRequests: 5, blockMs: 15 * 60_000 });

export function resetLoginLimits() {
  loginLimiter.reset();
}

const loginSchema = z.object({ password: z.string().min(1).max(200) });
const saveSchema = z.object({
  section: z.enum(SECTION_KEYS as [SectionKey, ...SectionKey[]]),
  data: z.unknown(),
  version: z.number().int().nonnegative(),
});
const uploadSchema = z.object({ kind: z.enum(['image', 'resume']) });

function issuesOf(error: z.ZodError) {
  return error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
}

function fail(res: VercelResponse, status: number, error: string, extra: Record<string, unknown> = {}) {
  return res.status(status).json({ success: false, error, ...extra });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  const passwordHash = getEnv('ADMIN_PASSWORD_HASH');
  const sessionSecret = getEnv('ADMIN_SESSION_SECRET');
  if (!passwordHash || !sessionSecret || sessionSecret.length < 32) {
    return fail(res, 503, 'Admin is not configured (set ADMIN_PASSWORD_HASH and a 32+ character ADMIN_SESSION_SECRET)');
  }

  const action = typeof req.query.action === 'string' ? req.query.action : '';
  const route = `${req.method} ${action}`;

  if (req.method !== 'GET' && req.headers['x-admin-request'] !== '1') {
    return fail(res, 403, 'Missing X-Admin-Request header');
  }

  if (route === 'POST login') {
    if (loginLimiter.isLimited(req)) return fail(res, 429, 'Too many login attempts. Try again in 15 minutes.');
    const body = loginSchema.safeParse(req.body);
    if (!body.success || !verifyPassword(body.data.password, passwordHash)) return fail(res, 401, 'Wrong password');
    res.setHeader('Set-Cookie', sessionCookie(createSessionToken(sessionSecret)));
    return res.status(200).json({ success: true });
  }

  if (route === 'POST logout') {
    res.setHeader('Set-Cookie', clearedSessionCookie());
    return res.status(200).json({ success: true });
  }

  const authenticated = verifySessionToken(readCookie(req.headers.cookie, SESSION_COOKIE), sessionSecret);

  if (route === 'GET session') {
    return res.status(200).json({ success: true, authenticated });
  }

  if (!authenticated) return fail(res, 401, 'Not logged in');

  try {
    if (route === 'GET content') {
      return res.status(200).json({ success: true, sections: await getAdminSections() });
    }

    if (route === 'PUT section') {
      const body = saveSchema.safeParse(req.body);
      if (!body.success) return fail(res, 400, 'Invalid request', { issues: issuesOf(body.error) });

      const { section, version } = body.data;
      const data = sectionSchemas[section].safeParse(body.data.data);
      if (!data.success) return fail(res, 400, `Some ${section} fields are invalid`, { issues: issuesOf(data.error) });

      const result = await saveSection(section, data.data, version);
      if (result.status === 'conflict') {
        return fail(res, 409, 'This section was changed somewhere else. Reload to get the latest version.', {
          version: result.version,
        });
      }
      return res.status(200).json({ success: true, version: result.version });
    }

    if (route === 'POST upload-signature') {
      const body = uploadSchema.safeParse(req.body);
      if (!body.success) return fail(res, 400, 'Invalid request', { issues: issuesOf(body.error) });

      const cloudName = getEnv('CLOUDINARY_CLOUD_NAME');
      const apiKey = getEnv('CLOUDINARY_API_KEY');
      const apiSecret = getEnv('CLOUDINARY_API_SECRET');
      if (!cloudName || !apiKey || !apiSecret) return fail(res, 503, 'Cloudinary is not configured');

      return res.status(200).json({ success: true, ...createUploadSignature(body.data.kind, { cloudName, apiKey, apiSecret }) });
    }
  } catch (err) {
    console.error('[admin]', route, err);
    return fail(res, 500, 'Something went wrong on the server. Check the function logs.');
  }

  return fail(res, 404, `Unknown admin action: ${route}`);
}
