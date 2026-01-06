/**
 * AI Service Usage Examples
 * @module lib/ai/examples
 */

import { AIService, TaskType } from './index.js';
import { 
  generateScriptPrompt,
  generateScriptOutlinePrompt,
  improveScriptPrompt 
} from '../prompts/script-generation.js';
import {
  generateTitlesPrompt,
  optimizeTitlePrompt
} from '../prompts/title-generation.js';
import {
  generateHooksPrompt,
  generatePatternInterruptHooksPrompt
} from '../prompts/hook-generation.js';
import {
  analyzeVoicePrompt,
  matchVoicePrompt
} from '../prompts/voice-matching.js';

/**
 * Example 1: Initialize AI Service
 */
export function initializeAIService() {
  // Option 1: Initialize from environment variables
  const ai = AIService.fromEnv();

  // Option 2: Manual configuration
  const aiManual = new AIService({
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4-turbo-preview'
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-opus-20240229'
      }
    },
    taskProviders: {
      [TaskType.SCRIPT_GENERATION]: 'anthropic',
      [TaskType.TITLE_GENERATION]: 'openai'
    }
  });

  return ai;
}

/**
 * Example 2: Generate a YouTube Script
 */
export async function generateYouTubeScript() {
  const ai = AIService.fromEnv();

  // Generate script prompt
  const scriptPrompt = generateScriptPrompt({
    topic: 'How to Start a Successful YouTube Channel in 2024',
    style: 'educational',
    duration: 10,
    audience: 'aspiring content creators',
    keyPoints: [
      'Choosing your niche',
      'Equipment essentials',
      'Content planning',
      'SEO and discoverability',
      'Monetization strategies'
    ],
    tone: 'encouraging and practical'
  });

  // Generate the script
  const response = await ai.generate({
    ...scriptPrompt,
    taskType: TaskType.SCRIPT_GENERATION,
    metadata: {
      projectId: 'yt-guide-2024',
      userId: 'user123'
    }
  });

  return response;
}

/**
 * Example 3: Generate Script with Streaming
 */
export async function generateScriptWithStreaming() {
  const ai = AIService.fromEnv();

  const scriptPrompt = generateScriptPrompt({
    topic: 'The Future of AI',
    style: 'entertaining',
    duration: 5
  });

  // Stream the response
  const stream = ai.generateStream({
    ...scriptPrompt,
    taskType: TaskType.SCRIPT_GENERATION
  });

  let fullScript = '';
  
  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.content); // Print as it streams
      fullScript += chunk.content;
    }
  }

  return fullScript;
}

/**
 * Example 4: Generate Multiple Title Options
 */
export async function generateVideoTitles() {
  const ai = AIService.fromEnv();

  const titlePrompt = generateTitlesPrompt({
    topic: 'productivity tips',
    description: 'A video sharing 10 science-backed productivity techniques that actually work',
    style: 'clickbait',
    keywords: ['productivity', 'time management', 'efficiency'],
    count: 10
  });

  const response = await ai.generate({
    ...titlePrompt,
    taskType: TaskType.TITLE_GENERATION
  });

  return response;
}

/**
 * Example 5: Generate Hooks with Pattern Interrupts
 */
export async function generateVideoHooks() {
  const ai = AIService.fromEnv();

  // Standard hooks
  const standardHooks = await ai.generate({
    ...generateHooksPrompt({
      topic: 'learning programming',
      videoTitle: 'Why 95% of People Fail at Learning to Code',
      style: 'story',
      emotion: 'curiosity'
    }),
    taskType: TaskType.HOOK_GENERATION
  });

  // Pattern interrupt hooks
  const patternInterruptHooks = await ai.generate({
    ...generatePatternInterruptHooksPrompt({
      topic: 'learning programming',
      expectedStart: 'Today I\'m going to teach you how to code...',
      targetAudience: 'beginners'
    }),
    taskType: TaskType.HOOK_GENERATION
  });

  return {
    standard: standardHooks.text,
    patternInterrupt: patternInterruptHooks.text
  };
}

