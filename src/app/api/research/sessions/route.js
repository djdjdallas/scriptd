// Research Sessions List API Routes

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { supabase } from '@/lib/supabase';

// GET /api/research/sessions - List user's research sessions
export const GET = createApiHandler(async (req) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

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
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: sessions, error } = await query;

  if (error) {
    throw new ApiError('Failed to fetch research sessions', 500);
  }

  return {
    sessions: sessions.map(s => ({
      id: s.id,
      title: s.title,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      messageCount: s.research_messages?.[0]?.count || 0,
      sourceCount: s.research_sources?.[0]?.count || 0,
      metadata: s.metadata
    }))
  };
});

// POST /api/research/sessions - Create new research session
export const POST = createApiHandler(async (req) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  const { title = 'New Research Session' } = await req.json();

  const { data, error } = await supabase
    .from('research_sessions')
    .insert({
      user_id: session.user.id,
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
    throw new ApiError('Failed to create research session', 500);
  }

  return {
    session: {
      id: data.id,
      title: data.title,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      messageCount: 0,
      sourceCount: 0,
      metadata: data.metadata
    }
  };
});