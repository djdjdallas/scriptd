/**
 * Main AI Service
 * @module lib/ai
 */

import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';

/**
 * Task types for provider selection
 */
export const TaskType = {
  SCRIPT_GENERATION: 'script_generation',
  TITLE_GENERATION: 'title_generation',
  HOOK_GENERATION: 'hook_generation',
  VOICE_MATCHING: 'voice_matching',
  GENERAL: 'general'
};

/**
 * Provider types
 */
export const ProviderType = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic'
};

/**
 * AI Service class for managing multiple AI providers
 */
export class AIService {
  /**
   * @param {Object} config - Service configuration
   * @param {Object} config.providers - Provider configurations
   * @param {Object} [config.providers.openai] - OpenAI configuration
   * @param {Object} [config.providers.anthropic] - Anthropic configuration
   * @param {Object} [config.taskProviders] - Map of task types to preferred providers
   * @param {boolean} [config.enableLogging=true] - Enable logging
   * @param {Function} [config.logger=console.log] - Logger function
   */
  constructor(config = {}) {
    this.providers = {};
    this.enableLogging = config.enableLogging !== false;
    this.logger = config.logger || console.log;
    
    // Initialize providers
    if (config.providers?.openai) {
      this.providers[ProviderType.OPENAI] = new OpenAIProvider(config.providers.openai);
    }
    
    if (config.providers?.anthropic) {
      this.providers[ProviderType.ANTHROPIC] = new AnthropicProvider(config.providers.anthropic);
    }
    
    // Default task-to-provider mapping
    this.taskProviders = {
      [TaskType.SCRIPT_GENERATION]: ProviderType.ANTHROPIC,
      [TaskType.TITLE_GENERATION]: ProviderType.OPENAI,
      [TaskType.HOOK_GENERATION]: ProviderType.ANTHROPIC,
      [TaskType.VOICE_MATCHING]: ProviderType.ANTHROPIC,
      [TaskType.GENERAL]: ProviderType.OPENAI,
      ...config.taskProviders
    };
    
    // Usage tracking
    this.usageStats = {
      totalTokens: 0,
      totalCost: 0,
      requests: 0,
      errors: 0,
      byProvider: {}
    };
  }

  /**
   * Initialize from environment variables
   * @static
   * @returns {AIService} Configured AI service instance
   */
  static fromEnv() {
    const config = {
      providers: {}
    };

    if (process.env.OPENAI_API_KEY) {
      config.providers.openai = {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
        organization: process.env.OPENAI_ORGANIZATION
      };
    }

    if (process.env.ANTHROPIC_API_KEY) {
      config.providers.anthropic = {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL
      };
    }

    return new AIService(config);
  }

  /**
   * Generate text using the appropriate provider
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to generate from
   * @param {string} [options.taskType=TaskType.GENERAL] - Type of task
   * @param {string} [options.provider] - Override provider selection
   * @param {string} [options.model] - Override model selection
   * @param {number} [options.maxTokens] - Maximum tokens to generate
   * @param {number} [options.temperature] - Temperature for generation
   * @param {boolean} [options.stream=false] - Whether to stream the response
   * @param {Object} [options.metadata] - Additional metadata for tracking
   * @returns {Promise<Object|AsyncGenerator>} Response object or stream
   */
  async generate(options) {
    const {
      taskType = TaskType.GENERAL,
      provider: overrideProvider,
      metadata = {},
      ...generationOptions
    } = options;

    const providerId = overrideProvider || this.taskProviders[taskType] || ProviderType.OPENAI;
    const provider = this.providers[providerId];

    if (!provider) {
      throw new Error(`Provider ${providerId} is not configured`);
    }

    const startTime = Date.now();
    
    try {
      this._log('info', `Generating with ${providerId} for task: ${taskType}`);
      
      let result;
      if (options.messages) {
        result = await provider.generateChatCompletion(generationOptions);
      } else {
        result = await provider.generateCompletion(generationOptions);
      }

      // Track usage for non-streaming responses
      if (!options.stream) {
        this._trackUsage(providerId, result, metadata);
      }

      const duration = Date.now() - startTime;
      this._log('info', `Generation completed in ${duration}ms`);

      return result;
    } catch (error) {
      this.usageStats.errors++;
      this._log('error', `Generation failed: ${error.message}`, { error, providerId, taskType });
      throw error;
    }
  }

  /**
   * Generate chat completion
   * @param {Object} options - Chat options
   * @param {Array<Object>} options.messages - Array of message objects
   * @param {string} [options.taskType=TaskType.GENERAL] - Type of task
   * @param {string} [options.provider] - Override provider selection
   * @returns {Promise<Object|AsyncGenerator>} Response object or stream
   */
  async chat(options) {
    return this.generate({
      ...options,
      messages: options.messages
    });
  }

