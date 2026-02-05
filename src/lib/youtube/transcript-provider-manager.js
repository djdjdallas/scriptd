/**
 * Transcript Provider Manager
 *
 * Manages the multi-provider fallback chain for fetching YouTube transcripts.
 * Features:
 * - Automatic fallback on failures
 * - Health tracking per provider
 * - Cooldown periods after rate limit errors
 * - Request counting for monitoring
 */

import { YoutubeTranscript } from '@danielxceron/youtube-transcript';
import {
  TRANSCRIPT_PROVIDERS,
  PROVIDER_HEALTH_CONFIG,
  getProvidersByPriority,
  isProviderConfigured
} from '@/lib/config/transcript-providers';
import { apiLogger } from '@/lib/monitoring/logger';
import { withSupadataRateLimit } from './supadata-rate-limiter.js';
import { withRetry, isRateLimitError, createApiError } from '@/lib/utils/retry';
import { SUPADATA_RATE_LIMITS } from '@/lib/constants';

// Provider health tracking
const providerHealth = new Map();

// Request statistics
const stats = {
  totalRequests: 0,
  successByProvider: {},
  failuresByProvider: {},
  lastRequestTime: null
};

/**
 * Initialize or get health state for a provider
 */
function getProviderHealth(providerId) {
  if (!providerHealth.has(providerId)) {
    providerHealth.set(providerId, {
      failures: [],
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      cooldownUntil: null,
      lastError: null,
      lastSuccess: null,
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0
    });
  }
  return providerHealth.get(providerId);
}

/**
 * Check if a provider is currently in cooldown
 */
function isInCooldown(providerId) {
  const health = getProviderHealth(providerId);
  if (!health.cooldownUntil) return false;
  return Date.now() < health.cooldownUntil;
}

/**
 * Record a provider failure
 */
function recordFailure(providerId, error) {
  const health = getProviderHealth(providerId);
  const provider = TRANSCRIPT_PROVIDERS[providerId];
  const now = Date.now();

  health.failures.push(now);
  health.consecutiveFailures++;
  health.consecutiveSuccesses = 0;
  health.lastError = error.message;
  health.totalFailures++;
  health.totalRequests++;

  // Clean old failures outside the window
  const windowStart = now - PROVIDER_HEALTH_CONFIG.failureWindowMs;
  health.failures = health.failures.filter(t => t >= windowStart);

  // Check if we should enter cooldown
  const isRateLimit = isRateLimitError(error);

  if (isRateLimit || health.consecutiveFailures >= PROVIDER_HEALTH_CONFIG.failureThreshold) {
    // Calculate cooldown with exponential backoff
    const baseMs = provider?.cooldownMs || 5 * 60 * 1000;
    const multiplier = Math.min(Math.pow(2, health.consecutiveFailures - 1), 8);
    const cooldownMs = Math.min(baseMs * multiplier, PROVIDER_HEALTH_CONFIG.maxCooldownMs);

    health.cooldownUntil = now + cooldownMs;

    apiLogger.warn('Provider entering cooldown', {
      providerId,
      cooldownMs,
      consecutiveFailures: health.consecutiveFailures,
      isRateLimit,
      error: error.message
    });
  }

  // Track in stats
  stats.failuresByProvider[providerId] = (stats.failuresByProvider[providerId] || 0) + 1;
}

/**
 * Record a provider success
 */
function recordSuccess(providerId) {
  const health = getProviderHealth(providerId);

  health.consecutiveSuccesses++;
  health.consecutiveFailures = 0;
  health.lastSuccess = Date.now();
  health.totalSuccesses++;
  health.totalRequests++;

  // Reset cooldown after enough successes
  if (health.consecutiveSuccesses >= PROVIDER_HEALTH_CONFIG.successResetThreshold) {
    health.cooldownUntil = null;
    health.failures = [];
  }

  // Track in stats
  stats.successByProvider[providerId] = (stats.successByProvider[providerId] || 0) + 1;
}

