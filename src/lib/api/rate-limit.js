/**
 * Rate Limiting with Vercel KV
 *
 * Production-ready rate limiting using Vercel KV for persistence.
 * Includes fallback to in-memory for development/when KV is unavailable.
 *
 * Setup: Run `npm install @vercel/kv` and configure KV in Vercel dashboard.
 * See: https://vercel.com/docs/storage/vercel-kv/quickstart
 */

import { kv } from '@vercel/kv';

// Configuration
const WINDOW_SECONDS = 60; // 1 minute window
const MAX_REQUESTS_FREE = 10;
const MAX_REQUESTS_PAID = 60;

// In-memory fallback (for development or if KV unavailable)
const localRateLimit = new Map();

/**
 * Check rate limit using Vercel KV (with local fallback)
 */
export async function checkRateLimit(identifier, options = {}) {
  const { maxRequests = MAX_REQUESTS_FREE, windowSeconds = WINDOW_SECONDS } = options;

  // Try Vercel KV first
  if (process.env.KV_REST_API_URL) {
    try {
      return await checkRateLimitKV(identifier, maxRequests, windowSeconds);
    } catch (error) {
      console.warn('KV rate limit failed, using fallback:', error.message);
      // Fall through to local implementation
    }
  }

  // Fallback to local rate limiting
  return checkRateLimitLocal(identifier, maxRequests, windowSeconds);
}

/**
 * Vercel KV-based rate limiting (persistent across serverless invocations)
 */
async function checkRateLimitKV(identifier, maxRequests, windowSeconds) {
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Use Redis sorted set for sliding window
  // Remove old entries and add current request in a pipeline
  const pipeline = kv.pipeline();

  // Remove entries outside the window
  pipeline.zremrangebyscore(key, 0, windowStart);
  // Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  // Count requests in window
  pipeline.zcard(key);
  // Set expiry
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const requestCount = results[2]; // zcard result

  if (requestCount > maxRequests) {
    // Get oldest request to calculate retry time
    const oldest = await kv.zrange(key, 0, 0, { withScores: true });
    const retryAfter = oldest.length > 0
      ? Math.max(1, windowSeconds - (now - Math.floor(oldest[0].score)))
      : windowSeconds;

    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter,
      remaining: 0,
      limit: maxRequests
    };
  }

  return {
    success: true,
    remaining: maxRequests - requestCount,
    limit: maxRequests
  };
}

/**
 * Local in-memory rate limiting (fallback)
 */
function checkRateLimitLocal(identifier, maxRequests, windowSeconds) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const userRateLimit = localRateLimit.get(identifier);

  if (!userRateLimit) {
    localRateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1, limit: maxRequests };
  }

  if (now > userRateLimit.resetTime) {
    userRateLimit.count = 1;
    userRateLimit.resetTime = now + windowMs;
    return { success: true, remaining: maxRequests - 1, limit: maxRequests };
  }

  if (userRateLimit.count >= maxRequests) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((userRateLimit.resetTime - now) / 1000),
      remaining: 0,
      limit: maxRequests
    };
  }

  userRateLimit.count++;
  return {
    success: true,
    remaining: maxRequests - userRateLimit.count,
    limit: maxRequests
  };
}

// Clean up local entries periodically (development only)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of localRateLimit.entries()) {
      if (now > value.resetTime + WINDOW_SECONDS * 1000) {
        localRateLimit.delete(key);
      }
    }
  }, WINDOW_SECONDS * 2000);
}

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(handler, options = {}) {
  const {
    getIdentifier = (req) => {
      // Try to get real IP from headers (Vercel/Cloudflare)
      const forwarded = req.headers?.get?.('x-forwarded-for');
      const realIp = req.headers?.get?.('x-real-ip');
      return forwarded?.split(',')[0]?.trim() || realIp || req.ip || 'anonymous';
    },
    maxRequests = MAX_REQUESTS_FREE,
    windowSeconds = WINDOW_SECONDS
  } = options;

  return async (req, ...args) => {
    const identifier = getIdentifier(req);
    const result = await checkRateLimit(identifier, { maxRequests, windowSeconds });

    if (!result.success) {
      return Response.json(
        { error: result.error },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + result.retryAfter)
          }
        }
      );
    }

    return handler(req, ...args);
  };
}

/**
 * Get appropriate rate limit based on user subscription
 */
export function getRateLimitForUser(subscriptionTier) {
  return subscriptionTier && subscriptionTier !== 'free'
    ? MAX_REQUESTS_PAID
    : MAX_REQUESTS_FREE;
}