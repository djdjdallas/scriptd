'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TiltCard } from '@/components/ui/tilt-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
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
  ShoppingCart
} from 'lucide-react';

const creditPackages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 9.99,
    icon: Zap,
    color: 'from-blue-500/20',
    popular: false,
    bonus: 0
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 500,
    price: 39.99,
    icon: Gem,
    color: 'from-purple-500/20',
    popular: true,
    bonus: 50
  },
  {
    id: 'business',
    name: 'Business Pack',
    credits: 1200,
    price: 89.99,
    icon: Crown,
    color: 'from-pink-500/20',
    popular: false,
    bonus: 200
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 5000,
    price: 349.99,
    icon: Trophy,
    color: 'from-yellow-500/20',
    popular: false,
    bonus: 1000
  }
];

export default function CreditsPage() {
  const [currentCredits, setCurrentCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCreditsData();
  }, []);

  const fetchCreditsData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch user credits
        const { data: userData } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (userData) {
          setCurrentCredits(userData.credits || 0);
        }

        // Fetch recent transactions
        const { data: transactionsData } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error fetching credits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    setPurchasing(true);
    setSelectedPackage(packageId);

    try {
      const selectedPkg = creditPackages.find(pkg => pkg.id === packageId);
      
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageId,
          credits: selectedPkg.credits + selectedPkg.bonus
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.url) {
          // Redirect to Stripe checkout
          window.location.href = result.url;
        } else {
          toast({
            title: "Purchase Successful",
            description: `Added ${selectedPkg.credits + selectedPkg.bonus} credits to your account`
          });
          fetchCreditsData();
        }
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to process purchase",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
      setSelectedPackage(null);
    }
  };

  const formatCredits = (num) => {
    return new Intl.NumberFormat().format(num);
  };

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
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
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
        <div className="glass-card p-8 text-center animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-full mb-4">
            <Coins className="h-10 w-10 text-yellow-400 neon-glow" />
          </div>
          <h2 className="text-xl text-gray-400 mb-2">Current Balance</h2>
          <p className="text-5xl font-bold gradient-text mb-4">{formatCredits(currentCredits)}</p>
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

      {/* Credit Packages */}
      <div className="space-y-4 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-purple-400" />
          Purchase Credits
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPackages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <TiltCard key={pkg.id}>
                <div className={`glass-card glass-hover h-full relative ${
                  pkg.popular ? 'ring-2 ring-purple-400' : ''
                }`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full">
                      <span className="text-xs text-purple-300 font-semibold">MOST POPULAR</span>
                    </div>
                  )}
                  
                  <div className="p-6 text-center">
                    <div className={`w-16 h-16 glass rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${pkg.color} to-transparent`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">{pkg.name}</h3>
                    
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-white">{formatCredits(pkg.credits)}</p>
                      {pkg.bonus > 0 && (
                        <p className="text-sm text-green-400 flex items-center justify-center gap-1 mt-1">
                          <Gift className="h-3 w-3" />
                          +{pkg.bonus} bonus credits
                        </p>
                      )}
                    </div>
                    
                    <p className="text-2xl font-bold gradient-text mb-6">
                      ${pkg.price}
                    </p>
                    
                    <Button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={purchasing}
                      className={`w-full glass-button ${
                        pkg.popular 
                          ? 'bg-gradient-to-r from-purple-500/50 to-pink-500/50' 
                          : ''
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
                          Purchase
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-400" />
          Recent Transactions
        </h3>
        
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between glass p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 glass rounded-lg flex items-center justify-center ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? (
                      <Plus className="h-5 w-5" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          What You Can Do With Credits
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Generate Scripts</p>
              <p className="text-xs text-gray-400">10-50 credits per script</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Voice Training</p>
              <p className="text-xs text-gray-400">100 credits per profile</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Advanced Research</p>
              <p className="text-xs text-gray-400">5-20 credits per query</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Premium Templates</p>
              <p className="text-xs text-gray-400">25 credits per use</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}