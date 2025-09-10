'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Play,
  FileText,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Gift,
  Star,
  Rocket
} from 'lucide-react';

export function WelcomeStep({ userData, onComplete }) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  const features = [
    {
      icon: FileText,
      title: 'AI Script Generation',
      description: 'Create viral YouTube scripts in seconds',
      color: 'text-purple-400'
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Stay ahead with real-time trend insights',
      color: 'text-blue-400'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your content team',
      color: 'text-pink-400'
    },
    {
      icon: Zap,
      title: 'Voice Cloning',
      description: 'Generate scripts in your unique style',
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className={`text-center space-y-4 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex justify-center">
          <div className="relative">
            <Rocket className="h-20 w-20 text-purple-400" />
            <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white">
          Welcome to Subscribr, {userData?.name || 'Creator'}!
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          You're about to revolutionize your YouTube content creation with AI-powered tools
        </p>

        <div className="flex items-center justify-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            7-Step Setup
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Gift className="h-3 w-3 mr-1" />
            5 Bonus Credits
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Star className="h-3 w-3 mr-1" />
            Early Adopter
          </Badge>
        </div>
      </div>

      {/* Video Placeholder */}
      <div className={`glass rounded-xl p-8 transition-all duration-700 delay-200 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">Platform Overview Video</p>
            <p className="text-sm text-gray-400 mt-2">2 min introduction</p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className={`space-y-4 transition-all duration-700 delay-400 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h2 className="text-xl font-semibold text-white text-center">
          What You'll Set Up Today
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass p-4 rounded-lg hover:bg-white/10 transition-all group"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 glass rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{feature.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What to Expect */}
      <div className={`glass rounded-lg p-6 transition-all duration-700 delay-600 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-lg font-semibold text-white mb-3">What to Expect</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>Quick 5-minute setup process</span>
          </li>
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>Connect your YouTube channel</span>
          </li>
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>Personalize your AI assistant</span>
          </li>
          <li className="flex items-center gap-2 text-gray-300">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>Create your first AI-powered script</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className={`text-center transition-all duration-700 delay-800 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          Let's Get Started
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          This will only take about 5 minutes
        </p>
      </div>
    </div>
  );
}