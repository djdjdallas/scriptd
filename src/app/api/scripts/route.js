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

  // Build query - join with channels to get user's scripts
  let query = supabase
    .from('scripts')
    .select(`
      *,
      channels!inner(
        id,
        name,
        user_id
      )
    `, { count: 'exact' })
    .eq('channels.user_id', user.id);

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
      type, 
      search, 
      sortBy, 
      sortOrder 
    });
    throw new ApiError(`Failed to fetch scripts: ${error.message}`, 500);
  }

  console.log(`[API /scripts] Found ${scripts?.length || 0} scripts, total count: ${count}`);

  const items = (scripts || []).map(script => ({
    id: script.id,
    title: script.title,
    type: script.metadata?.type || script.type || 'general',
    length: script.metadata?.length || script.length || 5,
    excerpt: script.content ? script.content.substring(0, 200) + '...' : '',
    channelId: script.channel_id,
    channelName: script.channels?.name,
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