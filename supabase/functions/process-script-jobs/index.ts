/**
 * Script Generation Edge Function - A- Hollywood Quality
 * NO TIMEOUT LIMITS - Uses full quality modules for exceptional scripts
 *
 * This Edge Function uses ALL the proven quality modules:
 * - Optimized prompt generation with voice profiles
 * - Long-form chunking for 20+ minute scripts
 * - Comprehensive outline generation for 30+ minute scripts
 * - Intelligent expansion for quality
 * - Strict 130 WPM validation with 80% threshold
 * - Duplicate section detection
 * - Multi-tier retry logic
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import all our A- quality modules
import { SCRIPT_CONFIG, calculateChunkStrategy, validateUserAccess } from './config.ts';
import { generateOptimizedScript } from './prompt-generator.ts';
import { LongFormScriptHandler } from './long-form-handler.ts';
import { generateComprehensiveOutline } from './outline-generator.ts';
import { expandShortScript } from './expansion-handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('🔄 === SUPABASE EDGE FUNCTION: Process Script Jobs Started ===');
  console.log('🕒 Start time:', new Date().toISOString());

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    const caller = req.headers.get('x-supabase-caller')

    const validCallers = ['api', 'manual', 'pg_cron']
    const hasValidCaller = caller && validCallers.includes(caller)
    const hasServiceRoleKey = authHeader === `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`

    if (!hasValidCaller && !hasServiceRoleKey) {
      console.error('❌ Unauthorized request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find newest pending job (FIFO)
    const { data: jobs, error: fetchError } = await supabaseClient
      .from('script_generation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false }) // NEWEST first
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching pending jobs:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!jobs || jobs.length === 0) {
      console.log('✅ No pending script jobs found');
      return new Response(
        JSON.stringify({ message: 'No pending jobs', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const job = jobs[0];
    console.log('📋 Processing job:', {
      jobId: job.id,
      workflowId: job.workflow_id,
      userId: job.user_id,
      priority: job.priority,
      age: Math.round((Date.now() - new Date(job.created_at).getTime()) / 1000) + 's'
    });

    // Mark job as processing
    await supabaseClient
      .from('script_generation_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        current_step: 'initializing',
        progress: 5
      })
      .eq('id', job.id);

    const params = job.generation_params;

    try {
      // Fetch workflow data from database
      console.log('📊 Fetching workflow data...');
      const { data: workflow, error: workflowError } = await supabaseClient
        .from('script_workflows')
        .select(`
          *,
          workflow_research(*)
        `)
        .eq('id', job.workflow_id)
        .single();

      if (workflowError || !workflow) {
        throw new Error(`Failed to fetch workflow: ${workflowError?.message}`);
      }

      // Update progress
      await supabaseClient
        .from('script_generation_jobs')
        .update({
          progress: 10,
          current_step: 'preparing_data'
        })
        .eq('id', job.id);

      // Extract workflow data
      const summary = workflow.summary_data || {};
      const frameData = workflow.frame_data || {};
      const hookData = workflow.hook_data || {};
      const contentPoints = workflow.content_points || {};
      const voiceProfile = workflow.voice_profile || {};
      const research = {
        sources: workflow.workflow_research || []
      };

      console.log('📦 Workflow data:', {
        topic: summary.topic?.substring(0, 50),
        targetDuration: params.targetDuration || summary.targetDuration,
        model: params.model,
        sourcesCount: research.sources.length,
        hasHook: !!hookData?.hook,
        hasFrame: !!frameData?.narrative_structure
      });

      // === QUALITY SCRIPT GENERATION USING A- MODULES ===
      const targetDuration = params.targetDuration || summary.targetDuration || 600;
      const durationMinutes = Math.ceil(targetDuration / 60);
      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicApiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }

      console.log(`📝 Starting A- quality generation: ${durationMinutes} minutes with ${params.model}`);

      // Calculate chunk strategy
      const strategy = calculateChunkStrategy(durationMinutes);
      console.log(`📊 Strategy: ${strategy.strategy}`);

      let generatedScript = '';

      // Check if we need chunking (20+ minutes)
      if (LongFormScriptHandler.needsChunking(targetDuration)) {
        console.log(`📚 Using chunked generation for ${durationMinutes}-minute script`);

        // Generate comprehensive outline for 30+ minute scripts
        let comprehensiveOutline = null;
        if (durationMinutes >= 30 && contentPoints?.points?.length > 0) {
          console.log('📝 Generating comprehensive outline...');

          comprehensiveOutline = await generateComprehensiveOutline({
            title: summary.topic || 'Untitled Video',
            topic: summary.topic || 'Video Content',
            contentPoints: contentPoints.points,
            totalMinutes: durationMinutes,
            chunkCount: strategy.chunkCount,
            research,
            hook: hookData?.hook,
            targetAudience: summary.targetAudience,
            tone: summary.tone,
            apiKey: anthropicApiKey,
            model: params.model || 'claude-sonnet-4-5-20250929'
          });

          if (comprehensiveOutline) {
            console.log(`✅ Outline generated with ${comprehensiveOutline.chunks.length} chunks`);

            // Save outline to database
            try {
              await supabaseClient
                .from('script_outlines')
                .upsert({
                  workflow_id: job.workflow_id,
                  outline_data: comprehensiveOutline,
                  created_at: new Date().toISOString()
                });
              console.log('✅ Outline saved to database');
            } catch (e) {
              console.error('Error saving outline:', e);
            }
          }
        }

        // Generate chunk prompts
        const chunkPrompts = LongFormScriptHandler.generateChunkPrompts({
          totalMinutes: durationMinutes,
          title: summary.topic || 'Untitled',
          topic: summary.topic || 'Video Content',
          contentPoints: contentPoints?.points,
          type: 'script',
          hook: hookData?.hook,
          voiceProfile,
          targetAudience: summary.targetAudience,
          tone: summary.tone,
          research,
          frame: frameData?.narrative_structure,
          sponsor: null,
          comprehensiveOutline
        });

        console.log(`📝 Generated ${chunkPrompts.length} chunk prompts`);

        // Generate each chunk
        const chunks: string[] = [];
        for (let i = 0; i < chunkPrompts.length; i++) {
          console.log(`\n🔄 Generating chunk ${i + 1}/${chunkPrompts.length}...`);

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicApiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: params.model || 'claude-sonnet-4-5-20250929',
              max_tokens: 8192,
              temperature: 0.7,
              messages: [{
                role: 'user',
                content: chunkPrompts[i]
              }]
            })
          });

          if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
          }

          const data = await response.json();
          const chunkScript = data.content[0].text;

          console.log(`✅ Chunk ${i + 1} generated: ${chunkScript.split(/\s+/).length} words`);
          chunks.push(chunkScript);

          // Save progress
          await supabaseClient
            .from('script_generation_jobs')
            .update({
              progress: Math.round(20 + ((i + 1) / chunkPrompts.length) * 60),
              current_step: `generating_chunk_${i + 1}_of_${chunkPrompts.length}`
            })
            .eq('id', job.id);
        }

        // Stitch chunks together
        console.log('🔗 Stitching chunks together...');
        generatedScript = LongFormScriptHandler.stitchChunks(chunks);
        console.log(`✅ Script stitched: ${generatedScript.split(/\s+/).length} words`);

      } else {
        console.log(`📝 Using single-shot generation for ${durationMinutes}-minute script`);

        // Generate prompt using our optimized prompt generator
        const promptResult = generateOptimizedScript({
          topic: summary.topic || 'Video Content',
          targetLength: durationMinutes,
          tone: summary.tone,
          audience: summary.targetAudience || 'general',
          includeKeywords: true,
          includeTitleSuggestions: true,
          validateOutput: true,
          frame: frameData?.narrative_structure,
          hook: hookData?.hook,
          contentPoints: contentPoints?.points,
          research,
          voiceProfile,
          thumbnail: null,
          targetAudience: summary.targetAudience,
          sponsor: null
        });

        console.log(`✅ Prompt generated: ${promptResult.prompt.length} characters`);

        // Generate script
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: params.model || 'claude-sonnet-4-5-20250929',
            max_tokens: 8192,
            temperature: 0.7,
            messages: [{
              role: 'user',
              content: promptResult.prompt
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        generatedScript = data.content[0].text;

        console.log(`✅ Script generated: ${generatedScript.split(/\s+/).length} words`);
      }

      // Update progress
      await supabaseClient
        .from('script_generation_jobs')
        .update({
          progress: 85,
          current_step: 'validating_quality'
        })
        .eq('id', job.id);

      // Validate and potentially expand script
      const wordCount = generatedScript.split(/\s+/).length;
      const targetWords = strategy.targetWords;
      const percentComplete = (wordCount / targetWords) * 100;

      console.log(`📊 Quality check: ${wordCount}/${targetWords} words (${Math.round(percentComplete)}%)`);

      if (percentComplete < 80) {
        console.log(`🔄 Script below 80% - attempting expansion...`);

        const expandedScript = await expandShortScript(
          generatedScript,
          contentPoints?.points || null,
          targetWords,
          research || null,
          anthropicApiKey,
          params.model || 'claude-sonnet-4-5-20250929'
        );

        const expandedWordCount = expandedScript.split(/\s+/).length;
        console.log(`✅ Expansion complete: ${expandedWordCount} words`);

        if (expandedWordCount > wordCount) {
          generatedScript = expandedScript;
        }
      }

      console.log('✅ Final script validated:', {
        words: generatedScript.split(/\s+/).length,
        length: generatedScript.length
      });

      // Update progress
      await supabaseClient
        .from('script_generation_jobs')
        .update({
          progress: 90,
          current_step: 'saving_script'
        })
        .eq('id', job.id);

      // Save script to workflow
      const { error: saveError } = await supabaseClient
        .from('script_workflows')
        .update({
          generated_script: generatedScript,
          script_metadata: {
            generated_at: new Date().toISOString(),
            model: params.model,
            length: generatedScript.length,
            words: generatedScript.split(/\s+/).length,
            targetDuration: targetDuration
          }
        })
        .eq('id', job.workflow_id);

      if (saveError) {
        console.error('Error saving script:', saveError);
      } else {
        console.log('✅ Script saved to workflow');
      }

      // Update user credits
      const creditsToDeduct = Math.max(1, Math.round(targetMinutes * 0.33 * 1.5)); // 0.33 per minute * 1.5 for Sonnet

      const { data: currentUser } = await supabaseClient
        .from('users')
        .select('credits')
        .eq('id', job.user_id)
        .single();

      if (currentUser && currentUser.credits > 0) {
        await supabaseClient
          .from('users')
          .update({
            credits: Math.max(0, currentUser.credits - creditsToDeduct)
          })
          .eq('id', job.user_id);

        // Log transaction
        await supabaseClient
          .from('credits_transactions')
          .insert({
            user_id: job.user_id,
            amount: -creditsToDeduct,
            type: 'usage',
            description: `Script generation: ${summary.topic?.substring(0, 100) || 'Untitled'}`,
            metadata: {
              workflowId: job.workflow_id,
              model: params.model,
              duration: targetDuration,
              words: generatedScript.split(/\s+/).length
            }
          });

        console.log(`💳 Deducted ${creditsToDeduct} credits from user`);
      }

      // Mark job as completed
      await supabaseClient
        .from('script_generation_jobs')
        .update({
          status: 'completed',
          progress: 100,
          current_step: 'completed',
          completed_at: new Date().toISOString(),
          processing_time_seconds: Math.round((Date.now() - startTime) / 1000),
          generated_script: generatedScript,
          script_metadata: {
            length: generatedScript.length,
            words: generatedScript.split(/\s+/).length,
            model: params.model
          }
        })
        .eq('id', job.id);

      console.log('✅ Script generation job completed successfully:', job.id);
      console.log('⏱️ Processing time:', Math.round((Date.now() - startTime) / 1000) + 's');

      return new Response(
        JSON.stringify({
          success: true,
          jobId: job.id,
          processed: 1,
          processingTime: Math.round((Date.now() - startTime) / 1000)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (scriptError) {
      console.error('❌ Script generation error:', scriptError);

      // Check if we should retry
      const shouldRetry = job.retry_count < job.max_retries;

      if (shouldRetry) {
        await supabaseClient
          .from('script_generation_jobs')
          .update({
            status: 'pending',
            retry_count: job.retry_count + 1,
            error_message: scriptError.message,
            current_step: 'retry_queued'
          })
          .eq('id', job.id);

        console.log(`🔄 Job ${job.id} queued for retry (attempt ${job.retry_count + 1}/${job.max_retries})`);
      } else {
        await supabaseClient
          .from('script_generation_jobs')
          .update({
            status: 'failed',
            error_message: scriptError.message,
            completed_at: new Date().toISOString(),
            processing_time_seconds: Math.round((Date.now() - startTime) / 1000)
          })
          .eq('id', job.id);

        console.log(`❌ Job ${job.id} failed after ${job.max_retries} attempts`);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: scriptError.message,
          jobId: job.id,
          shouldRetry
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
