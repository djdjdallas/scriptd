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
  ArrowDownRight
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

  useEffect(() => {
    if (channelId) {
      startAnalysis();
    }
  }, [channelId]);

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

  if (isAnalyzing || !analysisData) {
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

  const { analytics, persona, insights } = analysisData;

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
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

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
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-purple-400" />
                    Top Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.content.topKeywords.slice(0, 15).map(([keyword, count], index) => {
                      const size = index < 3 ? 'text-base' : index < 7 ? 'text-sm' : 'text-xs';
                      const opacity = index < 3 ? 'opacity-100' : index < 7 ? 'opacity-80' : 'opacity-60';
                      return (
                        <div
                          key={index}
                          className={`glass px-4 py-2 rounded-full ${size} ${opacity} text-white hover:opacity-100 transition-opacity cursor-default`}
                        >
                          {keyword} 
                          <span className="text-gray-400 ml-1">({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      Content Types
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(analytics.content.contentTypes).map(([type, count]) => (
                        <div key={type} className="glass p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white capitalize">{type}</span>
                            <span className="text-purple-400 font-bold">{count}</span>
                          </div>
                          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ 
                                width: `${(count / analytics.channel.videoCount) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-400" />
                      Upload Schedule
                    </h4>
                    <div className="glass p-4 rounded-lg">
                      <p className="text-gray-300 mb-3">{persona.contentRecommendations.frequency}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-400">Optimal for audience retention</span>
                      </div>
                    </div>

                    <h4 className="text-white font-semibold mb-4 mt-6 flex items-center gap-2">
                      <Target className="h-4 w-4 text-yellow-400" />
                      Content Strategy
                    </h4>
                    <div className="glass p-4 rounded-lg">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5" />
                          <span className="text-sm text-gray-300">Focus on trending topics in your niche</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5" />
                          <span className="text-sm text-gray-300">Maintain consistent upload schedule</span>
                        </li>
                      </ul>
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