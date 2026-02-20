'use client';

import YouTubeTools from '@/components/youtube-tools';

export default function YouTubeToolsPage() {
  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <YouTubeTools />
      </div>
    </div>
  );
}