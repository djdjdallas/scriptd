import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/workflow/research-async
 *
 * Creates an async job for research instead of processing synchronously.
 * This avoids Vercel's timeout limits.
 *
 * Flow:
 * 1. User calls this endpoint
 * 2. Creates job record in database
 * 3. Returns job ID immediately
 * 4. Edge Function picks up pending jobs and processes them
 * 5. Frontend polls job status for completion
 */
export async function POST(request) {
  console.log('🚀 === ASYNC RESEARCH API CALLED ===');

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    // Get request parameters - all the same as research route
    const requestData = await request.json();
    const {
      query,
      topic,
      workflowId,
      targetDuration,
      enableExpansion,
      hasContentIdeaInfo,
      niche
    } = requestData;

    console.log('📊 Research job creation request:', {
      workflowId,
      userId: user.id,
      targetDuration,
      topic: topic?.substring(0, 100),
      hasContentIdeaInfo,
      enableExpansion
    });

    // Validate required parameters
    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    if (!query && !topic) {
      return NextResponse.json({ error: 'Query or topic is required' }, { status: 400 });
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
      .from('research_jobs')
      .select('id, status')
      .eq('workflow_id', workflowId)
      .in('status', ['pending', 'processing'])
      .limit(1);

    if (existingJobs && existingJobs.length > 0) {
      console.log('⚠️ Research job already exists for this workflow:', existingJobs[0].id);
      return NextResponse.json({
        success: true,
        jobId: existingJobs[0].id,
        status: existingJobs[0].status,
        message: 'Research is already in progress'
      });
    }

    // Store ALL research parameters in JSONB for the Edge Function to use
    const researchParams = {
      query,
      topic,
      targetDuration,
      enableExpansion,
      hasContentIdeaInfo,
      niche
    };

    // Create the job record
    const { data: job, error: jobError } = await supabase
      .from('research_jobs')
      .insert({
        workflow_id: workflowId,
        user_id: user.id,
        status: 'pending',
        progress: 0,
        current_step: 'queued',
        research_params: researchParams,
        priority: 5 // Default priority
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Error creating research job:', jobError);
      return NextResponse.json({
        error: 'Failed to create research job',
        details: jobError.message
      }, { status: 500 });
    }

    console.log('✅ Research job created successfully:', job.id);

    // Trigger the Edge Function to process the job immediately
    try {
      console.log('🚀 Triggering Edge Function to process research job immediately...');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        // Fire and forget - don't wait for the response
        fetch(`${supabaseUrl}/functions/v1/process-research-jobs`, {
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
    }

    // Return job ID immediately
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'pending',
      message: 'Research job created. Processing will begin shortly.',
      pollUrl: `/api/workflow/research-status/${job.id}`
    });

  } catch (error) {
    console.error('❌ Async research API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
