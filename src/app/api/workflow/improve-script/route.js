import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';
import { WORKFLOW_MODEL } from '@/lib/constants';

// Helper function to calculate credit multiplier based on script length
function getScriptLengthMultiplier(scriptLength) {
  const words = scriptLength.split(' ').length;
  const estimatedMinutes = words / 150; // Average speaking rate
  
  if (estimatedMinutes < 10) {
    return 1; // Under 10 minutes: normal pricing
  } else if (estimatedMinutes <= 30) {
    return 1.5; // 10-30 minutes: 1.5x credits
  } else {
    return 2; // 30-60 minutes: 2x credits
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, improvementType } = await request.json();

    if (!script || !improvementType) {
      return NextResponse.json(
        { error: 'Script and improvement type are required' },
        { status: 400 }
      );
    }

    let improvedScript = script;
    // Credit charging removed for script improvement
    let creditsUsed = 0;

    const improvementPrompts = {
      clarity: 'Improve the clarity of this script by simplifying complex sentences, defining technical terms, and ensuring logical flow between ideas.',
      engagement: 'Make this script more engaging by adding rhetorical questions, personal anecdotes, emotional hooks, and interactive elements that keep viewers watching.',
      conciseness: 'Make this script more concise by removing redundant phrases, combining similar points, and eliminating unnecessary filler words while maintaining all key information.',
      transitions: 'Improve the transitions between sections, making them smoother and more natural. Add connecting phrases and ensure each section flows logically into the next.'
    };

    // Use Claude API for improvements
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
            max_tokens: 4096,
            temperature: 0.7,
            system: 'You are an expert YouTube script editor specializing in retention optimization and viewer engagement.',
            messages: [
              {
                role: 'user',
                content: `${improvementPrompts[improvementType]}

ORIGINAL SCRIPT:
${script}

Please provide the improved version of the entire script. Maintain the original structure and format, including any [brackets] for production notes. Focus specifically on ${improvementType} improvements.`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          improvedScript = claudeData.content?.[0]?.text || script;
        } else {
          apiLogger.error('Claude API error', new Error(await claudeResponse.text()), { improvementType });
          // Fallback to simple improvements
          improvedScript = applySimpleImprovement(script, improvementType);
        }
      } catch (claudeError) {
        apiLogger.error('Claude API error', claudeError, { improvementType });
        improvedScript = applySimpleImprovement(script, improvementType);
      }
    } else {
      // No API key, use simple fallback
      improvedScript = applySimpleImprovement(script, improvementType);
      creditsUsed = 0;
    }

    // Credit charging removed for script improvement

    return NextResponse.json({ 
      improvedScript,
      creditsUsed
    });
  } catch (error) {
    apiLogger.error('Script improvement error', error);
    return NextResponse.json(
      { error: 'Failed to improve script' },
      { status: 500 }
    );
  }
}

function applySimpleImprovement(script, type) {
  switch (type) {
    case 'clarity':
      // Simple clarity improvements
      return script
        .replace(/\b(utilize|utilization)\b/gi, 'use')
        .replace(/\b(implement|implementation)\b/gi, 'do')
        .replace(/\b(demonstrate)\b/gi, 'show')
        .replace(/\b(approximately)\b/gi, 'about');
    
    case 'engagement':
      // Add engagement elements
      const lines = script.split('\n');
      const improvedLines = lines.map((line, index) => {
        // Add questions at section starts
        if (line.startsWith('#') && index > 0) {
          return line + '\n\nBut wait, there\'s more to this story...';
        }
        return line;
      });
      return improvedLines.join('\n');
    
    case 'conciseness':
      // Remove filler words
      return script
        .replace(/\b(very|really|quite|just|actually|basically|literally|essentially)\b/gi, '')
        .replace(/\b(in order to)\b/gi, 'to')
        .replace(/\b(due to the fact that)\b/gi, 'because')
        .replace(/\s+/g, ' ');
    
    case 'transitions':
      // Add basic transitions
      return script
        .replace(/\n\n#/g, '\n\nNow, let\'s move on to the next important point.\n\n#')
        .replace(/\n\n\[/g, '\n\nWith that in mind,\n\n[');
    
    default:
      return script;
  }
}