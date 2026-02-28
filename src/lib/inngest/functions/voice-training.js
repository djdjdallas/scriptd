import { inngest } from '../client';

export const voiceTrainingFunction = inngest.createFunction(
  {
    id: 'voice-training',
    retries: 3,
    onFailure: async ({ event, error }) => {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { jobId, channelId, userId } = event.data.event.data;

      await supabase
        .from('voice_training_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message,
        })
        .eq('id', jobId);

      await supabase
        .from('channels')
        .update({
          voice_training_status: 'failed',
          voice_training_error: error.message,
        })
        .eq('id', channelId);

      // Fire failure webhook
      const { notifyTrainingFailed } = await import('@/lib/voice-training/webhooks');
      await notifyTrainingFailed(channelId, error, 3);

      // Send failure notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'voice_training_failed',
          title: 'Voice Training Failed',
          message: "We couldn't complete voice training. Don't worry, you can retry for FREE from the Voice page.",
          channelId,
          read: false,
          created_at: new Date().toISOString(),
        });
    },
  },
  { event: 'voice/training.requested' },
  async ({ event, step }) => {
    const { jobId, channelId, userId, metadata } = event.data;

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Step 1: Mark as processing and notify webhooks
    const channelData = await step.run('mark-processing', async () => {
      const { data: job } = await supabase
        .from('voice_training_jobs')
        .select('*, channels(*)')
        .eq('id', jobId)
        .single();

      // Skip if already completed
      if (job?.status === 'completed') {
        return job?.channels;
      }

      await supabase
        .from('voice_training_jobs')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      await supabase
        .from('channels')
        .update({ voice_training_status: 'in_progress' })
        .eq('id', channelId);

      const { notifyTrainingStarted } = await import('@/lib/voice-training/webhooks');
      await notifyTrainingStarted(channelId, {
        jobId,
        channelName: job?.channels?.title,
      });

      return job?.channels;
    });

    // Step 2: Process voice training
    const result = await step.run('process-training', async () => {
      const { processVoiceTraining } = await import('@/lib/voice-training/processor');

      return await processVoiceTraining({
        channelId,
        userId,
        channelData: channelData || {},
        isFree: true,
        supabase,
      });
    });

    // Step 3: Save results and notify completion
    await step.run('save-results', async () => {
      await supabase
        .from('voice_training_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result_data: result,
        })
        .eq('id', jobId);

      await supabase
        .from('channels')
        .update({
          voice_training_status: 'completed',
          last_voice_training: new Date().toISOString(),
          voice_profile: result.profile,
        })
        .eq('id', channelId);

      // Log free training event
      await supabase
        .from('credits_transactions')
        .insert({
          user_id: userId,
          amount: 0,
          type: 'usage',
          description: 'Free voice training on channel connection',
          metadata: { feature: 'voice_training', channelId, isFree: true },
        });

      // Fire completion webhook
      const { notifyTrainingCompleted } = await import('@/lib/voice-training/webhooks');
      await notifyTrainingCompleted(channelId, {
        profileId: result.profileId,
        completeness: result.profile?.completenessAnalysis?.scorePercent,
        trainingStats: result.trainingStats,
      });

      // Send success notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'voice_training_complete',
          title: 'Voice Training Complete!',
          message: 'Your AI voice model is ready to use. Start generating scripts in your unique style! (This was FREE - no credits were charged)',
          channelId,
          read: false,
          created_at: new Date().toISOString(),
        });
    });

    return { success: true, jobId };
  }
);
