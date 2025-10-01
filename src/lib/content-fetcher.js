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

    const contentPromises = sourcesToFetch.map(source => 
      this.fetchWithRetry(source.url, 2)
    );

    const results = await Promise.allSettled(contentPromises);

    let fetchedCount = 0;
    const enriched = sources.map(source => {
      const needsFetch = !source.source_content || 
                        source.source_content.length < 100;
      
      if (!needsFetch) return source;

      const result = results[fetchedCount++];
      
      if (result.status === 'fulfilled' && result.value?.content) {
        const enrichedSource = {
          ...source,
          source_content: result.value.content.substring(0, this.maxChars),
          fetch_status: result.value.partial ? 'partial' : 'complete'
        };
        console.log(`✅ Enriched: ${source.url.substring(0, 50)}... (${result.value.content.length} chars)`);
        return enrichedSource;
      }

      console.warn(`⚠️ Failed to fetch: ${source.url}`, 
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
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('/api/fetch-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.content) {
          return data;
        }
        
        throw new Error(data.message || 'No content returned');
        
      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          lastError = new Error('Request timeout');
        }
        
        if (attempt < retries) {
          const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
          console.log(`🔄 Retry ${attempt + 1}/${retries} for ${url} after ${delay}ms`);
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

    const stats = this.getEnrichmentStats(verification.sources);
    console.log('✅ Database update verified:', stats);
    
    return verification.sources;
  }
}