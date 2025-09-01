// Credit Purchase API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { getStripeService, CREDIT_PACKAGES } from '@/lib/stripe/client';

// POST /api/credits/purchase - Create Stripe checkout session for credit purchase
export const POST = createApiHandler(async (req) => {
  const { user } = await getAuthenticatedUser();

  const { packageId, successUrl, cancelUrl } = await req.json();

  if (!packageId) {
    throw new ApiError('Package ID is required', 400);
  }

  // Validate package
  const creditPackage = CREDIT_PACKAGES.find(p => p.id === packageId);
  if (!creditPackage) {
    throw new ApiError('Invalid credit package', 400);
  }

  // Default URLs if not provided
  const success = successUrl || `${process.env.NEXTAUTH_URL}/dashboard/billing?purchase=success`;
  const cancel = cancelUrl || `${process.env.NEXTAUTH_URL}/dashboard/billing?purchase=cancelled`;

  try {
    const stripeService = getStripeService();
    
    // Create Stripe checkout session
    const checkoutSession = await stripeService.createCreditsCheckout(
      user.id,
      packageId,
      success,
      cancel
    );

    return {
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      package: {
        id: creditPackage.id,
        credits: creditPackage.credits,
        price: creditPackage.price
      }
    };

  } catch (error) {
    console.error('Credit purchase error:', error);
    throw new ApiError('Failed to create checkout session', 500);
  }
});