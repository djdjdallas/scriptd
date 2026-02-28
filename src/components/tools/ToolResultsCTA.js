'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bookmark, Mic, Mail, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ToolResultsCTA({ sourceTool }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveDismissed, setSaveDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const timerRef = useRef(null);

  // Auth check on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // 3-second delay for save prompt after auth resolves to not-logged-in
  useEffect(() => {
    if (isLoggedIn === false) {
      timerRef.current = setTimeout(() => {
        setShowSavePrompt(true);
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoggedIn]);

  // If logged in or still loading, render nothing
  if (isLoggedIn !== false) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailSubmitting(true);

    try {
      const res = await fetch('/api/tools/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), sourceTool }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setEmailSuccess(true);
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setEmailSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Save Prompt (3s delay, dismissible) */}
      {showSavePrompt && !saveDismissed && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-violet-500/20 bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 flex-shrink-0">
                <Bookmark className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Nice results. Want to save them?</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Create a free account to save, edit, and build on what you just generated.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  >
                    Save My Script
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setSaveDismissed(true)}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    No thanks, I'll copy and paste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Voice DNA Tease (immediate) */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 flex-shrink-0">
            <Mic className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300">
              This was generated without your voice profile.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-1"
            >
              See what it sounds like in your style
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Section 3: Passive Email Capture (immediate) */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        {emailSuccess ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 flex-shrink-0">
              <Check className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-300">
              Check your inbox for 3 free premium scripts!
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 flex-shrink-0">
                <Mail className="h-4 w-4 text-violet-400" />
              </div>
              <p className="text-sm text-gray-300 sm:hidden">
                Get 3 free premium scripts emailed to you
              </p>
            </div>
            <p className="text-sm text-gray-300 hidden sm:block flex-shrink-0">
              Get 3 free premium scripts emailed to you
            </p>
            <div className="flex w-full sm:w-auto items-center gap-2 flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="you@email.com"
                className="flex-1 sm:w-48 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/40 transition-colors"
              />
              <button
                type="submit"
                disabled={emailSubmitting}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
              >
                {emailSubmitting ? '...' : 'Send'}
              </button>
            </div>
            {emailError && (
              <p className="text-xs text-red-400 w-full">{emailError}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