/**
 * Example 6: Voice Analysis and Matching
 */
export async function analyzeAndMatchVoice() {
  const ai = AIService.fromEnv();

  const sampleText = `
    Hey everyone! So today we're diving into something super cool - 
    the science behind habit formation. Now, I know what you're thinking... 
    "Another habit video?" But stick with me because I'm gonna share 
    something that literally changed my life, and it's backed by 
    neuroscience. Let's get into it!
  `;

  // Analyze voice
  const voiceAnalysis = await ai.generate({
    ...analyzeVoicePrompt({
      sampleText,
      contentType: 'youtube script'
    }),
    taskType: TaskType.VOICE_MATCHING
  });

  // Match voice for new content
  const newContent = `
    The importance of morning routines cannot be overstated. 
    Research shows that having a consistent morning routine 
    leads to increased productivity and better mental health.
  `;

  const matchedContent = await ai.generate({
    ...matchVoicePrompt({
      voiceProfile: voiceAnalysis.text,
      content: newContent
    }),
    taskType: TaskType.VOICE_MATCHING
  });

  return {
    analysis: voiceAnalysis.text,
    matched: matchedContent.text
  };
}

/**
 * Example 7: Improve Existing Script
 */
export async function improveScript() {
  const ai = AIService.fromEnv();

  const originalScript = `
    Hi, today I want to talk about productivity. 
    Being productive is important. There are many ways to be productive. 
    First, you should wake up early. Second, make a to-do list. 
    Third, avoid distractions. That's all for today.
  `;

  const improved = await ai.generate({
    ...improveScriptPrompt({
      script: originalScript,
      goal: 'engagement',
      issues: [
        'Hook is too weak',
        'Lacks personality and energy',
        'No storytelling or examples',
        'Abrupt ending'
      ]
    }),
    taskType: TaskType.SCRIPT_GENERATION
  });

  return improved.text;
}

/**
 * Example 8: Usage Statistics and Cost Tracking
 */
export async function trackUsageAndCosts() {
  const ai = AIService.fromEnv();

  // Generate some content
  await ai.generate({
    prompt: 'Write a short YouTube intro',
    taskType: TaskType.GENERAL,
    maxTokens: 100
  });

  await ai.generate({
    prompt: 'Create 5 video titles',
    taskType: TaskType.TITLE_GENERATION,
    maxTokens: 200
  });

  // Get usage statistics
  const stats = ai.getUsageStats();

  return stats;
}

/**
 * Example 9: Error Handling
 */
export async function handleAIErrors() {
  const ai = AIService.fromEnv();

  try {
    const response = await ai.generate({
      prompt: 'Generate a script',
      taskType: TaskType.SCRIPT_GENERATION,
      provider: 'nonexistent' // This will cause an error
    });
  } catch (error) {
    console.error('AI Error:', error.message);
    
    // Fallback to different provider
    try {
      const fallbackResponse = await ai.generate({
        prompt: 'Generate a script',
        taskType: TaskType.SCRIPT_GENERATION,
        provider: 'openai' // Fallback provider
      });
      
      return fallbackResponse;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.message);
      throw fallbackError;
    }
  }
}

/**
 * Example 10: Token Counting and Cost Estimation
 */
export async function estimateGenerationCost() {
  const ai = AIService.fromEnv();

  const longPrompt = `
    Create a comprehensive 20-minute YouTube script about the history of 
    artificial intelligence, covering key milestones, important figures, 
    current applications, and future predictions. Include engaging stories 
    and examples throughout.
  `;

  // Count tokens before generation
  const inputTokens = await ai.countTokens(longPrompt);

  // Estimate cost (assuming ~2000 output tokens for 20-min script)
  const estimatedCost = ai.estimateCost(inputTokens, 2000, {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229'
  });

  return { inputTokens, estimatedCost };
}