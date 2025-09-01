// Stripe Webhook Handler

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripeService } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/service';
import { PLANS } from '@/lib/constants';

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

  try {
    const stripeService = getStripeService();
    const event = await stripeService.handleWebhook(body, signature);

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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// Handle successful checkout
async function handleCheckoutComplete(session) {
  const supabase = createServiceClient();
  
  const { 
    client_reference_id: userId,
    customer,
    metadata,
    amount_total,
    currency
  } = session;

  if (!userId) {
    console.error('No user ID in checkout session');
    return;
  }

  // Update user's Stripe customer ID
  
  if (customer) {
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer })
      .eq('id', userId);
  }

  // Handle credit purchase
  if (metadata.type === 'credits') {
    const credits = parseInt(metadata.credits);
    
    // Add credits to user
    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({ credits: (user.credits || 0) + credits })
        .eq('id', userId);

      // Record transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: credits,
          type: 'purchase',
          description: `Purchased ${credits} credits`,
          metadata: {
            stripeSessionId: session.id,
            amount: amount_total / 100,
            currency
          }
        });
    }
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  const supabase = createServiceClient();
  
  const { 
    metadata: { userId },
    status,
    current_period_end,
    items
  } = subscription;

  if (!userId) {
    console.error('No user ID in subscription');
    return;
  }

  // Determine plan from price ID
  const priceId = items.data[0]?.price.id;
  let planId = 'free';
  
  // Match price ID to plan (would use PRICE_IDS in production)
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
    planId = 'starter';
  } else if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
    planId = 'professional';
  }

  const plan = PLANS[planId.toUpperCase()];

  // Update user subscription info
  await supabase
    .from('users')
    .update({
      subscription_status: status,
      subscription_plan: planId,
      subscription_period_end: new Date(current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id
    })
    .eq('id', userId);

  // If subscription is active, grant monthly credits
  if (status === 'active' && plan.credits) {
    await supabase
      .from('users')
      .update({ credits: supabase.raw('credits + ?', [plan.credits]) })
      .eq('id', userId);

    // Record credit grant
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: plan.credits,
        type: 'subscription_grant',
        description: `Monthly credits for ${plan.name} plan`,
        metadata: {
          subscriptionId: subscription.id,
          plan: planId
        }
      });
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  const supabase = createServiceClient();
  
  const { metadata: { userId } } = subscription;

  if (!userId) {
    console.error('No user ID in subscription');
    return;
  }

  // Update user to free plan
  await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      subscription_plan: 'free',
      subscription_period_end: null,
      stripe_subscription_id: null
    })
    .eq('id', userId);
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
  console.log('Invoice payment succeeded:', invoice.id);
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  const supabase = createServiceClient();
  
  const { subscription, customer } = invoice;

  if (!subscription) return;

  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customer)
    .single();

  if (user) {
    // Update subscription status
    await supabase
      .from('users')
      .update({ subscription_status: 'past_due' })
      .eq('id', user.id);

    // TODO: Send payment failed email
    console.log('Payment failed for user:', user.email);
  }
}