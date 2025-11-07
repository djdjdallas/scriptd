import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateUserAccess, calculateChunkStrategy } from '@/lib/scriptGenerationConfig';

/**
 * POST /api/workflow/generate-script-async
 *
 * Creates an async job for script generation instead of generating synchronously.
 * This avoids Vercel's 300-second timeout limit on Hobby plan.
 *
 * Flow:
 * 1. User calls this endpoint
 * 2. Creates job record in database
 * 3. Returns job ID immediately
 * 4. Cron job picks up pending jobs and processes them
 * 5. Frontend polls job status for completion
 */
export async function POST(request) {
  console.log('🚀 === ASYNC SCRIPT GENERATION API CALLED ===');

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    // Get request parameters - all the same as generate-script route
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
      sponsor,
      model = 'claude-3-5-haiku',
      targetAudience,
      tone,
      targetDuration,
      workflowId
    } = await request.json();

    console.log('📊 Job creation request:', {
      workflowId,
      userId: user.id,
      targetDuration,
      model,
      hasResearch: !!research,
      researchSourceCount: research?.sources?.length || 0
    });

    // Validate required parameters
    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Validate workflow exists and belongs to user
    const { data: workflow, error: workflowError } = await supabase
      .from('script_workflows')
      .select('id, user_id')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      console.error('Workflow validation error:', workflowError);
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if there's already a pending or processing job for this workflow
    const { data: existingJobs } = await supabase
      .from('script_generation_jobs')
      .select('id, status')
      .eq('workflow_id', workflowId)
      .in('status', ['pending', 'processing'])
      .limit(1);

    if (existingJobs && existingJobs.length > 0) {
      console.log('⚠️ Job already exists for this workflow:', existingJobs[0].id);
      return NextResponse.json({
        success: true,
        jobId: existingJobs[0].id,
        status: existingJobs[0].status,
        message: 'Script generation is already in progress'
      });
    }

    // Calculate chunk strategy for progress tracking
    const durationMinutes = Math.ceil((targetDuration || 300) / 60);
    const chunkStrategy = calculateChunkStrategy(durationMinutes);

    console.log('📐 Chunk strategy:', {
      durationMinutes,
      totalChunks: chunkStrategy.totalChunks,
      useChunking: chunkStrategy.useChunking
    });

    // Validate user access (subscription tier check)
    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('subscription_tier, subscription_plan, subscription_status')
        .eq('id', user.id)
        .single();

      const userTier = userProfile?.subscription_tier || userProfile?.subscription_plan || 'free';

      // Validate access
      const validation = validateUserAccess(userTier, durationMinutes);
      if (!validation.canGenerate) {
        return NextResponse.json({
          error: validation.message,
          requiresUpgrade: true,
          currentLimit: validation.maxDuration
        }, { status: 403 });
      }
    } catch (error) {
      console.error('Subscription check error:', error);
      // Continue with free tier limits
    }

    // Store ALL generation parameters in JSONB for the cron job to use
    const generationParams = {
      type,
      title,
      topic,
      voiceProfile,
      research,
      frame,
      hook,
      contentPoints,
      thumbnail,
      sponsor,
      model,
      targetAudience,
      tone,
      targetDuration
    };

    // Create the job record
    const { data: job, error: jobError } = await supabase
      .from('script_generation_jobs')
      .insert({
        workflow_id: workflowId,
        user_id: user.id,
        status: 'pending',
        progress: 0,
        current_chunk: 0,
        total_chunks: chunkStrategy.totalChunks,
        current_step: 'queued',
        generation_params: generationParams,
        priority: 5 // Default priority
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Error creating job:', jobError);
      return NextResponse.json({
        error: 'Failed to create generation job',
        details: jobError.message
      }, { status: 500 });
    }

    console.log('✅ Job created successfully:', job.id);

    // Trigger the Edge Function to process the job immediately
    // This ensures immediate processing without waiting for pg_cron
    try {
      console.log('🚀 Triggering Edge Function to process job immediately...');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        // Fire and forget - don't wait for the response
        fetch(`${supabaseUrl}/functions/v1/process-script-jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'x-supabase-caller': 'api'
          },
          body: JSON.stringify({})
        }).catch(error => {
          console.error('Failed to trigger Edge Function (non-blocking):', error);
        });

        console.log('✅ Edge Function trigger initiated');
      } else {
        console.warn('⚠️ Missing Supabase URL or service key for Edge Function trigger');
      }
    } catch (error) {
      console.error('Error triggering Edge Function (non-blocking):', error);
      // Don't fail the request if Edge Function trigger fails
      // pg_cron will pick it up eventually
    }

    // Return job ID immediately
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'pending',
      estimatedTimeMinutes: Math.ceil(durationMinutes / 3), // Rough estimate: 1/3 of script duration
      message: 'Script generation job created. Processing will begin shortly.',
      pollUrl: `/api/workflow/job-status/${job.id}`
    });

  } catch (error) {
    console.error('❌ Async script generation API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
