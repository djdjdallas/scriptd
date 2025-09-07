'use client';

import { use } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChannelAnalyzer } from '@/components/channel/channel-analyzer';

export default function AnalyzeChannelPage({ params }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <Link href="/channels">
          <Button variant="ghost" className="glass-button mb-4 text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          Channel Analysis
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Comprehensive insights about your channel performance and audience
        </p>
      </div>

      <ChannelAnalyzer channelId={resolvedParams.id} />
    </div>
  );
}