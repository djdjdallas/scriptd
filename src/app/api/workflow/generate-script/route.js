import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOptimizedScript } from '@/lib/prompts/optimized-youtube-generator';
import { ServerCreditManager } from '@/lib/credits/server-manager';
import { LongFormScriptHandler } from '@/lib/script-generation/long-form-handler';
import ResearchService from '@/lib/ai/research-service';
import { ContentFetcher } from '@/lib/content-fetcher';
import crypto from 'crypto';
import { apiLogger } from '@/lib/monitoring/logger';
import {
  SCRIPT_CONFIG,
  calculateChunkStrategy,
  validateScriptQuality,
  validateUserAccess
} from '@/lib/scriptGenerationConfig';
import { checkFeatureRateLimit } from '@/lib/api/rate-limit';
import { MODEL_TIERS } from '@/lib/constants';
import { getPostHogClient } from '@/lib/posthog-server';
import { expandShortScript } from '@/lib/script-generation/expansion-handler';
import { generateContentPlan, applyContentPlan } from '@/lib/script-generation/content-planner';
import { generateComprehensiveOutline, formatOutlineForPrompt } from '@/lib/script-generation/outline-generator';
import {
  validateChunkAgainstOutline,
  validateCompleteScript,
  validateOutlineBeforeGeneration
} from '@/lib/script-generation/outline-validator';

// Helper function to calculate credits based on duration and model
function calculateCreditsForDuration(durationInSeconds, model) {
  const minutes = Math.ceil(durationInSeconds / 60);

  // Base rate: 0.33 credits per minute (so 10 min Professional = 5 credits)
  const baseRate = 0.33;

  // Normalize model name first - all script generation uses BALANCED or PREMIUM
  const normalizeModel = (m) => {
    const mapping = {
      'claude-3-5-haiku': MODEL_TIERS.BALANCED.actualModel, // FAST tier disabled
      'claude-3-haiku': MODEL_TIERS.BALANCED.actualModel,
      'claude-3-5-sonnet': MODEL_TIERS.BALANCED.actualModel,
      'claude-3-opus': MODEL_TIERS.PREMIUM.actualModel,
      'claude-opus-4-1': MODEL_TIERS.PREMIUM.actualModel,
      'claude-opus-4-5': MODEL_TIERS.PREMIUM.actualModel,
      'claude-opus-4-6': MODEL_TIERS.PREMIUM.actualModel,
    };
    return mapping[m] || m;
  };

  const normalizedModel = normalizeModel(model || MODEL_TIERS.BALANCED.actualModel);

  // Model multipliers based on actual model IDs
  let modelMultiplier = 1;
  if (normalizedModel === MODEL_TIERS.BALANCED.actualModel) {
    modelMultiplier = 1.5;
  } else if (normalizedModel === MODEL_TIERS.PREMIUM.actualModel) {
    modelMultiplier = 3.5;
  }

  // Calculate final credits (minimum 1 credit)
  return Math.max(1, Math.round(minutes * baseRate * modelMultiplier));
}

// Removed fallback script generator - now we return errors instead of generating bad templates

