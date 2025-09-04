'use client';

import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChannelAnalyzer } from '@/components/channel/channel-analyzer';

export default function AnalyzeChannelPage({ params }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  return (
    <div>
      <div className="mb-8">
        <Link href="/channels">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight">Channel Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights about your channel performance and audience
        </p>
      </div>

      <ChannelAnalyzer channelId={resolvedParams.id} />
    </div>
  );
}