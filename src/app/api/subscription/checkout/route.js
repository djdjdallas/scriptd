import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PLANS, LAUNCH_CONFIG } from '@/lib/constants';
import stripe from '@/lib/stripe';

export async function POST(request) {
  try {
    // Get user from session
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { planId, billingPeriod, coupon, metadata } = await request.json();

    // Validate plan
    const plan = PLANS[planId.toUpperCase()];
    if (!plan || plan.id === 'free') {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get the appropriate price ID
    const priceId = billingPeriod === 'annual'
      ? plan.stripePriceIdAnnual
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured' },
        { status: 400 }
      );
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
      allow_promotion_codes: true,
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

    // Add coupon if launch special is enabled and provided
    if (LAUNCH_CONFIG.enabled && coupon) {
      checkoutParams.discounts = [{
        coupon: coupon,
      }];
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}