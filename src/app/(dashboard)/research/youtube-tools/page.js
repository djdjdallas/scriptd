'use client';

import YouTubeTools from '@/components/youtube-tools';
import { Sparkles, Youtube } from 'lucide-react';

export default function YouTubeToolsPage() {
  return (
    <div className="space-y-6">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Youtube className="h-10 w-10 text-red-400 neon-glow" />
          YouTube Creator Tools
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
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