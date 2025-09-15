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

    const { topic, framework } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Use Claude API to generate frame suggestions
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
            max_tokens: 1024,
            temperature: 0.7,
            system: `You are a YouTube script writing assistant. Generate compelling story frame elements for a video script. Be specific and engaging.`,
            messages: [
              {
                role: 'user',
                content: `Generate frame suggestions for a YouTube video about: "${topic}"
                
                ${framework === 'myth-truth' 
                  ? `Using the Myth-Truth framework:
                     1. Present a common myth or misconception (problem)
                     2. Reveal the actual truth or reality (solution)
                     3. Show how knowing the truth transforms understanding (transformation)`
                  : framework === 'before-after'
                  ? `Using the Before-After framework:
                     1. Describe the current struggling state (problem)
                     2. Paint a picture of the desired future state (solution)
                     3. Explain the transformation journey between them (transformation)`
                  : `Using the Problem-Solution framework:
                     1. Identify a specific problem the audience faces (problem)
                     2. Present your unique solution approach (solution)
                     3. Show the transformation that results (transformation)`
                }
                
                Return as JSON with this structure:
                {
                  "problem": "specific problem/myth/before state",
                  "solution": "clear solution/truth/after state",
                  "transformation": "inspiring transformation outcome"
                }`
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          
          try {
            // Parse the JSON response from Claude
            const content = claudeData.content?.[0]?.text || '';
            const suggestions = JSON.parse(content);
            
            return NextResponse.json({
              suggestions,
              framework: framework || 'problem-solution'
            });
          } catch (parseError) {
            // If parsing fails, extract text and format it
            const content = claudeData.content?.[0]?.text || '';
            
            // Try to extract the suggestions from the text
            const problemMatch = content.match(/problem["\s:]+([^"]+)/i);
            const solutionMatch = content.match(/solution["\s:]+([^"]+)/i);
            const transformationMatch = content.match(/transformation["\s:]+([^"]+)/i);
            
            return NextResponse.json({
              suggestions: {
                problem: problemMatch?.[1] || `What if ${topic} could be easier and more effective?`,
                solution: solutionMatch?.[1] || `Here's a proven approach to mastering ${topic}`,
                transformation: transformationMatch?.[1] || `Transform your understanding of ${topic} today`
              },
              framework: framework || 'problem-solution'
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