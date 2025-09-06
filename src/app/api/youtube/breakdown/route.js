import { NextResponse } from 'next/server';

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

    // In a real implementation, this would use YouTube Data API
    // For now, we'll generate mock analysis data
    
    const analysis = generateVideoAnalysis(videoId);

    return NextResponse.json({
      success: true,
      analysis,
      videoUrl,
      videoId
    });

  } catch (error) {
    console.error('Video breakdown error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze video' },
      { status: 500 }
    );
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function generateVideoAnalysis(videoId) {
  // Generate realistic mock data for video analysis
  const titles = [
    "How to Make Perfect Sourdough Bread at Home",
    "10 Minute Morning Workout - No Equipment Needed",
    "Master These 5 Photography Techniques",
    "Complete Guide to Starting a Garden",
    "The Ultimate Productivity System",
    "Learn JavaScript in 20 Minutes",
    "DIY Home Organization Hacks",
    "Beginner's Guide to Investing"
  ];
  
  const channels = [
    "Master Baker Pro",
    "Fitness with Sarah",
    "Photo Academy",
    "Green Thumb Garden",
    "Productive Life",
    "Code Academy",
    "Home & Life",
    "Money Matters"
  ];
  
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomChannel = channels[Math.floor(Math.random() * channels.length)];
  
  // Generate realistic metrics
  const viewCount = Math.floor(Math.random() * 5000000) + 100000; // 100K to 5M views
  const likeCount = Math.floor(viewCount * (0.02 + Math.random() * 0.08)); // 2-10% like rate
  const commentCount = Math.floor(viewCount * (0.001 + Math.random() * 0.004)); // 0.1-0.5% comment rate
  const duration = `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
  
  // Generate content structure
  const structures = [
    [
      { section: "Hook", duration: "0:00-0:15", description: "Strong opening question about common problem" },
      { section: "Problem Setup", duration: "0:15-1:30", description: "Explain the pain point viewers face" },
      { section: "Solution Overview", duration: "1:30-3:00", description: "Preview what they'll learn" },
      { section: "Main Content", duration: "3:00-12:00", description: "Step-by-step tutorial content" },
      { section: "Recap & CTA", duration: "12:00-15:32", description: "Summary and subscribe call-to-action" }
    ],
    [
      { section: "Introduction", duration: "0:00-0:30", description: "Welcome and video preview" },
      { section: "Context", duration: "0:30-2:00", description: "Background information and setup" },
      { section: "Core Teaching", duration: "2:00-8:00", description: "Main educational content" },
      { section: "Examples", duration: "8:00-10:30", description: "Practical demonstrations" },
      { section: "Conclusion", duration: "10:30-12:00", description: "Wrap-up and next steps" }
    ],
    [
      { section: "Hook", duration: "0:00-0:20", description: "Attention-grabbing opening statement" },
      { section: "Story Setup", duration: "0:20-2:00", description: "Personal story or case study" },
      { section: "Method Reveal", duration: "2:00-6:00", description: "Show the technique or solution" },
      { section: "Deep Dive", duration: "6:00-11:00", description: "Detailed explanation and tips" },
      { section: "Call to Action", duration: "11:00-13:00", description: "Engagement and subscription request" }
    ]
  ];
  
  const randomStructure = structures[Math.floor(Math.random() * structures.length)];
  
  // Generate insights
  const insightTemplates = [
    "Strong hook with relatable problem",
    "Clear step-by-step structure",
    "Visual demonstrations throughout",
    "Strong call-to-action placement",
    "Good pacing and engagement",
    "Effective use of storytelling",
    "Clear value proposition",
    "Professional production quality",
    "Authentic presenter style",
    "Well-structured content flow",
    "Good use of examples",
    "Engaging visual elements"
  ];
  
  const selectedInsights = insightTemplates
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);
  
  return {
    title: randomTitle,
    channel: randomChannel,
    views: formatNumber(viewCount),
    likes: formatNumber(likeCount),
    comments: formatNumber(commentCount),
    duration: duration,
    engagement: ((likeCount / viewCount) * 100).toFixed(1),
    structure: randomStructure,
    insights: selectedInsights,
    metrics: {
      viewVelocity: generateViewVelocity(),
      averageViewDuration: generateAverageViewDuration(duration),
      clickThroughRate: (Math.random() * 8 + 2).toFixed(1), // 2-10% CTR
      retention: Math.floor(Math.random() * 30 + 60) // 60-90% retention
    }
  };
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function generateViewVelocity() {
  const velocities = ['High', 'Medium', 'Low'];
  return velocities[Math.floor(Math.random() * velocities.length)];
}

function generateAverageViewDuration(duration) {
  // Parse duration and calculate realistic average view duration (usually 40-70% of total)
  const [minutes, seconds] = duration.split(':').map(Number);
  const totalSeconds = minutes * 60 + seconds;
  const avgPercentage = 0.4 + Math.random() * 0.3; // 40-70%
  const avgSeconds = Math.floor(totalSeconds * avgPercentage);
  
  const avgMinutes = Math.floor(avgSeconds / 60);
  const remainingSeconds = avgSeconds % 60;
  
  return `${avgMinutes}:${String(remainingSeconds).padStart(2, '0')}`;
}