// Hashtag Generator API Route - Public (No auth required)

import { NextResponse } from 'next/server';
import { createApiHandler, ApiError, rateLimiter } from '@/lib/api-handler';
import { getAIService } from '@/lib/ai';
import { AI_MODELS } from '@/lib/constants';
import { createServiceClient } from '@/lib/supabase/service';
import { apiLogger } from '@/lib/monitoring/logger';

// Rate limiter for free tools
const freeToolLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per IP
  message: 'Too many requests. Free tools are limited to 10 uses per hour.'
});

// POST /api/tools/hashtag-generator
export const POST = createApiHandler(async (req) => {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    freeToolLimiter(req, {}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { topic, description = '' } = await req.json();

  if (!topic?.trim()) {
    throw new ApiError('Topic is required', 400);
  }

  try {
    const ai = getAIService();

    const prompt = `Generate 15 relevant YouTube hashtags for the following video:
Topic: ${topic}
${description ? `Description: ${description}` : ''}

Requirements:
- Mix of high-volume and niche-specific hashtags
- Include trending 2025 hashtags where relevant
- Range from broad (high competition) to specific (low competition)
- All hashtags should be lowercase without the # symbol
- Consider SEO and discoverability
- Make them relevant to the actual topic

For each hashtag, provide:
1. The hashtag (without #)
2. Estimated competition level (low/medium/high)
3. Relevance score (0-100)
4. Whether it's trending (true/false)

Format as: hashtag | competition | relevance | trending
Example: youtube2025 | medium | 85 | true`;

    const response = await ai.generateText({
      prompt,
      model: AI_MODELS.CLAUDE_3_HAIKU, // Uses FAST_MODEL (claude-haiku-4-5-20251001)
      temperature: 0.7,
      maxTokens: 600
    });

    // Parse hashtags from response
    const hashtags = [];
    const lines = response.text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        const [tag, competition, relevance, trending] = parts;

        hashtags.push({
          tag: tag.replace('#', '').toLowerCase(),
          competition: competition.toLowerCase(),
          relevance: parseInt(relevance) || 70,
          trending: trending.toLowerCase() === 'true'
        });
      }
    }

    // Ensure we have at least 10 hashtags
    if (hashtags.length < 10) {
      throw new Error('Failed to generate enough hashtags');
    }

    // Sort by relevance
    hashtags.sort((a, b) => b.relevance - a.relevance);

    // Track usage
    const supabase = createServiceClient();
    await supabase
      .from('tool_usage')
      .insert({
        tool: 'hashtag-generator',
        metadata: {
          topic,
          hasDescription: !!description,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

    return {
      hashtags: hashtags.slice(0, 15), // Return max 15 hashtags
      usage: {
        tool: 'hashtag-generator',
        remaining: 10 - parseInt(req.headers.get('X-RateLimit-Remaining') || '10')
      }
    };

  } catch (error) {
    apiLogger.error('Hashtag generation error', error);
    throw new ApiError('Failed to generate hashtags', 500);
  }
});
