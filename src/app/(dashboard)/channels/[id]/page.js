'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Trash2, RefreshCw, Video, Users, Mic, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { calculateChannelMetrics } from '@/lib/utils/channel-metrics';
import { ChannelAnalyzer } from '@/components/channel/channel-analyzer';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function ChannelDetailPage({ params }) {
  const router = useRouter();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  
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

  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal({ isOpen: false });
    
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

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false });
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
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
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

        {/* Remix Channel Cards - Show audience and voice profile for remix channels */}
        {channel.is_remix && (
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            {/* Audience Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Target Audience
                </CardTitle>
                <CardDescription className="text-white/60">
                  Combined audience profile from remixed channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {channel.audience_description ? (
                  <div className="space-y-4">
                    <p className="text-white/90 text-sm leading-relaxed">
                      {channel.audience_description}
                    </p>
                    {channel.analytics_data?.audience && (
                      <div className="space-y-3 pt-3 border-t border-white/10">
                        {channel.analytics_data.audience.interests && (
                          <div>
                            <p className="text-xs font-medium text-white/60 mb-2">Key Interests</p>
                            <div className="flex flex-wrap gap-2">
                              {channel.analytics_data.audience.interests.slice(0, 5).map((interest, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {channel.analytics_data.audience.demographics && (
                          <div>
                            <p className="text-xs font-medium text-white/60 mb-2">Demographics</p>
                            <p className="text-white/80 text-xs">
                              {Object.entries(channel.analytics_data.audience.demographics)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">
                    No audience analysis available yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Voice Profile Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Profile
                </CardTitle>
                <CardDescription className="text-white/60">
                  Combined voice characteristics from remixed channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(channel.voice_profile && Object.keys(channel.voice_profile).length > 0) || 
                 (channel.analytics_data?.voiceProfile && Object.keys(channel.analytics_data.voiceProfile).length > 0) ? (
                  <div className="space-y-4">
                    {(() => {
                      const voiceData = channel.voice_profile || channel.analytics_data?.voiceProfile || {};
                      return (
                        <>
                          {voiceData.tone && (
                            <div>
                              <p className="text-xs font-medium text-white/60 mb-2">Tone</p>
                              <div className="flex flex-wrap gap-2">
                                {(Array.isArray(voiceData.tone) ? voiceData.tone : [voiceData.tone]).map((t, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {voiceData.style && (
                            <div>
                              <p className="text-xs font-medium text-white/60 mb-2">Style</p>
                              <div className="flex flex-wrap gap-2">
                                {(Array.isArray(voiceData.style) ? voiceData.style : [voiceData.style]).map((s, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-green-500/20 text-green-200 text-xs rounded-full"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {voiceData.energy && (
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-white/60">Energy Level</p>
                              <span className="text-white/80 text-sm capitalize">{voiceData.energy}</span>
                            </div>
                          )}
                          {voiceData.pace && (
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-white/60">Speaking Pace</p>
                              <span className="text-white/80 text-sm capitalize">{voiceData.pace}</span>
                            </div>
                          )}
                          {voiceData.catchphrases && voiceData.catchphrases.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-white/60 mb-2">Signature Phrases</p>
                              <div className="space-y-1">
                                {voiceData.catchphrases.slice(0, 3).map((phrase, i) => (
                                  <p key={i} className="text-white/70 text-xs italic">"{phrase}"</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">
                    No voice profile configured yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Source Channels for Remix */}
        {channel.is_remix && channel.remix_source_ids && channel.remix_source_ids.length > 0 && (
          <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Remix Sources
              </CardTitle>
              <CardDescription className="text-white/60">
                Channels combined to create this remix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-sm">
                This channel combines strategies from {channel.remix_source_ids.length} source channels
              </p>
            </CardContent>
          </Card>
        )}

        {/* Channel Analysis Component - Now integrated directly */}
        <div className="mt-8">
          <ChannelAnalyzer channelId={channelId} />
        </div>

        {/* Channel Information Card */}
        <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Remove Channel"
        message="Are you sure you want to remove this channel? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}