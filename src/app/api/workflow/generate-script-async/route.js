import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateUserAccess, calculateChunkStrategy } from '@/lib/scriptGenerationConfig';
import { MODEL_TIERS } from '@/lib/constants';
import { checkFeatureRateLimit } from '@/lib/api/rate-limit';

// Helper to normalize old model names to new ones (all script generation uses BALANCED or PREMIUM)
function normalizeModelName(model) {
  const modelMapping = {
    'claude-3-5-haiku': MODEL_TIERS.BALANCED.actualModel, // FAST tier disabled, use BALANCED
    'claude-3-haiku': MODEL_TIERS.BALANCED.actualModel,
    'claude-3-5-sonnet': MODEL_TIERS.BALANCED.actualModel,
    'claude-3-opus': MODEL_TIERS.PREMIUM.actualModel,
    'claude-opus-4-1': MODEL_TIERS.PREMIUM.actualModel,
  };

  if (modelMapping[model]) {
    return modelMapping[model];
  }
  return model;
}

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
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    // Get request parameters - all the same as generate-script route
    const requestData = await request.json();
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
      targetAudience,
      tone,
      targetDuration,
      workflowId
    } = requestData;

    // Normalize the model name (handle old model names) - default to BALANCED (Sonnet 4.5)
    const model = normalizeModelName(requestData.model || MODEL_TIERS.BALANCED.actualModel);

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

    // Validate user access (subscription tier check)
    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('subscription_tier, subscription_plan, subscription_status')
        .eq('id', user.id)
        .single();

      const userTier = userProfile?.subscription_tier || userProfile?.subscription_plan || 'free';

      // Check feature-specific rate limit (scripts per day based on subscription tier)
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

      // Validate access (pass normalized model)
      const validation = validateUserAccess(user.id, userTier, durationMinutes, model);
      if (!validation.allowed) {
        const errorMessage = validation.errors.map(e => e.message).join('. ');
        return NextResponse.json({
          error: errorMessage,
          requiresUpgrade: true,
          currentLimit: validation.limits.maxDurationMinutes,
          errors: validation.errors
        }, { status: 403 });
      }
    } catch {
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
      return NextResponse.json({
        error: 'Failed to create generation job',
        details: jobError.message
      }, { status: 500 });
    }

    // Trigger the Edge Function to process the job immediately
    // This ensures immediate processing without waiting for pg_cron
    try {

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
        }).catch(() => {
          /* Failed to trigger Edge Function (non-blocking) */
        });
      }
    } catch {
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
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
