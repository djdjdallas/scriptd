import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchYouTubeChannels } from '@/lib/youtube/search';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const niche = searchParams.get('niche');
    const minSubscribers = searchParams.get('minSubscribers');
    const maxSubscribers = searchParams.get('maxSubscribers');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has premium access
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (!userData?.subscription_tier || userData.subscription_tier === 'free') {
      return NextResponse.json({ 
        error: 'Premium feature', 
        message: 'Channel search for remixing is a premium feature' 
      }, { status: 403 });
    }

    // First, check our database for existing channels
    let dbQuery = supabase
      .from('channels')
      .select('*')
      .order('subscriber_count', { ascending: false })
      .limit(limit);

    // Apply filters
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (minSubscribers) {
      dbQuery = dbQuery.gte('subscriber_count', parseInt(minSubscribers));
    }

    if (maxSubscribers) {
      dbQuery = dbQuery.lte('subscriber_count', parseInt(maxSubscribers));
    }

    const { data: dbChannels, error: dbError } = await dbQuery;

    if (dbError) {
      console.error('Database search error:', dbError);
    }

    // If we have results from database, return them (even if less than 10)
    if (dbChannels && dbChannels.length > 0) {
      console.log('Found channels in database:', dbChannels.length);
      const mappedChannels = dbChannels.map(channel => {
        console.log(`DB Channel: ${channel.title || channel.name}, DB ID: ${channel.id}, YouTube ID: ${channel.youtube_channel_id}`);
        return {
          id: channel.id,
          channelId: channel.youtube_channel_id,
          title: channel.title || channel.name,
          description: channel.description,
          subscriberCount: channel.subscriber_count,
          viewCount: channel.view_count,
          videoCount: channel.video_count,
          thumbnails: channel.thumbnails,
          customUrl: channel.custom_url,
          isFromDatabase: true,
          hasAnalysis: !!channel.analytics_data,
          hasVoiceProfile: !!channel.voice_profile
        };
      });
      
      return NextResponse.json({
        channels: mappedChannels,
        source: 'database'
      });
    }

    // If query is provided and we need more results, search YouTube
    if (query) {
      try {
        const youtubeChannels = await searchYouTubeChannels({
          query,
          maxResults: limit,
          type: 'channel',
          order: 'relevance'
        });

        // Combine and deduplicate results
        const combinedChannels = [];
        const seenChannelIds = new Set();

        // Add database channels first
        if (dbChannels) {
          dbChannels.forEach(channel => {
            seenChannelIds.add(channel.youtube_channel_id);
            combinedChannels.push({
              id: channel.id,
              channelId: channel.youtube_channel_id,
              title: channel.title || channel.name,
              description: channel.description,
              subscriberCount: channel.subscriber_count,
              viewCount: channel.view_count,
              videoCount: channel.video_count,
              thumbnails: channel.thumbnails,
              customUrl: channel.custom_url,
              isFromDatabase: true,
              hasAnalysis: !!channel.analytics_data,
              hasVoiceProfile: !!channel.voice_profile
            });
          });
        }

        // Add YouTube channels that aren't already in our list
        console.log('YouTube API returned', youtubeChannels.length, 'channels');
        youtubeChannels.forEach(channel => {
          // YouTube channels.list API returns channel ID directly as 'id'
          const ytChannelId = channel.id;
          console.log(`YouTube Channel: ${channel.snippet.title}, ID: ${ytChannelId}`);
          
          if (ytChannelId && !seenChannelIds.has(ytChannelId)) {
            // Apply subscriber filters if provided
            const subs = parseInt(channel.statistics?.subscriberCount || 0);
            if (minSubscribers && subs < parseInt(minSubscribers)) return;
            if (maxSubscribers && subs > parseInt(maxSubscribers)) return;

            combinedChannels.push({
              channelId: ytChannelId,  // Use the direct channel ID
              title: channel.snippet.title,
              description: channel.snippet.description,
              subscriberCount: channel.statistics?.subscriberCount,
              viewCount: channel.statistics?.viewCount,
              videoCount: channel.statistics?.videoCount,
              thumbnails: channel.snippet.thumbnails,
              customUrl: channel.snippet.customUrl,
              isFromDatabase: false,
              hasAnalysis: false,
              hasVoiceProfile: false
            });
          }
        });

        return NextResponse.json({
          channels: combinedChannels.slice(0, limit),
          source: 'combined'
        });

      } catch (youtubeError) {
        console.error('YouTube search error:', youtubeError);
        // Fall back to database results only
        return NextResponse.json({
          channels: dbChannels ? dbChannels.map(channel => ({
            id: channel.id,
            channelId: channel.youtube_channel_id,
            title: channel.title || channel.name,
            description: channel.description,
            subscriberCount: channel.subscriber_count,
            viewCount: channel.view_count,
            videoCount: channel.video_count,
            thumbnails: channel.thumbnails,
            customUrl: channel.custom_url,
            isFromDatabase: true,
            hasAnalysis: !!channel.analytics_data,
            hasVoiceProfile: !!channel.voice_profile
          })) : [],
          source: 'database',
          error: 'YouTube search unavailable'
        });
      }
    }

    // If no channels in database and no query, return sample popular channels
    const channels = dbChannels && dbChannels.length > 0 
      ? dbChannels.map(channel => ({
          id: channel.id,
          channelId: channel.youtube_channel_id,
          title: channel.title || channel.name,
          description: channel.description,
          subscriberCount: channel.subscriber_count,
          viewCount: channel.view_count,
          videoCount: channel.video_count,
          thumbnails: channel.thumbnails,
          customUrl: channel.custom_url,
          isFromDatabase: true,
          hasAnalysis: !!channel.analytics_data,
          hasVoiceProfile: !!channel.voice_profile
        }))
      : getSamplePopularChannels(); // Fallback to sample channels

    return NextResponse.json({
      channels: channels,
      source: dbChannels && dbChannels.length > 0 ? 'database' : 'sample'
    });

  } catch (error) {
    console.error('Channel search error:', error);
    return NextResponse.json(
      { error: 'Failed to search channels', details: error.message },
      { status: 500 }
    );
  }
}

