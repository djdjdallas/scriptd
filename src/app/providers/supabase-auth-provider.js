'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStateChangeCount, setAuthStateChangeCount] = useState(0); // Debug counter
  const router = useRouter();
  const pathname = usePathname();
  const isMountedRef = useRef(true);
  const authListenerRef = useRef(null);
  
  useEffect(() => {
    const supabase = createClient();
    
    // Debug logging
    console.log(`[AuthProvider] Initializing at ${new Date().toISOString()}`);
    console.log(`[AuthProvider] Current path: ${pathname}`);
    
    // Initial auth check
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!isMountedRef.current) {
          console.log('[AuthProvider] Component unmounted, skipping state update');
          return;
        }
        
        console.log(`[AuthProvider] Initial auth check: ${user ? 'authenticated' : 'not authenticated'}`);
        
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
        // Track state changes for debugging
        setAuthStateChangeCount(prev => {
          const newCount = prev + 1;
          console.log(`[AuthProvider] Auth state change #${newCount}: ${event} at ${new Date().toISOString()}`);
          return newCount;
        });
        
        if (!isMountedRef.current) {
          console.log('[AuthProvider] Component unmounted, ignoring auth state change');
          return;
        }
        
        console.log(`[AuthProvider] Auth event: ${event}, User: ${session?.user?.email || 'none'}`);
        
        // Update user state
        setUser(session?.user ?? null);
        
        // IMPORTANT: Only navigate on sign out, not on other events
        // This prevents refresh loops
        if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] User signed out, redirecting to /login');
          
          // Use replace instead of push to prevent back button issues
          router.replace('/login');
        } else if (event === 'SIGNED_IN' && pathname === '/login') {
          // Only redirect from login page after successful sign in
          console.log('[AuthProvider] User signed in from login page, redirecting to /dashboard');
          router.replace('/dashboard');
        }
        
        // DO NOT use router.refresh() here - it causes infinite loops!
        // The middleware will handle cookie updates
      }
    );
    
    authListenerRef.current = subscription;
    
    // Cleanup
    return () => {
      console.log('[AuthProvider] Cleaning up auth listener');
      isMountedRef.current = false;
      
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once on mount
  
  // Debug: Log render count
  useEffect(() => {
    console.log(`[AuthProvider] Render count: ${authStateChangeCount}, Loading: ${loading}, User: ${user?.email || 'none'}`);
  });
  
  const value = {
    user,
    loading,
    signOut: async () => {
      const supabase = createClient();
      console.log('[AuthProvider] Signing out user');
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle the redirect
    },
    // Debug helper
    debugInfo: {
      authStateChangeCount,
      pathname,
      mounted: isMountedRef.current
    }
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}