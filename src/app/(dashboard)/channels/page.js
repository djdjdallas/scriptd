'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TiltCard } from '@/components/ui/tilt-card';
import { Button } from '@/components/ui/button';
import { getChannelGrowthMetrics, storeChannelMetrics } from '@/lib/youtube/growth-metrics';
import { 
  Plus, 
  Youtube, 
  Users, 
  Eye, 
  PlayCircle,
  TrendingUp,
  Sparkles,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [channelGrowth, setChannelGrowth] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hoveredChannel, setHoveredChannel] = useState(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: channels, error } = await supabase
          .from('channels')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setChannels(channels || []);
        
        // Fetch growth metrics for each channel
        if (channels && channels.length > 0) {
          await fetchGrowthMetrics(channels);
          // Store current metrics as snapshots for future comparison
          await storeMetricsSnapshots(channels);
        }
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthMetrics = async (channels) => {
    const growth = {};
    
    await Promise.all(
      channels.map(async (channel) => {
        const metrics = await getChannelGrowthMetrics(
          channel.id,
          {
            subscriber_count: channel.subscriber_count,
            view_count: channel.view_count,
            video_count: channel.video_count,
            engagement_rate: channel.analytics_data?.engagement_rate
          },
          30 // 30-day period
        );
        growth[channel.id] = metrics;
      })
    );
    
    setChannelGrowth(growth);
  };

  const storeMetricsSnapshots = async (channels) => {
    // Store metrics snapshots for future growth calculations
    // This should ideally be done by a scheduled job
    try {
      await Promise.all(
        channels.map(async (channel) => {
          await storeChannelMetrics(channel.id, {
            subscriberCount: channel.subscriber_count,
            viewCount: channel.view_count,
            videoCount: channel.video_count,
            averageViews: channel.analytics_data?.avgViewsPerVideo,
            engagementRate: channel.analytics_data?.engagement_rate
          });
        })
      );
    } catch (error) {
      console.error('Error storing metrics snapshots:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <Youtube className="h-12 w-12 text-red-400 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-300">Loading channels...</p>
        </div>
      </div>
    );
  }

  const hasChannels = channels && channels.length > 0;

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between animate-reveal">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Youtube className="h-10 w-10 text-red-400 neon-glow" />
            My Channels
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </h1>
          <p className="text-gray-400 mt-2">
            Connect and manage your YouTube channels
          </p>
        </div>
        <Link href="/channels/add">
          <Button className="glass-button bg-gradient-to-r from-red-500/50 to-pink-500/50 text-white group">
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
            Add Channel
          </Button>
        </Link>
      </div>

      {!hasChannels ? (
        <div className="glass-card p-16 text-center animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="relative inline-block mb-6">
            <Youtube className="h-24 w-24 text-red-400 neon-glow mx-auto" />
            <Sparkles className="h-10 w-10 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">No channels connected</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Connect your YouTube channel to start analyzing your content and growing your audience with AI-powered insights
          </p>
          <Link href="/channels/add">
            <Button size="lg" className="glass-button bg-gradient-to-r from-red-500/50 to-pink-500/50 text-white">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Channel
            </Button>
          </Link>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="glass-card p-6">
              <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-sm text-gray-400">Track performance metrics</p>
            </div>
            <div className="glass-card p-6">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white">Growth Insights</h3>
              <p className="text-sm text-gray-400">AI-powered recommendations</p>
            </div>
            <div className="glass-card p-6">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white">Audience Analysis</h3>
              <p className="text-sm text-gray-400">Understand your viewers</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {channels.map((channel, index) => (
            <TiltCard key={channel.id}>
              <div 
                className="glass-card glass-hover overflow-hidden group h-full"
                onMouseEnter={() => setHoveredChannel(channel.id)}
                onMouseLeave={() => setHoveredChannel(null)}
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-6">
                  {/* Channel Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img 
                        src={channel.analytics_data?.thumbnail_url || channel.thumbnail_url || '/youtube-default.svg'} 
                        alt={channel.name || channel.title}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-400/50"
                      />
                      {channel.is_verified && (
                        <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 text-blue-400 bg-black rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{channel.title}</h3>
                      <p className="text-sm text-gray-400">@{channel.handle || channel.channel_id}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="glass p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Users className="h-3 w-3" />
                        Subscribers
                      </div>
                      <p className="text-white font-semibold">
                        {formatNumber(channel.subscriber_count || 0)}
                      </p>
                    </div>
                    <div className="glass p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Eye className="h-3 w-3" />
                        Total Views
                      </div>
                      <p className="text-white font-semibold">
                        {formatNumber(channel.view_count || 0)}
                      </p>
                    </div>
                    <div className="glass p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <PlayCircle className="h-3 w-3" />
                        Videos
                      </div>
                      <p className="text-white font-semibold">
                        {formatNumber(channel.video_count || 0)}
                      </p>
                    </div>
                    <div className="glass p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Growth (30d)
                      </div>
                      {channelGrowth[channel.id] ? (
                        <p className={`font-semibold ${
                          channelGrowth[channel.id].subscriberGrowth > 0 
                            ? 'text-green-400' 
                            : channelGrowth[channel.id].subscriberGrowth < 0 
                            ? 'text-red-400' 
                            : 'text-gray-400'
                        }`}>
                          {channelGrowth[channel.id].subscriberGrowth > 0 ? '+' : ''}
                          {channelGrowth[channel.id].subscriberGrowth.toFixed(1)}%
                        </p>
                      ) : (
                        <p className="text-gray-400 font-semibold text-xs">Calculating...</p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channel.is_active ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs text-green-400">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                          <span className="text-xs text-yellow-400">Reconnect needed</span>
                        </>
                      )}
                    </div>
                    <Link href={`/channels/${channel.id}`}>
                      <Button className="glass-button text-white text-sm">
                        Manage
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Hover effect indicator */}
                  {hoveredChannel === channel.id && (
                    <div className="absolute top-0 right-0 p-2">
                      <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </TiltCard>
          ))}

          {/* Add New Channel Card */}
          <TiltCard>
            <Link href="/channels/add">
              <div className="glass-card glass-hover h-full flex flex-col items-center justify-center p-8 group cursor-pointer">
                <div className="glass w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Add Channel</h3>
                <p className="text-sm text-gray-400 text-center">
                  Add or connect a channel
                </p>
              </div>
            </Link>
          </TiltCard>
        </div>
      )}

      {/* Tips Section */}
      {hasChannels && (
        <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Pro Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Analyze Performance</p>
                <p className="text-xs text-gray-400">Track your best performing content</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Follow Trends</p>
                <p className="text-xs text-gray-400">Stay ahead with AI insights</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Know Your Audience</p>
                <p className="text-xs text-gray-400">Understand viewer preferences</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format numbers
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}