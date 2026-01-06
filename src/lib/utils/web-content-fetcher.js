/**
 * Web Content Fetcher
 * Fetches full article content from URLs using Jina AI Reader (free)
 * with fallback to direct fetch for simple pages
 */

/**
 * Fetches full web content using Jina AI Reader (free, no API key needed)
 * @param {string} url - The URL to fetch content from
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - { success, content, method, wordCount, error }
 */
export async function fetchWebContent(url, options = {}) {
  const {
    timeout = 30000,
    useJina = true,
    fallbackToRaw = true,
    returnFormat = 'text' // 'text', 'markdown', or 'html'
  } = options;

  // Validate URL
  if (!url || typeof url !== 'string') {
    return {
      success: false,
      error: 'Invalid URL provided',
      content: '',
      wordCount: 0
    };
  }

  // Skip non-http(s) URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      success: false,
      error: 'Only HTTP(S) URLs are supported',
      content: '',
      wordCount: 0
    };
  }

  try {
    // Primary: Jina AI Reader (free, handles JS rendering, removes clutter)
    if (useJina) {
      try {
        const jinaResult = await fetchViaJina(url, { timeout, returnFormat });
        if (jinaResult.success) {
          return jinaResult;
        }
      } catch {
      }
    }

    // Fallback: Direct fetch (for simple pages)
    if (fallbackToRaw) {
      return await fetchDirectly(url, { timeout });
    }

    return {
      success: false,
      error: 'All fetch methods failed',
      content: '',
      wordCount: 0
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      content: '',
      wordCount: 0
    };
  }
}

/**
 * Fetch content via Jina AI Reader
 * Simple GET request to https://r.jina.ai/{URL}
 */
async function fetchViaJina(url, options = {}) {
  const { timeout = 30000, returnFormat = 'text' } = options;

  try {
    // Jina AI Reader endpoint
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': returnFormat, // text, markdown, or html
        'X-With-Generated-Alt': 'true' // Enable image alt text generation
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `Jina fetch failed: ${response.status} ${response.statusText}`,
        content: '',
        wordCount: 0
      };
    }

    const content = await response.text();
    const wordCount = countWords(content);

    // Validate we got substantial content
    if (wordCount < 50) {
      return {
        success: false,
        error: 'Content too short (may be blocked or paywalled)',
        content: '',
        wordCount: 0
      };
    }

    return {
      success: true,
      content: content,
      method: 'jina',
      wordCount: wordCount,
      url: url
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Fetch timeout',
        content: '',
        wordCount: 0
      };
    }
    throw error;
  }
}

/**
 * Direct fetch with basic HTML to text conversion
 */
async function fetchDirectly(url, options = {}) {
  const { timeout = 30000 } = options;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GenScriptBot/1.0; +https://genscript.io/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}`,
        content: '',
        wordCount: 0
      };
    }

    const html = await response.text();
    const text = htmlToText(html);
    const wordCount = countWords(text);

    if (wordCount < 50) {
      return {
        success: false,
        error: 'Content too short',
        content: '',
        wordCount: 0
      };
    }

    return {
      success: true,
      content: text,
      method: 'direct',
      wordCount: wordCount,
      url: url
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Fetch timeout',
        content: '',
        wordCount: 0
      };
    }
    throw error;
  }
}

/**
 * Convert HTML to plain text
 * Removes scripts, styles, and HTML tags while preserving content structure
 */
function htmlToText(html) {
  if (!html || typeof html !== 'string') return '';

  let text = html;

  // Remove script and style tags with their content
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Add line breaks for block elements
  text = text.replace(/<(p|div|br|h[1-6]|li|tr)[^>]*>/gi, '\n');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  };

  for (const [entity, char] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'g'), char);
  }

  // Decode numeric entities (&#123; or &#xAB;)
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Clean up whitespace
  text = text.replace(/\t/g, ' '); // Replace tabs with spaces
  text = text.replace(/ +/g, ' '); // Multiple spaces to single space
  text = text.replace(/\n +/g, '\n'); // Remove spaces at start of lines
  text = text.replace(/ \n/g, '\n'); // Remove spaces at end of lines
  text = text.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive line breaks

  return text.trim();
}

/**
 * Count words in text
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Batch fetch multiple URLs with concurrency control
 * @param {Array<string>} urls - Array of URLs to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} - Array of fetch results
 */
export async function fetchMultipleUrls(urls, options = {}) {
  const {
    maxConcurrent = 5,
    minWordCount = 100,
    timeout = 30000,
    useJina = true,
    fallbackToRaw = true,
    onProgress = null // Callback: (completed, total, currentUrl) => void
  } = options;

  const results = [];
  const total = urls.length;
  let completed = 0;

  // Process in batches to avoid overwhelming the service
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);

    const promises = batch.map(url =>
      fetchWebContent(url, {
        timeout,
        useJina,
        fallbackToRaw
      }).then(result => {
        completed++;
        if (onProgress) {
          onProgress(completed, total, url);
        }
        return { url, ...result };
      })
    );

    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const fetchResult = result.value;

        // Only include if it has substantial content
        if (fetchResult.success && fetchResult.wordCount >= minWordCount) {
          results.push(fetchResult);
        }
      }
    });
  }

  return results;
}

/**
 * Fetch content with retry logic
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Fetch result
 */
export async function fetchWithRetry(url, options = {}) {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await fetchWebContent(url, fetchOptions);

      if (result.success) {
        return result;
      }

      lastError = result.error;

      // Don't retry if it's a client error (4xx) or content issue
      if (result.error?.includes('404') ||
          result.error?.includes('403') ||
          result.error?.includes('too short')) {
        break;
      }

      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }

    } catch (error) {
      lastError = error.message;
      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  return {
    success: false,
    error: lastError || 'Max retries exceeded',
    content: '',
    wordCount: 0,
    url
  };
}

export default {
  fetchWebContent,
  fetchMultipleUrls,
  fetchWithRetry,
  htmlToText,
  countWords
};
