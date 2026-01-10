import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

/**
 * Cron Job: Process Script Generation Jobs
 *
 * Runs every minute via Vercel Cron
 * - Picks up oldest pending job
 * - Generates script (calls existing generation logic)
 * - Updates progress in database
 * - Handles errors and retries
 *
 * IMPORTANT: This route uses the service role key to bypass RLS
 * Configure in Vercel: SUPABASE_SERVICE_ROLE_KEY environment variable
 */

const MAX_PROCESSING_TIME = 270; // 4.5 minutes (leave buffer before 5-min timeout)

export async function GET(request) {
  const startTime = Date.now();

  try {
    // Verify this is called by Vercel Cron (security check)
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
      // Vercel Cron sends: Authorization: Bearer {CRON_SECRET}
      const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
      if (authHeader !== expectedAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Use service role to bypass RLS
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Find oldest pending job (respecting priority)
    const { data: jobs, error: fetchError } = await supabase
      .from('script_generation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false }) // Higher priority first
      .order('created_at', { ascending: true }) // Oldest first within same priority
      .limit(1);

    if (fetchError) {
      apiLogger.error('Error fetching pending jobs', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: 'No pending jobs', processed: 0 });
    }

    const job = jobs[0];

    // Mark job as processing
    await supabase
      .from('script_generation_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        current_step: 'initializing',
        progress: 5
      })
      .eq('id', job.id);

    // Extract generation parameters
    const params = job.generation_params;

    try {
      // Call the ACTUAL script generation logic
      // We'll make an internal HTTP call to the existing generate-script endpoint
      // This reuses all the complex generation logic without code duplication

      const generationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/workflow/generate-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass user context for credit deduction
          'X-User-Id': job.user_id,
          'X-Job-Id': job.id // For progress updates
        },
        body: JSON.stringify({
          ...params,
          workflowId: job.workflow_id,
          // Add callback for progress updates
          progressCallback: async (progress) => {
            await updateJobProgress(supabase, job.id, progress);
          }
        })
      });

      if (!generationResponse.ok) {
        const errorData = await generationResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed with status ${generationResponse.status}`);
      }

      const result = await generationResponse.json();

      // Mark job as completed
      await supabase
        .from('script_generation_jobs')
        .update({
          status: 'completed',
          progress: 100,
          current_step: 'completed',
          completed_at: new Date().toISOString(),
          processing_time_seconds: Math.round((Date.now() - startTime) / 1000),
          generated_script: result.script || result.generatedScript,
          script_metadata: result.metadata
        })
        .eq('id', job.id);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        processed: 1,
        processingTime: Math.round((Date.now() - startTime) / 1000)
      });

    } catch (generationError) {
      // Check if we should retry
      const shouldRetry = job.retry_count < job.max_retries;

      if (shouldRetry) {
        // Mark for retry
        await supabase
          .from('script_generation_jobs')
          .update({
            status: 'pending', // Back to pending for retry
            retry_count: job.retry_count + 1,
            error_message: generationError.message,
            current_step: 'retry_queued'
          })
          .eq('id', job.id);
      } else {
        // Max retries reached, mark as failed
        await supabase
          .from('script_generation_jobs')
          .update({
            status: 'failed',
            error_message: generationError.message,
            current_step: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);
      }

      return NextResponse.json({
        success: false,
        jobId: job.id,
        error: generationError.message,
        willRetry: shouldRetry
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Cron job failed',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Helper function to update job progress
 * Called during script generation to show real-time progress
 */
async function updateJobProgress(supabase, jobId, progressData) {
  try {
    await supabase
      .from('script_generation_jobs')
      .update({
        progress: progressData.percentage || 0,
        current_step: progressData.step || '',
        current_chunk: progressData.chunk || 0
      })
      .eq('id', jobId);
  } catch {
    // Don't throw - progress updates are non-critical
  }
}

// Also support POST for manual triggering (for testing)
export async function POST(request) {
  return GET(request);
}
