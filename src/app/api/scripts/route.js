// Scripts Management API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError, paginate } from '@/lib/api-handler';
import { apiLogger } from '@/lib/monitoring/logger';

// GET /api/scripts - List user's scripts
export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

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
    const orClause = `channel_id.in.(${channelIds.join(',')}),user_id.eq.${user.id}`;
    query = query.or(orClause);
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
    apiLogger.error('[API /scripts] Database error', error);
    throw new ApiError(`Failed to fetch scripts: ${error.message}`, 500);
  }

  const items = (scripts || []).map(script => ({
    id: script.id,
    title: script.title,
    type: script.metadata?.type || script.type || 'general',
    length: script.metadata?.length || script.length || 5,
    excerpt: script.content ? script.content.substring(0, 200) + '...' : '',
    channelId: script.channel_id,
    channelName: script.channel_id ? (channelMap[script.channel_id] || 'Unknown Channel') : 'No Channel',
    createdAt: script.created_at,
    updatedAt: script.updated_at
  }));

  // Calculate aggregate stats from ALL user's scripts (not just current page)
  // Get scripts from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let statsQuery = supabase
    .from('scripts')
    .select('length, created_at');

  // Apply same user filter as main query
  if (channelIds.length > 0) {
    statsQuery = statsQuery.or(`channel_id.in.(${channelIds.join(',')}),user_id.eq.${user.id}`);
  } else {
    statsQuery = statsQuery.eq('user_id', user.id);
  }

  const { data: allScripts } = await statsQuery;

  const stats = {
    thisWeek: allScripts?.filter(s => new Date(s.created_at) > new Date(sevenDaysAgo)).length || 0,
    totalMinutes: allScripts?.reduce((acc, s) => acc + (s.length || 0), 0) || 0
  };

  return NextResponse.json({
    items,
    pagination: pagination.getMetadata(count || 0),
    stats
  });
});

// POST /api/scripts - Create new script (manual)
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  if (!body.title || !body.content) {
    throw new ApiError('Title and content are required', 400);
  }

  // Channel is now optional for manual scripts
  let channelId = body.channelId || null;
  
  // If a channelId is provided, verify it belongs to the user
  if (channelId) {
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();
    
    if (channelError || !channel) {
      throw new ApiError('Invalid channel ID', 400);
    }
  }
  
  // Create script with or without channel
  const { data: script, error } = await supabase
    .from('scripts')
    .insert({
      channel_id: channelId,  // Can be null
      user_id: user.id,  // Always set user_id
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