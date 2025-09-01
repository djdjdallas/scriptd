// Application-wide constants

// API Configuration
export const API_VERSION = 'v1';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// AI Providers
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GROQ: 'groq'
};

export const AI_MODELS = {
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
  CLAUDE_3_OPUS: 'claude-3-opus-20240229',
  CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
  MIXTRAL: 'mixtral-8x7b-32768'
};

// Script Types
export const SCRIPT_TYPES = {
  EDUCATIONAL: 'educational',
  ENTERTAINMENT: 'entertainment',
  TUTORIAL: 'tutorial',
  REVIEW: 'review',
  VLOG: 'vlog',
  NEWS: 'news',
  DOCUMENTARY: 'documentary',
  COMEDY: 'comedy',
  GAMING: 'gaming',
  LIFESTYLE: 'lifestyle'
};

// Script Lengths
export const SCRIPT_LENGTHS = {
  SHORT: { min: 0, max: 5, label: 'Short (< 5 min)' },
  MEDIUM: { min: 5, max: 15, label: 'Medium (5-15 min)' },
  LONG: { min: 15, max: 30, label: 'Long (15-30 min)' },
  EXTENDED: { min: 30, max: null, label: 'Extended (30+ min)' }
};

// Credit Costs
export const CREDIT_COSTS = {
  SCRIPT_GENERATION: {
    [AI_MODELS.GPT4_TURBO]: 10,
    [AI_MODELS.GPT4]: 15,
    [AI_MODELS.GPT35_TURBO]: 3,
    [AI_MODELS.CLAUDE_3_OPUS]: 20,
    [AI_MODELS.CLAUDE_3_SONNET]: 10,
    [AI_MODELS.CLAUDE_3_HAIKU]: 5,
    [AI_MODELS.MIXTRAL]: 2
  },
  RESEARCH_CHAT: 1, // per message
  CHANNEL_ANALYSIS: 5,
  TREND_ANALYSIS: 3,
  VOICE_TRAINING: 10,
  EXPORT_PDF: 2,
  EXPORT_DOCX: 2
};

// Subscription Plans
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    credits: 50,
    features: [
      '50 credits per month',
      'Basic script generation',
      'Access to free tools',
      'Export to text'
    ]
  },
  CREATOR: {
    id: 'creator',
    name: 'Creator',
    price: 19,
    priceAnnual: 192,
    credits: 500,
    stripeProductId: process.env.STRIPE_PRODUCT_CREATOR,
    stripePriceMonthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_CREATOR_ANNUAL,
    features: [
      '500 credits per month',
      'All AI models',
      'YouTube integration',
      'Research tools',
      'Export to all formats',
      'Email support'
    ]
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 49,
    priceAnnual: 468,
    credits: 2000,
    stripeProductId: process.env.STRIPE_PRODUCT_PROFESSIONAL,
    stripePriceMonthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL,
    features: [
      '2,000 credits per month',
      'Everything in Creator',
      'Team collaboration',
      'Priority support',
      'Custom voice training',
      'API access'
    ]
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 99,
    priceAnnual: 948,
    credits: 5000,
    stripeProductId: process.env.STRIPE_PRODUCT_BUSINESS,
    stripePriceMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
    features: [
      '5,000 credits per month',
      'Everything in Professional',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated account manager'
    ]
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceAnnual: null, // Custom pricing
    credits: null, // Unlimited
    stripeProductId: process.env.STRIPE_PRODUCT_ENTERPRISE,
    stripePriceMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    stripePriceAnnual: null, // Custom pricing
    features: [
      'Unlimited credits',
      'Everything in Business',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment'
    ]
  }
};

// YouTube API
export const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

// Rate Limits
export const RATE_LIMITS = {
  FREE_USER: {
    REQUESTS_PER_MINUTE: 10,
    SCRIPTS_PER_DAY: 3,
    RESEARCH_PER_HOUR: 20
  },
  PAID_USER: {
    REQUESTS_PER_MINUTE: 60,
    SCRIPTS_PER_DAY: 100,
    RESEARCH_PER_HOUR: 200
  },
  API: {
    REQUESTS_PER_MINUTE: 100,
    BURST_LIMIT: 200
  }
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  CHANNEL_DATA: 3600, // 1 hour
  TRENDING_DATA: 1800, // 30 minutes
  USER_PROFILE: 300, // 5 minutes
  SCRIPT_DRAFT: 86400, // 24 hours
  RESEARCH_SESSION: 7200 // 2 hours
};

// Export Formats
export const EXPORT_FORMATS = {
  TXT: 'txt',
  PDF: 'pdf',
  DOCX: 'docx',
  GOOGLE_DOCS: 'google_docs',
  MARKDOWN: 'md',
  HTML: 'html'
};

// Permissions
export const PERMISSIONS = {
  // Script permissions
  SCRIPT_CREATE: 'script:create',
  SCRIPT_READ: 'script:read',
  SCRIPT_UPDATE: 'script:update',
  SCRIPT_DELETE: 'script:delete',
  SCRIPT_EXPORT: 'script:export',
  
  // Team permissions
  TEAM_MANAGE: 'team:manage',
  TEAM_INVITE: 'team:invite',
  TEAM_REMOVE: 'team:remove',
  
  // Channel permissions
  CHANNEL_CONNECT: 'channel:connect',
  CHANNEL_ANALYZE: 'channel:analyze',
  
  // Billing permissions
  BILLING_MANAGE: 'billing:manage',
  CREDITS_PURCHASE: 'credits:purchase',
  
  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_CONTENT: 'admin:content',
  ADMIN_BILLING: 'admin:billing'
};

// Team Roles
export const TEAM_ROLES = {
  OWNER: {
    name: 'Owner',
    permissions: Object.values(PERMISSIONS)
  },
  ADMIN: {
    name: 'Admin',
    permissions: [
      PERMISSIONS.SCRIPT_CREATE,
      PERMISSIONS.SCRIPT_READ,
      PERMISSIONS.SCRIPT_UPDATE,
      PERMISSIONS.SCRIPT_DELETE,
      PERMISSIONS.SCRIPT_EXPORT,
      PERMISSIONS.TEAM_INVITE,
      PERMISSIONS.TEAM_REMOVE,
      PERMISSIONS.CHANNEL_CONNECT,
      PERMISSIONS.CHANNEL_ANALYZE
    ]
  },
  MEMBER: {
    name: 'Member',
    permissions: [
      PERMISSIONS.SCRIPT_CREATE,
      PERMISSIONS.SCRIPT_READ,
      PERMISSIONS.SCRIPT_UPDATE,
      PERMISSIONS.SCRIPT_EXPORT,
      PERMISSIONS.CHANNEL_ANALYZE
    ]
  },
  VIEWER: {
    name: 'Viewer',
    permissions: [
      PERMISSIONS.SCRIPT_READ
    ]
  }
};

// Error Codes
export const ERROR_CODES = {
  // Auth errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Rate limit errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // Payment errors
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  
  // External API errors
  YOUTUBE_API_ERROR: 'YOUTUBE_API_ERROR',
  AI_API_ERROR: 'AI_API_ERROR',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};