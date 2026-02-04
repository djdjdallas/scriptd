/**
 * Subscription Events Tracking Service
 * Records subscription lifecycle events to both PostHog and Supabase
 */

import { getPostHogClient } from '@/lib/posthog-server';
import { createServiceClient } from '@/lib/supabase/service';
import { logger } from '@/lib/monitoring/logger';
import { getTierLevel, compareTiers } from './tier-utils';

/**
 * Record a subscription event to both PostHog and Supabase
 * @param {Object} params - Event parameters
 * @param {string} params.eventType - Type of subscription event
 * @param {string} params.userId - User ID
 * @param {string|null} params.previousTier - Previous subscription tier
 * @param {string|null} params.newTier - New subscription tier
 * @param {string|null} params.stripeSubscriptionId - Stripe subscription ID
 * @param {string|null} params.stripeCustomerId - Stripe customer ID
 * @param {number|null} params.amount - Amount in dollars
 * @param {string} params.currency - Currency code (default: 'usd')
 * @param {string|null} params.billingInterval - Billing interval ('month' or 'year')
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function recordSubscriptionEvent({
  eventType,
  userId,
  previousTier = null,
  newTier = null,
  stripeSubscriptionId = null,
  stripeCustomerId = null,
  amount = null,
  currency = 'usd',
  billingInterval = null,
  metadata = {}
}) {
  const supabase = createServiceClient();
  const posthog = getPostHogClient();

  const eventData = {
    event_type: eventType,
    user_id: userId,
    previous_tier: previousTier,
    new_tier: newTier,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    amount,
    currency,
    billing_interval: billingInterval,
    metadata
  };

  try {
    // 1. Record to Supabase subscription_events table
    const { error: dbError } = await supabase
      .from('subscription_events')
      .insert(eventData);

    if (dbError) {
      logger.error('Failed to record subscription event to Supabase', {
        eventType,
        userId,
        error: dbError.message
      });
      // Don't throw - continue to PostHog tracking
    }

    // 2. Track in PostHog
    posthog.capture({
      distinctId: userId,
      event: eventType,
      properties: {
        previous_tier: previousTier,
        new_tier: newTier,
        tier_change: compareTiers(previousTier, newTier),
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        amount,
        currency,
        billing_interval: billingInterval,
        ...metadata
      }
    });

    // 3. Update user properties in PostHog for segmentation
    if (newTier) {
      posthog.identify({
        distinctId: userId,
        properties: {
          subscription_tier: newTier,
          is_paying_customer: newTier !== 'free',
          tier_level: getTierLevel(newTier),
          last_subscription_event: eventType,
          last_subscription_event_at: new Date().toISOString()
        }
      });
    }

    await posthog.shutdown();

    logger.info('Subscription event recorded', {
      eventType,
      userId,
      previousTier,
      newTier
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to record subscription event', {
      eventType,
      userId,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

/**
 * Get user's current subscription tier before applying updates
 * Used to detect upgrades/downgrades in webhook handler
 * @param {string} userId - User ID
 * @returns {Promise<{tier: string, status: string|null, subscriptionId: string|null}>}
 */
export async function getUserCurrentTier(userId) {
  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, stripe_subscription_id')
    .eq('id', userId)
    .single();

  if (error) {
    logger.warn('Could not fetch current user tier', {
      userId,
      error: error.message
    });
    return { tier: 'free', status: null, subscriptionId: null };
  }

  return {
    tier: user?.subscription_tier || 'free',
    status: user?.subscription_status,
    subscriptionId: user?.stripe_subscription_id
  };
}

/**
 * Record trial started event (for new signups with free credits)
 * @param {string} userId - User ID
 * @param {Object} metadata - Additional metadata (auth_provider, referrer, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function recordTrialStarted(userId, metadata = {}) {
  return recordSubscriptionEvent({
    eventType: 'trial_started',
    userId,
    previousTier: null,
    newTier: 'free',
    metadata: {
      initial_credits: 50,
      ...metadata
    }
  });
}

/**
 * Record subscription started event
 * @param {string} userId - User ID
 * @param {string} tier - Subscription tier
 * @param {Object} options - Additional options
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function recordSubscriptionStarted(userId, tier, options = {}) {
  return recordSubscriptionEvent({
    eventType: 'subscription_started',
    userId,
    previousTier: 'free',
    newTier: tier,
    ...options
  });
}

/**
 * Record subscription cancelled event
 * @param {string} userId - User ID
 * @param {string} previousTier - Previous subscription tier
 * @param {Object} options - Additional options
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function recordSubscriptionCancelled(userId, previousTier, options = {}) {
  return recordSubscriptionEvent({
    eventType: 'subscription_cancelled',
    userId,
    previousTier,
    newTier: 'free',
    ...options
  });
}

/**
 * Record payment failed event
 * @param {string} userId - User ID
 * @param {Object} options - Additional options (error_message, next_retry_date, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function recordPaymentFailed(userId, options = {}) {
  return recordSubscriptionEvent({
    eventType: 'payment_failed',
    userId,
    ...options
  });
}
