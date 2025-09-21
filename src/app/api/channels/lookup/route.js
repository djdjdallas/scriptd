import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findChannelIdByName } from '@/lib/youtube/channel-lookup';
import { getKnownChannelId } from '@/lib/youtube/known-channels';

export async function POST(request) {
  try {
    const { channelName } = await request.json();
    
    if (!channelName) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Looking up YouTube ID for: "${channelName}"`);
    
    // First try known channels (instant)
    let channelId = getKnownChannelId(channelName);
    let source = 'known';
    
    // If not found, search YouTube API
    if (!channelId) {
      channelId = await findChannelIdByName(channelName);
      source = 'youtube-api';
    }
    
    if (channelId) {
      return NextResponse.json({
        success: true,
        channelId,
        channelName,
        source
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Channel not found',
        channelName
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Channel lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup channel', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for batch lookup
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const names = searchParams.get('names');
    
    if (!names) {
      return NextResponse.json(
        { error: 'Channel names are required' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channelNames = names.split(',').map(n => n.trim());
    const results = {};
    
    for (const name of channelNames) {
      // Try known channels first
      let id = getKnownChannelId(name);
      
      // If not found, search YouTube
      if (!id) {
        id = await findChannelIdByName(name);
      }
      
      if (id) {
        results[name] = id;
      }
    }
    
    return NextResponse.json({
      success: true,
      channels: results,
      found: Object.keys(results).length,
      requested: channelNames.length
    });

  } catch (error) {
    console.error('Batch channel lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup channels', details: error.message },
      { status: 500 }
    );
  }
}