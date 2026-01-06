// AI Service exports - Only Claude/Anthropic models supported
import { AnthropicProvider } from './providers/anthropic.js';
import { AI_MODELS, AI_PROVIDERS, MODEL_TIERS } from '../constants.js';

// All models are Claude models now
const MODEL_TO_PROVIDER = {
  // Claude 3 legacy models (all use Anthropic provider)
  'claude-3-opus-20240229': AI_PROVIDERS.ANTHROPIC,
  'claude-3-sonnet-20240229': AI_PROVIDERS.ANTHROPIC,
  'claude-3-haiku-20240307': AI_PROVIDERS.ANTHROPIC,
  // Claude 3.5 and Claude 4+ models
  'claude-3-5-haiku-20241022': AI_PROVIDERS.ANTHROPIC,
  'claude-sonnet-4-5-20250929': AI_PROVIDERS.ANTHROPIC,
  'claude-opus-4-1-20250805': AI_PROVIDERS.ANTHROPIC,
  'claude-sonnet-4-5-20250929': AI_PROVIDERS.ANTHROPIC
};

let anthropicService = null;

export function getAIService(model = MODEL_TIERS.BALANCED?.actualModel || process.env.BALANCED_MODEL || 'claude-sonnet-4-5-20250929') {
  // Always use Anthropic provider for all models
  if (!anthropicService) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
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