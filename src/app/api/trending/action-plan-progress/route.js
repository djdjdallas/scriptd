import { NextResponse } from 'next/server';
import { getProgress } from '@/lib/utils/progress-tracker';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const progress = getProgress(sessionId);

  if (!progress) {
    return NextResponse.json({
      stage: 'initializing',
      message: 'Starting action plan generation...',
      progress: 0
    });
  }

  return NextResponse.json(progress);
}