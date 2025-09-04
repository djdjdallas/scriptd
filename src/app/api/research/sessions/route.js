// Research Sessions List API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';

// GET /api/research/sessions - List user's research sessions
export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');

  // Build query
  let query = supabase
    .from('research_sessions')
    .select(`
      *,
      research_messages (count),
      research_sources (count)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: sessions, error } = await query;

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research sessions' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    sessions: sessions?.map(s => ({
      id: s.id,
      title: s.title,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      messageCount: s.research_messages?.[0]?.count || 0,
      sourceCount: s.research_sources?.[0]?.count || 0,
      metadata: s.metadata
    })) || []
  });
});

// POST /api/research/sessions - Create new research session
export const POST = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();

  let body;
  try {
    body = await req.json();
  } catch (e) {
    body = {};
  }
  
  const { title = 'New Research Session' } = body;

  const { data, error } = await supabase
    .from('research_sessions')
    .insert({
      user_id: user.id,
      title,
      metadata: {
        createdAt: new Date().toISOString(),
        messages: [],
        sources: []
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create research session' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    session: {
      id: data.id,
      title: data.title,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      messageCount: 0,
      sourceCount: 0,
      metadata: data.metadata
    }
  });
});