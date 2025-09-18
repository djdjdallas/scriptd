'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Sparkles,
  Users,
  Zap,
  ChevronLeft,
  Calendar,
  Clock,
  Target,
  FileText,
  Video,
  Hash,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Rocket,
  BookOpen,
  Edit3,
  Camera,
  Mic,
  Share2,
  Download,
  Bell,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function FollowTrendPage() {
  const searchParams = useSearchParams();
  const channelName = searchParams.get('channel') || 'TechVision Pro';
  const topic = searchParams.get('topic') || 'AI Tools & Applications';
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    generateActionPlan();
  }, [channelName, topic]);

  const generateActionPlan = async () => {
    setLoading(true);
    try {
      // Call the API to generate a real action plan
      const response = await fetch('/api/trending/action-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
          topic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate action plan');
      }

      const actionPlanData = await response.json();
      
      // Ensure the plan has all required fields
      const processedPlan = {
        ...actionPlanData,
        channel: actionPlanData.channel || channelName,
        topic: actionPlanData.topic || topic,
        strategy: actionPlanData.strategy || 'Growth Strategy',
        timeline: actionPlanData.timeline || '30 Days',
        estimatedResults: actionPlanData.estimatedResults || {
          views: '10K-50K',
          subscribers: '+100-500',
          revenue: '$100-500'
        },
        weeklyPlan: actionPlanData.weeklyPlan || [],
        contentTemplates: actionPlanData.contentTemplates || [],
        keywords: actionPlanData.keywords || [],
        equipment: actionPlanData.equipment || [],
        successMetrics: actionPlanData.successMetrics || {
          week1: { views: '1K', subscribers: '+10', engagement: '5%' },
          week2: { views: '5K', subscribers: '+50', engagement: '6%' },
          week3: { views: '15K', subscribers: '+150', engagement: '7%' },
          week4: { views: '30K', subscribers: '+300', engagement: '8%' }
        }
      };
      
      setActionPlan(processedPlan);
      toast.success('Action plan generated successfully!');
    } catch (error) {
      console.error('Error generating action plan:', error);
      toast.error(error.message || 'Failed to generate action plan');
      
      // Set a basic fallback plan if API fails
      setActionPlan({
        channel: channelName,
        topic: topic,
        strategy: 'Basic Growth Strategy',
        timeline: '30 Days',
        estimatedResults: {
          views: '5K-20K',
          subscribers: '+50-200',
          revenue: '$50-200'
        },
        weeklyPlan: [
          {
            week: 1,
            theme: 'Planning',
            tasks: [
              { id: 'w1t1', task: 'Research your niche', priority: 'high' },
              { id: 'w1t2', task: 'Create content plan', priority: 'high' },
            ]
          },
          {
            week: 2,
            theme: 'Creation',
            tasks: [
              { id: 'w2t1', task: 'Create your first videos', priority: 'high' },
              { id: 'w2t2', task: 'Design thumbnails', priority: 'medium' },
            ]
          },
          {
            week: 3,
            theme: 'Publishing',
            tasks: [
              { id: 'w3t1', task: 'Upload and optimize videos', priority: 'high' },
              { id: 'w3t2', task: 'Promote on social media', priority: 'medium' },
            ]
          },
          {
            week: 4,
            theme: 'Analysis',
            tasks: [
              { id: 'w4t1', task: 'Review analytics', priority: 'high' },
              { id: 'w4t2', task: 'Plan improvements', priority: 'high' },
            ]
          }
        ],
        contentTemplates: [],
        keywords: [topic],
        equipment: [],
        successMetrics: {
          week1: { views: '100', subscribers: '+5', engagement: '3%' },
          week2: { views: '500', subscribers: '+20', engagement: '4%' },
          week3: { views: '2K', subscribers: '+50', engagement: '5%' },
          week4: { views: '5K', subscribers: '+100', engagement: '6%' }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading || !actionPlan) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Rocket className="h-12 w-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Generating your action plan...</p>
          <p className="text-gray-400 text-sm mt-2">Creating personalized strategy</p>
        </div>
      </div>
    );
  }

  const completionRate = Math.round((completedSteps.size / 20) * 100); // 20 total tasks

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <Link href="/trending">
          <Button variant="ghost" className="glass-button mb-4 text-gray-400 hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Trending
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Rocket className="h-10 w-10 text-purple-400" />
              Follow Trend Action Plan
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-gray-400 mt-2">
              Your personalized strategy for {actionPlan.topic}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">{completionRate}%</div>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Strategy</p>
            <p className="text-lg font-bold text-white">{actionPlan.strategy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Timeline</p>
            <p className="text-lg font-bold text-white">{actionPlan.timeline}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Est. Views</p>
            <p className="text-lg font-bold text-green-400">{actionPlan.estimatedResults.views}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Est. Subscribers</p>
            <p className="text-lg font-bold text-blue-400">{actionPlan.estimatedResults.subscribers}</p>
          </div>
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-400" />
          30-Day Action Plan
        </h2>
        
        {actionPlan.weeklyPlan.map((week, weekIndex) => (
          <div key={week.week} className="glass-card p-6 animate-reveal" style={{ animationDelay: `${0.2 + weekIndex * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Week {week.week}: {week.theme}</h3>
                <p className="text-sm text-gray-400">Days {(week.week - 1) * 7 + 1}-{week.week * 7}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Target:</span>
                <span className="text-sm font-bold text-green-400">
                  {actionPlan.successMetrics[`week${week.week}`].views} views
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {week.tasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => toggleStep(task.id)}
                >
                  <button className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    completedSteps.has(task.id) 
                      ? 'bg-green-400 border-green-400' 
                      : 'border-gray-600 hover:border-purple-400'
                  }`}>
                    {completedSteps.has(task.id) && (
                      <CheckCircle className="h-3 w-3 text-black" />
                    )}
                  </button>
                  <span className={`flex-1 ${completedSteps.has(task.id) ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                    {task.task}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Content Templates */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-purple-400" />
          Content Templates
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {actionPlan.contentTemplates.map((template, index) => (
            <TiltCard key={index}>
              <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <Video className="h-5 w-5 text-red-400" />
                  <span className="text-xs text-gray-400">{template.duration}</span>
                </div>
                <h4 className="text-white font-bold mb-2">{template.type}</h4>
                <p className="text-sm text-purple-300 mb-3">{template.title}</p>
                <p className="text-xs text-gray-400 mb-3">{template.structure}</p>
                <Button size="sm" className="w-full glass-button text-white">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Keywords & Equipment */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5 text-purple-400" />
            Target Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {actionPlan.keywords.map((keyword, index) => (
              <span key={index} className="glass px-3 py-1 rounded-full text-sm text-purple-300">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-400" />
            Equipment Needed
          </h3>
          <div className="space-y-2">
            {actionPlan.equipment.filter(e => e.essential).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{item.item}</span>
                <span className="text-xs text-gray-400">{item.budget}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Ideas - if available */}
      {actionPlan.contentIdeas && actionPlan.contentIdeas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            Specific Content Ideas
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {actionPlan.contentIdeas.map((idea, index) => (
              <div key={index} className="glass-card p-4">
                <h4 className="text-white font-bold mb-2">{idea.title}</h4>
                <p className="text-purple-300 text-sm mb-2">Hook: {idea.hook}</p>
                <p className="text-gray-400 text-sm mb-2">{idea.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-400">Est. {idea.estimatedViews} views</span>
                  <Button size="sm" className="glass-button text-xs">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Use Idea
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Analysis - if available */}
      {actionPlan.competitorAnalysis && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Competitor Analysis
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {actionPlan.competitorAnalysis.topChannels && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Channels to Study:</p>
                <div className="space-y-1">
                  {actionPlan.competitorAnalysis.topChannels.map((channel, i) => (
                    <p key={i} className="text-sm text-purple-300">• {channel}</p>
                  ))}
                </div>
              </div>
            )}
            {actionPlan.competitorAnalysis.successFactors && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Success Factors:</p>
                <div className="space-y-1">
                  {actionPlan.competitorAnalysis.successFactors.map((factor, i) => (
                    <p key={i} className="text-sm text-green-300">• {factor}</p>
                  ))}
                </div>
              </div>
            )}
            {actionPlan.competitorAnalysis.gaps && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Opportunities:</p>
                <div className="space-y-1">
                  {actionPlan.competitorAnalysis.gaps.map((gap, i) => (
                    <p key={i} className="text-sm text-yellow-300">• {gap}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monetization Strategy - if available */}
      {actionPlan.monetizationStrategy && actionPlan.monetizationStrategy.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-green-400" />
            Monetization Strategy
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionPlan.monetizationStrategy.map((method, index) => (
              <div key={index} className="glass-card p-4">
                <h4 className="text-white font-semibold mb-2">{method.method}</h4>
                <p className="text-xs text-gray-400 mb-1">Timeline: {method.timeline}</p>
                <p className="text-sm text-green-400 font-semibold">{method.potential}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="glass-card p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Ready to start?</h3>
            <p className="text-gray-400 text-sm">Follow this plan to ride the trend wave</p>
          </div>
          <div className="flex gap-3">
            <Button className="glass-button text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Plan
            </Button>
            <Button className="glass-button text-white">
              <Bell className="h-4 w-4 mr-2" />
              Set Reminders
            </Button>
            <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              <Rocket className="h-4 w-4 mr-2" />
              Start Week 1
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}