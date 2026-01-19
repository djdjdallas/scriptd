/**
 * Voice Analysis Caching Layer
 * Reduces redundant YouTube API and Claude AI calls by caching voice analysis results
 *
 * Cache lookup order:
 * 1. Check voice_profiles table (existing trained profiles)
 * 2. Check voice_analysis_cache table (cached analysis results)
 * 3. Fall back to fresh analysis if both miss
 */

import { createClient } from '@/lib/supabase/server';

// Cache configuration
const CACHE_CONFIG = {
  TTL_HOURS: 24,           // Default TTL for full analyses
  TTL_HOURS_PARTIAL: 6,    // Shorter TTL for metadata-only/partial analyses
  VERSION: '1.0.0',        // Increment when analysis algorithm changes
  TABLE: 'voice_analysis_cache'
};

/**
 * Get cached voice analysis for a channel
 * Checks voice_profiles table first, then dedicated cache table
 *
 * @param {string} channelId - YouTube channel ID (UCxxxx format)
 * @param {Object} options - Cache options
 * @param {boolean} options.forceRefresh - Bypass cache entirely
 * @param {number} options.maxAgeHours - Max cache age (default: 24)
 * @returns {Object|null} Cached analysis or null if not found/expired
 */
export async function getCachedVoiceAnalysis(channelId, options = {}) {
  const { forceRefresh = false, maxAgeHours = CACHE_CONFIG.TTL_HOURS } = options;

  if (forceRefresh) {
    console.log(`[Voice Cache] Force refresh requested for ${channelId}`);
    return null;
  }

  if (!channelId) {
    console.log('[Voice Cache] No channel ID provided');
    return null;
  }

  try {
    const supabase = await createClient();

    // First, check dedicated cache table
    const { data: cached, error: cacheError } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .select('*')
      .eq('channel_id', channelId)
      .single();

    if (!cacheError && cached) {
      // Check if expired using expires_at field
      if (new Date(cached.expires_at) > new Date()) {
        // Check version compatibility
        if (cached.version === CACHE_CONFIG.VERSION) {
          console.log(`[Voice Cache] HIT from cache table for ${channelId}`);

          // Update access count and last accessed time
          await supabase
            .from(CACHE_CONFIG.TABLE)
            .update({
              access_count: (cached.access_count || 0) + 1,
              last_accessed_at: new Date().toISOString()
            })
            .eq('channel_id', channelId);

          return {
            source: 'cache_table',
            data: cached.analysis_data,
            metadata: cached.metadata,
            cachedAt: cached.cached_at,
            age: getCacheAge(cached.cached_at),
            version: cached.version
          };
        } else {
          console.log(`[Voice Cache] Version mismatch for ${channelId} (cached: ${cached.version}, current: ${CACHE_CONFIG.VERSION})`);
        }
      } else {
        console.log(`[Voice Cache] Expired entry for ${channelId}`);
      }
    }

    console.log(`[Voice Cache] MISS for ${channelId}`);
    return null;

  } catch (error) {
    console.error('[Voice Cache] Error reading cache:', error.message);
    return null;
  }
}

/**
 * Store voice analysis in cache
 *
 * @param {string} channelId - YouTube channel ID (UCxxxx format)
 * @param {Object} analysis - Voice analysis data to cache
 * @param {Object} metadata - Additional metadata about the analysis
 * @param {string} metadata.source - Analysis source (youtube-transcripts, hybrid-analysis, enhanced-metadata)
 * @param {number} metadata.videosAnalyzed - Number of videos analyzed
 * @param {number} metadata.transcriptsAnalyzed - Number of transcripts used
 * @param {string} metadata.channelName - Channel name for logging
 */
