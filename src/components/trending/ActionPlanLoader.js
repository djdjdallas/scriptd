'use client';

import { useState, useEffect } from 'react';
import {
  Rocket,
  Search,
  Brain,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Calendar,
  Lightbulb,
  Target,
  Loader2
} from 'lucide-react';

const STAGES = [
  {
    id: 'analyzing',
    title: 'Analyzing Channel',
    description: 'Understanding your channel\'s niche and audience',
    icon: Search,
    duration: 3000,
    tips: [
      'Examining content patterns',
      'Identifying target demographics',
      'Analyzing competitor channels'
    ]
  },
  {
    id: 'research',
    title: 'Finding Real Events',
    description: 'Searching for trending topics and current events in your niche',
    icon: TrendingUp,
    duration: 5000,
    tips: [
      'Scanning news sources',
      'Identifying viral trends',
      'Finding content opportunities'
    ]
  },
  {
    id: 'generating',
    title: 'Crafting Your Strategy',
    description: 'Creating personalized action plan with AI',
    icon: Brain,
    duration: 7000,
    tips: [
      'Generating weekly tasks',
      'Creating content templates',
      'Planning monetization strategy'
    ]
  },
  {
    id: 'validating',
    title: 'Validating Ideas',
    description: 'Ensuring content ideas match real-world events',
    icon: CheckCircle,
    duration: 3000,
    tips: [
      'Cross-referencing with trends',
      'Verifying market demand',
      'Optimizing for engagement'
    ]
  },
  {
    id: 'enriching',
    title: 'Adding Final Touches',
    description: 'Enriching your plan with extra insights',
    icon: Sparkles,
    duration: 2000,
    tips: [
      'Adding success metrics',
      'Including equipment lists',
      'Finalizing timeline'
    ]
  }
];

export function ActionPlanLoader({ channelName, topic, progressData }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);
  const [realProgressMessage, setRealProgressMessage] = useState(null);

  // Map progress data stages to our UI stages
  useEffect(() => {
    if (progressData) {
      const stageMap = {
        'initializing': 0,
        'analyzing': 0,
        'research': 1,
        'generating': 2,
        'validating': 3,
        'enriching': 4,
        'completed': 5
      };

      const mappedIndex = stageMap[progressData.stage] || 0;
      setCurrentStageIndex(Math.min(mappedIndex, STAGES.length - 1));
      setProgress(progressData.progress || 0);
      setRealProgressMessage(progressData.message);

      // Mark completed stages
      const newCompleted = new Set();
      for (let i = 0; i < mappedIndex; i++) {
        newCompleted.add(STAGES[i].id);
      }
      setCompletedStages(newCompleted);
    }
  }, [progressData]);

  useEffect(() => {
    // Only run simulation if no real progress data
    if (progressData) return;

    // Simulate progression through stages
    let stageTimeout;
    let tipInterval;

    const currentStage = STAGES[currentStageIndex];

    if (currentStageIndex < STAGES.length) {
      // Start progress animation for current stage
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + (100 / (currentStage.duration / 100));
        });
      }, 100);

      // Rotate through tips for current stage
      tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % currentStage.tips.length);
      }, 2000);

      // Move to next stage after duration
      stageTimeout = setTimeout(() => {
        setCompletedStages(prev => new Set([...prev, currentStage.id]));
        setProgress(0);
        setCurrentTip(0);

        if (currentStageIndex < STAGES.length - 1) {
          setCurrentStageIndex(prev => prev + 1);
        }
      }, currentStage.duration);

      return () => {
        clearTimeout(stageTimeout);
        clearInterval(tipInterval);
        clearInterval(progressInterval);
      };
    }
  }, [currentStageIndex, progressData]);

  const currentStage = STAGES[currentStageIndex];
  const overallProgress = ((completedStages.size + (progress / 100)) / STAGES.length) * 100;

  return (
    <div className="min-h-[600px] flex items-center justify-center p-8">
      <div className="glass-card p-8 max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Rocket className="h-12 w-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Generating Your Action Plan
          </h2>
          <p className="text-gray-400 text-sm">
            Creating personalized strategy for <span className="text-purple-400 font-semibold">{channelName}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Topic: {topic}
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Stages Timeline */}
        <div className="space-y-4">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStageIndex;
            const isCompleted = completedStages.has(stage.id);
            const isUpcoming = index > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-4 transition-all duration-300 ${
                  isActive ? 'scale-105' : ''
                }`}
              >
                {/* Stage Icon */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-green-500/20 border-2 border-green-500' :
                    isActive ? 'bg-purple-500/20 border-2 border-purple-500 animate-pulse' :
                    'bg-gray-800 border-2 border-gray-700'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                  ) : (
                    <Icon className={`h-5 w-5 ${isUpcoming ? 'text-gray-600' : 'text-gray-400'}`} />
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${
                      isCompleted ? 'text-green-400' :
                      isActive ? 'text-white' :
                      'text-gray-500'
                    }`}>
                      {stage.title}
                    </h3>
                    {isActive && (
                      <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>

                  <p className={`text-sm ${
                    isActive ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {stage.description}
                  </p>

                  {/* Show tips for active stage */}
                  {isActive && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-purple-400">
                        <Lightbulb className="h-3 w-3" />
                        <span className="animate-fade-in">
                          {realProgressMessage || stage.tips[currentTip]}
                        </span>
                      </div>

                      {/* Stage Progress Bar */}
                      <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fun Facts / Tips */}
        <div className="glass p-4 rounded-lg border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-purple-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-gray-300 font-medium">Did you know?</p>
              <p className="text-xs text-gray-400">
                Action plans based on real events have 3x higher success rates than generic strategies.
                We're analyzing {STAGES.length} different data points to maximize your growth potential!
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="text-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 inline mr-1" />
          Estimated time remaining: ~{Math.ceil((STAGES.slice(currentStageIndex).reduce((acc, stage) => acc + stage.duration, 0) / 1000))} seconds
        </div>
      </div>
    </div>
  );
}