import { isValidAndFetchableUrl } from './utils/url-validator.js';

/**
 * ContentFetcher - ONLY for uploaded documents, NOT for web sources
 * Web sources are now fetched directly by Claude during research
 *
 * @deprecated for web sources - Use Claude ResearchService instead
 */
export class ContentFetcher {
  constructor(maxCharsPerSource = 1500) {
    this.maxChars = maxCharsPerSource;
  }

  async enrichSources(sources) {
    const sourcesToFetch = sources.filter(
      s => !s.source_content || s.source_content.length < 100
    );

    if (sourcesToFetch.length === 0) {
      return sources;
    }

    const contentPromises = sourcesToFetch.map(source => {
      // CRITICAL FIX: Use source_url instead of url
      const url = source.source_url || source.url;

      // Validate URL before attempting to fetch
      const validation = isValidAndFetchableUrl(url);
      if (!validation.valid) {
        return Promise.resolve({
          skipped: true,
          content: '',
          message: validation.reason
        });
      }

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
        return enrichedSource;
      }

      return {
        ...source,
        fetch_status: 'failed',
        fetch_error: result.reason?.message || 'Unknown error'
      };
    });

    return enriched;
  }

  async fetchWithRetry(url, retries = 2) {
    // Early validation
    if (!url) {
      throw new Error('URL is required for content fetching');
    }

    // Skip special URLs
    if (url.startsWith('#')) {
      return { content: '', skipped: true, message: 'Internal reference - no fetch needed' };
    }

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {

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
          } catch {
            errorBody = 'Unable to read error response';
          }

          throw new Error(`HTTP ${response.status}: ${errorBody.substring(0, 200)}`);
        }

        const data = await response.json();

        if (data.success || data.content) {
          return data;
        }

        throw new Error(data.message || 'No content returned');

      } catch (error) {
        lastError = error;

        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout for ${url}`);
        }

        if (attempt < retries) {
          const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

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

    return verification.sources;
  }

  /**
   * Process uploaded documents (PDFs, DOCX, TXT, etc.)
   * This is the primary use case for ContentFetcher now
   * @param {Array} documents - Array of document objects with file paths
   * @returns {Array} Documents with extracted content
   */
  async processUploadedDocuments(documents) {
    // For now, just pass through to enrichSources
    // In the future, this would handle PDF extraction, DOCX parsing, etc.
    return this.enrichSources(documents);
  }

  /**
   * @deprecated Use Claude ResearchService for web sources
   * This method should only be used for document processing
   */
  async enrichWebSources(sources) {
    console.error('❌ DEPRECATED: enrichWebSources should not be used');
    console.error('Use Claude ResearchService for web content fetching instead');
    return sources;
  }
}