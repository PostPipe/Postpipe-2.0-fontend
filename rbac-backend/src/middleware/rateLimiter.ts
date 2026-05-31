/**
 * Rate Limiter Middleware
 *
 * Per-project sliding-window rate limiting.
 * In-memory implementation, upgradeable to Redis.
 */

import type { Response, NextFunction } from 'express';
import type { PostpipeRequest } from '../types';

interface RateBucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, RateBucket>();

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100;
const LOGIN_MAX_REQUESTS = 10; // Stricter for login

// Cleanup stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStart > DEFAULT_WINDOW_MS * 2) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * General rate limiter: 100 requests/min per project+IP.
 */
export const rateLimiter = (
  req: PostpipeRequest,
  res: Response,
  next: NextFunction
): void => {
  const projectId = (req.headers['x-project-id'] as string) || 'unknown';
  const ip = req.ip || 'unknown';
  const key = `${projectId}:${ip}`;

  applyLimit(key, DEFAULT_MAX_REQUESTS, req, res, next);
};

/**
 * Login-specific rate limiter: 10 attempts/min per project+IP.
 */
export const loginRateLimiter = (
  req: PostpipeRequest,
  res: Response,
  next: NextFunction
): void => {
  const projectId = (req.headers['x-project-id'] as string) || 'unknown';
  const ip = req.ip || 'unknown';
  const key = `login:${projectId}:${ip}`;

  applyLimit(key, LOGIN_MAX_REQUESTS, req, res, next);
};

function applyLimit(
  key: string,
  maxRequests: number,
  _req: PostpipeRequest,
  res: Response,
  next: NextFunction
): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > DEFAULT_WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    next();
    return;
  }

  bucket.count++;

  if (bucket.count > maxRequests) {
    const retryAfter = Math.ceil(
      (bucket.windowStart + DEFAULT_WINDOW_MS - now) / 1000
    );
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({
      error: 'Too many requests',
      retryAfterSeconds: retryAfter,
    });
    return;
  }

  next();
}
