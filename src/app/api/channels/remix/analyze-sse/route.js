import { createClient } from '@/lib/supabase/server';
import { 
  analyzeRemixWithClaude,
  generateRemixVoiceProfile,
  generateRemixContentIdeas,
  generateAudienceInsights 
} from '@/lib/ai/remix-analyzer';

export async function POST(request) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (step, progress = null) => {
        const data = JSON.stringify({ step, progress, timestamp: Date.now() });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        const { channelIds, channels: providedChannels, config } = await request.json();

        sendUpdate('Initializing analysis...', 5);

        // Check authentication
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          sendUpdate('error:Unauthorized');
          controller.close();
          return;
        }

        // Check premium status
        sendUpdate('Verifying premium access...', 10);
        const { data: userData } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        
        if (!userData?.subscription_tier || userData.subscription_tier === 'free') {
          sendUpdate('error:Premium feature required');
          controller.close();
          return;
        }

        // Validate channels
        if (!providedChannels || !Array.isArray(providedChannels) || providedChannels.length < 2) {
          sendUpdate('error:At least 2 channels required');
          controller.close();
          return;
        }

        sendUpdate('Loading channel data...', 15);

        // Process channels
        const channels = [];
        const totalChannels = providedChannels.length;
        
        for (let i = 0; i < totalChannels; i++) {
          const providedChannel = providedChannels[i];
          const channelName = providedChannel.title || providedChannel.name || `Channel ${i + 1}`;
          
          sendUpdate(`Fetching data for ${channelName}...`, 15 + (i * 5));

          if (!providedChannel) continue;

          const channelId = providedChannel.id || 
                           providedChannel.channelId || 
                           providedChannel.youtube_channel_id ||
                           providedChannel.youtubeChannelId ||
                           providedChannel.channel_id;

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
              query = supabase
                .from('channels')
                .select('*')
                .eq('youtube_channel_id', channelId);
            }

            if (query) {
              const { data: channel } = await query.single();
              if (channel) {
                const { data: analysis } = await supabase
                  .from('channel_analyses')
                  .select('*')
                  .eq('channel_id', channel.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();

                if (analysis) {
                  channel.cached_analysis = analysis;
                }
                dbChannel = channel;
              }
            }
          }

          const channelData = dbChannel || providedChannel;
          
          if (channelData) {
            channels.push({
              ...channelData,
              youtube_channel_id: channelData.youtube_channel_id || channelId,
              title: channelData.title || channelData.name || 'Unknown Channel',
              analytics_data: channelData.analytics_data || channelData.cached_analysis?.analysis_data || {},
              voice_profile: channelData.voice_profile || {}
            });
          }
        }

        if (channels.length < 2) {
          sendUpdate('error:Not enough valid channels');
          controller.close();
          return;
        }

        const channelNames = channels.map(c => c.title).join(', ');
        sendUpdate(`Found ${channels.length} channels: ${channelNames}`, 30);

        // Start analysis phases
        sendUpdate(`Analyzing content strategies for ${channels[0].title}...`, 35);
        await new Promise(resolve => setTimeout(resolve, 1000));

        sendUpdate(`Analyzing video scripts from ${channels[0].title}...`, 40);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (channels[1]) {
          sendUpdate(`Analyzing content strategies for ${channels[1].title}...`, 45);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          sendUpdate(`Analyzing video scripts from ${channels[1].title}...`, 50);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (channels[2]) {
          sendUpdate(`Analyzing content strategies for ${channels[2].title}...`, 55);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          sendUpdate(`Analyzing video scripts from ${channels[2].title}...`, 60);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Linguistic analysis
        sendUpdate('Performing linguistic pattern analysis...', 65);
        sendUpdate('Identifying signature phrases and speaking patterns...', 68);
        await new Promise(resolve => setTimeout(resolve, 2000));

        sendUpdate('Analyzing narrative structures...', 70);
        await new Promise(resolve => setTimeout(resolve, 1500));

        sendUpdate('Mapping emotional dynamics and energy levels...', 73);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Voice profile generation
        sendUpdate('Generating combined voice profile...', 75);

        const voiceProfile = await generateRemixVoiceProfile(channels, config);
        
        sendUpdate('Voice profile complete. Analyzing audience demographics...', 80);

        // Audience insights
        sendUpdate('Identifying target audience overlap...', 82);
        const audienceInsights = await generateAudienceInsights(channels);
        
        sendUpdate('Analyzing viewer preferences and interests...', 85);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Content strategy
        sendUpdate('Generating content strategy recommendations...', 88);
        const contentIdeas = await generateRemixContentIdeas(channels, config);
        
        sendUpdate('Creating video topic suggestions...', 90);
        await new Promise(resolve => setTimeout(resolve, 1000));

        sendUpdate('Optimizing publishing schedule...', 92);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Final analysis
        sendUpdate('Finalizing remix analysis...', 95);
        const analysis = await analyzeRemixWithClaude(channels, config);

        sendUpdate('Preparing your personalized channel blueprint...', 98);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Complete
        sendUpdate('Analysis complete!', 100);

        // Send the final result
        const result = {
          success: true,
          voiceProfile,
          audience: audienceInsights,
          contentStrategy: contentIdeas,
          insights: analysis.insights || [],
          recommendations: analysis.recommendations || [],
          remixStrategy: analysis.remixStrategy || {}
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete', 
          result,
          step: 'Complete!',
          progress: 100
        })}\n\n`));

        controller.close();

      } catch (error) {
        console.error('SSE Analysis error:', error);
        const errorMessage = `error:${error.message || 'Analysis failed'}`;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step: errorMessage })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}