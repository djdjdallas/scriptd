import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

/**
 * GET /api/workflow/research-status/[jobId]
 *
 * Polls the status of an async research job
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { jobId } = params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch job status
    const { data: job, error: jobError } = await supabase
      .from('research_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify ownership
    if (job.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Return job status
    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      currentStep: job.current_step,
      error: job.error_message,
      retryCount: job.retry_count,
      results: job.research_results,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      processingTime: job.processing_time_seconds
    });

  } catch (error) {
    apiLogger.error('Research status API error', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