export async function setCachedVoiceAnalysis(channelId, analysis, metadata = {}) {
  if (!channelId || !analysis) {
    console.warn('[Voice Cache] Cannot cache: missing channelId or analysis');
    return;
  }

  try {
    const supabase = await createClient();

    // Use shorter TTL for partial/metadata-only analyses (lower confidence)
    const isPartialAnalysis = metadata.source === 'enhanced-metadata' ||
                              metadata.source === 'hybrid-analysis' ||
                              (metadata.transcriptsAnalyzed || 0) < 5;

    const ttlHours = isPartialAnalysis ? CACHE_CONFIG.TTL_HOURS_PARTIAL : CACHE_CONFIG.TTL_HOURS;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

    const cacheEntry = {
      channel_id: channelId,
      analysis_data: analysis,
      metadata: {
        ...metadata,
        cachedAt: new Date().toISOString(),
        ttlHours
      },
      version: CACHE_CONFIG.VERSION,
      cached_at: new Date().toISOString(),
      expires_at: expiresAt,
      access_count: 0,
      last_accessed_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .upsert(cacheEntry, { onConflict: 'channel_id' });

    if (error) {
      console.error('[Voice Cache] Failed to cache analysis:', error.message);
    } else {
      console.log(`[Voice Cache] Stored analysis for ${channelId} (TTL: ${ttlHours}h, source: ${metadata.source || 'unknown'})`);
    }
  } catch (error) {
    console.error('[Voice Cache] Error storing cache:', error.message);
  }
}

/**
 * Invalidate cache for a specific channel
 * Call this when user requests a fresh analysis
 *
 * @param {string} channelId - YouTube channel ID to invalidate
 */
export async function invalidateVoiceCache(channelId) {
  if (!channelId) {
    return;
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .delete()
      .eq('channel_id', channelId);

    if (error) {
      console.error('[Voice Cache] Error invalidating cache:', error.message);
    } else {
      console.log(`[Voice Cache] Invalidated cache for ${channelId}`);
    }
  } catch (error) {
    console.error('[Voice Cache] Error invalidating cache:', error.message);
  }
}

/**
 * Invalidate all cache entries (use with caution)
 * Useful when analysis algorithm changes significantly
 */
export async function invalidateAllVoiceCache() {
  try {
    const supabase = await createClient();

    const { error, count } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .delete()
      .neq('channel_id', ''); // Delete all rows

    if (error) {
      console.error('[Voice Cache] Error clearing cache:', error.message);
    } else {
      console.log(`[Voice Cache] Cleared all cache entries`);
    }
  } catch (error) {
    console.error('[Voice Cache] Error clearing cache:', error.message);
  }
}

/**
 * Get cache age in human-readable format
 *
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Human-readable age (e.g., "2 hours", "1 day")
 */
function getCacheAge(timestamp) {
  if (!timestamp) return 'unknown';

  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageMinutes = Math.round(ageMs / (1000 * 60));
  const ageHours = Math.round(ageMs / (1000 * 60 * 60));
  const ageDays = Math.round(ageHours / 24);

  if (ageMinutes < 1) return 'just now';
  if (ageMinutes < 60) return `${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''}`;
  if (ageHours < 24) return `${ageHours} hour${ageHours !== 1 ? 's' : ''}`;
  return `${ageDays} day${ageDays !== 1 ? 's' : ''}`;
}

/**
 * Get cache statistics for monitoring
 *
 * @returns {Object} Cache statistics
 */
export async function getCacheStats() {
  try {
    const supabase = await createClient();

    // Get total entries
    const { count: totalEntries, error: countError } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Get valid (non-expired) entries
    const { count: validEntries, error: validError } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .select('*', { count: 'exact', head: true })
      .gte('expires_at', new Date().toISOString());

    if (validError) {
      throw validError;
    }

    // Get entries by source
    const { data: sourceData, error: sourceError } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .select('metadata');

    const sourceBreakdown = {};
    if (!sourceError && sourceData) {
      sourceData.forEach(entry => {
        const source = entry.metadata?.source || 'unknown';
        sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
      });
    }

    return {
      totalEntries: totalEntries || 0,
      validEntries: validEntries || 0,
      expiredEntries: (totalEntries || 0) - (validEntries || 0),
      sourceBreakdown,
      ttlHours: CACHE_CONFIG.TTL_HOURS,
      ttlHoursPartial: CACHE_CONFIG.TTL_HOURS_PARTIAL,
      version: CACHE_CONFIG.VERSION
    };
  } catch (error) {
    console.error('[Voice Cache] Error getting stats:', error.message);
    return {
      error: error.message,
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      ttlHours: CACHE_CONFIG.TTL_HOURS,
      version: CACHE_CONFIG.VERSION
    };
  }
}

/**
 * Clean up expired cache entries
 * Can be called periodically or via a cron job
 */
export async function cleanupExpiredCache() {
  try {
    const supabase = await createClient();

    const { error, count } = await supabase
      .from(CACHE_CONFIG.TABLE)
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('[Voice Cache] Error cleaning up expired entries:', error.message);
    } else {
      console.log(`[Voice Cache] Cleaned up expired entries`);
    }
  } catch (error) {
    console.error('[Voice Cache] Error cleaning up:', error.message);
  }
}

export { CACHE_CONFIG };
