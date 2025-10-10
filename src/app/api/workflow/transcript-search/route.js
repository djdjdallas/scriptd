import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/workflow/transcript-search
 *
 * Search through video transcripts using the search_transcripts helper function
 *
 * Request body:
 * {
 *   workflowId: string - Workflow ID to search within
 *   searchTerm: string - Term to search for in transcripts
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { workflowId, searchTerm } = body;

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: 'workflowId is required'
        },
        { status: 400 }
      );
    }

    if (!searchTerm || searchTerm.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'searchTerm is required'
        },
        { status: 400 }
      );
    }

    console.log(`[API] Searching transcripts in workflow ${workflowId} for: "${searchTerm}"`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Call the search_transcripts helper function
    const { data, error } = await supabase.rpc('search_transcripts', {
      workflow_id: workflowId,
      search_term: searchTerm
    });

    if (error) {
      console.error('[API] Error searching transcripts:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to search transcripts',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    console.log(`[API] Found ${data?.length || 0} matching transcripts`);

    return NextResponse.json({
      success: true,
      results: data || [],
      count: data?.length || 0,
      searchTerm,
      workflowId
    });

  } catch (error) {
    console.error('[API] Transcript search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search transcripts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflow/transcript-search
 *
 * Get transcript summary statistics using the get_workflow_transcript_summary helper function
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: 'workflowId query parameter is required'
        },
        { status: 400 }
      );
    }

    console.log(`[API] Getting transcript summary for workflow ${workflowId}`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Call the get_workflow_transcript_summary helper function
    const { data, error } = await supabase.rpc('get_workflow_transcript_summary', {
      workflow_id: workflowId
    });

    if (error) {
      console.error('[API] Error getting transcript summary:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get transcript summary',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    console.log('[API] Transcript summary retrieved successfully');

    return NextResponse.json({
      success: true,
      summary: data || {},
      workflowId
    });

  } catch (error) {
    console.error('[API] Transcript summary error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get transcript summary',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
