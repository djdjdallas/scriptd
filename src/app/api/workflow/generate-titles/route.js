import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { apiLogger } from '@/lib/monitoring/logger';

// Helper function to generate fallback titles
function generateFallbackTitles(topic, keywords) {
  const templates = [
    { template: `How to Master ${topic} in 2024`, emotion: 'curiosity', ctrEstimate: 'High' },
    { template: `${topic}: The Complete Guide You Need`, emotion: 'urgency', ctrEstimate: 'Medium' },
    { template: `5 ${topic} Mistakes You're Probably Making`, emotion: 'fear', ctrEstimate: 'High' },
    { template: `The Truth About ${topic} Nobody Talks About`, emotion: 'curiosity', ctrEstimate: 'High' },
    { template: `${topic} Explained in Under 10 Minutes`, emotion: 'efficiency', ctrEstimate: 'Medium' },
    { template: `Why ${topic} Will Change Everything`, emotion: 'excitement', ctrEstimate: 'Medium' },
    { template: `${topic} for Beginners: Start Here`, emotion: 'helpful', ctrEstimate: 'Medium' },
    { template: `The Hidden Power of ${topic}`, emotion: 'curiosity', ctrEstimate: 'High' },
    { template: `${topic} Secrets Professionals Don't Share`, emotion: 'exclusivity', ctrEstimate: 'High' },
    { template: `Transform Your Life with ${topic}`, emotion: 'inspiration', ctrEstimate: 'Medium' }
  ];

  return templates.map(({ template, emotion, ctrEstimate }) => ({
    text: template.substring(0, 60), // Ensure max 60 chars
    emotion,
    ctrEstimate
  }));
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, keywords, audience, tone, voiceProfile } = await request.json();

    let titles = [];
    // Charge 1 credit for title generation
    let creditsUsed = 1;

    // Use Claude API to generate titles
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2048,
            temperature: 0.8,
            system: 'You are a YouTube title optimization expert. Generate compelling, click-worthy titles that maximize engagement.',
            messages: [
              {
                role: 'user',
                content: `Generate 10 compelling YouTube video titles for the following:

Topic: ${topic}
${keywords?.length > 0 ? `Keywords to consider: ${keywords.join(', ')}` : ''}
Target Audience: ${audience || 'General audience'}
Tone: ${tone || 'Engaging'}
${voiceProfile ? `Voice Style: ${voiceProfile.name}` : ''}

Requirements:
- Maximum 60 characters each
- Use emotional triggers and power words
- Create curiosity gaps
- Include numbers when relevant
- Optimize for click-through rate
- Vary the style and approach

Return ONLY a JSON array of exactly 10 title objects with this structure:
[
  {
    "text": "The title text",
    "emotion": "Primary emotional hook (curiosity/fear/excitement/urgency/etc)",
    "ctrEstimate": "High/Medium/Low"
  }
]`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          
          try {
            const content = claudeData.content?.[0]?.text || '';
            titles = JSON.parse(content);
            
            // Validate the structure
            if (!Array.isArray(titles) || titles.length === 0) {
              throw new Error('Invalid response format');
            }
          } catch (parseError) {
            // Generate fallback titles if parsing fails
            titles = generateFallbackTitles(topic, keywords);
          }
        }
      } catch {
        titles = generateFallbackTitles(topic, keywords);
      }
    } else {
      // No Claude API key, use fallback
      titles = generateFallbackTitles(topic, keywords);
    }
    // Deduct credits using ServerCreditManager
    const creditResult = await ServerCreditManager.deductCredits(
      supabase,
      user.id,
      'TITLE_GENERATION',
      { workflowId: topic } // Add metadata for tracking
    );

    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || 'Insufficient credits' },
        { status: 402 }
      );
    }

    return NextResponse.json({ 
      titles,
      creditsUsed
    });
  } catch (error) {
    apiLogger.error('Title generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    );
  }
}