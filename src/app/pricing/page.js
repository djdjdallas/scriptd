"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  PLANS,
  CREDIT_PACKAGES,
  MODEL_TIERS,
  calculateScriptCost,
  CREDIT_COSTS,
} from "@/lib/constants";
import { getScriptEstimates } from "@/lib/subscription-helpers";
import { loadStripe } from "@stripe/stripe-js";
import { TiltCard } from "@/components/ui/tilt-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Check,
  X,
  Sparkles,
  CreditCard,
  Zap,
  Trophy,
  TrendingUp,
  Users,
  Shield,
  Rocket,
  Star,
  ArrowRight,
  Crown,
  ChevronRight,
  Coins,
  Gem,
  Gift,
  Clock,
  Calculator,
  FileText,
} from "lucide-react";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function PricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = async (planId) => {
    setLoading(true);
    setSelectedPlan(planId);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/signup");
        return;
      }

      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!stripePromise) {
        throw new Error("Stripe is not configured");
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const plans = Object.values(PLANS); // Show all plans including FREE

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -left-48 opacity-10" />
        <div
          className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -right-48 opacity-10"
          style={{ animationDelay: "10s" }}
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      {/* Navigation */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-purple-400 neon-glow" />
              <span className="text-2xl font-bold gradient-text">
                GenScript
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button className="glass-button text-white">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="glass-button bg-purple-500/20 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 text-center animate-reveal">
        <div className="inline-flex items-center justify-center glass px-4 py-2 rounded-full mb-6">
          <Sparkles className="h-4 w-4 mr-2 text-yellow-400 animate-pulse" />
          <span className="text-purple-300 font-medium">
            Simple, Transparent Pricing
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Start creating amazing YouTube scripts for free or scale up with our
          professional plans. Generate high-quality video scripts in minutes,
          not hours.
        </p>
      </div>

      {/* Billing Toggle */}
      <div
        className="flex justify-center mb-12 animate-reveal"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="glass-card p-2 rounded-xl">
          <div className="flex gap-2">
            <Button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-lg transition-all ${
                billingPeriod === "monthly"
                  ? "glass bg-purple-500/20 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </Button>
            <Button
              onClick={() => setBillingPeriod("annual")}
              className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                billingPeriod === "annual"
                  ? "glass bg-purple-500/20 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Annual
              <Badge className="glass px-2 py-0.5 text-xs text-green-300">
                Save 20%
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="max-w-7xl mx-auto px-4 mb-20 overflow-visible">
        <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-purple-400" />
          Subscription Plans
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const price =
              billingPeriod === "annual"
                ? (plan.priceAnnual || plan.price * 12) / 12
                : plan.price;
            const isPopular = plan.popular || plan.id === "creator";

            return (
              <TiltCard key={plan.id}>
                <div
                  className={`glass-card h-full relative overflow-visible ${
                    isPopular ? "ring-2 ring-purple-400" : ""
                  } animate-reveal`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  {isPopular && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 glass px-4 py-1 rounded-full z-10 whitespace-nowrap bg-purple-500/20 border border-purple-400/50">
                      <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 pt-12">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">
                        {plan.name}
                      </h3>
                      {plan.id === "agency" && (
                        <Crown className="h-5 w-5 text-yellow-400" />
                      )}
                      {plan.id === "professional" && (
                        <Trophy className="h-5 w-5 text-purple-400" />
                      )}
                      {plan.id === "creator" && (
                        <Rocket className="h-5 w-5 text-blue-400" />
                      )}
                      {plan.id === "free" && (
                        <Zap className="h-5 w-5 text-green-400" />
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold gradient-text">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-400">
                        /{billingPeriod === "annual" ? "mo" : "month"}
                      </span>
                    </div>

                    {billingPeriod === "annual" && plan.priceAnnual && (
                      <p className="text-sm text-gray-500 mt-1">
                        ${plan.priceAnnual.toFixed(2)} billed annually
                      </p>
                    )}

                    <div className="mt-4 mb-6">
                      <div className="flex items-center gap-2 glass p-3 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <span className="text-white font-semibold">
                          {plan.scriptsEstimate ||
                            `${plan.credits} credits/month`}
                        </span>
                      </div>
                      {plan.credits && (
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {plan.credits} credits included
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() =>
                        plan.id === "free"
                          ? router.push("/auth/signup")
                          : handleSubscribe(plan.id)
                      }
                      disabled={loading && plan.id !== "free"}
                      className={`w-full glass-button ${
                        isPopular
                          ? "bg-gradient-to-r from-purple-500/50 to-pink-500/50"
                          : plan.id === "free"
                          ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30"
                          : ""
                      } text-white`}
                    >
                      {loading &&
                      selectedPlan === plan.id &&
                      plan.id !== "free" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.id === "free" ? "Start Free" : "Get Started"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Script Generation Calculator */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div
          className="glass-card p-8 animate-reveal"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8 text-purple-400 neon-glow" />
              Script Generation Estimates
              <FileText className="h-8 w-8 text-yellow-400" />
            </h2>
            <p className="text-gray-300">
              See how many scripts you can generate with each plan or credit
              package
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Subscription Plans Estimates */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Monthly Subscriptions
              </h3>
              <div className="space-y-3">
                {plans.map((plan) => {
                  if (!plan.credits) return null;
                  const fastEstimates = getScriptEstimates(
                    plan.credits,
                    "FAST"
                  );
                  const balancedEstimates = getScriptEstimates(
                    plan.credits,
                    "BALANCED"
                  );
                  const premiumEstimates = getScriptEstimates(
                    plan.credits,
                    "PREMIUM"
                  );

                  return (
                    <div key={plan.id} className="glass p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">
                          {plan.name}
                        </span>
                        <Badge className="glass text-purple-300">
                          {plan.credits === null
                            ? "Unlimited"
                            : `${plan.credits} credits/mo`}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400">⚡ Fast</p>
                          <p className="text-white font-bold">
                            {plan.credits === null ? "∞" : fastEstimates.range}{" "}
                            scripts
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">⭐ Professional</p>
                          <p className="text-white font-bold">
                            {plan.credits === null
                              ? "∞"
                              : balancedEstimates.range}{" "}
                            scripts
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">💎 Premium</p>
                          <p className="text-white font-bold">
                            {plan.credits === null
                              ? "∞"
                              : premiumEstimates.range}{" "}
                            scripts
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credit Packages Estimates */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                One-Time Credit Packages
              </h3>
              <div className="space-y-3">
                {Object.values(CREDIT_PACKAGES).map((pkg) => {
                  const fastEstimates = getScriptEstimates(pkg.credits, "FAST");
                  const balancedEstimates = getScriptEstimates(
                    pkg.credits,
                    "BALANCED"
                  );
                  const premiumEstimates = getScriptEstimates(
                    pkg.credits,
                    "PREMIUM"
                  );

                  return (
                    <div key={pkg.id} className="glass p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">
                          {pkg.credits} Credits
                        </span>
                        <Badge className="glass text-yellow-300">
                          {formatPrice(pkg.price)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400">⚡ Fast</p>
                          <p className="text-white font-bold">
                            {fastEstimates.range} scripts
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">⭐ Professional</p>
                          <p className="text-white font-bold">
                            {balancedEstimates.range} scripts
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">💎 Premium</p>
                          <p className="text-white font-bold">
                            {premiumEstimates.range} scripts
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Alert className="mt-6 glass-card border-purple-500/30 bg-purple-500/10">
            <Calculator className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-300">
              <strong>Note:</strong> Script generation costs vary by quality
              tier and length. These are estimates based on average usage. ⚡
              Fast: 3-11 credits, ⭐ Professional: 8-28 credits, 💎 Premium:
              15-53 credits per script.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Credit Packages - Coming Soon */}
      {/* <div className="max-w-7xl mx-auto px-4 py-20 border-t border-white/10 relative">
        <div className="text-center mb-12 animate-reveal opacity-50">
          <h2 className="text-3xl font-bold text-gray-500 mb-4 flex items-center justify-center gap-3">
            <CreditCard className="h-8 w-8 text-gray-600" />
            Need More Scripts?
            <Sparkles className="h-6 w-6 text-gray-600" />
          </h2>
          <p className="text-gray-500">
            Purchase script credits anytime. No subscription required.
          </p>
          <div className="mt-4">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400 text-lg px-4 py-2">
              <Clock className="h-4 w-4 mr-2 inline" />
              Coming Soon
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto opacity-30 pointer-events-none">
          {Object.values(CREDIT_PACKAGES).map((pkg, index) => {
            const iconMap = {
              starter: Zap,
              popular: Gem,
              bulk: Crown,
            };
            const Icon = iconMap[pkg.id.toLowerCase()] || CreditCard;
            const colorMap = {
              starter: "from-blue-500/20",
              popular: "from-purple-500/20",
              bulk: "from-yellow-500/20",
            };

            return (
              <div key={pkg.id}>
                <div
                  className={`glass-card h-full relative overflow-visible grayscale animate-reveal`}
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  {pkg.badge && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 glass px-4 py-1 rounded-full z-10 whitespace-nowrap bg-gray-500/20 border border-gray-600/50">
                      <span className="text-xs text-gray-400 font-semibold">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-6 pt-12 text-center">
                    <div
                      className={`w-16 h-16 glass rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-gray-500/20 to-transparent`}
                    >
                      <Icon className="h-8 w-8 text-gray-500" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-500 mb-2">
                      {pkg.name}
                    </h3>

                    <div className="mb-2">
                      <p className="text-3xl font-bold text-gray-500">
                        {formatPrice(pkg.price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {pkg.credits} credits
                      </p>
                    </div>

                    <div className="mb-2 glass p-2 rounded-lg">
                      <p className="text-sm text-gray-500 font-medium">
                        {pkg.scripts}
                      </p>
                    </div>

                    <div className="mb-4">
                      <Badge className="glass text-xs text-gray-500">
                        {pkg.savings}
                      </Badge>
                    </div>

                    <Button
                      className="w-full glass-button text-gray-500 cursor-not-allowed"
                      disabled
                    >
                      Coming Soon
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div> */}

      {/* Competitor Comparison */}
      <div className="max-w-7xl mx-auto px-4 py-20 border-t border-white/10">
        <div className="text-center mb-12 animate-reveal">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            Why Choose GenScript?
            <Trophy className="h-8 w-8 text-yellow-400" />
          </h2>
          <p className="text-gray-300">
            We offer 2.5x more value than our competitors
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Our Value */}
          <div className="glass-card p-8 animate-reveal border-2 border-green-500/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-green-300 mb-2 flex items-center justify-center gap-2">
                <Star className="h-6 w-6" />
                GenScript Value
              </h3>
            </div>

            <div className="space-y-4">
              <div className="glass p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">POPULAR Pack</span>
                  <Badge className="glass bg-green-500/20 text-green-300">
                    Best Value
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-green-300">
                    {formatPrice(49)}
                  </p>
                  <p className="text-gray-300">300 credits = 30-100 scripts</p>
                  <p className="text-sm text-gray-400">
                    ~$0.49-1.63 per script
                  </p>
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">CREATOR Plan</span>
                  <Badge className="glass bg-purple-500/20 text-purple-300">
                    Most Popular
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-green-300">
                    {formatPrice(39)}/month
                  </p>
                  <p className="text-gray-300">300 credits = 30-100 scripts</p>
                  <p className="text-sm text-gray-400">
                    ~$0.39-1.30 per script
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Competitors */}
          <div className="glass-card p-8 animate-reveal border border-red-500/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-red-300 mb-2 flex items-center justify-center gap-2">
                <X className="h-6 w-6" />
                Typical Competitors
              </h3>
            </div>

            <div className="space-y-4">
              <div className="glass p-4 rounded-lg border border-red-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Competitor A</span>
                  <Badge className="glass bg-red-500/20 text-red-300">
                    Expensive
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-red-300">
                    {formatPrice(49)}
                  </p>
                  <p className="text-gray-300">60 credits = 6-20 scripts</p>
                  <p className="text-sm text-gray-400">
                    ~$2.45-8.17 per script
                  </p>
                </div>
              </div>

              <div className="glass p-4 rounded-lg border border-red-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Competitor B</span>
                  <Badge className="glass bg-red-500/20 text-red-300">
                    Limited
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-red-300">
                    {formatPrice(99)}
                  </p>
                  <p className="text-gray-300">125 credits = 12-42 scripts</p>
                  <p className="text-sm text-gray-400">
                    ~$2.36-8.25 per script
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="glass-card p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="h-8 w-8 text-yellow-400" />
              <h3 className="text-2xl font-bold text-yellow-300">
                2.5x Better Value
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Get more scripts for your money with our efficient AI models and
              competitive pricing
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-300">300</p>
                <p className="text-sm text-gray-400">credits for $49</p>
              </div>
              <div className="text-purple-400">vs</div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-300">60</p>
                <p className="text-sm text-gray-400">credits for $49</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Usage Guide */}
      {/* <div className="max-w-7xl mx-auto px-4 py-20 border-t border-white/10">
        <div className="text-center mb-12 animate-reveal">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Star className="h-8 w-8 text-yellow-400" />
            Credit Usage Guide
          </h2>
          <p className="text-gray-300">
            Different features use different amounts of credits
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(CREDIT_COSTS).map(([feature, costs], index) => (
            <div 
              key={feature} 
              className="glass-card p-6 animate-reveal"
              style={{ animationDelay: `${0.9 + index * 0.1}s` }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {feature.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <div className="space-y-2">
                {typeof costs === "object" ? (
                  Object.entries(costs).slice(0, 3).map(([model, cost]) => (
                    <div key={model} className="flex justify-between items-center glass p-3 rounded-lg">
                      <span className="text-sm text-gray-300">
                        {model.split("-").slice(0, 2).join(" ").toUpperCase()}
                      </span>
                      <Badge className="glass text-xs text-gray-300">
                        {cost} credits
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center glass p-3 rounded-lg">
                    <span className="text-gray-300">Per use</span>
                    <Badge className="glass text-gray-300">
                      {costs} credits
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 border-t border-white/10">
        <h2 className="text-3xl font-bold text-white text-center mb-12 animate-reveal">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {[
            {
              question: "Can I change my plan anytime?",
              answer:
                "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing.",
            },
            {
              question: "Do credits expire?",
              answer:
                "Subscription credits reset monthly and don't roll over. Purchased credits expire 12 months after purchase.",
            },
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, debit cards, and digital wallets through our secure payment processor, Stripe.",
            },
            {
              question: "Is there a free trial?",
              answer:
                "We offer a free tier with 15 credits to get started. No credit card required.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="glass-card glass-hover p-6 animate-reveal"
              style={{ animationDelay: `${1.2 + index * 0.1}s` }}
            >
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-400" />
                {faq.question}
              </h3>
              <p className="text-gray-300 ml-7">{faq.answer}</p>
            </div>
          ))}
        </div>

        <Alert className="mt-8 glass-card border-gray-700 bg-gray-900/50">
          <Clock className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-gray-300">
            Credits expire 12 months after purchase. Subscription credits reset
            monthly.
          </AlertDescription>
        </Alert>
      </div>

      {/* CTA Section */}
      <div
        className="max-w-4xl mx-auto px-4 py-20 text-center animate-reveal"
        style={{ animationDelay: "1.6s" }}
      >
        <div className="glass-card p-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">
            Ready to Create Viral Scripts?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of creators using GenScript to generate engaging
            YouTube scripts in minutes
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white px-8 py-3">
                <Rocket className="h-5 w-5 mr-2" />
                Create Your First Script
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="glass-button text-white px-8 py-3">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
