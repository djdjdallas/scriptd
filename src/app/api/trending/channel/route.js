import { NextResponse } from 'next/server';
import { getChannelById, getChannelVideos } from '@/lib/youtube/channel';
import { analyzeVideoContent } from '@/lib/youtube/video';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const channelName = searchParams.get('channelName');

    if (!channelId || channelId === 'undefined') {
      console.error('Invalid channel ID received:', channelId, 'for channel:', channelName);
      
      // If we have a channel name but no valid ID, we could try to search for it
      if (channelName && channelName !== 'undefined') {
        return NextResponse.json(
          { 
            error: 'Channel analysis requires a valid YouTube channel ID',
            suggestion: 'This channel may be from cached/demo data. Try searching for the channel directly.'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a demo channel ID
    if (channelId.startsWith('demo')) {
      return NextResponse.json(
        { 
          error: 'This is a demo channel. Channel analysis is only available for real YouTube channels.',
          isDemoChannel: true
        },
        { status: 400 }
      );
    }

    // Fetch channel data from YouTube API
    const channelData = await getChannelById(channelId);
    
    if (!channelData) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Fetch recent videos for additional insights
    const recentVideos = await getChannelVideos(channelId, 10);
    
    // Analyze video performance
    let videoAnalysis = null;
    if (recentVideos && recentVideos.length > 0) {
      videoAnalysis = await analyzeVideoContent(recentVideos);
    }

    // Format the response
    const formattedData = {
      // Basic channel info
      channelId: channelData.id,
      name: channelData.snippet.title,
      handle: channelData.snippet.customUrl || '@' + channelData.snippet.title.toLowerCase().replace(/\s+/g, ''),
      description: channelData.snippet.description,
      thumbnail: channelData.snippet.thumbnails?.high?.url || channelData.snippet.thumbnails?.default?.url,
      publishedAt: channelData.snippet.publishedAt,
      country: channelData.snippet.country,
      
      // Statistics
      stats: {
        subscribers: formatNumber(parseInt(channelData.statistics.subscriberCount || 0)),
        subscriberCount: parseInt(channelData.statistics.subscriberCount || 0),
        totalViews: formatNumber(parseInt(channelData.statistics.viewCount || 0)),
        viewCount: parseInt(channelData.statistics.viewCount || 0),
        totalVideos: formatNumber(parseInt(channelData.statistics.videoCount || 0)),
        videoCount: parseInt(channelData.statistics.videoCount || 0),
        hiddenSubscriberCount: channelData.statistics.hiddenSubscriberCount || false
      },
      
      // Calculate additional metrics
      metrics: {
        avgViews: videoAnalysis ? formatNumber(Math.round(videoAnalysis.avgViewsPerVideo)) : 'N/A',
        avgViewsRaw: videoAnalysis ? videoAnalysis.avgViewsPerVideo : 0,
        engagementRate: videoAnalysis ? (parseFloat(videoAnalysis.avgEngagementRate) || 0).toFixed(2) + '%' : 'N/A',
        engagementRateRaw: videoAnalysis ? parseFloat(videoAnalysis.avgEngagementRate) || 0 : 0,
        uploadFrequency: calculateUploadFrequency(recentVideos),
        viewsPerSubscriber: channelData.statistics.subscriberCount > 0 
          ? (parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.subscriberCount)).toFixed(1)
          : 0
      },
      
      // Recent videos
      recentVideos: recentVideos ? recentVideos.slice(0, 5).map(video => ({
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
        publishedAt: video.snippet.publishedAt,
        views: formatNumber(parseInt(video.statistics?.viewCount || 0)),
        viewsRaw: parseInt(video.statistics?.viewCount || 0),
        likes: formatNumber(parseInt(video.statistics?.likeCount || 0)),
        comments: formatNumber(parseInt(video.statistics?.commentCount || 0)),
        duration: video.contentDetails?.duration || 'N/A'
      })) : [],
      
      // Video analysis insights
      insights: videoAnalysis ? {
        topPerformingVideos: videoAnalysis.topPerformingVideos?.slice(0, 3),
        contentPatterns: videoAnalysis.contentPatterns,
        bestUploadTimes: videoAnalysis.bestUploadTimes,
        totalLikes: formatNumber(videoAnalysis.totalLikes),
        totalComments: formatNumber(videoAnalysis.totalComments)
      } : null,
      
      // Calculate performance scores
      scores: calculatePerformanceScores(channelData, videoAnalysis)
    };

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error fetching channel data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch channel data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to format numbers
function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Calculate upload frequency from recent videos
function calculateUploadFrequency(videos) {
  if (!videos || videos.length < 2) return 'N/A';
  
  const dates = videos.map(v => new Date(v.snippet.publishedAt)).sort((a, b) => b - a);
  const daysBetween = [];
  
  for (let i = 0; i < dates.length - 1 && i < 10; i++) {
    const diff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
    daysBetween.push(diff);
  }
  
  if (daysBetween.length === 0) return 'N/A';
  
  const avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
  
  if (avgDays <= 1) return 'Daily';
  else if (avgDays <= 3) return `${Math.round(7 / avgDays)}/week`;
  else if (avgDays <= 7) return 'Weekly';
  else if (avgDays <= 14) return 'Bi-weekly';
  else if (avgDays <= 30) return 'Monthly';
  else return 'Irregular';
}

// Calculate performance scores
function calculatePerformanceScores(channelData, videoAnalysis) {
  const scores = {
    overall: 0,
    content: 0,
    consistency: 0,
    engagement: 0,
    growth: 0,
    potential: 0
  };
  
  const subs = parseInt(channelData.statistics.subscriberCount || 0);
  const views = parseInt(channelData.statistics.viewCount || 0);
  const videos = parseInt(channelData.statistics.videoCount || 0);
  
  // Overall score based on channel size and activity
  if (subs > 1000000) scores.overall += 30;
  else if (subs > 100000) scores.overall += 25;
  else if (subs > 10000) scores.overall += 20;
  else if (subs > 1000) scores.overall += 15;
  else scores.overall += 10;
  
  if (views > 100000000) scores.overall += 30;
  else if (views > 10000000) scores.overall += 25;
  else if (views > 1000000) scores.overall += 20;
  else if (views > 100000) scores.overall += 15;
  else scores.overall += 10;
  
  // Content score based on video count and quality
  if (videos > 500) scores.content = 85;
  else if (videos > 200) scores.content = 75;
  else if (videos > 100) scores.content = 65;
  else if (videos > 50) scores.content = 55;
  else scores.content = 45;
  
  // Engagement score
  if (videoAnalysis) {
    const engRate = videoAnalysis.avgEngagementRate;
    if (engRate > 10) scores.engagement = 95;
    else if (engRate > 5) scores.engagement = 85;
    else if (engRate > 3) scores.engagement = 75;
    else if (engRate > 1) scores.engagement = 65;
    else scores.engagement = 50;
  } else {
    scores.engagement = 50; // Default if no analysis available
  }
  
  // Consistency score (based on video count and channel age)
  const channelAge = (Date.now() - new Date(channelData.snippet.publishedAt)) / (1000 * 60 * 60 * 24 * 365);
  const videosPerYear = videos / Math.max(1, channelAge);
  
  if (videosPerYear > 100) scores.consistency = 95;
  else if (videosPerYear > 50) scores.consistency = 85;
  else if (videosPerYear > 25) scores.consistency = 75;
  else if (videosPerYear > 12) scores.consistency = 65;
  else scores.consistency = 50;
  
  // Growth potential (inverse of size - smaller channels have more potential)
  if (subs < 10000) scores.potential = 95;
  else if (subs < 100000) scores.potential = 85;
  else if (subs < 500000) scores.potential = 75;
  else if (subs < 1000000) scores.potential = 65;
  else scores.potential = 50;
  
  // Growth score (views per subscriber ratio)
  const viewsPerSub = views / Math.max(1, subs);
  if (viewsPerSub > 100) scores.growth = 95;
  else if (viewsPerSub > 50) scores.growth = 85;
  else if (viewsPerSub > 20) scores.growth = 75;
  else if (viewsPerSub > 10) scores.growth = 65;
  else scores.growth = 50;
  
  // Add video analysis bonus
  if (videoAnalysis && videoAnalysis.avgViewsPerVideo > 10000) {
    scores.overall = Math.min(100, scores.overall + 20);
  }
  
  // Final overall score adjustment
  scores.overall = Math.min(100, scores.overall + 
    Math.round((scores.content + scores.engagement + scores.consistency) / 10));
  
  return scores;
}