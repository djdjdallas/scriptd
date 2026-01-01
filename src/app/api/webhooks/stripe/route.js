// Stripe Webhook Handler

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripeService } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/service';
import { PLANS, CREDIT_PACKAGES } from '@/lib/constants';
import { emailService } from '@/lib/email/email-service';
import { getPostHogClient } from '@/lib/posthog-server';
import { logger } from '@/lib/monitoring/logger';

// Check if webhook event was already processed (idempotency)
async function isEventProcessed(supabase, eventId) {
  const { data } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single();
  return !!data;
}

// Mark event as processed
async function markEventProcessed(supabase, eventId, eventType) {
  try {
    await supabase
      .from('processed_webhook_events')
      .insert({
        event_id: eventId,
        event_type: eventType,
        processed_at: new Date().toISOString()
      });
  } catch (error) {
    // Ignore duplicate key errors (race condition protection)
    if (!error.message?.includes('duplicate')) {
      logger.error('Failed to mark event as processed', { eventId, error: error.message });
    }
  }
}

// Map Stripe price IDs to credit amounts and tiers
const PRICE_TO_CREDITS = {
  // Monthly subscriptions
  'price_1S6dBbPpO7oOioNRFsGAgIDg': { credits: 300, tier: 'creator', interval: 'month' },
  'price_1S6dBxPpO7oOioNRFs6EsczT': { credits: 800, tier: 'professional', interval: 'month' },
  'price_1S6dCNPpO7oOioNRqeUV4xcf': { credits: 2000, tier: 'agency', interval: 'month' },
  
  // Annual subscriptions  
  'price_1S6dBiPpO7oOioNR1S7NcBGn': { credits: 300, tier: 'creator', interval: 'year' },
  'price_1S6dC3PpO7oOioNRPSgxAyXB': { credits: 800, tier: 'professional', interval: 'year' },
  'price_1S6dCTPpO7oOioNRReJ8peZ2': { credits: 2000, tier: 'agency', interval: 'year' },
  
  // One-time credit packages
  'price_1S6dCoPpO7oOioNRWCV3u8Dj': { credits: 100, type: 'package' },
  'price_1S6dCzPpO7oOioNRDEeNjEwe': { credits: 300, type: 'package' },
  'price_1S6dDDPpO7oOioNRr2K4dbOs': { credits: 800, type: 'package' }
};

// Disable body parsing for webhook
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  try {
    const stripeService = getStripeService();
    const event = await stripeService.handleWebhook(body, signature);

    // Idempotency check - prevent duplicate processing
    const alreadyProcessed = await isEventProcessed(supabase, event.id);
    if (alreadyProcessed) {
      logger.info('Webhook event already processed, skipping', { eventId: event.id, eventType: event.type });
      return NextResponse.json({ received: true, skipped: true });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        logger.info('Unhandled webhook event type', { eventType: event.type });
    }

    // Mark event as processed after successful handling
    await markEventProcessed(supabase, event.id, event.type);

    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('Webhook error', { error: error.message, stack: error.stack });
    // Return 400 for signature validation errors, 500 for processing errors
    const statusCode = error.message?.includes('signature') ? 400 : 500;
    return NextResponse.json(
      { error: error.message },
      { status: statusCode }
    );
  }
}

