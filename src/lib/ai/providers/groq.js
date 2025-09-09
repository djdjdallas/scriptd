/**
 * GROQ Provider Implementation for Mistral AI Models
 * @module lib/ai/providers/groq
 */

import { BaseAIProvider } from './base.js';

/**
 * GROQ API provider for Mistral/Mixtral models
 * @extends BaseAIProvider
 */
export class GroqProvider extends BaseAIProvider {
  /**
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - GROQ API key
   * @param {string} [config.model='mistral-large-2'] - Default model to use
   * @param {string} [config.baseURL='https://api.groq.com/openai/v1'] - Base URL for API
   */
  constructor(config) {
    super(config);
    this.baseURL = config.baseURL || 'https://api.groq.com/openai/v1';
    this.model = config.model || 'mistral-large-2';
    
    // Model pricing (per 1M tokens) - GROQ pricing
    this.pricing = {
      'mistral-large-2': { input: 0.27, output: 0.27 },
      'mixtral-8x7b-32768': { input: 0.27, output: 0.27 },
      'llama3-70b-8192': { input: 0.59, output: 0.79 },
      'llama3-8b-8192': { input: 0.05, output: 0.10 },
      'gemma-7b-it': { input: 0.10, output: 0.10 }
    };
  }

  /**
   * Generate text completion
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Response object
   */
  async generateCompletion(options) {
    // GROQ primarily uses chat completions, convert to chat format
    const chatOptions = {
      ...options,
      messages: [
        { role: 'user', content: options.prompt }
      ]
    };
    return this.generateChatCompletion(chatOptions);
  }

  /**
   * Generate chat completion
   * @param {Object} options - Chat options
   * @returns {Promise<Object|AsyncGenerator>} Response object or stream
   */
  async generateChatCompletion(options) {
    this._validateApiKey();
    
    const {
      messages,
      model = this.model,
      maxTokens = 2000,
      temperature = 0.7,
      stream = false,
      topP = 1,
      stop = null,
      seed = null,
      user = null
    } = options;

    const body = {
      model,
      messages: this._formatMessages(messages),
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      stream
    };

    if (stop) {
      body.stop = stop;
    }

    if (seed !== null) {
      body.seed = seed;
    }

    if (user) {
      body.user = user;
    }

    if (stream) {
      return this._streamChatCompletion(body);
    }

    const response = await this._retry(this._makeRequest, ['/chat/completions', body]);
    return this._formatChatResponse(response, model);
  }

  /**
   * Count tokens in text (approximate for GROQ)
   * @param {string} text - Text to count tokens for
   * @param {string} [model] - Model to use for counting
   * @returns {Promise<number>} Token count
   */
  async countTokens(text, model) {
    // Rough approximation: 1 token ≈ 4 characters for Mistral models
    return Math.ceil(text.length / 4);
  }

  /**
   * Estimate cost for generation
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @param {string} [model] - Model used
   * @returns {number} Estimated cost in USD
   */
  estimateCost(inputTokens, outputTokens, model = this.model) {
    const pricing = this.pricing[model];
    if (!pricing) {
      console.warn(`No pricing information for model ${model}`);
      return 0;
    }

    // GROQ pricing is per 1M tokens
    const inputCost = (inputTokens / 1000000) * pricing.input;
    const outputCost = (outputTokens / 1000000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Make API request
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async _makeRequest(endpoint, body) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error?.message || error.message || `GROQ API error: ${response.status}`;
      const apiError = new Error(errorMessage);
      apiError.status = response.status;
      apiError.response = error;
      throw apiError;
    }

    return response.json();
  }

  /**
   * Stream chat completion
   * @private
   * @param {Object} body - Request body
   * @returns {AsyncGenerator} Stream of response chunks
   */
  async *_streamChatCompletion(body) {
    const url = `${this.baseURL}/chat/completions`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error?.message || error.message || `GROQ API error: ${response.status}`;
      const apiError = new Error(errorMessage);
      apiError.status = response.status;
      apiError.response = error;
      throw apiError;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const chunk = JSON.parse(data);
            if (chunk.choices?.[0]?.delta?.content) {
              yield {
                content: chunk.choices[0].delta.content,
                role: chunk.choices[0].delta.role,
                finish_reason: chunk.choices[0].finish_reason
              };
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
    }
  }

  /**
   * Format chat response
   * @private
   * @param {Object} response - API response
   * @param {string} model - Model used
   * @returns {Object} Formatted response
   */
  _formatChatResponse(response, model) {
    const choice = response.choices[0];
    const usage = response.usage || {};

    return {
      text: choice.message.content,
      role: choice.message.role,
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      },
      model: response.model || model,
      cost: this.estimateCost(
        usage.prompt_tokens || 0,
        usage.completion_tokens || 0,
        response.model || model
      ),
      metadata: {
        finishReason: choice.finish_reason,
        systemFingerprint: response.system_fingerprint,
        created: response.created
      }
    };
  }

  /**
   * Check if error should not be retried
   * @protected
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is non-retryable
   */
  _isNonRetryableError(error) {
    // GROQ-specific non-retryable errors
    const nonRetryableStatuses = [400, 401, 403, 404, 413];
    const nonRetryableMessages = [
      'invalid_api_key',
      'model_not_found',
      'context_length_exceeded',
      'rate_limit_exceeded'
    ];

    if (error.status && nonRetryableStatuses.includes(error.status)) {
      return true;
    }

    if (error.response?.error?.type) {
      return nonRetryableMessages.includes(error.response.error.type);
    }

    return false;
  }
}

/**
 * Supported GROQ models
 */
export const GROQ_MODELS = {
  MISTRAL_LARGE: 'mistral-large-2',
  MIXTRAL: 'mixtral-8x7b-32768',
  LLAMA3_70B: 'llama3-70b-8192',
  LLAMA3_8B: 'llama3-8b-8192',
  GEMMA_7B: 'gemma-7b-it'
};