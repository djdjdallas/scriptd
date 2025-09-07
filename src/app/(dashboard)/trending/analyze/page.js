'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const channelName = searchParams.get('channel') || 'TechVision Pro';
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchChannelAnalysis();
  }, [channelName]);

  const fetchChannelAnalysis = async () => {
    setLoading(true);
    try {
      // Mock comprehensive channel analysis data
      const mockChannelData = {
        name: channelName,
        handle: '@' + channelName.toLowerCase().replace(/\s+/g, ''),
        thumbnail: '/youtube-default.svg',
        verified: true,
        category: 'Technology',
        description: 'Tech reviews, AI tutorials, and cutting-edge technology insights',
        
        // Basic stats
        stats: {
          subscribers: '2.5M',
          totalViews: '185M',
          totalVideos: '342',
          joinedDate: 'Jan 2019',
          growth: '+45K/week',
          avgViews: '500K',
          uploadFreq: '3/week',
          engagementRate: '8.5%'
        },
        
        // Growth metrics
        growth: {
          subscriberGrowth: [
            { month: 'Jan', count: 2100000 },
            { month: 'Feb', count: 2200000 },
            { month: 'Mar', count: 2350000 },
            { month: 'Apr', count: 2500000 }
          ],
          viewsGrowth: [
            { month: 'Jan', views: 15000000 },
            { month: 'Feb', views: 18000000 },
            { month: 'Mar', views: 22000000 },
            { month: 'Apr', views: 25000000 }
          ]
        },
        
        // Performance scores
        scores: {
          overall: 92,
          content: 88,
          consistency: 95,
          engagement: 85,
          growth: 90,
          potential: 94
        },
        
        // Recent videos
        recentVideos: [
          {
            id: 1,
            title: 'ChatGPT vs Claude: Ultimate Comparison',
            views: '2.3M',
            likes: '98K',
            comments: '8.5K',
            duration: '15:42',
            uploadedAt: '2 days ago',
            performance: 'above'
          },
          {
            id: 2,
            title: 'Apple Vision Pro: 30 Days Later',
            views: '1.5M',
            likes: '62K',
            comments: '4.2K',
            duration: '18:30',
            uploadedAt: '5 days ago',
            performance: 'average'
          },
          {
            id: 3,
            title: 'The Future of AI is Here',
            views: '890K',
            likes: '41K',
            comments: '2.8K',
            duration: '12:15',
            uploadedAt: '1 week ago',
            performance: 'below'
          }
        ],
        
        // Content patterns
        contentPatterns: {
          bestPerforming: ['AI Tools', 'Product Reviews', 'Comparisons'],
          uploadSchedule: ['Tuesday', 'Thursday', 'Saturday'],
          optimalLength: '12-18 minutes',
          topKeywords: ['AI', 'ChatGPT', 'Technology', 'Review', 'Tutorial'],
          thumbnailStyle: 'High contrast, face + product, bold text'
        },
        
        // Strengths and weaknesses
        analysis: {
          strengths: [
            'Consistent upload schedule',
            'High production quality',
            'Strong audience engagement',
            'Trending topic coverage',
            'Clear value proposition'
          ],
          weaknesses: [
            'Limited shorts content',
            'Could improve CTR on older videos',
            'Opportunity for more collaborations'
          ],
          opportunities: [
            'Expand into YouTube Shorts',
            'Create series-based content',
            'Develop signature format',
            'Build email list',
            'Launch membership program'
          ]
        },
        
        // Competitor comparison
        competitors: [
          { name: 'Tech Guru', subscribers: '3.1M', growth: '+38K/week', engagement: '7.2%' },
          { name: 'Digital Pro', subscribers: '1.8M', growth: '+22K/week', engagement: '9.1%' },
          { name: 'AI Master', subscribers: '2.2M', growth: '+41K/week', engagement: '6.8%' }
        ]
      };
      
      setChannelData(mockChannelData);
    } catch (error) {
      console.error('Error analyzing channel:', error);
      toast.error('Failed to analyze channel');
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

  if (loading || !channelData) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Youtube className="h-12 w-12 text-red-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Analyzing channel...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
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
              <Button className="glass-button text-white">
                <Bell className="h-4 w-4 mr-2" />
                Track Channel
              </Button>
              <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
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