import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { selectedChannels, config, analysisData } = await request.json();

    // Validate input
    if (!config.name || selectedChannels.length < 2) {
      return NextResponse.json(
        { error: 'Invalid remix configuration' },
        { status: 400 }
      );
    }

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

    // Begin transaction-like operations
    let createdChannel = null;
    let createdRemix = null;
    let tempSourceChannelIds = []; // Track temporary source channels to clean up

    try {
      // Ensure we have a proper voice profile
      let voiceProfileForStorage = {};
      if (analysisData?.voiceProfile) {
        // Check if it's already properly structured
        if (analysisData.voiceProfile.tone || analysisData.voiceProfile.style) {
          voiceProfileForStorage = analysisData.voiceProfile;
        } else if (analysisData.voiceProfile.voice) {
          // Sometimes nested under 'voice' key
          voiceProfileForStorage = analysisData.voiceProfile.voice;
        } else {
          voiceProfileForStorage = analysisData.voiceProfile;
        }
      } else {
        // Create a default voice profile if none provided
        voiceProfileForStorage = {
          tone: ['professional', 'engaging', 'authentic'],
          style: ['informative', 'conversational'],
          energy: 'medium',
          pace: 'moderate',
          description: `Combined voice characteristics from ${selectedChannels.map(c => c.title).join(', ')}`
        };
      }

      // Create the main channel entry
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert({
          user_id: user.id,
          title: config.name,
          name: config.name,
          description: config.description || `A remixed channel combining strategies from ${selectedChannels.map(c => c.title).join(', ')}`,
          is_custom: true,
          is_remix: true,
          youtube_channel_id: `remix_${uuidv4()}`, // Unique identifier for remix channels
          subscriber_count: 0,
          view_count: 0,
          video_count: 0,
          analytics_data: analysisData || {},
          voice_profile: voiceProfileForStorage,
          voice_training_status: 'completed', // Set as completed since it's a remix with combined voice profile
          auto_train_enabled: false, // Disable auto training for remix channels
          // Add audience description from analysis data
          audience_description: analysisData?.audience?.description || 
            analysisData?.audience?.summary || 
            `Combined audience from ${selectedChannels.map(c => c.title).join(', ')} focusing on ${analysisData?.audience?.interests?.join(', ') || 'diverse content'}`
        })
        .select()
        .single();

      if (channelError) {
        throw channelError;
      }

      createdChannel = channel;

      // Create remix configuration entry
      // Map selected channels to get database IDs
      const sourceChannelMapping = [];
      
      for (const sourceChannel of selectedChannels) {
        // First check if it's already a database UUID
        const channelId = sourceChannel.id;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId);
        
        let dbId = null;
        
        if (isUUID) {
          dbId = channelId;
        } else {
          // If not UUID, it might be a YouTube channel ID, need to look it up or create it
          const ytChannelId = sourceChannel.channelId || sourceChannel.youtube_channel_id || channelId;
          
          if (ytChannelId) {
            // First try looking up by YouTube channel ID
            if (ytChannelId.startsWith('UC')) {
              const { data: dbChannel } = await supabase
                .from('channels')
                .select('id')
                .eq('youtube_channel_id', ytChannelId)
                .single();
              
              if (dbChannel) {
                dbId = dbChannel.id;
              } else {
                // Channel doesn't exist in database, create it
                const { data: newChannel, error: createError } = await supabase
                  .from('channels')
                  .insert({
                    user_id: user.id,
                    youtube_channel_id: ytChannelId,
                    name: sourceChannel.title || sourceChannel.name || 'Unknown Channel',
                    title: sourceChannel.title || sourceChannel.name || 'Unknown Channel',
                    description: sourceChannel.description || '',
                    subscriber_count: parseInt(sourceChannel.subscriberCount) || parseInt(sourceChannel.subscriber_count) || 0,
                    view_count: parseInt(sourceChannel.viewCount) || parseInt(sourceChannel.view_count) || 0,
                    video_count: parseInt(sourceChannel.videoCount) || parseInt(sourceChannel.video_count) || 0,
                    thumbnail_url: sourceChannel.thumbnails?.high?.url || sourceChannel.thumbnails?.medium?.url || '',
                    custom_url: sourceChannel.customUrl || sourceChannel.custom_url || '',
                    is_custom: false,
                    is_remix: false,
                    voice_training_status: 'skipped', // Use 'skipped' for external channels that don't need voice training
                    auto_train_enabled: false // Disable auto training for external channels
                  })
                  .select('id')
                  .single();
                
                if (newChannel && !createError) {
                  dbId = newChannel.id;
                  tempSourceChannelIds.push(dbId); // Track for cleanup
                }
              }
            }
            
            // If still not found, try looking up by title/name
            if (!dbId && (sourceChannel.title || sourceChannel.name)) {
              const { data: dbChannel } = await supabase
                .from('channels')
                .select('id')
                .or(`title.eq."${sourceChannel.title || sourceChannel.name}",name.eq."${sourceChannel.title || sourceChannel.name}"`)
                .single();
              
              if (dbChannel) {
                dbId = dbChannel.id;
              }
            }
          }
        }
        
        if (dbId) {
          sourceChannelMapping.push({
            sourceChannel: sourceChannel,
            dbId: dbId,
            channelKey: sourceChannel.id || sourceChannel.channelId || sourceChannel.youtube_channel_id
          });
        }
      }
      
      // Extract just the IDs for the source_channel_ids field
      const sourceChannelIds = sourceChannelMapping.map(m => m.dbId);

      const { data: remix, error: remixError } = await supabase
        .from('remix_channels')
        .insert({
          user_id: user.id,
          channel_id: channel.id,
          name: config.name,
          description: config.description,
          source_channel_ids: sourceChannelIds,
          remix_config: {
            weights: config.weights,
            elements: config.elements
          },
          combined_analytics: analysisData || {},
          combined_voice_profile: voiceProfileForStorage, // Use the same voice profile we prepared
          status: 'active'
        })
        .select()
        .single();

      if (remixError) {
        throw remixError;
      }

      createdRemix = remix;

      // Update channel with remix_id
      await supabase
        .from('channels')
        .update({ 
          remix_id: remix.id,
          remix_source_ids: sourceChannelIds
        })
        .eq('id', channel.id);

      // Create remix source channel entries
      const sourceEntries = sourceChannelMapping.map(mapping => {
        return {
          remix_channel_id: remix.id,
          source_channel_id: mapping.dbId,
          weight: config.weights[mapping.channelKey] || (1 / selectedChannels.length),
          elements_used: config.elements
        };
      });

      const { error: sourcesError } = await supabase
        .from('remix_source_channels')
        .insert(sourceEntries);

      if (sourcesError) {
        // Non-critical error, continue
      }

      // Create initial analysis entry if we have analysis data
      if (analysisData) {
        const { error: analysisError } = await supabase
          .from('channel_remix_analyses')
          .insert({
            remix_channel_id: remix.id,
            analysis_type: 'audience',
            analysis_data: {
              audience: analysisData.audience,
              insights: analysisData.insights,
              recommendations: analysisData.recommendations
            }
          });

        if (analysisError) {
          // Non-critical error, continue
        }
      }

      // Create voice profile entry for the remix channel
      if (analysisData?.voiceProfile || config.elements?.voice_style) {
        const voiceProfileData = analysisData?.voiceProfile || {};
        
        const { error: voiceError } = await supabase
          .from('voice_profiles')
          .insert({
            channel_id: channel.id,
            profile_name: `${config.name} Voice`,
            training_data: {
              source_channels: selectedChannels.map(c => c.title || c.name),
              combined_from_remix: true,
              remix_config: config,
              ...voiceProfileData
            },
            parameters: {
              tone: voiceProfileData.tone || ['engaging', 'authentic'],
              style: voiceProfileData.style || ['conversational'],
              personality: voiceProfileData.personality || [],
              energy: voiceProfileData.energy || 'medium',
              pace: voiceProfileData.pace || 'moderate',
              status: 'completed' // Mark as completed since it's analyzed
            },
            is_active: true
          });

        if (voiceError) {
          // Non-critical error, continue - the voice profile is still in channels table
        }
      }

      // Generate initial content ideas for the remixed channel
      if (analysisData?.contentStrategy) {
        await generateInitialContentIdeas(channel.id, analysisData, supabase);
      }

      // Cleanup: Delete temporary source channels that were created
      if (tempSourceChannelIds.length > 0) {
        await supabase
          .from('channels')
          .delete()
          .in('id', tempSourceChannelIds);
      }

      return NextResponse.json({
        success: true,
        channel: channel,
        remix: remix,
        message: 'Remixed channel created successfully!'
      });

    } catch (error) {
      // Cleanup if needed
      if (createdChannel) {
        await supabase
          .from('channels')
          .delete()
          .eq('id', createdChannel.id);
      }

      // Also cleanup any temporary source channels created
      if (tempSourceChannelIds.length > 0) {
        await supabase
          .from('channels')
          .delete()
          .in('id', tempSourceChannelIds);
      }

      throw error;
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create remix channel', details: error.message },
      { status: 500 }
    );
  }
}

async function generateInitialContentIdeas(channelId, analysisData, supabase) {
  try {
    const contentIdeas = [
      {
        title: 'Introduction: My Unique Approach',
        description: 'Introduce your channel and explain your unique remix approach',
        tags: ['introduction', 'channel trailer'],
        priority: 'high'
      },
      {
        title: 'Combining the Best: My Content Strategy',
        description: 'Share how you\'re combining strategies from successful channels',
        tags: ['strategy', 'behind the scenes'],
        priority: 'high'
      },
      {
        title: 'First Tutorial/Guide',
        description: `Create content that appeals to ${analysisData.audience?.interests?.[0] || 'your target audience'}`,
        tags: ['tutorial', 'educational'],
        priority: 'medium'
      }
    ];

    // Store content ideas in the channel's analytics_data
    await supabase
      .from('channels')
      .update({
        analytics_data: {
          ...analysisData,
          content_ideas: contentIdeas,
          generated_at: new Date().toISOString()
        }
      })
      .eq('id', channelId);

  } catch {
    // Non-critical error, don't fail the main operation
  }
}