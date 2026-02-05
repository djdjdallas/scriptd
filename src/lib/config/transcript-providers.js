/**
 * Transcript Provider Configuration
 *
 * Configures the multi-provider fallback chain for fetching YouTube transcripts.
 * Providers are tried in order of priority (lowest number = highest priority).
 */

export const TRANSCRIPT_PROVIDERS = {
  // Free npm scrapers (try these first)
  'youtube-transcript': {
    id: 'youtube-transcript',
    name: 'YouTube Transcript (npm)',
    priority: 1,
    enabled: true,
    type: 'scraper',
    costPerRequest: 0,
    rateLimit: null, // No rate limit for scraping
    cooldownMs: 5 * 60 * 1000, // 5 min cooldown on failure
    description: 'Primary npm-based scraper (@danielxceron/youtube-transcript)'
  },

  'youtube-transcript-plus': {
    id: 'youtube-transcript-plus',
    name: 'YouTube Transcript Plus (npm)',
    priority: 2,
    enabled: true,
    type: 'scraper',
    costPerRequest: 0,
    rateLimit: null, // No rate limit for scraping
    cooldownMs: 5 * 60 * 1000, // 5 min cooldown on failure
    supportsProxy: true,
    description: 'Secondary npm scraper with proxy support'
  },

  // Paid APIs (fallback when scrapers fail)
  'supadata': {
    id: 'supadata',
    name: 'Supadata API',
    priority: 3,
    enabled: true,
    type: 'api',
    costPerRequest: 0.01, // ~$0.01 at 100 free/month
    rateLimit: {
      requestsPerMinute: 15,
      maxConcurrent: 2,
      interRequestDelayMs: 500
    },
    cooldownMs: 10 * 60 * 1000, // 10 min cooldown on 429
    envKey: 'SUPADATA_API_KEY',
    description: 'Supadata.ai API (100 free credits/month)'
  },

  'scrapecreators': {
    id: 'scrapecreators',
    name: 'ScrapeCreators API',
    priority: 4,
    enabled: true,
    type: 'api',
    costPerRequest: 0.002, // $0.002 per request
    rateLimit: {
      requestsPerMinute: 60,
      maxConcurrent: 5,
      interRequestDelayMs: 100
    },
    cooldownMs: 5 * 60 * 1000, // 5 min cooldown on 429
    envKey: 'SCRAPECREATORS_API_KEY',
    description: 'ScrapeCreators API ($10 for 5,000 credits)'
  }
};

/**
 * Provider health tracking configuration
 */
export const PROVIDER_HEALTH_CONFIG = {
  // Number of consecutive failures before cooldown
  failureThreshold: 3,

  // How long to track failure window
  failureWindowMs: 60 * 1000, // 1 minute

  // Max cooldown time (caps exponential backoff)
  maxCooldownMs: 30 * 60 * 1000, // 30 minutes

  // Reset health after this many successes
  successResetThreshold: 3,

  // Log provider health stats every N requests
  healthLogInterval: 10
};

/**
 * Get providers sorted by priority (lowest number first)
 */
export function getProvidersByPriority() {
  return Object.values(TRANSCRIPT_PROVIDERS)
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a provider requires an API key
 */
export function providerRequiresApiKey(providerId) {
  const provider = TRANSCRIPT_PROVIDERS[providerId];
  return provider?.envKey != null;
}

/**
 * Check if provider API key is configured
 */
export function isProviderConfigured(providerId) {
  const provider = TRANSCRIPT_PROVIDERS[providerId];
  if (!provider) return false;
  if (!provider.envKey) return true; // No API key needed
  return !!process.env[provider.envKey];
}

export default TRANSCRIPT_PROVIDERS;
