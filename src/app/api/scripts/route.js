// Scripts Management API Routes

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createApiHandler, ApiError, paginate } from '@/lib/api-handler';
import { supabase } from '@/lib/supabase';

// GET /api/scripts - List user's scripts
export const GET = createApiHandler(async (req) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  const { searchParams } = new URL(req.url);
  const pagination = paginate(Object.fromEntries(searchParams));
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Build query
  let query = supabase
    .from('scripts')
    .select('*', { count: 'exact' })
    .eq('user_id', session.user.id);

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
    throw new ApiError('Failed to fetch scripts', 500);
  }

  return pagination.createResponse(
    scripts.map(script => ({
      id: script.id,
      title: script.title,
      type: script.type,
      length: script.length,
      excerpt: script.content.substring(0, 200) + '...',
      createdAt: script.created_at,
      updatedAt: script.updated_at
    })),
    count
  );
});

// POST /api/scripts - Create new script (manual)
export const POST = createApiHandler(async (req) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  const body = await req.json();
  
  if (!body.title || !body.content) {
    throw new ApiError('Title and content are required', 400);
  }

  const { data: script, error } = await supabase
    .from('scripts')
    .insert({
      user_id: session.user.id,
      title: body.title,
      type: body.type || 'general',
      length: body.length || 10,
      content: body.content,
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
    length: script.length,
    content: script.content,
    createdAt: script.created_at
  };
});