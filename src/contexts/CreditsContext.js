'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const CreditsContext = createContext(null);

/**
 * Credits Provider - Shares credit state across the dashboard
 * Prevents duplicate credit fetches between sidebar and dashboard
 */
export function CreditsProvider({ children, userId }) {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastFetchedRef = useRef(null);
  const CACHE_DURATION_MS = 30000; // 30 seconds cache

  const fetchCredits = useCallback(async (force = false) => {
    // Skip if fetched recently unless forced
    if (!force && lastFetchedRef.current && Date.now() - lastFetchedRef.current < CACHE_DURATION_MS) {
      return credits;
    }

    if (!userId) {
      setLoading(false);
      return 0;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: balance, error: rpcError } = await supabase.rpc(
        'get_available_credit_balance',
        { p_user_id: userId }
      );

      if (rpcError) {
        // Fallback to fetch from users table
        const { data: userData } = await supabase
          .from('users')
          .select('credits')
          .eq('id', userId)
          .single();

        const creditValue = userData?.credits || 0;
        setCredits(creditValue);
        lastFetchedRef.current = Date.now();
        return creditValue;
      } else {
        const creditValue = balance || 0;
        setCredits(creditValue);
        lastFetchedRef.current = Date.now();
        return creditValue;
      }
    } catch {
      setCredits(0);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [userId, credits]);

  // Fetch on mount when userId is available
  useEffect(() => {
    if (userId) {
      fetchCredits();
    }
  }, [userId, fetchCredits]);

  // Deduct credits locally (for optimistic updates)
  const deductCredits = useCallback((amount) => {
    setCredits((prev) => Math.max(0, prev - amount));
  }, []);

  // Add credits locally (for optimistic updates)
  const addCredits = useCallback((amount) => {
    setCredits((prev) => prev + amount);
  }, []);

  // Refresh credits (force fetch)
  const refreshCredits = useCallback(() => {
    return fetchCredits(true);
  }, [fetchCredits]);

  return (
    <CreditsContext.Provider value={{
      credits,
      loading,
      fetchCredits,
      refreshCredits,
      deductCredits,
      addCredits
    }}>
      {children}
    </CreditsContext.Provider>
  );
}

/**
 * Hook to access credits context
 * @returns {{ credits: number, loading: boolean, fetchCredits: Function, refreshCredits: Function, deductCredits: Function, addCredits: Function }}
 */
export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    // Return a fallback if not within provider (for flexibility)
    return {
      credits: 0,
      loading: false,
      fetchCredits: () => Promise.resolve(0),
      refreshCredits: () => Promise.resolve(0),
      deductCredits: () => {},
      addCredits: () => {}
    };
  }
  return context;
}
