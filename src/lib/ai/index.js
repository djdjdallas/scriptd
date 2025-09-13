// AI Service exports - Only Claude/Anthropic models supported
import { AnthropicProvider } from './providers/anthropic.js';
import { AI_MODELS, AI_PROVIDERS, MODEL_TIERS } from '../constants.js';

// All models are Claude models now
const MODEL_TO_PROVIDER = {
  // Claude models (all use Anthropic provider)
  'claude-4-opus-20250522': AI_PROVIDERS.ANTHROPIC,
  'claude-opus-4-1-20250805': AI_PROVIDERS.ANTHROPIC,
  'claude-3-5-sonnet-20241022': AI_PROVIDERS.ANTHROPIC,
  'claude-3-5-haiku-20241022': AI_PROVIDERS.ANTHROPIC,
  
  // Legacy model names that map to Claude
  'claude-3.7-sonnet-20250224': AI_PROVIDERS.ANTHROPIC,
  'claude-3-haiku-20240307': AI_PROVIDERS.ANTHROPIC
};

let anthropicService = null;

export function getAIService(model = MODEL_TIERS.BALANCED?.actualModel || 'claude-3-5-sonnet-20241022') {
  // Always use Anthropic provider for all models
  if (!anthropicService) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('[AI Service] Initializing Anthropic provider for model:', model, 'API key present:', !!apiKey);
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropicService = new AnthropicProvider({
      apiKey: apiKey,
      model: model
    });
  }
  return anthropicService;
}

// Only export Anthropic provider
export { AnthropicProvider } from './providers/anthropic.js';