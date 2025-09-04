'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Trash2, RefreshCw, Video } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { calculateChannelMetrics } from '@/lib/utils/channel-metrics';

export default function ChannelDetailPage({ params }) {
  const router = useRouter();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const channelId = resolvedParams.id;

  useEffect(() => {
    fetchChannel();
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const response = await fetch(`/api/channels/${channelId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch channel');
      }

      setChannel(data.channel);
    } catch (error) {
      console.error('Error fetching channel:', error);
      toast.error('Failed to load channel');
      router.push('/channels');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh channel');
      }

      setChannel(data.channel);
      toast.success('Channel data refreshed');
    } catch (error) {
      console.error('Error refreshing channel:', error);
      toast.error('Failed to refresh channel');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this channel?')) {
      return;
    }

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete channel');
      }

      toast.success('Channel removed successfully');
      router.push('/channels');
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Failed to remove channel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!channel) {
    return null;
  }

  // Calculate real metrics based on channel data
  const metrics = calculateChannelMetrics(channel);

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      
      <div className="relative">
        {/* Header */}
        <div className="mb-8">
          <Link href="/channels">
            <Button variant="ghost" size="sm" className="mb-4 text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Channels
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {channel.thumbnail_url ? (
                <img 
                  src={channel.thumbnail_url} 
                  alt={channel.name || channel.title}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <Video className="h-8 w-8 text-white/60" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{channel.name || channel.title}</h1>
                <p className="text-white/70 mt-1">
                  {channel.subscriber_count?.toLocaleString() || 0} subscribers
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/90 hover:bg-white text-black"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href={`/channels/${channelId}/analyze`}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {channel.view_count?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {channel.video_count || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Channel Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics.performanceScore}
                <span className="text-sm font-normal text-white/50">/100</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analysis Card */}
        <Card className="mb-6 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Recent Analysis</CardTitle>
            <CardDescription className="text-white/60">
              Last analyzed: {new Date(channel.last_analyzed_at || channel.updated_at || Date.now()).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">Performance Score</span>
                <span className="text-sm font-bold text-white">{metrics.performanceScore}/100</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.performanceScore}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">Growth Potential</span>
                <span className="text-sm font-bold text-white">{metrics.growthPotential}/100</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.growthPotential}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">Audience Quality</span>
                <span className="text-sm font-bold text-white">{metrics.audienceQuality}/100</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.audienceQuality}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Information Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Channel Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-white/60">YouTube ID</dt>
                <dd className="text-sm mt-1 font-mono text-white">{channel.youtube_channel_id}</dd>
              </div>
              {channel.custom_url && (
                <div>
                  <dt className="text-sm font-medium text-white/60">Custom URL</dt>
                  <dd className="text-sm mt-1">
                    <a 
                      href={`https://youtube.com/${channel.custom_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 hover:underline"
                    >
                      {channel.custom_url}
                    </a>
                  </dd>
                </div>
              )}
              {channel.description && (
                <div>
                  <dt className="text-sm font-medium text-white/60">Description</dt>
                  <dd className="text-sm mt-1 text-white/80 line-clamp-3">
                    {channel.description}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-white/60">Connected</dt>
                <dd className="text-sm mt-1 text-white">{new Date(channel.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}