import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler } from '@/lib/api-handler';

export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Get user's channels
  const { data: channels, error } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('[API /channels] Error fetching channels:', error);
    return NextResponse.json({
      data: []
    });
  }
  
  return NextResponse.json({
    data: channels || []
  });
});

export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();
  const body = await req.json();
  
  if (!body.name || !body.youtube_channel_id) {
    throw new ApiError('Channel name and YouTube channel ID are required', 400);
  }
  
  const { data: channel, error } = await supabase
    .from('channels')
    .insert({
      user_id: user.id,
      name: body.name,
      youtube_channel_id: body.youtube_channel_id,
      description: body.description || ''
    })
    .select()
    .single();
    
  if (error) {
    console.error('[API /channels] Error creating channel:', error);
    throw new ApiError('Failed to create channel', 500);
  }
  
  return NextResponse.json({
    data: channel
  });
});