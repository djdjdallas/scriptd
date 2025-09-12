export class AIError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.details = details;
  }
}

export const AI_ERROR_CODES = {
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_INPUT: 'INVALID_INPUT',
  API_ERROR: 'API_ERROR',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_RESPONSE: 'INVALID_RESPONSE'
};

export function handleAIError(error) {
  if (error instanceof AIError) {
    switch (error.code) {
      case AI_ERROR_CODES.INSUFFICIENT_CREDITS:
        return {
          message: 'You need more credits to use this feature',
          action: 'purchase_credits',
          severity: 'warning'
        };
      case AI_ERROR_CODES.RATE_LIMIT:
        return {
          message: 'Too many requests. Please wait a moment.',
          action: 'retry',
          retryAfter: error.details.retryAfter || 60,
          severity: 'info'
        };
      case AI_ERROR_CODES.FEATURE_DISABLED:
        return {
          message: 'This feature is not available in your plan',
          action: 'upgrade',
          severity: 'info'
        };
      case AI_ERROR_CODES.QUOTA_EXCEEDED:
        return {
          message: 'You\'ve reached your monthly limit for this feature',
          action: 'upgrade',
          severity: 'warning'
        };
      case AI_ERROR_CODES.NETWORK_ERROR:
        return {
          message: 'Network error. Please check your connection.',
          action: 'retry',
          severity: 'error'
        };
      case AI_ERROR_CODES.TIMEOUT:
        return {
          message: 'Request timed out. Please try again.',
          action: 'retry',
          severity: 'warning'
        };
      case AI_ERROR_CODES.INVALID_RESPONSE:
        return {
          message: 'Received invalid response. Please try again.',
          action: 'retry',
          severity: 'error'
        };
      default:
        return {
          message: 'An error occurred. Please try again.',
          action: 'retry',
          severity: 'error'
        };
    }
  }
  
  // Handle standard errors
  if (error.message?.includes('credits')) {
    return {
      message: 'Insufficient credits for this operation',
      action: 'purchase_credits',
      severity: 'warning'
    };
  }
  
  if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
    return {
      message: 'Authentication required',
      action: 'login',
      severity: 'error'
    };
  }
  
  if (error.message?.includes('404')) {
    return {
      message: 'Resource not found',
      action: 'go_back',
      severity: 'error'
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    action: 'contact_support',
    severity: 'error'
  };
}

// Retry logic for failed AI requests
export async function retryAIRequest(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry certain errors
      if (error instanceof AIError) {
        if ([
          AI_ERROR_CODES.INSUFFICIENT_CREDITS,
          AI_ERROR_CODES.FEATURE_DISABLED,
          AI_ERROR_CODES.QUOTA_EXCEEDED,
          AI_ERROR_CODES.INVALID_INPUT
        ].includes(error.code)) {
          throw error;
        }
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

// Validate AI input data
export function validateAIInput(data, requirements) {
  const errors = [];
  
  for (const [field, requirement] of Object.entries(requirements)) {
    const value = data[field];
    
    if (requirement.required && !value) {
      errors.push(`${field} is required`);
    }
    
    if (requirement.type && value && typeof value !== requirement.type) {
      errors.push(`${field} must be of type ${requirement.type}`);
    }
    
    if (requirement.minLength && value && value.length < requirement.minLength) {
      errors.push(`${field} must be at least ${requirement.minLength} characters`);
    }
    
    if (requirement.maxLength && value && value.length > requirement.maxLength) {
      errors.push(`${field} must be no more than ${requirement.maxLength} characters`);
    }
    
    if (requirement.min && value && value < requirement.min) {
      errors.push(`${field} must be at least ${requirement.min}`);
    }
    
    if (requirement.max && value && value > requirement.max) {
      errors.push(`${field} must be no more than ${requirement.max}`);
    }
  }
  
  if (errors.length > 0) {
    throw new AIError(
      `Invalid input: ${errors.join(', ')}`,
      AI_ERROR_CODES.INVALID_INPUT,
      { errors }
    );
  }
  
  return true;
}