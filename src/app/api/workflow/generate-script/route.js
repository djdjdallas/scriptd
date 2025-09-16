import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOptimizedScript } from '@/lib/prompts/optimized-youtube-generator';

// Helper function to calculate credits based on duration and model
function calculateCreditsForDuration(durationInSeconds, model = 'claude-3-haiku-20240307') {
  const minutes = Math.ceil(durationInSeconds / 60);
  
  // Base rate: 20 credits for 60 minutes = 0.333 credits per minute
  const baseRate = 20 / 60;
  
  // Model multipliers:
  // Haiku (fastest, cheapest): 1x
  // Sonnet (balanced): 1.5x  
  // Opus (best quality): 2x
  let modelMultiplier = 1;
  if (model.includes('sonnet')) {
    modelMultiplier = 1.5;
  } else if (model.includes('opus')) {
    modelMultiplier = 2;
  }
  
  // Calculate final credits (minimum 1 credit)
  return Math.max(1, Math.ceil(minutes * baseRate * modelMultiplier));
}

// Helper function to generate fallback script
function generateFallbackScript(type, title, topic, contentPoints) {
  const totalDuration = contentPoints?.points?.reduce((acc, p) => acc + p.duration, 0) || 600;
  const minutes = Math.ceil(totalDuration / 60);
  
  if (type === 'outline') {
    return `# ${title} - Video Outline

## Introduction (0:00-0:30)
- Hook: Start with a compelling question about ${topic}
- Set expectations for what viewers will learn
- [Visual: Title card with animated text]

## Main Content (0:30-${minutes-1}:00)
${contentPoints?.points?.map((point, index) => `
### ${point.title} (${Math.floor(index * point.duration / 60)}:${(index * point.duration % 60).toString().padStart(2, '0')})
- ${point.description}
- Key Point: ${point.keyTakeaway}
- [Visual: Supporting graphics or b-roll]
`).join('') || `
### Core Concepts
- Explain the fundamentals of ${topic}
- Provide clear examples
- [Visual: Diagrams or demonstrations]
`}

## Conclusion (${minutes-1}:00-${minutes}:00)
- Recap key points
- Call to action
- [Visual: End screen with subscribe button]

## Production Notes
- Keep energy high throughout
- Use b-roll to maintain visual interest
- Include captions for accessibility`;
  } else {
    return `# ${title} - Full Script

[INTRO - 0:00]
[Visual: Exciting opening montage]

Hey everyone! Today we're diving into ${topic}, and I promise you're going to learn something that could completely change your perspective.

[Visual: Title card appears]

${contentPoints?.points?.map((point, index) => `
[${point.title.toUpperCase()} - ${Math.floor(index * point.duration / 60)}:${(index * point.duration % 60).toString().padStart(2, '0')}]
[Visual: Section title animation]

${point.description}

Now, here's what's really important to understand: ${point.keyTakeaway}

[Visual: Supporting graphics]

Let me break this down for you...

[Add specific examples and explanations based on the topic]

`).join('\n[TRANSITION]\n') || `
[MAIN CONTENT]

Let's start with the basics of ${topic}...

[Develop the content based on the specific topic]
`}

[CONCLUSION - ${minutes-1}:00]
[Visual: Summary graphics]

So there you have it! We've covered everything you need to know about ${topic}.

If you found this helpful, make sure to like and subscribe for more content like this. And let me know in the comments what you'd like to see next!

[Visual: End screen with subscribe button and suggested videos]

Thanks for watching, and I'll see you in the next one!

[END]`;
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      type,
      title,
      topic,
      voiceProfile,
      research,
      frame,
      hook,
      contentPoints,
      thumbnail,
      model = 'claude-3-haiku-20240307',
      targetAudience,
      tone,
      workflowId // Add workflow ID to link the script
    } = await request.json();

    const verifiedSources = research?.sources?.filter(s => s.fact_check_status === 'verified') || [];
    const starredSources = research?.sources?.filter(s => s.is_starred) || [];

    // Calculate total duration from content points
    const totalDuration = contentPoints?.points?.reduce((acc, p) => acc + p.duration, 0) || 600;
    
    let script = '';
    // Calculate credits based on duration and AI model
    let creditsUsed = calculateCreditsForDuration(totalDuration, model);

    // Use Claude API to generate script
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
            model: model === 'claude-3-opus' ? 'claude-3-opus-20240229' : 'claude-3-haiku-20240307',
            max_tokens: 4096,
            temperature: 0.7,
            system: 'You are an expert YouTube scriptwriter specializing in engaging, factual content with high retention optimization.',
            messages: [
              {
                role: 'user',
                content: (() => {
                  // Use optimized generator for better prompts with full workflow context
                  const optimizedResult = generateOptimizedScript({
                    topic: title,
                    targetLength: Math.ceil(totalDuration / 60),
                    tone: tone || 'professional',
                    audience: targetAudience || 'general',
                    // Pass all workflow context
                    frame: frame,
                    hook: hook,
                    contentPoints: contentPoints,
                    research: research,
                    voiceProfile: voiceProfile,
                    thumbnail: thumbnail
                  });
                  
                  if (optimizedResult.error) {
                    // Fallback to original prompt if error
                    return `Create a ${type === 'outline' ? 'detailed outline' : 'complete script'} for a YouTube video.

VIDEO DETAILS:
Title: ${title}
Topic: ${topic}
Target Audience: ${targetAudience || 'General audience'}
Tone: ${tone || 'Engaging and informative'}
${voiceProfile ? `Voice Profile: ${voiceProfile.name} - ${voiceProfile.description}` : ''}

NARRATIVE STRUCTURE:
Problem: ${frame?.problem_statement || 'Not specified'}
Solution: ${frame?.solution_approach || 'Not specified'}
Transformation: ${frame?.transformation_outcome || 'Not specified'}

OPENING HOOK:
${hook || 'Create an engaging opening that grabs attention in the first 5 seconds'}

CONTENT STRUCTURE:
${contentPoints?.points?.map((point, index) => 
  `${index + 1}. ${point.title} (${point.duration}s)
   - ${point.description}
   - Key Takeaway: ${point.keyTakeaway}`
).join('\n') || 'Follow standard structure'}

${verifiedSources.length > 0 ? `
VERIFIED SOURCES TO REFERENCE:
${verifiedSources.map(s => `- ${s.source_title}: ${s.source_content}`).join('\n')}
` : ''}

${starredSources.length > 0 ? `
IMPORTANT SOURCES TO EMPHASIZE:
${starredSources.map(s => `- ${s.source_title}: ${s.source_content}`).join('\n')}
` : ''}

${thumbnail ? `
THUMBNAIL CONTEXT:
${thumbnail.description || 'Visual hook to support the content'}
` : ''}

REQUIREMENTS:
${type === 'outline' ? `
- Create a structured outline with clear sections
- Include time markers for each section
- Add key talking points under each section
- Include notes for visual cues in [brackets]
- Reference sources where appropriate
- Make it scannable and easy to follow
` : `
- Write a complete, ready-to-record script
- Include natural transitions between sections
- Add production notes in [brackets]
- Include visual cues and b-roll suggestions
- Write in a conversational, engaging style
- Reference sources naturally within the content
- Aim for approximately ${Math.ceil((contentPoints?.points?.reduce((acc, p) => acc + p.duration, 0) || 600) / 60)} minutes of content
- Keep the viewer engaged with questions, stories, and examples
`}

Format the output with:
- Clear section headers
- Production notes in [brackets]
- Natural, conversational language
- Smooth transitions between topics
- Strong opening and closing`;
                  }
                  
                  // Return enhanced prompt from optimized generator
                  // Context is now fully integrated in the optimized generator
                  return optimizedResult.prompt + `

SCRIPT TYPE: ${type === 'outline' ? 'Create a structured outline with clear sections and talking points' : 'Create a complete, ready-to-record script with full narration'}`;
                })()
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          script = claudeData.content?.[0]?.text || '';
          
          if (!script) {
            console.log('Empty Claude response, using fallback');
            script = generateFallbackScript(type, title, topic, contentPoints);
          }
        } else {
          console.error('Claude API error response:', await claudeResponse.text());
          script = generateFallbackScript(type, title, topic, contentPoints);
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        script = generateFallbackScript(type, title, topic, contentPoints);
      }
    } else {
      // No Claude API key, use fallback
      script = generateFallbackScript(type, title, topic, contentPoints);
      // Still charge credits based on duration and model even for fallback
      creditsUsed = calculateCreditsForDuration(totalDuration, model);
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

    // Get user's channel (required for scripts table)
    const { data: userChannel } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // If user has a channel, save the script to the database
    if (userChannel?.id && script) {
      try {
        // Extract title from script if not provided
        const scriptTitle = title || topic || 'Untitled Script';
        
        // Extract description/summary from script (first paragraph or hook)
        const scriptLines = script.split('\n').filter(line => line.trim());
        const description = hook || scriptLines.find(line => !line.startsWith('#') && !line.startsWith('[') && line.length > 20) || '';
        
        // Extract tags from keywords in the optimized generator metadata
        const tags = [];
        if (topic) {
          const words = topic.toLowerCase().split(/\s+/).filter(word => word.length > 3);
          tags.push(...words.slice(0, 5));
        }

        // Create the script record
        const { data: newScript, error: scriptError } = await supabase
          .from('scripts')
          .insert({
            channel_id: userChannel.id,
            user_id: user.id,
            title: scriptTitle,
            content: script,
            hook: hook || description.substring(0, 200),
            description: description.substring(0, 500),
            tags: tags,
            credits_used: creditsUsed,
            status: type === 'outline' ? 'outline' : 'draft',
            metadata: {
              type: type,
              model: model,
              workflow_id: workflowId,
              target_audience: targetAudience,
              tone: tone,
              voice_profile: voiceProfile,
              generation_date: new Date().toISOString(),
              content_points: contentPoints,
              research_sources: verifiedSources.length + starredSources.length,
              frame: frame
            }
          })
          .select()
          .single();

        if (scriptError) {
          console.error('Error saving script to database:', scriptError);
          // Don't fail the request if save fails, just log it
        } else {
          console.log('Script saved to database with ID:', newScript.id);
        }

        return NextResponse.json({ 
          script,
          creditsUsed,
          scriptId: newScript?.id // Include script ID in response
        });
      } catch (saveError) {
        console.error('Error saving script:', saveError);
        // Still return the script even if save fails
        return NextResponse.json({ 
          script,
          creditsUsed
        });
      }
    } else {
      // No channel or no script, just return without saving
      return NextResponse.json({ 
        script,
        creditsUsed
      });
    }
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}