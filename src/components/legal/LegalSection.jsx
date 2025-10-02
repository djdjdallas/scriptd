'use client';

import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LegalSection({ id, title, children, level = 2, important = false }) {
  const HeadingTag = `h${level}`;

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);

    // Show a subtle feedback
    const button = document.getElementById(`copy-${id}`);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '✓ Copied';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    }
  };

  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-20 mb-8',
        important && 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-400'
      )}
    >
      <div className="group flex items-center gap-3 mb-4">
        <HeadingTag
          className={cn(
            'font-bold text-gray-900 dark:text-gray-100',
            level === 2 && 'text-2xl',
            level === 3 && 'text-xl',
            level === 4 && 'text-lg'
          )}
        >
          {title}
        </HeadingTag>
        <button
          id={`copy-${id}`}
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label="Copy link to section"
          title="Copy link to section"
        >
          <LinkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
