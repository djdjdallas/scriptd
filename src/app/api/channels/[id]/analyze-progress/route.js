import { NextResponse } from 'next/server';
import { getProgress } from '@/lib/utils/progress-tracker';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const progress = getProgress(sessionId);

    if (!progress) {
      return NextResponse.json({
        stage: 'unknown',
        message: 'No progress found',
        progress: 0
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
