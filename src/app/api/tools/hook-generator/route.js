// Hook Generator API Route - Public (No auth required)

import { NextResponse } from 'next/server';
import { createApiHandler, ApiError, rateLimiter } from '@/lib/api-handler';
import { getAIService } from '@/lib/ai';
import { AI_MODELS } from '@/lib/constants';
import { createServiceClient } from '@/lib/supabase/service';

// Rate limiter for free tools
const freeToolLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per IP
  message: 'Too many requests. Free tools are limited to 10 uses per hour.'
});

// POST /api/tools/hook-generator
export const POST = createApiHandler(async (req) => {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    freeToolLimiter(req, {}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { topic, videoType = '', targetAudience = '' } = await req.json();
  
  // Handle "any" value same as empty
  const actualVideoType = (videoType === 'any' || !videoType) ? '' : videoType;

  if (!topic?.trim()) {
    throw new ApiError('Topic is required', 400);
  }

  const hookStyles = [
    'question',
    'statistic',
    'story',
    'challenge',
    'promise',
    'controversy'
  ];

  try {
    const ai = getAIService();
    
    const prompt = `Generate 6 different YouTube video hooks for the following:
Topic: ${topic}
${actualVideoType ? `Video Type: ${actualVideoType}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Create one hook for each style:
1. Question Hook - Start with an intriguing question
2. Statistic Hook - Open with a surprising fact or number
3. Story Hook - Begin with a brief personal anecdote
4. Challenge Hook - Present a problem or challenge
5. Promise Hook - Make a bold promise about what they'll learn
6. Controversy Hook - Start with a controversial or counterintuitive statement

Requirements for each hook:
- Must be readable in 15 seconds or less
- Should immediately grab attention
- Must relate directly to the topic
- Avoid clickbait - be authentic
- Use conversational language
- Include a reason to keep watching

Format each hook on a new line with the style name followed by a colon, then the hook text.`;

    const response = await ai.generateText({
      prompt,
      model: AI_MODELS.CLAUDE_3_HAIKU,
      temperature: 0.9,
      maxTokens: 800
    });

    // Parse hooks from response
    const hooks = [];
    const lines = response.text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const style = line.substring(0, colonIndex).trim().toLowerCase();
        const text = line.substring(colonIndex + 1).trim();
        
        if (text && hookStyles.some(s => style.includes(s))) {
          const wordCount = text.split(/\s+/).length;
          const readTime = Math.ceil(wordCount / 3); // ~3 words per second speaking rate
          
          // Find matching style
          const matchedStyle = hookStyles.find(s => style.includes(s)) || 'general';
          
          // Generate a tip for this hook style
          const tips = {
            question: 'Follow up with a preview of the answer to maintain interest',
            statistic: 'Make sure to cite your source for credibility',
            story: 'Keep it brief and directly relevant to your main topic',
            challenge: 'Acknowledge the difficulty while promising a solution',
            promise: 'Be specific about the value and timeframe',
            controversy: 'Back it up with evidence in the video'
          };
          
          hooks.push({
            style: matchedStyle.charAt(0).toUpperCase() + matchedStyle.slice(1),
            text,
            wordCount,
            readTime,
            tip: tips[matchedStyle]
          });
        }
      }
    }

    // Ensure we have at least 3 hooks
    if (hooks.length < 3) {
      throw new Error('Failed to generate enough hooks');
    }

    // Track usage
    const supabase = createServiceClient();
    await supabase
      .from('tool_usage')
      .insert({
        tool: 'hook-generator',
        metadata: {
          topic,
          videoType: actualVideoType,
          targetAudience,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

    return {
      hooks: hooks.slice(0, 6), // Return max 6 hooks
      usage: {
        tool: 'hook-generator',
        remaining: 10 - parseInt(req.headers.get('X-RateLimit-Remaining') || '10')
      }
    };

  } catch (error) {
    console.error('Hook generation error:', error);
    throw new ApiError('Failed to generate hooks', 500);
  }
});