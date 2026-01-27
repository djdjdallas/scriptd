/**
 * Supadata API Rate Limiter
 *
 * Provides proactive rate limiting for Supadata API calls to prevent 429 errors.
 * Uses a sliding window approach with configurable limits.
 */

import { SUPADATA_RATE_LIMITS } from '@/lib/constants';

// Track request timestamps for sliding window rate limiting
const requestTimestamps = [];
let activeRequests = 0;
let lastRequestTime = 0;

/**
 * Wait until it's safe to make a request based on rate limits
 * @returns {Promise<void>}
 */
async function acquireSlot() {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute sliding window

  // Clean up old timestamps outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }

  // Check if we're at the per-minute limit
  if (requestTimestamps.length >= SUPADATA_RATE_LIMITS.REQUESTS_PER_MINUTE) {
    // Wait until the oldest request falls out of the window
    const waitTime = requestTimestamps[0] - windowStart + 100; // +100ms buffer
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return acquireSlot(); // Re-check after waiting
    }
  }

  // Check concurrent request limit
  if (activeRequests >= SUPADATA_RATE_LIMITS.MAX_CONCURRENT) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 200));
    return acquireSlot();
  }

  // Enforce minimum delay between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < SUPADATA_RATE_LIMITS.INTER_REQUEST_DELAY_MS) {
    await new Promise(resolve =>
      setTimeout(resolve, SUPADATA_RATE_LIMITS.INTER_REQUEST_DELAY_MS - timeSinceLastRequest)
    );
  }

  // Acquire the slot
  activeRequests++;
  lastRequestTime = Date.now();
  requestTimestamps.push(lastRequestTime);
}

/**
 * Release a request slot after completion
 */
function releaseSlot() {
  activeRequests = Math.max(0, activeRequests - 1);
}

/**
 * Wrap an async function with Supadata rate limiting
 * @param {Function} fn - Async function to execute
 * @returns {Promise<any>} - Result of the function
 */
export async function withSupadataRateLimit(fn) {
  await acquireSlot();

  try {
    return await fn();
  } finally {
    releaseSlot();
  }
}

/**
 * Get current rate limiter status (for debugging/monitoring)
 * @returns {Object} - Current state of the rate limiter
 */
export function getSupadataRateLimiterStatus() {
  const now = Date.now();
  const windowStart = now - 60000;
  const recentRequests = requestTimestamps.filter(ts => ts >= windowStart);

  return {
    requestsInLastMinute: recentRequests.length,
    activeRequests,
    maxRequestsPerMinute: SUPADATA_RATE_LIMITS.REQUESTS_PER_MINUTE,
    maxConcurrent: SUPADATA_RATE_LIMITS.MAX_CONCURRENT,
    canMakeRequest: recentRequests.length < SUPADATA_RATE_LIMITS.REQUESTS_PER_MINUTE
                    && activeRequests < SUPADATA_RATE_LIMITS.MAX_CONCURRENT
  };
}

export default {
  withSupadataRateLimit,
  getSupadataRateLimiterStatus
};
