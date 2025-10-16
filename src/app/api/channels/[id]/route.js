import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelById, parseChannelData } from '@/lib/youtube/channel';

export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get channel from database with latest analysis data
    const { data: channel, error } = await supabase
      .from('channels')
      .select(`
        *,
        channel_analyses (
          analytics_data,
          audience_persona,
          insights,
          content_ideas,
          analysis_date,
          videos_analyzed
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Get the most recent analysis - sort client-side since foreign table ordering is unreliable
    const latestAnalysis = channel.channel_analyses
      ?.sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date))[0] || {};

    // Merge the analysis data into the channel object for easier frontend access
    if (latestAnalysis && Object.keys(latestAnalysis).length > 0) {
      channel.analytics_data = latestAnalysis.analytics_data || channel.analytics_data || {};
      channel.audience_analysis = latestAnalysis.audience_persona || {};
      channel.insights = latestAnalysis.insights || {};
      channel.content_ideas = latestAnalysis.content_ideas || [];
      channel.last_analyzed_at = latestAnalysis.analysis_date;
      channel.videos_analyzed = latestAnalysis.videos_analyzed || 0;
    }

    // Remove the nested channel_analyses array since we merged it
    delete channel.channel_analyses;

    // Parse voice_profile if it's a JSON string (from channels table)
    if (channel.voice_profile) {
      try {
        channel.voice_profile = typeof channel.voice_profile === 'string'
          ? JSON.parse(channel.voice_profile)
          : channel.voice_profile;
        console.log('API: Parsed channel.voice_profile:', {
          hasVoiceProfile: !!channel.voice_profile?.voiceProfile,
          hasBasicProfile: !!channel.voice_profile?.voiceProfile?.basicProfile,
          keys: Object.keys(channel.voice_profile || {})
        });
      } catch (e) {
        console.error('Error parsing voice_profile:', e);
        channel.voice_profile = {};
      }
    }

    // Parse analytics_data if it's a JSON string (from channels table)
    if (channel.analytics_data) {
      try {
        channel.analytics_data = typeof channel.analytics_data === 'string'
          ? JSON.parse(channel.analytics_data)
          : channel.analytics_data;
        console.log('API: Parsed channel.analytics_data:', {
          hasAudience: !!channel.analytics_data?.audience,
          hasInsights: !!channel.analytics_data?.audience?.insights,
          keys: Object.keys(channel.analytics_data || {})
        });
      } catch (e) {
        console.error('Error parsing analytics_data:', e);
        channel.analytics_data = {};
      }
    }

    // Always check for remix data (a channel might have remix data even if is_remix is false)
    try {
      // Get remix channel data
      const { data: remixData, error: remixError } = await supabase
        .from('remix_channels')
        .select('*')
        .eq('channel_id', id)
        .single();

      if (remixError && remixError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching remix data:', remixError);
      }
      
      // If we have remix data, ensure is_remix flag is set
      if (remixData) {
        channel.is_remix = true;
      }

        // Get channel remix analyses data if we have remix data
        if (remixData) {
          const { data: remixAnalyses, error: analysisError } = await supabase
            .from('channel_remix_analyses')
            .select('*')
            .eq('remix_channel_id', remixData.id)
            .order('generated_at', { ascending: false })
            .limit(1)
            .single();

          if (analysisError && analysisError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching remix analyses:', analysisError);
          }

          // Merge the data
          channel.remix_data = remixData;
          
          // Parse combined_voice_profile if it's a string
          if (remixData.combined_voice_profile) {
            try {
              channel.combined_voice_profile = typeof remixData.combined_voice_profile === 'string' 
                ? JSON.parse(remixData.combined_voice_profile)
                : remixData.combined_voice_profile;
              console.log('API: Set combined_voice_profile:', {
                hasBasic: !!channel.combined_voice_profile?.basic,
                hasTone: !!channel.combined_voice_profile?.basic?.tone,
                keys: Object.keys(channel.combined_voice_profile || {})
              });
            } catch (e) {
              console.error('Error parsing combined_voice_profile:', e);
              channel.combined_voice_profile = {};
            }
          }
          
          // Parse combined_analytics if needed
          if (remixData.combined_analytics) {
            try {
              channel.combined_analytics = typeof remixData.combined_analytics === 'string'
                ? JSON.parse(remixData.combined_analytics)
                : remixData.combined_analytics;
            } catch (e) {
              console.error('Error parsing combined_analytics:', e);
              channel.combined_analytics = {};
            }
          }
          
          if (remixAnalyses) {
            channel.remix_analysis = remixAnalyses;
            channel.audience_analysis = remixAnalyses.analysis_data?.audience;
          }
      }
    } catch (error) {
      console.error('Error fetching remix channel data:', error);
      // Continue without remix data rather than failing completely
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get channel from database
    const { data: existingChannel, error: fetchError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Skip YouTube refresh for remix channels
    if (existingChannel.is_remix || existingChannel.youtube_channel_id?.startsWith('remix_')) {
      // For remix channels, just return the existing data
      return NextResponse.json({ channel: existingChannel });
    }

    // Fetch updated data from YouTube
    const channelData = await getChannelById(existingChannel.youtube_channel_id);
    const parsedChannel = parseChannelData(channelData);

    // Update channel in database
    const { data: channel, error: updateError } = await supabase
      .from('channels')
      .update({
        title: parsedChannel.title,
        description: parsedChannel.description,
        custom_url: parsedChannel.customUrl,
        thumbnail_url: parsedChannel.thumbnails?.default?.url,
        subscriber_count: parsedChannel.statistics.subscriberCount,
        video_count: parsedChannel.statistics.videoCount,
        view_count: parsedChannel.statistics.viewCount,
        raw_data: channelData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating channel:', updateError);
      return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error updating channel:', error);
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the channel belongs to the user
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (channelError || !channel) {
      return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 404 });
    }

    // Delete related data in the correct order to avoid foreign key constraints
    // Order matters: delete child tables first
    
    // Track deletion progress for debugging
    const deletions = [];
    
    // 1. Delete voice training jobs
    const { error: voiceJobsError } = await supabase
      .from('voice_training_jobs')
      .delete()
      .eq('channel_id', id);
    if (voiceJobsError) deletions.push({ table: 'voice_training_jobs', error: voiceJobsError });
    
    // 2. Delete voice profiles
    const { error: voiceProfilesError } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('channel_id', id);
    if (voiceProfilesError) deletions.push({ table: 'voice_profiles', error: voiceProfilesError });
    
    // 3. Delete user preferences
    const { error: userPrefsError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('channel_id', id);
    if (userPrefsError) deletions.push({ table: 'user_preferences', error: userPrefsError });
    
    // 4. Delete script-related data (must be done before deleting scripts)
    // First get all scripts for this channel
    const { data: scripts } = await supabase
      .from('scripts')
      .select('id')
      .eq('channel_id', id);
    
    if (scripts && scripts.length > 0) {
      const scriptIds = scripts.map(s => s.id);
      
      // Delete all child tables that reference scripts
      await supabase
        .from('script_versions')
        .delete()
        .in('script_id', scriptIds);
      
      await supabase
        .from('script_titles')
        .delete()
        .in('script_id', scriptIds);
      
      await supabase
        .from('script_thumbnails')
        .delete()
        .in('script_id', scriptIds);
      
      await supabase
        .from('script_research')
        .delete()
        .in('script_id', scriptIds);
      
      await supabase
        .from('script_frames')
        .delete()
        .in('script_id', scriptIds);
      
      await supabase
        .from('script_edits')
        .delete()
        .in('script_id', scriptIds);
      
      // Delete script comments (handle parent-child relationships)
      await supabase
        .from('script_comments')
        .delete()
        .in('script_id', scriptIds);
      
      await supabase
        .from('content_calendar')
        .delete()
        .in('script_id', scriptIds);
      
      await supabase
        .from('script_generations')
        .delete()
        .in('script_id', scriptIds);
    }
    
    // Instead of deleting scripts, set channel_id to NULL to preserve them
    // This allows users to keep their scripts even if they delete the channel
    const { error: scriptUpdateError } = await supabase
      .from('scripts')
      .update({ channel_id: null })
      .eq('channel_id', id);
    
    if (scriptUpdateError) {
      console.error('Error updating scripts to remove channel reference:', scriptUpdateError);
    }
    
    // 5. Delete remaining script generations not linked to scripts
    await supabase
      .from('script_generations')
      .delete()
      .eq('channel_id', id);
    
    // 6. Delete remix source channels (where this channel is a source)
    await supabase
      .from('remix_source_channels')
      .delete()
      .eq('source_channel_id', id);
    
    // 7. Delete remix channels associated with this channel
    const { data: remixChannels } = await supabase
      .from('remix_channels')
      .select('id')
      .eq('channel_id', id);
    
    if (remixChannels && remixChannels.length > 0) {
      const remixIds = remixChannels.map(r => r.id);
      
      // Delete channel remix analyses
      await supabase
        .from('channel_remix_analyses')
        .delete()
        .in('remix_channel_id', remixIds);
      
      // Delete remix source channels
      await supabase
        .from('remix_source_channels')
        .delete()
        .in('remix_channel_id', remixIds);
      
      // Delete remix channels
      await supabase
        .from('remix_channels')
        .delete()
        .eq('channel_id', id);
    }
    
    // 8. Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('channel_id', id);
    
    // 9. Delete intel videos
    await supabase
      .from('intel_videos')
      .delete()
      .eq('channel_id', id);
    
    // 10. Delete intel channel analytics
    await supabase
      .from('intel_channel_analytics')
      .delete()
      .eq('channel_id', id);
    
    // 11. Delete chat history
    await supabase
      .from('chat_history')
      .delete()
      .eq('channel_id', id);
    
    // 12. Delete channel metrics history
    await supabase
      .from('channel_metrics_history')
      .delete()
      .eq('channel_id', id);
    
    // 13. Delete channel analyses
    await supabase
      .from('channel_analyses')
      .delete()
      .eq('channel_id', id);

    // Log any deletion errors for debugging
    if (deletions.length > 0) {
      console.error('Errors during channel deletion cleanup:', deletions);
    }
    
    // Finally, delete the channel itself
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting channel:', error);
      console.error('Previous deletion errors:', deletions);
      return NextResponse.json({ 
        error: 'Failed to delete channel', 
        details: error.message,
        deletionErrors: deletions 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete channel', details: error.message },
      { status: 500 }
    );
  }
}