// Simple in-memory rate limiter
const requestCounts = new Map();

export async function checkRateLimit(identifier, options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 10, // 10 requests per window default
  } = options;

  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or initialize request data for this identifier
  let requestData = requestCounts.get(identifier) || { requests: [] };

  // Filter out requests outside the current window
  requestData.requests = requestData.requests.filter((timestamp) => timestamp > windowStart);

  // Check if limit is exceeded
  if (requestData.requests.length >= max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      resetAt: new Date(requestData.requests[0] + windowMs),
    };
  }

  // Add current request timestamp
  requestData.requests.push(now);
  requestCounts.set(identifier, requestData);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, data] of requestCounts.entries()) {
      if (data.requests.length === 0 || data.requests[data.requests.length - 1] < windowStart) {
        requestCounts.delete(key);
      }
    }
  }

  return {
    success: true,
    limit: max,
    remaining: max - requestData.requests.length,
    resetAt: new Date(now + windowMs),
  };
}

// Helper to create rate limit middleware
export function createRateLimiter(options = {}) {
  return async (req) => {
    // Use IP address or user ID as identifier
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    const result = await checkRateLimit(ip, options);
    
    if (!result.success) {
      return new Response(JSON.stringify({
        error: 'Too many requests',
        resetAt: result.resetAt,
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': result.resetAt.toISOString(),
        },
      });
    }
    
    return null; // Continue with request
  };
}