// File: /src/lib/admin/revenue-service.js
// Purpose: Revenue analytics service with Stripe integration
// This service fetches real revenue data from Stripe and calculates business metrics

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/client';

// Initialize Stripe with secret key
// The secret key allows us to access sensitive customer and payment data
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class RevenueService {
  constructor() {
    this.supabase = createClient();
    // Cache revenue data for 5 minutes to avoid hitting Stripe rate limits
    this.cache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Get comprehensive revenue metrics from Stripe
   * Includes MRR, ARR, growth rates, and subscription breakdowns
   */
  async getRevenueMetrics() {
    try {
      // Check cache first to avoid unnecessary Stripe API calls
      const cacheKey = 'revenue_metrics';
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      // Fetch all active subscriptions from Stripe
      // Active subscriptions = currently paying customers
      const activeSubscriptions = await this.getActiveSubscriptions();

      // Calculate Monthly Recurring Revenue (MRR)
      // MRR = total monthly revenue from all active subscriptions
      const mrr = this.calculateMRR(activeSubscriptions);

      // Calculate Annual Recurring Revenue (ARR)
      // ARR = MRR × 12 (predictable yearly revenue)
      const arr = mrr * 12;

      // Get revenue growth compared to last month
      const growth = await this.calculateRevenueGrowth();

      // Get total all-time revenue from successful payments
      const totalRevenue = await this.getTotalRevenue();

      // Calculate customer metrics
      const activeSubscriptionCount = activeSubscriptions.length;
      const averageRevenuePerUser = activeSubscriptionCount > 0
        ? mrr / activeSubscriptionCount
        : 0;

      // Calculate churn rate (% of customers leaving per month)
      const churnRate = await this.calculateChurnRate();

      // Calculate Customer Lifetime Value (CLV)
      // CLV = average revenue ÷ churn rate (how much a customer is worth)
      const clv = churnRate > 0 ? averageRevenuePerUser / (churnRate / 100) : 0;

      // Get revenue breakdown by subscription plan
      const byPlan = await this.getRevenueByPlan(activeSubscriptions);

      // Get recent revenue trend (last 30 days)
      const revenueTrend = await this.getRevenueTrend();

      const metrics = {
        mrr: Math.round(mrr * 100) / 100, // Round to 2 decimal places
        arr: Math.round(arr * 100) / 100,
        growth: Math.round(growth * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeSubscriptions: activeSubscriptionCount,
        churnRate: Math.round(churnRate * 100) / 100,
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
        clv: Math.round(clv * 100) / 100,
        byPlan,
        revenueTrend,
        lastUpdated: new Date()
      };

      // Cache the results to reduce API calls
      this.cache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      });

      return metrics;
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      // Return zero metrics instead of throwing to prevent dashboard crashes
      return {
        mrr: 0,
        arr: 0,
        growth: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        churnRate: 0,
        averageRevenuePerUser: 0,
        clv: 0,
        byPlan: {},
        revenueTrend: [],
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get all active subscriptions from Stripe
   * Uses pagination to handle accounts with many subscriptions
   */
  async getActiveSubscriptions() {
    try {
      const subscriptions = [];
      let hasMore = true;
      let startingAfter = undefined;

      // Stripe returns max 100 items per request, so we paginate
      while (hasMore) {
        const response = await stripe.subscriptions.list({
          status: 'active', // Only get currently active subscriptions
          limit: 100, // Max allowed by Stripe
          starting_after: startingAfter // For pagination
        });

        subscriptions.push(...response.data);
        hasMore = response.has_more;

        if (hasMore && response.data.length > 0) {
          // Use last item's ID for next page
          startingAfter = response.data[response.data.length - 1].id;
        }
      }

      return subscriptions;
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      return [];
    }
  }

  /**
   * Calculate Monthly Recurring Revenue from active subscriptions
   * MRR is the predictable monthly revenue from subscriptions
   */
  calculateMRR(subscriptions) {
    return subscriptions.reduce((total, sub) => {
      // Get the subscription price
      const price = sub.items.data[0]?.price;
      if (!price) return total;

      // Amount is in cents, so divide by 100 to get dollars
      let monthlyAmount = price.unit_amount / 100;

      // If it's a yearly subscription, divide by 12 to get monthly value
      if (price.recurring?.interval === 'year') {
        monthlyAmount = monthlyAmount / 12;
      }

      return total + monthlyAmount;
    }, 0);
  }

  /**
   * Calculate revenue growth compared to last month
   * Returns percentage change (positive = growth, negative = decline)
   */
  async calculateRevenueGrowth() {
    try {
      // Get current month date range
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get last month date range
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get invoices for current month
      const currentMonthInvoices = await stripe.invoices.list({
        created: {
          gte: Math.floor(currentMonthStart.getTime() / 1000)
        },
        status: 'paid',
        limit: 100
      });

      // Get invoices for last month
      const lastMonthInvoices = await stripe.invoices.list({
        created: {
          gte: Math.floor(lastMonthStart.getTime() / 1000),
          lte: Math.floor(lastMonthEnd.getTime() / 1000)
        },
        status: 'paid',
        limit: 100
      });

      // Calculate total revenue for each month
      const currentMonthRevenue = currentMonthInvoices.data.reduce(
        (sum, inv) => sum + (inv.amount_paid / 100),
        0
      );
      const lastMonthRevenue = lastMonthInvoices.data.reduce(
        (sum, inv) => sum + (inv.amount_paid / 100),
        0
      );

      // Calculate percentage growth
      if (lastMonthRevenue === 0) return currentMonthRevenue > 0 ? 100 : 0;

      const growth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      return growth;
    } catch (error) {
      console.error('Error calculating revenue growth:', error);
      return 0;
    }
  }

  /**
   * Get total all-time revenue from Stripe
   * Sums up all successful payments ever made
   */
  async getTotalRevenue() {
    try {
      // Get all paid invoices (no date filter = all time)
      const invoices = await stripe.invoices.list({
        status: 'paid',
        limit: 100 // You may need to paginate for large volumes
      });

      // Sum up all paid amounts (convert from cents to dollars)
      const total = invoices.data.reduce(
        (sum, invoice) => sum + (invoice.amount_paid / 100),
        0
      );

      return total;
    } catch (error) {
      console.error('Error fetching total revenue:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly churn rate
   * Churn = percentage of customers who canceled in the last 30 days
   */
  async calculateChurnRate() {
    try {
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

      // Get canceled subscriptions in last 30 days
      const canceledSubs = await stripe.subscriptions.list({
        status: 'canceled',
        created: { gte: thirtyDaysAgo },
        limit: 100
      });

      // Get total active subscriptions
      const activeSubs = await stripe.subscriptions.list({
        status: 'active',
        limit: 1 // We only need the count
      });

      const totalCustomers = activeSubs.data.length + canceledSubs.data.length;
      if (totalCustomers === 0) return 0;

      // Churn rate = (canceled / total) × 100
      const churnRate = (canceledSubs.data.length / totalCustomers) * 100;
      return churnRate;
    } catch (error) {
      console.error('Error calculating churn rate:', error);
      return 0;
    }
  }

  /**
   * Get revenue breakdown by subscription plan
   * Shows which plans are generating the most revenue
   */
  async getRevenueByPlan(subscriptions) {
    try {
      const planRevenue = {};

      subscriptions.forEach(sub => {
        const price = sub.items.data[0]?.price;
        if (!price) return;

        // Get plan name from price nickname or product name
        const planName = price.nickname || price.product?.name || 'Unknown';

        // Calculate monthly revenue for this subscription
        let monthlyAmount = price.unit_amount / 100;
        if (price.recurring?.interval === 'year') {
          monthlyAmount = monthlyAmount / 12;
        }

        // Add to plan totals
        if (!planRevenue[planName]) {
          planRevenue[planName] = {
            count: 0,
            mrr: 0
          };
        }

        planRevenue[planName].count += 1;
        planRevenue[planName].mrr += monthlyAmount;
      });

      // Round all MRR values
      Object.keys(planRevenue).forEach(plan => {
        planRevenue[plan].mrr = Math.round(planRevenue[plan].mrr * 100) / 100;
      });

      return planRevenue;
    } catch (error) {
      console.error('Error getting revenue by plan:', error);
      return {};
    }
  }

  /**
   * Get revenue trend for the last 30 days
   * Returns daily revenue data for charting
   */
  async getRevenueTrend() {
    try {
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

      // Get all paid invoices from last 30 days
      const invoices = await stripe.invoices.list({
        created: { gte: thirtyDaysAgo },
        status: 'paid',
        limit: 100
      });

      // Group by date
      const dailyRevenue = {};

      invoices.data.forEach(invoice => {
        const date = new Date(invoice.created * 1000).toISOString().split('T')[0];
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = 0;
        }
        dailyRevenue[date] += invoice.amount_paid / 100;
      });

      // Convert to array format for charts
      return Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({
          date,
          revenue: Math.round(revenue * 100) / 100
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      return [];
    }
  }

  /**
   * Get payment success/failure rates
   * Helps identify payment processing issues
   */
  async getPaymentMetrics() {
    try {
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

      // Get all payment intents from last 30 days
      const paymentIntents = await stripe.paymentIntents.list({
        created: { gte: thirtyDaysAgo },
        limit: 100
      });

      const total = paymentIntents.data.length;
      const successful = paymentIntents.data.filter(
        pi => pi.status === 'succeeded'
      ).length;
      const failed = paymentIntents.data.filter(
        pi => pi.status === 'requires_payment_method' || pi.status === 'canceled'
      ).length;

      return {
        total,
        successful,
        failed,
        successRate: total > 0 ? (successful / total) * 100 : 0,
        failureRate: total > 0 ? (failed / total) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching payment metrics:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        failureRate: 0
      };
    }
  }

  /**
   * Clear the revenue metrics cache
   * Useful when you need fresh data immediately
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export a singleton instance
export const revenueService = new RevenueService();
export default revenueService;