// Sample popular channels for demo purposes when database is empty
function getSamplePopularChannels() {
  return [
    {
      channelId: 'UCGaVdbSav8xWuFWTadK6loA',
      title: 'Patrick Cc:',
      description: 'Video essays and deep dives into internet culture, YouTube drama, and creator stories.',
      subscriberCount: 912000,
      viewCount: 180000000,
      videoCount: 120,
      thumbnails: {
        default: { url: 'https://yt3.googleusercontent.com/ytc/AIdro_kJlcsGuMFkmQ5pq31Pw0mjGNSJgBJAh_oX39yKNJGdKQ=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@PatrickCc',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    },
    {
      channelId: 'UCmGSJVG3mCRXVOP4yZrU1Dw',
      title: 'Johnny Harris',
      description: 'Independent journalist creating investigative video essays about geopolitics, maps, and global issues.',
      subscriberCount: 6200000,
      viewCount: 900000000,
      videoCount: 250,
      thumbnails: {
        default: { url: 'https://yt3.googleusercontent.com/ytc/AIdro_lzoJxQvzKDRIUImh4YHv3wWaJJ8UWKGDGbT32hMUvfgg=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@johnnyharris',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    },
    {
      channelId: 'UCBJycsmduvYEL83R_U4JriQ',
      title: 'Marques Brownlee',
      description: 'Tech reviewer and content creator covering the latest technology, gadgets, and electric vehicles.',
      subscriberCount: 18500000,
      viewCount: 3800000000,
      videoCount: 1650,
      thumbnails: {
        default: { url: 'https://yt3.ggpht.com/lkH37D712tiyphnu0Id0D5MwwQ7IRuwgQLVD05iMXlDWO-kDHut3uI4MgIEAQ9StK0qOST7fiA=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@mkbhd',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    },
    {
      channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
      title: 'MrBeast',
      description: 'Epic challenges, massive giveaways, and extreme philanthropy content.',
      subscriberCount: 238000000,
      viewCount: 44000000000,
      videoCount: 780,
      thumbnails: {
        default: { url: 'https://yt3.ggpht.com/fxGKYucJAVme-Yz4fsdCroCFCrANWqw0ql4GYuvx8Uq4l_euNJHgE-w9MTkLQA805vWCi-kE0g=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@MrBeast',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    },
    {
      channelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
      title: 'PewDiePie',
      description: 'Gaming, commentary, and entertainment content from one of YouTube\'s most influential creators.',
      subscriberCount: 111000000,
      viewCount: 29000000000,
      videoCount: 4700,
      thumbnails: {
        default: { url: 'https://yt3.ggpht.com/5oUY3tashyxfqsjO5SGhjT4dus8FkN9CsAHwXWISFrdPYii1FudD4ICtLfuCw6-THJsJbgoY=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@PewDiePie',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    },
    {
      channelId: 'UCYzPXprvl5Y-Sf0g4vX-m6g',
      title: 'jacksepticeye',
      description: 'High-energy gaming content, vlogs, and positive community engagement.',
      subscriberCount: 30500000,
      viewCount: 16000000000,
      videoCount: 5100,
      thumbnails: {
        default: { url: 'https://yt3.ggpht.com/ytc/AIdro_kDUP8WvE11LnVRz0IwJVC8l64VWL0C0p6O4DgGgKtAksw=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@jacksepticeye',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    },
    {
      channelId: 'UCq-Fj5jknLsUf-MWSy4_brA',
      title: 'Emma Chamberlain',
      description: 'Lifestyle vlogs, fashion, and authentic storytelling from a Gen Z perspective.',
      subscriberCount: 12000000,
      viewCount: 1600000000,
      videoCount: 400,
      thumbnails: {
        default: { url: 'https://yt3.ggpht.com/ytc/AIdro_nO3F7DfVXaf6wsHPS_hF327ggeWUCwZSELb5DCWA=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@emmachamberlain',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    },
    {
      channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA',
      title: 'Veritasium',
      description: 'Science education and experiments exploring how the world works.',
      subscriberCount: 14500000,
      viewCount: 2100000000,
      videoCount: 380,
      thumbnails: {
        default: { url: 'https://yt3.ggpht.com/ytc/AIdro_kF3BQugqjJdYUHL911iKIPRdgFCN7WpUA4bkVvTMkPvg=s88-c-k-c0x00ffffff-no-rj' }
      },
      customUrl: '@veritasium',
      isFromDatabase: false,
      hasAnalysis: false,
      hasVoiceProfile: false
    }
  ];
}