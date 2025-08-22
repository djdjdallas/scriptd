/**
 * Base AI Provider Interface
 * @module lib/ai/providers/base
 */

/**
 * Base class for AI providers
 * @abstract
 */
export class BaseAIProvider {
  /**
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - API key for the provider
   * @param {string} [config.model] - Default model to use
   * @param {number} [config.maxRetries=3] - Maximum number of retries
   * @param {number} [config.retryDelay=1000] - Delay between retries in ms
   */
  constructor(config) {
    if (new.target === BaseAIProvider) {
      throw new Error('BaseAIProvider is an abstract class and cannot be instantiated directly');
    }

    this.apiKey = config.apiKey;
    this.model = config.model;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Generate text completion
   * @abstract
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to generate from
   * @param {string} [options.model] - Model to use (overrides default)
   * @param {number} [options.maxTokens] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Temperature for generation
   * @param {boolean} [options.stream=false] - Whether to stream the response
   * @returns {Promise<Object|AsyncGenerator>} Response object or stream
   */
  async generateCompletion(options) {
    throw new Error('generateCompletion must be implemented by subclass');
  }

  /**
   * Generate chat completion
   * @abstract
   * @param {Object} options - Chat options
   * @param {Array<Object>} options.messages - Array of message objects
   * @param {string} [options.model] - Model to use (overrides default)
   * @param {number} [options.maxTokens] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Temperature for generation
   * @param {boolean} [options.stream=false] - Whether to stream the response
   * @returns {Promise<Object|AsyncGenerator>} Response object or stream
   */
  async generateChatCompletion(options) {
    throw new Error('generateChatCompletion must be implemented by subclass');
  }

  /**
   * Count tokens in text
   * @abstract
   * @param {string} text - Text to count tokens for
   * @param {string} [model] - Model to use for counting (some providers have model-specific tokenizers)
   * @returns {Promise<number>} Token count
   */
  async countTokens(text, model) {
    throw new Error('countTokens must be implemented by subclass');
  }

  /**
   * Estimate cost for generation
   * @abstract
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @param {string} [model] - Model used
   * @returns {number} Estimated cost in USD
   */
  estimateCost(inputTokens, outputTokens, model) {
    throw new Error('estimateCost must be implemented by subclass');
  }

  /**
   * Retry logic wrapper
   * @protected
   * @param {Function} fn - Function to retry
   * @param {Array} args - Arguments to pass to function
   * @returns {Promise<*>} Result of function
   */
  async _retry(fn, args = []) {
    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this._isNonRetryableError(error)) {
          throw error;
        }
        
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if error should not be retried
   * @protected
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is non-retryable
   */
  _isNonRetryableError(error) {
    // Override in subclasses for provider-specific logic
    const nonRetryableStatuses = [400, 401, 403, 404];
    return error.status && nonRetryableStatuses.includes(error.status);
  }

  /**
   * Validate API key
   * @protected
   * @throws {Error} If API key is invalid
   */
  _validateApiKey() {
    if (!this.apiKey) {
      throw new Error(`API key is required for ${this.constructor.name}`);
    }
  }

  /**
   * Format messages for provider
   * @protected
   * @param {Array<Object>} messages - Messages to format
   * @returns {Array<Object>} Formatted messages
   */
  _formatMessages(messages) {
    // Default implementation, can be overridden by subclasses
    return messages.map(msg => ({
      role: msg.role || 'user',
      content: msg.content
    }));
  }
}

/**
 * Token usage information
 * @typedef {Object} TokenUsage
 * @property {number} promptTokens - Tokens used in prompt
 * @property {number} completionTokens - Tokens used in completion
 * @property {number} totalTokens - Total tokens used
 */

/**
 * Generation response
 * @typedef {Object} GenerationResponse
 * @property {string} text - Generated text
 * @property {TokenUsage} usage - Token usage information
 * @property {string} model - Model used
 * @property {number} [cost] - Estimated cost in USD
 * @property {Object} [metadata] - Additional provider-specific metadata
 */

/**
 * Message object
 * @typedef {Object} Message
 * @property {string} role - Role of the message sender ('system', 'user', 'assistant')
 * @property {string} content - Content of the message
 */