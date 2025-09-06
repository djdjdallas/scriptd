import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler } from '@/lib/api-handler';

export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // 1. Check if user has any channels
  const { data: channels, error: channelError } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', user.id);
    
  // 2. Check all scripts (without join)
  const { data: allScripts, error: allScriptsError } = await supabase
    .from('scripts')
    .select('*')
    .limit(10);
    
  // 3. Check scripts with channel join
  const { data: scriptsWithChannels, error: scriptsWithChannelsError } = await supabase
    .from('scripts')
    .select(`
      *,
      channels!inner(
        id,
        name,
        user_id
      )
    `)
    .eq('channels.user_id', user.id)
    .limit(10);
    
  // 4. If user has channels, get scripts for those channels directly
  let scriptsForUserChannels = [];
  if (channels && channels.length > 0) {
    const channelIds = channels.map(c => c.id);
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .in('channel_id', channelIds);
    scriptsForUserChannels = data || [];
  }
  
  return NextResponse.json({
    debug: {
      userId: user.id,
      userEmail: user.email,
      channels: {
        count: channels?.length || 0,
        data: channels,
        error: channelError?.message
      },
      allScripts: {
        count: allScripts?.length || 0,
        sample: allScripts?.slice(0, 3),
        error: allScriptsError?.message
      },
      scriptsWithJoin: {
        count: scriptsWithChannels?.length || 0,
        data: scriptsWithChannels,
        error: scriptsWithChannelsError?.message
      },
      scriptsForUserChannels: {
        count: scriptsForUserChannels.length,
        data: scriptsForUserChannels
      }
    }
  });
});