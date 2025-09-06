// Individual Script API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';

// GET /api/scripts/[id] - Get single script
export const GET = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  const { id } = await context.params;

  // Join with channels to get user's scripts
  const { data: script, error } = await supabase
    .from('scripts')
    .select(`
      *,
      channels!inner(
        id,
        name,
        user_id
      )
    `)
    .eq('id', id)
    .eq('channels.user_id', user.id)
    .single();

  if (error || !script) {
    throw new ApiError('Script not found', 404);
  }

  return NextResponse.json(script);
});

// PUT /api/scripts/[id] - Update script
export const PUT = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  const { id } = await context.params;

  const body = await req.json();
  
  // Verify ownership through channel
  const { data: existing } = await supabase
    .from('scripts')
    .select(`
      id,
      channels!inner(
        user_id
      )
    `)
    .eq('id', id)
    .eq('channels.user_id', user.id)
    .single();

  if (!existing) {
    throw new ApiError('Script not found or unauthorized', 404);
  }

  // Update script
  const { data: script, error } = await supabase
    .from('scripts')
    .update({
      title: body.title,
      content: body.content,
      hook: body.hook,
      description: body.description,
      tags: body.tags,
      metadata: body.metadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError('Failed to update script', 500);
  }

  return NextResponse.json(script);
});

// DELETE /api/scripts/[id] - Delete script
export const DELETE = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  const { id } = await context.params;

  // First verify ownership through channel
  const { data: script } = await supabase
    .from('scripts')
    .select(`
      id,
      channels!inner(
        user_id
      )
    `)
    .eq('id', id)
    .eq('channels.user_id', user.id)
    .single();

  if (!script) {
    throw new ApiError('Script not found or unauthorized', 404);
  }

  // Delete the script
  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError('Failed to delete script', 500);
  }

  return NextResponse.json({ success: true });
});