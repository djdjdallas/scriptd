'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  CheckCircle,
  Trophy,
  Gift,
  Rocket,
  FileText,
  TrendingUp,
  Users,
  Mic,
  BarChart3,
  Settings,
  CreditCard,
  HelpCircle,
  Star,
  Sparkles,
  PartyPopper
} from 'lucide-react';

export function TourStep({ userData, onComplete }) {
  const [completing, setCompleting] = useState(false);

  const features = [
    {
      icon: FileText,
      title: 'Script Generation',
      description: 'Create unlimited AI-powered scripts',
      location: '/scripts',
      color: 'text-purple-400'
    },
    {
      icon: TrendingUp,
      title: 'Trending Topics',
      description: 'Discover what\'s hot in your niche',
      location: '/trending',
      color: 'text-blue-400'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work with your team on scripts',
      location: '/teams',
      color: 'text-pink-400'
    },
    {
      icon: Mic,
      title: 'Voice Training',
      description: 'Refine your AI voice model',
      location: '/voice',
      color: 'text-green-400'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track your content performance',
      location: '/analytics',
      color: 'text-yellow-400'
    },
    {
      icon: CreditCard,
      title: 'Credits & Billing',
      description: 'Manage your subscription',
      location: '/credits',
      color: 'text-orange-400'
    }
  ];

  const tips = [
    {
      icon: Star,
      title: 'Pro Tip #1',
      content: 'Use trending topics to find viral content ideas'
    },
    {
      icon: Star,
      title: 'Pro Tip #2',
      content: 'Train your AI voice with at least 5 videos for best results'
    },
    {
      icon: Star,
      title: 'Pro Tip #3',
      content: 'Collaborate with team members for faster content creation'
    }
  ];

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete({ completed: true });
      toast.success('Welcome to GenScript! You earned 5 bonus credits!');
    } catch (error) {
      toast.error('Failed to complete onboarding');
    } finally {
      setCompleting(false);
    }
  };

  // Count completed steps for stats
  const completedSteps = [
    !!userData?.name,
    !!userData?.channel_id,
    !!userData?.content_goals,
  ].filter(Boolean).length + 2; // +2 for welcome and current step

  return (
    <div className="space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 via-orange-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-yellow-500/50">
              <Trophy className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-4 -right-4 animate-bounce">
              <PartyPopper className="h-12 w-12 text-purple-400" />
            </div>
            <div className="absolute -bottom-2 -left-4 animate-bounce delay-100">
              <Sparkles className="h-10 w-10 text-pink-400" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            You Did It! 🎉
          </h2>
          <p className="text-xl text-gray-300 max-w-lg mx-auto">
            Welcome to GenScript! You're all set to create viral content that your audience will love.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-5 py-2 text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            {completedSteps}/7 Steps Completed
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-5 py-2 text-sm">
            <Gift className="h-4 w-4 mr-2" />
            Earned 5 Bonus Credits
          </Badge>
        </div>

        {/* Onboarding Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
          <div className="glass rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-1">{completedSteps}</div>
            <div className="text-xs text-gray-400">Steps Done</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400 mb-1">5</div>
            <div className="text-xs text-gray-400">Bonus Credits</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400 mb-1">100%</div>
            <div className="text-xs text-gray-400">Ready</div>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <Card className="glass-card p-6 border border-purple-500/20">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Rocket className="h-6 w-6 text-purple-400" />
          Explore Your Dashboard
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Here's what you can do with GenScript
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group transform hover:scale-105"
              >
                <div className="flex flex-col items-start gap-3">
                  <div className="w-12 h-12 glass rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pro Tips */}
      <div className="glass rounded-xl p-6 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          Pro Tips to Get Started
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Expert advice to maximize your success
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="glass rounded-xl p-4 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{tip.title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{tip.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What's Next */}
      <div className="glass rounded-xl p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-400" />
          Your First Steps
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Start your content creation journey with these actions
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="glass rounded-lg p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Create Your First Script</p>
                <p className="text-xs text-gray-400 mt-1">Generate AI-powered content in seconds</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Explore Trending Topics</p>
                <p className="text-xs text-gray-400 mt-1">Find viral content ideas for your niche</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg p-4 bg-gradient-to-br from-pink-500/5 to-red-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-pink-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Invite Your Team</p>
                <p className="text-xs text-gray-400 mt-1">Collaborate on scripts together</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Track Performance</p>
                <p className="text-xs text-gray-400 mt-1">Monitor your content success</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="glass rounded-xl p-5 flex items-center gap-4 border border-blue-500/20 bg-blue-500/5">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="h-6 w-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Need Help Getting Started?</p>
          <p className="text-sm text-gray-400 mt-0.5">
            Our support team is here 24/7 to help you succeed
          </p>
        </div>
        <Button variant="outline" size="sm" className="glass-button text-white hover:bg-white/10">
          Get Help
        </Button>
      </div>

      {/* Complete Button */}
      <div className="pt-2">
        <Button
          onClick={handleComplete}
          disabled={completing}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 py-7 text-lg shadow-2xl shadow-purple-500/50 animate-pulse"
        >
          {completing ? (
            <>
              <Sparkles className="h-6 w-6 mr-2 animate-spin" />
              Completing Your Setup...
            </>
          ) : (
            <>
              <Rocket className="h-6 w-6 mr-2" />
              Go to Dashboard & Start Creating
            </>
          )}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-3">
          You'll receive your 5 bonus credits immediately
        </p>
      </div>
    </div>
  );
}