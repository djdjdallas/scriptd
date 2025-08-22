// Research Session API Routes

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { supabase } from '@/lib/supabase';

// GET /api/research/sessions/[id] - Get session with messages and sources
export const GET = createApiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  // Get session
  const { data: researchSession, error: sessionError } = await supabase
    .from('research_sessions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (sessionError || !researchSession) {
    throw new ApiError('Research session not found', 404);
  }

  // Get messages
  const { data: messages } = await supabase
    .from('research_messages')
    .select('*')
    .eq('session_id', params.id)
    .order('created_at', { ascending: true });

  // Get sources
  const { data: sources } = await supabase
    .from('research_sources')
    .select('*')
    .eq('session_id', params.id)
    .order('created_at', { ascending: false });

  return {
    session: {
      id: researchSession.id,
      title: researchSession.title,
      createdAt: researchSession.created_at,
      updatedAt: researchSession.updated_at,
      metadata: researchSession.metadata
    },
    messages: messages?.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      sources: msg.metadata?.context || []
    })) || [],
    sources: sources?.map(src => ({
      id: src.id,
      url: src.url,
      title: src.title,
      summary: src.summary,
      content: src.content,
      wordCount: src.metadata?.wordCount || 0,
      starred: src.starred || false,
      createdAt: src.created_at
    })) || []
  };
});

// PUT /api/research/sessions/[id] - Update session
export const PUT = createApiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  const { title } = await req.json();

  const { data, error } = await supabase
    .from('research_sessions')
    .update({
      title,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error || !data) {
    throw new ApiError('Failed to update session', 500);
  }

  return data;
});

// DELETE /api/research/sessions/[id] - Delete session
export const DELETE = createApiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  // Delete session (cascade will handle messages and sources)
  const { error } = await supabase
    .from('research_sessions')
    .delete()
    .eq('id', params.id)
    .eq('user_id', session.user.id);

  if (error) {
    throw new ApiError('Failed to delete session', 500);
  }

  return { success: true };
});