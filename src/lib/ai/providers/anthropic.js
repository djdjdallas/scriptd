/**
 * Anthropic Claude Provider Implementation
 * @module lib/ai/providers/anthropic
 */

import { BaseAIProvider } from './base.js';

/**
 * Anthropic API provider for Claude models
 * @extends BaseAIProvider
 */
export class AnthropicProvider extends BaseAIProvider {
  /**
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - Anthropic API key
   * @param {string} [config.model='claude-3-opus-20240229'] - Default model to use
   * @param {string} [config.baseURL='https://api.anthropic.com'] - Base URL for API
   * @param {string} [config.version='2023-06-01'] - API version
   */
  constructor(config) {
    super(config);
    this.baseURL = config.baseURL || 'https://api.anthropic.com';
    this.version = config.version || '2023-06-01';
    this.model = config.model || 'claude-3-opus-20240229';
    
    // Model pricing (per 1K tokens)
    this.pricing = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      'claude-2.1': { input: 0.008, output: 0.024 },
      'claude-2.0': { input: 0.008, output: 0.024 },
      'claude-instant-1.2': { input: 0.0008, output: 0.0024 }
    };
  }

  /**
   * Generate text completion (converts to chat format for Claude)
   * @param {Object} options - Generation options
   * @returns {Promise<Object|AsyncGenerator>} Response object or stream
   */
  async generateCompletion(options) {
    // Claude doesn't have a separate completion endpoint, convert to chat format
    const messages = [{
      role: 'user',
      content: options.prompt
    }];

    return this.generateChatCompletion({
      ...options,
      messages
    });
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
      topK = null,
      system = null,
      stopSequences = null,
      metadata = null
    } = options;

    const body = {
      model,
      messages: this._formatMessagesForClaude(messages),
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      stream
    };

    if (system) body.system = system;
    if (topK !== null) body.top_k = topK;
    if (stopSequences) body.stop_sequences = stopSequences;
    if (metadata) body.metadata = metadata;

    if (stream) {
      return this._streamChatCompletion('/v1/messages', body);
    }

    const response = await this._retry(this._makeRequest, ['/v1/messages', body]);
    return this._formatChatResponse(response, model);
  }

  /**
   * Count tokens in text
   * @param {string} text - Text to count tokens for
   * @param {string} [model] - Model to use for counting
   * @returns {Promise<number>} Token count
   */
  async countTokens(text, model = this.model) {
    this._validateApiKey();
    
    // Use the token counting endpoint
    const response = await this._retry(this._makeRequest, ['/v1/messages/count_tokens', {
      model,
      messages: [{ role: 'user', content: text }]
    }]);

    return response.input_tokens;
  }

  /**
   * Estimate cost for generation
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @param {string} [model] - Model used
   * @returns {number} Estimated cost in USD
   */
  estimateCost(inputTokens, outputTokens, model = this.model) {
    const pricing = this.pricing[model] || this.pricing['claude-3-sonnet-20240229'];
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
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
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': this.version
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      const err = new Error(error.error?.message || `Anthropic API error: ${response.status}`);
      err.status = response.status;
      err.data = error;
      throw err;
    }

    return response.json();
  }

  /**
   * Stream chat completion
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {AsyncGenerator} Stream generator
   */
  async* _streamChatCompletion(endpoint, body) {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': this.version
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      const err = new Error(error.error?.message || `Anthropic API error: ${response.status}`);
      err.status = response.status;
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let usage = { input: 0, output: 0 };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content_block_delta') {
                const content = data.delta.text;
                fullContent += content;
                yield {
                  type: 'content',
                  content,
                  accumulated: fullContent
                };
              } else if (data.type === 'message_start') {
                usage.input = data.message.usage.input_tokens;
              } else if (data.type === 'message_delta') {
                usage.output = data.usage.output_tokens;
              } else if (data.type === 'message_stop') {
                yield {
                  type: 'done',
                  content: fullContent,
                  usage: {
                    promptTokens: usage.input,
                    completionTokens: usage.output,
                    totalTokens: usage.input + usage.output
                  },
                  cost: this.estimateCost(usage.input, usage.output, body.model)
                };
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
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
    const text = response.content[0].text;
    const usage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens
    };

    return {
      text,
      usage,
      model,
      cost: this.estimateCost(usage.promptTokens, usage.completionTokens, model),
      metadata: {
        id: response.id,
        type: response.type,
        role: response.role,
        stopReason: response.stop_reason,
        stopSequence: response.stop_sequence
      }
    };
  }

  /**
   * Format messages for Claude API
   * @private
   * @param {Array<Object>} messages - Messages to format
   * @returns {Array<Object>} Formatted messages
   */
  _formatMessagesForClaude(messages) {
    // Claude doesn't support system messages in the messages array
    // They should be passed separately as the 'system' parameter
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
  }

  /**
   * Check if error should not be retried
   * @protected
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is non-retryable
   */
  _isNonRetryableError(error) {
    const nonRetryableStatuses = [400, 401, 403, 404];
    const nonRetryableTypes = [
      'invalid_request_error',
      'authentication_error',
      'permission_error',
      'not_found_error'
    ];

    if (error.status && nonRetryableStatuses.includes(error.status)) {
      return true;
    }

    if (error.data?.error?.type && nonRetryableTypes.includes(error.data.error.type)) {
      return true;
    }

    return false;
  }
}