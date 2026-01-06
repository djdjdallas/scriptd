import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelByUrl, parseChannelData } from '@/lib/youtube/channel';
import { extractChannelId } from '@/lib/youtube/client';

export async function POST(request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status for remix feature
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (!userData?.subscription_tier || userData.subscription_tier === 'free') {
      return NextResponse.json({ 
        error: 'Premium feature required',
        message: 'Channel remix is a premium feature'
      }, { status: 403 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ 
        error: 'YouTube URL is required' 
      }, { status: 400 });
    }

    // Validate URL format
    const channelInfo = extractChannelId(url);
    if (!channelInfo) {
      return NextResponse.json({ 
        error: 'Invalid YouTube channel URL',
        message: 'Please enter a valid YouTube channel URL (e.g., youtube.com/@channelname)'
      }, { status: 400 });
    }

    // Fetch channel data from YouTube
    const channelData = await getChannelByUrl(url);
    const parsedChannel = parseChannelData(channelData);

    // Check if channel exists in our database
    const { data: existingChannel } = await supabase
      .from('channels')
      .select('*')
      .eq('youtube_channel_id', parsedChannel.id)
      .single();

    // Format response with all necessary fields for remix
    const formattedChannel = {
      id: existingChannel?.id || null, // Database ID if exists
      youtube_channel_id: parsedChannel.id, // YouTube channel ID (critical!)
      channelId: parsedChannel.id, // Include both for compatibility
      title: parsedChannel.title || existingChannel?.title || 'Unknown Channel',
      name: parsedChannel.title || existingChannel?.name || 'Unknown Channel',
      description: parsedChannel.description || existingChannel?.description || '',
      subscriberCount: parsedChannel.statistics?.subscriberCount || existingChannel?.subscriber_count || 0,
      subscriber_count: parsedChannel.statistics?.subscriberCount || existingChannel?.subscriber_count || 0,
      viewCount: parsedChannel.statistics?.viewCount || existingChannel?.view_count || 0,
      view_count: parsedChannel.statistics?.viewCount || existingChannel?.view_count || 0,
      videoCount: parsedChannel.statistics?.videoCount || existingChannel?.video_count || 0,
      video_count: parsedChannel.statistics?.videoCount || existingChannel?.video_count || 0,
      thumbnails: parsedChannel.thumbnails || existingChannel?.thumbnails || {},
      customUrl: parsedChannel.customUrl || existingChannel?.custom_url,
      custom_url: parsedChannel.customUrl || existingChannel?.custom_url,
      isFromDatabase: !!existingChannel,
      hasAnalysis: !!existingChannel?.analytics_data,
      hasVoiceProfile: !!existingChannel?.voice_profile,
      publishedAt: parsedChannel.publishedAt || existingChannel?.created_at,
      url: url // Include the original URL for reference
    };

    return NextResponse.json({
      success: true,
      channel: formattedChannel
    });

  } catch (error) {
    console.error('Error fetching channel by URL:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('not found')) {
      return NextResponse.json({ 
        error: 'Channel not found',
        message: 'Could not find a YouTube channel at this URL. Please check the URL and try again.'
      }, { status: 404 });
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json({ 
        error: 'API limit reached',
        message: 'YouTube API limit reached. Please try again later.'
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch channel',
      message: error.message || 'An error occurred while fetching the channel'
    }, { status: 500 });
  }
}