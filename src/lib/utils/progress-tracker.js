/**
 * Utility to track progress for action plan generation
 * Uses in-memory cache to avoid server-to-server fetch issues on Vercel
 */

// In-memory progress cache (persists for the lifetime of the serverless function)
const progressCache = new Map();

export async function updateProgress(sessionId, stage, message, progress) {
  if (!sessionId) return;

  try {
    // Store in memory cache
    progressCache.set(sessionId, {
      stage,
      message,
      progress,
      timestamp: Date.now()
    });

    // Clean up old sessions (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, value] of progressCache.entries()) {
      if (value.timestamp < fiveMinutesAgo) {
        progressCache.delete(key);
      }
    }

  } catch (error) {
    // Don't fail the main process if progress update fails
    console.warn('Failed to update progress:', error);
  }
}

export function getProgress(sessionId) {
  return progressCache.get(sessionId) || null;
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