import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default model configurations
export const MODELS = {
  GPT4: 'gpt-4-turbo-preview',
  GPT35: 'gpt-3.5-turbo',
  EMBEDDING: 'text-embedding-ada-002',
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

// OpenAI service class
export class OpenAIService {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    this.client = new OpenAI({ apiKey });
  }

  // Generate text completion
  async generateCompletion(prompt, options = {}) {
    const {
      model = MODELS.GPT35,
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = null,
      ...otherOptions
    } = options;

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...otherOptions,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate completion: ${error.message}`);
    }
  }

  // Generate embeddings
  async generateEmbedding(text) {
    try {
      const response = await this.client.embeddings.create({
        model: MODELS.EMBEDDING,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  // Stream completion
  async streamCompletion(prompt, options = {}, onChunk) {
    const {
      model = MODELS.GPT35,
      temperature = 0.7,
      systemPrompt = null,
      ...otherOptions
    } = options;

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        stream: true,
        ...otherOptions,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
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
      model: MODELS.GPT4,
      systemPrompt: SYSTEM_PROMPTS.SEO_OPTIMIZER,
      temperature: 0.5,
    });

    try {
      return JSON.parse(response);
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
      model: MODELS.GPT4,
      systemPrompt: SYSTEM_PROMPTS.SCRIPT_WRITER,
      temperature: 0.8,
      maxTokens: 2000,
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
let openaiServiceInstance;

export function getOpenAIService() {
  if (!openaiServiceInstance) {
    openaiServiceInstance = new OpenAIService();
  }
  return openaiServiceInstance;
}

// Utility functions
export async function generateSEOContent(content, platform = 'youtube') {
  const service = getOpenAIService();
  return service.optimizeForSEO(content, platform);
}

export async function generateScript(outline, format, duration) {
  const service = getOpenAIService();
  return service.generateScript(outline, format, duration);
}

export async function summarizeContent(content, maxLength) {
  const service = getOpenAIService();
  return service.summarize(content, maxLength);
}