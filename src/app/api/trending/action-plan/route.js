import { NextResponse } from 'next/server';
import { getClaudeService } from '@/lib/ai/claude';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const { channelName, topic, channelId } = await request.json();

    if (!channelName || !topic) {
      return NextResponse.json(
        { error: 'Channel name and topic are required' },
        { status: 400 }
      );
    }

    // Get the current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const claude = getClaudeService();

    // Fetch actual channel data from YouTube if possible
    let channelData = null;
    let channelAnalytics = '';
    
    try {
      let apiUrl;
      if (channelId) {
        // Use channel ID directly
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?` +
          `part=snippet,statistics,contentDetails&` +
          `id=${channelId}&` +
          `key=${process.env.YOUTUBE_API_KEY}`;
      } else {
        // Search for channel by name
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&` +
          `q=${encodeURIComponent(channelName)}&` +
          `type=channel&` +
          `maxResults=1&` +
          `key=${process.env.YOUTUBE_API_KEY}`
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const foundChannelId = searchData.items?.[0]?.snippet?.channelId;
          
          if (foundChannelId) {
            apiUrl = `https://www.googleapis.com/youtube/v3/channels?` +
              `part=snippet,statistics,contentDetails&` +
              `id=${foundChannelId}&` +
              `key=${process.env.YOUTUBE_API_KEY}`;
          }
        }
      }
      
      if (apiUrl) {
        const channelResponse = await fetch(apiUrl);
        if (channelResponse.ok) {
          const data = await channelResponse.json();
          channelData = data.items?.[0];
          
          if (channelData) {
            // Get recent videos for better context
            const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
            let recentVideos = [];
            
            if (uploadsPlaylistId) {
              const videosResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?` +
                `part=snippet&` +
                `playlistId=${uploadsPlaylistId}&` +
                `maxResults=5&` +
                `key=${process.env.YOUTUBE_API_KEY}`
              );
              
              if (videosResponse.ok) {
                const videosData = await videosResponse.json();
                recentVideos = videosData.items?.map(item => item.snippet.title) || [];
              }
            }
            
            // Build channel analytics summary
            channelAnalytics = `
Actual Channel Data for "${channelData.snippet.title}":
` +
              `- Description: ${channelData.snippet.description || 'No description'}
` +
              `- Subscribers: ${parseInt(channelData.statistics?.subscriberCount || 0).toLocaleString()}
` +
              `- Total Views: ${parseInt(channelData.statistics?.viewCount || 0).toLocaleString()}
` +
              `- Video Count: ${channelData.statistics?.videoCount || 0}
` +
              `- Channel Created: ${new Date(channelData.snippet.publishedAt).toLocaleDateString()}
` +
              `- Average Views per Video: ${channelData.statistics?.videoCount ? 
                Math.round(parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.videoCount)).toLocaleString() : 'N/A'}
` +
              (recentVideos.length > 0 ? `- Recent Video Topics: ${recentVideos.slice(0, 3).join(', ')}\n` : '') +
              `\nThis channel appears to focus on: ${channelData.snippet.description ? 
                channelData.snippet.description.substring(0, 200) : 'content related to ' + topic}`;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube channel data:', error);
      // Continue without channel data
    }

    // Generate a comprehensive action plan using AI
    const prompt = `Create a detailed 30-day action plan for a YouTube channel named "${channelName}" to capitalize on the trending topic "${topic}".
${channelAnalytics}

IMPORTANT: The channel "${channelName}" focuses on "${topic}". Make sure ALL content ideas, strategies, and recommendations are specifically tailored to this channel's focus area and topic. Do not default to technology content unless the topic is actually about technology. Base your recommendations on the actual channel data provided above when available.

Please provide a comprehensive JSON response with the following structure:
{
  "strategy": "Strategy name (e.g., 'Rapid Growth Strategy')",
  "timeline": "30 Days",
  "estimatedResults": {
    "views": "Realistic view range (e.g., '50K-100K')",
    "subscribers": "Realistic subscriber gain (e.g., '+500-1K')",
    "revenue": "Potential revenue range (e.g., '$500-1K')"
  },
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "Week theme",
      "tasks": [
        {
          "id": "w1t1",
          "task": "Specific task description",
          "priority": "high/medium/low"
        }
        // 5 tasks per week
      ]
    }
    // 4 weeks total
  ],
  "contentTemplates": [
    {
      "type": "Video type",
      "title": "Title template with [placeholder]",
      "structure": "Hook → Section1 → Section2 → CTA",
      "duration": "Recommended duration"
    }
    // 3 templates
  ],
  "keywords": ["keyword1", "keyword2", ...], // 6-8 relevant keywords
  "equipment": [
    {
      "item": "Equipment name",
      "essential": true/false,
      "budget": "Price range"
    }
    // 5 items
  ],
  "successMetrics": {
    "week1": { "views": "10K", "subscribers": "+100", "engagement": "5%" },
    "week2": { "views": "25K", "subscribers": "+250", "engagement": "6%" },
    "week3": { "views": "50K", "subscribers": "+500", "engagement": "7%" },
    "week4": { "views": "100K", "subscribers": "+1K", "engagement": "8%" }
  },
  "contentIdeas": [
    {
      "title": "Specific video title",
      "hook": "Opening hook to grab attention",
      "description": "Brief description",
      "estimatedViews": "View potential"
    }
    // 5 specific content ideas
  ],
  "competitorAnalysis": {
    "topChannels": ["Channel names to study"],
    "successFactors": ["What makes them successful"],
    "gaps": ["Opportunities they're missing"]
  },
  "monetizationStrategy": [
    {
      "method": "Monetization method",
      "timeline": "When to implement",
      "potential": "Revenue potential"
    }
    // 3-4 methods
  ]
}

Make the plan specific, actionable, and realistic for a channel named "${channelName}" focusing on "${topic}". 
Ensure all content ideas, equipment recommendations, and strategies are relevant to the specific topic area.
Include current trends and best practices for YouTube growth in 2024 that are relevant to this specific niche.`;

    const response = await claude.generateCompletion(prompt, {
      model: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      maxTokens: 3000,
    });

    // Parse the AI response
    let actionPlan;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        actionPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', response);
      
      // Fallback to a basic plan if parsing fails
      actionPlan = generateFallbackPlan(channelName, topic);
    }

    // Add metadata
    actionPlan.channel = channelName;
    actionPlan.topic = topic;
    actionPlan.generatedAt = new Date().toISOString();

    // Store the plan in the database
    const { error: dbError } = await supabase
      .from('action_plans')
      .insert({
        user_id: user.id,
        channel_name: channelName,
        topic: topic,
        plan_data: actionPlan,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to store action plan:', dbError);
      // Continue anyway - the plan was generated successfully
    } else {
      console.log('Action plan stored successfully for channel:', channelName);
    }

    return NextResponse.json(actionPlan);

  } catch (error) {
    console.error('Error generating action plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate action plan', details: error.message },
      { status: 500 }
    );
  }
}

// Fallback plan generator in case AI fails
function generateFallbackPlan(channelName, topic) {
  return {
    channel: channelName,
    topic: topic,
    strategy: 'Growth Strategy',
    timeline: '30 Days',
    estimatedResults: {
      views: '10K-50K',
      subscribers: '+100-500',
      revenue: '$100-500'
    },
    weeklyPlan: [
      {
        week: 1,
        theme: 'Research & Planning',
        tasks: [
          { id: 'w1t1', task: 'Research top performing videos in niche', priority: 'high' },
          { id: 'w1t2', task: 'Create content calendar', priority: 'high' },
          { id: 'w1t3', task: 'Set up analytics tracking', priority: 'medium' },
          { id: 'w1t4', task: 'Design channel branding', priority: 'medium' },
          { id: 'w1t5', task: 'Write initial video scripts', priority: 'high' }
        ]
      },
      {
        week: 2,
        theme: 'Content Creation',
        tasks: [
          { id: 'w2t1', task: 'Record first batch of videos', priority: 'high' },
          { id: 'w2t2', task: 'Edit videos with engaging hooks', priority: 'high' },
          { id: 'w2t3', task: 'Create eye-catching thumbnails', priority: 'high' },
          { id: 'w2t4', task: 'Write SEO-optimized descriptions', priority: 'medium' },
          { id: 'w2t5', task: 'Schedule uploads for optimal times', priority: 'medium' }
        ]
      },
      {
        week: 3,
        theme: 'Launch & Promotion',
        tasks: [
          { id: 'w3t1', task: 'Publish videos consistently', priority: 'high' },
          { id: 'w3t2', task: 'Share on social media platforms', priority: 'medium' },
          { id: 'w3t3', task: 'Engage with viewer comments', priority: 'high' },
          { id: 'w3t4', task: 'Reach out for collaborations', priority: 'medium' },
          { id: 'w3t5', task: 'Join relevant communities', priority: 'low' }
        ]
      },
      {
        week: 4,
        theme: 'Optimize & Scale',
        tasks: [
          { id: 'w4t1', task: 'Analyze video performance metrics', priority: 'high' },
          { id: 'w4t2', task: 'A/B test different thumbnails', priority: 'medium' },
          { id: 'w4t3', task: 'Double down on successful content', priority: 'high' },
          { id: 'w4t4', task: 'Build email list', priority: 'medium' },
          { id: 'w4t5', task: 'Plan next month content', priority: 'high' }
        ]
      }
    ],
    contentTemplates: [
      {
        type: 'Educational',
        title: 'Complete Guide to [Topic]',
        structure: 'Hook → Overview → Deep Dive → Examples → Summary',
        duration: '10-15 minutes'
      },
      {
        type: 'Review',
        title: 'Honest Review of [Product/Service]',
        structure: 'Hook → First Impressions → Testing → Pros/Cons → Verdict',
        duration: '8-12 minutes'
      },
      {
        type: 'Tutorial',
        title: 'How to [Achieve Result] - Step by Step',
        structure: 'Problem → Solution → Steps → Tips → Results',
        duration: '5-10 minutes'
      }
    ],
    keywords: [topic, channelName, '2024', 'guide', 'tutorial', 'review'],
    equipment: [
      { item: 'Microphone', essential: true, budget: '$50-150' },
      { item: 'Camera/Webcam', essential: true, budget: '$100-500' },
      { item: 'Lighting', essential: false, budget: '$30-100' },
      { item: 'Editing Software', essential: true, budget: '$0-30/mo' },
      { item: 'Thumbnail Tool', essential: true, budget: '$0-15/mo' }
    ],
    successMetrics: {
      week1: { views: '1K', subscribers: '+20', engagement: '5%' },
      week2: { views: '5K', subscribers: '+50', engagement: '6%' },
      week3: { views: '15K', subscribers: '+150', engagement: '7%' },
      week4: { views: '30K', subscribers: '+300', engagement: '8%' }
    }
  };
}