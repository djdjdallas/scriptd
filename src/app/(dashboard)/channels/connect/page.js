'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Youtube, Sparkles, Zap, ChevronRight } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-200px)] relative">
      {/* Header */}
      <div className="mb-8 animate-reveal">
        <Link href="/channels">
          <Button className="vb-btn-outline text-white mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Channels
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-display text-white flex items-center gap-3">
              <Youtube className="h-10 w-10 text-red-500" />
              {showQuiz ? 'Personalize Your Experience' : 'Connect YouTube Channel'}
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              {showQuiz 
                ? 'Help us understand your content goals and preferences'
                : 'Connect your channel to unlock AI-powered growth tools'}
            </p>
          </div>
          {!showQuiz && (
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Instant Setup</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
              <div className="text-center">
                <Youtube className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Analyze Content</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Generate Scripts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {showQuiz ? (
          <div className="animate-reveal">
            <OnboardingQuiz onComplete={handleQuizComplete} />
          </div>
        ) : (
          <div className="animate-reveal" style={{ animationDelay: '0.1s' }}>
            <ChannelConnectForm onSuccess={handleChannelConnect} />
          </div>
        )}
      </div>

      {/* Bottom Features */}
      {!showQuiz && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="vb-card-interactive p-6 text-center group">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">AI Voice Training</h3>
            <p className="text-sm text-gray-400">FREE automatic voice analysis to match your unique style</p>
          </div>
          <div className="vb-card-interactive p-6 text-center group">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Youtube className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Content Analysis</h3>
            <p className="text-sm text-gray-400">Deep insights into your channel performance and audience</p>
          </div>
          <div className="vb-card-interactive p-6 text-center group">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Smart Generation</h3>
            <p className="text-sm text-gray-400">Create viral scripts tailored to your audience</p>
          </div>
        </div>
      )}
    </div>
  );
}