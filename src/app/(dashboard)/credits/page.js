"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CREDIT_PACKAGES, CREDIT_COSTS } from "@/lib/constants";
import { loadStripe } from "@stripe/stripe-js";
import { TiltCard } from "@/components/ui/tilt-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [transactions, setTransactions] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
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

        // Get credit balance using the RPC function
        const { data: balance } = await supabase.rpc(
          "get_available_credit_balance",
          { p_user_id: user.id }
        );

        setCurrentCredits(balance || 0);

        // Fetch recent transactions
        const { data: transactionsData } = await supabase
          .from("credits_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error("Error fetching credits data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    setPurchasing(true);
    setSelectedPackage(packageId);

    try {
      const response = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          promoCode: promoCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

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
      console.error("Purchase error:", error);
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
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "5s" }}
        />
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
      <TiltCard>
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

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="glass p-4 rounded-xl">
              <p className="text-2xl font-bold text-white">23</p>
              <p className="text-xs text-gray-400">Scripts Created</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-2xl font-bold text-white">850</p>
              <p className="text-xs text-gray-400">Credits Used</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-2xl font-bold text-white">37</p>
              <p className="text-xs text-gray-400">Avg per Script</p>
            </div>
          </div>
        </div>
      </TiltCard>

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
              pack_50: Zap,
              pack_100: Gem,
              pack_500: Crown,
            };
            const Icon = iconMap[pkg.id] || CreditCard;
            const colorMap = {
              pack_50: "from-blue-500/20",
              pack_100: "from-purple-500/20",
              pack_500: "from-yellow-500/20",
            };

            return (
              <TiltCard key={pkg.id}>
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
              </TiltCard>
            );
          })}
        </div>

        {/* Promo Code Section */}
        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-400" />
            Have a promo code?
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoError("");
              }}
              className="max-w-xs bg-black/20 border-gray-700 text-white"
            />
            <Badge variant="outline" className="px-3 py-2 border-gray-700">
              Applied at checkout
            </Badge>
          </div>
          {promoError && (
            <p className="text-sm text-red-400 mt-2">{promoError}</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className="glass-card p-6 animate-reveal"
        style={{ animationDelay: "0.3s" }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-400" />
          Recent Transactions
        </h3>

        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between glass p-4 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 glass rounded-lg flex items-center justify-center ${
                      transaction.amount > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.amount > 0 ? (
                      <Plus className="h-5 w-5" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.amount > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        )}
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
