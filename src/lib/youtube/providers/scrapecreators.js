/**
 * ScrapeCreators API Provider
 *
 * Pay-per-use transcript API ($0.002 per request)
 * API Documentation: https://scrapecreators.com/docs
 */

import { apiLogger } from '@/lib/monitoring/logger';
import { withRetry, isRateLimitError, createApiError } from '@/lib/utils/retry';
import { SCRAPECREATORS_RATE_LIMITS } from '@/lib/constants';

// Track request timestamps for rate limiting
const requestTimestamps = [];
let activeRequests = 0;
let lastRequestTime = 0;

/**
 * Rate limiter for ScrapeCreators API
 */
async function acquireSlot() {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute sliding window

  // Clean up old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }

  const limits = SCRAPECREATORS_RATE_LIMITS || {
    REQUESTS_PER_MINUTE: 60,
    MAX_CONCURRENT: 5,
    INTER_REQUEST_DELAY_MS: 100
  };

  // Check per-minute limit
  if (requestTimestamps.length >= limits.REQUESTS_PER_MINUTE) {
    const waitTime = requestTimestamps[0] - windowStart + 100;
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return acquireSlot();
    }
  }

  // Check concurrent limit
  if (activeRequests >= limits.MAX_CONCURRENT) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return acquireSlot();
  }

  // Enforce minimum delay
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < limits.INTER_REQUEST_DELAY_MS) {
    await new Promise(resolve =>
      setTimeout(resolve, limits.INTER_REQUEST_DELAY_MS - timeSinceLastRequest)
    );
  }

  activeRequests++;
  lastRequestTime = Date.now();
  requestTimestamps.push(lastRequestTime);
}

function releaseSlot() {
  activeRequests = Math.max(0, activeRequests - 1);
}

/**
 * Fetch transcript using ScrapeCreators API
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Transcript result
 */
export async function fetchTranscript(videoId) {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;

  if (!apiKey) {
    throw new Error('SCRAPECREATORS_API_KEY not configured');
  }

  await acquireSlot();

  try {
    return await withRetry(
      async () => {
        const url = `https://api.scrapecreators.com/v1/youtube/transcript?videoId=${videoId}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw createApiError(
            `ScrapeCreators API error (${response.status}): ${errorText}`,
            response.status,
            response
          );
        }

        const data = await response.json();

        // Check for API-level errors
        if (data.error) {
          throw createApiError(
            `ScrapeCreators API error: ${data.error}`,
            data.status || 500,
            response
          );
        }

        // Handle different response formats
        // ScrapeCreators may return: { transcript: [...] } or { segments: [...] } or { content: [...] }
        const transcriptData = data.transcript || data.segments || data.content || data;

        if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
          throw new Error('No transcript data in response');
        }

        // Normalize format
        const segments = transcriptData.map(item => ({
          text: item.text || item.content || '',
          offset: item.offset || item.start || item.timestamp || 0,
          duration: item.duration || item.dur || 0
        }));

        const fullText = segments
          .map(s => s.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          segments,
          fullText,
          hasTranscript: true,
          source: 'scrapecreators-api',
          language: data.language || data.lang
        };
      },
      {
        maxRetries: 2,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        shouldRetry: isRateLimitError,
        onRetry: (attempt, delay, error) => {
          apiLogger.warn('ScrapeCreators API retry', {
            videoId,
            attempt,
            delayMs: delay,
            error: error.message
          });
        }
      }
    );
  } finally {
    releaseSlot();
  }
}

/**
 * Get rate limiter status
 */
export function getRateLimiterStatus() {
  const now = Date.now();
  const windowStart = now - 60000;
  const recentRequests = requestTimestamps.filter(ts => ts >= windowStart);

  const limits = SCRAPECREATORS_RATE_LIMITS || {
    REQUESTS_PER_MINUTE: 60,
    MAX_CONCURRENT: 5
  };

  return {
    requestsInLastMinute: recentRequests.length,
    activeRequests,
    maxRequestsPerMinute: limits.REQUESTS_PER_MINUTE,
    maxConcurrent: limits.MAX_CONCURRENT,
    canMakeRequest: recentRequests.length < limits.REQUESTS_PER_MINUTE
                    && activeRequests < limits.MAX_CONCURRENT
  };
}

/**
 * Provider metadata
 */
export const providerInfo = {
  id: 'scrapecreators',
  name: 'ScrapeCreators API',
  type: 'api',
  costPerRequest: 0.002
};

export default {
  fetchTranscript,
  getRateLimiterStatus,
  providerInfo
};
