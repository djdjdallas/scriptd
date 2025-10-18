import { NextResponse } from 'next/server';
import { getClaudeService } from '@/lib/ai/claude';
import { createClient } from '@/lib/supabase/server';
import { detectChannelNiche, findRealEvents, validateContentIdeas, enrichActionPlan } from '@/lib/ai/action-plan-enhancer';

export async function POST(request) {
  try {
    const { channelName, topic, channelId, remixAnalytics } = await request.json();

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
    let recentVideos = []; // Declare at function scope

    // NEW: Check if this is a remix channel with analytics data
    if (remixAnalytics) {
      // Build analytics summary from remix channel data
      console.log('Using remix analytics data for action plan generation');

      channelAnalytics = `
Remix Channel Analysis for "${channelName}":
- Channel Type: Remix channel combining multiple successful channels
- Combined Audience Reach: ${remixAnalytics.combinedReach || 'Multi-million combined reach'}
- Content Focus: ${remixAnalytics.contentFocus || 'Educational documentary content'}
`;

      // Add content ideas if available
      if (remixAnalytics.contentIdeas && remixAnalytics.contentIdeas.length > 0) {
        channelAnalytics += `\nExisting Verified Content Ideas (High-Potential):\n`;
        remixAnalytics.contentIdeas.slice(0, 5).forEach((idea, index) => {
          channelAnalytics += `${index + 1}. "${idea.title}" - ${idea.description}\n`;
          if (idea.growth_potential) {
            channelAnalytics += `   Growth Potential: ${idea.growth_potential}/10\n`;
          }
          if (idea.tags && idea.tags.length > 0) {
            channelAnalytics += `   Tags: ${idea.tags.join(', ')}\n`;
          }
        });
      }

      // Add voice style if available
      if (remixAnalytics.voiceStyle) {
        channelAnalytics += `\nVoice & Style Profile:\n`;
        if (remixAnalytics.voiceStyle.tone) {
          channelAnalytics += `- Tone: ${Array.isArray(remixAnalytics.voiceStyle.tone) ? remixAnalytics.voiceStyle.tone.join(', ') : remixAnalytics.voiceStyle.tone}\n`;
        }
        if (remixAnalytics.voiceStyle.style) {
          channelAnalytics += `- Style: ${Array.isArray(remixAnalytics.voiceStyle.style) ? remixAnalytics.voiceStyle.style.join(', ') : remixAnalytics.voiceStyle.style}\n`;
        }
        if (remixAnalytics.voiceStyle.energy) {
          channelAnalytics += `- Energy: ${remixAnalytics.voiceStyle.energy}\n`;
        }
      }

      // Add audience insights if available
      if (remixAnalytics.audienceProfile) {
        channelAnalytics += `\nTarget Audience:\n`;
        if (remixAnalytics.audienceProfile.interests) {
          channelAnalytics += `- Interests: ${remixAnalytics.audienceProfile.interests.slice(0, 5).join(', ')}\n`;
        }
        if (remixAnalytics.audienceProfile.demographics) {
          channelAnalytics += `- Demographics: ${remixAnalytics.audienceProfile.demographics}\n`;
        }
      }

      channelAnalytics += `\nIMPORTANT: This is a high-quality remix channel. Generate content ideas that match the verified ideas listed above. Focus on investigative, documentary-style content with high production value and strong storytelling. The audience expects deep-dive analysis and well-researched content.`;
    }
    // EXISTING: Fall back to YouTube API if no remix analytics
    else {
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
    } // End of else block (YouTube API fallback)

    // ========================================
    // MULTI-STAGE AI ENHANCEMENT PIPELINE
    // ========================================

    console.log('🚀 Starting multi-stage action plan generation');

    // STAGE 1: Detect actual channel niche using AI (ENHANCED)
    console.log('📊 Stage 1: Detecting channel niche...');
    const nicheDetection = await detectChannelNiche({
      name: channelName,
      description: channelData?.snippet?.description || '',
      recentVideos: recentVideos || [],
      subscriberCount: parseInt(channelData?.statistics?.subscriberCount || 0),
      viewCount: parseInt(channelData?.statistics?.viewCount || 0),
      videoCount: parseInt(channelData?.statistics?.videoCount || 0)
    });

    // Extract niche data (handle both old string format and new object format)
    const detectedNiche = typeof nicheDetection === 'string' ? nicheDetection : nicheDetection.niche;
    const broadCategory = nicheDetection.broadCategory || 'Content Creation';
    const subCategories = nicheDetection.subCategories || [];
    const confidence = nicheDetection.confidence || 'medium';
    const reasoning = nicheDetection.reasoning || 'AI-detected niche';

    console.log(`✅ Detected niche: ${detectedNiche} (${confidence} confidence)`);

    // Use detected niche instead of generic topic where appropriate
    const actualTopic = topic === 'Search Result' || topic === 'Content Creation' ? detectedNiche : topic;

    // STAGE 2: Find real events in this niche (pass sub-categories for better search)
    console.log('🔍 Stage 2: Finding real events...');
    const { success: eventsSuccess, events: realEvents, searchProvider } = await findRealEvents(
      detectedNiche,
      '12 months',
      subCategories
    );

    if (eventsSuccess && realEvents.length > 0) {
      console.log(`✅ Found ${realEvents.length} real events using ${searchProvider}`);
    } else {
      console.warn('⚠️ No real events found, will use AI-generated examples');
    }

    // Generate a comprehensive action plan using AI with real events
    const prompt = `Create a detailed 30-day action plan for a YouTube channel named "${channelName}" to capitalize on the topic "${actualTopic}".

CHANNEL CONTEXT:
${channelAnalytics}

DETECTED NICHE: ${detectedNiche}

${realEvents && realEvents.length > 0 ? `REAL EVENTS TO BASE CONTENT ON:
${realEvents.map((event, i) => `${i + 1}. "${event.title}" (${event.date})
   - ${event.description}
   - Entities: ${event.entities?.join(', ') || 'N/A'}
   - Video Angle: ${event.videoAngle || 'Deep dive analysis'}`).join('\n')}

CRITICAL: Use these REAL events as the foundation for content ideas. Every video suggestion MUST reference specific events with real names, dates, and details.` : ''}

IMPORTANT:
- The channel "${channelName}" focuses on "${actualTopic}".
- Make ALL content ideas specific with real names, dates, and events
- Do NOT use generic templates like "The [X] That [Y]" without specifics
- Base recommendations on actual channel data and real events
- Include ALL fields completely - no placeholders or undefined values

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
      "format": "Production format (e.g., 'Documentary investigation', 'Tutorial walkthrough')",
      "hook": "Specific 15-second opening line to grab attention",
      "structure": "Hook → Section1 → Section2 → CTA",
      "duration": "Recommended duration"
    }
    // 3 templates
  ],
  "keywords": ["keyword1", "keyword2", ...], // 6-8 relevant keywords
  "equipment": [
    {
      "item": "Equipment name",
      "purpose": "Why this equipment is needed for ${actualTopic} content (5-15 words)",
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

Make the plan specific, actionable, and realistic for a channel named "${channelName}" focusing on "${actualTopic}".
Ensure all content ideas, equipment recommendations, and strategies are relevant to the specific topic area.
Include current trends and best practices for YouTube growth in 2025 that are relevant to this specific niche.`;

    // STAGE 3: Generate action plan with enhanced prompt
    console.log('🎨 Stage 3: Generating action plan with AI...');
    const response = await claude.generateCompletion(prompt, {
      model: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      maxTokens: 4000, // Increased for more complete responses
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
      actionPlan = generateFallbackPlan(channelName, actualTopic);
    }

    console.log('✅ Action plan generated');

    // STAGE 4: Validate content ideas against real events
    if (realEvents && realEvents.length > 0 && actionPlan.contentIdeas) {
      console.log('✅ Stage 4: Validating content ideas...');
      try {
        actionPlan.contentIdeas = await validateContentIdeas(
          actionPlan.contentIdeas,
          realEvents,
          detectedNiche
        );
        console.log('✅ Content ideas validated');
      } catch (error) {
        console.warn('⚠️ Content idea validation failed:', error.message);
      }
    }

    // STAGE 5: Enrich missing fields
    console.log('🎨 Stage 5: Enriching missing fields...');
    try {
      actionPlan = await enrichActionPlan(actionPlan, detectedNiche);
      console.log('✅ Action plan enriched');
    } catch (error) {
      console.warn('⚠️ Enrichment failed:', error.message);
    }

    // Add metadata (ENHANCED with niche detection data)
    actionPlan.channel = channelName;
    actionPlan.topic = actualTopic;
    actionPlan.detectedNiche = detectedNiche;
    actionPlan.broadCategory = broadCategory;
    actionPlan.subCategories = subCategories;
    actionPlan.nicheConfidence = confidence;
    actionPlan.nicheReasoning = reasoning;
    actionPlan.realEventsUsed = realEvents?.length || 0;
    actionPlan.searchProvider = searchProvider || 'none';
    actionPlan.generatedAt = new Date().toISOString();
    actionPlan.enhancementPipeline = 'multi-stage-v2';

    // Store the plan in the database
    const { error: dbError } = await supabase
      .from('action_plans')
      .insert({
        user_id: user.id,
        channel_name: channelName,
        topic: actualTopic,
        plan_data: actionPlan,
        created_at: new Date().toISOString()
      });

    console.log('✅ Multi-stage action plan generation complete!');

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