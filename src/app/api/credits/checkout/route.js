import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import stripe from '@/lib/stripe';
import { CREDIT_PACKAGES } from '@/lib/constants';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    const { packageId, promoCode } = await request.json();
    
    // Validate package
    const creditPackage = Object.values(CREDIT_PACKAGES).find(pkg => pkg.id === packageId);
    if (!creditPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Get user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details for discount eligibility
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, first_purchase_date, total_credit_purchases')
      .eq('id', user.id)
      .single();

    if (userError) {
      apiLogger.error('Error fetching user data', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    let discountAmount = 0;
    let appliedPromoCode = null;

    // Check promotional code if provided
    if (promoCode) {
      const { data: promoValidation } = await supabase
        .rpc('validate_promo_code', {
          p_code: promoCode,
          p_user_id: user.id,
          p_credits: creditPackage.credits
        });

      if (promoValidation && promoValidation[0]?.is_valid) {
        const promo = promoValidation[0];
        if (promo.discount_type === 'percentage') {
          discountAmount = Math.round(creditPackage.price * promo.discount_percentage / 100 * 100);
          appliedPromoCode = promoCode;
        }
      }
    }

    // Apply first purchase discount if eligible (20% off)
    if (!userData.first_purchase_date && !appliedPromoCode) {
      discountAmount = Math.round(creditPackage.price * 20 / 100 * 100);
      appliedPromoCode = 'FIRST_PURCHASE';
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userData.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: creditPackage.priceId,
          quantity: 1,
        },
      ],
      discounts: discountAmount > 0 ? [{
        coupon: await createOrGetStripeCoupon(discountAmount, appliedPromoCode)
      }] : undefined,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
      metadata: {
        userId: user.id,
        packageId: creditPackage.id,
        credits: creditPackage.credits,
        promoCode: appliedPromoCode || '',
        discountAmount: discountAmount.toString(),
      },
      allow_promotion_codes: false, // We handle our own promo codes
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    apiLogger.error('Error creating checkout session', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Helper function to create or get Stripe coupon
async function createOrGetStripeCoupon(amountOff, code) {
  const couponId = `${code}_${amountOff}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  try {
    // Try to retrieve existing coupon
    const coupon = await stripe.coupons.retrieve(couponId);
    return coupon.id;
  } catch (error) {
    // Create new coupon if it doesn't exist
    if (error.code === 'resource_missing') {
      const coupon = await stripe.coupons.create({
        id: couponId,
        amount_off: amountOff,
        currency: 'usd',
        duration: 'once',
        name: code === 'FIRST_PURCHASE' ? 'First Purchase Discount' : `Promo: ${code}`,
      });
      return coupon.id;
    }
    throw error;
  }
}