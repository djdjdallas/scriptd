// Scripts Management API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError, paginate } from '@/lib/api-handler';

// GET /api/scripts - List user's scripts
export const GET = createApiHandler(async (req) => {
  console.log('[API /scripts] GET request received');
  
  const { user, supabase } = await getAuthenticatedUser();
  
  console.log('[API /scripts] Authenticated user:', user.email);

  const { searchParams } = new URL(req.url);
  const pagination = paginate(Object.fromEntries(searchParams));
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Build query - get user's scripts without complex joins
  // First get user's channels
  const { data: userChannels } = await supabase
    .from('channels')
    .select('id, name')
    .eq('user_id', user.id);
  
  const channelIds = userChannels?.map(c => c.id) || [];
  const channelMap = userChannels?.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {}) || {};
  
  // Then get scripts for those channels or directly owned by user
  let query = supabase
    .from('scripts')
    .select('*', { count: 'exact' });
  
  // Filter by user's channels AND/OR direct user_id
  // This ensures we get scripts that are either:
  // 1. Associated with user's channels
  // 2. Directly owned by the user (even if no channel association)
  if (channelIds.length > 0) {
    // Get scripts from user's channels OR scripts directly owned by user
    query = query.or(`channel_id.in.(${channelIds.map(id => `"${id}"`).join(',')}),user_id.eq.${user.id}`);
  } else {
    // If no channels, just get scripts owned by user
    query = query.eq('user_id', user.id);
  }

  // Apply filters
  if (type) {
    query = query.eq('type', type);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data: scripts, error, count } = await query;

  if (error) {
    console.error('[API /scripts] Database error:', error);
    console.error('[API /scripts] Query details:', { 
      userId: user.id, 
      channelIds,
      type, 
      search, 
      sortBy, 
      sortOrder 
    });
    throw new ApiError(`Failed to fetch scripts: ${error.message}`, 500);
  }

  console.log(`[API /scripts] Query details:`, {
    userId: user.id,
    channelIds,
    channelCount: channelIds.length
  });
  console.log(`[API /scripts] Found ${scripts?.length || 0} scripts, total count: ${count}`);
  
  // Debug: Log first few scripts to see what we're getting
  if (scripts && scripts.length > 0) {
    console.log('[API /scripts] Sample script:', {
      id: scripts[0].id,
      title: scripts[0].title,
      channel_id: scripts[0].channel_id,
      user_id: scripts[0].user_id,
      metadata: scripts[0].metadata
    });
  }

  const items = (scripts || []).map(script => ({
    id: script.id,
    title: script.title,
    type: script.metadata?.type || script.type || 'general',
    length: script.metadata?.length || script.length || 5,
    excerpt: script.content ? script.content.substring(0, 200) + '...' : '',
    channelId: script.channel_id,
    channelName: channelMap[script.channel_id] || 'Unknown Channel',
    createdAt: script.created_at,
    updatedAt: script.updated_at
  }));

  console.log(`[API /scripts] Returning ${items.length} items`);

  return NextResponse.json({
    items,
    pagination: pagination.getMetadata(count || 0)
  });
});

// POST /api/scripts - Create new script (manual)
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  if (!body.title || !body.content) {
    throw new ApiError('Title and content are required', 400);
  }

  // Get user's default channel or create one if needed
  let channelId = body.channelId;
  
  if (!channelId) {
    // Try to get user's first channel
    const { data: channels, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (channelError || !channels || channels.length === 0) {
      // Create a default channel for the user
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          user_id: user.id,
          youtube_channel_id: `default_${user.id}`,
          name: 'My Channel'
        })
        .select()
        .single();
      
      if (createError) {
        throw new ApiError('Failed to create default channel', 500);
      }
      
      channelId = newChannel.id;
    } else {
      channelId = channels[0].id;
    }
  }

  const { data: script, error } = await supabase
    .from('scripts')
    .insert({
      channel_id: channelId,
      title: body.title,
      type: body.type || 'general',
      content: body.content,
      hook: body.hook || '',
      description: body.description || '',
      tags: body.tags || [],
      metadata: body.metadata || {}
    })
    .select()
    .single();

  if (error) {
    throw new ApiError('Failed to create script', 500);
  }

  return {
    id: script.id,
    title: script.title,
    type: script.type,
    content: script.content,
    hook: script.hook,
    description: script.description,
    tags: script.tags,
    channelId: script.channel_id,
    createdAt: script.created_at
  };
});