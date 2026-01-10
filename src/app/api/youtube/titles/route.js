import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAIService } from '@/lib/ai';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, keywords, style } = await request.json();

    if (!topic?.trim()) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate titles using AI
    const styleGuide = {
      'how-to': 'Create "How to" style titles that are instructional and practical',
      'listicle': 'Create numbered list titles (e.g., "10 Ways to...", "5 Best...")',
      'question': 'Create question-based titles that spark curiosity',
      'shocking': 'Create attention-grabbing, surprising titles with strong hooks'
    };

    const prompt = `Generate 5 highly engaging YouTube video titles about: "${topic}"
${keywords ? `\nTarget Keywords to include: ${keywords}` : ''}

Style: ${styleGuide[style] || styleGuide['how-to']}

Requirements:
- Each title should be 50-70 characters for optimal display
- Include power words that drive clicks
- Make them SEO-friendly
- Create curiosity and urgency
- Be specific and promise clear value

For each title, provide:
1. The title text
2. A score from 1-10 rating its potential click-through rate

Format your response as a JSON array with objects containing "text" and "score" fields.
Example: [{"text": "Title here", "score": 9.5}]

Return ONLY the JSON array, no other text.`;

    const ai = await getAIService();
    const response = await ai.generateResponse(prompt, {
      model: 'balanced',
      max_tokens: 1000
    });

    // Parse AI response
    let titles;
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing if JSON not properly formatted
        const lines = response.split('\n').filter(line => line.includes('"text"'));
        titles = lines.map((line, idx) => ({
          text: line.match(/"text":\s*"([^"]+)"/)?.[1] || `Title ${idx + 1}`,
          score: parseFloat(line.match(/"score":\s*([0-9.]+)/)?.[1] || '8.0')
        }));
      }
    } catch (parseError) {
      apiLogger.error('Failed to parse AI response', parseError);
      // Fallback titles
      titles = [
        { text: `How to ${topic}`, score: 8.0 },
        { text: `Complete Guide to ${topic}`, score: 8.5 },
        { text: `${topic}: Everything You Need to Know`, score: 8.2 }
      ];
    }

    return NextResponse.json({
      success: true,
      titles,
      topic
    });

  } catch (error) {
    apiLogger.error('Title generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate titles', details: error.message },
      { status: 500 }
    );
  }
}
