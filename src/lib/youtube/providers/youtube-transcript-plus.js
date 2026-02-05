/**
 * YouTube Transcript Plus Provider
 *
 * Uses the youtube-transcript-plus npm package which supports:
 * - Custom proxy configuration
 * - Custom headers
 * - Better error handling
 */

import { apiLogger } from '@/lib/monitoring/logger';

// Dynamic import to handle potential ESM issues
let YoutubeTranscriptPlus = null;

async function getTranscriptModule() {
  if (!YoutubeTranscriptPlus) {
    try {
      const module = await import('youtube-transcript-plus');
      YoutubeTranscriptPlus = module.YoutubeTranscript || module.default?.YoutubeTranscript || module.default;
    } catch (error) {
      apiLogger.error('Failed to load youtube-transcript-plus module', error);
      throw new Error('youtube-transcript-plus module not available');
    }
  }
  return YoutubeTranscriptPlus;
}

/**
 * Fetch transcript using youtube-transcript-plus
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Transcript result
 */
export async function fetchTranscript(videoId) {
  const YTTranscript = await getTranscriptModule();

  // Build config options
  const config = {};

  // Add proxy if configured
  const proxyUrl = process.env.TRANSCRIPT_PLUS_PROXY_URL;
  if (proxyUrl) {
    config.proxy = proxyUrl;
  }

  let transcript = null;
  let lastError = null;

  // Try different language configurations
  const attempts = [
    { config: { ...config }, name: 'default' },
    { config: { ...config, lang: 'en' }, name: 'lang: en' },
    { config: { ...config, country: 'US' }, name: 'country: US' },
    { config: { ...config, lang: 'en', country: 'US' }, name: 'lang: en, country: US' }
  ];

  for (const attempt of attempts) {
    try {
      transcript = await YTTranscript.fetchTranscript(videoId, attempt.config);

      if (transcript && transcript.length > 0) {
        break;
      }
    } catch (error) {
      lastError = error;

      // If it's a "transcript disabled" error, don't retry with different configs
      if (error.message?.includes('disabled') || error.message?.includes('not available')) {
        break;
      }
    }
  }

  if (!transcript || transcript.length === 0) {
    throw lastError || new Error('No transcript found');
  }

  // Normalize the transcript format
  const segments = transcript.map(segment => ({
    text: segment.text || segment.content,
    offset: segment.offset || segment.start || 0,
    duration: segment.duration || segment.dur || 0
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
    source: 'youtube-transcript-plus'
  };
}

/**
 * Provider metadata
 */
export const providerInfo = {
  id: 'youtube-transcript-plus',
  name: 'YouTube Transcript Plus',
  type: 'scraper',
  supportsProxy: true
};

export default {
  fetchTranscript,
  providerInfo
};
