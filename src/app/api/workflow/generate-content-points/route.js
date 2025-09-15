import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper function to calculate credit multiplier based on duration
function getDurationMultiplier(durationInSeconds) {
  const minutes = durationInSeconds / 60;
  
  if (minutes < 10) {
    return 1; // Under 10 minutes: normal pricing
  } else if (minutes <= 30) {
    return 1.5; // 10-30 minutes: 1.5x credits
  } else {
    return 2; // 30-60 minutes: 2x credits
  }
}

// Helper function to generate fallback content points
function generateFallbackPoints(topic, targetAudience, targetDuration = 300) {
  // Calculate how many points and duration per point based on target
  const numPoints = targetDuration <= 120 ? 3 : targetDuration <= 300 ? 5 : 7;
  const avgDuration = Math.floor(targetDuration / numPoints);
  
  // Define point templates based on video length
  let pointTemplates = [];
  
  if (targetDuration <= 60) {
    // Ultra-short format
    pointTemplates = [
      { title: "Hook & Problem", weight: 0.3 },
      { title: "Key Solution", weight: 0.5 },
      { title: "Quick CTA", weight: 0.2 }
    ];
  } else if (targetDuration <= 180) {
    // Short format
    pointTemplates = [
      { title: "Hook", weight: 0.15 },
      { title: "Problem", weight: 0.25 },
      { title: "Solution", weight: 0.35 },
      { title: "Example", weight: 0.15 },
      { title: "CTA", weight: 0.1 }
    ];
  } else if (targetDuration <= 600) {
    // Standard format
    pointTemplates = [
      { title: "Introduction & Hook", weight: 0.1 },
      { title: "Problem Overview", weight: 0.2 },
      { title: "Core Concepts", weight: 0.25 },
      { title: "Practical Examples", weight: 0.25 },
      { title: "Action Steps", weight: 0.15 },
      { title: "Conclusion & CTA", weight: 0.05 }
    ];
  } else {
    // Long format
    pointTemplates = [
      { title: "Introduction & Hook", weight: 0.05 },
      { title: "Problem Overview", weight: 0.15 },
      { title: "Core Concepts", weight: 0.2 },
      { title: "Deep Dive", weight: 0.2 },
      { title: "Practical Examples", weight: 0.2 },
      { title: "Common Mistakes", weight: 0.1 },
      { title: "Action Steps", weight: 0.07 },
      { title: "Conclusion & CTA", weight: 0.03 }
    ];
  }
  
  const points = pointTemplates.map(template => ({
    id: crypto.randomUUID(),
    title: template.title,
    description: `${template.title} section for ${topic}`,
    duration: Math.round(targetDuration * template.weight),
    keyTakeaway: `Key insight from ${template.title.toLowerCase()}`
  }));
  
  return points;
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, frame, research, targetAudience, targetDuration } = await request.json();

    let points = [];
    // Apply duration multiplier to base credits
    const baseCredits = 3;
    const durationMultiplier = getDurationMultiplier(targetDuration || 300);
    let creditsUsed = Math.ceil(baseCredits * durationMultiplier);

    // Use Claude API to generate content points
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
            temperature: 0.7,
            system: 'You are a YouTube content strategist expert. Create structured, engaging content outlines that maximize viewer retention.',
            messages: [
              {
                role: 'user',
                content: `Create key content points for a YouTube video with target duration of ${targetDuration} seconds (${Math.floor(targetDuration/60)}:${(targetDuration%60).toString().padStart(2,'0')}).

VIDEO CONTEXT:
Topic: ${topic}
Target Audience: ${targetAudience || 'General audience'}
Target Duration: ${targetDuration} seconds
${frame ? `
Narrative Structure:
- Problem: ${frame.problem_statement}
- Solution: ${frame.solution_approach}
- Transformation: ${frame.transformation_outcome}
` : ''}

${research?.keywords?.length > 0 ? `Keywords to cover: ${research.keywords.join(', ')}` : ''}

Generate ${targetDuration <= 120 ? '3-4' : targetDuration <= 300 ? '5-6' : '6-8'} content points that:
- Fit within the ${targetDuration} second target duration
- Build logically from hook to conclusion
- Deliver clear value to viewers
- Maintain engagement throughout

Return ONLY a JSON array of content point objects with this exact structure:
[
  {
    "id": "unique-uuid-here",
    "title": "Short, descriptive title",
    "description": "What this section covers (1-2 sentences)",
    "duration": [seconds for this point],
    "keyTakeaway": "What viewers will learn/gain"
  }
]

Requirements:
- Total duration MUST be approximately ${targetDuration} seconds (±10%)
- Distribute time appropriately (hook: 10-15%, main content: 70-80%, conclusion: 5-10%)
- Adjust depth based on duration (shorter = more focused, longer = more comprehensive)
- Each point duration should be realistic for the content`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          
          try {
            const content = claudeData.content?.[0]?.text || '';
            points = JSON.parse(content);
            
            // Validate and ensure IDs
            if (!Array.isArray(points) || points.length === 0) {
              throw new Error('Invalid response format');
            }
            
            points = points.map(point => ({
              ...point,
              id: point.id || crypto.randomUUID()
            }));
          } catch (parseError) {
            console.log('Claude response parsing failed, using fallback');
            points = generateFallbackPoints(topic, targetAudience, targetDuration);
          }
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        points = generateFallbackPoints(topic, targetAudience, targetDuration);
      }
    } else {
      // No Claude API key, use fallback
      points = generateFallbackPoints(topic, targetAudience, targetDuration);
      creditsUsed = 0; // No credits for fallback
    }
    
    // Get current credits
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
      points,
      creditsUsed
    });
  } catch (error) {
    console.error('Content points generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content points' },
      { status: 500 }
    );
  }
}