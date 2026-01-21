/**
 * Marketing Pricing Data
 *
 * Centralized pricing configuration for all marketing pages.
 * Imports from constants.js to ensure single source of truth.
 */

import { PLANS } from '@/lib/constants';

// Pricing tiers for marketing pages
export const PRICING_TIERS = {
  creator: {
    name: 'Creator',
    price: PLANS.CREATOR.price, // $39
    priceAnnual: PLANS.CREATOR.priceAnnual,
    credits: PLANS.CREATOR.credits, // 300
    features: [
      '300 credits/month',
      '30-100 scripts/month',
      '3 channels',
      'Voice profiles',
      'All export formats',
      'Priority email support'
    ],
    href: '/signup?plan=creator',
    popular: true
  },
  professional: {
    name: 'Professional',
    price: PLANS.PROFESSIONAL.price, // $79
    priceAnnual: PLANS.PROFESSIONAL.priceAnnual,
    credits: PLANS.PROFESSIONAL.credits, // 800
    features: [
      '800 credits/month',
      '80-260 scripts/month',
      'Professional & Hollywood quality',
      '10 channels',
      'Team seats (3)',
      'Priority support',
      'Advanced analytics'
    ],
    href: '/signup?plan=professional'
  },
  agency: {
    name: 'Agency',
    price: PLANS.AGENCY.price, // $199
    priceAnnual: PLANS.AGENCY.priceAnnual,
    credits: PLANS.AGENCY.credits, // 2000
    features: [
      '2000 credits/month',
      '200-600+ scripts/month',
      'Professional & Hollywood quality',
      'Unlimited channels',
      'Team seats (10)',
      'White label option',
      'Dedicated support',
      'Custom integrations'
    ],
    href: '/contact'
  }
};

// Promotional offers for competitor switch pages
export const PROMOTIONAL_OFFERS = {
  jasper: {
    code: 'SWITCH50',
    description: '3 months free when switching from Jasper',
    duration: '3 months',
    signupUrl: '/signup?source=jasper-switch&offer=3months'
  },
  subscribr: {
    code: 'SWITCH50',
    description: '3 months free when switching from Subscribr',
    duration: '3 months',
    signupUrl: '/signup?source=subscribr-switch&offer=3months'
  },
  businessEducators: {
    discount: 50,
    description: '50% off first 3 months for business educators',
    duration: '3 months',
    signupUrl: '/signup?source=business-educator&discount=50'
  }
};

// Helper to format price display
export function formatPrice(price) {
  return `$${price}/mo`;
}

// Helper to get pricing tier by name
export function getPricingTier(tierName) {
  return PRICING_TIERS[tierName.toLowerCase()] || null;
}
