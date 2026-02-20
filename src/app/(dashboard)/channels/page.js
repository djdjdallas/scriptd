'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StaticCard } from '@/components/ui/static-card';
import { Button } from '@/components/ui/button';
import { getChannelGrowthMetrics, storeChannelMetrics } from '@/lib/youtube/growth-metrics';
import {
  Plus,
  Youtube,
  Users,
  Eye,
  PlayCircle,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Crown
} from 'lucide-react';

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [channelGrowth, setChannelGrowth] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hoveredChannel, setHoveredChannel] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check premium status
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .single();
        
        setIsPremium(subscription?.status === 'active');
        
        const { data: channels, error } = await supabase
          .from('channels')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('Fetched channels:', channels); // Debug log
        setChannels(channels || []);
        
        // Check if any channels are missing thumbnails and refresh them
        if (channels && channels.length > 0) {
          const channelsMissingThumbnails = channels.filter(
            channel => !channel.thumbnail_url && !channel.analytics_data?.thumbnail_url
          );
          
          if (channelsMissingThumbnails.length > 0) {
            // Refresh thumbnails in the background
            fetch('/api/channels/refresh-thumbnails', {
              method: 'POST',
            }).then(async (response) => {
              if (response.ok) {
                const result = await response.json();
                console.log('Thumbnail refresh result:', result);
                // Refetch channels if any were updated
                if (result.updated > 0) {
                  const { data: updatedChannels } = await supabase
                    .from('channels')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                  
                  if (updatedChannels) {
                    setChannels(updatedChannels);
                  }
                }
              }
            }).catch(err => {
              console.error('Error refreshing thumbnails:', err);
            });
          }
          
          // Fetch growth metrics for each channel
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
        <div className="vb-card p-8 animate-pulse-slow">
          <Youtube className="h-12 w-12 text-red-400 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-300">Loading channels...</p>
        </div>
      </div>
    );
  }

  const hasChannels = channels && channels.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-reveal">
        <div>
          <h1 className="text-4xl font-bold font-display text-white flex items-center gap-3">
            <Youtube className="h-10 w-10 text-red-400" />
            My Channels
          </h1>
          <p className="text-gray-400 mt-2">
            Connect and manage your YouTube channels
            {!isPremium && (
              <span className="ml-2 text-sm">
                ({channels.length}/1 channel used)
              </span>
            )}
          </p>
        </div>
        <Link href="/channels/add">
          <Button 
            className="vb-btn-primary text-white group"
            disabled={!isPremium && channels.length >= 1}
          >
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
            {!isPremium && channels.length >= 1 ? 'Upgrade to Add More' : 'Add Channel'}
          </Button>
        </Link>
      </div>

      {!hasChannels ? (
        <div className="vb-card p-16 text-center animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="relative inline-block mb-6">
            <Youtube className="h-24 w-24 text-red-400 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold font-display text-white mb-4">No channels connected</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Connect your YouTube channel to start analyzing your content and growing your audience with AI-powered insights
          </p>
          <Link href="/channels/add">
            <Button size="lg" className="vb-btn-primary text-white">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Channel
            </Button>
          </Link>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="vb-card p-6">
              <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-sm text-gray-400">Track performance metrics</p>
            </div>
            <div className="vb-card p-6">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white">Growth Insights</h3>
              <p className="text-sm text-gray-400">AI-powered recommendations</p>
            </div>
            <div className="vb-card p-6">
              <Users className="h-8 w-8 text-violet-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white">Audience Analysis</h3>
              <p className="text-sm text-gray-400">Understand your viewers</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {channels.map((channel, index) => (
            <StaticCard key={channel.id}>
              <div 
                className="vb-card-interactive overflow-hidden group h-full"
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
                      {channel.thumbnail_url || channel.analytics_data?.thumbnail_url || channel.analytics_data?.thumbnails?.high?.url ? (
                        <img 
                          src={channel.thumbnail_url || channel.analytics_data?.thumbnail_url || channel.analytics_data?.thumbnails?.high?.url || channel.analytics_data?.thumbnails?.medium?.url || channel.analytics_data?.thumbnails?.default?.url} 
                          alt={channel.title || channel.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-red-400/50 bg-gray-800"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/youtube-default.svg';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 flex items-center justify-center ring-2 ring-red-400/50">
                          <Youtube className="h-8 w-8 text-red-400" />
                        </div>
                      )}
                      {channel.is_verified && (
                        <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 text-blue-400 bg-black rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{channel.title || channel.name || 'Unnamed Channel'}</h3>
                      <p className="text-sm text-gray-400">@{channel.handle || channel.custom_url?.replace('@', '') || channel.youtube_channel_id}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Users className="h-3 w-3" />
                        Subscribers
                      </div>
                      <p className="text-white font-semibold">
                        {formatNumber(channel.subscriber_count || 0)}
                      </p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Eye className="h-3 w-3" />
                        Total Views
                      </div>
                      <p className="text-white font-semibold">
                        {channel.view_count ? formatNumber(channel.view_count) : '0'}
                      </p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <PlayCircle className="h-3 w-3" />
                        Videos
                      </div>
                      <p className="text-white font-semibold">
                        {formatNumber(channel.video_count || 0)}
                      </p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
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
                      {channel.is_active !== false ? (
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
                      <Button className="vb-btn-outline text-white text-sm">
                        Manage
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>

                </div>
              </div>
            </StaticCard>
          ))}

          {/* Add New Channel Card - Only show for premium or if under limit */}
          {(isPremium || channels.length < 1) && (
            <StaticCard>
              <Link href="/channels/add">
                <div className="vb-card-interactive h-full flex flex-col items-center justify-center p-8 group cursor-pointer">
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Add Channel</h3>
                  <p className="text-sm text-gray-400 text-center">
                    Add or connect a channel
                  </p>
                </div>
              </Link>
            </StaticCard>
          )}
        </div>
      )}

      {/* Channel Limit Message for Free Users */}
      {!isPremium && channels.length >= 1 && (
        <div className="vb-card p-6 animate-reveal border border-yellow-400/30 bg-yellow-400/5" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-4">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-400/20">
              <Crown className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Channel Limit Reached
              </h3>
              <p className="text-gray-300 mb-3">
                You've reached the maximum of 1 channel for free accounts. Upgrade to add unlimited channels and unlock premium features.
              </p>
              <Link href="/pricing">
                <Button className="vb-btn-outline bg-gradient-to-r from-yellow-500/50 to-orange-500/50 text-white">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {hasChannels && (
        <div className="vb-card p-6 animate-reveal" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-semibold font-display text-white mb-3 flex items-center gap-2">
            Pro Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Analyze Performance</p>
                <p className="text-xs text-gray-400">Track your best performing content</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Follow Trends</p>
                <p className="text-xs text-gray-400">Stay ahead with AI insights</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-violet-400" />
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