/**
 * Fetch transcript using the primary npm scraper
 */
async function fetchWithYoutubeTranscript(videoId) {
  let transcript = null;
  let lastError = null;

  // Try without config first
  try {
    transcript = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (e) {
    lastError = e;

    // Try different configurations
    const attempts = [
      { config: { lang: 'en' }, name: 'lang: en' },
      { config: { country: 'US' }, name: 'country: US' },
      { config: { lang: 'en', country: 'US' }, name: 'lang: en, country: US' }
    ];

    for (const attempt of attempts) {
      try {
        transcript = await YoutubeTranscript.fetchTranscript(videoId, attempt.config);
        if (transcript && transcript.length > 0) break;
      } catch (e2) {
        lastError = e2;
      }
    }
  }

  if (!transcript || transcript.length === 0) {
    throw lastError || new Error('No transcript found');
  }

  const fullText = transcript
    .map(s => s.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    segments: transcript,
    fullText,
    hasTranscript: true,
    source: 'youtube-transcript'
  };
}

/**
 * Fetch transcript using youtube-transcript-plus
 */
async function fetchWithYoutubeTranscriptPlus(videoId) {
  const provider = await import('./providers/youtube-transcript-plus.js');
  return provider.fetchTranscript(videoId);
}

/**
 * Fetch transcript using Supadata API
 */
async function fetchWithSupadata(videoId) {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    throw new Error('SUPADATA_API_KEY not configured');
  }

  return await withSupadataRateLimit(async () => {
    return await withRetry(
      async () => {
        const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=false`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw createApiError(
            `Supadata API error (${response.status}): ${errorText}`,
            response.status,
            response
          );
        }

        const data = await response.json();

        // Check for error in response body
        if (data.error || data.message?.toLowerCase().includes('limit')) {
          throw createApiError(
            `Supadata API error: ${data.message || data.error}`,
            429,
            response
          );
        }

        if (!data.content || !Array.isArray(data.content)) {
          throw new Error('Invalid Supadata API response format');
        }

        const segments = data.content.map(chunk => ({
          text: chunk.text,
          offset: chunk.offset,
          duration: chunk.duration
        }));

        const fullText = data.content
          .map(chunk => chunk.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          segments,
          fullText,
          hasTranscript: true,
          source: 'supadata-api',
          language: data.lang,
          availableLanguages: data.availableLangs || []
        };
      },
      {
        maxRetries: 3,
        baseDelayMs: 2000,
        maxDelayMs: SUPADATA_RATE_LIMITS.MAX_RETRY_DELAY_MS,
        shouldRetry: isRateLimitError,
        onRetry: (attempt, delay, error) => {
          apiLogger.warn('Supadata API retry', {
            videoId,
            attempt,
            delayMs: delay,
            error: error.message
          });
        }
      }
    );
  });
}

/**
 * Fetch transcript using ScrapeCreators API
 */
async function fetchWithScrapeCreators(videoId) {
  const provider = await import('./providers/scrapecreators.js');
  return provider.fetchTranscript(videoId);
}

/**
 * Provider fetch function mapping
 */
const providerFetchers = {
  'youtube-transcript': fetchWithYoutubeTranscript,
  'youtube-transcript-plus': fetchWithYoutubeTranscriptPlus,
  'supadata': fetchWithSupadata,
  'scrapecreators': fetchWithScrapeCreators
};

/**
 * Fetch transcript using the fallback chain
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Transcript result
 */
export async function fetchTranscriptWithFallback(videoId) {
  const providers = getProvidersByPriority();
  const errors = [];

  stats.totalRequests++;
  stats.lastRequestTime = Date.now();

  // Log health stats periodically
  if (stats.totalRequests % PROVIDER_HEALTH_CONFIG.healthLogInterval === 0) {
    logHealthStats();
  }

  for (const provider of providers) {
    // Skip unconfigured API providers
    if (!isProviderConfigured(provider.id)) {
      continue;
    }

    // Skip providers in cooldown
    if (isInCooldown(provider.id)) {
      const health = getProviderHealth(provider.id);
      const remainingCooldown = Math.ceil((health.cooldownUntil - Date.now()) / 1000);
      apiLogger.debug('Skipping provider in cooldown', {
        providerId: provider.id,
        remainingCooldownSec: remainingCooldown
      });
      continue;
    }

    const fetcher = providerFetchers[provider.id];
    if (!fetcher) {
      apiLogger.warn('No fetcher found for provider', { providerId: provider.id });
      continue;
    }

    try {
      const result = await fetcher(videoId);

      if (result && result.hasTranscript) {
        recordSuccess(provider.id);

        apiLogger.debug('Transcript fetched successfully', {
          videoId,
          providerId: provider.id,
          source: result.source,
          segmentCount: result.segments?.length
        });

        return result;
      }
    } catch (error) {
      recordFailure(provider.id, error);

      errors.push({
        providerId: provider.id,
        error: error.message,
        isRateLimit: isRateLimitError(error)
      });

      apiLogger.debug('Provider failed', {
        videoId,
        providerId: provider.id,
        error: error.message,
        isRateLimit: isRateLimitError(error)
      });

      // Continue to next provider
    }
  }

  // All providers failed
  apiLogger.warn('All transcript providers failed', {
    videoId,
    errors
  });

  // Return the most informative error
  const lastError = errors[errors.length - 1];
  throw new Error(
    lastError
      ? `Transcript fetch failed: ${lastError.error} (provider: ${lastError.providerId})`
      : 'No transcript providers available'
  );
}

/**
 * Log health statistics for monitoring
 */
function logHealthStats() {
  const healthSummary = {};

  for (const [providerId, health] of providerHealth.entries()) {
    healthSummary[providerId] = {
      totalRequests: health.totalRequests,
      successRate: health.totalRequests > 0
        ? ((health.totalSuccesses / health.totalRequests) * 100).toFixed(1) + '%'
        : 'N/A',
      consecutiveFailures: health.consecutiveFailures,
      inCooldown: isInCooldown(providerId),
      lastError: health.lastError
    };
  }

  apiLogger.info('Transcript provider health stats', {
    totalRequests: stats.totalRequests,
    providerHealth: healthSummary
  });
}

/**
 * Get current provider health status (for API/debugging)
 */
export function getProviderStatus() {
  const status = {};

  for (const provider of getProvidersByPriority()) {
    const health = getProviderHealth(provider.id);
    const inCooldown = isInCooldown(provider.id);

    status[provider.id] = {
      name: provider.name,
      type: provider.type,
      priority: provider.priority,
      configured: isProviderConfigured(provider.id),
      inCooldown,
      cooldownRemainingSec: inCooldown
        ? Math.ceil((health.cooldownUntil - Date.now()) / 1000)
        : 0,
      totalRequests: health.totalRequests,
      totalSuccesses: health.totalSuccesses,
      totalFailures: health.totalFailures,
      successRate: health.totalRequests > 0
        ? ((health.totalSuccesses / health.totalRequests) * 100).toFixed(1)
        : null,
      lastError: health.lastError,
      lastSuccess: health.lastSuccess
    };
  }

  return {
    providers: status,
    stats: {
      totalRequests: stats.totalRequests,
      lastRequestTime: stats.lastRequestTime
    }
  };
}

/**
 * Reset a specific provider's health (useful after config changes)
 */
export function resetProviderHealth(providerId) {
  if (providerHealth.has(providerId)) {
    providerHealth.delete(providerId);
    apiLogger.info('Provider health reset', { providerId });
  }
}

/**
 * Reset all provider health
 */
export function resetAllProviderHealth() {
  providerHealth.clear();
  apiLogger.info('All provider health reset');
}

export default {
  fetchTranscriptWithFallback,
  getProviderStatus,
  resetProviderHealth,
  resetAllProviderHealth
};
