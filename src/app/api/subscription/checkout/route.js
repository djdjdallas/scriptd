import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { PLANS, LAUNCH_CONFIG } from '@/lib/constants';
import stripe from '@/lib/stripe';

export const POST = createApiHandler(async (request) => {
    // Get user from session
    const { user, supabase } = await getAuthenticatedUser();

    // Parse request body
    const { planId, billingPeriod, coupon, metadata } = await request.json();

    // Validate plan
    const plan = PLANS[planId.toUpperCase()];
    if (!plan || plan.id === 'free') {
      throw new ApiError('Invalid plan', 400);
    }

    // Get the appropriate price ID
    const priceId = billingPeriod === 'annual'
      ? plan.stripePriceIdAnnual
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new ApiError('Price not configured', 400);
    }

    // Build checkout session parameters
    const checkoutParams = {
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_period: billingPeriod,
        ...(metadata || {})
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_period: billingPeriod,
        },
      },
    };

    // Add coupon if launch special is enabled, otherwise allow manual promotion codes
    if (LAUNCH_CONFIG.enabled && coupon) {
      checkoutParams.discounts = [{
        coupon: coupon,
      }];
    } else {
      checkoutParams.allow_promotion_codes = true;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(checkoutParams);

    return {
      sessionId: session.id,
      url: session.url,
    };
});