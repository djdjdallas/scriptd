import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { text, instruction, context } = await request.json();

    if (!text || !instruction) {
      return NextResponse.json(
        { error: 'Text and instruction are required' },
        { status: 400 }
      );
    }

    let editedText = text;
    // Credit charging removed for AI edit
    let creditsUsed = 0;

    // Use Claude API for editing
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
            system: 'You are an expert content editor. Edit text according to the user instructions while maintaining the original meaning and style.',
            messages: [
              {
                role: 'user',
                content: `Edit the following text according to these instructions: "${instruction}"

ORIGINAL TEXT:
${text}

${context ? `FULL SCRIPT CONTEXT:
${context}` : ''}

Please provide only the edited text without any explanations or markers. Maintain the same format and structure as the original.`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          editedText = claudeData.content?.[0]?.text || text;
        } else {
          console.error('Claude API error:', await claudeResponse.text());
          // Fallback to simple editing
          editedText = applySimpleEdit(text, instruction);
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        editedText = applySimpleEdit(text, instruction);
      }
    } else {
      // No API key, use simple fallback
      editedText = applySimpleEdit(text, instruction);
      creditsUsed = 0;
    }

    // Credit charging removed for AI edit

    return NextResponse.json({ 
      editedText,
      creditsUsed
    });
  } catch (error) {
    console.error('AI edit error:', error);
    return NextResponse.json(
      { error: 'Failed to apply AI edit' },
      { status: 500 }
    );
  }
}

function applySimpleEdit(text, instruction) {
  const lowerInstruction = instruction.toLowerCase();
  
  if (lowerInstruction.includes('shorter') || lowerInstruction.includes('concise')) {
    // Make text more concise by removing filler words
    return text
      .replace(/\b(very|really|quite|just|actually|basically|literally)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  if (lowerInstruction.includes('engaging') || lowerInstruction.includes('exciting')) {
    // Add excitement
    if (!text.endsWith('!') && !text.endsWith('?')) {
      text = text + '!';
    }
    return text;
  }
  
  if (lowerInstruction.includes('formal')) {
    // Make more formal
    return text
      .replace(/\b(gonna|wanna|gotta|kinda|sorta)\b/gi, (match) => {
        const replacements = {
          'gonna': 'going to',
          'wanna': 'want to',
          'gotta': 'have to',
          'kinda': 'kind of',
          'sorta': 'sort of'
        };
        return replacements[match.toLowerCase()] || match;
      });
  }
  
  // Default: return original text
  return text;
}