export async function POST(request) {
  try {
    // Check for Edge Function authentication FIRST
    const edgeFunctionUserId = request.headers.get('X-User-Id');
    const edgeFunctionJobId = request.headers.get('X-Job-Id');
    const edgeFunctionSecret = request.headers.get('X-Edge-Function-Secret');

    let user = null;
    let supabase = null;
    let isEdgeFunctionRequest = false;

    // If request is from Edge Function with proper headers, bypass cookie auth
    if (edgeFunctionUserId && edgeFunctionJobId && edgeFunctionSecret) {
      // Use the actual secret value until we can set it properly in Vercel
      const expectedSecret = process.env.EDGE_FUNCTION_SECRET || 'gpM1FDtEM2RXDu6pXQa0dMOWGiP4F3hlmhWVQWUmV2o=';

      if (edgeFunctionSecret === expectedSecret) {
        // Create a user object with the ID from the Edge Function
        user = { id: edgeFunctionUserId };
        isEdgeFunctionRequest = true;

        // For Edge Function requests, create a service role client
        // Import createClient from @supabase/supabase-js for service role access
        const { createClient: createServiceClient } = require('@supabase/supabase-js');
        supabase = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
      } else {
        apiLogger.warn('Edge Function authentication failed: Invalid secret', { userId: edgeFunctionUserId, jobId: edgeFunctionJobId });
        return NextResponse.json({ error: 'Unauthorized', details: 'Invalid Edge Function secret' }, { status: 401 });
      }
    } else {
      // Standard cookie-based authentication for browser requests
      supabase = await createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        apiLogger.warn('Authentication failed', { error: authError?.message });
        return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
      }
      user = authData.user;
    }

    let {
      type,
      title,
      topic,
      voiceProfile,
      research,
      frame,
      hook,
      contentPoints,
      thumbnail,
      sponsor, // Add sponsor data
      model, // Model is now normalized from MODEL_TIERS
      targetAudience,
      tone,
      targetDuration, // Add targetDuration from summary
      workflowId // Add workflow ID to link the script
    } = await request.json();

    const generationStartTime = Date.now();
    const posthog = getPostHogClient();

    // Track script generation started
    posthog.capture({
      distinctId: user.id,
      event: 'script_generation_started',
      properties: {
        generation_source: 'workflow',
        script_type: type,
        model,
        workflow_id: workflowId || null,
        target_duration_seconds: targetDuration || null,
        has_voice_profile: !!voiceProfile,
        has_research: !!(research?.sources?.length),
        research_source_count: research?.sources?.length || 0,
        has_frame: !!frame,
        has_hook: !!hook,
        has_content_points: !!(contentPoints?.points?.length),
        content_point_count: contentPoints?.points?.length || 0,
        has_sponsor: !!sponsor,
        tone: tone || 'professional',
      }
    });

    // Format JSON audience data to prevent token limit errors
    // If targetAudience is a large JSON object, convert it to token-efficient text format
    if (targetAudience && typeof targetAudience === 'string') {
      try {
        // Try to parse if it looks like JSON
        if (targetAudience.trim().startsWith('{')) {
          const audienceObj = JSON.parse(targetAudience);

          // Check if it's a comprehensive audience analysis object
          if (audienceObj && (audienceObj.demographic_profile || audienceObj.psychographic_analysis)) {
            // Format to compact text representation
            const sections = [];

            // Demographics
            if (audienceObj.demographic_profile) {
              const demo = audienceObj.demographic_profile;
              sections.push('DEMOGRAPHICS:');
              if (demo.age_distribution) {
                sections.push(`Age: ${Object.entries(demo.age_distribution).map(([k,v]) => `${k}=${v}`).join(', ')}`);
              }
              if (demo.gender_distribution) {
                sections.push(`Gender: ${Object.entries(demo.gender_distribution).map(([k,v]) => `${k}=${v}`).join(', ')}`);
              }
              if (demo.geographic_distribution) {
                sections.push(`Location: ${Object.entries(demo.geographic_distribution).map(([k,v]) => `${k}=${v}`).join(', ')}`);
              }
            }

            // Psychographics
            if (audienceObj.psychographic_analysis) {
              const psycho = audienceObj.psychographic_analysis;
              sections.push('\nPSYCHOGRAPHICS:');
              if (psycho.core_values && psycho.core_values.length > 0) {
                sections.push(`Values: ${psycho.core_values.join(', ')}`);
              }
              if (psycho.pain_points && psycho.pain_points.length > 0) {
                sections.push(`Pain Points: ${psycho.pain_points.join(', ')}`);
              }
              if (psycho.aspirations && psycho.aspirations.length > 0) {
                sections.push(`Aspirations: ${psycho.aspirations.join(', ')}`);
              }
            }

            // Engagement drivers
            if (audienceObj.engagement_drivers) {
              const engage = audienceObj.engagement_drivers;
              sections.push('\nENGAGEMENT:');
              if (engage.comment_triggers && engage.comment_triggers.length > 0) {
                sections.push(`Comment Triggers: ${engage.comment_triggers.join('; ')}`);
              }
              if (engage.sharing_motivators && engage.sharing_motivators.length > 0) {
                sections.push(`Share Motivators: ${engage.sharing_motivators.join('; ')}`);
              }
            }

            targetAudience = sections.join('\n');
          }
        }
      } catch (e) {
        // Not JSON or parsing failed, use as-is
      }
    }

    // Get user tier from database
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier, subscription_plan, bypass_credits')
      .eq('id', user.id)
      .single();

    const userTier = userProfile?.subscription_tier || userProfile?.subscription_plan || 'free';

    // Check feature-specific rate limit (skip for Edge Function requests as they're processing already-submitted jobs)
    if (!isEdgeFunctionRequest) {
      const rateLimitCheck = await checkFeatureRateLimit(user.id, 'scripts', userTier);
      if (!rateLimitCheck.success) {
        return NextResponse.json({
          error: 'Daily script limit reached',
          details: userTier === 'free'
            ? 'Free users can generate 3 scripts per day. Upgrade to generate more.'
            : 'Please try again tomorrow.',
          retryAfter: rateLimitCheck.retryAfter
        }, { status: 429 });
      }
    }

    // ===== NEW: VALIDATE USER ACCESS =====
    // Calculate duration early for validation
    const durationForValidation = targetDuration || contentPoints?.points?.reduce((acc, p) => acc + p.duration, 0) || 600;
    const durationMinutes = Math.ceil(durationForValidation / 60);

    const accessCheck = validateUserAccess(user.id, userTier, durationMinutes, model);

    if (!accessCheck.allowed) {
      return NextResponse.json({
        error: 'Access denied',
        details: accessCheck.errors,
        userTier: accessCheck.normalizedTier,
        limits: accessCheck.limits,
      }, { status: 403 });
    }
    // ===== END NEW CODE =====

    // Check if user has bypass_credits enabled (already fetched with userProfile)
    const bypassCredits = userProfile?.bypass_credits || process.env.BYPASS_CREDIT_CHECKS === 'true';

    // SKIP ContentFetcher for web sources - Claude already fetched everything!
    if (research?.sources && research.sources.length > 0) {
      // Only use ContentFetcher for uploaded documents (not web sources)
      const uploadedDocs = research.sources.filter(s =>
        s.source_type === 'document' || s.source_type === 'upload'
      );

      if (uploadedDocs.length > 0) {
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
            const { error: updateError } = await supabase
              .from('script_research')
              .update({ sources: research.sources })
              .eq('id', research.id);

            if (!updateError) {
              // Verify the update
              await fetcher.verifyDatabaseUpdate(supabase, research.id);
            }
          }
        } catch (error) {
          // Document processing failed, continuing
        }
      }
    }

    let verifiedSources = research?.sources?.filter(s => s.fact_check_status === 'verified') || [];
    let starredSources = research?.sources?.filter(s => s.is_starred) || [];

    // Perform additional research if no sources provided
    let enhancedResearch = research;
    if ((!verifiedSources.length && !starredSources.length) && (title || topic)) {
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

      // Enhanced word count analysis
      const totalWords = sources.reduce((sum, s) => {
        const content = s.source_content || '';
        return sum + content.split(/\s+/).filter(w => w.length > 0).length;
      }, 0);

      // Calculate research depth vs target
      const targetMinutes = Math.ceil(duration / 60);

      // Check for high-quality research that bypasses word count requirements
      const hasSynthesis = sources.some(s => s.source_type === 'synthesis');
      const verifiedSources = sources.filter(s => s.fact_check_status === 'verified');
      const starredSources = sources.filter(s => s.is_starred);

      const hasQualityResearch = hasSynthesis && (verifiedSources.length >= 2 || starredSources.length >= 2);

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

      // Filter out empty/snippet sources before using them
      const isWebSearchSnippet = (source) => {
        const content = source.source_content || '';
        return content.includes('Source found via web search. Page last updated:') && content.length < 100;
      };

      research.sources = research.sources.filter(s =>
        s.source_content &&
        s.source_content.length > 200 && // Must have at least 200 chars
        !isWebSearchSnippet(s)
      );

      if (!validation.isValid) {
        // Track validation failure
        posthog.capture({
          distinctId: user.id,
          event: 'script_generation_failed',
          properties: {
            generation_source: 'workflow',
            failure_reason: 'insufficient_research',
            error_message: validation.errors.join('; '),
            research_source_count: research.sources.length,
            substantive_source_count: validation.stats.substantiveSources,
            workflow_id: workflowId || null,
            generation_time_ms: Date.now() - generationStartTime,
          }
        });

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
    }

    // Use targetDuration from summary if available, otherwise calculate from content points
    const totalDuration = targetDuration || contentPoints?.points?.reduce((acc, p) => acc + p.duration, 0) || 600;
    const totalMinutes = Math.ceil(totalDuration / 60);

    // ENHANCED RESEARCH VALIDATION FOR 35+ MINUTE SCRIPTS
    if (totalMinutes >= 35 && research?.sources && research.sources.length > 0) {
      const { validateResearchForDuration, calculateResearchScore } =
        require('@/lib/script-generation/research-validator');

      const hasUserDocuments = research.sources.some(s =>
        s.source_type === 'document' || s.source_type === 'upload'
      );

      const researchValidation = validateResearchForDuration(
        { sources: research.sources },
        totalMinutes,
        hasUserDocuments
      );

      if (!researchValidation.isAdequate) {
        return NextResponse.json({
          error: 'Insufficient research for long-form content',
          details: `Your ${totalMinutes}-minute script requires more comprehensive research to maintain quality throughout.`,
          validation: researchValidation,
          recommendations: researchValidation.recommendations,
          required: researchValidation.requirements,
          current: researchValidation.current,
          adequacyPercent: Math.round(researchValidation.adequacyPercent)
        }, { status: 422 }); // 422 Unprocessable Entity
      }
    }

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
        // Get the actual model name - normalize old model names to new ones
        // All script generation uses BALANCED (Sonnet 4.6) or PREMIUM (Opus 4.6)
        const actualModel = (() => {
          // Map old model names to new ones - FAST tier disabled, use BALANCED
          const modelMapping = {
            'claude-3-5-haiku': MODEL_TIERS.BALANCED.actualModel,
            'claude-3-haiku': MODEL_TIERS.BALANCED.actualModel,
            'claude-3-5-sonnet': MODEL_TIERS.BALANCED.actualModel,
            'claude-3-sonnet': MODEL_TIERS.BALANCED.actualModel,
            'claude-3-opus': MODEL_TIERS.PREMIUM.actualModel,
            'claude-opus-4-1': MODEL_TIERS.PREMIUM.actualModel,
          };
          if (modelMapping[model]) return modelMapping[model];
          // Check if it's already a valid new model ID
          if (model && model.includes('-202')) return model;
          // Default to BALANCED model (Sonnet 4.6)
          return MODEL_TIERS.BALANCED.actualModel;
        })();

        if (needsChunking) {
          // Store all content points for chunk-specific distribution
          const allContentPoints = contentPoints?.points || [];
          const pointsPerChunk = Math.ceil(allContentPoints.length / chunkConfig.chunks);

          // GENERATE COMPREHENSIVE OUTLINE for 30+ minute scripts
          let comprehensiveOutline = null;
          if (totalMinutes >= 30) {
            comprehensiveOutline = await generateComprehensiveOutline({
              title,
              topic,
              contentPoints: allContentPoints,
              totalMinutes,
              chunkCount: chunkConfig.chunks,
              research: enhancedResearch || research,
              hook,
              targetAudience,
              tone,
              apiKey: process.env.ANTHROPIC_API_KEY,
              model: actualModel
            });

            if (comprehensiveOutline) {
              // PRE-GENERATION VALIDATION: Ensure outline matches expectations
              const expectedTopics = allContentPoints.map(p => p.title || p.name || '').filter(t => t);
              validateOutlineBeforeGeneration(
                comprehensiveOutline,
                title,
                expectedTopics
              );
            }
          }

          // GENERATE CONTENT PLAN as fallback for <30 min or if outline fails
          let contentPlan = null;
          if (!comprehensiveOutline && allContentPoints.length > 0) {
            contentPlan = await generateContentPlan({
              title,
              topic,
              contentPoints: allContentPoints,
              totalMinutes,
              chunkCount: chunkConfig.chunks,
              apiKey: process.env.ANTHROPIC_API_KEY,
              model: actualModel
            });
          }

          // Generate chunks with full context
          const chunkPrompts = LongFormScriptHandler.generateChunkPrompts({
            totalMinutes,
            title,
            topic,
            contentPoints: allContentPoints,
            type,
            hook,
            voiceProfile,
            targetAudience,
            tone,
            research: enhancedResearch || research,
            frame,
            sponsor, // ✅ ADD SPONSOR DATA
            contentPlan, // Pass the plan to inform chunk generation
            comprehensiveOutline // Pass the outline for 30+ minute scripts
          });

          const scriptChunks = [];

          for (let i = 0; i < chunkPrompts.length; i++) {
            let chunkScript = '';
            let retryCount = 0;
            const maxRetries = SCRIPT_CONFIG.maxRetries;

            // Calculate per-chunk minimum with 10% buffer
            const minWordsPerChunk = Math.ceil((totalMinutes / chunkConfig.chunks) * SCRIPT_CONFIG.wordsPerMinute * 1.10);

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
                temperature: comprehensiveOutline ? 0.8 : 0.7, // Higher temp with outline for more detailed content
                system: `You are an expert YouTube scriptwriter who MUST write LONG, DETAILED scripts.

${comprehensiveOutline ? `
⚡⚡⚡ CRITICAL: YOU HAVE A MANDATORY OUTLINE TO FOLLOW ⚡⚡⚡
The outline specifies EXACT section titles and word counts.
You MUST follow the outline EXACTLY and meet ALL word count requirements.
Each section has a specific word count - MEET OR EXCEED IT!
` : ''}

🎯 ABSOLUTE WORD COUNT REQUIREMENT:
Your section MUST be EXACTLY ${minWordsPerChunk} words or MORE.
This is NON-NEGOTIABLE. Shorter responses will be REJECTED and you'll have to start over.

📊 PROGRESSIVE WORD COUNT CHECKPOINTS:
Track your progress as you write:
- ${Math.floor(minWordsPerChunk * 0.25)} words = 25% complete (keep going!)
- ${Math.floor(minWordsPerChunk * 0.50)} words = 50% complete (halfway there!)
- ${Math.floor(minWordsPerChunk * 0.75)} words = 75% complete (almost done!)
- ${minWordsPerChunk} words = 100% MINIMUM TARGET (you can write more!)

🚨 CRITICAL CONTENT REQUIREMENTS:
1. **FOLLOW THE OUTLINE EXACTLY** - Each section has a specific word count target
2. **EXPAND WITH THESE ELEMENTS FOR EACH SECTION**:
   - Hook/Introduction (50-75 words)
   - Background context and history (150-200 words)
   - Main explanation with details (200-300 words)
   - Specific examples and case studies (150-200 words)
   - Statistics and data points (100-150 words)
   - Impact and implications (100-150 words)
   - Expert quotes or analysis (50-100 words)
   - Transition to next section (25-50 words)

3. **NEVER WRITE LESS THAN THE SECTION MINIMUM**
4. **USE STORYTELLING** - Don't just state facts, tell the story
5. **PROVIDE SPECIFIC DETAILS** - Names, dates, numbers, locations
6. **EXPAND WITH CONTEXT** - Historical background, technical details, related events
7. **NO PLACEHOLDERS** - Write complete, detailed content
8. **COUNT WORDS PER SECTION** - Ensure each section meets its target

💡 WHAT ${minWordsPerChunk} WORDS LOOKS LIKE:
- That's about ${Math.floor(minWordsPerChunk / 150)} minutes of spoken content
- That's roughly ${Math.floor(minWordsPerChunk / 100)} substantial paragraphs
- Each major point needs 250+ words of development

${i === chunkConfig.chunks - 1 ? `
🎬 FINAL SECTION REQUIREMENTS:
This is the LAST section - MUST include ALL of these AT THE END:

## Description
[Full video description with overview]

TIMESTAMPS:
[List ALL timestamps for the ENTIRE video from 0:00 to end]

[Any relevant links or resources]

## Tags
[MANDATORY: Write at least 20 actual, topic-specific tags separated by commas]
Example: topic keyword1, topic keyword2, specific term1, specific term2, industry term1, industry term2, related concept1, related concept2, niche keyword1, niche keyword2, trending term1, trending term2, search term1, search term2, target audience term1, target audience term2, content type1, content type2, year reference, location reference

⚠️ CRITICAL: The ## Tags section is MANDATORY. Script will be REJECTED without it!
` : `
🔗 CONTINUATION REQUIREMENTS:
- Build naturally from previous section
- Reference what was already covered
- Maintain narrative flow
`}

⚠️ YOU WILL BE PENALIZED if you write less than ${minWordsPerChunk} words.
✅ YOU WILL BE REWARDED for comprehensive, detailed content that exceeds ${minWordsPerChunk} words.`,
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
                  let wordCount = chunkScript.split(/\s+/).length;

                  // Multi-tier retry strategy for short chunks
                  if (wordCount < minWordsPerChunk && retryCount <= maxRetries) {
                    // Calculate chunk-specific content points (not all points!)
                    const chunkSpecificPoints = allContentPoints.slice(
                      i * pointsPerChunk,
                      Math.min((i + 1) * pointsPerChunk, allContentPoints.length)
                    );

                    // Attempt 1 (retryCount = 0): Intelligent expansion with 120% target
                    if (retryCount === 0) {
                      try {
                        // Create chunk info for expansion
                        const chunkInfo = {
                          chunkNumber: i + 1,
                          totalChunks: chunkConfig.chunks,
                          startTime: i * 15,
                          endTime: Math.min((i + 1) * 15, totalMinutes),
                          isFirst: i === 0,
                          isLast: i === chunkConfig.chunks - 1,
                          previouslyCoveredSections: i > 0 ? allContentPoints.slice(0, i * pointsPerChunk).map(p => p.title || p.name || 'Section') : []
                        };

                        const expandedChunk = await expandShortScript(
                          chunkScript,
                          chunkSpecificPoints,
                          Math.ceil(minWordsPerChunk * 1.2), // 120% target for better results
                          enhancedResearch || research,
                          process.env.ANTHROPIC_API_KEY,
                          actualModel,
                          chunkInfo
                        );

                        if (expandedChunk && expandedChunk !== chunkScript) {
                          chunkScript = expandedChunk;
                          wordCount = chunkScript.split(/\s+/).length;

                          // If still short, try second expansion
                          if (wordCount < minWordsPerChunk) {
                            const secondExpansion = await expandShortScript(
                              chunkScript,
                              chunkSpecificPoints,
                              Math.ceil(minWordsPerChunk * 1.5), // 150% target
                              enhancedResearch || research,
                              process.env.ANTHROPIC_API_KEY,
                              actualModel,
                              chunkInfo  // Use the same chunk info
                            );

                            if (secondExpansion && secondExpansion !== chunkScript) {
                              chunkScript = secondExpansion;
                              wordCount = chunkScript.split(/\s+/).length;
                            }
                          }
                        }
                      } catch (expansionError) {
                        // Expansion failed, continue with original
                      }
                    }

                    // If still short after expansion attempts, check if we're close enough
                    if (wordCount < minWordsPerChunk && retryCount < maxRetries) {
                      // If we're at 85% or more after expansion, accept it rather than retrying
                      const percentComplete = (wordCount / minWordsPerChunk) * 100;
                      if (percentComplete < 85) {
                        retryCount++;
                        continue; // Retry the chunk from scratch
                      }
                    }
                  }

                  // CRITICAL: Enforce minimum acceptance threshold
                  // Use 70% threshold if we've done expansion, 75% otherwise
                  const hadExpansion = retryCount === 0 && wordCount > minWordsPerChunk * 0.6;
                  const threshold = hadExpansion ? 0.70 : 0.75;
                  const minimumAcceptableWords = Math.floor(minWordsPerChunk * threshold);

                  if (wordCount < minimumAcceptableWords) {
                    return NextResponse.json(
                      {
                        error: 'Script chunk too short',
                        details: `Section ${i + 1} generated only ${wordCount} words (${Math.round((wordCount / minWordsPerChunk) * 100)}% of target). Minimum acceptable is ${minimumAcceptableWords} words (${Math.round(threshold * 100)}% of ${minWordsPerChunk} target). Please try again.`,
                        retry: true
                      },
                      { status: 500 }
                    );
                  }

                  // CONTENT VALIDATION: Check if chunk respects boundaries
                  const forbiddenTopics = [];

                  // Check for content that belongs to OTHER chunks
                  if (i < chunkPrompts.length - 1) {
                    // Check if this chunk contains topics meant for future chunks
                    for (let j = (i + 1) * pointsPerChunk; j < allContentPoints.length; j++) {
                      const futurePoint = allContentPoints[j];
                      const futureTopic = futurePoint.title || futurePoint.name || '';
                      if (futureTopic) {
                        // Check if this forbidden topic appears in current chunk
                        const topicRegex = new RegExp(`###\\s*${futureTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
                        if (topicRegex.test(chunkScript)) {
                          forbiddenTopics.push({
                            topic: futureTopic,
                            belongsTo: `chunk ${Math.floor(j / pointsPerChunk) + 1}`
                          });
                        }
                      }
                    }
                  }

                  // Check for content that was already covered in previous chunks
                  if (i > 0) {
                    const previouslyCoveredPoints = allContentPoints.slice(0, i * pointsPerChunk);
                    for (const prevPoint of previouslyCoveredPoints) {
                      const prevTopic = prevPoint.title || prevPoint.name || '';
                      if (prevTopic) {
                        // Count occurrences - one mention might be OK for continuity, but a full section is not
                        const sectionRegex = new RegExp(`###\\s*${prevTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
                        const matches = chunkScript.match(sectionRegex);
                        if (matches && matches.length > 0) {
                          forbiddenTopics.push({
                            topic: prevTopic,
                            belongsTo: `previous chunks`,
                            severity: 'high'
                          });
                        }
                      }
                    }
                  }

                  // Boundary violations are tracked but don't reject

                  // OUTLINE VALIDATION: If we have a comprehensive outline, validate against it
                  if (comprehensiveOutline) {
                    const outlineValidation = validateChunkAgainstOutline(
                      chunkScript,
                      comprehensiveOutline.chunks[i],
                      i + 1
                    );

                    if (!outlineValidation.passed) {
                      // Critical failures require retry
                      if (outlineValidation.severity === 'critical' && retryCount < maxRetries) {
                        retryCount++;
                        continue; // Retry the chunk
                      }
                    }
                  }

                  // Chunk meets minimum threshold, add it
                  scriptChunks.push(chunkScript);
                  break; // Exit retry loop
                } else {
                  if (retryCount < maxRetries) {
                    retryCount++;
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
                if (retryCount < maxRetries) {
                  retryCount++;
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

          // FINAL OUTLINE VALIDATION: Check complete script against outline
          if (comprehensiveOutline) {
            const finalValidation = validateCompleteScript(script, comprehensiveOutline);

            if (!finalValidation.passed) {
              // Return error if critical topics are missing
              const missingCount = finalValidation.overallIssues.filter(i => i.type === 'missing_topic').length;
              if (missingCount > 0) {
                return NextResponse.json({
                  error: 'Script validation failed',
                  details: `The final script is missing ${missingCount} required topics from the outline. This indicates a critical generation failure.`,
                  issues: finalValidation.overallIssues.map(i => i.message),
                  retry: true
                }, { status: 500 });
              }
            }
          }

          // Validate completeness - strict 80% minimum required
          const validation = LongFormScriptHandler.validateCompleteness(script, totalMinutes, SCRIPT_CONFIG.wordsPerMinute);
          if (!validation.isValid) {
            // STRICT: Always require 80% minimum word count, even with quality research
            // EXCEPTION: If deduplication removed content and we're close (>75%), allow it
            const deduplicationGrace = script.includes('removed duplicate') ||
                                      scriptChunks.join('').length > script.length * 1.1;
            const minThreshold = deduplicationGrace ? 75 : 80;

            if (validation.percentComplete < minThreshold) {
              return NextResponse.json({
                error: 'Script generation incomplete',
                details: `Script is too short (${validation.wordCount} words, expected at least ${Math.floor(validation.expectedWords * (minThreshold / 100))} - ${minThreshold}% minimum). ${deduplicationGrace ? 'Note: Threshold lowered to 75% due to duplicate content removal.' : ''} Please try again.`,
                retry: true
              }, { status: 500 });
            }

            // Tags section is now REQUIRED - no bypass
            if (!validation.hasTags) {
              return NextResponse.json({
                error: 'Script generation incomplete',
                details: 'Script is missing required Tags section. Please try again.',
                retry: true
              }, { status: 500 });
            }

            // Quality research can only bypass minor issues (missing description/timestamps)
            if (!hasQualityResearch && (validation.hasPlaceholders || !validation.hasDescription || !validation.hasTimestamps)) {
              // Without quality research, all validation must pass
              return NextResponse.json({
                error: 'Script generation incomplete',
                details: `Validation failed: ${validation.issues.join(', ')}. Please try again.`,
                retry: true
              }, { status: 500 });
            }
          }

        } else {
          // Single generation for shorter scripts
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: actualModel,
            max_tokens: 8192,
            temperature: 0.7,
            system: `You are an expert YouTube scriptwriter who MUST complete ALL required sections.

⚠️ CRITICAL OUTPUT REQUIREMENTS - SCRIPT WILL BE REJECTED IF MISSING:
1. Main Script: Approximately ${Math.ceil(totalDuration / 60) * SCRIPT_CONFIG.wordsPerMinute} words (TARGET, not exceed by more than 20%)
2. ## Description section with TIMESTAMPS
3. ## Tags section (MANDATORY - 20+ relevant tags)

WORD COUNT GUIDANCE:
- Target: ${Math.ceil(totalDuration / 60) * SCRIPT_CONFIG.wordsPerMinute} words for script content
- Maximum: ${Math.ceil(totalDuration / 60) * SCRIPT_CONFIG.wordsPerMinute * 1.2} words (do NOT exceed)
- Prioritize completing ALL sections over excessive detail

CRITICAL COMPLETION RULES:
1. If approaching length limits, wrap up the script to ensure Tags section
2. The ## Tags section is MANDATORY and MUST be the LAST section
3. NEVER end without Tags - reduce script detail if necessary
4. Write efficiently - quality over excessive quantity

MANDATORY SECTIONS ORDER:
1. Main Script Content (stay within word target)
2. ## Description (brief but complete with timestamps)
3. ## Tags (MUST BE LAST - 20+ comma-separated keywords)

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

Example Tags Format (REQUIRED - MUST BE INCLUDED):
## Tags
impostor syndrome, fake success, psychology of deception, success psychology, self doubt, confidence issues, achievement psychology, career psychology, workplace psychology, mental health awareness, psychological research, professional development, career advice, success mindset, overcoming doubt, authenticity at work, professional growth, workplace wellness, career confidence, psychological insights

YOU WILL BE REJECTED for:
- Missing ## Tags section (MOST CRITICAL)
- Missing ## Description section
- Scripts significantly over/under target (aim for ${Math.ceil(totalDuration / 60) * SCRIPT_CONFIG.wordsPerMinute} words ±20%)
- Any continuation messages or placeholders
- Not completing ALL sections due to excessive script length`,
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
                    sponsor: sponsor, // Add sponsor data
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

${sponsor ? `
SPONSOR INTEGRATION:
Sponsor: ${sponsor.sponsor_name}
Product: ${sponsor.sponsor_product}
Call-to-Action: ${sponsor.sponsor_cta}
${sponsor.sponsor_key_points?.length > 0 ? `Key Points to Mention:
${sponsor.sponsor_key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}
Duration: Approximately ${sponsor.sponsor_duration || 30} seconds
Placement: ${sponsor.placement_preference === 'auto' ? 'Optimal point (typically 25-35% into video)' :
            sponsor.placement_preference === 'early' ? 'Early in video (after hook)' :
            sponsor.placement_preference === 'mid' ? 'Middle of video' :
            sponsor.placement_preference === 'late' ? 'Near end (before conclusion)' :
            `Custom timing at ${sponsor.custom_placement_time} seconds`}
Transition Style: ${sponsor.transition_style === 'natural' ? 'Smooth, natural segue' :
                   sponsor.transition_style === 'direct' ? 'Quick, straightforward' :
                   'Thematic bridge'}
${sponsor.include_disclosure !== false ? `Disclosure Required: Include FTC-compliant disclosure (e.g., "This video is sponsored by ${sponsor.sponsor_name}")` : ''}

IMPORTANT: Integrate this sponsor segment naturally into the script. Make it feel authentic and maintain viewer engagement. Use [SPONSOR SEGMENT START] and [SPONSOR SEGMENT END] markers.
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
            
          } else {
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
        apiLogger.error('Claude API error', claudeError, { model });
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
    // Basic validation
    if (!script || script.length < 100) {
      return NextResponse.json(
        {
          error: 'Script generation failed',
          details: 'Generated script is too short or empty. Please try again.',
          retry: true
        },
        { status: 500 }
      );
    }

    // Check for required sections - be more flexible with description
    const hasDescription = script.includes('## Description') ||
                          (script.includes('Description') && script.includes('video'));

    // Check tags section specifically - extract it and validate (not the whole script!)
    // More flexible regex to catch variations in formatting
    const tagsMatch = script.match(/##\s*Tags\s*\n+([^\n#]+(?:\n[^\n#]+)*)/i);
    const tagContent = tagsMatch ? tagsMatch[1].trim() : '';
    const tagsList = tagContent ? tagContent.split(',').map(t => t.trim()).filter(t => t && t.length > 1) : [];

    const hasTags = tagsMatch &&
                    tagContent.length > 20 && // Must have actual content
                    !tagContent.includes('[') &&      // No brackets in tags
                    !tagContent.includes('...') &&    // No ellipsis placeholders
                    tagsList.length >= 10; // At least 10 real tags (lowered threshold for flexibility)

    const wordCount = script.split(/\s+/).length;
    const expectedWords = Math.ceil(totalDuration / 60) * SCRIPT_CONFIG.wordsPerMinute;
    const percentComplete = Math.round((wordCount / expectedWords) * 100);

    // Check for placeholder patterns - be more specific to avoid false positives
    const placeholderPatterns = [
      /\[Add specific examples here\]/i,
      /\[Continue writing here\]/i,
      /\[Rest of script here\]/i,
      /\[Add more content here\]/i,
      /\[Insert .* here\]/i,
      /\[TODO.*\]/i,
      /\.\.\. \[continue\]/i
    ];

    const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(script));

    if (hasPlaceholders) {
      return NextResponse.json(
        {
          error: 'Script generation incomplete',
          details: 'Generated script contains placeholder text. Please try again.',
          retry: true
        },
        { status: 500 }
      );
    }

    // Enhanced quality checks for human elements and visual cues
    const humanElementPatterns = [
      /"[^"]{20,}".*?(?:said|explains|notes|stated|according to)/i,  // Quotes with attribution
      /(?:Dr\.|Professor|Expert|Researcher|Analyst)\s+[A-Z][a-z]+/,   // Expert references
      /(?:for|meant|affected|impacted)\s+(?:the\s+)?(?:\d+|thousands|millions|hundreds)/i, // Human impact
      /imagine if|picture this|consider what it's like/i              // Relatable comparisons
    ];
    const hasHumanElements = humanElementPatterns.filter(pattern => pattern.test(script)).length >= 2;

    // Check for visual cues
    const visualCueMatches = script.match(/\[Visual:/gi) || [];
    const hasEnoughVisuals = visualCueMatches.length >= Math.floor(totalDuration / 90); // At least 1 per 90 seconds

    // Check for repetitive transitions
    const transitionOveruse = {
      'Now,': (script.match(/^Now,/gm) || []).length,
      'This brings us': (script.match(/This brings us/gi) || []).length,
      'Let\'s': (script.match(/Let's (?:examine|look|explore)/gi) || []).length,
      'Moving on': (script.match(/Moving on/gi) || []).length
    };
    const hasRepetitiveTransitions = Object.entries(transitionOveruse).some(([phrase, count]) => count > 2);

    // Stricter thresholds - minimum 80% even with quality research
    const minWordThreshold = 0.80; // Always require 80% minimum

    // Quality bypass now requires BOTH quality research AND adequate length
    const qualityBypassActive = hasQualityResearch && percentComplete >= 80;

    if (wordCount < expectedWords * minWordThreshold) {
      return NextResponse.json(
        {
          error: 'Script generation incomplete',
          details: `Script is too short (${wordCount} words, expected at least ${Math.floor(expectedWords * minWordThreshold)} - 80% minimum). Please try again.`,
          retry: true
        },
        { status: 500 }
      );
    }

    // Tags section is now REQUIRED - no bypass
    if (!hasTags) {
      return NextResponse.json(
        {
          error: 'Script generation incomplete',
          details: 'Script is missing required Tags section. Please try again.',
          retry: true
        },
        { status: 500 }
      );
    }

    // Description is required but can be bypassed with quality research
    if (!hasDescription && !hasQualityResearch) {
      return NextResponse.json(
        {
          error: 'Script generation incomplete',
          details: 'Script is missing Description section. Please try again.',
          retry: true
        },
        { status: 500 }
      );
    }

    // Handle credit deduction AFTER validation
    let deductResult = { success: true, cost: 0 };

    if (!bypassCredits) {
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

      if (!deductResult.success) {
        return NextResponse.json(
          {
            error: deductResult.error || 'Insufficient credits',
            required: creditsUsed,
            balance: deductResult.balance 
          },
          { status: 402 }
        );
      }
    }

    // Get user's channel if it exists (now optional for scripts)
    let channelId = null;

    // Try to get user's existing channel, but it's no longer required
    const { data: userChannel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (userChannel?.id) {
      channelId = userChannel.id;
    }

    // Save the script to the database (channel is now optional)
    if (script) {
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
          apiLogger.error('Error saving script to database', scriptError, { userId: user.id, title: scriptTitle });
          // Don't fail the request if save fails
        } else if (newScript?.id) {
          // Save research sources to script_research table
          const researchToSave = enhancedResearch || research;

          if (newScript.id && researchToSave?.sources && researchToSave.sources.length > 0) {
            try {
              const sourcesToSave = researchToSave.sources;

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

              const { data: insertedData, error: researchError } = await supabase
                .from('script_research')
                .insert(scriptResearchData)
                .select();
              
              if (researchError) {
                apiLogger.error('Error saving script research', researchError, { scriptId: newScript.id });

                // Try alternative approach - save with minimal data
                const minimalData = {
                  id: scriptResearchId,
                  script_id: newScript.id,
                  sources: JSON.stringify(sourcesToSave),
                  fact_checks: null
                };

                await supabase
                  .from('script_research')
                  .insert(minimalData)
                  .select();
              }

              // Also save individual sources if they came from enhancedResearch (auto-generated)
              if (enhancedResearch?.autoGenerated && enhancedResearch?.summary) {
                // Save research summary as metadata
                await supabase
                  .from('scripts')
                  .update({
                    metadata: {
                      ...newScript.metadata,
                      research_summary: enhancedResearch.summary,
                      research_insights: enhancedResearch.insights
                    }
                  })
                  .eq('id', newScript.id);
              }
            } catch (researchSaveError) {
              apiLogger.error('Exception while saving research sources', researchSaveError, { scriptId: newScript.id });
              // Don't fail the main request
            }
          }
        }

        // Also save script to workflow_data if workflowId was provided
        if (workflowId && newScript?.id) {
          try {
            // Get current workflow data
            const { data: currentWorkflow } = await supabase
              .from('script_workflows')
              .select('workflow_data')
              .eq('id', workflowId)
              .single();

            // Update workflow with generated script
            const updatedWorkflowData = {
              ...(currentWorkflow?.workflow_data || {}),
              generatedScript: script,
              scriptId: newScript.id,
              script_metadata: {
                generated_at: new Date().toISOString(),
                model: model,
                length: script.length,
                words: script.split(/\s+/).length,
                targetDuration: totalDuration,
                creditsUsed: creditsUsed
              }
            };

            const { error: workflowUpdateError } = await supabase
              .from('script_workflows')
              .update({
                workflow_data: updatedWorkflowData,
                current_step: 'edit' // Move to edit step
              })
              .eq('id', workflowId);

            if (workflowUpdateError) {
              apiLogger.error('Error updating workflow_data', workflowUpdateError, { workflowId });
            }
          } catch (workflowError) {
            apiLogger.error('Exception updating workflow', workflowError, { workflowId });
            // Don't fail the request
          }
        }

        // Track script generation completed in PostHog
        try {
          posthog.capture({
            distinctId: user.id,
            event: 'script_generation_completed',
            properties: {
              generation_source: 'workflow',
              script_id: newScript?.id || null,
              script_type: type,
              duration_minutes: durationMinutes,
              model,
              credits_used: creditsUsed,
              generation_time_ms: Date.now() - generationStartTime,
              word_count: script.split(/\s+/).length,
              was_chunked: needsChunking,
              has_voice_profile: !!voiceProfile,
              has_sponsor: !!sponsor,
              workflow_id: workflowId || null,
              subscription_tier: userTier,
            }
          });
        } catch (e) {
          // Don't block generation for analytics
        }

        return NextResponse.json({
          script: script,
          creditsUsed: creditsUsed,
          scriptId: newScript?.id || null
        });
      } catch (saveError) {
        apiLogger.error('Error saving script', saveError, { userId: user.id });
        // Still return the script even if save fails
        return NextResponse.json({
          script: script,
          creditsUsed: creditsUsed,
          scriptId: null,
          warning: 'Script generated successfully but save to database failed'
        });
      }
    } else {
      // No script generated
      return NextResponse.json({ 
        script: script || '',
        creditsUsed,
        error: 'Script generation failed'
      });
    }
  } catch (error) {
    apiLogger.error('Script generation error', error);

    // Track script generation failed
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user?.id || 'unknown',
        event: 'script_generation_failed',
        properties: {
          generation_source: 'workflow',
          error_message: error.message || 'Unknown error',
          generation_time_ms: typeof generationStartTime !== 'undefined' ? Date.now() - generationStartTime : null,
          workflow_id: typeof workflowId !== 'undefined' ? workflowId : null,
        }
      });
    } catch (e) {
      // Don't block error response for analytics
    }

    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}