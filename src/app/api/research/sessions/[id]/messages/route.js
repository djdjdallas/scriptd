// Research Session Messages API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { getAIService } from '@/lib/ai';
import { CREDIT_COSTS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction } from '@/lib/credit-bypass';
import { apiLogger } from '@/lib/monitoring/logger';

// POST /api/research/sessions/[id]/messages - Send message to research chat
export const POST = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Await params as required in Next.js 15
  const params = await context.params;
  const sessionId = params.id;

  const { message, context: messageContext = [] } = await req.json();

  if (!message?.trim()) {
    throw new ApiError('Message is required', 400);
  }

  // Verify session exists and belongs to user
  const { data: researchSession, error: sessionError } = await supabase
    .from('research_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !researchSession) {
    throw new ApiError('Research session not found', 404);
  }

  // Check credits
  const { data: userData } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  const creditCost = CREDIT_COSTS.RESEARCH_CHAT || 1;
  
  if (!userData) {
    throw new ApiError('Failed to fetch user data', 500);
  }
  
  // Check user credits with bypass option
  const creditValidation = await validateCreditsWithBypass(user.id, 'RESEARCH_CHAT', creditCost);
  if (!creditValidation.valid && !creditValidation.bypassed) {
    throw new ApiError(creditValidation.error || 'Insufficient credits', 402);
  }

  try {
    // Check if message mentions a YouTube channel
    const channelMentions = message.match(/@([\w-]+)/g);
    let channelData = null;
    let channelHandle = null;
    
    if (channelMentions && channelMentions.length > 0) {
      channelHandle = channelMentions[0].replace('@', '');
      
      try {
        // Fetch actual YouTube channel data
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&` +
          `q=${encodeURIComponent(channelHandle)}&` +
          `type=channel&` +
          `maxResults=5&` +
          `key=${process.env.YOUTUBE_API_KEY}`
        );
        
        if (channelResponse.ok) {
          const searchData = await channelResponse.json();
          const channelMatch = searchData.items?.find(item => {
            const title = item.snippet.channelTitle?.toLowerCase() || '';
            const searchTerm = channelHandle.toLowerCase();
            return title === searchTerm || title.includes(searchTerm);
          }) || searchData.items?.[0];
          
          if (channelMatch) {
            // Get full channel details
            const detailsResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?` +
              `part=snippet,statistics,contentDetails&` +
              `id=${channelMatch.snippet.channelId}&` +
              `key=${process.env.YOUTUBE_API_KEY}`
            );
            
            if (detailsResponse.ok) {
              const channelFullData = await detailsResponse.json();
              const channel = channelFullData.items?.[0];
              
              if (channel) {
                // Get recent videos
                let recentVideos = [];
                const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
                
                if (uploadsPlaylistId) {
                  const videosResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?` +
                    `part=snippet,contentDetails&` +
                    `playlistId=${uploadsPlaylistId}&` +
                    `maxResults=20&` +
                    `key=${process.env.YOUTUBE_API_KEY}`
                  );
                  
                  if (videosResponse.ok) {
                    const videosData = await videosResponse.json();
                    const videoIds = videosData.items?.map(item => item.contentDetails.videoId).join(',');
                    
                    if (videoIds) {
                      const videoDetailsResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?` +
                        `part=snippet,statistics,contentDetails&` +
                        `id=${videoIds}&` +
                        `key=${process.env.YOUTUBE_API_KEY}`
                      );
                      
                      if (videoDetailsResponse.ok) {
                        const videoDetails = await videoDetailsResponse.json();
                        recentVideos = videoDetails.items?.map(video => ({
                          title: video.snippet.title,
                          views: parseInt(video.statistics.viewCount || 0),
                          likes: parseInt(video.statistics.likeCount || 0),
                          comments: parseInt(video.statistics.commentCount || 0),
                          publishedAt: video.snippet.publishedAt,
                          duration: video.contentDetails.duration,
                          tags: video.snippet.tags || []
                        })) || [];
                      }
                    }
                  }
                }
                
                channelData = {
                  title: channel.snippet.title,
                  description: channel.snippet.description,
                  subscriberCount: parseInt(channel.statistics?.subscriberCount || 0),
                  viewCount: parseInt(channel.statistics?.viewCount || 0),
                  videoCount: parseInt(channel.statistics?.videoCount || 0),
                  publishedAt: channel.snippet.publishedAt,
                  recentVideos
                };
              }
            }
          }
        }
      } catch (error) {
        apiLogger.error('Error fetching YouTube channel data', error, { channelHandle });
        // Continue without channel data
      }
    }

    // Get previous messages for context
    const { data: previousMessages } = await supabase
      .from('research_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Build AI prompt with context including real YouTube data if available
    const systemPrompt = `You are an expert YouTube growth strategist and data analyst. Provide deep, actionable insights based on real channel data.

When analyzing channels with real data provided:
- Calculate precise metrics (views per video, engagement rates, growth velocity)
- Identify viral outliers and analyze why they succeeded
- Detect content patterns that drive the most engagement
- Analyze upload timing and frequency optimization
- Evaluate thumbnail/title CTR indicators
- Assess channel momentum and growth trajectory
- Provide specific, actionable recommendations
- Compare performance to niche benchmarks
- Identify untapped content opportunities
- Analyze audience retention patterns from view counts

Focus on data-driven insights, not generic observations. Be specific with numbers and percentages.
Structure your analysis with clear sections and use bullet points for readability.
Highlight both what's working and critical gaps.`;

    let contextPrompt = messageContext.length > 0 
      ? `\n\nAvailable sources:\n${messageContext.map((s, i) => 
          `[${i + 1}] ${s.title}\n${s.content?.substring(0, 500)}...`
        ).join('\n\n')}`
      : '';
    
    // Add real YouTube channel data to context if available
    if (channelData) {
      // Calculate key metrics
      const avgViews = channelData.recentVideos.reduce((sum, v) => sum + v.views, 0) / channelData.recentVideos.length;
      const totalRecentViews = channelData.recentVideos.reduce((sum, v) => sum + v.views, 0);
      const avgLikes = channelData.recentVideos.reduce((sum, v) => sum + v.likes, 0) / channelData.recentVideos.length;
      const avgComments = channelData.recentVideos.reduce((sum, v) => sum + v.comments, 0) / channelData.recentVideos.length;
      const viewsPerSub = avgViews / channelData.subscriberCount;
      const engagementRate = ((avgLikes + avgComments) / avgViews * 100).toFixed(2);
      
      // Find viral outliers (videos with 2x+ average views)
      const viralVideos = channelData.recentVideos.filter(v => v.views > avgViews * 2);
      
      // Calculate upload frequency (days between videos)
      const videosDates = channelData.recentVideos.map(v => new Date(v.publishedAt)).sort((a, b) => b - a);
      const daysBetweenUploads = videosDates.length > 1 
        ? (videosDates[0] - videosDates[videosDates.length - 1]) / (1000 * 60 * 60 * 24) / (videosDates.length - 1)
        : 0;
      
      contextPrompt += `\n\n[YOUTUBE CHANNEL DATA]
Channel: ${channelData.title}
Subscribers: ${channelData.subscriberCount.toLocaleString()}
Total Channel Views: ${channelData.viewCount.toLocaleString()}
Total Videos: ${channelData.videoCount}
Channel Age: ${Math.floor((Date.now() - new Date(channelData.publishedAt)) / (1000 * 60 * 60 * 24 * 365.25))} years
Description: ${channelData.description}

KEY METRICS (Last 20 Videos):
• Average Views: ${Math.round(avgViews).toLocaleString()} (${(viewsPerSub * 100).toFixed(1)}% of subscriber base)
• Average Engagement Rate: ${engagementRate}%
• Average Likes: ${Math.round(avgLikes).toLocaleString()}
• Average Comments: ${Math.round(avgComments).toLocaleString()}
• Upload Frequency: Every ${daysBetweenUploads.toFixed(1)} days
• Views per Video/Subscriber Ratio: ${(viewsPerSub * 100).toFixed(1)}%

RECENT VIDEOS PERFORMANCE:
${channelData.recentVideos.slice(0, 10).map((v, i) => {
  const daysAgo = Math.floor((Date.now() - new Date(v.publishedAt)) / (1000 * 60 * 60 * 24));
  const viewsPerDay = v.views / (daysAgo || 1);
  const likeRate = ((v.likes / v.views) * 100).toFixed(2);
  const isViral = v.views > avgViews * 2;
  return `${i + 1}. "${v.title}"
   • Views: ${v.views.toLocaleString()} ${isViral ? '🔥 VIRAL' : ''} (${viewsPerDay.toFixed(0)}/day)
   • Engagement: ${likeRate}% like rate, ${v.comments.toLocaleString()} comments
   • Posted: ${daysAgo} days ago`;
}).join('\n')}

${viralVideos.length > 0 ? `VIRAL OUTLIERS (${viralVideos.length} videos):
${viralVideos.slice(0, 3).map(v => `• "${v.title}" - ${v.views.toLocaleString()} views (${(v.views / avgViews).toFixed(1)}x average)`).join('\n')}` : ''}

Provide a comprehensive channel analysis focusing on:
1. Performance metrics and what they indicate
2. Content patterns that drive engagement
3. Viral video characteristics
4. Growth trajectory assessment
5. Specific optimization opportunities
6. Competitive positioning in their niche`;
    }

    // Build message history for AI
    const messageHistory = previousMessages?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || [];

    const userPrompt = `${message}${contextPrompt}`;

    // Generate AI response
    const ai = getAIService();
    const response = await ai.generateChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messageHistory,
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 1500
    });

    // Save user message to database
    const { data: savedMessage } = await supabase
      .from('research_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        metadata: { context: messageContext.map(c => ({ url: c.url, title: c.title })) }
      })
      .select()
      .single();

    // Save AI response
    const { data: aiMessage } = await supabase
      .from('research_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: response.text,
        metadata: { 
          usage: response.usage,
          model: response.model
        }
      })
      .select()
      .single();

    // Update session metadata and title if needed
    const updateData = {
      updated_at: new Date().toISOString(),
      metadata: {
        ...researchSession.metadata,
        lastActivity: new Date().toISOString(),
        messageCount: (researchSession.metadata?.messageCount || 0) + 2
      }
    };

    // Update title if it's still the default
    if (researchSession.title === 'YouTube Research Session' || researchSession.title === 'New Research Session') {
      updateData.title = message.substring(0, 100);
    }

    await supabase
      .from('research_sessions')
      .update(updateData)
      .eq('id', sessionId);

    // Deduct credits (with bypass check)
    const creditDeduction = await conditionalCreditDeduction(
      user.id,
      'RESEARCH_CHAT',
      { amount: creditCost }
    );

    if (!creditDeduction.success && !creditDeduction.bypassed) {
      apiLogger.error('Failed to deduct credits', null, { error: creditDeduction.error, sessionId });
      // Don't throw error, message was already processed
    }

    // Record transaction (only if credits weren't bypassed)
    if (!creditDeduction.bypassed) {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -creditCost,
          type: 'research_chat',
          description: 'Research chat message',
          metadata: {
            sessionId: sessionId,
            messageId: aiMessage.id
          }
        });
    }

    // Check if AI suggested any sources or mentioned specific channels/videos
    const urlRegex = /https?:\/\/[^\s]+/g;
    const channelRegex = /@[\w-]+/g;
    const suggestedUrls = response.text.match(urlRegex) || [];
    const mentionedChannels = response.text.match(channelRegex) || [];

    return NextResponse.json({
      messageId: aiMessage.id,
      response: response.text,
      usage: response.usage,
      creditsUsed: creditDeduction.bypassed ? 0 : creditCost,
      creditsBypassed: creditDeduction.bypassed,
      suggestedUrls,
      mentionedChannels,
      sources: []
    });

  } catch (error) {
    apiLogger.error('Research chat error', error, { sessionId });
    throw new ApiError('Failed to process research chat', 500);
  }
});

// GET /api/research/sessions/[id]/messages - Get all messages for a session
export const GET = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Await params as required in Next.js 15
  const params = await context.params;
  const sessionId = params.id;

  // Verify session exists and belongs to user
  const { data: researchSession, error: sessionError } = await supabase
    .from('research_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !researchSession) {
    throw new ApiError('Research session not found', 404);
  }

  // Get messages
  const { data: messages, error } = await supabase
    .from('research_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    apiLogger.error('Database error fetching messages', error, { sessionId });
    throw new ApiError('Failed to fetch messages', 500);
  }

  return NextResponse.json({
    messages: messages?.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      sources: msg.metadata?.context || []
    })) || []
  });
});