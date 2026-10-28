import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getContent } from '../server/content-store.js';

// Public, read-only: all portfolio sections in one request.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // The CDN already caches this response; a second in-memory cache would add up to a minute of staleness
  const { content, source } = await getContent({ fresh: true });
  // Only Vercel's CDN caches (edits show up within about a minute); browsers always re-check,
  // otherwise a visitor's own cached copy could outlive an edit
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('Vercel-CDN-Cache-Control', 'max-age=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Source', source);
  return res.status(200).json({ success: true, data: content });
}
