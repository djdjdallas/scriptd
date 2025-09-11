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
  GPT5: 'gpt-5',
  GPT41: 'gpt-4.1',
  GPT4_TURBO: 'gpt-4-turbo',
  GPT4: 'gpt-4',
  CLAUDE_4_OPUS: 'claude-4-opus-20250522',
  CLAUDE_4_OPUS_41: 'claude-opus-4-1-20250805',
  CLAUDE_37_SONNET: 'claude-3.7-sonnet-20250224',
  CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
  MIXTRAL_LARGE: 'mistral-large-2',
  MIXTRAL: 'mixtral-8x7b-32768'
};

// Premium AI Models (require paid subscription)
export const PREMIUM_AI_MODELS = [
  AI_MODELS.GPT5,
  AI_MODELS.CLAUDE_4_OPUS,
  AI_MODELS.CLAUDE_4_OPUS_41
];

// Models available for each subscription tier
export const MODEL_ACCESS_BY_TIER = {
  free: [
    AI_MODELS.MIXTRAL,
    AI_MODELS.CLAUDE_3_HAIKU
  ],
  starter: [
    AI_MODELS.MIXTRAL,
    AI_MODELS.CLAUDE_3_HAIKU,
    AI_MODELS.GPT4_TURBO,
    AI_MODELS.CLAUDE_37_SONNET,
    AI_MODELS.MIXTRAL_LARGE
  ],
  professional: [
    AI_MODELS.MIXTRAL,
    AI_MODELS.CLAUDE_3_HAIKU,
    AI_MODELS.GPT4_TURBO,
    AI_MODELS.GPT4,
    AI_MODELS.GPT41,
    AI_MODELS.CLAUDE_37_SONNET,
    AI_MODELS.MIXTRAL_LARGE
  ],
  business: Object.values(AI_MODELS), // All models
  enterprise: Object.values(AI_MODELS) // All models
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

// Script Lengths - Specific minute options with word counts
export const SCRIPT_LENGTHS = {
  '5': { 
    minutes: 5, 
    label: '5 minutes', 
    words: '~800 words', 
    wordsMin: 700,
    wordsMax: 900
  },
  '8': { 
    minutes: 8, 
    label: '8 minutes', 
    words: '~1,300 words', 
    wordsMin: 1200,
    wordsMax: 1400
  },
  '10': { 
    minutes: 10, 
    label: '10 minutes', 
    words: '~1,600 words', 
    wordsMin: 1500,
    wordsMax: 1700
  },
  '12': { 
    minutes: 12, 
    label: '12 minutes', 
    words: '~2,000 words', 
    wordsMin: 1900,
    wordsMax: 2100
  },
  '15': { 
    minutes: 15, 
    label: '15 minutes', 
    words: '~2,500 words', 
    wordsMin: 2400,
    wordsMax: 2600
  },
  '20': { 
    minutes: 20, 
    label: '20 minutes', 
    words: '~3,200 words', 
    wordsMin: 3000,
    wordsMax: 3400
  },
  '25': { 
    minutes: 25, 
    label: '25 minutes', 
    words: '~4,000 words', 
    wordsMin: 3800,
    wordsMax: 4200
  },
  '30': { 
    minutes: 30, 
    label: '30 minutes', 
    words: '~4,800 words', 
    wordsMin: 4600,
    wordsMax: 5000
  },
  '40': { 
    minutes: 40, 
    label: '40 minutes', 
    words: '~6,400 words', 
    wordsMin: 6200,
    wordsMax: 6600
  },
  '50': { 
    minutes: 50, 
    label: '50 minutes', 
    words: '~8,000 words', 
    wordsMin: 7800,
    wordsMax: 8200
  },
  '60': { 
    minutes: 60, 
    label: '60 minutes', 
    words: '~9,600 words', 
    wordsMin: 9400,
    wordsMax: 9800
  }
};

// Credit Costs
export const CREDIT_COSTS = {
  SCRIPT_GENERATION: {
    [AI_MODELS.GPT5]: 25,
    [AI_MODELS.GPT41]: 18,
    [AI_MODELS.GPT4_TURBO]: 10,
    [AI_MODELS.GPT4]: 15,
    [AI_MODELS.CLAUDE_4_OPUS_41]: 30,
    [AI_MODELS.CLAUDE_4_OPUS]: 25,
    [AI_MODELS.CLAUDE_37_SONNET]: 12,
    [AI_MODELS.CLAUDE_3_HAIKU]: 5,
    [AI_MODELS.MIXTRAL_LARGE]: 8,
    [AI_MODELS.MIXTRAL]: 2
  },
  RESEARCH_CHAT: 1, // per message
  CHANNEL_ANALYSIS: 5,
  TREND_ANALYSIS: 3,
  VOICE_TRAINING: 10,
  EXPORT_PDF: 0,  // File exports are now free
  EXPORT_DOCX: 0  // File exports are now free
};

// Subscription Plans
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    credits: 15,
    features: [
      '15 free credits',
      'Basic script generation',
      'Access to 3 tools',
      'Community support'
    ]
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceAnnual: 290,
    credits: 100,
    stripeProductId: process.env.STRIPE_PRODUCT_STARTER,
    stripePriceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
    features: [
      '100 credits per month',
      'All AI models',
      'YouTube integration',
      'SEO optimization tools',
      'Export to all formats',
      'Community support'
    ]
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 69,
    priceAnnual: 690,
    credits: 300,
    stripeProductId: process.env.STRIPE_PRODUCT_PROFESSIONAL,
    stripePriceMonthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL,
    features: [
      '300 credits per month',
      'Everything in Starter',
      'Voice cloning technology',
      'Multi-channel management',
      'Priority support',
      'Advanced analytics'
    ]
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 99,
    priceAnnual: 990,
    credits: 1000,
    stripeProductId: process.env.STRIPE_PRODUCT_BUSINESS,
    stripePriceMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
    features: [
      '1,000 credits per month',
      'Everything in Professional',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated account manager'
    ]
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceAnnual: 1990,
    credits: null, // Unlimited
    stripeProductId: process.env.STRIPE_PRODUCT_ENTERPRISE,
    stripePriceMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    stripePriceAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
    features: [
      'Unlimited credits',
      'Everything in Business',
      'White-label options',
      'Custom AI models',
      'SLA guarantee',
      'Dedicated support team'
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

// Credit Packages (imported from stripe config)
// Credit Packages with updated pricing
export const CREDIT_PACKAGES = {
  pack_50: {
    id: 'pack_50',
    name: 'Starter Pack',
    description: 'Perfect for trying out',
    credits: 50,
    price: 15,
    perCredit: '0.30',
    badge: null,
    stripeProductId: 'prod_T1ICocdNCYayyY',
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_50
  },
  pack_100: {
    id: 'pack_100',
    name: 'Popular Pack',
    description: 'Most popular choice',
    credits: 100,
    price: 25,
    perCredit: '0.25',
    badge: 'Most Popular',
    stripeProductId: 'prod_T1ICAOiPIcPLeh',
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_100
  },
  pack_500: {
    id: 'pack_500',
    name: 'Pro Pack',
    description: 'Best value for professionals',
    credits: 500,
    price: 99,
    perCredit: '0.198',
    badge: 'Best Value',
    stripeProductId: 'prod_T1ICGMiLqVLkeB',
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_500
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