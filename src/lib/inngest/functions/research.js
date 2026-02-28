import { inngest } from '../client';

export const researchFunction = inngest.createFunction(
  {
    id: 'research',
    retries: 3,
    onFailure: async ({ event, error }) => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { jobId } = event.data.event.data;
      await supabase
        .from('research_jobs')
        .update({
          status: 'failed',
          error_message: error.message,
          current_step: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    },
  },
  { event: 'research/processing.requested' },
  async ({ event, step }) => {
    const { jobId, userId, workflowId, researchParams } = event.data;

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Step 1: Mark job as processing
    await step.run('mark-processing', async () => {
      await supabase
        .from('research_jobs')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          current_step: 'initializing',
          progress: 5,
        })
        .eq('id', jobId);
    });

    // Step 2: Perform the research by calling the existing route handler in-process
    const result = await step.run('perform-research', async () => {
      const { POST } = await import('@/app/api/workflow/research/route');

      const secret = process.env.EDGE_FUNCTION_SECRET;

      const syntheticRequest = new Request('http://localhost/api/workflow/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-Job-Id': jobId,
          'X-Edge-Function-Secret': secret,
        },
        body: JSON.stringify({
          ...researchParams,
          workflowId,
        }),
      });

      const response = await POST(syntheticRequest);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Research failed with status ${response.status}`);
      }

      return data;
    });

    // Step 3: Mark job as completed
    await step.run('mark-completed', async () => {
      await supabase
        .from('research_jobs')
        .update({
          status: 'completed',
          progress: 100,
          current_step: 'completed',
          completed_at: new Date().toISOString(),
          result_data: result,
        })
        .eq('id', jobId);
    });

    return { success: true, jobId };
  }
);
