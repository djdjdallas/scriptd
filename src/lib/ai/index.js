// AI Service exports
import { OpenAIService } from './openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GroqProvider } from './providers/groq.js';
import { AI_MODELS, AI_PROVIDERS } from '../constants.js';

// Determine which model belongs to which provider
const MODEL_TO_PROVIDER = {
  // OpenAI models
  'gpt-5': AI_PROVIDERS.OPENAI,
  'gpt-4.1': AI_PROVIDERS.OPENAI,
  'gpt-4-turbo': AI_PROVIDERS.OPENAI,
  'gpt-4': AI_PROVIDERS.OPENAI,
  
  // Anthropic models
  'claude-4-opus-20250522': AI_PROVIDERS.ANTHROPIC,
  'claude-opus-4-1-20250805': AI_PROVIDERS.ANTHROPIC,
  'claude-3.7-sonnet-20250224': AI_PROVIDERS.ANTHROPIC,
  'claude-3-haiku-20240307': AI_PROVIDERS.ANTHROPIC,
  
  // Groq/Mixtral models
  'mistral-large-2': AI_PROVIDERS.GROQ,
  'mixtral-8x7b-32768': AI_PROVIDERS.GROQ
};

let openaiService = null;
let anthropicService = null;
let groqService = null;

export function getAIService(model = AI_MODELS.GPT4_TURBO) {
  const provider = MODEL_TO_PROVIDER[model] || AI_PROVIDERS.OPENAI;
  
  switch (provider) {
    case AI_PROVIDERS.ANTHROPIC:
      if (!anthropicService) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        console.log('[AI Service] Initializing Anthropic provider, API key present:', !!apiKey);
        if (!apiKey) {
          throw new Error('ANTHROPIC_API_KEY environment variable is not set');
        }
        anthropicService = new AnthropicProvider({
          apiKey: apiKey,
          model: model
        });
      }
      return anthropicService;
      
    case AI_PROVIDERS.GROQ:
      if (!groqService) {
        const apiKey = process.env.GROQ_API_KEY;
        console.log('[AI Service] Initializing GROQ provider, API key present:', !!apiKey);
        if (!apiKey) {
          throw new Error('GROQ_API_KEY environment variable is not set');
        }
        groqService = new GroqProvider({
          apiKey: apiKey,
          model: model
        });
      }
      return groqService;
      
    case AI_PROVIDERS.OPENAI:
    default:
      if (!openaiService) {
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('[AI Service] Initializing OpenAI provider, API key present:', !!apiKey);
        if (!apiKey) {
          throw new Error('OPENAI_API_KEY environment variable is not set');
        }
        openaiService = new OpenAIService();
      }
      return openaiService;
  }
}

export { OpenAIService } from './openai.js';
export { AnthropicProvider } from './providers/anthropic.js';
export { GroqProvider } from './providers/groq.js';