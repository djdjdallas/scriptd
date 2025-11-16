/**
 * Utility to track progress for action plan generation
 */

export async function updateProgress(sessionId, stage, message, progress) {
  if (!sessionId) return;

  try {
    // Update progress via internal API
    // Build URL differently based on environment
    let baseUrl;

    // Check if we're on Vercel
    if (process.env.VERCEL_URL) {
      // Use the Vercel deployment URL
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      // Use the configured app URL
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else {
      // Local development
      baseUrl = 'http://localhost:3000';
    }

    await fetch(`${baseUrl}/api/trending/action-plan-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        stage,
        message,
        progress
      })
    });
  } catch (error) {
    // Don't fail the main process if progress update fails
    console.warn('Failed to update progress:', error);
  }
}

export const PROGRESS_STAGES = {
  INITIALIZING: 'initializing',
  ANALYZING: 'analyzing',
  RESEARCH: 'research',
  GENERATING: 'generating',
  VALIDATING: 'validating',
  ENRICHING: 'enriching',
  COMPLETED: 'completed'
};