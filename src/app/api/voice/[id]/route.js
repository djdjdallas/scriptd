import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/voice/[id]
 * Delete a voice profile
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the voice profile exists and belongs to the user
    const { data: profile, error: fetchError } = await supabase
      .from('voice_profiles')
      .select('*, channels!inner(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Voice profile not found' },
        { status: 404 }
      );
    }

    // Verify ownership through the channel
    if (profile.channels.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this profile' },
        { status: 403 }
      );
    }

    // Delete the voice profile
    const { error: deleteError } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting voice profile:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete voice profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Voice profile deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/voice/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete voice profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/voice/[id]
 * Get a specific voice profile
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the voice profile with channel info
    const { data: profile, error } = await supabase
      .from('voice_profiles')
      .select('*, channels!inner(user_id, name, title)')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Voice profile not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (profile.channels.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this profile' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error in GET /api/voice/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice profile' },
      { status: 500 }
    );
  }
}