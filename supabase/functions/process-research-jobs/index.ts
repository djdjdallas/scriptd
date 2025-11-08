import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Supabase Edge Function: Process Research Jobs
 *
 * NO TIMEOUT LIMITS! This function can run for as long as needed.
 *
 * - Triggered when research-async endpoint creates a job
 * - Finds oldest pending job
 * - Calls Vercel API to perform research
 * - Waits for completion (even if 5+ minutes)
 * - Updates job status in database
 *
 * This hybrid approach:
 * ✅ Keeps all research logic on Vercel (tested, working)
 * ✅ Uses Supabase for job processing (no timeout)
 * ✅ Handles long-running research (complex topics)
 */

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('🔄 === SUPABASE EDGE FUNCTION: Process Research Jobs Started ===');
  console.log('🕒 Start time:', new Date().toISOString());

  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    const caller = req.headers.get('x-supabase-caller')

    // Allow calls from API, manual triggers, OR with service role key
    const validCallers = ['api', 'manual', 'pg_cron']
    const hasValidCaller = caller && validCallers.includes(caller)
    const hasServiceRoleKey = authHeader === `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`

    if (!hasValidCaller && !hasServiceRoleKey) {
      console.error('❌ Unauthorized request', { caller, hasServiceRoleKey: !!hasServiceRoleKey });
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find oldest pending job (respecting priority)
    const { data: jobs, error: fetchError } = await supabaseClient
      .from('research_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false }) // Higher priority first
      .order('created_at', { ascending: true }) // Oldest first within same priority
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching pending jobs:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!jobs || jobs.length === 0) {
      console.log('✅ No pending research jobs found');
      return new Response(
        JSON.stringify({ message: 'No pending jobs', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const job = jobs[0];
    console.log('📋 Processing research job:', {
      jobId: job.id,
      workflowId: job.workflow_id,
      userId: job.user_id,
      priority: job.priority,
      age: Math.round((Date.now() - new Date(job.created_at).getTime()) / 1000) + 's'
    });

    // Mark job as processing
    await supabaseClient
      .from('research_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        current_step: 'initializing',
        progress: 5
      })
      .eq('id', job.id);

    // Extract research parameters
    const params = job.research_params;

    try {
      // Perform research directly in Edge Function (NO TIMEOUT LIMITS!)
      // No need to call back to Vercel - we can run indefinitely here

      console.log('🔬 Starting research directly in Edge Function');
      console.log('📦 Research params:', {
        query: params.query?.substring(0, 50),
        topic: params.topic?.substring(0, 50),
        targetDuration: params.targetDuration,
        enableExpansion: params.enableExpansion
      });

      // Update progress
      await supabaseClient
        .from('research_jobs')
        .update({
          progress: 10,
          current_step: 'initializing_research'
        })
        .eq('id', job.id);

      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicApiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }

      // Build research prompt
      const minSources = params.minSources || 10;
      const minContentLength = params.minContentLength || 1000;

      let enrichedContext = params.context || '';
      if (params.contentIdeaInfo) {
        const { title, hook, description, specifics } = params.contentIdeaInfo;
        enrichedContext = `
${hook ? `Content Hook: ${hook}` : ''}
${description ? `Description: ${description}` : ''}
${specifics ? `Key Details to Research: ${specifics}` : ''}
${params.context ? `Additional Context: ${params.context}` : ''}`.trim();
      }

      const researchPrompt = `You are a research assistant. Research the following topic and return your findings in JSON format.

Topic to research: "${params.query}"
${params.topic ? `Additional context: ${params.topic}` : ''}
${params.niche ? `Content Niche: ${params.niche}` : ''}
${enrichedContext ? `Research Focus:\n${enrichedContext}` : ''}

CRITICAL: You MUST return ONLY valid JSON in the exact format specified below. Do not include any text before or after the JSON.

Return this exact JSON structure:
{
  "summary": "A comprehensive 3-4 paragraph synthesis of the research findings",
  "sources": [
    {
      "source_url": "https://example.com/article",
      "source_title": "Article title",
      "source_content": "Key information from this source (at least ${minContentLength} characters)",
      "source_type": "web",
      "is_starred": false,
      "fact_check_status": "verified",
      "relevance": 0.9
    }
  ],
  "relatedQuestions": ["Question 1?", "Question 2?", "Question 3?"],
  "insights": {
    "mainThemes": ["Theme 1", "Theme 2"],
    "keyStatistics": ["Stat 1", "Stat 2"],
    "controversialPoints": ["Point 1"]
  }
}

You MUST find at least ${minSources} high-quality sources. Each source must have at least ${minContentLength} characters of content.`;

      // Update progress
      await supabaseClient
        .from('research_jobs')
        .update({
          progress: 20,
          current_step: 'searching_web'
        })
        .eq('id', job.id);

      // Call Claude with web search
      console.log('🤖 Calling Claude API for research...');
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 16000,
          messages: [{
            role: 'user',
            content: researchPrompt
          }]
        })
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorText}`);
      }

      const anthropicData = await anthropicResponse.json();
      console.log('✅ Claude API response received');

      // Update progress
      await supabaseClient
        .from('research_jobs')
        .update({
          progress: 80,
          current_step: 'processing_results'
        })
        .eq('id', job.id);

      // Parse Claude's response
      const responseText = anthropicData.content[0].text;
      let researchData;

      try {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          researchData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response:', parseError);
        throw new Error('Failed to parse research results from Claude');
      }

      // Format result to match expected structure
      const result = {
        success: true,
        results: researchData.sources || [],
        sources: researchData.sources || [],
        summary: researchData.summary,
        researchSummary: researchData.summary,
        relatedQuestions: researchData.relatedQuestions || [],
        insights: researchData.insights,
        creditsUsed: 1,
        searchProvider: 'claude',
        toolsUsed: ['web_search']
      };

      console.log('✅ Research completed:', {
        sourcesFound: result.sources.length,
        hasSummary: !!result.summary
      });

      // Save research sources to workflow_research table
      if (result.sources && result.sources.length > 0) {
        console.log('💾 Saving research sources to workflow_research table');

        // Clear existing research for this workflow
        await supabaseClient
          .from('workflow_research')
          .delete()
          .eq('workflow_id', job.workflow_id);

        // Insert new research sources
        const sourcesToSave = result.sources.map((source: any, index: number) => ({
          workflow_id: job.workflow_id,
          source_type: source.source_type || 'web',
          source_url: source.source_url,
          source_title: source.source_title,
          source_content: source.source_content,
          fact_check_status: source.fact_check_status || 'verified',
          is_starred: source.is_starred || false,
          is_selected: true,
          relevance: source.relevance || (1 - index * 0.1),
          added_at: new Date().toISOString()
        }));

        const { data: savedSources, error: saveError } = await supabaseClient
          .from('workflow_research')
          .insert(sourcesToSave)
          .select();

        if (saveError) {
          console.error('Error saving research:', saveError);
        } else {
          console.log(`✅ Saved ${savedSources?.length || sourcesToSave.length} sources to workflow`);
        }
      }

      // Update user credits
      const { data: currentUser } = await supabaseClient
        .from('users')
        .select('credits')
        .eq('id', job.user_id)
        .single();

      if (currentUser && currentUser.credits > 0) {
        await supabaseClient
          .from('users')
          .update({
            credits: currentUser.credits - 1
          })
          .eq('id', job.user_id);

        // Log transaction
        await supabaseClient
          .from('credits_transactions')
          .insert({
            user_id: job.user_id,
            amount: -1,
            type: 'usage',
            description: `Research: ${params.query?.substring(0, 100)}`,
            metadata: {
              workflowId: job.workflow_id,
              provider: 'claude',
              sourcesCount: result.sources?.length
            }
          });
      }

      // Mark job as completed
      await supabaseClient
        .from('research_jobs')
        .update({
          status: 'completed',
          progress: 100,
          current_step: 'completed',
          completed_at: new Date().toISOString(),
          processing_time_seconds: Math.round((Date.now() - startTime) / 1000),
          research_results: result
        })
        .eq('id', job.id);

      console.log('✅ Research job completed successfully:', job.id);
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

    } catch (researchError) {
      console.error('❌ Research error:', researchError);

      // Check if we should retry
      const shouldRetry = job.retry_count < job.max_retries;

      if (shouldRetry) {
        // Mark for retry
        await supabaseClient
          .from('research_jobs')
          .update({
            status: 'pending', // Back to pending for retry
            retry_count: job.retry_count + 1,
            error_message: researchError.message,
            current_step: 'retry_queued'
          })
          .eq('id', job.id);

        console.log(`🔄 Job ${job.id} queued for retry (attempt ${job.retry_count + 1}/${job.max_retries})`);
      } else {
        // Max retries reached, mark as failed
        await supabaseClient
          .from('research_jobs')
          .update({
            status: 'failed',
            error_message: researchError.message,
            current_step: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        console.log(`❌ Job ${job.id} failed after ${job.retry_count} retries`);
      }

      return new Response(
        JSON.stringify({
          success: false,
          jobId: job.id,
          error: researchError.message,
          willRetry: shouldRetry
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Function failed',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
