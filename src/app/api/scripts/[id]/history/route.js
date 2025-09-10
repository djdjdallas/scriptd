// Script Version History API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { scriptService } from '@/lib/scripts/script-service';

// GET /api/scripts/[id]/history - Get script version history
export const GET = createApiHandler(async (req, context) => {
  const { user } = await getAuthenticatedUser();
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit')) || 50;

  try {
    const result = await scriptService.getScriptVersions(id, user.id, limit);
    return NextResponse.json(result);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      throw new ApiError(error.message, 404);
    }
    throw new ApiError('Failed to fetch version history', 500);
  }
});