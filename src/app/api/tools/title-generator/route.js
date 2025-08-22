// Title Generator API Route - Public (No auth required)

import { NextResponse } from 'next/server';
import { createApiHandler, ApiError, rateLimiter } from '@/lib/api-handler';
import { getAIService } from '@/lib/ai';
import { AI_MODELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

// Rate limiter for free tools
const freeToolLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per IP
  message: 'Too many requests. Free tools are limited to 10 uses per hour.'
});

// POST /api/tools/title-generator
export const POST = createApiHandler(async (req) => {
  // Apply rate limiting for free users
  await new Promise((resolve, reject) => {
    freeToolLimiter(req, {}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { topic, keywords = '', style = 'how-to' } = await req.json();

  if (!topic?.trim()) {
    throw new ApiError('Topic is required', 400);
  }

  // Style-specific prompts
  const stylePrompts = {
    'how-to': 'Create "How to" style titles that are educational and actionable',
    'listicle': 'Create numbered list titles (e.g., "10 Ways to...", "Top 5...")',
    'question': 'Create question-based titles that address viewer concerns',
    'shocking': 'Create attention-grabbing titles with emotional hooks (avoid clickbait)'
  };

  try {
    const ai = getAIService();
    
    const prompt = `Generate 10 YouTube video titles for the following:
Topic: ${topic}
Keywords to include: ${keywords || 'none specified'}
Style: ${stylePrompts[style] || stylePrompts['how-to']}

Requirements:
- Each title should be under 60 characters
- Include the main keyword naturally
- Make them compelling and click-worthy
- Avoid clickbait
- Use power words when appropriate
- Consider current YouTube trends

Format each title on a new line without numbers or bullets.`;

    const response = await ai.generateText({
      prompt,
      model: AI_MODELS.GPT35_TURBO, // Use cheaper model for free tools
      temperature: 0.9,
      maxTokens: 500
    });

    // Parse titles from response
    const titleLines = response.text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 10);

    // Score titles based on various factors
    const titles = titleLines.map(text => {
      let score = 5; // Base score

      // Length scoring
      if (text.length <= 60) score += 2;
      if (text.length >= 40 && text.length <= 55) score += 1;

      // Keyword inclusion
      if (keywords && text.toLowerCase().includes(keywords.toLowerCase())) {
        score += 2;
      }

      // Power words
      const powerWords = ['ultimate', 'complete', 'essential', 'proven', 'secret', 'amazing'];
      if (powerWords.some(word => text.toLowerCase().includes(word))) {
        score += 1;
      }

      return {
        text: text.trim(),
        score: Math.min(10, score)
      };
    });

    // Sort by score
    titles.sort((a, b) => b.score - a.score);

    // Track usage for analytics (no user auth required)
    await supabase
      .from('tool_usage')
      .insert({
        tool: 'title-generator',
        metadata: {
          topic,
          keywords,
          style,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

    return {
      titles,
      usage: {
        tool: 'title-generator',
        remaining: 10 - parseInt(req.headers.get('X-RateLimit-Remaining') || '10')
      }
    };

  } catch (error) {
    console.error('Title generation error:', error);
    throw new ApiError('Failed to generate titles', 500);
  }
});