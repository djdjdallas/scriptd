import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, framework, workflowId, researchSources, targetAudience } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

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
          console.log(`✅ Loaded ${sources.length} research sources for frame generation`);
        }
      } catch (error) {
        console.warn('Could not load research sources:', error);
      }
    }

    // Use Claude API to generate frame suggestions
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Extract key facts from research if available
        let keyFacts = '';
        if (sources.length > 0) {
          // Get top synthesis sources and substantial content
          const substantiveSources = sources.filter(s =>
            s.source_type === 'synthesis' || (s.source_content && s.source_content.length > 500)
          );

          // Extract preview of key information
          const factSummaries = substantiveSources.slice(0, 5).map(s => {
            const preview = s.source_content.substring(0, 300);
            return `- ${s.source_title}: ${preview}...`;
          }).join('\n');

          keyFacts = `\n\nRESEARCH CONTEXT (${sources.length} sources available):\n${factSummaries}\n\nUse specific facts, numbers, dates, and names from this research to make the frame compelling and grounded in reality.`;
        }

        // Framework-specific prompts
        const frameworkPrompts = {
          'problem-solution': `Using the Problem-Solution framework, create a narrative frame that:

1. PROBLEM: Identify the SPECIFIC obstacle, challenge, or systemic issue revealed in the research. Use concrete details like:
   - What went wrong? What was the scale? (e.g., "$459 billion overstated")
   - Who was affected? What were the stakes?
   - Why did this matter? What made it difficult to address?

2. SOLUTION: Present the CONCRETE action taken to address the problem. Include:
   - Who took action? What specifically did they do?
   - What risks did they face? What made this solution unique?
   - What mechanisms or methods were used?

3. TRANSFORMATION: Show the MEASURABLE outcomes and broader impact:
   - What changed as a direct result? (fines, policy changes, investigations)
   - What ripple effects occurred? Who else was impacted?
   - What lessons or insights can viewers take away?`,

          'before-after': `Using the Before-After framework, create a narrative frame that:

1. BEFORE STATE: Paint a vivid picture of the SPECIFIC situation before the events. Use research to show:
   - What was the status quo? What systems were in place?
   - What problems existed but were hidden or ignored?
   - Who was vulnerable? What risks were present?
   - Include specific details, numbers, dates from the research

2. AFTER STATE: Describe the CONCRETE reality after the transformation:
   - What specific changes occurred? (regulations, consequences, awareness)
   - What new protections or systems emerged?
   - What are the measurable differences?
   - Who benefits now that didn't before?

3. THE BRIDGE: Explain the JOURNEY between before and after:
   - What events triggered the transformation?
   - What obstacles were overcome? What risks were taken?
   - What can viewers learn from this journey?`,

          'myth-truth': `Using the Myth-Truth framework, create a narrative frame that:

1. THE MYTH: Present the SPECIFIC misconception or false assumption that existed. Ground it in research:
   - What did people believe or assume before the truth came out?
   - What systems or practices relied on this myth?
   - Why was the myth so persistent? Who benefited from it?
   - Use specific examples from the research

2. THE TRUTH: Reveal the FACTUAL reality exposed by the research:
   - What evidence contradicted the myth? (documents, testimony, investigations)
   - What specific numbers, dates, or facts prove the truth?
   - Who revealed this truth? What did they risk to do so?
   - What was the scale of the deception?

3. THE AWAKENING: Show how knowing the truth transforms understanding:
   - What changed once the truth was public? (investigations, reforms, accountability)
   - What systems were exposed as flawed?
   - What can viewers do with this knowledge? How does it change their perspective?`
        };

        const selectedPrompt = frameworkPrompts[framework] || frameworkPrompts['problem-solution'];

        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929', // Upgraded to Sonnet 4.5
            max_tokens: 2048, // Increased for more detailed responses
            temperature: 0.7,
            system: `You are a YouTube script writing expert specializing in narrative structure. Your frames must be:
- SPECIFIC: Use exact numbers, names, dates, and facts from research
- GROUNDED: Reference real events, not hypotheticals
- COMPELLING: Create emotional resonance while staying factual
- ACTIONABLE: Give viewers clear takeaways

Never use vague phrases like "many people" or "shady practices" - always use specific details from the research.`,
            messages: [
              {
                role: 'user',
                content: `Generate a narrative frame for a YouTube video about: "${topic}"${targetAudience ? `\nTarget Audience: ${targetAudience}` : ''}${keyFacts}

${selectedPrompt}

CRITICAL: Ground every part of the frame in SPECIFIC FACTS from the research:
- Use exact dollar amounts, percentages, dates
- Name real people, companies, organizations
- Reference specific events and outcomes
- Avoid generic language - be concrete and factual

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "problem": "2-3 sentences with specific details from research",
  "solution": "2-3 sentences with concrete actions and facts",
  "transformation": "2-3 sentences with measurable outcomes and lessons"
}`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();

          try {
            // Parse the JSON response from Claude
            let content = claudeData.content?.[0]?.text || '';

            // Remove markdown code blocks if present
            content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const suggestions = JSON.parse(content);

            console.log('✅ Frame generated with research context:', {
              sourcesUsed: sources.length,
              framework: framework || 'problem-solution',
              problemLength: suggestions.problem?.length,
              solutionLength: suggestions.solution?.length
            });

            return NextResponse.json({
              suggestions,
              framework: framework || 'problem-solution',
              sourcesUsed: sources.length
            });
          } catch (parseError) {
            console.error('Frame parsing error:', parseError);

            // If parsing fails, extract text and format it
            const content = claudeData.content?.[0]?.text || '';

            // Try to extract the suggestions from the text using more flexible regex
            const problemMatch = content.match(/"problem":\s*"([^"]+)"/i);
            const solutionMatch = content.match(/"solution":\s*"([^"]+)"/i);
            const transformationMatch = content.match(/"transformation":\s*"([^"]+)"/i);

            if (problemMatch && solutionMatch && transformationMatch) {
              return NextResponse.json({
                suggestions: {
                  problem: problemMatch[1],
                  solution: solutionMatch[1],
                  transformation: transformationMatch[1]
                },
                framework: framework || 'problem-solution',
                sourcesUsed: sources.length
              });
            }

            // Absolute fallback
            return NextResponse.json({
              suggestions: {
                problem: `Research-based frame generation failed. Please try again or enter manually. Raw response: ${content.substring(0, 200)}`,
                solution: ``,
                transformation: ``
              },
              framework: framework || 'problem-solution',
              error: 'Parse failed'
            });
          }
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
      }
    }

    // Fallback suggestions based on the topic and framework
    const frameworkTemplates = {
      'problem-solution': {
        problem: `Many people struggle with ${topic} because they lack the right approach and understanding.`,
        solution: `Here's a proven method to master ${topic} that actually works in practice.`,
        transformation: `By the end of this video, you'll have the knowledge and tools to excel at ${topic}.`
      },
      'before-after': {
        problem: `Right now, you might be frustrated with ${topic} and unsure how to improve.`,
        solution: `Imagine having complete confidence and mastery over ${topic}.`,
        transformation: `Here's the exact bridge that will take you from confusion to clarity with ${topic}.`
      },
      'myth-truth': {
        problem: `Common misconceptions about ${topic} are holding people back from success.`,
        solution: `Let's reveal the truth that industry experts know about ${topic}.`,
        transformation: `Armed with this knowledge, you'll approach ${topic} with clarity and confidence.`
      }
    };

    const selectedFramework = framework || 'problem-solution';
    const template = frameworkTemplates[selectedFramework] || frameworkTemplates['problem-solution'];

    return NextResponse.json({
      suggestions: template,
      framework: selectedFramework,
      message: 'Using template suggestions. Configure Claude API for AI-powered suggestions.'
    });

  } catch (error) {
    console.error('Frame suggestion API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate frame suggestions' },
      { status: 500 }
    );
  }
}