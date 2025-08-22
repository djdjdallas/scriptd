// Input validation schemas using Joi-like syntax
// We'll use a lightweight validation approach for Next.js

export const validators = {
  // Common validators
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      throw new Error('Invalid email address');
    }
    return value.toLowerCase();
  },

  url: (value) => {
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error('Invalid URL');
    }
  },

  uuid: (value) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!regex.test(value)) {
      throw new Error('Invalid UUID');
    }
    return value;
  },

  // Script validators
  scriptTitle: (value) => {
    if (!value || value.trim().length < 3) {
      throw new Error('Title must be at least 3 characters');
    }
    if (value.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }
    return value.trim();
  },

  scriptType: (value, validTypes) => {
    if (!validTypes.includes(value)) {
      throw new Error(`Invalid script type. Must be one of: ${validTypes.join(', ')}`);
    }
    return value;
  },

  scriptLength: (value) => {
    const length = parseInt(value);
    if (isNaN(length) || length < 1 || length > 120) {
      throw new Error('Script length must be between 1 and 120 minutes');
    }
    return length;
  },

  // YouTube validators
  youtubeChannelId: (value) => {
    const regex = /^UC[\w-]{22}$/;
    if (!regex.test(value)) {
      throw new Error('Invalid YouTube channel ID');
    }
    return value;
  },

  youtubeVideoId: (value) => {
    const regex = /^[\w-]{11}$/;
    if (!regex.test(value)) {
      throw new Error('Invalid YouTube video ID');
    }
    return value;
  },

  // Credit validators
  creditAmount: (value) => {
    const amount = parseInt(value);
    if (isNaN(amount) || amount < 1 || amount > 10000) {
      throw new Error('Credit amount must be between 1 and 10,000');
    }
    return amount;
  },

  // Team validators
  teamName: (value) => {
    if (!value || value.trim().length < 2) {
      throw new Error('Team name must be at least 2 characters');
    }
    if (value.length > 50) {
      throw new Error('Team name must be less than 50 characters');
    }
    return value.trim();
  },

  teamRole: (value, validRoles) => {
    if (!validRoles.includes(value)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    return value;
  },

  // Pagination validators
  page: (value) => {
    const page = parseInt(value) || 1;
    if (page < 1) {
      throw new Error('Page must be at least 1');
    }
    return page;
  },

  limit: (value) => {
    const limit = parseInt(value) || 20;
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    return limit;
  },

  // AI validators
  aiProvider: (value, validProviders) => {
    if (!validProviders.includes(value)) {
      throw new Error(`Invalid AI provider. Must be one of: ${validProviders.join(', ')}`);
    }
    return value;
  },

  aiModel: (value, validModels) => {
    if (!validModels.includes(value)) {
      throw new Error(`Invalid AI model. Must be one of: ${validModels.join(', ')}`);
    }
    return value;
  },

  aiPrompt: (value) => {
    if (!value || value.trim().length < 10) {
      throw new Error('Prompt must be at least 10 characters');
    }
    if (value.length > 4000) {
      throw new Error('Prompt must be less than 4000 characters');
    }
    return value.trim();
  },

  // Password validators
  password: (value) => {
    if (!value || value.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(value)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(value)) {
      throw new Error('Password must contain at least one number');
    }
    return value;
  }
};

// Schema validation helper
export function validateSchema(data, schema) {
  const errors = {};
  const validated = {};

  for (const [field, rules] of Object.entries(schema)) {
    try {
      let value = data[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Skip optional empty fields
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Apply validators
      if (rules.validator) {
        value = rules.validator(value, rules.options);
      }

      // Apply custom validation
      if (rules.custom) {
        value = rules.custom(value);
      }

      validated[field] = value;
    } catch (error) {
      errors[field] = error.message;
    }
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error('Validation failed');
    error.errors = errors;
    throw error;
  }

  return validated;
}

// Common schemas
export const schemas = {
  // User registration
  userRegistration: {
    email: {
      required: true,
      validator: validators.email
    },
    password: {
      required: true,
      validator: validators.password
    },
    name: {
      required: true,
      validator: (value) => {
        if (!value || value.trim().length < 2) {
          throw new Error('Name must be at least 2 characters');
        }
        return value.trim();
      }
    }
  },

  // Script creation
  scriptCreation: {
    title: {
      required: true,
      validator: validators.scriptTitle
    },
    type: {
      required: true,
      validator: validators.scriptType
    },
    length: {
      required: true,
      validator: validators.scriptLength
    },
    description: {
      required: false,
      validator: (value) => value?.trim() || ''
    }
  },

  // Team invitation
  teamInvitation: {
    email: {
      required: true,
      validator: validators.email
    },
    role: {
      required: true,
      validator: validators.teamRole
    },
    message: {
      required: false,
      validator: (value) => value?.trim() || ''
    }
  },

  // AI generation request
  aiGeneration: {
    prompt: {
      required: true,
      validator: validators.aiPrompt
    },
    provider: {
      required: true,
      validator: validators.aiProvider
    },
    model: {
      required: true,
      validator: validators.aiModel
    },
    temperature: {
      required: false,
      validator: (value) => {
        const temp = parseFloat(value) || 0.7;
        if (temp < 0 || temp > 2) {
          throw new Error('Temperature must be between 0 and 2');
        }
        return temp;
      }
    }
  }
};

// Request body validation middleware
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.validated = validateSchema(req.body, schema);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          errors: error.errors || {}
        }
      });
    }
  };
}