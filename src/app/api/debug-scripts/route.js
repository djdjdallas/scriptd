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
    
  // 2. Check scripts by user_id directly
  const { data: scriptsByUserId, error: scriptsByUserIdError } = await supabase
    .from('scripts')
    .select('id, title, channel_id, user_id, created_at, metadata')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  // 3. Check scripts by channel_id
  let scriptsForUserChannels = [];
  let channelIds = [];
  if (channels && channels.length > 0) {
    channelIds = channels.map(c => c.id);
    const { data, error } = await supabase
      .from('scripts')
      .select('id, title, channel_id, user_id, created_at, metadata')
      .in('channel_id', channelIds)
      .order('created_at', { ascending: false });
    scriptsForUserChannels = data || [];
  }
  
  // 4. Check workflows for comparison
  const { data: workflows, error: workflowsError } = await supabase
    .from('script_workflows')
    .select('id, title, user_id, created_at, workflow_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  // 5. Check scripts using the same OR query as the main endpoint
  let orQueryScripts = [];
  if (channelIds.length > 0) {
    const { data, error } = await supabase
      .from('scripts')
      .select('id, title, channel_id, user_id, created_at')
      .or(`channel_id.in.(${channelIds.map(id => `"${id}"`).join(',')}),user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    orQueryScripts = data || [];
  } else {
    const { data, error } = await supabase
      .from('scripts')
      .select('id, title, channel_id, user_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    orQueryScripts = data || [];
  }
  
  return NextResponse.json({
    debug: {
      currentUser: {
        id: user.id,
        email: user.email
      },
      channels: {
        count: channels?.length || 0,
        channelIds: channelIds,
        channels: channels?.map(c => ({ id: c.id, name: c.name, user_id: c.user_id }))
      },
      scriptsByUserId: {
        count: scriptsByUserId?.length || 0,
        scripts: scriptsByUserId?.map(s => ({
          id: s.id,
          title: s.title,
          user_id: s.user_id,
          channel_id: s.channel_id,
          workflow_id: s.metadata?.workflow_id
        }))
      },
      scriptsByChannelId: {
        count: scriptsForUserChannels.length,
        scripts: scriptsForUserChannels.map(s => ({
          id: s.id,
          title: s.title,
          user_id: s.user_id,
          channel_id: s.channel_id,
          workflow_id: s.metadata?.workflow_id
        }))
      },
      scriptsWithOrQuery: {
        count: orQueryScripts.length,
        scripts: orQueryScripts
      },
      workflows: {
        count: workflows?.length || 0,
        workflows: workflows?.map(w => ({
          id: w.id,
          title: w.title || 'Untitled',
          user_id: w.user_id,
          scriptId: w.workflow_data?.scriptId
        }))
      }
    }
  });
});