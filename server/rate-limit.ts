interface Bucket {
  timestamps: number[];
  blockUntil: number;
}

type RequestLike = { headers: Record<string, string | string[] | undefined> };

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockMs: number;
}

export const RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 10,
  blockMs: 30_000,
};

export function getClientIp(req: RequestLike): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') {
    const first = fwd.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp) return realIp;
  return req.headers['x-vercel-forwarded-for']?.toString().split(',')[0].trim() || 'unknown';
}

// Per-IP sliding window, in memory (per serverless instance)
export function createRateLimiter(config: RateLimitConfig) {
  const buckets = new Map<string, Bucket>();

  return {
    isLimited(req: RequestLike): boolean {
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

      bucket.timestamps = bucket.timestamps.filter((t) => now - t < config.windowMs);

      if (bucket.timestamps.length >= config.maxRequests) {
        bucket.blockUntil = now + config.blockMs;
        return true;
      }

      bucket.timestamps.push(now);
      return false;
    },

    remaining(req: RequestLike): number {
      const bucket = buckets.get(getClientIp(req));
      const now = Date.now();
      const recent = (bucket?.timestamps ?? []).filter((t) => now - t < config.windowMs).length;
      return Math.max(0, config.maxRequests - recent);
    },

    reset(): void {
      buckets.clear();
    },
  };
}

const chatLimiter = createRateLimiter(RATE_LIMIT);

export function isRateLimited(req: RequestLike): boolean {
  return chatLimiter.isLimited(req);
}

export function rateLimitHeaders(req: RequestLike): {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
} {
  return {
    'X-RateLimit-Limit': RATE_LIMIT.maxRequests,
    'X-RateLimit-Remaining': chatLimiter.remaining(req),
  };
}

export function resetRateLimits(): void {
  chatLimiter.reset();
}
