'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isMountedRef = useRef(true);
  const authListenerRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();

    // Initial auth check
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!isMountedRef.current) {
          return;
        }

        if (error) {
          console.error('[AuthProvider] Auth error:', error);
        }

        setUser(user);
        setLoading(false);
      } catch (error) {
        console.error('[AuthProvider] Check user error:', error);
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkUser();

    // Set up auth state change listener
    // CRITICAL: Only navigate on SIGNED_OUT, never use router.refresh()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) {
          return;
        }

        // Update user state
        setUser(session?.user ?? null);

        // IMPORTANT: Only navigate on sign out, not on other events
        // This prevents refresh loops
        if (event === 'SIGNED_OUT') {
          // Use replace instead of push to prevent back button issues
          router.replace('/login');
        } else if (event === 'SIGNED_IN' && pathname === '/login') {
          // Only redirect from login page after successful sign in
          router.replace('/dashboard');
        }

        // DO NOT use router.refresh() here - it causes infinite loops!
        // The middleware will handle cookie updates
      }
    );

    authListenerRef.current = subscription;

    // Cleanup
    return () => {
      isMountedRef.current = false;

      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const value = {
    user,
    loading,
    signOut: async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle the redirect
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