  /**
   * Generate with streaming
   * @param {Object} options - Generation options
   * @returns {AsyncGenerator} Stream generator
   */
  async* generateStream(options) {
    const stream = await this.generate({
      ...options,
      stream: true
    });

    let usage = null;
    let cost = null;

    for await (const chunk of stream) {
      yield chunk;
      
      // Capture final usage stats
      if (chunk.type === 'done') {
        usage = chunk.usage;
        cost = chunk.cost;
      }
    }

    // Track usage after stream completes
    if (usage) {
      const providerId = options.provider || this.taskProviders[options.taskType] || ProviderType.OPENAI;
      this._trackUsage(providerId, { usage, cost }, options.metadata || {});
    }
  }

  /**
   * Count tokens for text
   * @param {string} text - Text to count tokens for
   * @param {Object} options - Options
   * @param {string} [options.provider] - Provider to use for counting
   * @param {string} [options.model] - Model to use for counting
   * @returns {Promise<number>} Token count
   */
  async countTokens(text, options = {}) {
    const providerId = options.provider || ProviderType.OPENAI;
    const provider = this.providers[providerId];

    if (!provider) {
      throw new Error(`Provider ${providerId} is not configured`);
    }

    return provider.countTokens(text, options.model);
  }

  /**
   * Estimate cost for generation
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @param {Object} options - Options
   * @param {string} [options.provider] - Provider to estimate for
   * @param {string} [options.model] - Model to estimate for
   * @returns {number} Estimated cost in USD
   */
  estimateCost(inputTokens, outputTokens, options = {}) {
    const providerId = options.provider || ProviderType.OPENAI;
    const provider = this.providers[providerId];

    if (!provider) {
      throw new Error(`Provider ${providerId} is not configured`);
    }

    return provider.estimateCost(inputTokens, outputTokens, options.model);
  }

  /**
   * Get usage statistics
   * @returns {Object} Usage statistics
   */
  getUsageStats() {
    return {
      ...this.usageStats,
      averageCostPerRequest: this.usageStats.requests > 0 
        ? this.usageStats.totalCost / this.usageStats.requests 
        : 0,
      averageTokensPerRequest: this.usageStats.requests > 0
        ? this.usageStats.totalTokens / this.usageStats.requests
        : 0,
      errorRate: this.usageStats.requests > 0
        ? this.usageStats.errors / this.usageStats.requests
        : 0
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats() {
    this.usageStats = {
      totalTokens: 0,
      totalCost: 0,
      requests: 0,
      errors: 0,
      byProvider: {}
    };
  }

  /**
   * Get available providers
   * @returns {Array<string>} List of configured provider IDs
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if a provider is available
   * @param {string} providerId - Provider ID to check
   * @returns {boolean} Whether provider is available
   */
  hasProvider(providerId) {
    return !!this.providers[providerId];
  }

  /**
   * Update task provider mapping
   * @param {string} taskType - Task type
   * @param {string} providerId - Provider ID
   */
  setTaskProvider(taskType, providerId) {
    if (!this.providers[providerId]) {
      throw new Error(`Provider ${providerId} is not configured`);
    }
    this.taskProviders[taskType] = providerId;
  }

  /**
   * Track usage statistics
   * @private
   * @param {string} providerId - Provider ID
   * @param {Object} result - Generation result
   * @param {Object} metadata - Additional metadata
   */
  _trackUsage(providerId, result, metadata) {
    this.usageStats.requests++;
    
    if (result.usage) {
      this.usageStats.totalTokens += result.usage.totalTokens;
    }
    
    if (result.cost) {
      this.usageStats.totalCost += result.cost;
    }

    // Track by provider
    if (!this.usageStats.byProvider[providerId]) {
      this.usageStats.byProvider[providerId] = {
        requests: 0,
        tokens: 0,
        cost: 0
      };
    }

    this.usageStats.byProvider[providerId].requests++;
    if (result.usage) {
      this.usageStats.byProvider[providerId].tokens += result.usage.totalTokens;
    }
    if (result.cost) {
      this.usageStats.byProvider[providerId].cost += result.cost;
    }

    // Log usage if metadata includes tracking info
    if (metadata.trackingId || metadata.userId) {
      this._log('debug', 'Usage tracked', {
        providerId,
        tokens: result.usage?.totalTokens,
        cost: result.cost,
        ...metadata
      });
    }
  }

  /**
   * Log message
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} [data] - Additional data
   */
  _log(level, message, data) {
    if (!this.enableLogging) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };

    this.logger(logEntry);
  }
}

// Export default instance configured from environment
export const ai = AIService.fromEnv();