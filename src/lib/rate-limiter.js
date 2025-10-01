export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  async checkLimit(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out requests outside the current window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = oldestRequest + this.windowMs;
      const waitTime = Math.ceil((resetTime - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetIn: waitTime,
        message: `Rate limit exceeded. Try again in ${waitTime} seconds.`
      };
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean
      this.cleanup();
    }
    
    return {
      allowed: true,
      remaining: this.maxRequests - recentRequests.length,
      resetIn: Math.ceil(this.windowMs / 1000)
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [identifier, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => now - t < this.windowMs);
      if (recent.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recent);
      }
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