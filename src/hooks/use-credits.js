import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CreditManager } from '@/lib/credits/manager';
import { useToast } from '@/components/ui/use-toast';

export function useCredits() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Load initial balance
  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const currentBalance = await CreditManager.checkBalance(user.id);
        setBalance(currentBalance);
      }
    } catch (error) {
      console.error('Error loading credit balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCredits = useCallback(async (feature, options = {}) => {
    if (!user) return { canAfford: false, cost: 0, balance: 0 };
    
    const result = await CreditManager.canAffordFeature(user.id, feature, options);
    return result;
  }, [user]);

  const useCredits = useCallback(async (feature, options = {}) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to use this feature",
        variant: "destructive"
      });
      return { success: false };
    }

    const result = await CreditManager.deductCredits(user.id, feature, options);
    
    if (result.success) {
      setBalance(result.remainingBalance);
      return result;
    } else {
      if (result.error === 'Insufficient credits') {
        toast({
          title: "Insufficient Credits",
          description: `You need ${result.required} credits for this feature. Your balance is ${result.balance}.`,
          variant: "destructive",
          action: {
            label: "Buy Credits",
            onClick: () => router.push('/dashboard/credits')
          }
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to use credits",
          variant: "destructive"
        });
      }
      return result;
    }
  }, [user, toast, router]);

  const refundCredits = useCallback(async (amount, reason) => {
    if (!user) return { success: false };
    
    const result = await CreditManager.refundCredits(user.id, amount, reason);
    
    if (result.success) {
      await loadBalance();
      toast({
        title: "Credits Refunded",
        description: `${amount} credits have been refunded to your account`,
      });
    }
    
    return result;
  }, [user, toast]);

  return {
    balance,
    loading,
    checkCredits,
    useCredits,
    refundCredits,
    refreshBalance: loadBalance
  };
}

// Hook for credit-gated features
export function useCreditGate(feature, options = {}) {
  const { checkCredits, useCredits } = useCredits();
  const [canAccess, setCanAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [cost, setCost] = useState(0);

  useEffect(() => {
    checkAccess();
  }, [feature, options.model]);

  const checkAccess = async () => {
    setChecking(true);
    const result = await checkCredits(feature, options);
    setCanAccess(result.canAfford);
    setCost(result.cost);
    setChecking(false);
  };

  const consumeCredits = async () => {
    return await useCredits(feature, options);
  };

  return {
    canAccess,
    checking,
    cost,
    consumeCredits
  };
}