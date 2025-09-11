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
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="mb-8 animate-reveal">
        <Link href="/channels">
          <Button className="glass-button text-white mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Channels
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Youtube className="h-10 w-10 text-red-500 neon-glow" />
              {showQuiz ? 'Personalize Your Experience' : 'Connect YouTube Channel'}
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
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
                <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-2" />
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
          <div className="glass-card p-6 text-center glass-hover group">
            <div className="glass w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">AI Voice Training</h3>
            <p className="text-sm text-gray-400">FREE automatic voice analysis to match your unique style</p>
          </div>
          <div className="glass-card p-6 text-center glass-hover group">
            <div className="glass w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Youtube className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Content Analysis</h3>
            <p className="text-sm text-gray-400">Deep insights into your channel performance and audience</p>
          </div>
          <div className="glass-card p-6 text-center glass-hover group">
            <div className="glass w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Smart Generation</h3>
            <p className="text-sm text-gray-400">Create viral scripts tailored to your audience</p>
          </div>
        </div>
      )}
    </div>
  );
}