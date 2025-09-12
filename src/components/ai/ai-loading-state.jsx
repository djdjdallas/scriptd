'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

const loadingMessages = {
  contentAnalysis: [
    'Analyzing your content with AI...',
    'Evaluating content quality...',
    'Processing sentiment patterns...',
    'Generating performance insights...',
    'Finalizing recommendations...'
  ],
  trendAnalysis: [
    'Scanning current trends...',
    'Analyzing market patterns...',
    'Predicting trend trajectories...',
    'Calculating impact scores...',
    'Preparing actionable insights...'
  ],
  videoIdeas: [
    'Analyzing your channel performance...',
    'Researching trending topics...',
    'Generating creative concepts...',
    'Calculating viral potential...',
    'Crafting personalized ideas...'
  ],
  seoOptimization: [
    'Analyzing current SEO performance...',
    'Researching keywords...',
    'Optimizing metadata...',
    'Generating title variations...',
    'Finalizing SEO strategy...'
  ],
  default: [
    'Processing your request...',
    'Analyzing data patterns...',
    'Generating insights...',
    'Optimizing recommendations...',
    'Finalizing analysis...'
  ]
};

export function AILoadingState({ feature = 'default', message = null }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = loadingMessages[feature] || loadingMessages.default;

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 800);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [messages.length]);

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-center text-white font-medium">
          {message || messages[messageIndex]}
        </p>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
        <p className="text-center text-sm text-gray-400">
          {Math.round(progress)}% complete
        </p>
      </div>
      
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}