// Stripe Client Configuration

import Stripe from 'stripe';
import { PLANS } from '../constants.js';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Get price ID based on plan and billing period
export function getPriceId(planId, isAnnual = false) {
  const plan = PLANS[planId.toUpperCase()];
  if (!plan) return null;
  
  return isAnnual ? plan.stripePriceAnnual : plan.stripePriceMonthly;
}

// Credit packages
export const CREDIT_PACKAGES = [
  {
    id: 'credits_50',
    credits: 50,
    price: 5,
    priceId: PRICE_IDS.credits_50,
    popular: false
  },
  {
    id: 'credits_100',
    credits: 100,
    price: 9,
    priceId: PRICE_IDS.credits_100,
    popular: true,
    savings: '10%'
  },
  {
    id: 'credits_500',
    credits: 500,
    price: 40,
    priceId: PRICE_IDS.credits_500,
    popular: false,
    savings: '20%'
  }
];

// Stripe service class
export class StripeService {
  // Create checkout session for subscription
  async createSubscriptionCheckout(userId, planId, isAnnual = false, successUrl, cancelUrl) {
    const plan = PLANS[planId.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const priceId = getPriceId(planId, isAnnual);
    if (!priceId) {
      throw new Error('Price not configured for this plan');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer_email: await this.getCustomerEmail(userId),
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        type: 'subscription'
      },
      subscription_data: {
        metadata: {
          userId,
          planId
        }
      },
      allow_promotion_codes: true
    });

    return session;
  }

  // Create checkout session for credit purchase
  async createCreditsCheckout(userId, packageId, successUrl, cancelUrl) {
    const creditPackage = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!creditPackage) {
      throw new Error('Invalid credit package');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: creditPackage.priceId,
        quantity: 1,
      }],
      customer_email: await this.getCustomerEmail(userId),
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        packageId,
        credits: creditPackage.credits,
        type: 'credits'
      }
    });

    return session;
  }

  // Create customer portal session
  async createPortalSession(customerId, returnUrl) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  // Get or create Stripe customer
  async getOrCreateCustomer(userId, email, name) {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId
      }
    });

    return customer;
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    return subscription;
  }

  // Reactivate subscription
  async reactivateSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false
      }
    );

    return subscription;
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  }

  // Process webhook events
  async handleWebhook(rawBody, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    return event;
  }

  // Helper: Get customer email
  async getCustomerEmail(userId) {
    // This would fetch from your database
    // Placeholder for now
    return null;
  }

  // Calculate proration for plan changes
  async calculateProration(subscriptionId, newPriceId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const items = [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }];

    const preview = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer,
      subscription: subscriptionId,
      subscription_items: items,
      subscription_proration_behavior: 'create_prorations',
    });

    return {
      amountDue: preview.amount_due / 100, // Convert from cents
      currency: preview.currency,
      nextPaymentDate: new Date(preview.period_end * 1000)
    };
  }
}

// Singleton instance
let stripeServiceInstance;

export function getStripeService() {
  if (!stripeServiceInstance) {
    stripeServiceInstance = new StripeService();
  }
  return stripeServiceInstance;
}