import { createClient } from '@/lib/supabase/server';
import { processVoiceTraining } from './processor';

export async function queueVoiceTraining({
  channelId,
  userId,
  priority = 5,
  metadata = {}
}) {
  const supabase = await createClient();
  
  // Create job entry
  const { data: job, error } = await supabase
    .from('voice_training_jobs')
    .insert({
      channel_id: channelId,
      user_id: userId,
      priority: priority,
      status: 'queued',
      training_data: {
        ...metadata,
        isFree: true // Always free - no credits required
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to queue voice training:', error);
    throw error;
  }

  console.log(`Voice training job queued (FREE): ${job.id}`);

  // Trigger background processing
  if (process.env.NODE_ENV === 'production') {
    // In production, trigger Supabase Edge Function or external worker
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-voice-training`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId: job.id })
      });
    } catch (error) {
      console.error('Failed to trigger background processing:', error);
    }
  } else {
    // In development, process immediately with a delay
    setTimeout(() => processVoiceTrainingJob(job.id), 1000);
  }

  return job.id;
}

export async function processVoiceTrainingJob(jobId) {
  const supabase = await createClient();
  
  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('voice_training_jobs')
      .select('*, channels(*)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobId);
      return;
    }

    if (job.status !== 'queued') {
      console.log(`Job ${jobId} is not in queued status, skipping`);
      return;
    }

    // Update job status to processing
    await supabase
      .from('voice_training_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Update channel status
    await supabase
      .from('channels')
      .update({ 
        voice_training_status: 'in_progress'
      })
      .eq('id', job.channel_id);

    console.log(`Processing FREE voice training for channel ${job.channel_id}`);

    // Process voice training (FREE - no credit check needed)
    const result = await processVoiceTraining({
      channelId: job.channel_id,
      userId: job.user_id,
      channelData: job.channels,
      isFree: true // Always free
    });

    // Update job and channel on success
    await supabase
      .from('voice_training_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        result_data: result
      })
      .eq('id', jobId);

    await supabase
      .from('channels')
      .update({
        voice_training_status: 'completed',
        last_voice_training: new Date().toISOString(),
        voice_profile: result.profile,
        voice_training_attempts: job.attempt_count + 1
      })
      .eq('id', job.channel_id);

    // NO CREDIT DEDUCTION - Voice training is FREE
    console.log(`Voice training completed successfully (FREE) for channel ${job.channel_id}`);

    // Log the FREE training event (0 credits)
    await supabase
      .from('credits_transactions')
      .insert({
        user_id: job.user_id,
        amount: 0, // FREE - no credits charged
        type: 'usage',
        description: 'Free voice training on channel connection',
        metadata: {
          feature: 'voice_training',
          channelId: job.channel_id,
          isFree: true
        }
      });

    // Send success notification
    await sendNotification(job.user_id, {
      type: 'voice_training_complete',
      title: 'Voice Training Complete! 🎉',
      message: 'Your AI voice model is ready to use. Start generating scripts in your unique style! (This was FREE - no credits were charged)',
      channelId: job.channel_id
    });

  } catch (error) {
    console.error('Voice training job failed:', error);
    
    const { data: job } = await supabase
      .from('voice_training_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    // Update job status
    await supabase
      .from('voice_training_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
        attempt_count: (job?.attempt_count || 0) + 1
      })
      .eq('id', jobId);

    // Update channel status
    await supabase
      .from('channels')
      .update({
        voice_training_status: 'failed',
        voice_training_error: error.message,
        voice_training_attempts: (job?.attempt_count || 0) + 1
      })
      .eq('id', job.channel_id);

    // Retry if under max attempts
    if (job && job.attempt_count < job.max_attempts) {
      console.log(`Retrying voice training job ${jobId} (attempt ${job.attempt_count + 1}/${job.max_attempts})`);
      setTimeout(() => processVoiceTrainingJob(jobId), 30000 * (job.attempt_count + 1)); // Exponential backoff
    } else {
      // Send failure notification
      await sendNotification(job.user_id, {
        type: 'voice_training_failed',
        title: 'Voice Training Failed',
        message: 'We couldn\'t complete voice training. Don\'t worry, you can retry for FREE from the Voice page.',
        channelId: job.channel_id
      });
    }
  }
}

// Helper function to send notifications
async function sendNotification(userId, notification) {
  try {
    const supabase = await createClient();
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification,
        read: false,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// Check if a channel should auto-train
export async function checkAutoTrainEligibility(userId, channelId) {
  const supabase = await createClient();
  
  // Check user preferences
  const { data: userData } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', userId)
    .single();

  // Check if auto-training is disabled in user preferences
  if (userData?.preferences?.autoTrainVoice === false) {
    console.log('Auto-training disabled in user preferences');
    return false;
  }

  // Check channel settings
  const { data: channel } = await supabase
    .from('channels')
    .select('auto_train_enabled, last_voice_training, voice_training_status, video_count')
    .eq('id', channelId)
    .single();

  if (!channel?.auto_train_enabled) {
    console.log('Auto-training disabled for channel');
    return false;
  }

  // Skip if no videos to train on
  if (!channel.video_count || channel.video_count === 0) {
    console.log('Skipping auto-training: No videos in channel');
    return false;
  }

  // Don't retrain if recently trained (within 7 days)
  if (channel.last_voice_training) {
    const daysSinceTraining = Math.floor(
      (Date.now() - new Date(channel.last_voice_training).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceTraining < 7) {
      console.log(`Skipping auto-training: Recently trained (${daysSinceTraining} days ago)`);
      return false;
    }
  }

  // Don't retrain if already completed
  if (channel.voice_training_status === 'completed') {
    console.log('Skipping auto-training: Already completed');
    return false;
  }

  // No credit check needed - voice training is FREE
  console.log('Channel eligible for FREE auto voice training');
  return true;
}