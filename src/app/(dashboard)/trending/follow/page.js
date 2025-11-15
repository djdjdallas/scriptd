'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { TransferToCalendar } from '@/components/trending/TransferToCalendar';
import { ActionPlanLoader } from '@/components/trending/ActionPlanLoader';

export default function FollowTrendPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelName = searchParams.get('channel') || 'TechVision Pro';
  const channelId = searchParams.get('channelId') || null;
  const topic = searchParams.get('topic') || 'AI Tools & Applications';
  const planId = searchParams.get('planId') || null; // Get planId if viewing existing plan
  const channelBio = searchParams.get('bio') ? decodeURIComponent(searchParams.get('bio')) : ''; // Get bio from URL
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [progressData, setProgressData] = useState(null);
  const isGenerating = useRef(false);
  const currentPlanKey = useRef('');
  const abortControllerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    console.log(`🔄 useEffect triggered for: ${channelName} (${topic})`);

    // Create unique key for this plan request
    const planKey = `${planId || 'new'}-${channelName}-${topic}`;

    // Prevent duplicate calls for the same plan
    if (currentPlanKey.current === planKey && isGenerating.current) {
      console.log('⚠️ Action plan generation already in progress, skipping duplicate call');
      return;
    }

    // Abort any pending request from previous navigation (different plan)
    if (abortControllerRef.current && currentPlanKey.current !== planKey) {
      console.log('🛑 Aborting previous action plan request');
      abortControllerRef.current.abort();
      isGenerating.current = false; // Reset the flag
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    currentPlanKey.current = planKey;
    isGenerating.current = true;

    const initializePlan = async () => {
      try {
        if (planId) {
          // If we have a planId, fetch the existing plan
          await fetchExistingPlan();
        } else {
          // Otherwise generate a new one
          await generateActionPlan();
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('⏹️ Action plan request was cancelled');
        }
      } finally {
        isGenerating.current = false;
      }
    };

    initializePlan();

    // Cleanup function runs when component unmounts or dependencies change
    return () => {
      // Only abort if we're navigating away (plan key will change)
      console.log('🧹 useEffect cleanup running');
    };
  }, [planId, channelName, channelId, topic]);

  const fetchExistingPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trending/action-plans/${planId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch action plan');
      }

      const existingPlan = await response.json();
      
      // Use the plan_data from the stored plan
      const processedPlan = {
        ...existingPlan.plan_data,
        channel: existingPlan.channel_name,
        topic: existingPlan.topic
      };
      
      setActionPlan(processedPlan);
    } catch (error) {
      console.error('Error fetching existing plan:', error);
      toast.error('Failed to load action plan');
      // Fall back to generating a new plan
      generateActionPlan();
    } finally {
      setLoading(false);
    }
  };

  const pollForProgress = async (sessionId) => {
    try {
      const response = await fetch(`/api/trending/action-plan-progress?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const generateActionPlan = async () => {
    // Double-check we're not already loading
    if (loading && actionPlan !== null) {
      console.log('⚠️ Action plan already loaded, skipping generation');
      return;
    }

    setLoading(true);

    // Generate session ID for progress tracking
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    sessionIdRef.current = sessionId;

    // Start polling for progress
    progressIntervalRef.current = setInterval(() => {
      pollForProgress(sessionId);
    }, 1000);

    try {
      console.log(`🎬 Generating action plan for: ${channelName} (${topic})`);

      // Call the API to generate a real action plan
      const response = await fetch('/api/trending/action-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
          channelId,
          topic,
          sessionId, // Pass session ID for progress tracking
          channelBio, // Pass bio for better niche detection
        }),
        signal: abortControllerRef.current?.signal, // Add abort signal
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle free plan limit with special UI
        if (errorData.showUpgrade && response.status === 403) {
          // Show upgrade modal or redirect
          toast.error(errorData.message, {
            duration: 10000, // Show for 10 seconds
            action: {
              label: 'Upgrade Now',
              onClick: () => router.push(errorData.upgradeUrl || '/pricing')
            }
          });

          // Optionally set state to show upgrade UI
          setActionPlan({
            isUpgradeRequired: true,
            message: errorData.message,
            benefits: errorData.benefits,
            upgradeUrl: errorData.upgradeUrl
          });

          return; // Don't throw error, handle gracefully
        }

        throw new Error(errorData.error || 'Failed to generate action plan');
      }

      const actionPlanData = await response.json();
      console.log(`✅ Received action plan for: ${actionPlanData.channel}`);
      
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

      // Stop polling for progress
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } catch (error) {
      // Don't show error if request was intentionally cancelled
      if (error.name === 'AbortError') {
        console.log('⏹️ Action plan generation was cancelled');
        // Stop polling for progress
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        return;
      }

      console.error('Error generating action plan:', error);
      toast.error(error.message || 'Failed to generate action plan');

      // Stop polling for progress on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

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

  const useTemplate = (template) => {
    // Navigate to script workflow with template data pre-filled
    const params = new URLSearchParams({
      templateTitle: template.title || '',
      templateType: template.type || '',
      templateFormat: template.format || template.structure || '',
      templateHook: template.hook || '',
      templateDuration: template.duration || '',
      topic: actionPlan.detectedNiche || actionPlan.topic || topic, // Use detected niche for specific topic
      niche: actionPlan.detectedNiche || '',
    });

    router.push(`/scripts/create?${params.toString()}`);
    toast.success('Opening script workflow with template...');
  };

  const useContentIdea = (idea) => {
    // Navigate to script workflow with content idea pre-filled
    const params = new URLSearchParams({
      contentIdeaTitle: idea.title || '',
      contentIdeaHook: idea.hook || '',
      contentIdeaDescription: idea.description || '',
      contentIdeaEvent: idea.basedOnEvent || '',
      contentIdeaSpecifics: idea.specifics || '',
      estimatedViews: idea.estimatedViews || '',
      topic: actionPlan.detectedNiche || actionPlan.topic || topic, // Use detected niche for specific topic
      niche: actionPlan.detectedNiche || '',
      sourceType: 'content-idea', // Flag to identify this as a content idea
    });

    router.push(`/scripts/create?${params.toString()}`);
    toast.success('Opening script workflow with content idea...');
  };

  const exportPlan = () => {
    if (!actionPlan) {
      toast.error('No plan to export');
      return;
    }

    try {
      // Create a formatted text version of the plan
      let exportContent = `# ACTION PLAN: ${actionPlan.channel}\n`;
      exportContent += `## Topic: ${actionPlan.topic}\n`;
      exportContent += `## Strategy: ${actionPlan.strategy}\n`;
      exportContent += `## Timeline: ${actionPlan.timeline}\n\n`;
      
      exportContent += `---\n\n`;
      
      // Add estimated results
      exportContent += `### 📊 ESTIMATED RESULTS\n`;
      exportContent += `- Views: ${actionPlan.estimatedResults?.views || 'TBD'}\n`;
      exportContent += `- Subscribers: ${actionPlan.estimatedResults?.subscribers || 'TBD'}\n`;
      exportContent += `- Revenue: ${actionPlan.estimatedResults?.revenue || 'TBD'}\n\n`;
      
      exportContent += `---\n\n`;
      
      // Add weekly plan
      if (actionPlan.weeklyPlan && actionPlan.weeklyPlan.length > 0) {
        exportContent += `### 📅 WEEKLY BREAKDOWN\n\n`;
        actionPlan.weeklyPlan.forEach((week) => {
          exportContent += `#### Week ${week.week}: ${week.theme}\n`;
          week.tasks.forEach((task, taskIndex) => {
            const isCompleted = completedSteps.has(task.id);
            exportContent += `${taskIndex + 1}. [${isCompleted ? 'x' : ' '}] ${task.task} (Priority: ${task.priority})\n`;
          });
          exportContent += `\n`;
        });
      }
      
      // Add content templates
      if (actionPlan.contentTemplates && actionPlan.contentTemplates.length > 0) {
        exportContent += `---\n\n`;
        exportContent += `### 📝 CONTENT TEMPLATES\n\n`;
        actionPlan.contentTemplates.forEach((template, index) => {
          exportContent += `**${index + 1}. ${template.title}**\n`;
          exportContent += `- Format: ${template.format || template.structure || 'Standard format'}\n`;
          exportContent += `- Hook: ${template.hook || 'Open with a strong hook to grab attention...'}\n`;
          exportContent += `- Structure: ${template.structure || 'Hook → Content → CTA'}\n`;
          exportContent += `- Duration: ${template.duration}\n\n`;
        });
      }
      
      // Add keywords
      if (actionPlan.keywords && actionPlan.keywords.length > 0) {
        exportContent += `---\n\n`;
        exportContent += `### 🔍 KEYWORDS & HASHTAGS\n\n`;
        exportContent += actionPlan.keywords.join(', ') + '\n\n';
      }
      
      // Add equipment
      if (actionPlan.equipment && actionPlan.equipment.length > 0) {
        exportContent += `---\n\n`;
        exportContent += `### 🎥 RECOMMENDED EQUIPMENT\n\n`;
        actionPlan.equipment.forEach((item, index) => {
          exportContent += `${index + 1}. **${item.item}**\n`;
          exportContent += `   - Purpose: ${item.purpose || 'Essential for content production'}\n`;
          exportContent += `   - Budget: ${item.budget}\n`;
          if (item.essential !== undefined) {
            exportContent += `   - Essential: ${item.essential ? 'Yes' : 'No'}\n`;
          }
          exportContent += `\n`;
        });
      }
      
      // Add success metrics
      if (actionPlan.successMetrics) {
        exportContent += `---\n\n`;
        exportContent += `### 📈 SUCCESS METRICS BY WEEK\n\n`;
        Object.entries(actionPlan.successMetrics).forEach(([week, metrics]) => {
          exportContent += `**${week.charAt(0).toUpperCase() + week.slice(1)}:**\n`;
          exportContent += `- Views: ${metrics.views}\n`;
          exportContent += `- Subscribers: ${metrics.subscribers}\n`;
          exportContent += `- Engagement: ${metrics.engagement}\n\n`;
        });
      }
      
      exportContent += `---\n\n`;
      exportContent += `Generated: ${new Date().toLocaleDateString()}\n`;
      exportContent += `Source: GenScript AI Trend Analysis\n`;
      
      // Create blob and download
      const blob = new Blob([exportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `action-plan-${actionPlan.channel.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Action plan exported successfully!');
    } catch (error) {
      console.error('Error exporting plan:', error);
      toast.error('Failed to export plan');
    }
  };

  if (loading || !actionPlan) {
    return <ActionPlanLoader channelName={channelName} topic={topic} progressData={progressData} />;
  }

  const completionRate = Math.round((completedSteps.size / 20) * 100); // 20 total tasks

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Upgrade Required Message */}
      {actionPlan?.isUpgradeRequired && (
        <div className="glass-card p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 animate-reveal">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Free Plan Limit Reached</h2>
              <p className="text-gray-300 mb-4">{actionPlan.message}</p>

              {actionPlan.benefits && (
                <div className="mb-4">
                  <p className="text-white font-semibold mb-2">Upgrade to unlock:</p>
                  <ul className="space-y-2">
                    {actionPlan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(actionPlan.upgradeUrl || '/pricing')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
                <Button
                  onClick={() => router.push('/trending/action-plans')}
                  variant="outline"
                  className="glass-button text-white"
                >
                  View My Action Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Plan Success Banner */}
      {actionPlan?.isFirstFreePlan && !actionPlan?.isUpgradeRequired && (
        <div className="glass-card p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-2 border-green-500/30 animate-reveal">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Sparkles className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{actionPlan.planMessage}</h3>
              {actionPlan.upgradePrompt && (
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-gray-300 text-sm leading-none">{actionPlan.upgradePrompt.message}</p>
                  <Button
                    onClick={() => router.push(actionPlan.upgradePrompt.url)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  >
                    {actionPlan.upgradePrompt.cta}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            <p className="text-sm text-gray-400 leading-none">Completed</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="glass-card p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Ready to start?</h3>
            <p className="text-gray-400 text-sm leading-none">Follow this plan to ride the trend wave</p>
          </div>
          <div className="flex gap-3">
            <TransferToCalendar 
              actionPlan={actionPlan} 
              actionPlanId={planId}
            />
            <Button 
              className="glass-button text-white"
              onClick={exportPlan}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Plan
            </Button>
            <Button 
              className="glass-button text-white"
              onClick={() => toast.info('Reminders feature coming soon!')}
            >
              <Bell className="h-4 w-4 mr-2" />
              Set Reminders
            </Button>
            <Button 
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
              onClick={() => toast.success('Good luck with Week 1! Start with the first task.')}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Start Week 1
            </Button>
          </div>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1 leading-none">Strategy</p>
            <p className="text-lg font-bold text-white">{actionPlan.strategy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1 leading-none">Timeline</p>
            <p className="text-lg font-bold text-white">{actionPlan.timeline}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1 leading-none">Est. Views</p>
            <p className="text-lg font-bold text-green-400">{actionPlan.estimatedResults.views}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1 leading-none">Est. Subscribers</p>
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
          <div key={week.week} className="glass-card p-6 animate-reveal" style={{ animationDelay: `${0.3 + weekIndex * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Week {week.week}: {week.theme}</h3>
                <p className="text-sm text-gray-400 leading-none">Days {(week.week - 1) * 7 + 1}-{week.week * 7}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 leading-none">Target:</span>
                <span className="text-sm font-bold text-green-400 leading-none">
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

      {/* Specific Content Ideas - if available */}
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
                <p className="text-purple-300 text-sm mb-2 leading-none">Hook: {idea.hook}</p>
                <p className="text-gray-400 text-sm mb-2 leading-normal">{idea.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-400">Est. {idea.estimatedViews} views</span>
                  <Button
                    size="sm"
                    className="glass-button text-xs"
                    onClick={() => useContentIdea(idea)}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Use Idea
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <p className="text-sm text-purple-300 mb-3 leading-none">{template.title}</p>
                <p className="text-xs text-gray-400 mb-3">{template.structure}</p>
                <Button
                  size="sm"
                  className="w-full glass-button text-white"
                  onClick={() => useTemplate(template)}
                >
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
              <span key={index} className="glass px-3 py-1 rounded-full text-sm text-purple-300 leading-none">
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
                <span className="text-sm text-gray-300 leading-none">{item.item}</span>
                <span className="text-xs text-gray-400">{item.budget}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                <p className="text-sm text-gray-400 mb-2 leading-none">Channels to Study:</p>
                <div className="space-y-1">
                  {actionPlan.competitorAnalysis.topChannels.map((channel, i) => (
                    <p key={i} className="text-sm text-purple-300 leading-normal">• {channel}</p>
                  ))}
                </div>
              </div>
            )}
            {actionPlan.competitorAnalysis.successFactors && (
              <div>
                <p className="text-sm text-gray-400 mb-2 leading-none">Success Factors:</p>
                <div className="space-y-1">
                  {actionPlan.competitorAnalysis.successFactors.map((factor, i) => (
                    <p key={i} className="text-sm text-green-300 leading-normal">• {factor}</p>
                  ))}
                </div>
              </div>
            )}
            {actionPlan.competitorAnalysis.gaps && (
              <div>
                <p className="text-sm text-gray-400 mb-2 leading-none">Opportunities:</p>
                <div className="space-y-1">
                  {actionPlan.competitorAnalysis.gaps.map((gap, i) => (
                    <p key={i} className="text-sm text-yellow-300 leading-normal">• {gap}</p>
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
                <p className="text-sm text-green-400 font-semibold leading-none">{method.potential}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}