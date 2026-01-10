import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { YoutubeTranscript } from '@danielxceron/youtube-transcript';
import { apiLogger } from '@/lib/monitoring/logger';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export async function POST(request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl?.trim()) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Fetch real video data from YouTube Data API
    const videoResponse = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId]
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const videoData = videoResponse.data.items[0];

    // Fetch transcript for content analysis
    let transcript = null;
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = transcriptData.map(entry => entry.text).join(' ');
    } catch {
      /* No transcript available for analysis */
    }

    // Analyze the video structure
    const analysis = await analyzeVideoStructure(videoData, transcript);

    return NextResponse.json({
      success: true,
      analysis,
      videoUrl,
      videoId
    });

  } catch (error) {
    apiLogger.error('Video breakdown error', error);
    return NextResponse.json(
      { error: 'Failed to analyze video', details: error.message },
      { status: 500 }
    );
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function analyzeVideoStructure(videoData, transcript) {
  const { snippet, statistics, contentDetails } = videoData;

  // Parse duration (ISO 8601 format to readable)
  const duration = parseDuration(contentDetails.duration);

  // Calculate engagement rate
  const views = parseInt(statistics.viewCount) || 0;
  const likes = parseInt(statistics.likeCount) || 0;
  const comments = parseInt(statistics.commentCount) || 0;
  const engagementRate = views > 0 ? ((likes / views) * 100).toFixed(1) : '0.0';

  // Analyze content structure based on transcript (if available)
  let structure = [];
  if (transcript) {
    structure = analyzeContentStructure(transcript, duration);
  } else {
    structure = [
      { section: "Introduction", duration: "0:00-0:30", description: "Video opening" },
      { section: "Main Content", duration: "0:30-" + formatSeconds(duration - 30), description: "Core video content" },
      { section: "Conclusion", duration: formatSeconds(duration - 30) + "-" + formatSeconds(duration), description: "Video closing" }
    ];
  }

  // Generate insights based on actual metrics
  const insights = generateInsights(statistics, snippet, duration);

  return {
    title: snippet.title,
    channel: snippet.channelTitle,
    views: formatNumber(views),
    likes: formatNumber(likes),
    comments: formatNumber(comments),
    duration: formatSeconds(duration),
    engagement: engagementRate,
    structure,
    insights,
    publishedAt: new Date(snippet.publishedAt).toLocaleDateString(),
    description: snippet.description?.substring(0, 200) + '...' || 'No description available'
  };
}

function parseDuration(isoDuration) {
  // Parse ISO 8601 duration (e.g., PT1H2M10S)
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

function formatSeconds(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function analyzeContentStructure(transcript, totalDuration) {
  // Simple heuristic-based structure analysis
  const wordCount = transcript.split(' ').length;
  const wordsPerSecond = wordCount / totalDuration;

  // Estimate sections based on typical YouTube video structure
  const hookEnd = Math.min(30, totalDuration * 0.05);
  const mainContentStart = hookEnd;
  const mainContentEnd = totalDuration * 0.85;
  const ctaStart = mainContentEnd;

  return [
    {
      section: "Hook",
      duration: `0:00-${formatSeconds(hookEnd)}`,
      description: "Opening hook to capture attention"
    },
    {
      section: "Main Content",
      duration: `${formatSeconds(mainContentStart)}-${formatSeconds(mainContentEnd)}`,
      description: "Core content delivery"
    },
    {
      section: "Call to Action",
      duration: `${formatSeconds(ctaStart)}-${formatSeconds(totalDuration)}`,
      description: "Closing remarks and engagement request"
    }
  ];
}

function generateInsights(statistics, snippet, duration) {
  const insights = [];
  const views = parseInt(statistics.viewCount) || 0;
  const likes = parseInt(statistics.likeCount) || 0;
  const comments = parseInt(statistics.commentCount) || 0;

  // Engagement insights
  const likeRate = views > 0 ? (likes / views) * 100 : 0;
  if (likeRate > 5) {
    insights.push("Very high engagement rate suggests quality content");
  } else if (likeRate > 2) {
    insights.push("Good engagement rate with audience");
  }

  // Comment insights
  const commentRate = views > 0 ? (comments / views) * 100 : 0;
  if (commentRate > 0.5) {
    insights.push("High comment activity indicates strong community engagement");
  }

  // Duration insights
  if (duration < 300) {
    insights.push("Short-form content optimized for quick consumption");
  } else if (duration > 600) {
    insights.push("Long-form content with in-depth coverage");
  }

  // Title insights
  if (snippet.title.length < 50) {
    insights.push("Concise, focused title");
  }

  // View count insights
  if (views > 1000000) {
    insights.push("Viral performance with massive reach");
  } else if (views > 100000) {
    insights.push("Strong performance with significant reach");
  }

  return insights.slice(0, 5);
}