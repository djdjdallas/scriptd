import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOptimizedScript } from '@/lib/prompts/optimized-youtube-generator';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { LongFormScriptHandler } from '@/lib/script-generation/long-form-handler';
import ResearchService from '@/lib/ai/research-service';
import { ContentFetcher } from '@/lib/content-fetcher';
import crypto from 'crypto';

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

// Removed fallback script generator - now we return errors instead of generating bad templates

export async function POST(request) {
  console.log('🚀 === SCRIPT GENERATION API CALLED ===');
  
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

    // Debug: Log what research data we received
    console.log('=== FULL RESEARCH DATA RECEIVED ===');
    console.log('Research data received:', {
      hasResearch: !!research,
      sourcesCount: research?.sources?.length || 0,
      sources: research?.sources?.slice(0, 2), // Log first 2 sources for debugging
      fullStructure: JSON.stringify(research, null, 2)
    });

    // SKIP ContentFetcher for web sources - Claude already fetched everything!
    if (research?.sources && research.sources.length > 0) {
      console.log('📊 === VALIDATING RESEARCH CONTENT ===');
      console.log('Research provider:', research.provider || 'unknown');

      // Only use ContentFetcher for uploaded documents (not web sources)
      const uploadedDocs = research.sources.filter(s =>
        s.source_type === 'document' || s.source_type === 'upload'
      );

      const webSources = research.sources.filter(s =>
        s.source_type === 'web' || s.source_type === 'synthesis'
      );

      console.log(`Web sources (already fetched by Claude): ${webSources.length}`);
      console.log(`Uploaded documents (need processing): ${uploadedDocs.length}`);

      if (uploadedDocs.length > 0) {
        console.log(`📄 Processing ${uploadedDocs.length} uploaded documents with ContentFetcher`);
        try {
          const fetcher = new ContentFetcher(1500);
          // Note: processUploadedDocuments method would need to be implemented
          // For now, just use enrichSources for documents only
          const processedDocs = await fetcher.enrichSources(uploadedDocs);

          // Update only the uploaded documents
          research.sources = research.sources.map(source => {
            if (source.source_type === 'document' || source.source_type === 'upload') {
              const processed = processedDocs.find(d => d.source_url === source.source_url);
              return processed || source;
            }
            return source; // Keep web sources as-is (Claude already fetched them)
          });

          // If research was saved to database, update it with processed documents
          if (research.id && processedDocs.length > 0) {
            console.log('📝 Updating research in database with processed documents');
            const { error: updateError } = await supabase
              .from('script_research')
              .update({ sources: research.sources })
              .eq('id', research.id);

            if (updateError) {
              console.error('Failed to update research with processed documents:', updateError);
            } else {
              // Verify the update
              const verifiedSources = await fetcher.verifyDatabaseUpdate(supabase, research.id);
              console.log('✅ Research sources verified in database');
            }
          }
        } catch (error) {
          console.error('Document processing failed, continuing:', error);
        }
      } else {
        console.log('✅ No document processing needed - all content already fetched by Claude');
      }
    }

    let verifiedSources = research?.sources?.filter(s => s.fact_check_status === 'verified') || [];
    let starredSources = research?.sources?.filter(s => s.is_starred) || [];

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

    // ENHANCED CONTENT QUALITY VALIDATION
    const validateContentQuality = (sources, duration = 600) => {
      // Filter for sources with actual content (not just search snippets)
      // Web search snippets typically say "Source found via web search. Page last updated: ..."
      const isWebSearchSnippet = (source) => {
        const content = source.source_content || '';
        return content.includes('Source found via web search. Page last updated:') && content.length < 100;
      };

      const sourcesWithContent = sources.filter(s =>
        s.source_content && s.source_content.length > 100 && !isWebSearchSnippet(s)
      );

      // Count actual content sources (synthesis + sources with real content)
      const substantiveSources = sources.filter(s =>
        s.source_type === 'synthesis' || (s.source_content && s.source_content.length > 500)
      );

      const totalContentLength = sourcesWithContent.reduce((sum, s) =>
        sum + (s.source_content?.length || 0), 0
      );

      const stats = {
        total: sources.length,
        withContent: sourcesWithContent.length,
        substantiveSources: substantiveSources.length,
        webSearchSnippets: sources.filter(isWebSearchSnippet).length,
        // Success rate based on sources with real content, not including snippets
        successRate: sources.length > 0 ? (substantiveSources.length / sources.length) * 100 : 0,
        totalContentLength,
        averageContentLength: sourcesWithContent.length > 0
          ? Math.round(totalContentLength / sourcesWithContent.length)
          : 0
      };

      console.log('📊 === CONTENT QUALITY VALIDATION ===');
      console.log('Stats:', stats);

      // Enhanced word count analysis
      const totalWords = sources.reduce((sum, s) => {
        const content = s.source_content || '';
        return sum + content.split(/\s+/).filter(w => w.length > 0).length;
      }, 0);

      console.log('\n=== WORD COUNT ANALYSIS ===');
      console.log(`Total Words in Research: ${totalWords.toLocaleString()}`);
      console.log(`Average Words per Source: ${Math.round(totalWords / sources.length)}`);

      // Per-source breakdown
      console.log('\n=== PER-SOURCE BREAKDOWN ===');
      sources.forEach((source, idx) => {
        const content = source.source_content || '';
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        console.log(`Source ${idx + 1}: ${source.source_title || source.source_url}`);
        console.log(`  Length: ${content.length} chars | ${wordCount} words`);
        console.log(`  Preview: "${content.substring(0, 100)}..."`);
        if (content.length < 500) {
          console.warn(`  ⚠️ WARNING: Very short content (${content.length} chars)`);
        }
      });

      // Calculate research depth vs target
      const targetMinutes = Math.ceil(duration / 60);
      const estimatedMinutes = totalWords / 150; // 150 words per minute speech
      const researchRatio = estimatedMinutes / targetMinutes;

      console.log('\n=== RESEARCH ADEQUACY ===');
      console.log(`Target Script: ${targetMinutes} minutes`);
      console.log(`Research Content: ${estimatedMinutes.toFixed(1)} minutes worth`);
      console.log(`Ratio: ${researchRatio.toFixed(2)}x (${researchRatio >= 2 ? '✅ Good' : researchRatio >= 1 ? '⚠️ Adequate' : '❌ Too Thin'})`);

      // Check for high-quality research that bypasses word count requirements
      const hasSynthesis = sources.some(s => s.source_type === 'synthesis');
      const verifiedSources = sources.filter(s => s.fact_check_status === 'verified');
      const starredSources = sources.filter(s => s.is_starred);

      const hasQualityResearch = hasSynthesis && (verifiedSources.length >= 2 || starredSources.length >= 2);

      if (hasQualityResearch) {
        console.log('\n✅ === QUALITY BYPASS ACTIVATED ===');
        console.log(`Has synthesis: ${hasSynthesis}`);
        console.log(`Verified sources: ${verifiedSources.length}`);
        console.log(`Starred sources: ${starredSources.length}`);
        console.log('Skipping strict word count validation due to high-quality research');
      } else if (totalWords < 1000) {
        console.error('\n❌ CRITICAL: Research content is TOO THIN (<1000 words)');
        console.error('   Claude will struggle to generate quality content from this.');
        console.error('   Expected: At least 2000+ words of research for quality scripts');
      } else if (totalWords < targetMinutes * 100) {
        console.warn(`\n⚠️ WARNING: Research (${totalWords} words) may be thin for ${targetMinutes}-min script`);
        console.warn(`   Recommend: At least ${targetMinutes * 100} words for best results`);
      }

      // Quality thresholds - UPDATED to properly handle web search + Perplexity sources
      const MIN_SUBSTANTIVE_SOURCES = 3; // Sources with real content (synthesis or 500+ chars)
      const MIN_TOTAL_CONTENT_LENGTH = 3000; // Reduced - quality over quantity
      const MIN_TOTAL_WORDS = Math.max(1000, targetMinutes * 60); // More reasonable word count

      const errors = [];

      // Check for substantive sources (not web search snippets)
      if (stats.substantiveSources < MIN_SUBSTANTIVE_SOURCES) {
        errors.push(
          `Insufficient substantive sources: Only ${stats.substantiveSources}/${sources.length} sources have detailed content. ` +
          `Need at least ${MIN_SUBSTANTIVE_SOURCES} sources with comprehensive information. ` +
          `(Found ${stats.webSearchSnippets} web search snippets which provide URLs but not full content)`
        );
      }

      // Only check content length if we don't have quality research
      if (!hasQualityResearch && stats.totalContentLength < MIN_TOTAL_CONTENT_LENGTH) {
        errors.push(
          `Insufficient content: Only ${stats.totalContentLength} characters of detailed content. ` +
          `Need at least ${MIN_TOTAL_CONTENT_LENGTH} characters for comprehensive scripts.`
        );
      }

      // Check word count with bypass for quality research
      if (totalWords < MIN_TOTAL_WORDS && !hasQualityResearch) {
        errors.push(
          `Insufficient research depth: Only ${totalWords} words of research content. ` +
          `Need at least ${MIN_TOTAL_WORDS} words for a ${targetMinutes}-minute script. ` +
          `This ensures Claude has enough material to work with.`
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        stats,
        sourcesWithContent,
        hasQualityResearch // Return this so we can use it later
      };
    };

    // Validate content quality
    let hasQualityResearch = false;
    if (research?.sources && research.sources.length > 0) {
      // Calculate duration early for validation
      const durationForValidation = targetDuration || contentPoints?.points?.reduce((acc, p) => acc + p.duration, 0) || 600;
      const validation = validateContentQuality(research.sources, durationForValidation);

      // Store quality research flag for later use
      hasQualityResearch = validation.hasQualityResearch;

      if (!validation.isValid) {
        console.error('❌ Content quality validation failed:', validation.errors);
        console.log('Source details:', research.sources.map(s => ({
          title: s.source_title,
          url: s.source_url,
          contentLength: s.source_content?.length || 0,
          fetchStatus: s.fetch_status
        })));

        // Return error WITHOUT charging credits
        return NextResponse.json({
          error: 'Insufficient content for script generation',
          details: validation.errors,
          stats: validation.stats,
          suggestion: 'Please try adding more sources or using different URLs that are accessible.',
          sources: research.sources.map(s => ({
            url: s.source_url,
            success: !!s.source_content && s.source_content.length > 100,
            contentLength: s.source_content?.length || 0
          }))
        }, { status: 422 }); // 422 Unprocessable Entity
      }

      console.log('✅ Content quality validation passed');
    } else {
      console.warn('⚠️ No research sources provided, relying on auto-generation');
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
          
          // Generate chunks with full context
          const chunkPrompts = LongFormScriptHandler.generateChunkPrompts({
            totalMinutes,
            title,
            topic,
            contentPoints: contentPoints?.points || [],
            type,
            hook,
            voiceProfile,
            targetAudience,
            tone,
            research: enhancedResearch || research,
            frame
          });
          
          const scriptChunks = [];
          
          for (let i = 0; i < chunkPrompts.length; i++) {
            console.log(`Generating chunk ${i + 1}/${chunkPrompts.length}...`);

            let chunkScript = '';
            let retryCount = 0;
            const maxRetries = 2;
            // Reduce word requirement by 30% when we have quality research
            const wordsPerMinute = hasQualityResearch ? 105 : 150;
            const minWordsPerChunk = Math.ceil((totalMinutes / chunkConfig.chunks) * wordsPerMinute);

            // Retry loop for short chunks
            while (retryCount <= maxRetries) {
              const chunkResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: actualModel,
                max_tokens: 8192, // Increased from 4096 for longer content
                temperature: 0.7,
                system: `You are an expert YouTube scriptwriter who MUST write LONG, DETAILED scripts.

ABSOLUTE WORD COUNT REQUIREMENT:
Your section MUST be AT LEAST ${minWordsPerChunk} words.
This is NON-NEGOTIABLE. Shorter responses will be REJECTED.

CRITICAL RULES:
1. Count your words as you write - ensure you meet the ${minWordsPerChunk} word MINIMUM
2. Write DETAILED, EXPANDED content - don't summarize or rush
3. Include rich descriptions, examples, and explanations
4. NEVER say "I'll continue", "due to length", or use [...]
5. NO placeholders or shortcuts - write EVERYTHING in full
6. Each paragraph should be substantial (50+ words)
7. Expand on every point thoroughly
8. ${i === chunkConfig.chunks - 1 ? `This is the LAST section - MUST include:
   - Complete ## Description section with timestamps for ENTIRE video
   - Complete ## Tags section with 20+ real tags (no placeholders)` : 'Continue from previous section seamlessly'}

YOU WILL BE PENALIZED for responses under ${minWordsPerChunk} words.`,
                messages: [{
                  role: 'user',
                  content: chunkPrompts[i]
                }]
              })
            });
            
              if (chunkResponse.ok) {
                const chunkData = await chunkResponse.json();
                chunkScript = chunkData.content?.[0]?.text || '';

                if (chunkScript) {
                  // Check word count
                  const wordCount = chunkScript.split(/\s+/).length;
                  console.log(`Chunk ${i + 1} word count: ${wordCount} (min: ${minWordsPerChunk})`);

                  if (wordCount < minWordsPerChunk && retryCount < maxRetries) {
                    console.warn(`Chunk ${i + 1} too short (${wordCount}/${minWordsPerChunk} words), retrying...`);
                    retryCount++;
                    continue; // Retry the chunk
                  }

                  // Chunk is good, add it
                  scriptChunks.push(chunkScript);
                  break; // Exit retry loop
                } else {
                  console.error(`Empty response for chunk ${i + 1}`);
                  if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying chunk ${i + 1} (attempt ${retryCount + 1})...`);
                    continue;
                  }
                  return NextResponse.json(
                    {
                      error: 'Script generation failed',
                      details: `Failed to generate section ${i + 1} of the script after ${maxRetries + 1} attempts. Please try again.`,
                      retry: true
                    },
                    { status: 500 }
                  );
                }
              } else {
                const errorText = await chunkResponse.text();
                console.error(`Failed to generate chunk ${i + 1}:`, errorText);
                if (retryCount < maxRetries) {
                  retryCount++;
                  console.log(`Retrying chunk ${i + 1} due to API error (attempt ${retryCount + 1})...`);
                  continue;
                }
                return NextResponse.json(
                  {
                    error: 'Script generation failed',
                    details: `Failed to generate section ${i + 1} of the script. Please try again.`,
                    retry: true
                  },
                  { status: 500 }
                );
              }
            } // End while loop
          } // End for loop
          
          // Stitch chunks together
          script = LongFormScriptHandler.stitchChunks(scriptChunks);

          // Validate completeness (more lenient with quality research)
          const validation = LongFormScriptHandler.validateCompleteness(script, totalMinutes);
          if (!validation.isValid) {
            console.warn('Script validation issues:', validation.issues);

            // If we have quality research, be more lenient
            if (hasQualityResearch) {
              console.log('⚠️ Validation issues detected, but proceeding due to quality research bypass');
            }
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

              // Increased token limit for better output
              // Claude 3 models can handle up to 8192 output tokens
              const maxTokenLimit = 8192;

              if (estimatedTokens > maxTokenLimit) {
                console.log(`Script requires ~${estimatedTokens} tokens, capping at ${maxTokenLimit}.`);
                return maxTokenLimit;
              }

              return Math.min(estimatedTokens + 1000, maxTokenLimit); // Add buffer, cap at 8192
            })(),
            temperature: 0.7,
            system: `You are an expert YouTube scriptwriter who MUST write LONG, DETAILED, COMPLETE scripts.

ABSOLUTE WORD COUNT REQUIREMENT:
You MUST write AT LEAST ${Math.ceil(totalDuration / 60) * 150} words for the script content.
This is MANDATORY. Shorter scripts will be REJECTED.

CRITICAL REQUIREMENTS:
1. Write AT LEAST ${Math.ceil(totalDuration / 60) * 150} words of script content (not counting Description/Tags)
2. Count your words as you write - ensure you meet the minimum
3. Write DETAILED, EXPANDED content with rich descriptions
4. NEVER say "I'll continue", "due to length", or use [...]
5. If the title says "7 secrets", write ALL 7 secrets in FULL DETAIL
6. Each section should be thoroughly developed (200+ words per main point)
7. Include specific examples, stories, and explanations

MANDATORY SECTIONS (MUST INCLUDE ALL):
1. Main Script Content (MINIMUM ${Math.ceil(totalDuration / 60) * 150} words - write MORE not less)
2. ## Description (with TIMESTAMPS: section listing ALL timestamps for the video)
3. ## Tags (20+ actual relevant tags, NO placeholders)

Example Description Format:
## Description
[Engaging description of the video]

TIMESTAMPS:
0:00 Introduction
1:30 First main point
3:45 Second main point
[etc...]

Links:
[Any relevant links]

Example Tags Format:
## Tags
keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8, keyword9, keyword10, keyword11, keyword12, keyword13, keyword14, keyword15

YOU WILL BE PENALIZED for:
- Scripts under ${Math.ceil(totalDuration / 60) * 150} words
- Missing or incomplete Description section
- Missing or placeholder Tags section
- Any continuation messages or placeholders`,
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
                    thumbnail: thumbnail,
                    targetAudience: targetAudience,
                    tone: tone
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
              console.error('Empty Claude response - no script generated');
              return NextResponse.json(
                {
                  error: 'Script generation failed',
                  details: 'AI returned empty response. Please try again.',
                  retry: true
                },
                { status: 500 }
              );
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
            const errorText = await claudeResponse.text();
            console.error('Claude API error response:', errorText);
            return NextResponse.json(
              {
                error: 'Script generation failed',
                details: 'AI service error. Please try again.',
                retry: true
              },
              { status: 500 }
            );
          }
        } // End of else block for single generation
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        return NextResponse.json(
          {
            error: 'Script generation failed',
            details: claudeError.message || 'An error occurred during script generation. Please try again.',
            retry: true
          },
          { status: 500 }
        );
      }
    } else {
      // No Claude API key
      console.error('No Claude API key configured');
      return NextResponse.json(
        {
          error: 'Configuration error',
          details: 'AI service not configured. Please contact support.',
          retry: false
        },
        { status: 500 }
      );
    }

    // Validate script before charging credits
    console.log('=== VALIDATING GENERATED SCRIPT ===');

    // Basic validation
    if (!script || script.length < 100) {
      console.error('Script validation failed: Too short or empty');
      return NextResponse.json(
        {
          error: 'Script generation failed',
          details: 'Generated script is too short or empty. Please try again.',
          retry: true
        },
        { status: 500 }
      );
    }

    // Check for required sections
    const hasDescription = script.includes('## Description') && script.includes('TIMESTAMPS:');
    const hasTags = script.includes('## Tags') && !script.includes('[') && !script.includes('...');
    const wordCount = script.split(/\s+/).length;
    const expectedWords = Math.ceil(totalDuration / 60) * 150;

    // More detailed validation logging
    console.log('Script validation details:', {
      wordCount,
      expectedWords,
      percentComplete: Math.round((wordCount / expectedWords) * 100),
      hasDescription,
      hasTags,
      scriptLength: script.length
    });

    // Check for placeholder patterns
    const placeholderPatterns = [
      /\[Add specific examples.*\]/i,
      /\[Continue.*\]/i,
      /\[Rest of.*\]/i,
      /Let me break this down for you\.\.\./,
      /\[Add more.*\]/i
    ];

    const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(script));

    if (hasPlaceholders) {
      console.error('Script validation failed: Contains placeholder text');
      return NextResponse.json(
        {
          error: 'Script generation incomplete',
          details: 'Generated script contains placeholder text. Please try again.',
          retry: true
        },
        { status: 500 }
      );
    }

    // Be more lenient with quality research (allow 40% of expected instead of 50%)
    const minWordThreshold = hasQualityResearch ? 0.4 : 0.5;

    if (wordCount < expectedWords * minWordThreshold) {
      console.error(`Script validation failed: Too short (${wordCount}/${expectedWords} words)`);
      return NextResponse.json(
        {
          error: 'Script generation incomplete',
          details: `Script is too short (${wordCount} words, expected at least ${Math.floor(expectedWords * minWordThreshold)}). Please try again.`,
          retry: true
        },
        { status: 500 }
      );
    }

    // With quality research, we can be more lenient about missing sections
    if (!hasQualityResearch && (!hasDescription || !hasTags)) {
      console.error('Script validation failed: Missing required sections');
      return NextResponse.json(
        {
          error: 'Script generation incomplete',
          details: 'Script is missing Description or Tags section. Please try again.',
          retry: true
        },
        { status: 500 }
      );
    } else if (hasQualityResearch && (!hasDescription || !hasTags)) {
      console.warn('⚠️ Script missing some sections, but proceeding due to quality research');
    }

    console.log('✅ Script validation passed:', {
      wordCount,
      expectedWords,
      hasDescription,
      hasTags,
      hasPlaceholders: false
    });

    // Handle credit deduction AFTER validation
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

    // Get user's channel if it exists (now optional for scripts)
    let channelId = null;
    
    // Try to get user's existing channel, but it's no longer required
    const { data: userChannel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no channel exists
    
    if (userChannel?.id) {
      channelId = userChannel.id;
      console.log('Using existing channel with ID:', channelId);
    } else {
      // No channel found - that's OK now, scripts can exist without a channel
      console.log('No channel found for user, proceeding without channel (script will be channel-independent)');
    }

    // Save the script to the database (channel is now optional)
    console.log('=== SCRIPT SAVE DEBUG ===');
    console.log('Has channelId:', !!channelId, channelId);
    console.log('Has script:', !!script, script?.substring(0, 100));
    
    if (script) {  // Only require script content, not channel
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

        console.log('Attempting to save script with title:', scriptTitle);

        // Create the script record (with optional channel_id)
        const { data: newScript, error: scriptError } = await supabase
          .from('scripts')
          .insert({
            channel_id: channelId,  // Can be null now
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
          console.error('❌ Error saving script to database:', scriptError);
          console.error('Script save failed with data:', {
            channel_id: channelId,
            user_id: user.id,
            title: scriptTitle,
            hasContent: !!script
          });
          // Don't fail the request if save fails, just log it
          
          // IMPORTANT: If script save fails, newScript will be null
          // so research sources won't be saved either
        } else if (!newScript || !newScript.id) {
          console.error('❌ Script save returned no data or no ID!');
          console.error('newScript value:', newScript);
        } else {
          console.log('✅ Script saved to database with ID:', newScript.id);
          
          // Save research sources to script_research table
          // Use enhancedResearch if available (includes auto-generated sources), otherwise use original research
          const researchToSave = enhancedResearch || research;
          
          console.log('=== RESEARCH SAVE DEBUG ===');
          console.log('Has newScript.id:', !!newScript?.id, newScript?.id);
          console.log('Research to save:', {
            hasResearch: !!researchToSave,
            hasSources: !!researchToSave?.sources,
            sourcesLength: researchToSave?.sources?.length || 0,
            firstSource: researchToSave?.sources?.[0]
          });
          
          if (newScript.id && researchToSave?.sources && researchToSave.sources.length > 0) {
            try {
              console.log('Attempting to save research sources for script:', newScript.id);
              console.log('Research sources available:', researchToSave.sources.length);
              console.log('Research is auto-generated:', !!enhancedResearch?.autoGenerated);
              
              // Use all sources from research (already selected by user or auto-generated)
              const sourcesToSave = researchToSave.sources;
              
              console.log('Sources to save:', sourcesToSave.map(s => ({
                title: s.source_title,
                url: s.source_url,
                status: s.fact_check_status,
                contentLength: s.source_content?.length || 0
              })));
              
              // Log content status for debugging
              const contentStats = {
                total: sourcesToSave.length,
                withContent: sourcesToSave.filter(s => s.source_content && s.source_content.length > 0).length,
                substantialContent: sourcesToSave.filter(s => s.source_content && s.source_content.length > 100).length
              };
              console.log('📊 Content statistics before save:', contentStats);
              
              // Prepare research data for script_research table
              const scriptResearchId = crypto.randomUUID();
              const scriptResearchData = {
                id: scriptResearchId,
                script_id: newScript.id,
                sources: sourcesToSave.map(source => ({
                  title: source.source_title || '',
                  url: source.source_url || '',
                  content: source.source_content || '',
                  fact_check_status: source.fact_check_status || 'unverified',
                  is_starred: source.is_starred || false,
                  relevance: source.relevance || 0.5
                })),
                fact_checks: sourcesToSave
                  .filter(s => s.fact_check_status === 'verified')
                  .map(s => ({
                    source_url: s.source_url,
                    status: s.fact_check_status,
                    checked_at: new Date().toISOString()
                  })).length > 0 ? sourcesToSave
                  .filter(s => s.fact_check_status === 'verified')
                  .map(s => ({
                    source_url: s.source_url,
                    status: s.fact_check_status,
                    checked_at: new Date().toISOString()
                  })) : null  // Use null if no fact checks
                // Don't set created_at, let the database handle it
              };
              
              console.log('Inserting script research data:', {
                id: scriptResearchData.id,
                script_id: scriptResearchData.script_id,
                sources_count: scriptResearchData.sources.length,
                fact_checks_count: scriptResearchData.fact_checks.length
              });
              
              // Log full data being inserted for debugging
              console.log('Full script_research data to insert:', JSON.stringify(scriptResearchData, null, 2));
              
              const { data: insertedData, error: researchError } = await supabase
                .from('script_research')
                .insert(scriptResearchData)
                .select();
              
              if (researchError) {
                console.error('❌ Error saving script research:', researchError);
                console.error('Error details:', {
                  message: researchError.message,
                  details: researchError.details,
                  hint: researchError.hint,
                  code: researchError.code
                });
                console.error('Research data that failed:', JSON.stringify(scriptResearchData, null, 2));
                
                // Try alternative approach - save with minimal data to see what works
                console.log('Attempting minimal save...');
                const minimalData = {
                  id: scriptResearchId,
                  script_id: newScript.id,
                  sources: JSON.stringify(sourcesToSave), // Try as JSON string
                  fact_checks: null
                };
                
                const { data: minimalInsert, error: minimalError } = await supabase
                  .from('script_research')
                  .insert(minimalData)
                  .select();
                  
                if (minimalError) {
                  console.error('❌ Minimal save also failed:', minimalError);
                } else {
                  console.log('✅ Minimal save succeeded:', minimalInsert);
                }
              } else {
                console.log(`✅ Successfully saved ${sourcesToSave.length} research sources to script_research table`);
                console.log('Inserted data:', insertedData);
              }
              
              // Also save individual sources if they came from enhancedResearch (auto-generated)
              if (enhancedResearch?.autoGenerated && enhancedResearch?.summary) {
                // Save research summary as metadata
                const { error: updateError } = await supabase
                  .from('scripts')
                  .update({
                    metadata: {
                      ...newScript.metadata,
                      research_summary: enhancedResearch.summary,
                      research_insights: enhancedResearch.insights
                    }
                  })
                  .eq('id', newScript.id);
                  
                if (updateError) {
                  console.error('Error updating script with research summary:', updateError);
                }
              }
            } catch (researchSaveError) {
              console.error('❌ Exception while saving research sources:', researchSaveError);
              console.error('Stack trace:', researchSaveError.stack);
              // Don't fail the main request
            }
          } else {
            console.log('⚠️ Not saving research sources because:', {
              hasScriptId: !!newScript?.id,
              hasResearchToSave: !!researchToSave,
              hasSources: !!researchToSave?.sources,
              sourcesLength: researchToSave?.sources?.length || 0
            });
          }
        }

        console.log('=== RETURNING RESPONSE ===');
        console.log('Script ID being returned:', newScript?.id);
        console.log('Credits used:', creditsUsed);
        
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
      // No script generated
      console.warn('Script not generated:', { 
        hasScript: !!script 
      });
      
      return NextResponse.json({ 
        script: script || '',
        creditsUsed,
        error: 'Script generation failed'
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