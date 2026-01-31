'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Hash, 
  Users, 
  Eye, 
  PlayCircle,
  Clock,
  Zap,
  ArrowUpRight,
  Youtube,
  Target,
  ChevronRight,
  Filter,
  Globe,
  Flame,
  Award,
  Star,
  Activity,
  Settings,
  Loader2,
  RefreshCw,
  Lock,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaticCard } from '@/components/ui/static-card';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function TrendingPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [useUserNiche, setUseUserNiche] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [hasAccess, setHasAccess] = useState(false);
  
  // Data states
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [trendingChannels, setTrendingChannels] = useState([]);
  const [hottestTopic, setHottestTopic] = useState(null);
  const [stats, setStats] = useState({
    totalTopics: 0,
    avgGrowthRate: 0,
    totalChannels: 0,
    totalSearchVolume: 0
  });
  const [growthData, setGrowthData] = useState(null);

  const categories = [
    { id: 'all', label: 'All Categories', icon: Globe },
    { id: 'technology', label: 'Technology', icon: Zap },
    { id: 'gaming', label: 'Gaming', icon: PlayCircle },
    { id: 'music', label: 'Music', icon: Activity },
    { id: 'education', label: 'Education', icon: Target },
    { id: 'entertainment', label: 'Entertainment', icon: Star },
    { id: 'howto', label: 'How-to & Style', icon: Settings },
    { id: 'sports', label: 'Sports', icon: Activity },
    { id: 'food', label: 'Food', icon: Target }
  ];

  const timeframes = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
  ];

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      fetchUserPreferences();
      fetchTrendingData();
    }
  }, [selectedCategory, selectedTimeframe, useUserNiche, hasAccess]);

  const checkAccess = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      const tier = data?.subscription_tier || 'free';
      setUserTier(tier);
      setHasAccess(tier !== 'free');
      
      if (tier === 'free') {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setUserPreferences(data.preferences);
        
        // Automatically use user niche if set
        if (data.preferences?.niche && data.preferences.niche !== 'all') {
          setUseUserNiche(true);
          setSelectedCategory(data.preferences.niche);
        }
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const fetchTrendingData = async () => {
    setLoading(true);
    try {
      // Fetch main trending data
      const params = new URLSearchParams({
        category: selectedCategory,
        timeframe: selectedTimeframe,
        userNiche: useUserNiche.toString()
      });

      const response = await fetch(`/api/trending?${params}`);
      const data = await response.json();

      if (data.success) {
        setTrendingTopics(data.data.trendingTopics || []);
        setTrendingChannels(data.data.trendingChannels || []);
        setHottestTopic(data.data.hottestTopic);
        setStats(data.data.stats || {
          totalTopics: 0,
          avgGrowthRate: 0,
          totalChannels: 0,
          totalSearchVolume: 0
        });
        
        // Show a subtle notification if using cached data
        if (data.data.usingFallback) {
          toast.info('Using cached data due to API limits. Data may be slightly outdated.', {
            duration: 5000
          });
        }
      } else {
        // Show error if API fails
        toast.error('Failed to load trending data from YouTube');
        setTrendingTopics([]);
        setTrendingChannels([]);
      }

      // Fetch growth metrics
      fetchGrowthMetrics();
    } catch (error) {
      console.error('Error fetching trending data:', error);
      toast.error('Failed to load trending data. Please try again.');
      setTrendingTopics([]);
      setTrendingChannels([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGrowthMetrics = async () => {
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        limit: '10'
      });

      const response = await fetch(`/api/trending/growth?${params}`);
      const data = await response.json();

      if (data.success) {
        console.log('Growth data received:', data.data);
        setGrowthData(data.data);
      }
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
    }
  };

  const loadMockData = () => {
    // No fallback data - show error state instead
    setTrendingTopics([]);
    setTrendingChannels([]);
    setHottestTopic(null);
    setStats({
      totalTopics: 0,
      avgGrowthRate: 0,
      totalChannels: 0,
      totalSearchVolume: 0
    });
    toast.error('Unable to load trending data. Please check your YouTube API configuration.');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrendingData();
  };

  const saveUserNiche = async (niche) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche })
      });

      if (response.ok) {
        toast.success('Niche preference saved!');
        setUserPreferences({ ...userPreferences, niche });
      }
    } catch (error) {
      console.error('Error saving niche:', error);
      toast.error('Failed to save preference');
    }
  };

  const formatNumber = (num) => {
    if (typeof num === 'string') return num;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading trending data...</p>
          <p className="text-gray-400 text-sm mt-2">Analyzing YouTube trends</p>
        </div>
      </div>
    );
  }

  // Premium gate for free users
  if (!hasAccess) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-2xl mx-auto animate-reveal">
          <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6">
            <Crown className="h-10 w-10 text-yellow-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Trending Analytics
          </h1>
          
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Access real-time YouTube trending data, discover viral topics, and stay ahead of the competition with our premium trending analytics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass p-4 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Real-Time Trends</h3>
              <p className="text-sm text-gray-400">Track what's hot right now</p>
            </div>
            <div className="glass p-4 rounded-lg">
              <Hash className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Viral Topics</h3>
              <p className="text-sm text-gray-400">Find trending hashtags & topics</p>
            </div>
            <div className="glass p-4 rounded-lg">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Top Channels</h3>
              <p className="text-sm text-gray-400">Discover fast-growing creators</p>
            </div>
          </div>

          <Link href="/pricing">
            <Button 
              size="lg"
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
            >
              <Lock className="mr-2 h-5 w-5" />
              Upgrade to Premium
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Static Background - no animations for performance */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Flame className="h-10 w-10 text-orange-400 animate-pulse" />
            Trending Now
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </h1>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="glass-button text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-gray-400">
          Discover what's trending on YouTube and hop on the latest topics
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Category</p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useNiche"
                  checked={useUserNiche}
                  onChange={(e) => setUseUserNiche(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="useNiche" className="text-xs text-gray-400">
                  Use my niche
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (cat.id !== 'all' && useUserNiche) {
                        saveUserNiche(cat.id);
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white'
                        : 'glass text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Timeframe</p>
            <div className="flex gap-2">
              {timeframes.map((time) => (
                <button
                  key={time.id}
                  onClick={() => setSelectedTimeframe(time.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTimeframe === time.id
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white'
                      : 'glass text-gray-400 hover:text-white'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hot Right Now - Featured Topic */}
      {hottestTopic && (
        <div className="glass-card p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  HOT RIGHT NOW
                  <Flame className="h-5 w-5 text-orange-400" />
                </h2>
                <p className="text-sm text-gray-400">Most explosive growth today</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-orange-400">{hottestTopic.growth}</p>
              <p className="text-xs text-gray-400">growth rate</p>
            </div>
          </div>
          
          <div className="glass p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-2">{hottestTopic.topic}</h3>
            <p className="text-gray-300 mb-3">
              Content creators are rushing to cover this trending topic
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {hottestTopic.hashtags?.map((tag, index) => (
                <span key={`hot-tag-${index}`} className="glass px-3 py-1 rounded-full text-sm text-purple-300">
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Search Volume</p>
                <p className="text-xl font-bold text-white">{hottestTopic.searches}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Videos Created</p>
                <p className="text-xl font-bold text-white">{hottestTopic.videos}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg Views</p>
                <p className="text-xl font-bold text-white">{hottestTopic.avgViews}</p>
              </div>
            </div>
            <Button className="glass-button bg-gradient-to-r from-orange-500/50 to-red-500/50 text-white w-full">
              Create Content on This Topic
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Trending Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            Trending Topics
            {growthData && growthData.summary?.avgTopicGrowth !== undefined && (
              <span className="text-sm text-gray-400">
                (Avg Growth: {growthData.summary.avgTopicGrowth}%)
              </span>
            )}
          </h2>
          <Link href="/trending/topics">
            <Button variant="ghost" className="glass-button text-gray-400 hover:text-white">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trendingTopics.length > 0 ? (
            trendingTopics.slice(0, 6).map((topic, index) => (
              <StaticCard key={topic.id || index}>
                <div className="glass-card p-6 h-full animate-reveal" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
                        <Hash className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">{topic.category}</span>
                        <h3 className="font-semibold text-white">{topic.topic}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getScoreColor(topic.score)}`}>{topic.score}</p>
                      <p className="text-xs text-gray-400">Score</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4">{topic.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {topic.hashtags?.slice(0, 3).map((tag, tagIndex) => (
                      <span key={`topic-${index}-tag-${tagIndex}`} className="text-xs glass px-2 py-1 rounded-full text-purple-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Growth</p>
                      <p className="text-sm font-bold text-green-400">{topic.growth}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Searches</p>
                      <p className="text-sm font-bold text-white">{topic.searches}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Videos</p>
                      <p className="text-sm font-bold text-white">{topic.videos}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full glass ${
                      topic.engagement === 'Very High' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {topic.engagement} Engagement
                    </span>
                    <Link href={`/trending/explore?topic=${encodeURIComponent(topic.topic)}`}>
                      <Button size="sm" className="glass-button text-white">
                        Explore
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </StaticCard>
            ))
          ) : (
            <div className="col-span-3 glass-card p-8 text-center">
              <p className="text-gray-400">No trending topics found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Trending Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-400" />
            Rising Channels
            {growthData && growthData.summary?.avgChannelGrowth !== undefined && (
              <span className="text-sm text-gray-400">
                (Avg Growth: {growthData.summary.avgChannelGrowth}%)
              </span>
            )}
          </h2>
          <Link href="/trending/channels">
            <Button variant="ghost" className="glass-button text-gray-400 hover:text-white">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {trendingChannels.length > 0 ? (
            trendingChannels.slice(0, 4).map((channel, index) => (
              <StaticCard key={channel.id || index}>
                <div className="glass-card p-6 animate-reveal" style={{ animationDelay: `${0.5 + index * 0.05}s` }}>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img 
                        src={channel.thumbnail} 
                        alt={channel.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-400/50"
                        onError={(e) => { e.target.src = '/youtube-default.svg'; }}
                      />
                      {channel.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{channel.name}</h3>
                          <p className="text-sm text-gray-400">{channel.handle}</p>
                        </div>
                        <span className="text-xs glass px-2 py-1 rounded-full text-purple-300">
                          {channel.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Subscribers</p>
                          <p className="text-sm font-bold text-white">{channel.subscribers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Growth</p>
                          <p className="text-sm font-bold text-green-400">{channel.growth}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Avg Views</p>
                          <p className="text-sm font-bold text-white">{channel.avgViews}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Upload</p>
                          <p className="text-sm font-bold text-white">{channel.uploadFreq}</p>
                        </div>
                      </div>

                      <div className="glass p-2 rounded-lg mb-3">
                        <p className="text-xs text-gray-400 mb-1">Latest Hit:</p>
                        <p className="text-sm text-white truncate">{channel.topVideo}</p>
                      </div>

                      <div className="flex gap-2">
                        {channel.id && !channel.id.startsWith('demo') ? (
                          <Link href={`/trending/analyze?channelId=${channel.id}&channel=${encodeURIComponent(channel.name)}`} className="flex-1">
                            <Button size="sm" className="glass-button w-full text-white">
                              <Eye className="mr-1 h-3 w-3" />
                              Analyze
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            size="sm" 
                            className="glass-button flex-1 text-white opacity-50" 
                            disabled
                            title="Analysis not available for demo/cached channels"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Analyze
                          </Button>
                        )}
                        <Link href={`/trending/follow?channelId=${channel.id}&channel=${encodeURIComponent(channel.name)}`} className="flex-1">
                          <Button size="sm" className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 w-full text-white">
                            <Users className="mr-1 h-3 w-3" />
                            Follow Trend
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </StaticCard>
            ))
          ) : (
            <div className="col-span-2 glass-card p-8 text-center">
              <p className="text-gray-400">No trending channels found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StaticCard>
          <div className="glass-card p-6 text-center animate-reveal" style={{ animationDelay: '0.7s' }}>
            <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalTopics || 0}</p>
            <p className="text-xs text-gray-400">Hot Topics</p>
          </div>
        </StaticCard>
        <StaticCard>
          <div className="glass-card p-6 text-center animate-reveal" style={{ animationDelay: '0.75s' }}>
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.avgGrowthRate || 0}%</p>
            <p className="text-xs text-gray-400">Avg Growth Rate</p>
          </div>
        </StaticCard>
        <StaticCard>
          <div className="glass-card p-6 text-center animate-reveal" style={{ animationDelay: '0.8s' }}>
            <Youtube className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatNumber(stats.totalChannels || 0)}</p>
            <p className="text-xs text-gray-400">Channels Rising</p>
          </div>
        </StaticCard>
        <StaticCard>
          <div className="glass-card p-6 text-center animate-reveal" style={{ animationDelay: '0.85s' }}>
            <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatNumber(stats.totalSearchVolume || 0)}</p>
            <p className="text-xs text-gray-400">Total Searches</p>
          </div>
        </StaticCard>
      </div>

      {/* Pro Tip */}
      <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-reveal" style={{ animationDelay: '0.9s' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 glass rounded-full flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Pro Tip</h3>
            <p className="text-gray-300 text-sm">
              Jump on trending topics early! The best time to create content on a trending topic is within the first 48 hours of it gaining momentum. 
              Use these insights to plan your content calendar and stay ahead of the curve.
              {userPreferences?.niche && userPreferences.niche !== 'all' && (
                <span className="block mt-2 text-purple-300">
                  Your niche is set to <strong>{userPreferences.niche}</strong>. 
                  The trending data is personalized for your content category.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}