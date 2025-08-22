/**
 * OpenAI Provider Implementation
 * @module lib/ai/providers/openai
 */

import { BaseAIProvider } from './base.js';

/**
 * OpenAI API provider
 * @extends BaseAIProvider
 */
export class OpenAIProvider extends BaseAIProvider {
  /**
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - OpenAI API key
   * @param {string} [config.model='gpt-4-turbo-preview'] - Default model to use
   * @param {string} [config.baseURL='https://api.openai.com/v1'] - Base URL for API
   * @param {string} [config.organization] - OpenAI organization ID
   */
  constructor(config) {
    super(config);
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.organization = config.organization;
    this.model = config.model || 'gpt-4-turbo-preview';
    
    // Model pricing (per 1K tokens)
    this.pricing = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-32k': { input: 0.06, output: 0.12 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 }
    };
  }

  /**
   * Generate text completion
   * @param {Object} options - Generation options
   * @returns {Promise<Object|AsyncGenerator>} Response object or stream
   */
  async generateCompletion(options) {
    this._validateApiKey();
    
    const {
      prompt,
      model = this.model,
      maxTokens = 2000,
      temperature = 0.7,
      stream = false,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stop = null
    } = options;

    const body = {
      model,
      prompt,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream
    };

    if (stop) {
      body.stop = stop;
    }

    if (stream) {
      return this._streamCompletion('/completions', body);
    }

    const response = await this._retry(this._makeRequest, ['/completions', body]);
    return this._formatCompletionResponse(response, model);
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
      frequencyPenalty = 0,
      presencePenalty = 0,
      stop = null,
      functions = null,
      functionCall = null,
      responseFormat = null
    } = options;

    const body = {
      model,
      messages: this._formatMessages(messages),
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream
    };

    if (stop) body.stop = stop;
    if (functions) body.functions = functions;
    if (functionCall) body.function_call = functionCall;
    if (responseFormat) body.response_format = responseFormat;

    if (stream) {
      return this._streamChatCompletion('/chat/completions', body);
    }

    const response = await this._retry(this._makeRequest, ['/chat/completions', body]);
    return this._formatChatResponse(response, model);
  }

  /**
   * Count tokens in text
   * @param {string} text - Text to count tokens for
   * @param {string} [model] - Model to use for counting
   * @returns {Promise<number>} Token count
   */
  async countTokens(text, model = this.model) {
    // Rough estimation - OpenAI doesn't provide a token counting endpoint
    // In production, you'd want to use tiktoken library
    const wordsPerToken = 0.75;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerToken);
  }

  /**
   * Estimate cost for generation
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @param {string} [model] - Model used
   * @returns {number} Estimated cost in USD
   */
  estimateCost(inputTokens, outputTokens, model = this.model) {
    const pricing = this.pricing[model] || this.pricing['gpt-3.5-turbo'];
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
      'Authorization': `Bearer ${this.apiKey}`
    };

    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      const err = new Error(error.error?.message || `OpenAI API error: ${response.status}`);
      err.status = response.status;
      err.data = error;
      throw err;
    }

    return response.json();
  }

  /**
   * Stream completion
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {AsyncGenerator} Stream generator
   */
  async* _streamCompletion(endpoint, body) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      const err = new Error(error.error?.message || `OpenAI API error: ${response.status}`);
      err.status = response.status;
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
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
   * Stream chat completion
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {AsyncGenerator} Stream generator
   */
  async* _streamChatCompletion(endpoint, body) {
    let totalTokens = { prompt: 0, completion: 0 };
    let fullContent = '';

    for await (const chunk of this._streamCompletion(endpoint, body)) {
      if (chunk.choices && chunk.choices[0]) {
        const delta = chunk.choices[0].delta;
        if (delta.content) {
          fullContent += delta.content;
          yield {
            type: 'content',
            content: delta.content,
            accumulated: fullContent
          };
        }
        if (delta.function_call) {
          yield {
            type: 'function_call',
            functionCall: delta.function_call
          };
        }
      }
      
      if (chunk.usage) {
        totalTokens = {
          prompt: chunk.usage.prompt_tokens,
          completion: chunk.usage.completion_tokens
        };
      }
    }

    // Final yield with complete information
    yield {
      type: 'done',
      content: fullContent,
      usage: {
        promptTokens: totalTokens.prompt,
        completionTokens: totalTokens.completion,
        totalTokens: totalTokens.prompt + totalTokens.completion
      },
      cost: this.estimateCost(totalTokens.prompt, totalTokens.completion, body.model)
    };
  }

  /**
   * Format completion response
   * @private
   * @param {Object} response - API response
   * @param {string} model - Model used
   * @returns {Object} Formatted response
   */
  _formatCompletionResponse(response, model) {
    const text = response.choices[0].text;
    const usage = {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    };

    return {
      text,
      usage,
      model,
      cost: this.estimateCost(usage.promptTokens, usage.completionTokens, model),
      metadata: {
        id: response.id,
        created: response.created,
        finishReason: response.choices[0].finish_reason
      }
    };
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
    const text = choice.message.content;
    const usage = {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    };

    const result = {
      text,
      usage,
      model,
      cost: this.estimateCost(usage.promptTokens, usage.completionTokens, model),
      metadata: {
        id: response.id,
        created: response.created,
        finishReason: choice.finish_reason,
        role: choice.message.role
      }
    };

    if (choice.message.function_call) {
      result.functionCall = choice.message.function_call;
    }

    return result;
  }

  /**
   * Check if error should not be retried
   * @protected
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is non-retryable
   */
  _isNonRetryableError(error) {
    const nonRetryableStatuses = [400, 401, 403, 404];
    const nonRetryableMessages = [
      'invalid_api_key',
      'insufficient_quota',
      'model_not_found'
    ];

    if (error.status && nonRetryableStatuses.includes(error.status)) {
      return true;
    }

    if (error.data?.error?.type && nonRetryableMessages.includes(error.data.error.type)) {
      return true;
    }

    return false;
  }
}