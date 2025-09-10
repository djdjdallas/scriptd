'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Mic,
  Zap,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Headphones,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';

export function VoiceStep({ userData, onComplete }) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trained, setTrained] = useState(false);

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

  const handleStartTraining = async () => {
    setIsTraining(true);
    
    // Simulate training progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTrainingProgress(i);
    }
    
    setIsTraining(false);
    setTrained(true);
    toast.success('Voice training completed! Your AI is ready.');
  };

  const handleSkip = async () => {
    await onComplete({ skipped: true });
  };

  const handleContinue = async () => {
    await onComplete({ trained });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Train Your AI Voice</h2>
        <p className="text-gray-400">
          Let our AI learn your unique style and tone
        </p>
      </div>

      {/* Hero Section */}
      <div className="glass rounded-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Mic className="h-12 w-12 text-white" />
            </div>
            <Zap className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          Create Scripts in Your Voice
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Our AI analyzes your existing content to understand your unique style, 
          tone, and vocabulary, then generates new scripts that sound authentically you.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className="glass rounded-lg p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{benefit.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{benefit.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Training Section */}
      {!trained ? (
        <div className="glass rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            How It Works
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">1</span>
              </div>
              <p className="text-gray-300">We analyze your YouTube channel content</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">2</span>
              </div>
              <p className="text-gray-300">AI learns your vocabulary and speaking patterns</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">3</span>
              </div>
              <p className="text-gray-300">Generate unlimited scripts in your voice</p>
            </div>
          </div>

          {isTraining && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Training AI...</span>
                <span className="text-white font-medium">{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                Analyzing your content style and patterns
              </p>
            </div>
          )}

          <Button
            onClick={handleStartTraining}
            disabled={isTraining}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            {isTraining ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Training in Progress...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Voice Training
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="glass rounded-lg p-6 bg-green-500/5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">
              Voice Training Complete!
            </h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Your AI has successfully learned your unique style. You can now generate 
            scripts that sound authentically like you.
          </p>

          <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
            <Headphones className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm text-white font-medium">Pro Tip</p>
              <p className="text-xs text-gray-400">
                The more content you create, the better your AI voice becomes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!trained && (
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 glass-button text-white"
          >
            Skip for Now
          </Button>
        )}
        
        {trained && (
          <Button
            onClick={handleContinue}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Info Box */}
      {!trained && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            You can always train your voice later from the Voice Training section
          </p>
        </div>
      )}
    </div>
  );
}