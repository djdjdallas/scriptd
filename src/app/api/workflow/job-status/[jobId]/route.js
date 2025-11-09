import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/workflow/job-status/[jobId]
 *
 * Check the status of a script generation job
 * Used by frontend to poll for progress updates
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Fetch job status
    const { data: job, error: jobError } = await supabase
      .from('script_generation_jobs')
      .select(`
        id,
        workflow_id,
        status,
        progress,
        current_chunk,
        total_chunks,
        current_step,
        error_message,
        created_at,
        started_at,
        completed_at,
        processing_time_seconds
      `)
      .eq('id', jobId)
      .eq('user_id', user.id) // Ensure user owns this job
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      console.error('Error fetching job:', jobError);
      return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 });
    }

    // If job is completed, fetch the generated script from script_workflows table
    let generatedScript = null;
    if (job.status === 'completed') {
      const { data: workflow } = await supabase
        .from('script_workflows')
        .select('workflow_data')
        .eq('id', job.workflow_id)
        .single();

      if (workflow?.workflow_data) {
        // Check both camelCase and snake_case for backward compatibility
        generatedScript = workflow.workflow_data.generatedScript ||
                         workflow.workflow_data.generated_script ||
                         workflow.workflow_data.script;
      }
    }

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        generatedScript
      }
    });

  } catch (error) {
    console.error('Job status API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workflow/job-status/[jobId]
 *
 * Update job status (e.g., cancel a job)
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;
    const body = await request.json();
    const { action } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    if (action === 'cancel') {
      // Cancel the job
      const { data: job, error: updateError } = await supabase
        .from('script_generation_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId)
        .eq('user_id', user.id) // Ensure user owns this job
        .select()
        .single();

      if (updateError) {
        console.error('Error cancelling job:', updateError);
        return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        job
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Job update API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