// Handle successful checkout
async function handleCheckoutComplete(session) {
  const supabase = createServiceClient();
  
  const { 
    customer,
    metadata,
    amount_total,
    currency,
    payment_intent,
    subscription
  } = session;

  const userId = metadata?.userId;
  const teamId = metadata?.teamId;

  // Handle team subscription checkout
  if (teamId) {
    const planTier = metadata?.planTier;
    
    if (subscription) {
      // Update team subscription info
      await supabase
        .from('teams')
        .update({
          stripe_subscription_id: subscription,
          stripe_customer_id: customer,
          subscription_tier: planTier,
          billing_email: session.customer_details?.email
        })
        .eq('id', teamId);

      // Update max members based on tier
      const maxMembers = {
        'free': 1,
        'creator': 1,
        'professional': 3,
        'agency': 10
      }[planTier] || 1;

      await supabase
        .from('teams')
        .update({ max_members: maxMembers })
        .eq('id', teamId);

      // Log team activity
      await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: userId,
          activity_type: 'subscription_upgraded',
          entity_type: 'team',
          details: {
            plan_tier: planTier,
            subscription_id: subscription
          }
        });

      logger.info('Team subscription upgraded', { teamId, planTier });
      return;
    }
  }

  if (!userId) {
    logger.warn('No user ID in checkout session metadata');
    return;
  }

  // Update user's Stripe customer ID
  if (customer) {
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer })
      .eq('id', userId);
  }

  // Handle credit package purchase via price ID
  const priceId = session.line_items?.data?.[0]?.price?.id;
  const priceInfo = PRICE_TO_CREDITS[priceId];
  
  if (priceInfo?.type === 'package') {
    // One-time credit package purchase
    const credits = priceInfo.credits;
    const discountAmount = parseInt(metadata?.discountAmount || 0);
    const promoCode = metadata?.promoCode || null;

    // Add credits with expiry using our database function
    const { error: creditError } = await supabase.rpc('add_credits_with_expiry', {
      p_user_id: userId,
      p_amount: credits,
      p_stripe_payment_intent_id: payment_intent,
      p_stripe_price_id: priceId,
      p_description: `Purchased ${credits} credits`,
      p_discount_applied: discountAmount / 100,
      p_expires_in_months: 12
    });

    if (creditError) {
      logger.error('Failed to add credits via RPC', { userId, credits, error: creditError.message });
      throw new Error(`Failed to add credits: ${creditError.message}`);
    }

    // Record purchase history
    const { error: historyError } = await supabase
      .from('credit_purchase_history')
      .insert({
        user_id: userId,
        package_id: metadata?.packageId || priceId,
        credits_purchased: credits,
        amount_paid: (amount_total - discountAmount) / 100,
        discount_percentage: discountAmount > 0 ? (discountAmount / amount_total * 100) : 0,
        discount_reason: promoCode === 'FIRST_PURCHASE' ? 'First purchase discount' : promoCode,
        stripe_payment_intent_id: payment_intent,
        purchase_number: 0 // Will be set by the database function
      });

    if (historyError) {
      logger.warn('Failed to record purchase history', { userId, error: historyError.message });
    }

    logger.info('Credit purchase completed', { userId, credits, priceId });

    // Track checkout completed event in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: 'checkout_completed',
      properties: {
        purchase_type: 'credits',
        credits_purchased: credits,
        amount_paid: amount_total / 100,
        currency: currency,
        price_id: priceId,
        discount_applied: discountAmount > 0,
      }
    });
    await posthog.shutdown();
  }
  // Legacy metadata-based handling (backward compatibility)
  else if (metadata?.packageId) {
    const credits = parseInt(metadata.credits);
    const discountAmount = parseInt(metadata.discountAmount || 0);
    const promoCode = metadata.promoCode || null;
    
    // Find the package details
    const creditPackage = Object.values(CREDIT_PACKAGES).find(pkg => pkg.id === metadata.packageId);
    
    if (creditPackage) {
      // Add credits with expiry using our database function
      const { error: creditError } = await supabase.rpc('add_credits_with_expiry', {
        p_user_id: userId,
        p_amount: credits,
        p_stripe_payment_intent_id: payment_intent,
        p_stripe_price_id: creditPackage.stripePriceId,
        p_description: `Purchased ${creditPackage.name}`,
        p_discount_applied: discountAmount / 100,
        p_expires_in_months: 12
      });

      if (creditError) {
        logger.error('Failed to add credits via RPC (legacy)', { userId, credits, error: creditError.message });
        throw new Error(`Failed to add credits: ${creditError.message}`);
      }

      // Record purchase history
      const { error: historyError } = await supabase
        .from('credit_purchase_history')
        .insert({
          user_id: userId,
          package_id: metadata.packageId,
          credits_purchased: credits,
          amount_paid: (amount_total - discountAmount) / 100,
          discount_percentage: discountAmount > 0 ? (discountAmount / amount_total * 100) : 0,
          discount_reason: promoCode === 'FIRST_PURCHASE' ? 'First purchase discount' : promoCode,
          stripe_payment_intent_id: payment_intent,
          purchase_number: 0 // Will be set by the database function
        });

      if (historyError) {
        logger.warn('Failed to record purchase history (legacy)', { userId, error: historyError.message });
      }

      logger.info('Credit purchase completed (legacy)', { userId, credits, packageId: metadata.packageId });
    }
  }
  // Handle subscription checkout
  else if (metadata.type === 'subscription') {
    logger.info('Subscription checkout completed', { userId });
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  const supabase = createServiceClient();
  
  const { 
    metadata,
    status,
    current_period_end,
    items
  } = subscription;

  const userId = metadata?.userId;
  const teamId = metadata?.teamId;

  // Handle team subscription updates
  if (teamId) {
    const planTier = metadata?.planTier;
    
    // Update team subscription status
    await supabase
      .from('teams')
      .update({
        subscription_tier: planTier || 'free',
        stripe_subscription_id: subscription.id
      })
      .eq('id', teamId);

    // Update max members based on tier
    const maxMembers = {
      'free': 1,
      'creator': 1,
      'professional': 3,
      'agency': 10
    }[planTier] || 1;

    await supabase
      .from('teams')
      .update({ max_members: maxMembers })
      .eq('id', teamId);

    logger.info('Team subscription updated', { teamId, planTier });
    return;
  }

  if (!userId) {
    logger.warn('No user ID in subscription metadata');
    return;
  }

  // Determine plan from price ID
  const priceId = items.data[0]?.price.id;
  const priceInfo = PRICE_TO_CREDITS[priceId];
  
  let planId = 'free';
  let credits = 0;
  
  if (priceInfo) {
    planId = priceInfo.tier;
    credits = priceInfo.credits;
  } else {
    // Legacy handling
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
      planId = 'creator';
      credits = 300;
    } else if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
      planId = 'professional';
      credits = 800;
    } else if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
      planId = 'agency';
      credits = 2000;
    }
  }

  // Update user subscription info
  await supabase
    .from('users')
    .update({
      subscription_status: status,
      subscription_tier: planId, // Use subscription_tier field
      subscription_period_end: new Date(current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id,
      billing_interval: priceInfo?.interval || 'month'
    })
    .eq('id', userId);

  // If subscription is active, grant monthly credits
  if (status === 'active' && credits > 0) {
    await supabase
      .from('users')
      .update({ credits: supabase.raw('credits + ?', [credits]) })
      .eq('id', userId);

    // Record credit grant
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: credits,
        type: 'subscription_grant',
        description: `Monthly credits for ${planId} plan (${credits} credits)`,
        metadata: {
          subscriptionId: subscription.id,
          plan: planId,
          priceId: priceId
        }
      });
    
    logger.info('Subscription credits granted', { userId, credits, planId });
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  const supabase = createServiceClient();
  
  const { metadata } = subscription;
  const userId = metadata?.userId;
  const teamId = metadata?.teamId;

  // Handle team subscription cancellation
  if (teamId) {
    // Downgrade team to free tier
    await supabase
      .from('teams')
      .update({
        subscription_tier: 'free',
        stripe_subscription_id: null,
        max_members: 3
      })
      .eq('id', teamId);

    // Log team activity
    await supabase
      .from('team_activity')
      .insert({
        team_id: teamId,
        user_id: userId,
        activity_type: 'subscription_cancelled',
        entity_type: 'team',
        details: {
          previous_tier: metadata?.planTier || 'unknown'
        }
      });

    logger.info('Team subscription cancelled', { teamId });
    return;
  }

  if (!userId) {
    logger.warn('No user ID in subscription metadata');
    return;
  }

  // Update user to free plan
  await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      subscription_tier: 'free', // Use subscription_tier field
      subscription_period_end: null,
      stripe_subscription_id: null,
      billing_interval: null
    })
    .eq('id', userId);

  // Track subscription cancelled event in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: 'subscription_cancelled',
    properties: {
      previous_tier: metadata?.planTier || 'unknown',
      subscription_id: subscription.id,
    }
  });
  await posthog.shutdown();
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice) {
  const { 
    subscription,
    customer,
    lines
  } = invoice;

  if (!subscription) return;

  // This is for recurring subscription payments
  // Credits are already granted in subscription update
  logger.info('Invoice payment succeeded', { invoiceId: invoice.id });
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  const supabase = createServiceClient();
  
  const { subscription, customer, next_payment_attempt } = invoice;

  if (!subscription) return;

  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customer)
    .single();

  if (user) {
    // Update subscription status
    await supabase
      .from('users')
      .update({ subscription_status: 'past_due' })
      .eq('id', user.id);

    // Send payment failed email
    await emailService.sendPaymentFailedNotification({
      email: user.email,
      name: user.full_name,
      reason: invoice.last_payment_error?.message || 'Payment failed',
      nextAttemptDate: next_payment_attempt ? new Date(next_payment_attempt * 1000) : null
    });

    // Track payment failed event in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: 'payment_failed',
      properties: {
        subscription_id: subscription,
        error_message: invoice.last_payment_error?.message,
        next_retry_date: next_payment_attempt ? new Date(next_payment_attempt * 1000).toISOString() : null,
      }
    });
    await posthog.shutdown();

    logger.info('Payment failed notification sent', { email: user.email });
  }
}