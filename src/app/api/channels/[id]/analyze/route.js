import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelById, getChannelVideos } from '@/lib/youtube/channel';
import { analyzeChannelWithClaude, generateChannelVoiceProfile } from '@/lib/ai/single-channel-analyzer';

/**
 * Detect channel type based on video titles and topics
 */
function detectChannelType(titles = [], topics = []) {
  // Combine titles and topics for analysis
  const allContent = [...titles, ...topics].join(' ').toLowerCase();

  // Define channel type patterns
  const typePatterns = {
    'tech': /\b(tech|code|programming|software|ai|machine learning|crypto|blockchain|startup|app|web|developer|javascript|python|react|vue|angular|database|api|cloud|aws|azure|devops|cybersecurity|hack)\b/gi,
    'gaming': /\b(game|gaming|gameplay|walkthrough|speedrun|esports|twitch|stream|fps|rpg|mmo|minecraft|fortnite|valorant|league|xbox|playstation|nintendo|pc gaming)\b/gi,
    'education': /\b(learn|tutorial|course|explain|how to|guide|lesson|study|education|school|university|science|math|history|physics|chemistry|biology|literature)\b/gi,
    'entertainment': /\b(funny|comedy|laugh|joke|prank|reaction|challenge|vlog|lifestyle|storytime|roast|meme|viral|tiktok|shorts)\b/gi,
    'music': /\b(music|song|album|concert|band|artist|rap|hip hop|rock|pop|jazz|classical|beat|remix|cover|lyrics|spotify|soundcloud)\b/gi,
    'fitness': /\b(workout|exercise|gym|fitness|muscle|weight|cardio|yoga|health|nutrition|diet|protein|training|crossfit|bodybuilding|wellness)\b/gi,
    'cooking': /\b(cook|recipe|food|meal|bake|kitchen|chef|restaurant|cuisine|dish|ingredient|taste|flavor|grill|fry|roast)\b/gi,
    'beauty': /\b(makeup|beauty|skincare|cosmetic|fashion|style|hair|nail|outfit|trend|look|glam|routine|product review)\b/gi,
    'finance': /\b(money|finance|invest|stock|crypto|bitcoin|ethereum|trading|market|economy|budget|saving|wealth|passive income|real estate)\b/gi,
    'travel': /\b(travel|trip|vacation|tour|destination|hotel|flight|backpack|explore|adventure|country|city|culture|tourist)\b/gi,
    'documentary': /\b(documentary|true story|history|investigation|real|incident|case|mystery|crime|scandal|expose|journalism|report)\b/gi,
    'diy': /\b(diy|craft|build|make|create|project|woodwork|repair|fix|home improvement|renovation|tool|workshop)\b/gi,
    'business': /\b(business|entrepreneur|startup|company|marketing|sales|growth|strategy|leadership|management|productivity|success)\b/gi,
    'parenting': /\b(parent|kid|child|baby|family|mom|dad|pregnancy|toddler|teen|parenting tips|school|education)\b/gi,
    'automotive': /\b(car|auto|vehicle|drive|engine|motor|race|speed|truck|bike|motorcycle|repair|mechanic|review)\b/gi,
    'sports': /\b(sport|football|basketball|soccer|baseball|tennis|golf|boxing|mma|ufc|nfl|nba|fifa|olympics|athlete)\b/gi,
    'art': /\b(art|draw|paint|sketch|design|creative|illustration|digital art|photoshop|graphic|artist|gallery)\b/gi,
    'photography': /\b(photo|camera|lens|shoot|photography|picture|image|editing|lightroom|portrait|landscape|composition)\b/gi,
    'news': /\b(news|breaking|update|report|analysis|current|event|politics|world|local|headline|story)\b/gi,
    'science': /\b(science|research|experiment|discovery|space|nasa|quantum|evolution|climate|environment|technology)\b/gi
  };

  // Count matches for each type
  const typeScores = {};
  for (const [type, pattern] of Object.entries(typePatterns)) {
    const matches = allContent.match(pattern) || [];
    typeScores[type] = matches.length;
  }

  // Find the type with highest score
  let maxScore = 0;
  let detectedType = 'general';

  for (const [type, score] of Object.entries(typeScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }

  // If no strong signal, try to detect from channel patterns
  if (maxScore < 3) {
    // Check for specific content patterns
    if (allContent.includes('explained') || allContent.includes('story of')) {
      detectedType = 'documentary';
    } else if (allContent.includes('top 10') || allContent.includes('best')) {
      detectedType = 'entertainment';
    } else if (allContent.includes('how i') || allContent.includes('my journey')) {
      detectedType = 'vlog';
    }
  }

  return detectedType;
}

/**
 * Generate fallback ideas based on channel type
 */
function generateFallbackIdeas(channelType, channelName, recentTopics = []) {
  const currentYear = new Date().getFullYear();
  const fallbackTemplates = {
    'tech': [
      {
        title: `The Rise and Fall of Silicon Valley Bank (2023)`,
        description: `Deep dive into the 2023 banking crisis that shook the tech industry`,
        format: 'documentary',
        duration: '15-20 minutes',
        growth_potential: 9,
        isVerified: true,
        verificationDetails: 'Occurred March 2023, second-largest bank failure in US history',
        tags: ['tech', 'finance', 'documentary', 'silicon valley', '2023']
      },
      {
        title: `Sam Altman's OpenAI Coup: The 5-Day CEO Drama`,
        description: `Inside story of Sam Altman's firing and return to OpenAI in November 2023`,
        format: 'explainer',
        duration: '12-15 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'Occurred November 17-22, 2023, widely documented',
        tags: ['ai', 'openai', 'tech drama', 'leadership']
      },
      {
        title: `The CrowdStrike Outage That Grounded the World`,
        description: `How a software update caused global IT chaos in July 2024`,
        format: 'technical analysis',
        duration: '10-12 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'Occurred July 19, 2024, affected millions of Windows systems',
        tags: ['cybersecurity', 'tech failure', 'crowdstrike']
      }
    ],
    'gaming': [
      {
        title: `Unity's Pricing Disaster: How They Almost Killed Indie Gaming`,
        description: `The 2023 Unity runtime fee controversy that united developers against them`,
        format: 'documentary',
        duration: '15-20 minutes',
        growth_potential: 9,
        isVerified: true,
        verificationDetails: 'September 2023, Unity announced then reversed runtime fees',
        tags: ['gaming', 'unity', 'indie games', 'controversy']
      },
      {
        title: `Microsoft's $69 Billion Gamble: The Activision Blizzard Acquisition`,
        description: `Inside the largest gaming acquisition in history`,
        format: 'business analysis',
        duration: '20-25 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'Deal closed October 13, 2023 after 20-month regulatory battle',
        tags: ['gaming', 'microsoft', 'activision', 'business']
      }
    ],
    'finance': [
      {
        title: `The FTX Collapse: $32 Billion Gone in 10 Days`,
        description: `Complete timeline of the FTX bankruptcy and SBF's fraud trial`,
        format: 'documentary',
        duration: '25-30 minutes',
        growth_potential: 10,
        isVerified: true,
        verificationDetails: 'November 2022 collapse, SBF convicted November 2023',
        tags: ['crypto', 'ftx', 'fraud', 'finance']
      },
      {
        title: `GameStop 2.0: The Return of Roaring Kitty in 2024`,
        description: `Keith Gill's 2024 return and the second meme stock surge`,
        format: 'market analysis',
        duration: '15-20 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'May 2024, Keith Gill returned causing GME to surge 180%',
        tags: ['stocks', 'gamestop', 'wallstreetbets', 'investing']
      }
    ],
    'documentary': [
      {
        title: `The Titan Submersible Implosion: A Preventable Tragedy`,
        description: `Investigation into the 2023 OceanGate disaster`,
        format: 'investigative documentary',
        duration: '20-25 minutes',
        growth_potential: 9,
        isVerified: true,
        verificationDetails: 'June 18, 2023, five people died visiting Titanic wreck',
        tags: ['documentary', 'tragedy', 'ocean', 'investigation']
      },
      {
        title: `The Hawaii Fires: Maui's Deadliest Day`,
        description: `The 2023 Lahaina fire that became Hawaii's worst natural disaster`,
        format: 'documentary',
        duration: '18-22 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'August 8, 2023, killed 100+ people, destroyed historic Lahaina',
        tags: ['documentary', 'disaster', 'hawaii', 'climate']
      }
    ],
    'entertainment': [
      {
        title: `The Hollywood Strikes That Changed Everything`,
        description: `2023's dual WGA and SAG-AFTRA strikes that shut down Hollywood`,
        format: 'explainer',
        duration: '15-20 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'May-November 2023, first dual strike since 1960',
        tags: ['hollywood', 'entertainment', 'strikes', 'industry']
      },
      {
        title: `MrBeast vs. The Internet: The Controversies of 2024`,
        description: `Examining the allegations and controversies surrounding YouTube's biggest creator`,
        format: 'analysis',
        duration: '12-15 minutes',
        growth_potential: 9,
        isVerified: true,
        verificationDetails: '2024 workplace allegations and Beast Games controversies',
        tags: ['youtube', 'mrbeast', 'controversy', 'creator economy']
      }
    ],
    'music': [
      {
        title: `Taylor Swift's Eras Tour: The $2 Billion Concert Phenomenon`,
        description: `How Taylor Swift's tour became the highest-grossing tour in history`,
        format: 'documentary',
        duration: '20-25 minutes',
        growth_potential: 9,
        isVerified: true,
        verificationDetails: '2023-2024 tour, first to gross over $2 billion',
        tags: ['music', 'taylor swift', 'concerts', 'business']
      },
      {
        title: `The Spotify Layoffs: Music Streaming's Reality Check`,
        description: `Why Spotify cut 17% of workforce despite record revenues`,
        format: 'business analysis',
        duration: '12-15 minutes',
        growth_potential: 7,
        isVerified: true,
        verificationDetails: 'December 2023, laid off 1,500 employees',
        tags: ['music', 'spotify', 'tech', 'business']
      }
    ],
    'general': [
      {
        title: `The Chinese Spy Balloon Incident of 2023`,
        description: `When a balloon captivated America and strained US-China relations`,
        format: 'documentary',
        duration: '15-18 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'January-February 2023, shot down over Atlantic Ocean',
        tags: ['politics', 'china', 'usa', 'espionage']
      },
      {
        title: `The Reddit Blackout: When Communities Fought Back`,
        description: `How Reddit's API changes sparked the largest protest in its history`,
        format: 'explainer',
        duration: '12-15 minutes',
        growth_potential: 7,
        isVerified: true,
        verificationDetails: 'June 2023, 8000+ subreddits went dark in protest',
        tags: ['reddit', 'social media', 'protest', 'api']
      },
      {
        title: `The Baltimore Bridge Collapse: Seconds to Disaster`,
        description: `How a container ship destroyed the Francis Scott Key Bridge`,
        format: 'documentary',
        duration: '18-22 minutes',
        growth_potential: 8,
        isVerified: true,
        verificationDetails: 'March 26, 2024, MV Dali struck bridge, 6 workers died',
        tags: ['disaster', 'infrastructure', 'maritime', 'baltimore']
      }
    ]
  };

  // Get templates for the detected type, or use general if not found
  const templates = fallbackTemplates[channelType] || fallbackTemplates['general'];

  // Add channel-specific context to make ideas more relevant
  const contextualizedIdeas = templates.map(idea => ({
    ...idea,
    title: `${idea.title}`,
    channelRelevance: `Relevant for ${channelName} as a ${channelType} channel`,
    suggestedApproach: `Present in ${channelName}'s unique style focusing on ${channelType} audience interests`
  }));

  console.log(`🎯 Generated ${contextualizedIdeas.length} fallback ideas for ${channelType} channel`);

  return contextualizedIdeas;
}

export async function POST(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get channel from database
    const { data: dbChannel, error: fetchError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !dbChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Check if this is a remix channel - use existing logic
    if (dbChannel.is_remix) {
      // For remix channels, return the pre-analyzed data
      const { data: remixData } = await supabase
        .from('remix_channels')
        .select('*, source_channel_ids')
        .eq('channel_id', id)
        .single();

      if (remixData) {
        // Check for remix analyses first
        const { data: remixAnalyses } = await supabase
          .from('channel_remix_analyses')
          .select('*')
          .eq('remix_channel_id', remixData.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        const combinedAnalytics = remixData.combined_analytics || {};
        const analysisData = remixAnalyses?.analysis_data || {};

        // Calculate combined stats from source channels if needed
        let totalViews = 0;
        let totalSubscribers = 0;
        let totalVideos = 0;

        // Try to get stats from source channels
        if (remixData.source_channel_ids && remixData.source_channel_ids.length > 0) {
          const { data: sourceChannels } = await supabase
            .from('channels')
            .select('view_count, subscriber_count, video_count')
            .in('id', remixData.source_channel_ids);

          if (sourceChannels) {
            totalViews = sourceChannels.reduce((sum, ch) => sum + (ch.view_count || 0), 0);
            totalSubscribers = sourceChannels.reduce((sum, ch) => sum + (ch.subscriber_count || 0), 0);
            totalVideos = sourceChannels.reduce((sum, ch) => sum + (ch.video_count || 0), 0);
          }
        }

        // Format the response to match expected structure
        const formattedAnalytics = {
          channel: {
            totalViews: totalViews || dbChannel.view_count || 0,
            subscriberCount: totalSubscribers || dbChannel.subscriber_count || 0,
            videoCount: totalVideos || dbChannel.video_count || 0,
            title: dbChannel.name || dbChannel.title,
            description: dbChannel.description
          },
          performance: {
            avgViewsPerVideo: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
            viewsToSubscriberRatio: totalSubscribers > 0 ? Math.round((totalViews / totalSubscribers) * 100) : 0,
            engagementRate: combinedAnalytics.engagementRate || 5,
            performanceScore: combinedAnalytics.performanceScore || 75,
            growthPotential: typeof combinedAnalytics.growthPotential === 'number' ? combinedAnalytics.growthPotential : 80
          },
          audience: combinedAnalytics.audience || analysisData.audience || {},
          contentTrends: combinedAnalytics.contentTrends || [],
          competitorAnalysis: combinedAnalytics.competitorAnalysis || []
        };

        // Return the pre-computed remix analysis with proper structure
        return NextResponse.json({
          analytics: formattedAnalytics,
          persona: analysisData.audience?.audience_analysis || combinedAnalytics.audience || {},
          insights: {
            strengths: analysisData.insights || combinedAnalytics.insights || [],
            opportunities: analysisData.recommendations || combinedAnalytics.recommendations || [],
            metrics: {
              performanceScore: formattedAnalytics.performance.performanceScore,
              growthPotential: typeof formattedAnalytics.performance.growthPotential === 'number' ? formattedAnalytics.performance.growthPotential : 80,
              audienceQuality: 85 // Default high quality for remix
            }
          },
          audienceAnalysis: analysisData.audience?.audience_analysis || combinedAnalytics.audience || {},
          contentIdeas: combinedAnalytics.contentIdeas || analysisData.recommendations || [],
          voiceProfile: remixData.combined_voice_profile || combinedAnalytics.voiceProfile || {},
          isRemix: true,
          message: 'Remix channel analysis loaded from combined data'
        });
      }

      // If no remix data found, return error for remix channels
      return NextResponse.json({
        error: 'Remix channel analysis not available. Please recreate the remix.'
      }, { status: 400 });
    }

    // === NEW: Comprehensive Analysis for Regular Channels ===
    console.log('🚀 Starting comprehensive channel analysis for:', dbChannel.name);
    console.log('📍 YouTube Channel ID:', dbChannel.youtube_channel_id);

    // Fetch fresh channel data from YouTube
    const channel = await getChannelById(dbChannel.youtube_channel_id);

    console.log('✅ Found YouTube channel:', channel.snippet?.title);
    console.log('📺 Channel ID:', channel.id);
    console.log('👥 Subscribers:', parseInt(channel.statistics?.subscriberCount || 0).toLocaleString());

    // Fetch recent videos for analysis
    const videos = await getChannelVideos(dbChannel.youtube_channel_id, 50);

    console.log(`📊 Analyzing channel with ${videos.length} videos`);

    // Use the SAME comprehensive analysis system as remix channels
    const { analyzeChannelVoicesFromYouTube } = await import('@/lib/ai/remix-voice-analyzer');
    const {
      generateAudienceInsights,
      generateRemixContentIdeas,
      analyzeRemixWithClaude
    } = await import('@/lib/ai/remix-analyzer');

    console.log('🎯 Running deep analysis with transcript-based voice profiling...');

    // Prepare channel data in the format expected by the remix analyzer
    const channelForAnalysis = {
      ...channel,
      youtube_channel_id: channel.id,
      title: channel.snippet?.title,
      name: channel.snippet?.title,
      subscriber_count: parseInt(channel.statistics?.subscriberCount || 0),
      description: channel.snippet?.description || dbChannel.description
    };

    try {
      // Step 1: Analyze voice from transcripts (just like remix does)
      console.log('📊 Step 1: Analyzing voice from transcripts...');
      const voiceAnalyses = await analyzeChannelVoicesFromYouTube([channelForAnalysis], {});

      // Step 2: Generate deep audience insights (just like remix does)
      console.log('📊 Step 2: Generating audience insights...');
      // Include video information for better audience analysis
      const channelWithContext = {
        ...channelForAnalysis,
        recentVideos: videos.slice(0, 10).map(v => ({
          title: v.snippet?.title,
          description: v.snippet?.description?.substring(0, 200)
        }))
      };
      const audienceInsights = await generateAudienceInsights([channelWithContext], {
        name: dbChannel.name,
        description: dbChannel.description || ''
      });

      // Step 3: Generate comprehensive channel analysis (strengths, opportunities, etc.)
      console.log('📊 Step 3: Generating comprehensive analysis...');
      const comprehensiveAnalysis = await analyzeRemixWithClaude([channelWithContext], {
        name: dbChannel.name,
        description: dbChannel.description || channel.snippet?.description || '',
        actualContent: videos.slice(0, 5).map(v => v.snippet?.title).join(', '),
        weights: { [channel.id]: 1.0 },
        elements: {
          voice_style: true,
          content_strategy: true,
          audience_targeting: true
        }
      });

      // Step 4: Generate content ideas with proper context including video information
      console.log('📊 Step 4: Generating content ideas...');
      // Add video information to the channel data for better content generation
      const channelWithVideos = {
        ...channelForAnalysis,
        recentVideos: videos.slice(0, 10).map(v => ({
          title: v.snippet?.title,
          description: v.snippet?.description?.substring(0, 200)
        })),
        voiceAnalysis: voiceAnalyses[0]?.voiceAnalysis || {}
      };

      const contentIdeas = await generateRemixContentIdeas(
        [channelWithVideos],
        {
          name: dbChannel.name,
          description: dbChannel.description || channel.snippet?.description || '',
          actualChannelContent: `This channel creates content about: ${videos.slice(0, 5).map(v => v.snippet?.title).join(', ')}`
        },
        comprehensiveAnalysis?.analysis || {}
      );

      // Debug: Log content ideas generation result
      console.log('💡 Content Ideas Generated:', {
        success: contentIdeas?.success,
        ideasCount: contentIdeas?.ideas?.length || 0,
        firstIdea: contentIdeas?.ideas?.[0]?.title || 'none'
      });

      console.log('✅ Deep analysis completed successfully');

      // Use the rich remix-style analysis
      var claudeAnalysis = {
        success: true,
        analysis: {
          // Audience data
          audience_analysis: audienceInsights?.insights || {},
          audienceProfile: audienceInsights?.insights || {},

          // Comprehensive analysis data
          growthStrategy: comprehensiveAnalysis?.analysis?.growthTactics || {},
          optimizationOpportunities: comprehensiveAnalysis?.analysis?.challenges || [],
          contentRecommendations: contentIdeas?.ideas || [],
          actionPlan: comprehensiveAnalysis?.analysis?.actionPlan || {},

          // Voice and style
          voiceAndStyle: comprehensiveAnalysis?.analysis?.voiceProfile || {},
          contentAnalysis: comprehensiveAnalysis?.analysis?.contentStrategy || {},
          competitivePositioning: comprehensiveAnalysis?.analysis?.positioning || {}
        },
        model: 'claude-sonnet-4-5-20250929'
      };

      // If content ideas are empty, generate intelligent fallback ideas
      if (!claudeAnalysis.analysis.contentRecommendations || claudeAnalysis.analysis.contentRecommendations.length === 0) {
        console.log('⚠️ No content ideas generated, creating intelligent fallback based on channel analysis');

        // Analyze recent video titles to understand content type
        const recentTitles = videos.slice(0, 10).map(v => v.snippet?.title?.toLowerCase() || '').join(' ');
        const recentTopics = videos.slice(0, 5).map(v => v.snippet?.title || '').filter(Boolean);

        // Detect channel type based on content patterns
        const channelType = detectChannelType(recentTitles, recentTopics);
        console.log(`📊 Detected channel type: ${channelType}`);

        // Generate appropriate fallback ideas based on detected type
        claudeAnalysis.analysis.contentRecommendations = generateFallbackIdeas(
          channelType,
          dbChannel.name,
          recentTopics
        );
      }

      var voiceProfileResult = {
        success: voiceAnalyses[0]?.voiceAnalysis ? true : false,
        voiceProfile: voiceAnalyses[0]?.voiceAnalysis || {},
        basedOnRealData: voiceAnalyses[0]?.source === 'youtube-transcripts'
      };
    } catch (deepAnalysisError) {
      console.warn('⚠️ Deep analysis failed, falling back to basic analysis:', deepAnalysisError.message);
      console.error('Deep analysis error details:', deepAnalysisError);
      // Fallback to basic analysis
      var claudeAnalysis = await analyzeChannelWithClaude(channel, videos, dbChannel);
      var voiceProfileResult = await generateChannelVoiceProfile(channel, videos);
    }

    // Extract analysis sections
    const analysis = claudeAnalysis.analysis;

    // Debug: Log content recommendations
    console.log('📝 Content Recommendations Check:', {
      hasContentRecommendations: !!analysis?.contentRecommendations,
      recommendationsCount: analysis?.contentRecommendations?.length || 0,
      firstRecommendation: analysis?.contentRecommendations?.[0] || 'none'
    });

    // Check if we have remix-style deep analysis with audience_analysis
    const hasDeepAnalysis = analysis.audience_analysis;
    const audienceData = hasDeepAnalysis || analysis.audienceProfile || {};

    // Format analytics data to match expected structure
    const stats = channel.statistics || {};

    // Extract content keywords from video titles
    const videoTitles = videos.map(v => v.snippet?.title || '').join(' ');
    const topKeywords = extractTopKeywords(videoTitles, videos);

    const formattedAnalytics = {
      channel: {
        totalViews: parseInt(stats.viewCount || 0),
        subscriberCount: parseInt(stats.subscriberCount || 0),
        videoCount: parseInt(stats.videoCount || 0),
        title: channel.snippet?.title || dbChannel.name,
        description: channel.snippet?.description || dbChannel.description
      },
      performance: {
        avgViewsPerVideo: videos.length > 0
          ? Math.round(videos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || 0), 0) / videos.length)
          : 0,
        viewsToSubscriberRatio: stats.subscriberCount > 0
          ? Math.round((stats.viewCount / stats.subscriberCount) * 100)
          : 0,
        engagementRate: calculateEngagementRate(videos),
        performanceScore: analysis.metricsAndBenchmarks?.performanceScore || 70,
        growthPotential: analysis.metricsAndBenchmarks?.growthPotential || 75,
        totalEngagements: videos.reduce((sum, v) => {
          return sum + parseInt(v.statistics?.likeCount || 0) + parseInt(v.statistics?.commentCount || 0);
        }, 0)
      },
      // Use deep audience analysis if available
      audience: hasDeepAnalysis ? {
        demographic_profile: audienceData.demographic_profile || {},
        psychographic_analysis: audienceData.psychographic_analysis || {},
        audience_overlap: audienceData.audience_overlap || {},
        engagement_drivers: audienceData.engagement_drivers || {},
        content_consumption_patterns: audienceData.content_consumption_patterns || {},
        monetization_potential: audienceData.monetization_potential || {},
        actionable_recommendations: audienceData.actionable_recommendations || {}
      } : {
        demographics: analysis.audienceProfile?.demographics || {},
        interests: analysis.audienceProfile?.interests || [],
        psychographics: analysis.audienceProfile?.psychographics || {},
        viewingHabits: analysis.audienceProfile?.viewingHabits || {}
      },
      // Add content field (what the frontend expects)
      content: {
        topKeywords: topKeywords,
        contentTypes: analysis.contentAnalysis?.contentTypes || analysis.contentAnalysis?.contentPillars || {},
        contentPillars: analysis.contentAnalysis?.contentPillars || [],
        whatWorksWell: analysis.contentAnalysis?.whatWorksWell || [],
        contentGaps: analysis.contentAnalysis?.contentGaps || [],
        optimalLength: analysis.contentAnalysis?.optimalVideoLength || analysis.contentAnalysis?.videoLength || '10-15 minutes',
        publishingFrequency: analysis.contentAnalysis?.publishingFrequency || analysis.contentAnalysis?.uploadSchedule || 'Weekly',
        contentPatterns: analysis.contentAnalysis?.contentPatterns || {}
      },
      contentAnalysis: analysis.contentAnalysis || {},
      voiceAndStyle: analysis.voiceAndStyle || {},
      competitivePositioning: analysis.competitivePositioning || {},
      topVideos: videos.slice(0, 10).map(v => ({
        id: v.id,
        title: v.snippet?.title,
        views: parseInt(v.statistics?.viewCount || 0),
        likes: parseInt(v.statistics?.likeCount || 0),
        comments: parseInt(v.statistics?.commentCount || 0),
        publishedAt: v.snippet?.publishedAt
      })).sort((a, b) => b.views - a.views),
      analysisMetadata: {
        videosAnalyzed: videos.length,
        analysisDate: new Date().toISOString(),
        hasDeepAnalysis
      }
    };

    // Create comprehensive insights object
    const comprehensiveInsights = {
      strengths: extractStrengths(analysis),
      // Handle opportunities - convert object to array if needed
      opportunities: (() => {
        const opps = analysis.optimizationOpportunities || [];
        if (Array.isArray(opps)) {
          return opps;
        } else if (typeof opps === 'object' && Object.keys(opps).length > 0) {
          // Convert object to array of items
          return Object.entries(opps).map(([category, items]) => ({
            category,
            items: Array.isArray(items) ? items : [items]
          }));
        }
        // Default opportunities if none provided
        return [
          {
            category: 'Content Optimization',
            items: [
              'Optimize video titles and thumbnails for higher click-through rates',
              'Experiment with different content formats to increase engagement',
              'Create more series-based content to build viewer anticipation'
            ]
          },
          {
            category: 'Audience Growth',
            items: [
              'Collaborate with similar channels in your niche',
              'Leverage trending topics while staying true to your brand',
              'Improve call-to-action strategies to boost subscription rates'
            ]
          }
        ];
      })(),
      // Add recommendations field mapping from contentRecommendations
      recommendations: (() => {
        const recs = analysis.contentRecommendations || [];
        if (Array.isArray(recs) && recs.length > 0) {
          // Extract actionable recommendations from content ideas
          return recs.slice(0, 5).map(rec => {
            if (typeof rec === 'string') return rec;
            if (rec.title) return `Create: ${rec.title}`;
            if (rec.recommendation) return rec.recommendation;
            return JSON.stringify(rec);
          });
        }

        // Extract from growth strategy
        const growthRecs = [];
        if (analysis.growthStrategy?.quickWins) {
          const quickWins = Array.isArray(analysis.growthStrategy.quickWins)
            ? analysis.growthStrategy.quickWins
            : [analysis.growthStrategy.quickWins];
          growthRecs.push(...quickWins);
        }
        if (analysis.growthStrategy?.mediumTerm) {
          const mediumTerm = Array.isArray(analysis.growthStrategy.mediumTerm)
            ? analysis.growthStrategy.mediumTerm
            : [analysis.growthStrategy.mediumTerm];
          growthRecs.push(...mediumTerm.slice(0, 3));
        }

        if (growthRecs.length > 0) return growthRecs.slice(0, 5);

        // Default recommendations
        return [
          'Increase upload consistency to 2-3 videos per week',
          'Focus on creating content around your top-performing topics',
          'Improve video retention by adding hooks in the first 15 seconds',
          'Engage with your audience through community posts and comments',
          'Analyze competitors to identify content gaps and opportunities'
        ];
      })(),
      growthStrategy: analysis.growthStrategy || {},
      contentRecommendations: analysis.contentRecommendations || [],
      actionPlan: analysis.actionPlan || {},
      metrics: {
        performanceScore: formattedAnalytics.performance.performanceScore,
        growthPotential: formattedAnalytics.performance.growthPotential,
        audienceQuality: calculateAudienceQuality(formattedAnalytics)
      }
    };

    // Save comprehensive analysis to database with DEEP audience data
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('channel_analyses')
      .insert({
        channel_id: id,
        user_id: user.id,
        analytics_data: formattedAnalytics,
        // Store the DEEP audience analysis from remix-style insights
        audience_persona: hasDeepAnalysis ? audienceData : (analysis.audienceProfile || {}),
        audience_description: hasDeepAnalysis
          ? formatAudienceDescription(audienceData)
          : formatAudienceDescription(analysis.audienceProfile),
        insights: comprehensiveInsights,
        content_ideas: analysis.contentRecommendations || [],
        videos_analyzed: videos.length,
        analysis_date: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
    }

    // Update channel with latest analytics, voice profile, and audience description using DEEP data
    await supabase
      .from('channels')
      .update({
        last_analyzed_at: new Date().toISOString(),
        // Use deep audience data for description
        audience_description: hasDeepAnalysis
          ? formatAudienceDescription(audienceData)
          : formatAudienceDescription(analysis.audienceProfile),
        // Store the FULL voice profile from transcript analysis
        voice_profile: voiceProfileResult.success ? voiceProfileResult.voiceProfile : {},
        analytics_summary: {
          performance_score: formattedAnalytics.performance.performanceScore,
          growth_potential: formattedAnalytics.performance.growthPotential,
          audience_quality: comprehensiveInsights.metrics.audienceQuality,
          // Use deep demographics if available
          demographics: hasDeepAnalysis
            ? (audienceData.demographic_profile || {})
            : (analysis.audienceProfile?.demographics || {}),
          interests: hasDeepAnalysis
            ? (audienceData.psychographic_analysis?.interests || [])
            : (analysis.audienceProfile?.interests || []),
        },
      })
      .eq('id', id)
      .eq('user_id', user.id);

    console.log('✅ Comprehensive analysis completed and saved');

    // Return comprehensive response with DEEP data
    return NextResponse.json({
      analytics: formattedAnalytics,
      persona: hasDeepAnalysis
        ? (audienceData.psychographic_analysis?.persona || '')
        : (analysis.audienceProfile?.persona || ''),
      insights: comprehensiveInsights,
      // Return deep audience analysis if available
      audienceAnalysis: hasDeepAnalysis ? audienceData : (analysis.audienceProfile || {}),
      contentIdeas: analysis.contentRecommendations || [],
      voiceProfile: voiceProfileResult.success ? voiceProfileResult.voiceProfile : {},
      channelIdentity: analysis.channelIdentity || {},
      growthStrategy: analysis.growthStrategy || {},
      competitivePositioning: analysis.competitivePositioning || {},
      actionPlan: analysis.actionPlan || {},
      analysisId: savedAnalysis?.id,
      isComprehensive: true,
      hasDeepAnalysis: hasDeepAnalysis,
      basedOnRealData: voiceProfileResult.basedOnRealData || false,
      message: hasDeepAnalysis
        ? 'Comprehensive AI analysis with deep audience insights completed successfully'
        : 'Comprehensive AI analysis completed successfully'
    });

  } catch (error) {
    console.error('Error analyzing channel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze channel' },
      { status: 500 }
    );
  }
}

