import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { getChannelByUrl, getChannelVideos, parseChannelData } from '@/lib/youtube/channel';

// GET /api/youtube/channel?handle=channelname
export const GET = createApiHandler(async (req) => {
  const { user } = await getAuthenticatedUser();
  
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');
  const channelId = searchParams.get('channelId');
  
  if (!handle && !channelId) {
    throw new ApiError('Channel handle or ID is required', 400);
  }

  try {
    let channelData;
    
    if (channelId) {
      // Direct channel ID lookup
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,statistics,contentDetails&` +
        `id=${channelId}&` +
        `key=${process.env.YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new ApiError('Failed to fetch channel data', response.status);
      }
      
      const data = await response.json();
      channelData = data.items?.[0];
    } else {
      // Handle-based lookup
      const cleanHandle = handle.replace('@', '');
      
      // First try to search for the channel
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(cleanHandle)}&` +
        `type=channel&` +
        `maxResults=5&` +
        `key=${process.env.YOUTUBE_API_KEY}`
      );
      
      if (!searchResponse.ok) {
        throw new ApiError('Failed to search for channel', searchResponse.status);
      }
      
      const searchData = await searchResponse.json();
      const channelMatch = searchData.items?.find(item => {
        const title = item.snippet.channelTitle?.toLowerCase() || '';
        const searchTerm = cleanHandle.toLowerCase();
        return title === searchTerm || title.includes(searchTerm);
      }) || searchData.items?.[0];
      
      if (!channelMatch) {
        throw new ApiError('Channel not found', 404);
      }
      
      // Get full channel details
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,statistics,contentDetails,brandingSettings&` +
        `id=${channelMatch.snippet.channelId}&` +
        `key=${process.env.YOUTUBE_API_KEY}`
      );
      
      if (!channelResponse.ok) {
        throw new ApiError('Failed to fetch channel details', channelResponse.status);
      }
      
      const channelFullData = await channelResponse.json();
      channelData = channelFullData.items?.[0];
    }
    
    if (!channelData) {
      throw new ApiError('Channel not found', 404);
    }
    
    // Get recent videos
    let recentVideos = [];
    try {
      const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
      
      if (uploadsPlaylistId) {
        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?` +
          `part=snippet,contentDetails&` +
          `playlistId=${uploadsPlaylistId}&` +
          `maxResults=10&` +
          `key=${process.env.YOUTUBE_API_KEY}`
        );
        
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          const videoIds = videosData.items?.map(item => item.contentDetails.videoId).join(',');
          
          if (videoIds) {
            const videoDetailsResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?` +
              `part=snippet,statistics&` +
              `id=${videoIds}&` +
              `key=${process.env.YOUTUBE_API_KEY}`
            );
            
            if (videoDetailsResponse.ok) {
              const videoDetails = await videoDetailsResponse.json();
              recentVideos = videoDetails.items?.map(video => ({
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                publishedAt: video.snippet.publishedAt,
                views: parseInt(video.statistics.viewCount || 0),
                likes: parseInt(video.statistics.likeCount || 0),
                comments: parseInt(video.statistics.commentCount || 0),
                thumbnail: video.snippet.thumbnails?.high?.url
              })) || [];
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      // Continue without recent videos
    }
    
    // Parse and return channel data
    return NextResponse.json({
      id: channelData.id,
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      customUrl: channelData.snippet.customUrl,
      publishedAt: channelData.snippet.publishedAt,
      thumbnails: channelData.snippet.thumbnails,
      statistics: {
        viewCount: parseInt(channelData.statistics?.viewCount || 0),
        subscriberCount: parseInt(channelData.statistics?.subscriberCount || 0),
        videoCount: parseInt(channelData.statistics?.videoCount || 0),
      },
      brandingSettings: channelData.brandingSettings,
      recentVideos
    });
    
  } catch (error) {
    console.error('Error fetching channel data:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch channel data', 500);
  }
});