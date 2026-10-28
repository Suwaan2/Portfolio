interface Bucket {
  timestamps: number[];
  blockUntil: number;
}

const buckets = new Map<string, Bucket>();

export const RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 10,
  blockMs: 30_000,
};

function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') {
    const first = fwd.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp) return realIp;
  return req.headers['x-vercel-forwarded-for']?.toString().split(',')[0].trim() || 'unknown';
}

export function isRateLimited(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const ip = getClientIp(req);
  const now = Date.now();

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { timestamps: [], blockUntil: 0 };
    buckets.set(ip, bucket);
  }

  if (bucket.blockUntil > now) {
    return true;
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_LIMIT.windowMs);

  if (bucket.timestamps.length >= RATE_LIMIT.maxRequests) {
    bucket.blockUntil = now + RATE_LIMIT.blockMs;
    return true;
  }

  bucket.timestamps.push(now);
  return false;
}

export function rateLimitHeaders(req: { headers: Record<string, string | string[] | undefined> }): {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
} {
  const ip = getClientIp(req);
  const bucket = buckets.get(ip);
  const now = Date.now();
  const recent = (bucket?.timestamps ?? []).filter((t) => now - t < RATE_LIMIT.windowMs).length;
  return {
    'X-RateLimit-Limit': RATE_LIMIT.maxRequests,
    'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT.maxRequests - recent),
  };
}

export function resetRateLimits(): void {
  buckets.clear();
}