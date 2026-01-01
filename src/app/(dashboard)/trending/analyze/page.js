'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Youtube,
  Users,
  Eye,
  TrendingUp,
  ChevronLeft,
  Award,
  PlayCircle,
  ThumbsUp,
  MessageSquare,
  Clock,
  Calendar,
  BarChart3,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Video,
  Hash,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AnalyzeChannelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelId = searchParams.get('channelId');
  const channelName = searchParams.get('channel') || 'Channel';
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (channelId) {
      fetchChannelAnalysis();
    } else {
      setError('No channel ID provided');
      setLoading(false);
    }
  }, [channelId]);

  const fetchChannelAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trending/channel?channelId=${channelId}&channelName=${encodeURIComponent(channelName)}`);
      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (result.isDemoChannel) {
          setError('This is a demo channel. Channel analysis is only available for real YouTube channels.');
          return;
        }
        if (result.suggestion) {
          setError(`${result.error}\n${result.suggestion}`);
          return;
        }
        throw new Error(result.error || 'Failed to fetch channel data');
      }
      
      if (result.success && result.data) {
        // Transform the API response to match the page's expected format
        const transformedData = {
          name: result.data.name,
          handle: result.data.handle,
          thumbnail: result.data.thumbnail || '/youtube-default.svg',
          verified: result.data.stats.subscriberCount > 100000,
          category: result.data.category || 'Content Creator',
          description: result.data.description || 'No description available',
        
          // Basic stats from real data
          stats: {
            subscribers: result.data.stats.subscribers,
            totalViews: result.data.stats.totalViews,
            totalVideos: result.data.stats.totalVideos,
            joinedDate: new Date(result.data.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            growth: 'Calculating...',
            avgViews: result.data.metrics.avgViews,
            uploadFreq: result.data.metrics.uploadFrequency,
            engagementRate: result.data.metrics.engagementRate
          },
        
          // Growth metrics (simplified for now)
          growth: {
            subscriberGrowth: generateGrowthData(result.data.stats.subscriberCount),
            viewsGrowth: generateViewsGrowth(result.data.stats.viewCount)
          },
        
          // Performance scores from real analysis
          scores: result.data.scores || {
            overall: 75,
            content: 70,
            consistency: 70,
            engagement: 70,
            growth: 70,
            potential: 70
          },
        
          // Recent videos from real data
          recentVideos: result.data.recentVideos && result.data.recentVideos.length > 0 
            ? result.data.recentVideos.map((video, index) => ({
              id: video.id || index + 1,
              title: video.title,
              views: video.views,
              likes: video.likes,
              comments: video.comments,
              duration: formatDuration(video.duration),
              uploadedAt: getTimeAgo(video.publishedAt),
              performance: getVideoPerformance(video.viewsRaw, result.data.metrics.avgViewsRaw)
            }))
            : [],
        
          // Content patterns from real insights
          contentPatterns: result.data.insights ? {
            bestPerforming: result.data.insights.contentPatterns?.topCategories || ['General Content'],
            uploadSchedule: result.data.insights.bestUploadTimes || ['Regular uploads'],
            optimalLength: 'Varies by content',
            topKeywords: extractKeywords(result.data.recentVideos),
            thumbnailStyle: 'Channel specific style'
          } : {
            bestPerforming: ['General Content'],
            uploadSchedule: ['Regular uploads'],
            optimalLength: 'Varies',
            topKeywords: [],
            thumbnailStyle: 'Standard'
          },
        
          // Strengths and weaknesses based on real data
          analysis: generateAnalysis(result.data),
          
          // Competitor comparison (would need additional data)
          competitors: []
        };
        
        setChannelData(transformedData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error analyzing channel:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to analyze channel');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'content', label: 'Content Analysis', icon: Video },
    { id: 'growth', label: 'Growth', icon: Target },
    { id: 'compete', label: 'Competition', icon: Users }
  ];

  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Failed to analyze channel</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <Link href="/trending">
            <Button className="glass-button mt-4">Back to Trending</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !channelData) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Youtube className="h-12 w-12 text-red-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Analyzing channel...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching real-time data from YouTube</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <Link href="/trending/channels">
          <Button variant="ghost" className="glass-button mb-4 text-gray-400 hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Channels
          </Button>
        </Link>
        
        <div className="flex items-start gap-6">
          <div className="relative">
            <img 
              src={channelData.thumbnail} 
              alt={channelData.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-400/50"
            />
            {channelData.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{channelData.name}</h1>
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-gray-400 mb-2">{channelData.handle} • {channelData.category}</p>
            <p className="text-gray-300 mb-4">{channelData.description}</p>
            <div className="flex gap-3">
              <Button 
                className="glass-button text-white"
                onClick={() => {
                  toast.info('Channel tracking coming soon! You\'ll be able to get alerts when this channel posts new content.', {
                    duration: 4000
                  });
                }}
              >
                <Bell className="h-4 w-4 mr-2" />
                Track Channel
              </Button>
              <Button 
                className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
                onClick={() => {
                  router.push(`/trending/follow?channelId=${channelId}&channel=${encodeURIComponent(channelData?.name || channelName)}&topic=${encodeURIComponent(channelData?.category || 'Content Creation')}`);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Follow Strategy
              </Button>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-400 mb-1">{channelData.scores.overall}</div>
            <p className="text-sm text-gray-400">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span className="text-xs text-green-400">{channelData.stats.growth}</span>
          </div>
          <p className="text-2xl font-bold text-white">{channelData.stats.subscribers}</p>
          <p className="text-xs text-gray-400">Subscribers</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-5 w-5 text-blue-400" />
            <span className="text-xs text-green-400">+15%</span>
          </div>
          <p className="text-2xl font-bold text-white">{channelData.stats.totalViews}</p>
          <p className="text-xs text-gray-400">Total Views</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Video className="h-5 w-5 text-red-400" />
            <span className="text-xs text-yellow-400">{channelData.stats.uploadFreq}</span>
          </div>
          <p className="text-2xl font-bold text-white">{channelData.stats.totalVideos}</p>
          <p className="text-xs text-gray-400">Videos</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <ThumbsUp className="h-5 w-5 text-green-400" />
            <span className="text-xs text-green-400">High</span>
          </div>
          <p className="text-2xl font-bold text-white">{channelData.stats.engagementRate}</p>
          <p className="text-xs text-gray-400">Engagement</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2 animate-reveal" style={{ animationDelay: '0.2s' }}>
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
      <div className="animate-reveal" style={{ animationDelay: '0.3s' }}>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Scores */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Channel Performance Scores
              </h3>
              <div className="space-y-4">
                {Object.entries(channelData.scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white capitalize">{key}</span>
                      <span className={`font-bold ${
                        value >= 90 ? 'text-green-400' :
                        value >= 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {value}/100
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                          value >= 90 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          value >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {channelData.analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  Weaknesses
                </h4>
                <ul className="space-y-2">
                  {channelData.analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Opportunities
                </h4>
                <ul className="space-y-2">
                  {channelData.analysis.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-red-400" />
                Recent Video Performance
              </h3>
              <div className="space-y-3">
                {channelData.recentVideos.map((video) => (
                  <div key={video.id} className="glass p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium flex-1">{video.title}</h4>
                      <div className={`flex items-center gap-1 ${
                        video.performance === 'above' ? 'text-green-400' :
                        video.performance === 'below' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {video.performance === 'above' ? <ArrowUpRight className="h-4 w-4" /> :
                         video.performance === 'below' ? <ArrowDownRight className="h-4 w-4" /> : null}
                        <span className="text-xs">
                          {video.performance === 'above' ? 'Above avg' :
                           video.performance === 'below' ? 'Below avg' : 'Average'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {video.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {video.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </span>
                      <span>{video.uploadedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-400" />
                Content Patterns
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Best Performing Topics</h4>
                  <div className="space-y-2">
                    {channelData.contentPatterns.bestPerforming.map((topic, index) => (
                      <div key={index} className="glass px-3 py-2 rounded-lg text-purple-300">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">Upload Schedule</h4>
                  <div className="flex gap-2">
                    {channelData.contentPatterns.uploadSchedule.map((day, index) => (
                      <span key={index} className="glass px-3 py-2 rounded-lg text-sm text-gray-300">
                        {day}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Optimal length: {channelData.contentPatterns.optimalLength}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Top Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {channelData.contentPatterns.topKeywords.map((keyword, index) => (
                    <span key={index} className="glass px-3 py-1 rounded-full text-sm text-purple-300">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Growth Trajectory
            </h3>
            <p className="text-gray-400 text-center py-8">
              Growth charts would be displayed here with subscriber and view trends
            </p>
          </div>
        )}

        {activeTab === 'compete' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Competitor Comparison
            </h3>
            {channelData.competitors.map((competitor, index) => (
              <div key={index} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{competitor.name}</h4>
                  <p className="text-sm text-gray-400">{competitor.subscribers} subscribers</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-green-400 font-bold">{competitor.growth}</p>
                    <p className="text-xs text-gray-400">Growth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-400 font-bold">{competitor.engagement}</p>
                    <p className="text-xs text-gray-400">Engagement</p>
                  </div>
                  <Button size="sm" className="glass-button text-white">
                    Compare
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function generateGrowthData(subscriberCount) {
  // Generate mock growth data based on current count
  const base = subscriberCount || 1000;
  return [
    { month: 'Month 1', count: Math.round(base * 0.7) },
    { month: 'Month 2', count: Math.round(base * 0.8) },
    { month: 'Month 3', count: Math.round(base * 0.9) },
    { month: 'Current', count: base }
  ];
}

function generateViewsGrowth(viewCount) {
  const base = viewCount || 10000;
  return [
    { month: 'Month 1', views: Math.round(base * 0.7) },
    { month: 'Month 2', views: Math.round(base * 0.8) },
    { month: 'Month 3', views: Math.round(base * 0.9) },
    { month: 'Current', views: base }
  ];
}

function formatDuration(duration) {
  if (!duration || duration === 'N/A') return 'N/A';
  
  // Parse ISO 8601 duration (PT15M33S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const hours = match[1] || 0;
  const minutes = match[2] || 0;
  const seconds = match[3] || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
}

function getVideoPerformance(views, avgViews) {
  if (!avgViews || avgViews === 0) return 'average';
  const ratio = views / avgViews;
  if (ratio > 1.5) return 'above';
  if (ratio < 0.5) return 'below';
  return 'average';
}

function extractKeywords(videos) {
  if (!videos || videos.length === 0) return [];
  
  // Extract common words from video titles
  const words = {};
  videos.forEach(video => {
    if (video.title) {
      video.title.split(/\s+/).forEach(word => {
        const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleaned.length > 3) {
          words[cleaned] = (words[cleaned] || 0) + 1;
        }
      });
    }
  });
  
  // Sort by frequency and return top 5
  return Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

function extractInterests(description, videos) {
  const interests = new Set();
  
  // Common tech/gaming/lifestyle keywords
  const categories = {
    'Technology': ['tech', 'ai', 'software', 'hardware', 'computer', 'phone', 'gadget'],
    'Gaming': ['game', 'gaming', 'play', 'stream', 'esports', 'console'],
    'Education': ['learn', 'tutorial', 'how to', 'guide', 'teach', 'course'],
    'Entertainment': ['funny', 'comedy', 'react', 'challenge', 'vlog'],
    'Lifestyle': ['life', 'day', 'routine', 'fashion', 'beauty', 'travel'],
    'Business': ['business', 'money', 'finance', 'invest', 'startup', 'entrepreneur']
  };
  
  const combinedText = (description + ' ' + videos.map(v => v.title || '').join(' ')).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      interests.add(category);
    }
  }
  
  return Array.from(interests).slice(0, 5);
}

function generateAnalysis(data) {
  const analysis = {
    strengths: [],
    weaknesses: [],
    opportunities: []
  };
  
  // Analyze strengths
  if (data.stats.subscriberCount > 100000) {
    analysis.strengths.push('Large subscriber base');
  }
  if (data.metrics.engagementRateRaw > 5) {
    analysis.strengths.push('High audience engagement');
  }
  if (data.metrics.uploadFrequency && data.metrics.uploadFrequency !== 'Irregular') {
    analysis.strengths.push('Consistent upload schedule');
  }
  if (data.recentVideos && data.recentVideos.length >= 5) {
    analysis.strengths.push('Active content creation');
  }
  if (data.metrics.viewsPerSubscriber > 50) {
    analysis.strengths.push('Strong view-to-subscriber ratio');
  }
  
  // Identify weaknesses
  if (data.metrics.engagementRateRaw < 2) {
    analysis.weaknesses.push('Low engagement rate');
  }
  if (data.metrics.uploadFrequency === 'Irregular') {
    analysis.weaknesses.push('Inconsistent upload schedule');
  }
  if (data.stats.subscriberCount < 10000) {
    analysis.weaknesses.push('Small subscriber base');
  }
  if (data.metrics.avgViewsRaw < 1000) {
    analysis.weaknesses.push('Low average views');
  }
  
  // Suggest opportunities
  if (data.stats.subscriberCount < 100000) {
    analysis.opportunities.push('Focus on subscriber growth strategies');
  }
  if (data.metrics.engagementRateRaw < 5) {
    analysis.opportunities.push('Improve audience engagement tactics');
  }
  analysis.opportunities.push('Experiment with YouTube Shorts');
  analysis.opportunities.push('Collaborate with similar channels');
  analysis.opportunities.push('Optimize video SEO and thumbnails');
  
  // Ensure we have at least some items in each category
  if (analysis.strengths.length === 0) {
    analysis.strengths.push('Active YouTube channel');
  }
  if (analysis.weaknesses.length === 0) {
    analysis.weaknesses.push('Room for improvement in metrics');
  }
  
  return analysis;
}

function generateRecommendations(data) {
  const recommendations = [];
  
  // Content recommendations
  if (data.metrics.avgViewsRaw > 10000) {
    recommendations.push({
      type: 'content',
      title: 'Maintain successful content strategy',
      description: 'Your videos are performing well, keep the current approach',
      priority: 'high'
    });
  } else {
    recommendations.push({
      type: 'content',
      title: 'Analyze top-performing videos',
      description: 'Study what makes your best videos successful and replicate',
      priority: 'high'
    });
  }
  
  // Engagement recommendations
  if (data.metrics.engagementRateRaw < 3) {
    recommendations.push({
      type: 'optimization',
      title: 'Boost engagement rate',
      description: `Current rate is ${data.metrics.engagementRate}, aim for 5%+`,
      priority: 'high'
    });
  }
  
  // Growth recommendations
  if (data.stats.subscriberCount < 100000) {
    recommendations.push({
      type: 'growth',
      title: 'Focus on subscriber acquisition',
      description: 'Implement CTAs, create compelling channel trailers',
      priority: 'medium'
    });
  }
  
  return recommendations;
}