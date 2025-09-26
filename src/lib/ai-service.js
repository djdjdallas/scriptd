import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call OpenAI API for script generation
 */
export async function callOpenAI(prompt, options = {}) {
  const {
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 4000
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert YouTube script writer who perfectly replicates voice patterns and linguistic styles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to Anthropic if OpenAI fails
    return callAnthropic(prompt, options);
  }
}

/**
 * Call Anthropic API for script generation
 */
export async function callAnthropic(prompt, options = {}) {
  const {
    model = process.env.PREMIUM_MODEL || 'claude-3-sonnet-20240320',
    temperature = 0.7,
    maxTokens = 4000
  } = options;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: 'You are an expert YouTube script writer who perfectly replicates voice patterns and linguistic styles.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
}

/**
 * Smart AI service selector based on tier and requirements
 */
export async function callAIService(prompt, tier = 'balanced') {
  const useOpenAI = process.env.OPENAI_API_KEY && tier === 'premium';
  
  if (useOpenAI) {
    return callOpenAI(prompt, {
      model: 'gpt-4',
      temperature: 0.7
    });
  }
  
  // Use Anthropic for balanced and fast tiers
  const model = tier === 'fast' 
    ? 'claude-3-haiku-20240307'
    : process.env.PREMIUM_MODEL || 'claude-3-sonnet-20240320';
    
  return callAnthropic(prompt, {
    model,
    temperature: tier === 'fast' ? 0.5 : 0.7
  });
}