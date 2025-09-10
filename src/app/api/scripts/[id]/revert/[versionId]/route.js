// Script Revert API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { scriptService } from '@/lib/scripts/script-service';

// POST /api/scripts/[id]/revert/[versionId] - Revert script to a previous version
export const POST = createApiHandler(async (req, context) => {
  const { user } = await getAuthenticatedUser();
  const { id, versionId } = await context.params;

  try {
    const script = await scriptService.revertToVersion(id, versionId, user.id);
    return NextResponse.json(script);
  } catch (error) {
    if (error.message.includes('not found')) {
      throw new ApiError(error.message, 404);
    }
    if (error.message.includes('permission')) {
      throw new ApiError(error.message, 403);
    }
    throw new ApiError('Failed to revert script', 500);
  }
});