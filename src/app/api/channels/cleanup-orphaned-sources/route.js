import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API route to cleanup orphaned remix source channels
 *
 * DELETE /api/channels/cleanup-orphaned-sources
 *
 * This removes channels that were created as temporary source channels
 * during remix analysis but were not properly deleted.
 */
export async function DELETE(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or has premium (safety check)
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

    console.log(`[Cleanup] Starting orphaned source cleanup for user ${user.id}`);

    // Find channels with voice_training_status = 'skipped' (external sources)
    // that belong to this user
    const { data: skippedChannels, error: skippedError } = await supabase
      .from('channels')
      .select('id, title, youtube_channel_id, created_at, is_remix')
      .eq('user_id', user.id)
      .eq('voice_training_status', 'skipped')
      .eq('is_remix', false);

    if (skippedError) {
      console.error('[Cleanup] Error fetching skipped channels:', skippedError);
      return NextResponse.json({
        error: 'Failed to fetch channels',
        details: skippedError.message
      }, { status: 500 });
    }

    if (!skippedChannels || skippedChannels.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned channels found',
        deleted: 0
      });
    }

    console.log(`[Cleanup] Found ${skippedChannels.length} potential orphaned channels`);

    // Get all remix channels for this user to see which sources are actually used
    const { data: remixChannels, error: remixError } = await supabase
      .from('channels')
      .select('id, title, remix_source_ids')
      .eq('user_id', user.id)
      .eq('is_remix', true)
      .not('remix_source_ids', 'is', null);

    if (remixError) {
      console.error('[Cleanup] Error fetching remix channels:', remixError);
    }

    // Collect all source IDs that are referenced in active remixes
    const usedSourceIds = new Set();
    remixChannels?.forEach(remix => {
      if (Array.isArray(remix.remix_source_ids)) {
        remix.remix_source_ids.forEach(id => usedSourceIds.add(id));
      }
    });

    // Find orphaned sources: skipped channels that are referenced in remixes
    const orphanedSources = skippedChannels.filter(ch => usedSourceIds.has(ch.id));

    if (orphanedSources.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned source channels found',
        deleted: 0,
        skipped_channels_count: skippedChannels.length
      });
    }

    console.log(`[Cleanup] Deleting ${orphanedSources.length} orphaned sources:`,
      orphanedSources.map(ch => ch.title).join(', '));

    // Delete the orphaned channels
    const idsToDelete = orphanedSources.map(ch => ch.id);

    const { error: deleteError } = await supabase
      .from('channels')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('[Cleanup] Error deleting channels:', deleteError);
      return NextResponse.json({
        error: 'Failed to delete channels',
        details: deleteError.message
      }, { status: 500 });
    }

    console.log(`[Cleanup] Successfully deleted ${idsToDelete.length} orphaned channels`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${idsToDelete.length} orphaned source channels`,
      deleted: idsToDelete.length,
      channels: orphanedSources.map(ch => ({
        id: ch.id,
        title: ch.title,
        youtube_channel_id: ch.youtube_channel_id
      }))
    });

  } catch (error) {
    console.error('[Cleanup] Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview what would be deleted
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find channels with voice_training_status = 'skipped' (external sources)
    const { data: skippedChannels, error: skippedError } = await supabase
      .from('channels')
      .select('id, title, youtube_channel_id, created_at, is_remix')
      .eq('user_id', user.id)
      .eq('voice_training_status', 'skipped')
      .eq('is_remix', false);

    if (skippedError) {
      return NextResponse.json({
        error: 'Failed to fetch channels',
        details: skippedError.message
      }, { status: 500 });
    }

    // Get all remix channels to see which sources are used
    const { data: remixChannels, error: remixError } = await supabase
      .from('channels')
      .select('id, title, remix_source_ids')
      .eq('user_id', user.id)
      .eq('is_remix', true)
      .not('remix_source_ids', 'is', null);

    if (remixError) {
      console.error('[Cleanup Preview] Error fetching remix channels:', remixError);
    }

    const usedSourceIds = new Set();
    remixChannels?.forEach(remix => {
      if (Array.isArray(remix.remix_source_ids)) {
        remix.remix_source_ids.forEach(id => usedSourceIds.add(id));
      }
    });

    const orphanedSources = skippedChannels?.filter(ch => usedSourceIds.has(ch.id)) || [];

    return NextResponse.json({
      success: true,
      orphaned_count: orphanedSources.length,
      orphaned_channels: orphanedSources.map(ch => ({
        id: ch.id,
        title: ch.title,
        youtube_channel_id: ch.youtube_channel_id,
        created_at: ch.created_at
      })),
      total_skipped: skippedChannels?.length || 0,
      total_remixes: remixChannels?.length || 0
    });

  } catch (error) {
    console.error('[Cleanup Preview] Error:', error);
    return NextResponse.json(
      { error: 'Preview failed', details: error.message },
      { status: 500 }
    );
  }
}
