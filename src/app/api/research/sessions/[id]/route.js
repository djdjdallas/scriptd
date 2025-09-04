// Research Session API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';

// GET /api/research/sessions/[id] - Get session with messages and sources
export const GET = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Await params as required in Next.js 15
  const params = await context.params;
  const sessionId = params.id;

  // Get session
  const { data: researchSession, error: sessionError } = await supabase
    .from('research_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !researchSession) {
    return NextResponse.json(
      { error: 'Research session not found' },
      { status: 404 }
    );
  }

  // Get messages
  const { data: messages } = await supabase
    .from('research_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  // Get sources
  const { data: sources } = await supabase
    .from('research_sources')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  return NextResponse.json({
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
  });
});

// PUT /api/research/sessions/[id] - Update session
export const PUT = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Await params as required in Next.js 15
  const params = await context.params;
  const sessionId = params.id;

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { title } = body;

  const { data, error } = await supabase
    .from('research_sessions')
    .update({
      title,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
});

// DELETE /api/research/sessions/[id] - Delete session
export const DELETE = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Await params as required in Next.js 15
  const params = await context.params;
  const sessionId = params.id;

  // Delete session (cascade will handle messages and sources)
  const { error } = await supabase
    .from('research_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
});