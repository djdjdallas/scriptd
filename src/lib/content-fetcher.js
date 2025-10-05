import { isValidAndFetchableUrl } from './utils/url-validator.js';

export class ContentFetcher {
  constructor(maxCharsPerSource = 1500) {
    this.maxChars = maxCharsPerSource;
  }

  async enrichSources(sources) {
    const sourcesToFetch = sources.filter(
      s => !s.source_content || s.source_content.length < 100
    );

    if (sourcesToFetch.length === 0) {
      console.log('✅ All sources already have content');
      return sources;
    }

    console.log(`📥 Fetching content for ${sourcesToFetch.length}/${sources.length} sources`);

    const contentPromises = sourcesToFetch.map(source => {
      // CRITICAL FIX: Use source_url instead of url
      const url = source.source_url || source.url;

      // Validate URL before attempting to fetch
      const validation = isValidAndFetchableUrl(url);
      if (!validation.valid) {
        console.log(`⏭️ Skipping unfetchable URL: ${url} - ${validation.reason}`);
        return Promise.resolve({
          skipped: true,
          content: '',
          message: validation.reason
        });
      }

      console.log(`🔍 Preparing to fetch valid URL: ${url}`);
      return this.fetchWithRetry(url, 2);
    });

    const results = await Promise.allSettled(contentPromises);

    let fetchedCount = 0;
    const enriched = sources.map(source => {
      const needsFetch = !source.source_content ||
                        source.source_content.length < 100;

      if (!needsFetch) return source;

      const result = results[fetchedCount++];
      const url = source.source_url || source.url;

      if (result.status === 'fulfilled' && result.value?.content) {
        const enrichedSource = {
          ...source,
          source_content: result.value.content.substring(0, this.maxChars),
          fetch_status: result.value.partial ? 'partial' : 'complete'
        };
        console.log(`✅ Enriched: ${url?.substring(0, 50)}... (${result.value.content.length} chars)`);
        return enrichedSource;
      }

      console.warn(`⚠️ Failed to fetch: ${url}`,
        result.status === 'rejected' ? result.reason : 'No content');
      return {
        ...source,
        fetch_status: 'failed',
        fetch_error: result.reason?.message || 'Unknown error'
      };
    });

    const stats = this.getEnrichmentStats(enriched);
    console.log(`📊 Enrichment stats:`, stats);

    if (stats.totalContentSize > 15000) {
      console.warn('⚠️ Large context detected, may impact AI performance');
    }

    return enriched;
  }

  async fetchWithRetry(url, retries = 2) {
    // Early validation
    if (!url) {
      console.error('❌ No URL provided to fetchWithRetry');
      throw new Error('URL is required for content fetching');
    }

    // Skip special URLs
    if (url.startsWith('#')) {
      console.log(`⏭️ Skipping special URL: ${url}`);
      return { content: '', skipped: true, message: 'Internal reference - no fetch needed' };
    }

    console.log(`🔍 Starting fetch for: ${url}`);
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`📡 Attempt ${attempt + 1}/${retries + 1} for: ${url}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        // Use absolute URL in server context, relative in client
        const fetchUrl = typeof window === 'undefined'
          ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fetch-content`
          : '/api/fetch-content';

        const response = await fetch(fetchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          // Get error details for better debugging
          let errorBody = '';
          try {
            errorBody = await response.text();
          } catch (e) {
            errorBody = 'Unable to read error response';
          }

          console.error(`❌ HTTP ${response.status} for ${url}:`, {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorBody.substring(0, 500),
            attempt: attempt + 1
          });

          throw new Error(`HTTP ${response.status}: ${errorBody.substring(0, 200)}`);
        }

        const data = await response.json();

        if (data.success || data.content) {
          console.log(`✅ Successfully fetched ${url}: ${data.content?.length || 0} chars`);
          return data;
        }

        console.warn(`⚠️ No content returned for ${url}:`, data.message);
        throw new Error(data.message || 'No content returned');

      } catch (error) {
        lastError = error;

        if (error.name === 'AbortError') {
          console.error(`⏱️ Timeout for ${url} after 10 seconds`);
          lastError = new Error(`Request timeout for ${url}`);
        } else {
          console.error(`❌ Fetch error for ${url}:`, {
            name: error.name,
            message: error.message,
            attempt: attempt + 1
          });
        }

        if (attempt < retries) {
          const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 2}/${retries + 1} for ${url}`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    console.error(`❌ All attempts failed for ${url}:`, lastError.message);
    throw lastError;
  }

  getEnrichmentStats(sources) {
    const successful = sources.filter(s => 
      s.source_content && s.source_content.length > 100
    );
    
    const partial = sources.filter(s => s.fetch_status === 'partial');
    const failed = sources.filter(s => s.fetch_status === 'failed');
    
    const totalContentSize = sources.reduce(
      (sum, s) => sum + (s.source_content?.length || 0), 0
    );
    
    return {
      total: sources.length,
      successful: successful.length,
      partial: partial.length,
      failed: failed.length,
      totalContentSize,
      averageContentSize: successful.length > 0 
        ? Math.round(totalContentSize / successful.length) 
        : 0
    };
  }

  async verifyDatabaseUpdate(supabase, researchId) {
    const { data: verification, error: verifyError } = await supabase
      .from('script_research')
      .select('sources')
      .eq('id', researchId)
      .single();

    if (verifyError || !verification) {
      throw new Error(`Failed to verify content update: ${verifyError?.message}`);
    }

    const stats = this.getEnrichmentStats(verification.sources);
    console.log('✅ Database update verified:', stats);
    
    return verification.sources;
  }
}