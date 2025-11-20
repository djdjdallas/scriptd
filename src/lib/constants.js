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

// Quality Tiers - Simplified 3-tier system
export const MODEL_TIERS = {
  FAST: {
    id: 'fast',
    name: 'Fast Generation',
    description: 'Quick drafts and ideation',
    baseCredits: 3,
    actualModel: process.env.FAST_MODEL || 'claude-3-5-haiku-20241022',
    features: ['60 second generation', 'Good for outlines', 'Testing ideas'],
    icon: '⚡'
  },
  BALANCED: {
    id: 'balanced',
    name: 'Professional Quality',
    description: 'High-quality scripts for publishing',
    baseCredits: 8,
    actualModel: process.env.BALANCED_MODEL || 'claude-sonnet-4-5-20250929',
    features: ['2-3 minute generation', 'Optimized for YouTube', 'Best value'],
    icon: '⭐',
    recommended: true
  },
  PREMIUM: {
    id: 'premium',
    name: 'Hollywood Studio',
    description: 'Cinema-grade scripts with maximum creativity',
    baseCredits: 15,
    actualModel: process.env.PREMIUM_MODEL || 'claude-opus-4-1-20250805',
    features: ['State-of-the-art AI', 'Maximum creativity', 'Best for viral content'],
    icon: '🎬'
  }
};

// Length Multipliers for detailed pricing (granular as requested)
export const LENGTH_MULTIPLIERS = {
  '1': 1.0,   // 1 min
  '3': 1.0,   // 3 min
  '5': 1.2,   // 5 min
  '7': 1.5,   // 7 min
  '10': 1.5,  // 10 min
  '12': 1.8,  // 12 min
  '15': 1.8,  // 15 min
  '20': 2.0,  // 20 min
  '25': 2.3,  // 25 min
  '30': 2.5,  // 30 min
  '40': 2.8,  // 40 min
  '50': 3.2,  // 50 min
  '60': 3.5   // 60 min
};

// Tier access by subscription level
export const TIER_ACCESS_BY_SUBSCRIPTION = {
  free: ['BALANCED'], // Free users get Professional model
  creator: ['BALANCED'], // Professional model only
  professional: ['BALANCED', 'PREMIUM'], // Professional & Hollywood
  agency: ['BALANCED', 'PREMIUM'] // Professional & Hollywood
};

