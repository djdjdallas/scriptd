import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWithAI } from '@/lib/ai/aiService';
import Anthropic from '@anthropic-ai/sdk';
import { ServerCreditManager } from '@/lib/credits/server-manager';

// Fallback function using Claude API directly
async function generateThumbnailFallback(prompt) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return response.content[0].text;
  } catch (err) {
    throw err;
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, topic, audience } = await request.json();

    const prompt = `Create a compelling YouTube thumbnail concept for:

Title: ${title}
Topic: ${topic}
Target Audience: ${audience}

Generate:
1. A detailed thumbnail concept description (2-3 sentences)
2. Main text overlay (3-5 words max, impactful)
3. 4-5 specific visual elements to include
4. Color scheme recommendation

Format the response as:
CONCEPT: [detailed description]
TEXT: [main text overlay]
ELEMENTS: [list of visual elements, one per line]

Make it eye-catching, clickable, and relevant to the content.`;

    let response;
    try {
      response = await generateWithAI(prompt, 'claude-3-haiku');
    } catch (error) {
      response = await generateThumbnailFallback(prompt);
    }
    
    const lines = response.split('\n');
    let concept = '';
    let text = '';
    const elements = [];
    
    let currentSection = '';
    for (const line of lines) {
      if (line.startsWith('CONCEPT:')) {
        concept = line.replace('CONCEPT:', '').trim();
        currentSection = 'concept';
      } else if (line.startsWith('TEXT:')) {
        text = line.replace('TEXT:', '').trim();
        currentSection = 'text';
      } else if (line.startsWith('ELEMENTS:')) {
        currentSection = 'elements';
      } else if (currentSection === 'elements' && line.trim()) {
        elements.push(line.replace(/^[-•*]\s*/, '').trim());
      }
    }

    const creditsUsed = 1;

    // Deduct credits using ServerCreditManager
    const creditResult = await ServerCreditManager.deductCredits(
      supabase,
      user.id,
      'THUMBNAIL_IDEAS',
      { title, topic } // Add metadata for tracking
    );

    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || 'Insufficient credits' },
        { status: 402 }
      );
    }

    return NextResponse.json({ 
      concept,
      text,
      elements,
      creditsUsed
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail concept' },
      { status: 500 }
    );
  }
}