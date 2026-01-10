import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { apiLogger } from '@/lib/monitoring/logger';

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

    const { topic, frame, research, targetAudience, targetDuration, workflowId, researchSources } = await request.json();

    // Load research sources if workflowId provided
    let sources = researchSources || research?.sources || [];
    if (workflowId && sources.length === 0) {
      try {
        const { data: workflowResearch } = await supabase
          .from('workflow_research')
          .select('*')
          .eq('workflow_id', workflowId);

        if (workflowResearch && workflowResearch.length > 0) {
          sources = workflowResearch;
        }
      } catch {
        /* ignored */
      }
    }

    let points = [];
    // Charge 1 credit for content points generation
    let creditsUsed = 1;

    // Extract research context
    let researchContext = '';
    let storyBeats = '';

    if (sources.length > 0) {
      // Get substantive sources
      const substantiveSources = sources.filter(s =>
        s.source_type === 'synthesis' || (s.source_content && s.source_content.length > 500)
      );

      // Extract top facts with longer previews for narrative structure
      const factSummaries = substantiveSources.slice(0, 6).map(s => {
        const preview = s.source_content.substring(0, 600);
        return `- ${s.source_title}:\n  ${preview}...`;
      }).join('\n\n');

      researchContext = `\n\nRESEARCH SOURCES (${sources.length} available):\n${factSummaries}\n`;

      // Try to identify story beats from research
      const allContent = substantiveSources.map(s => s.source_content).join(' ');

      // Extract timeline indicators
      const dates = allContent.match(/\b(20\d{2}|January|February|March|April|May|June|July|August|September|October|November|December)\b/g);
      const amounts = allContent.match(/\$[\d,.]+(?: million| billion| M| B)?/gi);
      const outcomes = allContent.match(/\b(fine|settlement|resignation|investigation|arrest|convicted|sentenced|fired|lawsuit|charged)\b/gi);

      if (dates || amounts || outcomes) {
        storyBeats = `\nKEY STORY ELEMENTS FOUND:\n`;
        if (amounts && amounts.length > 0) {
          storyBeats += `- Dollar amounts: ${[...new Set(amounts.slice(0, 5))].join(', ')}\n`;
        }
        if (outcomes && outcomes.length > 0) {
          storyBeats += `- Key outcomes: ${[...new Set(outcomes.slice(0, 8))].join(', ')}\n`;
        }
        if (dates && dates.length > 0) {
          storyBeats += `- Timeline markers: ${[...new Set(dates.slice(0, 5))].join(', ')}\n`;
        }
      }
    }

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
            model: 'claude-sonnet-4-5-20250929', // Upgraded to Sonnet 4.5
            max_tokens: 3000, // Increased for detailed content points
            temperature: 0.7,
            system: `You are a YouTube content strategist and storytelling expert. Your content points must:
- Be SPECIFIC: Use exact numbers, names, dates, events from research
- Tell a STORY: Follow the chronological or dramatic arc of actual events
- Create CURIOSITY: Each point should build anticipation for the next
- Deliver VALUE: Clear, concrete takeaways based on research findings

Never create generic section titles - every point should reference specific discoveries from the research.`,
            messages: [
              {
                role: 'user',
                content: `Create research-based content points for a YouTube video about: "${topic}"

TARGET SPECS:
- Duration: ${targetDuration} seconds (${Math.floor(targetDuration/60)}:${(targetDuration%60).toString().padStart(2,'0')})
- Audience: ${targetAudience || 'General audience'}
- Points needed: ${targetDuration <= 120 ? '3-4' : targetDuration <= 300 ? '5-6' : targetDuration <= 1800 ? '6-8' : '8-10'}

${frame ? `NARRATIVE FRAMEWORK:
- Problem/Challenge: ${frame.problem_statement}
- Solution/Action: ${frame.solution_approach}
- Outcome/Impact: ${frame.transformation_outcome}
` : ''}${researchContext}${storyBeats}

CRITICAL INSTRUCTIONS:
Create content points that tell the ACTUAL STORY from the research:

1. **USE CHRONOLOGY OR DRAMA ARC**
   - Follow the timeline of events (discovery → action → consequences)
   - OR build dramatic tension (setup → conflict → climax → resolution)
   - Each point should advance the narrative

2. **INCLUDE SPECIFIC DETAILS IN TITLES**
   - NOT "Introduction" → "The $459 Billion Lie: DWS's ESG Scandal Exposed"
   - NOT "The Problem" → "When Whistleblowing Means Career Suicide: The 73% Nobody Talks About"
   - NOT "Consequences" → "From $44M in Fines to a CEO's Resignation: The Aftermath"

3. **DESCRIPTIONS MUST REFERENCE RESEARCH**
   - Include specific amounts, dates, names, locations
   - Explain the "what" and "why" with facts
   - Connect to viewer value (why they should care)

4. **KEY TAKEAWAYS FROM RESEARCH**
   - NOT "Understanding the issue" → "ESG greenwashing operates at $459B scale in major institutions"
   - NOT "Learning the solution" → "73% retaliation rate makes Wall Street whistleblowing extraordinarily risky"
   - Must be concrete, memorable insights viewers can quote

5. **DURATION DISTRIBUTION**
   - Hook/Setup: 10-15% of total time
   - Story Development: 60-70% (divided into 2-4 acts)
   - Climax/Revelation: 10-15%
   - Conclusion/Takeaway: 5-10%

STORY STRUCTURE OPTIONS:
Choose the structure that best fits the research:

**Chronological**: Discovery → Investigation → Exposure → Consequences → Impact
**Problem-Solution**: Crisis → Breaking Point → Action Taken → Battle → Resolution
**Mystery**: Strange Discovery → Digging Deeper → Shocking Truth → Unraveling → Justice
**Hero's Journey**: Call to Action → Obstacles → Decision → Sacrifice → Triumph

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "id": "uuid-here",
    "title": "Specific, research-based title with numbers/names",
    "description": "2-3 sentences with concrete details from research explaining what this section covers and why it matters",
    "duration": [seconds],
    "keyTakeaway": "Specific, quotable insight from research"
  }
]

VALIDATION CHECKLIST:
✓ Total duration = ${targetDuration}s ±10%
✓ Every title includes specific fact (number, name, or event)
✓ Every description references research discoveries
✓ Points follow logical narrative progression
✓ Each point builds on previous and sets up next
✓ Key takeaways are concrete and memorable`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();

          try {
            let content = claudeData.content?.[0]?.text || '';

            // Remove markdown code blocks if present
            content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            points = JSON.parse(content);

            // Validate and ensure IDs
            if (!Array.isArray(points) || points.length === 0) {
              throw new Error('Invalid response format');
            }

            points = points.map(point => ({
              ...point,
              id: point.id || crypto.randomUUID()
            }));

          } catch {
            points = generateFallbackPoints(topic, targetAudience, targetDuration);
          }
        }
      } catch (claudeError) {
        apiLogger.error('Claude API error', claudeError);
        points = generateFallbackPoints(topic, targetAudience, targetDuration);
      }
    } else {
      // No Claude API key, use fallback
      points = generateFallbackPoints(topic, targetAudience, targetDuration);
      creditsUsed = 0; // No credits charged
    }
    
    // Update user credits (deduct from users.credits)
    const { data: currentUser } = await supabase
      .from('users')
      .select('bypass_credits')
      .eq('id', user.id)
      .single();

    // Only deduct if user doesn't have bypass_credits enabled and credits are being charged
    if (creditsUsed > 0 && !currentUser?.bypass_credits) {
      const deductionResult = await ServerCreditManager.deductCredits(
        supabase,
        user.id,
        'CONTENT_POINTS_GENERATION',
        {
          calculatedCost: creditsUsed,
          workflowId,
          pointsCount: points?.length || 0,
          targetDuration,
          sourcesUsed: sources.length,
          topic
        }
      );

      if (!deductionResult.success) {
        return NextResponse.json(
          {
            error: deductionResult.error || 'Failed to deduct credits',
            required: deductionResult.required,
            balance: deductionResult.balance
          },
          { status: 402 }
        );
      }
    }

    return NextResponse.json({
      points,
      creditsUsed,
      sourcesUsed: sources.length
    });
  } catch (error) {
    apiLogger.error('Content points generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate content points' },
      { status: 500 }
    );
  }
}