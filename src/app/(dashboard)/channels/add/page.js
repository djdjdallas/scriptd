'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Youtube,
  Users,
  TrendingUp,
  Copy,
  Edit3,
  Shuffle,
  Check,
  Lock,
  Crown,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';
import posthog from 'posthog-js';

export default function AddChannelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('existing');
  const [loading, setLoading] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [existingChannelsCount, setExistingChannelsCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  
  // Custom channel form state
  const [channelTitle, setChannelTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    fetchUserData();
    checkExistingChannels();
  }, []);

  const fetchUserData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check user subscription from users table (same as trending page)
      const { data } = await supabase
        .from('users')
        .select('subscription_tier, credits')
        .eq('id', user.id)
        .single();
      
      setUserData(data);

      // Check if premium based on subscription_tier (not 'free')
      const isPremiumUser = data?.subscription_tier && data.subscription_tier !== 'free';
      setIsPremium(isPremiumUser);
    }
    
    setCheckingPremium(false);
  };
  
  const checkExistingChannels = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: channels } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user.id);

      // Also check if user has ever created a channel (covers deleted channels)
      const { data: userData } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', user.id)
        .single();
      const channelsEverCreated = userData?.preferences?.channels_ever_created || 0;

      // Use the higher of current count vs historical count
      setExistingChannelsCount(Math.max(channels?.length || 0, channelsEverCreated));
    }
  };

  const isPremiumFeature = (feature) => {
    const premiumFeatures = ['remix'];
    return premiumFeatures.includes(feature);
  };

  const handleTabChange = (tab) => {
    // Don't allow tab changes while checking premium status
    if (checkingPremium) {
      return;
    }
    
    if (isPremiumFeature(tab) && !isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to a paid plan to access this feature",
        variant: "destructive"
      });
      return;
    }
    setActiveTab(tab);
    setShowCustomForm(false);
  };

  const handleExistingChannel = () => {
    router.push('/channels/connect');
  };

  const handleCustomChannel = async () => {
    // Check channel limit for free users
    if (!isPremium && existingChannelsCount >= 1) {
      toast({
        title: "Channel Limit Reached",
        description: "Free users can only have 1 channel. Upgrade to add more channels.",
        variant: "destructive"
      });
      return;
    }
    
    if (!channelTitle || !targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create custom channel
      const { data, error } = await supabase
        .from('channels')
        .insert({
          user_id: user.id,
          title: channelTitle,
          name: channelTitle,
          description: targetAudience,
          is_custom: true,
          youtube_url: youtubeUrl || null,
          analytics_data: {
            target_audience: targetAudience,
            created_from: 'custom'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Track channel creation for free user limits
      if (!isPremium) {
        const { data: currentUser } = await supabase
          .from('users')
          .select('preferences')
          .eq('id', user.id)
          .single();
        const prefs = currentUser?.preferences || {};
        await supabase
          .from('users')
          .update({ preferences: { ...prefs, channels_ever_created: (prefs.channels_ever_created || 0) + 1 } })
          .eq('id', user.id);
      }

      // Capture channel created event
      posthog.capture('channel_created', {
        channel_type: 'custom',
        channel_title: channelTitle,
        has_youtube_url: !!youtubeUrl,
        existing_channels_count: existingChannelsCount,
        is_premium: isPremium,
      });

      toast({
        title: "Channel Created!",
        description: "Your custom channel has been created successfully"
      });

      router.push(`/channels/${data.id}`);
    } catch (error) {
      posthog.captureException(error);
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'existing', label: 'Existing Channel', icon: Youtube },
    { id: 'custom', label: 'Custom Channel', icon: Edit3 },
    { id: 'remix', label: 'Remix Channel', icon: Shuffle, premium: true }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/channels">
          <Button variant="ghost" size="sm" className="mb-4 text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Channels
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold font-display text-white flex items-center gap-2">
          <Plus className="h-8 w-8 text-violet-400" />
          Add Your Channel
        </h1>
      </div>
      
      {/* Channel Limit Warning */}
      {!isPremium && existingChannelsCount >= 1 && (
        <Alert className="border-yellow-400/50 bg-yellow-400/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-white">
            <strong>Channel limit reached.</strong> Free users can have 1 channel. 
            <Link href="/pricing" className="text-yellow-400 hover:text-yellow-300 ml-1 underline">
              Upgrade to add unlimited channels
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-violet-500/10 text-white ring-2 ring-violet-400'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="font-medium">{tab.label}</span>
            {tab.premium && (
              <Crown className="h-3 w-3 text-yellow-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'existing' && !showCustomForm && (
        <div className="vb-card p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.04] border border-white/[0.06] rounded-full">
            <Youtube className="h-10 w-10 text-violet-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display text-white mb-3">
              Why Start From Scratch?
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Take what's already crushing it, add your twist, and make it yours. Your shortcut to channel growth.
            </p>
          </div>

          <div className="space-y-3 max-w-sm mx-auto text-left">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-400 mt-0.5" />
              <p className="text-gray-300">Clone winning channel formulas</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-400 mt-0.5" />
              <p className="text-gray-300">Adopt proven writing styles</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-400 mt-0.5" />
              <p className="text-gray-300">Build on proven audience data</p>
            </div>
          </div>

          <Button 
            onClick={handleExistingChannel}
            className="vb-btn-primary text-white"
            size="lg"
          >
            <Youtube className="mr-2 h-5 w-5" />
            Connect YouTube Channel
          </Button>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="vb-card p-8 space-y-6">
          {!showCustomForm ? (
            <>
              <div className="flex items-center gap-3 p-4 bg-white/[0.04] border border-blue-400/30 rounded-xl">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Start From Scratch</p>
                  <p className="text-sm text-gray-400">
                    Plan your channel before you start recording.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowCustomForm(true)}
                className="w-full vb-btn-outline text-white"
                size="lg"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                Create Custom Channel
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">
                  Channel Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={channelTitle}
                  onChange={(e) => setChannelTitle(e.target.value)}
                  placeholder="Tech Tips Daily"
                  className="mt-2 vb-input text-white"
                />
              </div>

              <div>
                <Label htmlFor="audience" className="text-gray-300">
                  Target Audience & Content Focus <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="My audience: Tech professionals aged 25-40 who want to improve productivity. They struggle with work-life balance.

My content: Quick tutorials on productivity tools, coding shortcuts, and time management strategies for developers."
                  className="mt-2 vb-input text-white min-h-[150px]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeft className="h-4 w-4 text-gray-400" />
                  <Label htmlFor="youtube" className="text-gray-300">
                    Have YouTube? Connect it
                  </Label>
                </div>
                <Input
                  id="youtube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@yourchannel (optional)"
                  className="vb-input text-white"
                />
              </div>

              <Button 
                onClick={handleCustomChannel}
                disabled={loading}
                className="w-full vb-btn-primary text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Channel...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Create Custom Channel
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'remix' && (
        <div className="vb-card p-8 text-center space-y-6">
          {!isPremium ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.04] border border-white/[0.06] rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                <Crown className="h-10 w-10 text-yellow-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold font-display text-white mb-3">
                  Premium Feature
                </h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Remix successful channels by combining their best elements with your unique perspective.
                </p>
              </div>

              <div className="space-y-3 max-w-sm mx-auto text-left">
                <div className="flex items-start gap-3">
                  <Shuffle className="h-5 w-5 text-violet-400 mt-0.5" />
                  <p className="text-gray-300">Combine multiple channel strategies</p>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                  <p className="text-gray-300">Leverage proven growth tactics</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-400 mt-0.5" />
                  <p className="text-gray-300">Target combined audiences</p>
                </div>
              </div>

              <Link href="/pricing" onClick={() => {
                  // Capture upgrade CTA click
                  posthog.capture('upgrade_cta_clicked', {
                    source: 'channels_add_page',
                    feature: 'remix_channel',
                    current_tier: userData?.subscription_tier || 'free',
                  });
                }}>
                <Button
                  className="vb-btn-outline bg-gradient-to-r from-yellow-500/50 to-orange-500/50 text-white"
                  size="lg"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Unlock with Creator Plan
                </Button>
              </Link>
            </>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.04] border border-white/[0.06] rounded-full">
                <Shuffle className="h-10 w-10 text-violet-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold font-display text-white mb-3">
                  Remix a Channel
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Combine successful channel strategies with your unique perspective to create something fresh.
                </p>
              </div>

              <div className="space-y-3 max-w-sm mx-auto text-left">
                <div className="flex items-start gap-3">
                  <Shuffle className="h-5 w-5 text-violet-400 mt-0.5" />
                  <p className="text-gray-300">Select 2-3 successful channels</p>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                  <p className="text-gray-300">Combine their best strategies</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-400 mt-0.5" />
                  <p className="text-gray-300">Create your unique hybrid approach</p>
                </div>
              </div>

              <Button 
                onClick={() => router.push('/channels/remix')}
                className="w-full vb-btn-primary text-white"
                size="lg"
              >
                <Shuffle className="mr-2 h-5 w-5" />
                Start Remixing Channels
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}