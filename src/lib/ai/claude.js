import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model configurations
export const MODELS = {
  CLAUDE_OPUS: 'claude-opus-4-20250514',
  CLAUDE_SONNET: 'claude-sonnet-4-20250514',
  CLAUDE_HAIKU: 'claude-3-haiku-20240307',
};

// Common system prompts
export const SYSTEM_PROMPTS = {
  SEO_OPTIMIZER: `You are an SEO optimization expert specializing in YouTube content. 
    Your task is to analyze content and provide optimized titles, descriptions, and tags 
    that will improve search visibility while maintaining authenticity and engagement.`,
  
  SCRIPT_WRITER: `You are a professional script writer with expertise in creating engaging, 
    well-structured content for various formats including YouTube videos, podcasts, and presentations.`,
  
  CONTENT_ANALYZER: `You are a content analysis expert. Your task is to analyze text content 
    and extract key insights, themes, and actionable recommendations.`,
};

// Claude service class
export class ClaudeService {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY) {
    this.client = new Anthropic({ apiKey });
  }

  // Generate text completion
  async generateCompletion(prompt, options = {}) {
    const {
      model = MODELS.CLAUDE_SONNET,
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = null,
      ...otherOptions
    } = options;

    try {
      const message = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt || undefined,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        ...otherOptions,
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to generate completion: ${error.message}`);
    }
  }

  // Stream completion
  async streamCompletion(prompt, options = {}, onChunk) {
    const {
      model = MODELS.CLAUDE_SONNET,
      temperature = 0.7,
      systemPrompt = null,
      ...otherOptions
    } = options;

    try {
      const stream = await this.client.messages.create({
        model,
        max_tokens: 1000,
        temperature,
        system: systemPrompt || undefined,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
        ...otherOptions,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const content = chunk.delta?.text || '';
          if (content) {
            onChunk(content);
          }
        }
      }
    } catch (error) {
      console.error('Claude streaming error:', error);
      throw new Error(`Failed to stream completion: ${error.message}`);
    }
  }

  // Analyze content for SEO
  async optimizeForSEO(content, platform = 'youtube') {
    const prompt = `Analyze the following content and provide SEO optimization suggestions for ${platform}:

Content: ${content}

Please provide:
1. An optimized title (60 characters or less)
2. An engaging description (first 125 characters are crucial)
3. Relevant tags/keywords (10-15 tags)
4. Key improvements for better visibility

Format the response as JSON.`;

    const response = await this.generateCompletion(prompt, {
      model: MODELS.CLAUDE_SONNET,
      systemPrompt: SYSTEM_PROMPTS.SEO_OPTIMIZER,
      temperature: 0.5,
      maxTokens: 2000,
    });

    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse SEO response:', error);
      return {
        title: '',
        description: '',
        tags: [],
        improvements: [],
        error: 'Failed to parse response',
      };
    }
  }

  // Generate script from outline
  async generateScript(outline, format = 'video', duration = '10 minutes') {
    const prompt = `Create a detailed script based on this outline for a ${duration} ${format}:

Outline: ${outline}

Include:
- Natural transitions
- Engaging hooks
- Clear structure
- Call-to-action elements`;

    return this.generateCompletion(prompt, {
      model: MODELS.CLAUDE_SONNET,
      systemPrompt: SYSTEM_PROMPTS.SCRIPT_WRITER,
      temperature: 0.8,
      maxTokens: 4000,
    });
  }

  // Summarize content
  async summarize(content, maxLength = 200) {
    const prompt = `Summarize the following content in ${maxLength} words or less:

${content}`;

    return this.generateCompletion(prompt, {
      temperature: 0.3,
      maxTokens: Math.floor(maxLength * 1.5),
    });
  }

  // Extract keywords
  async extractKeywords(content, count = 10) {
    const prompt = `Extract the ${count} most important keywords from this content:

${content}

Return only the keywords as a comma-separated list.`;

    const response = await this.generateCompletion(prompt, {
      temperature: 0.2,
      maxTokens: 100,
    });

    return response.split(',').map(keyword => keyword.trim());
  }
}

// Singleton instance
let claudeServiceInstance;

export function getClaudeService() {
  if (!claudeServiceInstance) {
    claudeServiceInstance = new ClaudeService();
  }
  return claudeServiceInstance;
}

// Utility functions
export async function generateSEOContent(content, platform = 'youtube') {
  const service = getClaudeService();
  return service.optimizeForSEO(content, platform);
}

export async function generateScript(outline, format, duration) {
  const service = getClaudeService();
  return service.generateScript(outline, format, duration);
}

export async function summarizeContent(content, maxLength) {
  const service = getClaudeService();
  return service.summarize(content, maxLength);
}