// Helper functions

function calculateEngagementRate(videos) {
  if (!videos.length) return 0;

  const totalEngagement = videos.reduce((sum, v) => {
    const views = parseInt(v.statistics?.viewCount || 0);
    const likes = parseInt(v.statistics?.likeCount || 0);
    const comments = parseInt(v.statistics?.commentCount || 0);
    return sum + (views > 0 ? ((likes + comments) / views) * 100 : 0);
  }, 0);

  return Math.round((totalEngagement / videos.length) * 10) / 10;
}

function calculateAudienceQuality(analytics) {
  const { performance } = analytics;
  let score = 50; // Base score

  // High engagement rate indicates quality audience
  if (performance.engagementRate > 5) score += 15;
  else if (performance.engagementRate > 3) score += 10;
  else if (performance.engagementRate > 1) score += 5;

  // Good views to subscriber ratio
  if (performance.viewsToSubscriberRatio > 200) score += 20;
  else if (performance.viewsToSubscriberRatio > 100) score += 15;
  else if (performance.viewsToSubscriberRatio > 50) score += 10;

  // Performance score contribution
  score += Math.round(performance.performanceScore * 0.15);

  return Math.min(100, score);
}

function extractStrengths(analysis) {
  const strengths = [];

  // Extract from channelIdentity
  if (analysis.channelIdentity?.uniqueElements) {
    strengths.push({
      category: 'Channel Identity',
      items: Array.isArray(analysis.channelIdentity.uniqueElements)
        ? analysis.channelIdentity.uniqueElements
        : [analysis.channelIdentity.uniqueElements]
    });
  }

  if (analysis.channelIdentity?.coreValue || analysis.channelIdentity?.niche) {
    const identityItems = [];
    if (analysis.channelIdentity.coreValue) identityItems.push(analysis.channelIdentity.coreValue);
    if (analysis.channelIdentity.niche) identityItems.push(`Focused on ${analysis.channelIdentity.niche}`);
    if (identityItems.length > 0) {
      strengths.push({
        category: 'Channel Focus',
        items: identityItems
      });
    }
  }

  // Extract from contentAnalysis
  if (analysis.contentAnalysis?.whatWorksWell) {
    strengths.push({
      category: 'Content Performance',
      items: Array.isArray(analysis.contentAnalysis.whatWorksWell)
        ? analysis.contentAnalysis.whatWorksWell
        : [analysis.contentAnalysis.whatWorksWell]
    });
  }

  if (analysis.contentAnalysis?.contentPillars) {
    strengths.push({
      category: 'Content Pillars',
      items: Array.isArray(analysis.contentAnalysis.contentPillars)
        ? analysis.contentAnalysis.contentPillars
        : [analysis.contentAnalysis.contentPillars]
    });
  }

  // Extract from competitivePositioning
  if (analysis.competitivePositioning?.uniqueAdvantages) {
    strengths.push({
      category: 'Competitive Advantages',
      items: Array.isArray(analysis.competitivePositioning.uniqueAdvantages)
        ? analysis.competitivePositioning.uniqueAdvantages
        : [analysis.competitivePositioning.uniqueAdvantages]
    });
  }

  if (analysis.competitivePositioning?.differentiators) {
    strengths.push({
      category: 'Key Differentiators',
      items: Array.isArray(analysis.competitivePositioning.differentiators)
        ? analysis.competitivePositioning.differentiators
        : [analysis.competitivePositioning.differentiators]
    });
  }

  // Extract from voice and style
  if (analysis.voiceAndStyle?.uniqueElements) {
    strengths.push({
      category: 'Voice & Style',
      items: Array.isArray(analysis.voiceAndStyle.uniqueElements)
        ? analysis.voiceAndStyle.uniqueElements
        : [analysis.voiceAndStyle.uniqueElements]
    });
  }

  // If no strengths found, generate default ones
  if (strengths.length === 0) {
    strengths.push({
      category: 'Channel Strengths',
      items: [
        'Established audience base',
        'Consistent content output',
        'Growing channel presence'
      ]
    });
  }

  return strengths;
}

function extractTopKeywords(videoTitles, videos) {
  // Common stop words to filter out
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

  // Extract words from titles
  const words = videoTitles
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Convert to array and sort by frequency
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => [word, count]);

  return sortedWords;
}

function formatAudienceDescription(audienceProfile) {
  if (!audienceProfile) return 'Audience analysis pending';

  const demographics = audienceProfile.demographics || {};
  const interests = audienceProfile.interests || [];
  const psychographics = audienceProfile.psychographics || {};

  let description = '';

  if (demographics.ageRange) {
    description += `${demographics.ageRange} viewers`;
  }

  if (interests.length > 0) {
    description += ` interested in ${interests.slice(0, 3).join(', ')}`;
  }

  if (psychographics.goals) {
    description += `. ${psychographics.goals}`;
  }

  return description || audienceProfile.persona || 'Engaged YouTube audience';
}
