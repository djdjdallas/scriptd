'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Zap, 
  TrendingUp,
  Download,
  Calendar,
  AlertCircle,
  Check,
  Loader2,
  Plus
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { PLANS, CREDIT_COSTS, MODEL_TIERS } from '@/lib/constants';
import { CREDIT_PACKAGES } from '@/lib/stripe/client';

// Constants for billing display
const MAX_CREDITS_FOR_PROGRESS = 500; // Used for progress bar visualization
import { formatDistanceToNow } from 'date-fns';
import posthog from 'posthog-js';

export default function BillingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [creditData, setCreditData] = useState({
    balance: 0,
    subscription: { status: 'inactive', plan: 'free' },
    history: []
  });

  useEffect(() => {
    fetchCreditData();

    // Check for purchase success/cancel in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('purchase') === 'success') {
      toast({
        title: "Purchase Successful!",
        description: "Your credits have been added to your account."
      });
      // Clean URL
      window.history.replaceState({}, '', '/billing');
    } else if (params.get('purchase') === 'cancelled') {
      toast({
        title: "Purchase Cancelled",
        description: "Your purchase was cancelled.",
        variant: "destructive"
      });
      // Clean URL
      window.history.replaceState({}, '', '/billing');
    }
  }, []);

  const fetchCreditData = async () => {
    try {
      const response = await fetch('/api/credits?history=true');
      if (response.ok) {
        const data = await response.json();
        setCreditData(data);

        // Capture subscription plan viewed event
        posthog.capture('subscription_plan_viewed', {
          current_plan: data.subscription?.plan || 'free',
          subscription_status: data.subscription?.status || 'inactive',
          credit_balance: data.balance,
        });
      }
    } catch (error) {
      posthog.captureException(error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseCredits = async (packageId) => {
    setPurchasing(true);
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = data.url;

    } catch (error) {
      posthog.captureException(error);
      toast({
        title: "Purchase Failed",
        description: "Failed to start checkout process",
        variant: "destructive"
      });
      setPurchasing(false);
    }
  };

  const manageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      window.location.href = data.url;

    } catch (error) {
      posthog.captureException(error);
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = PLANS[creditData.subscription.plan?.toUpperCase()] || PLANS.FREE;
  const creditPercentage = Math.min(100, (creditData.balance / MAX_CREDITS_FOR_PROGRESS) * 100);
  const avgScriptCost = MODEL_TIERS.BALANCED.baseCredits; // Use the most common tier

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Credits</h1>
        <p className="text-muted-foreground">
          Manage your subscription and credit balance
        </p>
      </div>

      {/* Credit Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">{creditData.balance}</p>
                <p className="text-muted-foreground">credits available</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Approximately
                </p>
                <p className="text-lg font-medium">
                  {Math.floor(creditData.balance / avgScriptCost)} scripts
                </p>
              </div>
            </div>
            
            <Progress value={creditPercentage} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Scripts</p>
                <p className="font-medium">{MODEL_TIERS.BALANCED.baseCredits}-{MODEL_TIERS.PREMIUM.baseCredits} credits</p>
              </div>
              <div>
                <p className="text-muted-foreground">Research</p>
                <p className="font-medium">{CREDIT_COSTS.RESEARCH_CHAT} credit/message</p>
              </div>
              <div>
                <p className="text-muted-foreground">Exports</p>
                <p className="font-medium">Free</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            {creditData.subscription.plan !== 'free' && (
              <Button variant="outline" size="sm" onClick={manageSubscription}>
                Manage Subscription
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  {currentPlan.price ? `$${currentPlan.price}/month` : 'No subscription'}
                </p>
              </div>
              <Badge variant={creditData.subscription.status === 'active' ? 'default' : 'secondary'}>
                {creditData.subscription.status}
              </Badge>
            </div>

            <div className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {creditData.subscription.plan === 'free' && (
              <Button className="w-full" asChild>
                <a href="/pricing">Upgrade Plan</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Buy Credits</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(CREDIT_PACKAGES).map((pkg) => (
            <Card key={pkg.id} className={pkg.badge ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pkg.credits} Credits</CardTitle>
                  {pkg.badge && (
                    <Badge>{pkg.badge}</Badge>
                  )}
                </div>
                <CardDescription>
                  ${pkg.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    ${pkg.perCredit} per credit
                  </p>
                  <Button 
                    className="w-full" 
                    variant={pkg.badge === 'Most Popular' ? 'default' : 'outline'}
                    onClick={() => purchaseCredits(pkg.id)}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Your recent credit transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {creditData.history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creditData.history.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.amount > 0 ? <Plus className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className={`font-medium ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}