import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOptimizedScript } from '@/lib/prompts/optimized-youtube-generator';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { LongFormScriptHandler } from '@/lib/script-generation/long-form-handler';
import ResearchService from '@/lib/ai/research-service';

// Helper function to calculate credits based on duration and model
function calculateCreditsForDuration(durationInSeconds, model = 'claude-3-5-haiku') {
  const minutes = Math.ceil(durationInSeconds / 60);
  
  // Base rate: 0.33 credits per minute (so 10 min Professional = 5 credits)
  const baseRate = 0.33;
  
  // Model multipliers based on new model names:
  // claude-3-5-haiku (Fast): 1x
  // claude-3-5-sonnet (Professional): 1.5x  
  // claude-opus-4-1 (Hollywood): 3.5x
  let modelMultiplier = 1;
  if (model === 'claude-3-5-sonnet') {
    modelMultiplier = 1.5;
  } else if (model === 'claude-opus-4-1') {
    modelMultiplier = 3.5;
  }
  
  // Calculate final credits (minimum 1 credit)
  return Math.max(1, Math.round(minutes * baseRate * modelMultiplier));
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
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
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
      model = 'claude-3-5-haiku',
      targetAudience,
      tone,
      targetDuration, // Add targetDuration from summary
      workflowId // Add workflow ID to link the script
    } = await request.json();

    // Check if user has bypass_credits enabled
    const { data: userSettings } = await supabase
      .from('users')
      .select('bypass_credits')
      .eq('id', user.id)
      .single();
    
    const bypassCredits = userSettings?.bypass_credits || process.env.BYPASS_CREDIT_CHECKS === 'true';

    const verifiedSources = research?.sources?.filter(s => s.fact_check_status === 'verified') || [];
    const starredSources = research?.sources?.filter(s => s.is_starred) || [];

    // Perform additional research if no sources provided
    let enhancedResearch = research;
    if ((!verifiedSources.length && !starredSources.length) && (title || topic)) {
      console.log('No research sources provided, performing automatic research...');
      const autoResearch = await ResearchService.performResearch({
        query: title || topic,
        topic: topic,
        context: `Creating a ${type} for a YouTube video${targetAudience ? ` targeting ${targetAudience}` : ''}`,
        includeSources: true
      });
      
      if (autoResearch.success) {
        enhancedResearch = {
          ...research,
          autoGenerated: true,
          summary: autoResearch.summary,
          insights: autoResearch.insights,
          sources: autoResearch.results.map(r => ({
            source_title: r.title,
            source_content: r.snippet || r.fullContent,
            source_url: r.url,
            fact_check_status: r.isVerified ? 'verified' : 'unchecked',
            is_starred: r.relevance >= 0.95
          }))
        };
        
        // Update verified and starred sources with auto-research
        verifiedSources.push(...enhancedResearch.sources.filter(s => s.fact_check_status === 'verified'));
        starredSources.push(...enhancedResearch.sources.filter(s => s.is_starred));
      }
    }

    // Use targetDuration from summary if available, otherwise calculate from content points
    const totalDuration = targetDuration || contentPoints?.points?.reduce((acc, p) => acc + p.duration, 0) || 600;
    const totalMinutes = Math.ceil(totalDuration / 60);
    
    let script = '';
    // Check if we need chunked generation for long scripts
    const needsChunking = LongFormScriptHandler.needsChunking(totalDuration);
    
    // Calculate credits based on duration and AI model (add multiplier for chunks)
    const chunkConfig = LongFormScriptHandler.getChunkConfig(totalMinutes);
    const chunkMultiplier = needsChunking ? 1.2 : 1; // 20% extra for chunked generation overhead
    let creditsUsed = Math.ceil(calculateCreditsForDuration(totalDuration, model) * chunkMultiplier);

    // Use Claude API to generate script
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Get the actual model name
        const actualModel = (() => {
          if (model === 'claude-opus-4-1') return 'claude-3-opus-20240229';
          if (model === 'claude-3-5-sonnet') return 'claude-3-5-sonnet-20241022';
          return 'claude-3-haiku-20240307';
        })();

        if (needsChunking) {
          console.log(`Using chunked generation for ${totalMinutes}-minute script (${chunkConfig.chunks} chunks)`);
          
          // Generate chunks
          const chunkPrompts = LongFormScriptHandler.generateChunkPrompts({
            totalMinutes,
            title,
            topic,
            contentPoints: contentPoints?.points || [],
            type,
            hook,
            voiceProfile
          });
          
          const scriptChunks = [];
          
          for (let i = 0; i < chunkPrompts.length; i++) {
            console.log(`Generating chunk ${i + 1}/${chunkPrompts.length}...`);
            
            const chunkResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: actualModel,
                max_tokens: 4096,
                temperature: 0.7,
                system: `You are an expert YouTube scriptwriter who ALWAYS completes your assigned section FULLY.

ABSOLUTE REQUIREMENTS:
1. Write your ENTIRE assigned section - no exceptions
2. NEVER say "I'll continue", "due to length", or similar
3. NEVER use [...] or promise to continue later
4. Complete EVERYTHING for your time range
5. NO placeholders or shortcuts anywhere`,
                messages: [{
                  role: 'user',
                  content: chunkPrompts[i]
                }]
              })
            });
            
            if (chunkResponse.ok) {
              const chunkData = await chunkResponse.json();
              const chunkScript = chunkData.content?.[0]?.text || '';
              
              if (chunkScript) {
                scriptChunks.push(chunkScript);
              } else {
                console.error(`Empty response for chunk ${i + 1}`);
                throw new Error(`Failed to generate chunk ${i + 1}`);
              }
            } else {
              console.error(`Failed to generate chunk ${i + 1}:`, await chunkResponse.text());
              throw new Error(`Failed to generate chunk ${i + 1}`);
            }
          }
          
          // Stitch chunks together
          script = LongFormScriptHandler.stitchChunks(scriptChunks);
          
          // Validate completeness
          const validation = LongFormScriptHandler.validateCompleteness(script, totalMinutes);
          if (!validation.isValid) {
            console.warn('Script validation issues:', validation.issues);
          }
          
        } else {
          // Single generation for shorter scripts
          console.log(`Using single generation for ${totalMinutes}-minute script`);
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: actualModel,
            max_tokens: (() => {
              // Calculate tokens based on script duration
              const minutes = Math.ceil(totalDuration / 60);
              const estimatedWords = minutes * 150;
              const estimatedTokens = Math.ceil(estimatedWords * 1.33);
              
              // Cap at model limits
              // Claude 3 models support up to 4096 output tokens per request
              // For very long scripts, we need a different approach
              if (estimatedTokens > 4096) {
                console.log(`Script requires ~${estimatedTokens} tokens, but model limited to 4096. Will generate condensed version.`);
                return 4096;
              }
              
              return Math.min(estimatedTokens + 500, 4096); // Add buffer, cap at model limit
            })(),
            temperature: 0.7,
            system: `You are an expert YouTube scriptwriter who ALWAYS completes scripts in ONE response.

ABSOLUTE REQUIREMENTS:
1. COMPLETE the ENTIRE script in THIS response - no exceptions
2. NEVER say "I'll continue", "due to length", "in the next response", or similar
3. NEVER use [...], "Continue with", or "Note: This is just the first portion"
4. Write ALL content from [0:00] to [${Math.ceil(totalDuration / 60)}:00] NOW
5. If the title says "7 secrets", write ALL 7 secrets COMPLETELY
6. Include COMPLETE description with timestamps and tags - not placeholders
7. Approximately ${Math.ceil(totalDuration / 60) * 150} words for ${Math.ceil(totalDuration / 60)} minutes

YOU WILL BE PENALIZED for incomplete scripts or continuation messages.`,
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
                    // Pass all workflow context including enhanced research
                    frame: frame,
                    hook: hook,
                    contentPoints: contentPoints,
                    research: enhancedResearch || research,
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

${enhancedResearch?.insights ? `
KEY RESEARCH INSIGHTS:
${enhancedResearch.insights.facts?.length > 0 ? `Facts: ${enhancedResearch.insights.facts.slice(0, 3).join(' • ')}` : ''}
${enhancedResearch.insights.statistics?.length > 0 ? `Statistics: ${enhancedResearch.insights.statistics.slice(0, 3).join(' • ')}` : ''}
${enhancedResearch.insights.trends?.length > 0 ? `Trends: ${enhancedResearch.insights.trends.slice(0, 3).join(' • ')}` : ''}
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
- Strong opening and closing

COMPLETENESS REQUIREMENT:
You MUST write out the ENTIRE script from start to finish. Do NOT use any shortcuts, ellipses, or placeholder text. 
If the title mentions "7 secrets" or "5 tips", you MUST write out ALL 7 or 5 items in FULL DETAIL.
Every minute of the ${Math.ceil(totalDuration / 60)}-minute script must be accounted for with actual content.`;
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
            
            // Validate for placeholders and continuation messages
            const continuationPatterns = [
              /\[Rest of.*\]/i,
              /\[Continue.*\]/i,
              /\[Add more.*\]/i,
              /\.\.\.\]/,
              /I'll continue/i,
              /I'll provide the rest/i,
              /in the next response/i,
              /due to length limits/i,
              /This is just the first portion/i,
              /Would you like me to continue/i
            ];
            
            const hasIssues = continuationPatterns.some(pattern => pattern.test(script));
            if (hasIssues) {
              console.error('❌ Script contains continuation/placeholder text - regenerating may be needed');
              // Could potentially trigger a regeneration here
            }
          } else {
            console.error('Claude API error response:', await claudeResponse.text());
            script = generateFallbackScript(type, title, topic, contentPoints);
          }
        } // End of else block for single generation
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
    
    // Handle credit deduction
    let deductResult = { success: true, cost: 0 };
    
    if (!bypassCredits) {
      // Log credit calculation details
      console.log('Credit calculation:', {
        totalDuration,
        model,
        creditsUsed,
        userId: user.id
      });
      
      // Deduct credits using ServerCreditManager
      deductResult = await ServerCreditManager.deductCredits(
        supabase,
        user.id,
        'SCRIPT_GENERATION',
        { 
          model: model.includes('haiku') ? 'GPT35' : model.includes('sonnet') ? 'GPT4' : 'GPT4',
          duration: totalDuration,
          calculatedCost: creditsUsed // Override with our calculated cost
        }
      );

      console.log('Deduct result:', deductResult);

      if (!deductResult.success) {
        console.error('Credit deduction failed:', deductResult);
        return NextResponse.json(
          { 
            error: deductResult.error || 'Insufficient credits',
            required: creditsUsed,
            balance: deductResult.balance 
          },
          { status: 402 }
        );
      }
    } else {
      console.log('Credits bypassed for user:', user.id);
    }

    // Get user's channel or create one if needed (required for scripts table)
    let channelId = null;
    
    // First, try to get user's existing channel
    const { data: userChannel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no channel exists
    
    if (userChannel?.id) {
      channelId = userChannel.id;
    } else {
      // Create a default channel for the user if they don't have one
      console.log('No channel found for user, creating default channel...');
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          user_id: user.id,
          youtube_channel_id: `default_${user.id}_${Date.now()}`, // Make it unique
          name: 'My Channel',
          title: 'My Channel',
          description: 'Default channel for script generation'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Failed to create default channel:', createError);
        // Don't fail the request, just log the error
      } else {
        channelId = newChannel.id;
        console.log('Created default channel with ID:', channelId);
      }
    }

    // Save the script to the database if we have a channel ID
    if (channelId && script) {
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
            channel_id: channelId,
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
      // No channel ID or no script generated
      console.warn('Script not saved to database:', { 
        hasChannelId: !!channelId, 
        hasScript: !!script 
      });
      
      return NextResponse.json({ 
        script,
        creditsUsed,
        warning: 'Script generated but not saved to database'
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