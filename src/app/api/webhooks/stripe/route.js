// Stripe Webhook Handler

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripeService } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/service';
import { PLANS, CREDIT_PACKAGES } from '@/lib/constants';

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
    customer,
    metadata,
    amount_total,
    currency,
    payment_intent
  } = session;

  const userId = metadata?.userId;

  if (!userId) {
    console.error('No user ID in checkout session metadata');
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
    await supabase.rpc('add_credits_with_expiry', {
      p_user_id: userId,
      p_amount: credits,
      p_stripe_payment_intent_id: payment_intent,
      p_stripe_price_id: priceId,
      p_description: `Purchased ${credits} credits`,
      p_discount_applied: discountAmount / 100,
      p_expires_in_months: 12
    });

    // Record purchase history
    await supabase
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

    console.log(`Credit purchase completed: ${credits} credits for user ${userId}`);
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
      await supabase.rpc('add_credits_with_expiry', {
        p_user_id: userId,
        p_amount: credits,
        p_stripe_payment_intent_id: payment_intent,
        p_stripe_price_id: creditPackage.stripePriceId,
        p_description: `Purchased ${creditPackage.name}`,
        p_discount_applied: discountAmount / 100,
        p_expires_in_months: 12
      });

      // Record purchase history
      await supabase
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

      console.log(`Credit purchase completed: ${credits} credits for user ${userId}`);
    }
  }
  // Handle subscription checkout
  else if (metadata.type === 'subscription') {
    // Existing subscription logic would go here
    console.log('Subscription checkout completed');
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
    
    console.log(`Granted ${credits} credits to user ${userId} for ${planId} subscription`);
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
      subscription_tier: 'free', // Use subscription_tier field
      subscription_period_end: null,
      stripe_subscription_id: null,
      billing_interval: null
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