/**
 * Retry utility with exponential backoff for API calls
 */

/**
 * Check if an error is a rate limit (429) error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's a rate limit error
 */
export function isRateLimitError(error) {
  return error?.status === 429 ||
         error?.message?.includes('429') ||
         error?.message?.toLowerCase().includes('rate limit') ||
         error?.message?.toLowerCase().includes('limit-exceeded');
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.baseDelayMs - Initial delay in milliseconds (default: 1000)
 * @param {number} options.maxDelayMs - Maximum delay in milliseconds (default: 8000)
 * @param {Function} options.shouldRetry - Function to determine if error is retryable (default: isRateLimitError)
 * @param {Function} options.onRetry - Optional callback called before each retry
 * @returns {Promise} - Result of the function or throws after max retries
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 8000,
    shouldRetry = isRateLimitError,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);

      // If 429 with Retry-After header, use that instead
      if (error.retryAfter) {
        delay = Math.min(error.retryAfter * 1000, maxDelayMs);
      }

      // Optional callback for logging/progress tracking
      if (onRetry) {
        onRetry(attempt + 1, delay, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Create an error with rate limit metadata
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Response} response - Optional fetch Response to extract Retry-After header
 * @returns {Error} - Error with status and retryAfter properties
 */
export function createApiError(message, status, response = null) {
  const error = new Error(message);
  error.status = status;

  if (response && status === 429) {
    const retryAfter = response.headers?.get('Retry-After');
    if (retryAfter) {
      error.retryAfter = parseInt(retryAfter, 10);
    }
  }

  return error;
}
