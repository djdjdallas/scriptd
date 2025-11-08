import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Supabase Edge Function: Process Script Generation Jobs
 *
 * NO TIMEOUT LIMITS! Generates scripts directly using Anthropic API.
 * Can run for as long as needed (10+ minutes for complex scripts).
 */

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

      // Build script generation prompt
      const targetDuration = params.targetDuration || summary.targetDuration || 600;
      const targetMinutes = Math.ceil(targetDuration / 60);
      const wordsPerMinute = 150;
      const targetWords = targetMinutes * wordsPerMinute;

      // Build research context
      let researchContext = '';
      if (research.sources && research.sources.length > 0) {
        researchContext = '\n\n<research_sources>\n';
        research.sources.forEach((source, idx) => {
          researchContext += `\nSource ${idx + 1}: ${source.source_title || 'Untitled'}\n`;
          researchContext += `URL: ${source.source_url || 'N/A'}\n`;
          if (source.source_content) {
            researchContext += `Content: ${source.source_content.substring(0, 2000)}\n`;
          }
        });
        researchContext += '</research_sources>\n';
      }

      // Build prompt
      const scriptPrompt = `You are a professional YouTube script writer. Generate an engaging, well-structured script.

<topic>${summary.topic || 'Untitled Video'}</topic>

<target_length>${targetMinutes} minutes (approximately ${targetWords} words)</target_length>

${hookData?.hook ? `<opening_hook>${hookData.hook}</opening_hook>` : ''}

${frameData?.narrative_structure ? `<narrative_structure>${frameData.narrative_structure}</narrative_structure>` : ''}

${contentPoints?.points ? `<content_points>${JSON.stringify(contentPoints.points, null, 2)}</content_points>` : ''}

${voiceProfile?.speaking_style ? `<voice_style>${voiceProfile.speaking_style}</voice_style>` : ''}

${researchContext}

Generate a complete YouTube script with:
1. Engaging intro that hooks viewers
2. Clear sections with smooth transitions
3. Factual accuracy based on research
4. Natural, conversational tone
5. Strong call-to-action at the end
6. Approximately ${targetWords} words total

Return ONLY the script text, no meta-commentary.`;

      // Update progress
      await supabaseClient
        .from('script_generation_jobs')
        .update({
          progress: 20,
          current_step: 'generating_script'
        })
        .eq('id', job.id);

      // Call Anthropic API
      console.log('🤖 Calling Anthropic API...');
      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicApiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: params.model || 'claude-sonnet-4-5-20250929',
          max_tokens: 16000,
          messages: [{
            role: 'user',
            content: scriptPrompt
          }]
        })
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorText}`);
      }

      const anthropicData = await anthropicResponse.json();
      const generatedScript = anthropicData.content[0].text;

      console.log('✅ Script generated:', {
        length: generatedScript.length,
        words: generatedScript.split(/\s+/).length
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
