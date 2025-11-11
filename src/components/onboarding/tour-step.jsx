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

  return (
    <div className="space-y-6">
      {/* Celebration Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Trophy className="h-20 w-20 text-yellow-400" />
            <PartyPopper className="h-8 w-8 text-purple-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white">
          Congratulations! 🎉
        </h2>
        <p className="text-xl text-gray-300">
          You're all set up and ready to create amazing content
        </p>
        
        <div className="flex items-center justify-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Setup Complete
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-1">
            <Gift className="h-4 w-4 mr-2" />
            +5 Bonus Credits
          </Badge>
        </div>
      </div>

      {/* Platform Features */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-purple-400" />
          Explore GenScript Features
        </h3>
        
        <div className="grid md:grid-cols-2 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 glass rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-400">{feature.description}</p>
                  </div>
                  <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Visit →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pro Tips */}
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Quick Start Tips
        </h3>
        
        <div className="space-y-3">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium text-sm">{tip.title}</p>
                  <p className="text-gray-400 text-sm">{tip.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What's Next */}
      <div className="glass rounded-lg p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <h3 className="text-lg font-semibold text-white mb-3">
          What's Next?
        </h3>
        
        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span className="text-sm">Create your first viral script</span>
          </li>
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span className="text-sm">Explore trending topics in your niche</span>
          </li>
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span className="text-sm">Invite team members to collaborate</span>
          </li>
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span className="text-sm">Check out the help center for tutorials</span>
          </li>
        </ul>
      </div>

      {/* Support */}
      <div className="glass rounded-lg p-4 flex items-center gap-3">
        <HelpCircle className="h-5 w-5 text-blue-400" />
        <div className="flex-1">
          <p className="text-white font-medium text-sm">Need Help?</p>
          <p className="text-xs text-gray-400">
            Visit our help center or contact support anytime
          </p>
        </div>
        <Button variant="outline" size="sm" className="glass-button text-white">
          Get Help
        </Button>
      </div>

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        disabled={completing}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
      >
        {completing ? (
          <>
            <Sparkles className="h-5 w-5 mr-2 animate-spin" />
            Completing Setup...
          </>
        ) : (
          <>
            <Rocket className="h-5 w-5 mr-2" />
            Start Creating Amazing Content
          </>
        )}
      </Button>
    </div>
  );
}