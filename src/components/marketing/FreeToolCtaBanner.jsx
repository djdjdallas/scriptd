'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { X, Sparkles, ArrowRight } from 'lucide-react';

const STORAGE_PREFIX = 'genscript_free_tool_cta_dismissed_';

export default function FreeToolCtaBanner({ tool, show }) {
  // Start hidden until we've checked localStorage to avoid a pre-dismiss flash.
  const [dismissed, setDismissed] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const firedShownRef = useRef(false);

  useEffect(() => {
    try {
      const key = STORAGE_PREFIX + tool;
      setDismissed(typeof window !== 'undefined' && localStorage.getItem(key) === '1');
    } catch (e) {
      setDismissed(false);
    }
    setHydrated(true);
  }, [tool]);

  const visible = hydrated && show && !dismissed;

  useEffect(() => {
    if (visible && !firedShownRef.current) {
      firedShownRef.current = true;
      posthog.capture('free_tool_cta_shown', { tool });
    }
  }, [visible, tool]);

  if (!visible) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_PREFIX + tool, '1');
    } catch (e) {}
    setDismissed(true);
  };

  const handleClick = () => {
    posthog.capture('free_tool_cta_clicked', { tool });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-cyan-900/20 p-6 backdrop-blur">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-4 pr-6">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-violet-300" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            Want this for every video?
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            GenScript generates full retention-optimized scripts in minutes. 50 free credits, no card required.
          </p>
          <Link href="/signup" onClick={handleClick}>
            <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:from-violet-500 hover:to-purple-500">
              Try GenScript Free
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
