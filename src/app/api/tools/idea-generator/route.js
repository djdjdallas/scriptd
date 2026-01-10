// Video Idea Generator API Route - Public (No auth required)

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

// POST /api/tools/idea-generator
export const POST = createApiHandler(async (req) => {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    freeToolLimiter(req, {}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { niche, category = 'any', targetAudience = '' } = await req.json();

  if (!niche?.trim()) {
    throw new ApiError('Niche is required', 400);
  }

  try {
    const ai = getAIService();

    const categoryContext = category && category !== 'any'
      ? `Video Category: ${category}`
      : '';

    const prompt = `Generate 6 unique YouTube video ideas for the following:
Niche: ${niche}
${categoryContext}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

For each video idea, provide:
1. Title: A compelling video title (under 60 characters)
2. Description: A detailed description of what the video covers (2-3 sentences)
3. Tags: 3 relevant content tags (e.g., tutorial, listicle, review)
4. Difficulty: Production difficulty (Easy/Medium/Hard)
5. Potential: Viral potential (Low/Medium/High)
6. Trending: Whether this idea aligns with current trends (true/false)

Requirements:
- Make each idea unique and valuable
- Consider current YouTube trends for 2025
- Ensure ideas are actionable and specific to the niche
- Mix different video formats (tutorials, reviews, challenges, etc.)
- Focus on ideas that can perform well in search and suggested videos

Format each idea as:
TITLE: [title]
DESCRIPTION: [description]
TAGS: [tag1, tag2, tag3]
DIFFICULTY: [Easy/Medium/Hard]
POTENTIAL: [Low/Medium/High]
TRENDING: [true/false]
---`;

    const response = await ai.generateText({
      prompt,
      model: AI_MODELS.CLAUDE_3_HAIKU, // Uses FAST_MODEL (claude-3-5-haiku-20241022)
      temperature: 0.8,
      maxTokens: 1200
    });

    // Parse video ideas from response
    const ideas = [];
    const sections = response.text.split('---').filter(s => s.trim());

    for (const section of sections) {
      const lines = section.split('\n').filter(l => l.trim());
      const idea = {
        title: '',
        description: '',
        tags: [],
        difficulty: 'Medium',
        potential: 'Medium',
        trending: false
      };

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        if (key && value) {
          const normalizedKey = key.trim().toLowerCase();

          if (normalizedKey === 'title') {
            idea.title = value;
          } else if (normalizedKey === 'description') {
            idea.description = value;
          } else if (normalizedKey === 'tags') {
            idea.tags = value.split(',').map(t => t.trim()).filter(t => t);
          } else if (normalizedKey === 'difficulty') {
            idea.difficulty = value;
          } else if (normalizedKey === 'potential') {
            idea.potential = value;
          } else if (normalizedKey === 'trending') {
            idea.trending = value.toLowerCase() === 'true';
          }
        }
      }

      // Only add if it has at least title and description
      if (idea.title && idea.description) {
        ideas.push(idea);
      }
    }

    // Ensure we have at least 4 ideas
    if (ideas.length < 4) {
      throw new Error('Failed to generate enough video ideas');
    }

    // Track usage
    const supabase = createServiceClient();
    await supabase
      .from('tool_usage')
      .insert({
        tool: 'idea-generator',
        metadata: {
          niche,
          category,
          targetAudience,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

    return {
      ideas: ideas.slice(0, 6), // Return max 6 ideas
      usage: {
        tool: 'idea-generator',
        remaining: 10 - parseInt(req.headers.get('X-RateLimit-Remaining') || '10')
      }
    };

  } catch (error) {
    apiLogger.error('Video idea generation error', error);
    throw new ApiError('Failed to generate video ideas', 500);
  }
});
