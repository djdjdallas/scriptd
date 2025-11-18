import { NextResponse } from 'next/server';
import { getClaudeService } from '@/lib/ai/claude';
import { createClient } from '@/lib/supabase/server';
import { detectChannelNiche, findRealEvents, validateContentIdeas, enrichActionPlan } from '@/lib/ai/action-plan-enhancer';
import { updateProgress, PROGRESS_STAGES } from '@/lib/utils/progress-tracker';
import { extractJsonFromResponse } from '@/lib/utils/json-parser';
import { fetchChannelRecentVideos, fetchChannelInfo } from '@/lib/youtube/supadata';

export async function POST(request) {
  try {
    const { channelName, topic, channelId, remixAnalytics, sessionId, channelDescription, channelBio } = await request.json();

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

    // Check user's subscription status
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier, subscription_plan')
      .eq('id', user.id)
      .single();

    const isFreePlan = !userData?.subscription_tier ||
                       userData.subscription_tier === 'free' ||
                       userData.subscription_plan === 'free';

    // If free user, check if they've already generated an action plan
    if (isFreePlan) {
      const { count, error: countError } = await supabase
        .from('action_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // If there's an error checking the count OR if count >= 1, show upgrade message
      if (countError || count >= 1) {
        if (countError) {
          console.error('Error checking action plan count:', countError);
          console.log(`🚫 Unable to verify action plan count for free user ${user.id}, showing upgrade prompt`);
        } else {
          console.log(`🚫 Free user ${user.id} has reached action plan limit (${count} plans)`);
        }

        return NextResponse.json({
          error: 'Free plan limit reached',
          message: 'You\'ve used your 1 free action plan. Upgrade to generate unlimited action plans and unlock script generation!',
          showUpgrade: true,
          upgradeUrl: '/pricing',
          existingPlanCount: countError ? 'unknown' : count,
          benefits: [
            'Unlimited action plans',
            'Generate scripts from your plans',
            'Analyze multiple channels',
            'Export plans to PDF',
            'Track progress'
          ]
        }, { status: 403 });
      }

      // First free plan - welcome them!
      console.log(`🎉 Generating first FREE action plan for user: ${user.id}`);
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
    // EXISTING: Fall back to SupaData/YouTube API if no remix analytics
    else {
      try {
        console.log(`🔍 Attempting to fetch YouTube data for channel: ${channelName} (ID: ${channelId || 'not provided'})`);

        let actualChannelId = channelId;

        // PRIORITY 1: Try SupaData first if we have a channel ID
        if (channelId) {
          console.log(`🚀 PRIORITY 1: Trying SupaData with channel ID: ${channelId}`);
          const supadataChannel = await fetchChannelInfo(channelId);

          if (supadataChannel) {
            console.log(`✅ SupaData: Successfully fetched channel "${supadataChannel.title}"`);
            console.log(`   Subscribers: ${parseInt(supadataChannel.subscriberCount || 0).toLocaleString()}`);
            console.log(`   Videos: ${supadataChannel.videoCount || 0}`);

            // Wait 1 second to respect SupaData free plan rate limit (1 request/second)
            console.log('⏳ Waiting 1 second to respect rate limit...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Fetch recent videos from SupaData
            console.log('📹 Fetching recent videos via SupaData...');
            const supadataVideos = await fetchChannelRecentVideos(channelId, 3);

            if (supadataVideos && supadataVideos.length > 0) {
              console.log(`✅ SupaData: Fetched ${supadataVideos.length} videos`);
              recentVideos = supadataVideos.map(v => ({
                title: v.title,
                description: v.description?.substring(0, 200) || '',
                viewCount: v.viewCount,
                publishedAt: v.publishedAt
              }));
            }

            // Build channel analytics from SupaData
            channelAnalytics = `
Actual Channel Data for "${supadataChannel.title}" (via SupaData):
- Description: ${supadataChannel.description || 'No description'}
- Subscribers: ${parseInt(supadataChannel.subscriberCount || 0).toLocaleString()}
- Total Views: ${parseInt(supadataChannel.viewCount || 0).toLocaleString()}
- Video Count: ${supadataChannel.videoCount || 0}
- Channel Created: ${supadataChannel.publishedAt ? new Date(supadataChannel.publishedAt).toLocaleDateString() : 'Unknown'}
- Average Views per Video: ${supadataChannel.videoCount ?
  Math.round(parseInt(supadataChannel.viewCount) / parseInt(supadataChannel.videoCount)).toLocaleString() : 'N/A'}
${recentVideos.length > 0 ? `- Recent Video Titles: ${recentVideos.slice(0, 3).map(v => v.title).join(', ')}\n` : ''}
This channel appears to focus on: ${supadataChannel.description ?
  supadataChannel.description.substring(0, 200) : 'content related to ' + topic}`;

            // Set channelData in YouTube API format for compatibility
            channelData = {
              id: supadataChannel.id,
              snippet: {
                title: supadataChannel.title,
                description: supadataChannel.description,
                publishedAt: supadataChannel.publishedAt
              },
              statistics: {
                subscriberCount: supadataChannel.subscriberCount,
                viewCount: supadataChannel.viewCount,
                videoCount: supadataChannel.videoCount
              }
            };
          } else {
            console.log('⚠️ SupaData returned no channel data, falling back to YouTube API');
            throw new Error('SupaData fetch failed, trying YouTube API');
          }
        }

        // PRIORITY 2: Fall back to YouTube API if SupaData failed or no channel ID
        if (!channelData) {
          console.log(`🔄 PRIORITY 2: Falling back to YouTube API`);

          if (!process.env.YOUTUBE_API_KEY) {
            console.warn('⚠️ YOUTUBE_API_KEY not set, skipping YouTube API calls');
            throw new Error('YouTube API key not configured');
          }

          let apiUrl;
          if (channelId) {
            console.log(`📡 Using provided channel ID: ${channelId}`);
            apiUrl = `https://www.googleapis.com/youtube/v3/channels?` +
              `part=snippet,statistics,contentDetails&` +
              `id=${channelId}&` +
              `key=${process.env.YOUTUBE_API_KEY}`;
          } else {
            console.log(`🔎 Searching YouTube for channel by name: ${channelName}`);
            const searchResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/search?` +
              `part=snippet&` +
              `q=${encodeURIComponent(channelName)}&` +
              `type=channel&` +
              `maxResults=1&` +
              `key=${process.env.YOUTUBE_API_KEY}`
            );

            if (!searchResponse.ok) {
              const errorText = await searchResponse.text();
              console.error(`❌ YouTube search API failed (${searchResponse.status}):`, errorText);
              throw new Error(`YouTube API search failed: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();
            console.log(`📊 YouTube search returned ${searchData.items?.length || 0} results`);

            actualChannelId = searchData.items?.[0]?.snippet?.channelId;

            if (actualChannelId) {
              console.log(`✅ Found channel ID from search: ${actualChannelId}`);
              apiUrl = `https://www.googleapis.com/youtube/v3/channels?` +
                `part=snippet,statistics,contentDetails&` +
                `id=${actualChannelId}&` +
                `key=${process.env.YOUTUBE_API_KEY}`;
            } else {
              console.warn('⚠️ No channel found in YouTube search results');
              throw new Error('Channel not found in YouTube search');
            }
          }

          if (apiUrl) {
            console.log(`📡 Fetching channel details from YouTube API...`);
            const channelResponse = await fetch(apiUrl);

            if (!channelResponse.ok) {
              const errorText = await channelResponse.text();
              console.error(`❌ YouTube channel API failed (${channelResponse.status}):`, errorText);
              throw new Error(`YouTube API channel fetch failed: ${channelResponse.status}`);
            }

            const data = await channelResponse.json();
            channelData = data.items?.[0];

            if (!channelData) {
              console.warn('⚠️ YouTube API returned no channel data');
              throw new Error('No channel data returned from YouTube API');
            }

            console.log(`✅ Successfully fetched channel data for: ${channelData.snippet?.title}`);
            console.log(`   Subscribers: ${channelData.statistics?.subscriberCount || 'hidden'}`);
            console.log(`   Videos: ${channelData.statistics?.videoCount || 0}`);

            // Get recent videos using YouTube API
            const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
            if (uploadsPlaylistId) {
              const videosResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?` +
                `part=snippet&` +
                `playlistId=${uploadsPlaylistId}&` +
                `maxResults=10&` +
                `key=${process.env.YOUTUBE_API_KEY}`
              );

              if (videosResponse.ok) {
                const videosData = await videosResponse.json();
                recentVideos = videosData.items?.map(item => ({
                  title: item.snippet.title,
                  description: item.snippet.description?.substring(0, 200) || '',
                  publishedAt: item.snippet.publishedAt
                })) || [];
                console.log(`✅ YouTube API: Fetched ${recentVideos.length} videos`);
              }
            }

            // Build channel analytics summary
            channelAnalytics = `
Actual Channel Data for "${channelData.snippet.title}" (via YouTube API):
- Description: ${channelData.snippet.description || 'No description'}
- Subscribers: ${parseInt(channelData.statistics?.subscriberCount || 0).toLocaleString()}
- Total Views: ${parseInt(channelData.statistics?.viewCount || 0).toLocaleString()}
- Video Count: ${channelData.statistics?.videoCount || 0}
- Channel Created: ${new Date(channelData.snippet.publishedAt).toLocaleDateString()}
- Average Views per Video: ${channelData.statistics?.videoCount ?
  Math.round(parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.videoCount)).toLocaleString() : 'N/A'}
${recentVideos.length > 0 ? `- Recent Video Titles: ${recentVideos.slice(0, 3).map(v => v.title).join(', ')}\n` : ''}
This channel appears to focus on: ${channelData.snippet.description ?
  channelData.snippet.description.substring(0, 200) : 'content related to ' + topic}`;
          }
        }
      } catch (error) {
        console.error('❌ Error fetching YouTube channel data:', error.message);
        console.log('⚠️ Continuing without YouTube data - will use fallback method');
        // Continue without channel data
      }
    } // End of else block (SupaData/YouTube API fallback)

    // FALLBACK: If no channel data was fetched and we have a provided description/bio, use it
    if (!channelAnalytics && (channelDescription || channelBio)) {
      const providedDescription = channelDescription || channelBio;
      console.log(`📝 Using provided channel description/bio for analysis (${providedDescription.length} chars)`);
      console.log(`   Preview: ${providedDescription.substring(0, 100)}...`);
      channelAnalytics = `
Channel Data for "${channelName}":
- Description: ${providedDescription}
- Channel Focus: Based on the description provided

This channel appears to focus on: ${providedDescription.substring(0, 300)}`;
    }

    // If still no analytics, create minimal fallback
    if (!channelAnalytics) {
      console.warn(`⚠️ No channel data available for "${channelName}" - using name-only analysis`);
      console.log('   This will result in generic recommendations. Try providing a channelId or better description.');
      channelAnalytics = `
Channel: "${channelName}"
- No channel data available
- Analysis based on channel name only`;
    }

    // ========================================
    // MULTI-STAGE AI ENHANCEMENT PIPELINE
    // ========================================

    console.log('🚀 Starting multi-stage action plan generation');
    await updateProgress(sessionId, PROGRESS_STAGES.INITIALIZING, 'Starting action plan generation...', 0);

    // STAGE 1: Detect actual channel niche using AI (ENHANCED)
    console.log('📊 Stage 1: Detecting channel niche...');
    await updateProgress(sessionId, PROGRESS_STAGES.ANALYZING, 'Analyzing channel niche and audience...', 15);
    // Use provided description/bio as fallback when YouTube API fails
    const channelDescriptionToUse = channelData?.snippet?.description ||
                                    channelDescription ||
                                    channelBio ||
                                    '';

    const nicheDetection = await detectChannelNiche({
      name: channelName,
      description: channelDescriptionToUse,
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
    await updateProgress(sessionId, PROGRESS_STAGES.ANALYZING, `Detected niche: ${detectedNiche}`, 25);

    // Use detected niche instead of generic topic where appropriate
    // ENHANCED: Better handling of generic topics
    const isGenericTopic = !topic || topic === 'all' || topic === 'general' ||
                          topic === 'Search Result' || topic === 'Content Creation';
    const actualTopic = isGenericTopic ? detectedNiche : topic;

    // If still generic after niche detection, make it more specific
    const finalTopic = actualTopic === 'Content Creation' ?
      `${channelName} Channel Content Strategy` : actualTopic;

    // STAGE 2: Find real events in this niche (pass sub-categories for better search)
    console.log('🔍 Stage 2: Finding real events...');
    await updateProgress(sessionId, PROGRESS_STAGES.RESEARCH, 'Searching for trending topics and current events...', 35);
    const { success: eventsSuccess, events: realEvents, searchProvider } = await findRealEvents(
      finalTopic || detectedNiche,
      '12 months',
      subCategories
    );

    if (eventsSuccess && realEvents.length > 0) {
      console.log(`✅ Found ${realEvents.length} real events using ${searchProvider}`);
      await updateProgress(sessionId, PROGRESS_STAGES.RESEARCH, `Found ${realEvents.length} trending events`, 45);
    } else {
      console.warn('⚠️ No real events found, will use AI-generated examples');
      await updateProgress(sessionId, PROGRESS_STAGES.RESEARCH, 'Generating content ideas...', 45);
    }

    // Generate a comprehensive action plan using AI with real events
    const prompt = `Create a detailed 30-day action plan for a YouTube channel named "${channelName}" to capitalize on the topic "${finalTopic}".

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
- The channel "${channelName}" focuses on "${finalTopic}".
- Make ALL content ideas specific with real names, dates, and events
- Do NOT use generic templates like "The [X] That [Y]" without specifics
- Base recommendations on actual channel data and real events
- Include ALL fields completely - no placeholders or undefined values
- Equipment purposes must be specific to ${finalTopic} content creation

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
      "purpose": "Why this equipment is needed for ${finalTopic} content (5-15 words)",
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

Make the plan specific, actionable, and realistic for a channel named "${channelName}" focusing on "${finalTopic}".
Ensure all content ideas, equipment recommendations, and strategies are relevant to the specific topic area.
Include current trends and best practices for YouTube growth in 2025 that are relevant to this specific niche.
IMPORTANT: Provide complete JSON without truncation - all arrays should be fully populated with the specified number of items.`;

    // STAGE 3: Generate action plan with enhanced prompt
    console.log('🎨 Stage 3: Generating action plan with AI...');
    await updateProgress(sessionId, PROGRESS_STAGES.GENERATING, 'Creating personalized strategy with AI...', 55);
    const response = await claude.generateCompletion(prompt, {
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.7,
      maxTokens: 12000, // Further increased to prevent any truncation
    });

    // Parse the AI response with better error handling
    let actionPlan;
    try {
      // Use the safer JSON parser that can handle malformed JSON
      actionPlan = extractJsonFromResponse(response);

      if (!actionPlan) {
        throw new Error('Could not extract valid JSON from response');
      }

      // Validate that we have the essential fields
      if (!actionPlan.weeklyPlan || !actionPlan.contentTemplates) {
        throw new Error('Parsed JSON is missing required fields');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response (first 500 chars):', response.substring(0, 500));

      // Update progress to show error
      await updateProgress(
        sessionId,
        PROGRESS_STAGES.GENERATING,
        'Had to use fallback plan due to parsing error',
        65
      );

      // Fallback to a basic plan if parsing fails
      actionPlan = generateFallbackPlan(channelName, actualTopic);
    }

    console.log('✅ Action plan generated');
    await updateProgress(sessionId, PROGRESS_STAGES.GENERATING, 'Action plan generated successfully', 70);

    // STAGE 4: Validate content ideas against real events
    if (realEvents && realEvents.length > 0 && actionPlan.contentIdeas) {
      console.log('✅ Stage 4: Validating content ideas...');
      await updateProgress(sessionId, PROGRESS_STAGES.VALIDATING, 'Validating content ideas against trends...', 80);
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
    await updateProgress(sessionId, PROGRESS_STAGES.ENRICHING, 'Adding final touches and insights...', 90);
    try {
      actionPlan = await enrichActionPlan(actionPlan, detectedNiche);
      console.log('✅ Action plan enriched');
    } catch (error) {
      console.warn('⚠️ Enrichment failed:', error.message);
    }

    // Add metadata (ENHANCED with niche detection data)
    actionPlan.channel = channelName;
    actionPlan.topic = finalTopic;
    actionPlan.originalTopic = topic; // Keep original for debugging
    actionPlan.detectedNiche = detectedNiche;
    actionPlan.broadCategory = broadCategory;
    actionPlan.subCategories = subCategories;
    actionPlan.nicheConfidence = confidence;
    actionPlan.nicheReasoning = reasoning;
    actionPlan.realEventsUsed = realEvents?.length || 0;
    actionPlan.searchProvider = searchProvider || 'none';
    actionPlan.generatedAt = new Date().toISOString();
    actionPlan.enhancementPipeline = 'multi-stage-v3'; // Updated version

    // Add free plan indicator if applicable
    if (isFreePlan) {
      actionPlan.isFirstFreePlan = true;
      actionPlan.planMessage = '🎉 This is your 1 FREE action plan! Upgrade to create unlimited plans and generate scripts.';
      actionPlan.upgradePrompt = {
        title: 'Ready to implement this plan?',
        message: 'Generate scripts for your action plan tasks',
        cta: 'Upgrade to Creator',
        url: '/pricing'
      };
    }

    // Store the plan in the database
    const { error: dbError } = await supabase
      .from('action_plans')
      .insert({
        user_id: user.id,
        channel_name: channelName,
        topic: finalTopic,
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

    await updateProgress(sessionId, PROGRESS_STAGES.COMPLETED, 'Action plan completed!', 100);
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