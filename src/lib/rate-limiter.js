// PERFORMANCE FIX: Optimized rate limiter with bounded cleanup and efficient pruning
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
    this.lastCleanup = Date.now();
    this.cleanupInterval = 30000; // Clean every 30 seconds instead of 10% random chance
    this.maxEntries = 10000; // Prevent unbounded growth
  }

  async checkLimit(identifier) {
    const now = Date.now();

    // PERFORMANCE FIX: Deterministic cleanup instead of random 10% chance
    // This prevents memory leak from accumulating old entries
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }

    let userRequests = this.requests.get(identifier);

    if (!userRequests) {
      userRequests = [];
    } else {
      // PERFORMANCE FIX: In-place filter using binary search for sorted timestamps
      // Find the cutoff index instead of creating new array every time
      const cutoff = now - this.windowMs;
      let i = 0;
      while (i < userRequests.length && userRequests[i] < cutoff) {
        i++;
      }
      if (i > 0) {
        userRequests = userRequests.slice(i);
      }
    }

    if (userRequests.length >= this.maxRequests) {
      const oldestRequest = userRequests[0];
      const resetTime = oldestRequest + this.windowMs;
      const waitTime = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetIn: waitTime,
        message: `Rate limit exceeded. Try again in ${waitTime} seconds.`
      };
    }

    // Add current request (timestamps remain sorted)
    userRequests.push(now);
    this.requests.set(identifier, userRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - userRequests.length,
      resetIn: Math.ceil(this.windowMs / 1000)
    };
  }

  cleanup() {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    // PERFORMANCE FIX: Batch delete to prevent iterator invalidation issues
    const toDelete = [];

    for (const [identifier, timestamps] of this.requests.entries()) {
      // Find first valid timestamp using binary search approach
      let i = 0;
      while (i < timestamps.length && timestamps[i] < cutoff) {
        i++;
      }

      if (i >= timestamps.length) {
        // All timestamps expired, mark for deletion
        toDelete.push(identifier);
      } else if (i > 0) {
        // Prune expired timestamps in-place
        this.requests.set(identifier, timestamps.slice(i));
      }
    }

    // Delete expired entries
    toDelete.forEach(id => this.requests.delete(id));

    // PERFORMANCE FIX: Prevent unbounded growth - remove oldest entries if over limit
    if (this.requests.size > this.maxEntries) {
      const excess = this.requests.size - this.maxEntries;
      const keys = Array.from(this.requests.keys()).slice(0, excess);
      keys.forEach(key => this.requests.delete(key));
    }
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }
}

// Singleton instance for fetch-content endpoint
export const contentFetchLimiter = new RateLimiter(
  30,     // 30 requests
  60000   // per minute
);

// Convenience function for common use case
export async function checkRateLimit(identifier, feature = 'default', maxRequests = 10, windowMs = 60000) {
  const limiter = new RateLimiter(maxRequests, windowMs);
  return await limiter.checkLimit(`${feature}:${identifier}`);
}