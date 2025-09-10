// Script Version Management API Routes

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { scriptService } from '@/lib/scripts/script-service';

// POST /api/scripts/[id]/versions - Create a new manual version
export const POST = createApiHandler(async (req, context) => {
  const { user } = await getAuthenticatedUser();
  const { id } = await context.params;
  const body = await req.json();

  if (!body.title || !body.content) {
    throw new ApiError('Title and content are required', 400);
  }

  try {
    const version = await scriptService.saveAsVersion(
      id, 
      user.id, 
      {
        title: body.title,
        content: body.content,
        hook: body.hook || '',
        description: body.description || '',
        tags: body.tags || []
      },
      body.change_summary
    );

    return NextResponse.json(version);
  } catch (error) {
    if (error.message.includes('permission')) {
      throw new ApiError(error.message, 403);
    }
    throw new ApiError('Failed to create version', 500);
  }
});