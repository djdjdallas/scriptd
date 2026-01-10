import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { PLANS, LAUNCH_CONFIG } from '@/lib/constants';
import stripe from '@/lib/stripe';
import { apiLogger } from '@/lib/monitoring/logger';

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

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

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
      success_url: `${baseUrl}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
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
      // Try to apply the coupon, but if it fails, continue without it
      try {
        // First verify the coupon exists
        const couponCheck = await stripe.coupons.retrieve(coupon);
        if (couponCheck && couponCheck.valid) {
          checkoutParams.discounts = [{
            coupon: coupon,
          }];
        } else {
          apiLogger.warn('Coupon is not valid, continuing without discount', { coupon });
          checkoutParams.allow_promotion_codes = true;
        }
      } catch (couponError) {
        // If coupon doesn't exist or there's an error, continue without it
        apiLogger.warn('Coupon error', { coupon, error: couponError.message });
        checkoutParams.allow_promotion_codes = true;
      }
    } else {
      checkoutParams.allow_promotion_codes = true;
    }

    // Create Stripe checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create(checkoutParams);
    } catch (stripeError) {
      apiLogger.error('Stripe session creation error', stripeError, { userId: user.id, planId });
      throw new ApiError(
        `Failed to create checkout session: ${stripeError.message}`,
        500
      );
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
});