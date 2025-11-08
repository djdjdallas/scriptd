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
      // Call the Vercel API to perform research
      // The Vercel API has all the complex research logic
      // This Edge Function just waits for it to complete (NO TIMEOUT!)

      const apiUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || Deno.env.get('VERCEL_URL') || 'https://scriptd.vercel.app'
      const edgeSecret = Deno.env.get('EDGE_FUNCTION_SECRET') || 'gpM1FDtEM2RXDu6pXQa0dMOWGiP4F3hlmhWVQWUmV2o=';

      console.log('🔬 Calling Vercel API at:', apiUrl);
      console.log('📦 Research params:', {
        topic: params.topic?.substring(0, 50),
        targetDuration: params.targetDuration,
        enableExpansion: params.enableExpansion
      });

      const researchResponse = await fetch(`${apiUrl}/api/workflow/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': job.user_id,
          'X-Job-Id': job.id,
          'X-Edge-Function-Secret': edgeSecret
        },
        body: JSON.stringify({
          ...params,
          workflowId: job.workflow_id
        })
      });

      console.log('📡 Vercel API response status:', researchResponse.status);

      if (!researchResponse.ok) {
        const errorData = await researchResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Research failed with status ${researchResponse.status}`);
      }

      const result = await researchResponse.json();
      console.log('✅ Research completed');

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
