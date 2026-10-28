import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnalytics } from '../../server/analytics.js';
import { getEnv } from '../../server/env.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const key = getEnv('ANALYTICS_KEY');
  if (key) {
    const auth = req.headers.authorization ?? '';
    const supplied = auth.replace(/^Bearer\s+/i, '').trim();
    if (supplied !== key) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }

  return res.status(200).json({ success: true, ...getAnalytics() });
}