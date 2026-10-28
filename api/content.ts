import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getContent } from '../server/content-store.js';

// Public, read-only: all portfolio sections in one request.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { content, source } = await getContent();
  // Vercel's edge cache serves most visitors; edits show up within about a minute
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Source', source);
  return res.status(200).json({ success: true, data: content });
}
