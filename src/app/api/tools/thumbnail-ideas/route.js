// Thumbnail Ideas Generator API Route - Public (No auth required)

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

// POST /api/tools/thumbnail-ideas
export const POST = createApiHandler(async (req) => {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    freeToolLimiter(req, {}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { topic, title = '', style = 'bold', targetAudience = '' } = await req.json();

  if (!topic?.trim()) {
    throw new ApiError('Topic is required', 400);
  }

  try {
    const ai = getAIService();

    const styleDescriptions = {
      minimal: 'Clean typography, negative space, simple colors (white, black, gray)',
      bold: 'High contrast, vibrant colors (red, yellow, blue), eye-catching',
      professional: 'Trust and authority, navy/white/gray/gold colors',
      dramatic: 'Strong emotions, high contrast (black, red, white)',
      educational: 'Clear information hierarchy, blue/white/green/yellow',
      entertainment: 'Fun and playful, pink/purple/cyan/yellow/lime'
    };

    const prompt = `Generate 5 unique YouTube thumbnail ideas for the following video:
Topic: ${topic}
${title ? `Video Title: ${title}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
Style Preference: ${style} - ${styleDescriptions[style] || styleDescriptions.bold}

For each thumbnail idea, provide:
1. Concept: A detailed description of the thumbnail design
2. Colors: 3-4 specific colors to use
3. Text: The main text to display on the thumbnail
4. Elements: Key visual elements to include (list 3-4)
5. Psychology: Why this design works psychologically
6. CTR Tip: One specific tip to maximize click-through rate

Requirements:
- Make each concept unique and distinct from the others
- Ensure designs align with the ${style} style
- Focus on high CTR (click-through rate) tactics
- Be specific about visual composition
- Consider thumbnail visibility at small sizes

Format each idea as:
CONCEPT: [description]
COLORS: [color1, color2, color3, color4]
TEXT: [text]
ELEMENTS: [element1, element2, element3, element4]
PSYCHOLOGY: [explanation]
CTR_TIP: [tip]
---`;

    const response = await ai.generateText({
      prompt,
      model: AI_MODELS.CLAUDE_3_HAIKU, // Uses FAST_MODEL (claude-3-5-haiku-20241022)
      temperature: 0.8,
      maxTokens: 1200
    });

    // Parse thumbnail ideas from response
    const ideas = [];
    const sections = response.text.split('---').filter(s => s.trim());

    for (const section of sections) {
      const lines = section.split('\n').filter(l => l.trim());
      const idea = {
        concept: '',
        colors: [],
        text: '',
        elements: [],
        psychology: '',
        ctr_tip: ''
      };

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        if (key && value) {
          const normalizedKey = key.trim().toLowerCase();

          if (normalizedKey === 'concept') {
            idea.concept = value;
          } else if (normalizedKey === 'colors') {
            idea.colors = value.split(',').map(c => c.trim()).filter(c => c);
          } else if (normalizedKey === 'text') {
            idea.text = value;
          } else if (normalizedKey === 'elements') {
            idea.elements = value.split(',').map(e => e.trim()).filter(e => e);
          } else if (normalizedKey === 'psychology') {
            idea.psychology = value;
          } else if (normalizedKey === 'ctr_tip') {
            idea.ctr_tip = value;
          }
        }
      }

      // Only add if it has at least concept and colors
      if (idea.concept && idea.colors.length > 0) {
        ideas.push(idea);
      }
    }

    // Ensure we have at least 3 ideas
    if (ideas.length < 3) {
      throw new Error('Failed to generate enough thumbnail ideas');
    }

    // Track usage
    const supabase = createServiceClient();
    await supabase
      .from('tool_usage')
      .insert({
        tool: 'thumbnail-ideas',
        metadata: {
          topic,
          style,
          hasTitle: !!title,
          targetAudience,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

    return {
      ideas: ideas.slice(0, 5), // Return max 5 ideas
      usage: {
        tool: 'thumbnail-ideas',
        remaining: 10 - parseInt(req.headers.get('X-RateLimit-Remaining') || '10')
      }
    };

  } catch (error) {
    apiLogger.error('Thumbnail idea generation error', error);
    throw new ApiError('Failed to generate thumbnail ideas', 500);
  }
});
