import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateStructuredData } from '@/lib/ai/aiService';
import Anthropic from '@anthropic-ai/sdk';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { apiLogger } from '@/lib/monitoring/logger';
import { WORKFLOW_MODEL } from '@/lib/constants';

// Fallback function using Claude API directly
async function generateHooksFallback(prompt) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await anthropic.messages.create({
      model: WORKFLOW_MODEL, // Haiku 4.5 for workflow steps
      max_tokens: 4000,
      temperature: 0.7, // Increased for more creative hooks
      system: `You are a YouTube hook expert. Your hooks must be:
- SPECIFIC: Use exact numbers, names, dates from research
- GROUNDED: Reference real events and facts
- COMPELLING: Create immediate curiosity in first 3 seconds
- CREDIBLE: Every claim must be verifiable from research

Never use vague phrases like "someone" or "recently" - always be specific.`,
      messages: [{
        role: 'user',
        content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON array with no markdown code blocks or additional text.`
      }]
    });

    let text = response.content[0].text;

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Try to extract JSON array from text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Claude response');
    }
  } catch (error) {
    apiLogger.error('Claude API fallback error', error);
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

    const { title, topic, frame, audience, tone, workflowId, researchSources } = await request.json();

    // Load research sources if workflowId provided
    let sources = researchSources || [];
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
        // Could not load research sources, continue without them
      }
    }

    // Extract key hook-worthy facts from research
    let researchContext = '';
    let keyFacts = {
      biggestNumber: '',
      dramaticOutcome: '',
      keyPerson: '',
      shockingStat: '',
      specificDate: ''
    };

    if (sources.length > 0) {
      // Get substantive sources
      const substantiveSources = sources.filter(s =>
        s.source_type === 'synthesis' || (s.source_content && s.source_content.length > 500)
      );

      // Extract top facts with previews
      const factSummaries = substantiveSources.slice(0, 5).map(s => {
        const preview = s.source_content.substring(0, 400);
        return `- ${s.source_title}: ${preview}...`;
      }).join('\n');

      researchContext = `\n\nRESEARCH CONTEXT (${sources.length} sources available):\n${factSummaries}\n\nUse these specific facts to create hooks with real numbers, names, dates, and outcomes.`;

      // Try to extract key facts from content
      const allContent = substantiveSources.map(s => s.source_content).join(' ');

      // Extract dollar amounts
      const moneyMatches = allContent.match(/\$[\d,.]+(?: million| billion| M| B)?/gi);
      if (moneyMatches && moneyMatches.length > 0) {
        keyFacts.biggestNumber = moneyMatches[0];
      }

      // Extract percentages
      const percentMatches = allContent.match(/\d+%/g);
      if (percentMatches && percentMatches.length > 0) {
        keyFacts.shockingStat = percentMatches[0];
      }
    }

    const prompt = `Generate 8 compelling opening hooks for a YouTube video about: "${title}"

VIDEO CONTEXT:
Topic: ${topic}
Target Audience: ${audience}
Tone: ${tone}
${frame ? `
Narrative Framework:
- Problem/Challenge: ${frame.problem_statement}
- Solution/Action: ${frame.solution_approach}
- Outcome/Impact: ${frame.transformation_outcome}
` : ''}${researchContext}

CRITICAL INSTRUCTIONS:
- Use SPECIFIC facts from the research: exact dollar amounts, names, dates, outcomes
- Each hook must reference at least ONE concrete detail from the research
- Avoid vague language like "someone" or "recently" - be specific
- Make every hook instantly credible and curiosity-inducing

Create 8 different opening hooks using these patterns with research-specific guidance:

1. **Question Hook** - Use the BIGGEST NUMBER or most DRAMATIC OUTCOME from research
   Example: "What happens when [person] exposes [specific $amount] in [specific fraud]?"

2. **Shocking Statement Hook** - Lead with the most SURPRISING CONSEQUENCE or SCALE
   Example: "[Person]'s single email led to [specific outcome: fines, resignations, investigations]"

3. **Time-Based Hook** - Reference the actual TIMELINE from research
   Example: "In [X] minutes, discover how [timeframe] investigation exposed [specific finding]"

4. **Statistical Hook** - Use REAL NUMBERS and PERCENTAGES from research
   Example: "[X%] of [group] face [consequence], but [person] [action] anyway"

5. **Story Hook** - Start with a SPECIFIC MOMENT from the actual events
   Example: "When [person] saw [specific document/evidence] on [date/time], everything changed"

6. **Challenge Hook** - Use FACTUAL REVEAL to challenge assumptions
   Example: "What if I told you [specific org] had been [specific action] for [timeframe]?"

7. **Misconception Hook** - Address a belief contradicted by RESEARCH FACTS
   Example: "Everyone thinks [industry] is [safe/honest], but [specific evidence] proves otherwise"

8. **Personal Impact Hook** - Connect research findings to VIEWER'S WORLD
   Example: "If you [common action], you're affected by the [$amount] [scandal] nobody's talking about"

For each hook, provide a JSON object:
{
  "text": "The complete hook text with SPECIFIC facts, numbers, names (1-3 sentences)",
  "type": "question/shocking/time/statistic/story/challenge/misconception/personal",
  "duration": estimated seconds to deliver (3-10),
  "strength": "Strong/Medium/Good"
}

Requirements for EVERY hook:
- Include at least ONE specific number, name, or date from research
- First 3 seconds must be attention-grabbing
- Must be factually accurate to the research
- Natural and conversational delivery
- Creates immediate curiosity gap

Return ONLY valid JSON array of exactly 8 hook objects (no markdown, no code blocks).`;

    let hooks;
    try {
      // Try primary AI service first
      hooks = await generateStructuredData(prompt, WORKFLOW_MODEL);
    } catch (error) {
      hooks = await generateHooksFallback(prompt);
    }

    // Validate hooks array
    if (!Array.isArray(hooks) || hooks.length === 0) {
      throw new Error('No hooks generated');
    }

    const creditsUsed = 1;

    // Check bypass_credits flag
    const { data: currentUser } = await supabase
      .from('users')
      .select('bypass_credits')
      .eq('id', user.id)
      .single();

    // Only deduct if user doesn't have bypass_credits enabled
    if (!currentUser?.bypass_credits) {
      const deductionResult = await ServerCreditManager.deductCredits(
        supabase,
        user.id,
        'HOOK_GENERATION',
        {
          calculatedCost: creditsUsed,
          workflowId,
          sourcesUsed: sources.length,
          title
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
      hooks,
      creditsUsed,
      sourcesUsed: sources.length
    });
  } catch (error) {
    apiLogger.error('Hook generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate hooks' },
      { status: 500 }
    );
  }
}