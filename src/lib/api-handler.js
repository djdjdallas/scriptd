import { checkRateLimit } from './api/rate-limit.js';

// Rate limiter middleware
export function rateLimiter(options = {}) {
  const { 
    windowMs = 60 * 1000, // 1 minute
    max = 10,
    getKey = (req) => req.ip || 'anonymous'
  } = options;

  return async (req) => {
    const key = getKey(req);
    const result = checkRateLimit(key);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.retryAfter)
          }
        }
      );
    }

    return null; // Continue processing
  };
}

// Error handler wrapper
export function withErrorHandler(handler) {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.name === 'ValidationError') {
        return Response.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      
      if (error.name === 'UnauthorizedError') {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (error.name === 'ForbiddenError') {
        return Response.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
      
      if (error.name === 'NotFoundError') {
        return Response.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }
      
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Combined middleware
export function createAPIHandler(handler, options = {}) {
  const { rateLimit = true, errorHandler = true } = options;
  
  let finalHandler = handler;
  
  if (errorHandler) {
    finalHandler = withErrorHandler(finalHandler);
  }
  
  if (rateLimit) {
    const limiter = rateLimiter(options.rateLimitOptions);
    const originalHandler = finalHandler;
    
    finalHandler = async (req, ...args) => {
      const rateLimitResponse = await limiter(req);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      return originalHandler(req, ...args);
    };
  }
  
  return finalHandler;
}

// Common API utilities
export function parseRequestBody(req) {
  return req.json();
}

export function getQueryParams(req) {
  const url = new URL(req.url);
  return Object.fromEntries(url.searchParams);
}

export function createSuccessResponse(data, options = {}) {
  return Response.json(
    { success: true, data },
    { status: options.status || 200, ...options }
  );
}

export function createErrorResponse(error, status = 400) {
  return Response.json(
    { success: false, error },
    { status }
  );
}