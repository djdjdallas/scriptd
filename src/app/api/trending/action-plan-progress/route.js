import { NextResponse } from 'next/server';

// In-memory storage for progress (in production, use Redis or similar)
const progressStore = new Map();

// Clean up old progress entries after 5 minutes
const cleanupOldProgress = () => {
  const now = Date.now();
  for (const [key, value] of progressStore.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) {
      progressStore.delete(key);
    }
  }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  cleanupOldProgress();

  const progress = progressStore.get(sessionId);

  if (!progress) {
    return NextResponse.json({
      stage: 'initializing',
      message: 'Starting action plan generation...',
      progress: 0
    });
  }

  return NextResponse.json(progress);
}

export async function POST(request) {
  try {
    const { sessionId, stage, message, progress } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    progressStore.set(sessionId, {
      stage,
      message,
      progress,
      timestamp: Date.now()
    });

    cleanupOldProgress();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}