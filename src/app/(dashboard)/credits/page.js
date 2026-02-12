"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CREDIT_PACKAGES, CREDIT_COSTS } from "@/lib/constants";
import { loadStripe } from "@stripe/stripe-js";
import { StaticCard } from "@/components/ui/static-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard,
  Sparkles,
  Zap,
  Trophy,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Coins,
  Gem,
  Crown,
  Star,
  ShoppingCart,
} from "lucide-react";
import posthog from "posthog-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CreditsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentCredits, setCurrentCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCreditsData();
  }, []);

  // Check for success/cancel from Stripe
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({
        title: "Purchase Successful!",
        description: "Your credits have been added to your account.",
      });
      // Refresh data and clean URL
      fetchCreditsData();
      setTimeout(() => {
        router.replace("/dashboard/credits");
      }, 2000);
    }
  }, [searchParams, router, toast]);

  const fetchCreditsData = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch user details
        const { data: userData } = await supabase
          .from("users")
          .select(
            "*, subscription_tier, first_purchase_date, total_credit_purchases"
          )
          .eq("id", user.id)
          .single();

        setUserDetails(userData);

        // Get credit balance using the RPC function (checks for expired credits)
        const { data: balance } = await supabase.rpc(
          "get_available_credits",
          { p_user_id: user.id }
        );

        setCurrentCredits(balance || 0);

      }
    } catch {
      // Failed to fetch credits - handled silently
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    setPurchasing(true);
    setSelectedPackage(packageId);

    // Get package details for tracking
    const selectedPkg = Object.values(CREDIT_PACKAGES).find(
      (pkg) => pkg.id === packageId
    );

    try {
      const response = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Capture credit purchase initiated event
      posthog.capture("credit_purchase_initiated", {
        package_id: packageId,
        package_name: selectedPkg?.name,
        credits: selectedPkg?.credits,
        price: selectedPkg?.price,
        is_first_purchase: isFirstPurchase,
        current_balance: currentCredits,
      });

      // Redirect to Stripe Checkout
      if (!stripePromise) {
        throw new Error(
          "Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables."
        );
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      posthog.captureException(error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to process purchase",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
      setSelectedPackage(null);
    }
  };

  const formatCredits = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const isFirstPurchase = !userDetails?.first_purchase_date;
  const purchaseCount = userDetails?.total_credit_purchases || 0;
  const isLoyaltyBonus = (purchaseCount + 1) % 3 === 0;

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <CreditCard className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-300">Loading credits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Static Background - no animations for performance */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <CreditCard className="h-10 w-10 text-purple-400 neon-glow" />
          Credits
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Purchase credits to generate more scripts and unlock features
        </p>
      </div>

      {/* Current Balance */}
      <StaticCard>
        <div
          className="glass-card p-8 text-center animate-reveal"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-full mb-4">
            <Coins className="h-10 w-10 text-yellow-400 neon-glow" />
          </div>
          <h2 className="text-xl text-gray-400 mb-2">Current Balance</h2>
          <p className="text-5xl font-bold gradient-text mb-4">
            {formatCredits(currentCredits)}
          </p>
          <p className="text-sm text-gray-400">credits available</p>

        </div>
      </StaticCard>

      {/* Low Credits Warning */}
      {currentCredits < 15 && currentCredits > 0 && (
        <Alert className="glass-card border-yellow-500/30 bg-yellow-500/5">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            You have {currentCredits} credits remaining — not enough for a full script generation.
            Top up now to keep creating.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {searchParams.get("success") === "true" && (
        <Alert className="glass-card border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Payment successful! Your credits have been added to your account.
          </AlertDescription>
        </Alert>
      )}

      {/* Special Offers */}
      {(isFirstPurchase || isLoyaltyBonus) && (
        <Alert className="glass-card border-yellow-500/50 bg-yellow-500/10 animate-reveal">
          <Gift className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            {isFirstPurchase && (
              <span className="font-semibold">
                🎉 First Purchase Special: Get 20% off any credit package!
              </span>
            )}
            {isLoyaltyBonus && (
              <span className="font-semibold">
                🎁 Loyalty Bonus: Your next purchase includes 10% bonus credits!
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Credit Packages */}
      <div
        className="space-y-4 animate-reveal"
        style={{ animationDelay: "0.2s" }}
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-purple-400" />
          Purchase Credits
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(CREDIT_PACKAGES).map((pkg) => {
            const iconMap = {
              small: Zap,
              medium: Gem,
              large: Crown,
            };
            const Icon = iconMap[pkg.id] || CreditCard;
            const colorMap = {
              small: "from-blue-500/20",
              medium: "from-purple-500/20",
              large: "from-yellow-500/20",
            };

            return (
              <StaticCard key={pkg.id}>
                <div
                  className={`glass-card glass-hover h-full relative ${
                    pkg.badge ? "ring-2 ring-purple-400" : ""
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full">
                      <span className="text-xs text-purple-300 font-semibold">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-6 text-center">
                    <div
                      className={`w-16 h-16 glass rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${
                        colorMap[pkg.id]
                      } to-transparent`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {pkg.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-3xl font-bold text-white">
                        {formatCredits(pkg.credits)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        ${pkg.perCredit} per credit
                      </p>
                    </div>

                    <p className="text-2xl font-bold gradient-text mb-2">
                      ${pkg.price}
                    </p>

                    {isFirstPurchase && (
                      <p className="text-sm text-green-400 font-medium mb-4">
                        First purchase: ${(pkg.price * 0.8).toFixed(2)}
                      </p>
                    )}

                    <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={purchasing}
                      className={`w-full glass-button ${
                        pkg.badge === "Most Popular"
                          ? "bg-gradient-to-r from-purple-500/50 to-pink-500/50"
                          : ""
                      } text-white`}
                    >
                      {purchasing && selectedPackage === pkg.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Purchase Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </StaticCard>
            );
          })}
        </div>

      </div>

      {/* Benefits Section */}
      <div
        className="glass-card p-6 animate-reveal"
        style={{ animationDelay: "0.4s" }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Credit Usage Guide
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(CREDIT_COSTS).map(([feature, costs]) => (
            <div key={feature} className="space-y-2">
              <h4 className="font-medium text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {feature
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </h4>
              <div className="ml-6 space-y-1">
                {typeof costs === "object" ? (
                  Object.entries(costs).map(([model, cost]) => (
                    <div key={model} className="flex justify-between text-sm">
                      <span className="text-gray-400">{model}</span>
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-400"
                      >
                        {cost} credits
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Standard</span>
                    <Badge variant="outline" className="text-xs text-gray-400">
                      {costs} credits
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Alert className="mt-6 border-gray-700 bg-gray-900/50">
          <Clock className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-gray-300">
            Credits expire 12 months after purchase. Subscription credits reset
            monthly.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
