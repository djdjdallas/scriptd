import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'
import { checkTeamPermission } from '@/lib/teams/permissions'
import { getStripeService } from '@/lib/stripe/client'

const TEAM_PLANS = {
  free: {
    maxMembers: 1,
    priceId: null,
    monthlyPrice: 0,
    credits: 50,
    features: [
      '50 free credits',
      'Personal use only',
      'Fast generation only',
      'Basic export formats',
      'Community support'
    ]
  },
  creator: {
    maxMembers: 1,
    priceId: process.env.STRIPE_PRICE_CREATOR_MONTHLY,
    monthlyPrice: 39,
    credits: 300,
    features: [
      '300 credits/month',
      'Fast & Professional quality',
      '3 channels',
      'Voice profiles',
      'All export formats',
      'Priority email support'
    ]
  },
  professional: {
    maxMembers: 3,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    monthlyPrice: 79,
    credits: 800,
    features: [
      '800 credits/month',
      'All quality tiers',
      '10 channels',
      'Team seats (3)',
      'Priority support',
      'Advanced analytics'
    ]
  },
  agency: {
    maxMembers: 10,
    priceId: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    monthlyPrice: 199,
    credits: 2000,
    features: [
      '2000 credits/month',
      'Unlimited channels',
      'Team seats (10)',
      'White label option',
      'Dedicated support',
      'Custom integrations'
    ]
  }
}

async function requireAuth() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    throw new Error('Unauthorized')
  }
  
  return { session, supabase }
}

export async function GET(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId } = params

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'admin')
    if (!hasAccess.allowed) {
      throw new Error(hasAccess.error)
    }

    const { data: team } = await supabase
      .from('teams')
      .select('subscription_tier, stripe_subscription_id, stripe_customer_id, billing_email')
      .eq('id', teamId)
      .single()

    const currentPlan = TEAM_PLANS[team.subscription_tier] || TEAM_PLANS.free

    let subscription = null
    if (team.stripe_subscription_id) {
      const stripeService = getStripeService()
      try {
        subscription = await stripeService.stripe.subscriptions.retrieve(team.stripe_subscription_id)
      } catch (error) {
        console.error('Failed to retrieve subscription:', error)
      }
    }

    return NextResponse.json({
      currentPlan: {
        tier: team.subscription_tier,
        ...currentPlan
      },
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      } : null,
      availablePlans: TEAM_PLANS,
      billingEmail: team.billing_email
    })
  })
}

export async function POST(request, { params }) {
  return apiHandler(async () => {
    const { session, supabase } = await requireAuth()
    const { teamId } = params
    const body = await request.json()
    const { action, planTier, returnUrl } = body

    const hasAccess = await checkTeamPermission(supabase, session.user.id, teamId, 'owner')
    if (!hasAccess.allowed) {
      throw new Error('Only team owners can manage billing')
    }

    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    const stripeService = getStripeService()

    if (action === 'upgrade') {
      const plan = TEAM_PLANS[planTier]
      if (!plan || !plan.priceId) {
        throw new Error('Invalid plan selected')
      }

      let customerId = team.stripe_customer_id

      if (!customerId) {
        const customer = await stripeService.stripe.customers.create({
          email: team.billing_email || session.user.email,
          metadata: {
            teamId: teamId,
            teamName: team.name
          }
        })
        customerId = customer.id

        await supabase
          .from('teams')
          .update({ stripe_customer_id: customerId })
          .eq('id', teamId)
      }

      const checkoutSession = await stripeService.stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: plan.priceId,
          quantity: 1
        }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/teams/${teamId}/settings?billing=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/teams/${teamId}/settings?billing=cancelled`,
        metadata: {
          teamId: teamId,
          planTier: planTier
        },
        subscription_data: {
          metadata: {
            teamId: teamId,
            planTier: planTier
          },
          trial_period_days: planTier === 'starter' ? 14 : undefined
        }
      })

      return NextResponse.json({
        checkoutUrl: checkoutSession.url
      })
    }

    if (action === 'manage') {
      if (!team.stripe_customer_id) {
        throw new Error('No billing account found')
      }

      const portalSession = await stripeService.stripe.billingPortal.sessions.create({
        customer: team.stripe_customer_id,
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/teams/${teamId}/settings`
      })

      return NextResponse.json({
        portalUrl: portalSession.url
      })
    }

    if (action === 'cancel') {
      if (!team.stripe_subscription_id) {
        throw new Error('No active subscription found')
      }

      const subscription = await stripeService.stripe.subscriptions.update(
        team.stripe_subscription_id,
        {
          cancel_at_period_end: true
        }
      )

      await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: session.user.id,
          activity_type: 'subscription_cancelled',
          details: {
            cancel_at: new Date(subscription.current_period_end * 1000).toISOString()
          }
        })

      return NextResponse.json({
        message: 'Subscription will be cancelled at the end of the current billing period',
        cancelAt: new Date(subscription.current_period_end * 1000)
      })
    }

    throw new Error('Invalid action')
  })
}