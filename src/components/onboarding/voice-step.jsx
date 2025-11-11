'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mic,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Headphones,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ChannelAnalyzer } from '@/components/channel/channel-analyzer';

export function VoiceStep({ userData, onComplete }) {
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Get channel ID from previous onboarding step (channel connection)
  const channelId = userData?.channel_id;
  const hasChannel = !!channelId;

  const benefits = [
    {
      icon: Brain,
      title: 'AI Learns Your Style',
      description: 'Analyzes your unique voice and tone'
    },
    {
      icon: FileText,
      title: 'Personalized Scripts',
      description: 'Generate content that sounds like you'
    },
    {
      icon: TrendingUp,
      title: 'Consistent Branding',
      description: 'Maintain your voice across all content'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'No more rewriting to match your style'
    }
  ];

  const handleSkip = async () => {
    await onComplete({ skipped: true });
  };

  const handleContinue = async () => {
    await onComplete({
      analyzed: analysisComplete,
      channel_id: channelId
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Analyze Your Channel</h2>
        <p className="text-gray-400">
          Get AI-powered insights and recommendations for your content
        </p>
      </div>

      {!hasChannel ? (
        // No channel connected - show message
        <div className="space-y-6">
          {/* Info Message */}
          <div className="glass rounded-lg p-6 border border-yellow-500/20">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Channel Connected
                </h3>
                <p className="text-gray-300">
                  You skipped the channel connection step. To analyze your content and train
                  your AI voice, you'll need to connect your YouTube channel.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="glass rounded-lg p-6">
            <h3 className="text-white font-medium mb-4">What You're Missing:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{benefit.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSkip}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              Continue Without Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              You can connect your channel and analyze it later from the dashboard
            </p>
          </div>
        </div>
      ) : (
        // Channel connected - show analyzer
        <div className="space-y-6">
          {/* Benefits Info */}
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="text-white font-medium">
                Get AI-Powered Insights
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Our AI will analyze your channel to understand your content style, audience,
              and performance. This helps us generate scripts that match your unique voice.
            </p>
          </div>

          {/* Channel Analyzer Component */}
          <ChannelAnalyzer
            channelId={channelId}
            channelData={userData?.channel}
            isRemix={false}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 glass-button text-white"
            >
              Skip Analysis
            </Button>

            <Button
              onClick={handleContinue}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Analysis results are saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}