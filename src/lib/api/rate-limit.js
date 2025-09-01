const rateLimit = new Map()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10

export function checkRateLimit(identifier) {
  const now = Date.now()
  const userRateLimit = rateLimit.get(identifier)

  if (!userRateLimit) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return { success: true }
  }

  if (now > userRateLimit.resetTime) {
    userRateLimit.count = 1
    userRateLimit.resetTime = now + WINDOW_MS
    return { success: true }
  }

  if (userRateLimit.count >= MAX_REQUESTS) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((userRateLimit.resetTime - now) / 1000),
    }
  }

  userRateLimit.count++
  return { success: true }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime + WINDOW_MS) {
      rateLimit.delete(key)
    }
  }
}, WINDOW_MS * 2)

// Middleware wrapper for rate limiting
export function withRateLimit(handler, options = {}) {
  const { getIdentifier = (req) => req.ip || 'anonymous' } = options
  
  return async (req, ...args) => {
    const identifier = getIdentifier(req)
    const result = checkRateLimit(identifier)
    
    if (!result.success) {
      return Response.json(
        { error: result.error },
        { 
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter)
          }
        }
      )
    }
    
    return handler(req, ...args)
  }
}