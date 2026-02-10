import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { apiLogger } from '@/lib/monitoring/logger';
import { WORKFLOW_MODEL } from '@/lib/constants';

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

    console.log('[generate-titles] Starting for topic:', topic);

    // Deduct credits BEFORE generation so we fail fast if insufficient
    const creditResult = await ServerCreditManager.deductCredits(
      supabase,
      user.id,
      'TITLE_GENERATION',
      { workflowId: topic }
    );

    if (!creditResult.success) {
      console.log('[generate-titles] Credit deduction failed:', creditResult.error);
      return NextResponse.json(
        { error: creditResult.error || 'Insufficient credits' },
        { status: 402 }
      );
    }

    console.log('[generate-titles] Credits deducted, generating with model:', WORKFLOW_MODEL);

    let titles = [];
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
            model: WORKFLOW_MODEL, // Haiku 4.5 for workflow steps
            max_tokens: 2048,
            temperature: 0.8,
            system: 'You are a YouTube title optimization expert. Generate compelling, click-worthy titles that maximize engagement. Return ONLY valid JSON with no markdown formatting.',
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

        console.log('[generate-titles] Claude API response status:', claudeResponse.status);

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();

          try {
            const content = claudeData.content?.[0]?.text || '';
            console.log('[generate-titles] Claude response length:', content.length, 'preview:', content.substring(0, 100));
            // Strip markdown code blocks if present
            const jsonContent = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
            titles = JSON.parse(jsonContent);

            // Validate the structure
            if (!Array.isArray(titles) || titles.length === 0) {
              throw new Error('Invalid response format');
            }
            console.log('[generate-titles] Successfully parsed', titles.length, 'titles');
          } catch (parseError) {
            console.error('[generate-titles] Parse error:', parseError.message);
            apiLogger.error('Title parse error', parseError, { content: claudeData.content?.[0]?.text?.substring(0, 200) });
            titles = generateFallbackTitles(topic, keywords);
          }
        } else {
          // Claude API returned non-200 — use fallback titles
          const errorBody = await claudeResponse.text().catch(() => 'unknown');
          console.error('[generate-titles] Claude API error:', claudeResponse.status, errorBody.substring(0, 300));
          apiLogger.error('Claude API error for titles', { status: claudeResponse.status, body: errorBody.substring(0, 200) });
          titles = generateFallbackTitles(topic, keywords);
        }
      } catch (fetchError) {
        console.error('[generate-titles] Fetch error:', fetchError.message);
        apiLogger.error('Claude API fetch error for titles', fetchError);
        titles = generateFallbackTitles(topic, keywords);
      }
    } else {
      console.log('[generate-titles] No ANTHROPIC_API_KEY, using fallback');
      titles = generateFallbackTitles(topic, keywords);
    }

    console.log('[generate-titles] Returning', titles.length, 'titles');
    return NextResponse.json({
      titles,
      creditsUsed
    });
  } catch (error) {
    console.error('[generate-titles] Unhandled error:', error.message, error.stack);
    apiLogger.error('Title generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    );
  }
}