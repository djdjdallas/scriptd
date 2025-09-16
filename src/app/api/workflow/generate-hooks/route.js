import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateStructuredData } from '@/lib/ai/aiService';
import Anthropic from '@anthropic-ai/sdk';

// Fallback function using Claude API directly
async function generateHooksFallback(prompt) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON with no additional text or markdown formatting.`
      }]
    });
    
    const text = response.content[0].text;
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Claude response');
    }
  } catch (error) {
    console.error('Claude API fallback error:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, topic, frame, audience, tone } = await request.json();

    const prompt = `Generate 8 compelling opening hooks for a YouTube video.

VIDEO CONTEXT:
Title: ${title}
Topic: ${topic}
Target Audience: ${audience}
Tone: ${tone}
${frame ? `
Narrative Arc:
- Problem: ${frame.problem_statement}
- Solution: ${frame.solution_approach}
` : ''}

Create 8 different opening hooks using these patterns:
1. Question Hook - Start with an intriguing question
2. Shocking Statement - Open with a surprising fact or claim
3. Time-Based - "In the next X minutes..."
4. Statistical Hook - Start with a compelling statistic
5. Story Hook - Begin with a brief story or scenario
6. Challenge - "What if I told you..."
7. Common Misconception - Address a widespread belief
8. Personal Connection - Relate to viewer's experience

For each hook, provide a JSON object:
{
  "text": "The complete hook text (1-3 sentences)",
  "type": "question/shocking/time/statistic/story/challenge/misconception/personal",
  "duration": estimated seconds to deliver (3-10),
  "strength": "Strong/Medium/Good"
}

Make each hook:
- Attention-grabbing in the first 3 seconds
- Relevant to the video topic
- Appropriate for the target audience
- Natural and conversational

Return a JSON array of exactly 8 hook objects.`;

    let hooks;
    try {
      hooks = await generateStructuredData(prompt, 'claude-3-haiku');
    } catch (error) {
      console.log('Primary AI service failed, trying fallback:', error.message);
      hooks = await generateHooksFallback(prompt);
    }

    const creditsUsed = 1;
    
    // Update user credits
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('credits_used')
      .eq('user_id', user.id)
      .single();

    // Update with incremented value
    await supabase
      .from('user_credits')
      .update({ 
        credits_used: (currentCredits?.credits_used || 0) + creditsUsed
      })
      .eq('user_id', user.id);

    return NextResponse.json({ 
      hooks,
      creditsUsed
    });
  } catch (error) {
    console.error('Hook generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hooks' },
      { status: 500 }
    );
  }
}