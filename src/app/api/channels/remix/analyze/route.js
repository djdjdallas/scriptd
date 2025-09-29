import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  analyzeRemixWithClaude,
  generateRemixVoiceProfile,
  generateRemixContentIdeas,
  generateAudienceInsights 
} from '@/lib/ai/remix-analyzer';

export async function POST(request) {
  try {
    const { channelIds, channels: providedChannels, config } = await request.json();

    console.log('Received channelIds:', channelIds);
    console.log('Number of channelIds:', channelIds?.length);
    console.log('Received channel data:', providedChannels?.length, 'channels');

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (!userData?.subscription_tier || userData.subscription_tier === 'free') {
      return NextResponse.json({ 
        error: 'Premium feature required' 
      }, { status: 403 });
    }

    // Validate that we have channels
    if (!providedChannels || !Array.isArray(providedChannels) || providedChannels.length < 2) {
      console.log('Invalid provided channels:', providedChannels?.length || 0);
      return NextResponse.json({ 
        error: 'At least 2 channels required for remixing',
        details: `Received ${providedChannels?.length || 0} channels`
      }, { status: 400 });
    }

    // Process the provided channel data directly
    const channels = [];
    
    for (const providedChannel of providedChannels) {
      if (!providedChannel) {
        console.log('Skipping empty channel');
        continue;
      }

      // Try to extract any form of ID
      const channelId = providedChannel.id || 
                       providedChannel.channelId || 
                       providedChannel.youtube_channel_id ||
                       providedChannel.youtubeChannelId ||
                       providedChannel.channel_id;

      console.log('Processing channel:', {
        title: providedChannel.title,
        hasId: !!providedChannel.id,
        hasChannelId: !!providedChannel.channelId,
        extractedId: channelId
      });

      // If we have an ID, try to fetch from database
      let dbChannel = null;
      if (channelId) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId);
        
        let query;
        if (isUUID) {
          query = supabase
            .from('channels')
            .select('*')
            .eq('id', channelId);
        } else if (channelId.startsWith('UC')) {
          // YouTube channel ID
          query = supabase
            .from('channels')
            .select('*')
            .eq('youtube_channel_id', channelId);
        }

        if (query) {
          const { data: channel, error: channelError } = await query.single();
          if (channel && !channelError) {
            // Also fetch any existing analysis
            const { data: analysis } = await supabase
              .from('channel_analyses')
              .select('*')
              .eq('channel_id', channel.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (analysis) {
              channel.analysis = analysis;
            }
            dbChannel = channel;
          }
        }
      }

      // Use database channel if found, otherwise use provided data
      if (dbChannel) {
        channels.push(dbChannel);
      } else {
        // Convert provided channel to database-like format
        // Note: keeping both youtube_channel_id and channelId for compatibility
        let ytChannelId = providedChannel.channelId || 
                         providedChannel.youtubeChannelId || 
                         providedChannel.youtube_channel_id ||
                         channelId;
        
        // CRITICAL: Reject channels without YouTube IDs to prevent wrong channel selection
        if (!ytChannelId) {
          const channelTitle = providedChannel.title || providedChannel.name || 'Unknown';
          console.error(`❌ Channel "${channelTitle}" is missing YouTube channel ID`);
          console.error('Channel data:', providedChannel);
          
          // Do NOT attempt to lookup by name - this causes wrong channels to be selected
          return NextResponse.json({ 
            error: 'Invalid channel data',
            message: `Channel "${channelTitle}" is missing a YouTube channel ID. Please re-select the channel using the URL input option.`,
            details: 'All channels must have valid YouTube IDs for remix analysis'
          }, { status: 400 });
        }
        
        channels.push({
          id: channelId || `temp_${Date.now()}_${Math.random()}`,
          youtube_channel_id: ytChannelId,
          channelId: ytChannelId, // Include both for compatibility
          title: providedChannel.title || providedChannel.name || 'Unknown Channel',
          description: providedChannel.description || 'YouTube channel',
          subscriber_count: providedChannel.subscriberCount || providedChannel.subscriber_count || 100000,
          view_count: providedChannel.viewCount || providedChannel.view_count || 1000000,
          video_count: providedChannel.videoCount || providedChannel.video_count || 100,
          thumbnails: providedChannel.thumbnails,
          custom_url: providedChannel.customUrl || providedChannel.custom_url,
          created_at: new Date().toISOString()
        });
      }
    }

    console.log(`Found ${channels.length} channels in database`);

    if (channels.length < 2) {
      return NextResponse.json({ 
        error: 'At least 2 valid channels required for remixing',
        details: `Found only ${channels.length} valid channels out of ${channelIds.length} provided`
      }, { status: 400 });
    }

    // Log the channels being passed to voice analysis
    console.log(`Analyzing ${channels.length} channels:`, 
      channels.map(ch => `${ch.title || ch.name} (${ch.youtube_channel_id || ch.channelId || 'no ID'})`).join(', '));
    
    // Use Claude to analyze the remix combination
    console.log('Analyzing remix with Claude (Sonnet Model)...');
    const claudeAnalysis = await analyzeRemixWithClaude(channels, config);
    
    let analysis;
    if (claudeAnalysis.success) {
      analysis = claudeAnalysis.analysis;
    } else {
      console.log('Claude analysis failed, using fallback');
      analysis = claudeAnalysis.fallback;
    }

    // Generate AI-powered voice profile if enabled
    let voiceProfile = null;
    let voiceAnalysisMetadata = null;
    if (config.elements.voice_style) {
      console.log('🎤 Starting enhanced voice profile generation...');
      console.log('This will analyze actual YouTube videos from source channels.');
      console.log('Process may take 30-60 seconds for thorough analysis...\n');
      
      const voiceResult = await generateRemixVoiceProfile(channels, config);
      
      if (voiceResult.success) {
        voiceProfile = voiceResult.voiceProfile;
        voiceAnalysisMetadata = {
          basedOnRealData: voiceResult.basedOnRealData,
          channelsAnalyzed: voiceResult.channelAnalyses?.length || 0,
          totalVideosAnalyzed: voiceResult.voiceProfile?.metadata?.totalVideosAnalyzed || 0
        };
        
        console.log(`✅ Voice profile created successfully!`);
        console.log(`   - Based on real data: ${voiceResult.basedOnRealData}`);
        console.log(`   - Videos analyzed: ${voiceAnalysisMetadata.totalVideosAnalyzed}`);
      } else {
        console.log('⚠️ Using fallback voice profile');
        voiceProfile = {
          tone: ['engaging', 'authentic', 'dynamic'],
          style: ['conversational', 'informative'],
          description: 'A balanced voice combining elements from all source channels',
          metadata: { fallback: true }
        };
      }
    }

    // Generate audience insights with Claude
    console.log('Generating audience insights with Claude...');
    const audienceResult = await generateAudienceInsights(channels, config);
    const audienceInsights = audienceResult.success ? audienceResult.insights : null;

    // Generate content ideas with Claude
    console.log('Generating content ideas with Claude...');
    const contentResult = await generateRemixContentIdeas(channels, config, analysis);
    const contentIdeas = contentResult.success ? contentResult.ideas : [];

    // Compile comprehensive response
    const response = {
      // Core analysis from Claude
      synergy: analysis.synergy || analysis.synergyAnalysis,
      audience: audienceInsights || analysis.audience || {
        description: 'Combined audience from all source channels',
        demographics: analysis.combinedAudienceProfile?.demographics,
        psychographics: analysis.combinedAudienceProfile?.psychographics,
        interests: analysis.combinedAudienceProfile?.interests
      },
      positioning: analysis.positioning || analysis.uniquePositioning,
      
      // Voice and style
      voiceProfile: voiceProfile || analysis.voiceProfile || analysis.voiceStyleGuide,
      
      // Content strategy
      contentStrategy: analysis.contentStrategy || 'Blend content from all source channels',
      contentIdeas: contentIdeas.length > 0 ? contentIdeas : analysis.contentIdeas,
      
      // Growth insights
      growthPotential: analysis.growthPotential || analysis.growthTactics?.join(', ') || 
        `High potential - Combining ${channels.length} successful channel strategies`,
      growthTactics: analysis.growthTactics || [],
      
      // Additional insights
      insights: analysis.insights || [
        `Combined reach: ${channels.reduce((sum, c) => sum + (c.subscriber_count || 0), 0).toLocaleString()} subscribers`,
        `Unique positioning at intersection of ${channels.map(c => c.title || c.name).join(', ')}`,
        'AI-optimized strategy for maximum growth potential'
      ],
      recommendations: analysis.recommendations || analysis.actionPlan || [
        'Start with content that appeals to overlapping audiences',
        'Gradually introduce your unique perspective',
        'Monitor performance and adjust strategy based on data'
      ],
      
      // Challenges and solutions
      challenges: analysis.challenges || analysis.potentialChallenges || [],
      actionPlan: analysis.actionPlan || analysis.first30DaysActionPlan || [],
      
      // Metadata
      analysisMethod: claudeAnalysis.success ? 'claude-ai' : 'fallback',
      model: claudeAnalysis.model || 'unknown',
      voiceAnalysisMetadata: voiceAnalysisMetadata || null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Remix analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze remix', details: error.message },
      { status: 500 }
    );
  }
}