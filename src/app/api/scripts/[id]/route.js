// Individual Script API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';

// GET /api/scripts/[id] - Get single script
export const GET = createApiHandler(async (req, { params }) => {
  const { user, supabase } = await getAuthenticatedUser();

  const { data: script, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !script) {
    throw new ApiError('Script not found', 404);
  }

  return script;
});

// PUT /api/scripts/[id] - Update script
export const PUT = createApiHandler(async (req, { params }) => {
  const { user, supabase } = await getAuthenticatedUser();

  const body = await req.json();
  
  // Check ownership
  const { data: existing } = await supabase
    .from('scripts')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!existing) {
    throw new ApiError('Script not found', 404);
  }

  // Update script
  const { data: script, error } = await supabase
    .from('scripts')
    .update({
      title: body.title,
      type: body.type,
      length: body.length,
      content: body.content,
      metadata: body.metadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    throw new ApiError('Failed to update script', 500);
  }

  return script;
});

// DELETE /api/scripts/[id] - Delete script
export const DELETE = createApiHandler(async (req, { params }) => {
  const { user, supabase } = await getAuthenticatedUser();

  // Check ownership and delete
  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    throw new ApiError('Failed to delete script', 500);
  }

  return { success: true };
});