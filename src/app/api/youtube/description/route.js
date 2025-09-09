import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAIService } from '@/lib/ai';
import { checkCredits, deductCredits } from '@/lib/credits';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const hasCredits = await checkCredits(user.id, 2);
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { videoTopic, keywords, style, includeHashtags, includeCTA } = await request.json();

    if (!videoTopic?.trim()) {
      return NextResponse.json(
        { error: 'Video topic is required' },
        { status: 400 }
      );
    }

    // Generate description using Claude Sonnet
    const aiService = createAIService('claude-3-5-sonnet-20241022');
    
    const styleGuide = {
      professional: 'Use a professional, informative tone with clear structure',
      casual: 'Use a friendly, conversational tone like talking to a friend',
      educational: 'Use an educational, instructive tone with detailed explanations',
      entertaining: 'Use an engaging, fun tone with enthusiasm and excitement'
    };
    
    const prompt = `Generate a comprehensive YouTube video description for a video about: "${videoTopic}"

${keywords ? `Target Keywords to naturally include: ${keywords}` : ''}
Writing Style: ${styleGuide[style] || styleGuide.professional}

Create a well-structured description with:

1. Opening hook (with emoji)
2. Main description paragraph explaining what the video covers
3. "What You'll Learn" section with 5-7 bullet points
4. Timestamps section (create realistic placeholder timestamps)
5. Resources section with placeholders
${includeCTA ? '6. Call-to-action to subscribe and engage' : ''}
${includeHashtags ? '7. Relevant hashtags (15-20 hashtags)' : ''}

Make it engaging, SEO-optimized, and informative. Use emojis appropriately to make it visually appealing.`;

    const description = await aiService.generateText(prompt);
    
    // Deduct credits
    await deductCredits(user.id, 2, 'youtube_description');

    return NextResponse.json({
      success: true,
      description,
      wordCount: description.split(' ').length,
      characterCount: description.length
    });

  } catch (error) {
    console.error('Description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}