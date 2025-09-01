// Shared API handler with error handling, validation, and response formatting

export class ApiError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

import { NextResponse } from 'next/server';

export function createApiHandler(handler) {
  return async (req, { params } = {}) => {
    try {
      // Add request timing
      const startTime = Date.now();
      
      // Execute handler
      const result = await handler(req, params);
      
      // Send success response
      const duration = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        data: result,
        duration: `${duration}ms`
      }, { status: 200 });
      
    } catch (error) {
      console.error('API Error:', error);
      
      // Determine status code
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';
      const code = error.code || 'INTERNAL_ERROR';
      
      // Send error response
      return NextResponse.json({
        success: false,
        error: {
          message,
          code,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack
          })
        }
      }, { status: statusCode });
    }
  };
}

// Rate limiting helper (simplified for App Router)
const rateLimitStore = new Map();

export function checkRateLimit(req, options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // max requests per window
    message = 'Too many requests, please try again later'
  } = options;
  
  const key = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown';
  const now = Date.now();
  
  // Clean old entries
  for (const [k, timestamps] of rateLimitStore.entries()) {
    const filtered = timestamps.filter(t => now - t < windowMs);
    if (filtered.length === 0) {
      rateLimitStore.delete(k);
    } else {
      rateLimitStore.set(k, filtered);
    }
  }
  
  // Check rate limit
  const timestamps = rateLimitStore.get(key) || [];
  if (timestamps.length >= max) {
    throw new ApiError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
  
  // Add current request
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
}

// Method validation for App Router
export function validateMethod(req, allowedMethods) {
  if (!allowedMethods.includes(req.method)) {
    throw new ApiError(
      `Method ${req.method} not allowed`,
      405,
      'METHOD_NOT_ALLOWED'
    );
  }
}

// Request body validation
export async function validateBody(body, schema) {
  const { error, value } = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    }));
    
    throw new ApiError(
      'Validation failed',
      400,
      'VALIDATION_ERROR'
    );
  }
  
  return value;
}

// Pagination helper
export function paginate(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  
  return {
    page,
    limit,
    offset,
    createResponse: (items, total) => ({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  };
}