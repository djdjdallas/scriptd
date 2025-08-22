'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChannelConnectForm } from '@/components/channel/channel-connect-form';
import { OnboardingQuiz } from '@/components/channel/onboarding-quiz';

export default function ConnectChannelPage() {
  const router = useRouter();
  const [showQuiz, setShowQuiz] = useState(false);
  const [connectedChannel, setConnectedChannel] = useState(null);

  const handleChannelConnect = (channel) => {
    setConnectedChannel(channel);
    setShowQuiz(true);
  };

  const handleQuizComplete = async (answers) => {
    // Save quiz answers to user preferences
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: connectedChannel.id,
          preferences: answers,
        }),
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }

    // Redirect to channel analysis
    router.push(`/channels/${connectedChannel.id}/analyze`);
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/channels">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight">Connect YouTube Channel</h1>
        <p className="text-muted-foreground mt-2">
          {showQuiz 
            ? 'Help us personalize your experience'
            : 'Connect your YouTube channel to start growing your audience'}
        </p>
      </div>

      {showQuiz ? (
        <OnboardingQuiz onComplete={handleQuizComplete} />
      ) : (
        <ChannelConnectForm onSuccess={handleChannelConnect} />
      )}
    </div>
  );
}