import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get voice profiles for the user
    const { data: profiles, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('user_id', user.id)
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
      status: profile.is_active ? 'trained' : 'training',
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

    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name') || 'Untitled Voice';
    const type = formData.get('type') || 'audio'; // audio, text, youtube

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Upload file to storage (Supabase Storage, S3, etc.)
    // 2. Process the file for voice training
    // 3. Create a job in a queue for ML processing
    // 4. Store the voice profile in the database

    // For now, we'll create a mock profile
    const { data: profile, error } = await supabase
      .from('voice_profiles')
      .insert({
        user_id: user.id,
        name,
        type,
        status: 'training',
        accuracy: 0,
        samples_count: 1,
        metadata: {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating voice profile:', error);
      return NextResponse.json({ error: 'Failed to create voice profile' }, { status: 500 });
    }

    // Simulate training process (in real app, this would be async)
    setTimeout(async () => {
      await supabase
        .from('voice_profiles')
        .update({ 
          status: 'trained',
          accuracy: Math.floor(Math.random() * 20) + 80 // 80-100%
        })
        .eq('id', profile.id);
    }, 30000); // 30 seconds

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