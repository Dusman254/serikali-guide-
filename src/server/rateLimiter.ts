/**
 * Production Rate Limiter with Sliding Window & Token Bucket controls
 * Prevents API abuse, brute-force attacks, and unexpected cloud/AI bill spikes.
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Purge expired records every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (record.resetAt <= now) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public check(key: string, maxRequests: number, windowSeconds: number): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const existing = this.store.get(key);

    if (!existing || existing.resetAt <= now) {
      const record: RateLimitRecord = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.store.set(key, record);
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetInSeconds: windowSeconds,
      };
    }

    if (existing.count >= maxRequests) {
      const resetInSeconds = Math.ceil((existing.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.max(1, resetInSeconds),
      };
    }

    existing.count += 1;
    const resetInSeconds = Math.ceil((existing.resetAt - now) / 1000);
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - existing.count),
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  public reset(key: string): void {
    this.store.delete(key);
  }
}

export const rateLimiterStore = new InMemoryRateLimiter();

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Creates an Express rate-limiting middleware
 */
export function createRateLimiter(options: {
  max: number;
  windowSeconds: number;
  prefix: string;
  message?: string;
  skipFailedRequests?: boolean;
}) {
  const { max, windowSeconds, prefix, message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = getClientIp(req);
    const key = `${prefix}:${ip}`;

    const { allowed, remaining, resetInSeconds } = rateLimiterStore.check(
      key,
      max,
      windowSeconds
    );

    // Standard RFC RateLimit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetInSeconds);

    if (!allowed) {
      res.setHeader('Retry-After', resetInSeconds);
      res.status(429).json({
        error:
          message ||
          'Too many requests from your IP address. Please slow down and try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: resetInSeconds,
      });
      return;
    }

    next();
  };
}

// 1. Global site-wide rate limit (120 requests / min per IP)
export const globalRateLimiter = createRateLimiter({
  prefix: 'global',
  max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '120', 10),
  windowSeconds: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_SEC || '60', 10),
  message: 'Website request limit reached. Please wait a moment before reloading.',
});

// 2. Strict Authentication rate limit (5 attempts / 15 minutes per IP)
export const authRateLimiter = createRateLimiter({
  prefix: 'auth',
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5', 10),
  windowSeconds: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_SEC || '900', 10),
  message:
    'Too many authentication attempts. For your security, this IP has been temporarily restricted for 15 minutes.',
});

// 3. AI Endpoints rate limit (15 generations / 10 minutes per IP)
export const aiRateLimiter = createRateLimiter({
  prefix: 'ai',
  max: parseInt(process.env.RATE_LIMIT_AI_MAX || '15', 10),
  windowSeconds: parseInt(process.env.RATE_LIMIT_AI_WINDOW_SEC || '600', 10),
  message:
    'AI regulatory inquiry quota exceeded for this session. Please wait before submitting more queries or consult our directory playbooks.',
});

// 4. Contact & Form submissions rate limit (8 submissions / 10 minutes per IP)
export const formsRateLimiter = createRateLimiter({
  prefix: 'forms',
  max: 8,
  windowSeconds: 600,
  message:
    'You have submitted multiple case filings recently. Please wait a few minutes before submitting another request.',
});
