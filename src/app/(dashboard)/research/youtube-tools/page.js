'use client';

import YouTubeTools from '@/components/youtube-tools';
import { Youtube } from 'lucide-react';

export default function YouTubeToolsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
          <Youtube className="h-10 w-10 text-red-400" />
          YouTube Creator Tools
        </h1>
        <p className="text-gray-400 mt-2">
          Professional-grade tools to optimize your YouTube content
        </p>
      </div>

      {/* Tools Component */}
      <div className="animate-reveal" style={{ animationDelay: '0.1s' }}>
        <YouTubeTools />
      </div>
    </div>
  );
}