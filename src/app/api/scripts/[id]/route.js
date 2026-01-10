// Individual Script API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { apiLogger } from '@/lib/monitoring/logger';

// GET /api/scripts/[id] - Get single script
export const GET = createApiHandler(async (req, context) => {
  const { user } = await getAuthenticatedUser();
  const { id } = await context.params;
  const { scriptService } = await import('@/lib/scripts/script-service');

  try {
    const script = await scriptService.getScript(id, user.id);
    return NextResponse.json(script);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      throw new ApiError(error.message, 404);
    }
    throw new ApiError('Failed to fetch script', 500);
  }
});

// PUT /api/scripts/[id] - Update script
export const PUT = createApiHandler(async (req, context) => {
  const { user, supabase } = await getAuthenticatedUser();
  const { id } = await context.params;

  const body = await req.json();
  const { scriptService } = await import('@/lib/scripts/script-service');
  
  try {
    const script = await scriptService.updateScript(id, user.id, {
      title: body.title,
      content: body.content,
      hook: body.hook,
      description: body.description,
      tags: body.tags,
      metadata: body.metadata
    }, {
      createVersion: body.createVersion !== false, // Default to true unless explicitly false
      isAutoSave: body.isAutoSave === true
    });

    // Clean up old auto-save versions periodically
    if (body.isAutoSave) {
      scriptService.cleanupOldAutoSaves(id, 10).catch(err => apiLogger.warn('Failed to cleanup old auto-saves', { error: err.message, scriptId: id }));
    }

    return NextResponse.json(script);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      throw new ApiError(error.message, 404);
    }
    if (error.message.includes('permission')) {
      throw new ApiError(error.message, 403);
    }
    throw new ApiError('Failed to update script', 500);
  }
});

// DELETE /api/scripts/[id] - Delete script
export const DELETE = createApiHandler(async (req, context) => {
  const { user } = await getAuthenticatedUser();
  const { id } = await context.params;
  const { scriptService } = await import('@/lib/scripts/script-service');

  try {
    const result = await scriptService.deleteScript(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      throw new ApiError(error.message, 404);
    }
    if (error.message.includes('permission')) {
      throw new ApiError(error.message, 403);
    }
    throw new ApiError('Failed to delete script', 500);
  }
});