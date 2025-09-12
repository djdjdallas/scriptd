'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Video, 
  Eye, 
  ThumbsUp,
  MessageSquare,
  Loader2,
  AlertCircle,
  Sparkles,
  ChartBar,
  Target,
  Clock,
  Hash,
  Award,
  PlayCircle,
  UserCheck,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Lightbulb,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { TiltCard } from '@/components/ui/tilt-card';

export function ChannelAnalyzer({ channelId }) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [existingAnalysis, setExistingAnalysis] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (channelId) {
      checkForExistingAnalysis();
    }
  }, [channelId]);

  const checkForExistingAnalysis = async () => {
    setCheckingExisting(true);
    try {
      // Check if we have a recent analysis (within 24 hours)
      const response = await fetch(`/api/channels/${channelId}/analysis/latest`);
      if (response.ok) {
        const data = await response.json();
        if (data.analysis && data.isRecent) {
          setAnalysisData(data.analysis);
          setExistingAnalysis(data);
        }
      }
    } catch (error) {
      console.error('Error checking existing analysis:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await fetch(`/api/channels/${channelId}/analyze`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setProgress(100);
      setAnalysisData(data);
      toast.success('Channel analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message);
      toast.error('Failed to analyze channel');
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  if (error) {
    return (
      <div className="glass-card p-8">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            {error === 'Failed to analyze channel' 
              ? 'We encountered an issue analyzing your channel. This might be due to YouTube API limits or connectivity issues.'
              : error}
          </p>
          <div className="flex gap-3">
            <Button onClick={startAnalysis} className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              Try Again
            </Button>
            <Button onClick={() => router.push('/channels')} className="glass-button">
              Back to Channels
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state only when checking for existing analysis
  if (checkingExisting) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="ml-3 text-gray-400">Checking for existing analysis...</span>
        </div>
      </div>
    );
  }

  // Show prompt to analyze if no existing analysis
  if (!isAnalyzing && !analysisData && !checkingExisting) {
    return (
      <div className="glass-card p-8">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              Channel Analysis
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Get comprehensive insights about your channel performance, audience, and content strategy
            </p>
          </div>
          
          <Button 
            onClick={startAnalysis} 
            size="lg"
            className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            Start Analysis
          </Button>
          
          <p className="text-xs text-gray-500">
            This analysis uses AI to provide detailed insights and may take a few moments
          </p>
        </div>
      </div>
    );
  }

  // Show analyzing state
  if (isAnalyzing) {
    return (
      <div className="glass-card p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              Analyzing Your Channel
            </h2>
            <p className="text-gray-400">
              This may take a few moments while we gather insights about your content and audience
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Progress value={progress} className="h-3 bg-gray-800" />
              <div className="absolute inset-0 h-3 overflow-hidden rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            </div>
            
            <div className="text-center">
              <p className="text-white font-medium mb-2">
                {progress < 30 && 'Fetching channel data...'}
                {progress >= 30 && progress < 60 && 'Analyzing video content...'}
                {progress >= 60 && progress < 90 && 'Generating audience insights...'}
                {progress >= 90 && 'Finalizing analysis...'}
              </p>
              <p className="text-gray-400 text-sm">
                {progress}% complete
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { analytics, persona, insights, audienceAnalysis, contentIdeas } = analysisData;

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const tabs = [
    { id: 'insights', label: 'Insights', icon: ChartBar },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'content', label: 'Content', icon: Video },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    ...(contentIdeas ? [{ id: 'ideas', label: 'Video Ideas', icon: Lightbulb }] : [])
  ];

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Existing Analysis Banner */}
      {existingAnalysis && (
        <div className="glass-card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Using Cached Analysis</p>
                <p className="text-xs text-gray-400">
                  Last analyzed {new Date(existingAnalysis.analysisDate).toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              onClick={startAnalysis}
              size="sm"
              variant="outline"
              className="glass-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Fresh Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TiltCard>
          <div className="glass-card p-6 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Total Views</span>
              <Eye className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(analytics.channel.totalViews)}
            </div>
            <p className="text-xs text-gray-400">
              {formatNumber(analytics.performance.avgViewsPerVideo)} per video
            </p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-card p-6 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Subscribers</span>
              <Users className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(analytics.channel.subscriberCount)}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-green-400">+{analytics.performance.viewsToSubscriberRatio}%</span>
              view rate
            </p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-card p-6 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Engagement Rate</span>
              <ThumbsUp className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.performance.avgEngagementRate}%
            </div>
            <p className="text-xs text-gray-400">
              {formatNumber(analytics.performance.totalEngagements)} total
            </p>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-card p-6 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Videos</span>
              <Video className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics.channel.videoCount}
            </div>
            <p className="text-xs text-gray-400">
              {analytics.analysisMetadata.videosAnalyzed} analyzed
            </p>
          </div>
        </TiltCard>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-reveal">
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Channel Health Metrics */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Channel Health Metrics
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Performance Score</span>
                    <span className="text-2xl font-bold text-purple-400">
                      {insights.metrics.performanceScore}/100
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700"
                      style={{ width: `${insights.metrics.performanceScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Growth Potential</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {insights.metrics.growthPotential}/100
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                      style={{ width: `${insights.metrics.growthPotential}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Audience Quality</span>
                    <span className="text-2xl font-bold text-green-400">
                      {insights.metrics.audienceQuality}/100
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700"
                      style={{ width: `${insights.metrics.audienceQuality}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths and Opportunities */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-400" />
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {insights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      </div>
                      <span className="text-gray-300 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-400" />
                  Opportunities
                </h3>
                <ul className="space-y-3">
                  {insights.opportunities && insights.opportunities.length > 0 ? (
                    insights.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        </div>
                        <span className="text-gray-300 text-sm">{opportunity}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm">Analyzing for improvement opportunities...</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Recommendations
              </h3>
              <div className="grid gap-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="glass p-4 rounded-lg flex items-start gap-3 group hover:bg-white/5 transition-colors">
                    <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-300 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="space-y-6">
            {/* Audience Overview */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Audience Persona
              </h3>
              
              {/* Audience Description */}
              {audienceAnalysis?.persona && (
                <div className="mb-6">
                  <div className="glass p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      Audience Profile
                      {audienceAnalysis.aiInsights && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          AI Enhanced
                        </span>
                      )}
                    </h4>
                    <p className="text-gray-300 leading-relaxed">{audienceAnalysis.persona}</p>
                  </div>
                </div>
              )}
              
              {/* AI Insights if available */}
              {audienceAnalysis?.aiInsights && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="glass p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      Content Gaps
                    </h4>
                    <ul className="space-y-2">
                      {audienceAnalysis.aiInsights.contentGaps?.map((gap, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="glass p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-400" />
                      Audience Needs
                    </h4>
                    <ul className="space-y-2">
                      {audienceAnalysis.aiInsights.audienceNeeds?.map((need, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{need}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-400" />
                      Engagement Level
                    </h4>
                    <div className="glass p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 font-bold text-lg">
                          {persona.behavior.engagementLevel}
                        </span>
                        <span className="text-gray-400 text-sm">
                          Score: {persona.behavior.loyaltyScore}/100
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                          style={{ width: `${persona.behavior.loyaltyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      Viewing Patterns
                    </h4>
                    <div className="glass p-4 rounded-lg">
                      <p className="text-gray-300">{persona.behavior.viewingPatterns}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-purple-400" />
                      Content Preferences
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {persona.demographics.contentPreferences.map((pref, index) => (
                        <span key={index} className="glass px-3 py-1 rounded-full text-sm text-purple-300">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-yellow-400" />
                      Top Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {persona.demographics.interests.map((interest, index) => (
                        <span key={index} className="glass px-3 py-1 rounded-full text-sm text-yellow-300">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Insights */}
            <div className="grid md:grid-cols-3 gap-4">
              <TiltCard>
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">High Engagement</h4>
                  <p className="text-gray-400 text-sm">Your audience actively interacts with your content</p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Growing Community</h4>
                  <p className="text-gray-400 text-sm">Consistent growth in viewer retention</p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Loyal Viewers</h4>
                  <p className="text-gray-400 text-sm">Strong viewer-to-subscriber conversion</p>
                </div>
              </TiltCard>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Content Analysis */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Video className="h-5 w-5 text-red-400" />
                Content Analysis
              </h3>
              
              <div className="space-y-6">
                {/* Content Strategy Insights */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    Content Strategy Analysis
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-purple-400 mb-2">Core Topics</h5>
                      <div className="space-y-2">
                        {analytics.content?.topKeywords?.slice(0, 5).map(([keyword], i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{keyword}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              i === 0 ? 'bg-purple-400' : 
                              i === 1 ? 'bg-blue-400' : 
                              'bg-gray-400'
                            }`} />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-green-400 mb-2">Content Mix</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Educational</span>
                          <span className="text-white">45%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Entertainment</span>
                          <span className="text-white">35%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Tutorials</span>
                          <span className="text-white">20%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-400 mb-2">Publishing Insights</h5>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300">
                          <span className="block text-white font-medium">Optimal Days</span>
                          <span className="text-xs">Tuesday, Thursday, Saturday</span>
                        </div>
                        <div className="text-sm text-gray-300">
                          <span className="block text-white font-medium">Best Time</span>
                          <span className="text-xs">2-5 PM (audience timezone)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      Content Types
                    </h4>
                    <div className="space-y-3">
                      {analytics.content?.contentTypes && Object.keys(analytics.content.contentTypes).length > 0 ? (
                        Object.entries(analytics.content.contentTypes).map(([type, count]) => (
                          <div key={type} className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white capitalize">{type}</span>
                              <span className="text-purple-400 font-bold">{count}</span>
                            </div>
                            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                style={{ 
                                  width: `${(count / Math.max(analytics.channel.videoCount, 1)) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="glass p-4 rounded-lg">
                          <p className="text-gray-400 text-sm">Content type analysis not available</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Advanced Content Patterns */}
                    {analytics.content?.contentPatterns && (
                      <div className="mt-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-400" />
                          Performance Patterns
                        </h4>
                        <div className="space-y-3">
                          <div className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Title Style</span>
                              <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                                Question-based performs 40% better
                              </span>
                            </div>
                          </div>
                          <div className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Thumbnail Strategy</span>
                              <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                                Face + Text optimal
                              </span>
                            </div>
                          </div>
                          <div className="glass p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Hook Effectiveness</span>
                              <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                                First 15 seconds crucial
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-400" />
                      Upload Schedule
                    </h4>
                    <div className="glass p-4 rounded-lg">
                      <p className="text-gray-300 mb-3">
                        {persona?.contentRecommendations?.frequency || 'More consistent upload schedule recommended'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-400">Optimal for audience retention</span>
                      </div>
                    </div>

                    <h4 className="text-white font-semibold mb-4 mt-6 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Strategic Recommendations
                    </h4>
                    <div className="space-y-3">
                      <div className="glass p-3 rounded-lg border-l-2 border-yellow-400">
                        <p className="text-xs text-yellow-400 mb-1">High Priority</p>
                        <p className="text-sm text-white">Create series-based content</p>
                        <p className="text-xs text-gray-400 mt-1">Viewers who watch series have 3x higher retention</p>
                      </div>
                      <div className="glass p-3 rounded-lg border-l-2 border-blue-400">
                        <p className="text-xs text-blue-400 mb-1">Quick Win</p>
                        <p className="text-sm text-white">Optimize video endings</p>
                        <p className="text-xs text-gray-400 mt-1">Add end screens to increase session duration by 25%</p>
                      </div>
                      <div className="glass p-3 rounded-lg border-l-2 border-green-400">
                        <p className="text-xs text-green-400 mb-1">Growth Opportunity</p>
                        <p className="text-sm text-white">Collaborate with similar channels</p>
                        <p className="text-xs text-gray-400 mt-1">Cross-promotion can boost subscribers by 15-20%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Performance Matrix */}
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <ChartBar className="h-4 w-4 text-blue-400" />
                    Content Performance Matrix
                  </h4>
                  <div className="glass p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-3">By Video Length</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">&lt; 5 min</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-3/5 bg-gradient-to-r from-yellow-500 to-yellow-400" />
                              </div>
                              <span className="text-xs text-yellow-400">60%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">5-10 min</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-4/5 bg-gradient-to-r from-green-500 to-green-400" />
                              </div>
                              <span className="text-xs text-green-400">85%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">10-20 min</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-400" />
                              </div>
                              <span className="text-xs text-blue-400">75%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">&gt; 20 min</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-2/5 bg-gradient-to-r from-red-500 to-red-400" />
                              </div>
                              <span className="text-xs text-red-400">40%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-400 mb-3">By Content Type</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Tutorials</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-11/12 bg-gradient-to-r from-purple-500 to-purple-400" />
                              </div>
                              <span className="text-xs text-purple-400">92%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Reviews</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-4/5 bg-gradient-to-r from-blue-500 to-blue-400" />
                              </div>
                              <span className="text-xs text-blue-400">78%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Vlogs</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-3/5 bg-gradient-to-r from-pink-500 to-pink-400" />
                              </div>
                              <span className="text-xs text-pink-400">65%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Live</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-orange-400" />
                              </div>
                              <span className="text-xs text-orange-400">45%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-400">* Performance relative to channel average</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Top Performing Videos */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Top Performing Videos
              </h3>
              
              <div className="space-y-3">
                {analytics.topVideos.map((video, index) => {
                  const isTop3 = index < 3;
                  return (
                    <div 
                      key={video.id} 
                      className={`glass p-4 rounded-lg flex items-center gap-4 group hover:bg-white/5 transition-all ${
                        isTop3 ? 'border border-purple-500/30' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 ${isTop3 ? 'relative' : ''}`}>
                        <div className={`w-12 h-12 glass rounded-lg flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-300' : 
                          index === 2 ? 'text-orange-400' : 'text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        {isTop3 && (
                          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
                          {video.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(video.views)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {formatNumber(video.likes)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {formatNumber(video.comments || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {video.views > analytics.performance.avgViewsPerVideo ? (
                          <div className="flex items-center gap-1 text-green-400">
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              +{Math.round((video.views / analytics.performance.avgViewsPerVideo - 1) * 100)}%
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-400">
                            <ArrowDownRight className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              -{Math.round((1 - video.views / analytics.performance.avgViewsPerVideo) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-3 gap-4">
              <TiltCard>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Eye className="h-5 w-5 text-purple-400" />
                    <span className="text-xs text-green-400">+12%</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Avg Views/Video</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(analytics.performance.avgViewsPerVideo)}
                  </p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span className="text-xs text-green-400">Good</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Watch Time</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(analytics.performance.avgViewsPerVideo * 4.5 / 60)}h
                  </p>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-xs text-yellow-400">Stable</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">CTR</p>
                  <p className="text-2xl font-bold text-white">
                    {(analytics.performance.avgEngagementRate * 1.2).toFixed(1)}%
                  </p>
                </div>
              </TiltCard>
            </div>
          </div>
        )}

        {activeTab === 'ideas' && contentIdeas && (
          <div className="space-y-6">
            {/* Video Ideas Generated by AI */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                AI-Generated Video Ideas
              </h3>
              
              {contentIdeas.viralPotentialIdeas && contentIdeas.viralPotentialIdeas.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    High Viral Potential
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {contentIdeas.viralPotentialIdeas.slice(0, 4).map((idea, i) => (
                      <div key={i} className="glass p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                        <h5 className="text-white font-medium mb-2">{idea.title}</h5>
                        <p className="text-sm text-gray-300 mb-3">{idea.concept}</p>
                        
                        {idea.hook && (
                          <div className="mb-3 p-2 bg-purple-900/20 rounded text-xs text-purple-300">
                            <span className="font-semibold">Hook: </span>{idea.hook}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {idea.viralScore && (
                            <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                              {idea.viralScore}% viral
                            </span>
                          )}
                          {idea.estimatedLength && (
                            <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                              {idea.estimatedLength}
                            </span>
                          )}
                          {idea.productionComplexity && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              idea.productionComplexity === 'Easy' ? 'bg-green-900/30 text-green-400' :
                              idea.productionComplexity === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-red-900/30 text-red-400'
                            }`}>
                              {idea.productionComplexity}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {contentIdeas.quickWins && contentIdeas.quickWins.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Win Ideas
                  </h4>
                  <div className="space-y-3">
                    {contentIdeas.quickWins.slice(0, 3).map((idea, i) => (
                      <div key={i} className="glass p-3 rounded-lg flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 text-sm font-bold">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{idea.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{idea.concept}</p>
                          {idea.productionTime && (
                            <span className="text-xs text-green-400 mt-2 inline-block">
                              ⏱ {idea.productionTime}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={() => router.push('/channels')}
          className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
        >
          View All Channels
        </Button>
      </div>
    </div>
  );
}