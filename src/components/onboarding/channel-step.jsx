'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Youtube,
  Link,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  TrendingUp,
  Users,
  Play,
  BarChart3
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export function ChannelStep({ userData, onComplete }) {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [channelData, setChannelData] = useState(null);
  const [error, setError] = useState('');
  const [skipModal, setSkipModal] = useState({ isOpen: false });

  const validateYouTubeUrl = (url) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/(channel|c|user)\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/@[\w-]+/,
      /^@[\w-]+$/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleConnect = async () => {
    if (!channelUrl) {
      setError('Please enter your YouTube channel URL');
      return;
    }

    if (!validateYouTubeUrl(channelUrl)) {
      setError('Please enter a valid YouTube channel URL or handle (e.g., @yourchannel)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to connect channel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock channel data
      const mockChannelData = {
        id: 'channel_123',
        name: 'Your Awesome Channel',
        handle: '@yourchannel',
        subscribers: '10.5K',
        videos: 142,
        views: '1.2M',
        thumbnail: '/api/placeholder/88/88',
        verified: true
      };

      setChannelData(mockChannelData);
      toast.success('Channel connected successfully!');
      
      // Start analyzing
      setAnalyzing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnalyzing(false);
      
      await onComplete({ channel: mockChannelData });
    } catch (error) {
      setError('Failed to connect channel. Please try again.');
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipClick = () => {
    setSkipModal({ isOpen: true });
  };

  const handleSkip = async () => {
    await onComplete({ skipped: true });
    setSkipModal({ isOpen: false });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Connect Your YouTube Channel</h2>
        <p className="text-gray-400">
          Link your channel to unlock personalized AI features
        </p>
      </div>

      {!channelData ? (
        <div className="space-y-6">
          {/* Benefits */}
          <div className="glass rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Why Connect Your Channel?
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white">Voice Training</p>
                  <p className="text-xs text-gray-400">AI learns your unique style</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white">Performance Analytics</p>
                  <p className="text-xs text-gray-400">Track your content success</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white">Audience Insights</p>
                  <p className="text-xs text-gray-400">Understand your viewers</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white">Trend Recommendations</p>
                  <p className="text-xs text-gray-400">Get personalized suggestions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Channel URL Input */}
          <div className="space-y-2">
            <Label htmlFor="channel-url" className="text-white">
              YouTube Channel URL or Handle
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="channel-url"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@yourchannel or @yourchannel"
                  className="glass-input pl-10"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Examples */}
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Examples:</p>
            <div className="space-y-1">
              <code className="text-xs text-purple-400 block">https://youtube.com/@MrBeast</code>
              <code className="text-xs text-purple-400 block">https://youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA</code>
              <code className="text-xs text-purple-400 block">@yourchannel</code>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleSkipClick}
              className="text-gray-400 hover:text-white"
            >
              I'll connect my channel later
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connected Channel */}
          <div className="glass rounded-lg p-6">
            <div className="flex items-start gap-4">
              <img
                src={channelData.thumbnail}
                alt={channelData.name}
                className="w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-white">
                    {channelData.name}
                  </h3>
                  {channelData.verified && (
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <p className="text-gray-400 mb-3">{channelData.handle}</p>
                
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {channelData.subscribers} subscribers
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Play className="h-3 w-3" />
                    {channelData.videos} videos
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {channelData.views} views
                  </Badge>
                </div>
              </div>
            </div>

            {analyzing && (
              <div className="mt-6 p-4 bg-purple-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                  <div>
                    <p className="text-white font-medium">Analyzing your channel...</p>
                    <p className="text-sm text-gray-400">This helps us personalize your experience</p>
                  </div>
                </div>
              </div>
            )}

            {!analyzing && (
              <div className="mt-6 p-4 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Channel connected successfully!</p>
                    <p className="text-sm text-gray-400">Your AI is ready to learn your style</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="glass rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">What happens next?</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                We'll analyze your content style
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                Train AI on your voice and tone
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                Generate personalized recommendations
              </li>
            </ul>
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={skipModal.isOpen}
        onClose={() => setSkipModal({ isOpen: false })}
        onConfirm={handleSkip}
        title="Skip Channel Connection"
        message="You can connect your channel later from the dashboard. Continue without connecting?"
        confirmText="Continue"
        cancelText="Cancel"
      />
    </div>
  );
}