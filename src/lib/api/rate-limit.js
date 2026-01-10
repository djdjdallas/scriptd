/**
 * Rate Limiting with Vercel KV
 *
 * Production-ready rate limiting using Vercel KV for persistence.
 * Includes fallback to in-memory for development/when KV is unavailable.
 * Supports tier-based rate limiting based on user subscription.
 *
 * Setup: Run `npm install @vercel/kv` and configure KV in Vercel dashboard.
 * See: https://vercel.com/docs/storage/vercel-kv/quickstart
 */

import { kv } from '@vercel/kv';
import { RATE_LIMITS } from '@/lib/constants';

// Configuration
const WINDOW_SECONDS = 60; // 1 minute window
const MAX_REQUESTS_FREE = RATE_LIMITS.FREE_USER.REQUESTS_PER_MINUTE;
const MAX_REQUESTS_PAID = RATE_LIMITS.PAID_USER.REQUESTS_PER_MINUTE;

// Per-feature rate limits (scripts per day, research per hour)
const DAILY_WINDOW_SECONDS = 86400; // 24 hours
const HOURLY_WINDOW_SECONDS = 3600; // 1 hour

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

/**
 * Check feature-specific rate limits (e.g., scripts per day)
 * @param {string} userId - User ID
 * @param {string} feature - Feature name ('scripts', 'research')
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {Promise<object>} Rate limit check result
 */
export async function checkFeatureRateLimit(userId, feature, subscriptionTier = 'free') {
  const isPaid = subscriptionTier && subscriptionTier !== 'free';
  const limits = isPaid ? RATE_LIMITS.PAID_USER : RATE_LIMITS.FREE_USER;

  let maxRequests;
  let windowSeconds;
  let identifier;

  switch (feature) {
    case 'scripts':
      maxRequests = limits.SCRIPTS_PER_DAY;
      windowSeconds = DAILY_WINDOW_SECONDS;
      identifier = `scripts:${userId}`;
      break;
    case 'research':
      maxRequests = limits.RESEARCH_PER_HOUR;
      windowSeconds = HOURLY_WINDOW_SECONDS;
      identifier = `research:${userId}`;
      break;
    default:
      // Default to per-minute rate limiting
      maxRequests = limits.REQUESTS_PER_MINUTE;
      windowSeconds = WINDOW_SECONDS;
      identifier = `general:${userId}`;
  }

  return checkRateLimit(identifier, { maxRequests, windowSeconds });
}

/**
 * Middleware wrapper for feature-specific rate limiting
 * Requires user authentication and applies tier-based limits
 */
export function withFeatureRateLimit(handler, options = {}) {
  const {
    feature = 'general',
    getUser = null // Function to extract user from request: (req) => { id, subscriptionTier }
  } = options;

  return async (req, ...args) => {
    // If no getUser function provided, fall back to IP-based rate limiting
    if (!getUser) {
      const forwarded = req.headers?.get?.('x-forwarded-for');
      const realIp = req.headers?.get?.('x-real-ip');
      const identifier = forwarded?.split(',')[0]?.trim() || realIp || req.ip || 'anonymous';
      const result = await checkRateLimit(identifier, {
        maxRequests: MAX_REQUESTS_FREE,
        windowSeconds: WINDOW_SECONDS
      });

      if (!result.success) {
        return Response.json(
          { error: result.error, code: 'RATE_LIMIT_EXCEEDED' },
          {
            status: 429,
            headers: {
              'Retry-After': String(result.retryAfter),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': '0'
            }
          }
        );
      }

      return handler(req, ...args);
    }

    // Get user info for tier-based rate limiting
    const user = await getUser(req);
    if (!user?.id) {
      // No user - use IP-based limiting with free tier limits
      const forwarded = req.headers?.get?.('x-forwarded-for');
      const realIp = req.headers?.get?.('x-real-ip');
      const identifier = forwarded?.split(',')[0]?.trim() || realIp || req.ip || 'anonymous';
      const result = await checkRateLimit(identifier, {
        maxRequests: MAX_REQUESTS_FREE,
        windowSeconds: WINDOW_SECONDS
      });

      if (!result.success) {
        return Response.json(
          { error: result.error, code: 'RATE_LIMIT_EXCEEDED' },
          { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
        );
      }

      return handler(req, ...args);
    }

    // Apply feature-specific rate limit based on user's subscription tier
    const result = await checkFeatureRateLimit(user.id, feature, user.subscriptionTier);

    if (!result.success) {
      const featureLabels = {
        scripts: 'scripts per day',
        research: 'research queries per hour',
        general: 'requests per minute'
      };

      return Response.json(
        {
          error: `Rate limit exceeded. You've reached your ${featureLabels[feature] || 'request'} limit.`,
          code: 'RATE_LIMIT_EXCEEDED',
          limit: result.limit,
          remaining: result.remaining,
          retryAfter: result.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }

    return handler(req, ...args);
  };
}