// Shared API handler with error handling, validation, and response formatting

export class ApiError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function createApiHandler(handler) {
  return async (req, res) => {
    try {
      // Add request timing
      const startTime = Date.now();
      
      // Execute handler
      const result = await handler(req, res);
      
      // If handler already sent response, return
      if (res.headersSent) {
        return;
      }
      
      // Send success response
      const duration = Date.now() - startTime;
      res.status(200).json({
        success: true,
        data: result,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      console.error('API Error:', error);
      
      // If response already sent, log but don't send again
      if (res.headersSent) {
        console.error('Error after response sent:', error);
        return;
      }
      
      // Determine status code
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';
      const code = error.code || 'INTERNAL_ERROR';
      
      // Send error response
      res.status(statusCode).json({
        success: false,
        error: {
          message,
          code,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack
          })
        }
      });
    }
  };
}

// Rate limiting helper
export function rateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // max requests per window
    message = 'Too many requests, please try again later'
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    
    // Clean old entries
    for (const [k, timestamps] of requests.entries()) {
      const filtered = timestamps.filter(t => now - t < windowMs);
      if (filtered.length === 0) {
        requests.delete(k);
      } else {
        requests.set(k, filtered);
      }
    }
    
    // Check rate limit
    const timestamps = requests.get(key) || [];
    if (timestamps.length >= max) {
      throw new ApiError(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
    
    // Add current request
    timestamps.push(now);
    requests.set(key, timestamps);
    
    next();
  };
}

// Method validation
export function validateMethod(allowedMethods) {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      throw new ApiError(
        `Method ${req.method} not allowed`,
        405,
        'METHOD_NOT_ALLOWED'
      );
    }
    next();
  };
}

// Auth validation
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new ApiError('Authentication required', 401, 'AUTH_REQUIRED');
  }
  
  // Token validation will be implemented with auth system
  // For now, pass through
  next();
}

// Request body validation
export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
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
        'VALIDATION_ERROR',
        { details }
      );
    }
    
    req.body = value;
    next();
  };
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