// Legacy AI Models (kept for backward compatibility but hidden from UI)
// Only Claude models are supported
export const AI_MODELS = {
  CLAUDE_3_OPUS: process.env.PREMIUM_MODEL || 'claude-opus-4-1-20250805',
  CLAUDE_3_SONNET: process.env.BALANCED_MODEL || 'claude-sonnet-4-5-20250929',
  CLAUDE_3_HAIKU: process.env.FAST_MODEL || 'claude-3-5-haiku-20241022',
  CLAUDE_VOICE: process.env.VOICE_MODEL || 'claude-sonnet-4-5-20250929'
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

// Credit Costs - Simplified tier-based system
export const CREDIT_COSTS = {
  // Tier-based costs (base cost × length multiplier)
  SCRIPT_GENERATION_BY_TIER: {
    FAST: 3,
    BALANCED: 8,
    PREMIUM: 15
  },
  // Legacy model costs (for backward compatibility)
  SCRIPT_GENERATION: {
    [AI_MODELS.CLAUDE_3_OPUS]: 15, // Maps to PREMIUM tier
    [AI_MODELS.CLAUDE_3_SONNET]: 8, // Maps to BALANCED tier
    [AI_MODELS.CLAUDE_3_HAIKU]: 3, // Maps to FAST tier
  },
  RESEARCH_CHAT: 1, // per message
  CHANNEL_ANALYSIS: 5,
  TREND_ANALYSIS: 3,
  VOICE_TRAINING: 10,
  EXPORT_PDF: 0,  // File exports are now free
  EXPORT_DOCX: 0,  // File exports are now free
  // Workflow-specific features
  HOOK_GENERATION: 1,
  FRAME_GENERATION: 1,
  CONTENT_POINTS_GENERATION: 1,
  TITLE_GENERATION: 1,
  OUTLINE_GENERATION: 2,
  RESEARCH_SESSION: 2
};

// Subscription Plans - Doubled credits, new pricing
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    credits: 50, // Doubled from 25
    tiers: ['BALANCED'], // Professional model access
    features: [
      '50 free credits',
      'Professional quality',
      '5-33 scripts',
      'Basic export formats'
    ]
  },
  CREATOR: {
    id: 'creator',
    name: 'Creator',
    price: 39,
    priceAnnual: 374.40, // 20% off annual discount
    credits: 300, // Doubled from 150
    tiers: ['BALANCED'],
    stripeProductId: 'prod_T2icTPaTwIJuIn',
    stripePriceIdMonthly: 'price_1S6dBbPpO7oOioNRFsGAgIDg',
    stripePriceIdAnnual: 'price_1S6dBiPpO7oOioNR1S7NcBGn',
    features: [
      '300 credits/month',
      'Professional quality',
      '30-100 scripts/month',
      '3 channels',
      'Voice profiles',
      'All export formats',
      'Priority email support'
    ],
    popular: true,
    scriptsEstimate: '30-100 scripts/month'
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 79,
    priceAnnual: 758.40, // 20% off annual discount
    credits: 800, // Doubled from 400
    tiers: ['BALANCED', 'PREMIUM'],
    stripeProductId: 'prod_T2idSEslTnNrb0',
    stripePriceIdMonthly: 'price_1S6dBxPpO7oOioNRFs6EsczT',
    stripePriceIdAnnual: 'price_1S6dC3PpO7oOioNRPSgxAyXB',
    features: [
      '800 credits/month',
      'Professional & Hollywood quality',
      '80-260 scripts/month',
      '10 channels',
      'Team seats (3)',
      'Priority support',
      'Advanced analytics'
    ],
    scriptsEstimate: '80-260 scripts/month'
  },
  AGENCY: {
    id: 'agency',
    name: 'Agency',
    price: 199,
    priceAnnual: 1910.40, // 20% off annual discount
    credits: 2000, // Doubled from 1000
    tiers: ['BALANCED', 'PREMIUM'],
    stripeProductId: 'prod_T2idmdBYHDJxBV',
    stripePriceIdMonthly: 'price_1S6dCNPpO7oOioNRqeUV4xcf',
    stripePriceIdAnnual: 'price_1S6dCTPpO7oOioNRReJ8peZ2',
    features: [
      '2000 credits/month',
      'Professional & Hollywood quality',
      '200-600+ scripts/month',
      'Unlimited channels',
      'Team seats (10)',
      'White label option',
      'Dedicated support',
      'Custom integrations'
    ],
    scriptsEstimate: '200-600+ scripts/month'
  }
};

// Legacy plan mapping for backward compatibility
export const LEGACY_PLAN_MAPPING = {
  'starter': 'creator',
  'business': 'professional',
  'enterprise': 'agency'
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

// Credit Packages - One-time purchases (doubled credits)
export const CREDIT_PACKAGES = {
  STARTER: {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100, // Doubled from 50
    price: 19,
    stripeProductId: 'prod_T2iddrAOXO01Xs',
    stripePriceId: 'price_1S6dCoPpO7oOioNRWCV3u8Dj',
    savings: '24% off',
    scripts: '10-33 scripts',
    bestFor: 'Trying premium features'
  },
  POPULAR: {
    id: 'popular',
    name: 'Popular Pack',
    credits: 300, // Doubled from 150
    price: 49,
    stripeProductId: 'prod_T2ieJr8IY7tHqm',
    stripePriceId: 'price_1S6dCzPpO7oOioNRDEeNjEwe',
    savings: '31% off',
    badge: 'Most Popular',
    scripts: '30-100 scripts',
    bestFor: 'Regular creators'
  },
  BULK: {
    id: 'bulk',
    name: 'Bulk Pack',
    credits: 800, // Doubled from 400
    price: 99,
    stripeProductId: 'prod_T2ieo3rnpZEBsF',
    stripePriceId: 'price_1S6dDDPpO7oOioNRr2K4dbOs',
    savings: '38% off',
    scripts: '80-260 scripts',
    bestFor: 'Teams and agencies'
  }
};

// Helper function to calculate script cost
export function calculateScriptCost(tier, lengthMinutes) {
  const baseCredits = CREDIT_COSTS.SCRIPT_GENERATION_BY_TIER[tier] || MODEL_TIERS[tier]?.baseCredits || 8;
  const multiplier = LENGTH_MULTIPLIERS[lengthMinutes.toString()] || 1.0;
  return Math.ceil(baseCredits * multiplier);
}

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