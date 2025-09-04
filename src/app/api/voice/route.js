import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get user's channels
    const { data: channels } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id);

    if (!channels || channels.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const channelIds = channels.map(c => c.id);

    // Get voice profiles for the user's channels
    const { data: profiles, error } = await supabase
      .from('voice_profiles')
      .select(`
        *,
        channels:channel_id (
          id,
          name,
          youtube_channel_id,
          analytics_data
        )
      `)
      .in('channel_id', channelIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching voice profiles:', error);
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          data: []
        });
      }
      return NextResponse.json({ error: 'Failed to fetch voice profiles' }, { status: 500 });
    }

    // Transform data for frontend compatibility
    const transformedProfiles = (profiles || []).map(profile => ({
      ...profile,
      status: profile.training_data?.status || profile.parameters?.status || 'trained',
      accuracy: profile.parameters?.accuracy || 85
    }));

    return NextResponse.json({
      success: true,
      data: transformedProfiles
    });
  } catch (error) {
    console.error('Voice profiles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profileName, samples, channelId, description } = body;

    if (!profileName || !channelId) {
      return NextResponse.json({ error: 'Profile name and channel ID are required' }, { status: 400 });
    }

    // Verify user owns the channel
    const { data: channel } = await supabase
      .from('channels')
      .select('id')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found or unauthorized' }, { status: 403 });
    }

    // In a real implementation, you would:
    // 1. Upload file to storage (Supabase Storage, S3, etc.)
    // 2. Process the file for voice training
    // 3. Create a job in a queue for ML processing
    // 4. Store the voice profile in the database

    // Create voice profile
    const { data: profile, error } = await supabase
      .from('voice_profiles')
      .insert({
        channel_id: channelId,
        profile_name: profileName,
        training_data: {
          sampleCount: samples?.length || 0,
          description: description || ''
        },
        parameters: {
          accuracy: Math.floor(Math.random() * 20) + 80,
          pitch: Math.random() * 2 - 1,
          tone: Math.random() * 2 - 1,
          speed: Math.random() * 0.5 + 0.75,
          status: 'training'
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating voice profile:', error);
      return NextResponse.json({ error: 'Failed to create voice profile' }, { status: 500 });
    }

    // Update status to trained after a short delay (in production, this would be done by a background job)
    setTimeout(async () => {
      await supabase
        .from('voice_profiles')
        .update({ 
          parameters: {
            ...profile.parameters,
            status: 'trained'
          }
        })
        .eq('id', profile.id);
    }, 5000); // 5 seconds for demo

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Voice training error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('id');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    // Delete the voice profile
    const { error } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting voice profile:', error);
      return NextResponse.json({ error: 'Failed to delete voice profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Voice profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete voice profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}