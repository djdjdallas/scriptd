"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANS, CREDIT_PACKAGES, CREDIT_COSTS } from "@/lib/constants";
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
      const { data: { user } } = await supabase.auth.getUser();

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
      minimumFractionDigits: 0,
    }).format(price);
  };

  const plans = Object.values(PLANS).filter(plan => plan.id !== "free");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -left-48 opacity-10" />
        <div className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -right-48 opacity-10" style={{ animationDelay: '10s' }} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      {/* Navigation */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-purple-400 neon-glow" />
              <span className="text-2xl font-bold gradient-text">GenScript</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button className="glass-button text-white">
                  Sign In
                </Button>
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
          <span className="text-purple-300 font-medium">Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Start with our free tier or unlock advanced features with a subscription. 
          Purchase additional credits anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12 animate-reveal" style={{ animationDelay: "0.1s" }}>
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
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-purple-400" />
          Subscription Plans
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const price = billingPeriod === "annual" ? plan.priceAnnual / 12 : plan.price;
            const isPopular = plan.id === "professional";

            return (
              <TiltCard key={plan.id}>
                <div 
                  className={`glass-card h-full relative ${
                    isPopular ? "ring-2 ring-purple-400" : ""
                  } animate-reveal`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full">
                      <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    {plan.id === "enterprise" && <Crown className="h-5 w-5 text-yellow-400" />}
                    {plan.id === "business" && <Trophy className="h-5 w-5 text-purple-400" />}
                    {plan.id === "professional" && <Rocket className="h-5 w-5 text-blue-400" />}
                    {plan.id === "starter" && <Zap className="h-5 w-5 text-green-400" />}
                  </div>
                  
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold gradient-text">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-400">
                        /{billingPeriod === "annual" ? "mo" : "month"}
                      </span>
                    </div>
                  
                    {billingPeriod === "annual" && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(plan.priceAnnual)} billed annually
                      </p>
                    )}

                    <div className="mt-4 mb-6">
                      {plan.credits ? (
                        <div className="flex items-center gap-2 glass p-3 rounded-lg">
                          <Coins className="h-5 w-5 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {plan.credits === null ? "Unlimited" : `${plan.credits}`}
                          </span>
                          <span className="text-gray-400">credits/month</span>
                        </div>
                      ) : (
                        <p className="text-gray-400">Perfect for getting started</p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading}
                      className={`w-full glass-button ${
                        isPopular 
                          ? "bg-gradient-to-r from-purple-500/50 to-pink-500/50" 
                          : ""
                      } text-white`}
                    >
                      {loading && selectedPlan === plan.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
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
        <div className="glass-card p-8 animate-reveal" style={{ animationDelay: "0.5s" }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8 text-purple-400 neon-glow" />
              Script Generation Estimates
              <FileText className="h-8 w-8 text-yellow-400" />
            </h2>
            <p className="text-gray-300">
              See how many scripts you can generate with each plan or credit package
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
                  const avgScriptsGPT4 = Math.floor((plan.credits || 0) / 15);
                  const avgScriptsClaude = Math.floor((plan.credits || 0) / 12);
                  const avgScriptsMixtral = Math.floor((plan.credits || 0) / 2);

                  return (
                    <div key={plan.id} className="glass p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{plan.name}</span>
                        <Badge className="glass text-purple-300">
                          {plan.credits === null ? "Unlimited" : `${plan.credits} credits/mo`}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400">GPT-4</p>
                          <p className="text-white font-bold">
                            {plan.credits === null ? "∞" : `~${avgScriptsGPT4}`} scripts
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Claude Sonnet</p>
                          <p className="text-white font-bold">
                            {plan.credits === null ? "∞" : `~${avgScriptsClaude}`} scripts
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Mixtral</p>
                          <p className="text-white font-bold">
                            {plan.credits === null ? "∞" : `~${avgScriptsMixtral}`} scripts
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
                {CREDIT_PACKAGES.map((pkg) => {
                  const avgScriptsGPT4 = Math.floor(pkg.credits / 15);
                  const avgScriptsClaude = Math.floor(pkg.credits / 12);
                  const avgScriptsMixtral = Math.floor(pkg.credits / 2);

                  return (
                    <div key={pkg.id} className="glass p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{pkg.credits} Credits</span>
                        <Badge className="glass text-yellow-300">
                          {formatPrice(pkg.price)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-gray-400">GPT-4</p>
                          <p className="text-white font-bold">~{avgScriptsGPT4} scripts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Claude Sonnet</p>
                          <p className="text-white font-bold">~{avgScriptsClaude} scripts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Mixtral</p>
                          <p className="text-white font-bold">~{avgScriptsMixtral} scripts</p>
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
              <strong>Note:</strong> Script generation costs vary by AI model and length. These are estimates based on average usage. 
              GPT-4: 15 credits, Claude 3.7 Sonnet: 12 credits, Mixtral: 2 credits per script on average.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="max-w-7xl mx-auto px-4 py-20 border-t border-white/10">
        <div className="text-center mb-12 animate-reveal">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <CreditCard className="h-8 w-8 text-purple-400 neon-glow" />
            Need More Credits?
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </h2>
          <p className="text-gray-300">
            Purchase additional credits anytime. No subscription required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {CREDIT_PACKAGES.map((pkg, index) => {
            const iconMap = {
              credits_50: Zap,
              credits_100: Gem,
              credits_500: Crown,
            };
            const Icon = iconMap[pkg.id] || CreditCard;
            const colorMap = {
              credits_50: "from-blue-500/20",
              credits_100: "from-purple-500/20",
              credits_500: "from-yellow-500/20",
            };

            return (
              <TiltCard key={pkg.id}>
                <div 
                  className={`glass-card glass-hover h-full relative ${
                    pkg.popular ? "ring-2 ring-purple-400" : ""
                  } animate-reveal`}
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full">
                      <span className="text-xs text-purple-300 font-semibold">
                        Best Value
                      </span>
                    </div>
                  )}

                  <div className="p-6 text-center">
                    <div className={`w-16 h-16 glass rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${colorMap[pkg.id]} to-transparent`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {pkg.credits} Credits
                    </h3>
                    
                    <div className="mb-4">
                      <p className="text-3xl font-bold gradient-text">
                        {formatPrice(pkg.price)}
                      </p>
                      {pkg.savings && (
                        <Badge className="glass px-2 py-1 text-xs text-green-300 mt-2">
                          Save {pkg.savings}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      ${(pkg.price / pkg.credits).toFixed(2)} per credit
                    </p>

                    <Button 
                      className="w-full glass-button text-white"
                      onClick={() => router.push("/dashboard/credits")}
                    >
                      Purchase
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Credit Usage Guide */}
      <div className="max-w-7xl mx-auto px-4 py-20 border-t border-white/10">
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
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 border-t border-white/10">
        <h2 className="text-3xl font-bold text-white text-center mb-12 animate-reveal">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          {[
            {
              question: "Can I change my plan anytime?",
              answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing."
            },
            {
              question: "Do credits expire?",
              answer: "Subscription credits reset monthly and don't roll over. Purchased credits expire 12 months after purchase."
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, debit cards, and digital wallets through our secure payment processor, Stripe."
            },
            {
              question: "Is there a free trial?",
              answer: "We offer a free tier with 15 credits to get started. No credit card required."
            }
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
              <p className="text-gray-300 ml-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <Alert className="mt-8 glass-card border-gray-700 bg-gray-900/50">
          <Clock className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-gray-300">
            Credits expire 12 months after purchase. Subscription credits reset monthly.
          </AlertDescription>
        </Alert>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-reveal" style={{ animationDelay: "1.6s" }}>
        <div className="glass-card p-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">
            Ready to Create Amazing Content?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of creators using GenScript to grow their YouTube channels
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white px-8 py-3">
                <Rocket className="h-5 w-5 mr-2" />
                Start Free Trial
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