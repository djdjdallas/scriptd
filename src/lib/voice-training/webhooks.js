/**
 * Voice Training Webhook System
 * Sends real-time notifications to configured webhook URLs
 */

import { createClient } from '@/lib/supabase/server';

// Webhook configuration
const WEBHOOK_CONFIG = {
  timeout: 5000, // 5 second timeout
  retries: 2,
  retryDelay: 1000, // 1 second between retries
  userAgent: 'GenScript-Webhooks/1.0'
};

// Event types
export const WEBHOOK_EVENTS = {
  TRAINING_STARTED: 'voice_training.started',
  TRAINING_COMPLETED: 'voice_training.completed',
  TRAINING_FAILED: 'voice_training.failed',
  TRAINING_RETRYING: 'voice_training.retrying'
};

/**
 * Send a webhook notification
 * @param {string} channelId - Channel ID
 * @param {string} event - Event type from WEBHOOK_EVENTS
 * @param {Object} payload - Event payload data
 * @returns {Promise<Object>} Webhook delivery result
 */
export async function sendWebhook(channelId, event, payload = {}) {
  const supabase = await createClient();

  // Get channel with webhook configuration
  const { data: channel, error } = await supabase
    .from('channels')
    .select('id, webhook_url, webhook_secret, webhook_events, user_id, title')
    .eq('id', channelId)
    .single();

  if (error || !channel) {
    console.debug(`[Webhook] No channel found for ${channelId}`);
    return { sent: false, reason: 'channel_not_found' };
  }

  if (!channel.webhook_url) {
    console.debug(`[Webhook] No webhook URL configured for channel ${channelId}`);
    return { sent: false, reason: 'no_webhook_url' };
  }

  // Check if this event type is enabled (if filtering is configured)
  if (channel.webhook_events && channel.webhook_events.length > 0 && !channel.webhook_events.includes(event)) {
    console.debug(`[Webhook] Event ${event} not enabled for channel ${channelId}`);
    return { sent: false, reason: 'event_not_enabled' };
  }

  // Build webhook payload
  const webhookPayload = buildWebhookPayload(channel, event, payload);

  // Send with retries
  const result = await sendWithRetry(
    channel.webhook_url,
    webhookPayload,
    channel.webhook_secret
  );

  // Log webhook delivery
  await logWebhookDelivery(supabase, {
    channelId,
    event,
    url: channel.webhook_url,
    success: result.success,
    statusCode: result.statusCode,
    error: result.error,
    attempts: result.attempts
  });

  return result;
}

/**
 * Build standardized webhook payload
 */
function buildWebhookPayload(channel, event, data) {
  return {
    event,
    timestamp: new Date().toISOString(),
    channel: {
      id: channel.id,
      title: channel.title
    },
    data: {
      ...data,
      // Sanitize sensitive data
      userId: undefined,
      internalIds: undefined
    },
    metadata: {
      version: '1.0',
      source: 'genscript'
    }
  };
}

/**
 * Send webhook with retry logic
 */
async function sendWithRetry(url, payload, secret = null) {
  let lastError = null;
  let attempts = 0;

  for (let i = 0; i <= WEBHOOK_CONFIG.retries; i++) {
    attempts++;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': WEBHOOK_CONFIG.userAgent,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp
      };

      // Add signature if secret is configured
      if (secret) {
        const signature = await generateSignature(JSON.stringify(payload), secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[Webhook] Delivered ${payload.event} to ${url} (attempt ${attempts})`);
        return {
          success: true,
          statusCode: response.status,
          attempts
        };
      }

      // Non-retryable status codes
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return {
          success: false,
          statusCode: response.status,
          error: `HTTP ${response.status}`,
          attempts
        };
      }

      lastError = `HTTP ${response.status}`;

    } catch (error) {
      lastError = error.name === 'AbortError' ? 'Timeout' : error.message;
      console.warn(`[Webhook] Attempt ${attempts} failed:`, lastError);
    }

    // Wait before retry (if not last attempt)
    if (i < WEBHOOK_CONFIG.retries) {
      await new Promise(resolve => setTimeout(resolve, WEBHOOK_CONFIG.retryDelay));
    }
  }

  console.error(`[Webhook] Failed after ${attempts} attempts:`, lastError);
  return {
    success: false,
    error: lastError,
    attempts
  };
}

/**
 * Generate HMAC signature for webhook verification
 */
async function generateSignature(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Log webhook delivery for debugging/analytics
 */
async function logWebhookDelivery(supabase, data) {
  try {
    await supabase
      .from('webhook_logs')
      .insert({
        channel_id: data.channelId,
        event: data.event,
        url: data.url,
        success: data.success,
        status_code: data.statusCode,
        error: data.error,
        attempts: data.attempts,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('[Webhook] Failed to log delivery:', error.message);
  }
}

// Convenience functions for common events

/**
 * Notify training started
 */
export async function notifyTrainingStarted(channelId, data = {}) {
  return sendWebhook(channelId, WEBHOOK_EVENTS.TRAINING_STARTED, {
    status: 'started',
    ...data
  });
}

/**
 * Notify training completed
 */
export async function notifyTrainingCompleted(channelId, result = {}) {
  return sendWebhook(channelId, WEBHOOK_EVENTS.TRAINING_COMPLETED, {
    status: 'completed',
    profile: {
      id: result.profileId,
      completeness: result.completeness
    },
    stats: result.trainingStats
  });
}

/**
 * Notify training failed
 */
export async function notifyTrainingFailed(channelId, error, attempts = 1) {
  return sendWebhook(channelId, WEBHOOK_EVENTS.TRAINING_FAILED, {
    status: 'failed',
    error: error.message || error,
    attempts,
    canRetry: attempts < 3
  });
}

/**
 * Notify training is being retried
 */
export async function notifyTrainingRetrying(channelId, attempt, maxAttempts) {
  return sendWebhook(channelId, WEBHOOK_EVENTS.TRAINING_RETRYING, {
    status: 'retrying',
    attempt,
    maxAttempts,
    nextRetryIn: 30 * attempt // seconds
  });
}

export { WEBHOOK_CONFIG };
