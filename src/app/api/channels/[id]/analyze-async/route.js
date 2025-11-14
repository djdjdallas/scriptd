import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This starts the analysis in the background and returns immediately
export async function POST(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get channel from database
    const { data: dbChannel, error: fetchError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !dbChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Check if analysis is already in progress
    const lastAnalyzed = dbChannel.last_analyzed_at ? new Date(dbChannel.last_analyzed_at) : null;
    const isRecentlyAnalyzed = lastAnalyzed && (Date.now() - lastAnalyzed.getTime()) < 60000; // 1 minute

    if (isRecentlyAnalyzed) {
      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Channel was recently analyzed',
      });
    }

    // Start the analysis asynchronously by calling the original analyze endpoint
    // We'll do this with a non-blocking fetch that we don't wait for
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}`;

    // Fire and forget - start the analysis but don't wait for it
    fetch(`${baseUrl}/api/channels/${id}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass along the authorization cookies
        'Cookie': request.headers.get('cookie') || '',
      },
    }).catch(err => {
      console.error('Background analysis error:', err);
    });

    // Return immediately
    return NextResponse.json({
      success: true,
      status: 'started',
      message: 'Analysis started in the background. Please check back in a moment.',
    });

  } catch (error) {
    console.error('Error starting async analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start analysis' },
      { status: 500 }
    );
  }
}