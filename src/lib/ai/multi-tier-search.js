/**
 * Multi-Tier Search Service
 * Perplexity (primary) → SerpAPI (fallback) → Claude Search (final fallback)
 */

import Anthropic from '@anthropic-ai/sdk';

export class MultiTierSearchService {
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.serpApiKey = process.env.SERPAPI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.anthropic = new Anthropic({ apiKey: this.anthropicApiKey });
  }

  /**
   * Main search method with automatic fallback
   */
  async search(query, options = {}) {
    const { maxResults = 10, includeContent = true } = options;

    console.log(`🔍 Multi-tier search for: "${query}"`);

    // Try Perplexity first
    try {
      console.log('📡 Attempting Perplexity search...');
      const result = await this.searchWithPerplexity(query, maxResults);
      if (result.success) {
        console.log('✅ Perplexity search successful');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Perplexity failed:', error.message);
    }

    // Fallback to SerpAPI
    try {
      console.log('📡 Attempting SerpAPI search...');
      const result = await this.searchWithSerpAPI(query, maxResults);
      if (result.success) {
        console.log('✅ SerpAPI search successful');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ SerpAPI failed:', error.message);
    }

    // Final fallback to Claude
    try {
      console.log('📡 Attempting Claude search...');
      const result = await this.searchWithClaude(query, maxResults);
      if (result.success) {
        console.log('✅ Claude search successful');
        return result;
      }
    } catch (error) {
      console.error('❌ All search methods failed:', error.message);
    }

    // All failed
    return {
      success: false,
      error: 'All search providers failed',
      results: [],
      provider: 'none'
    };
  }

  /**
   * Perplexity API Search
   */
  async searchWithPerplexity(query, maxResults = 10) {
    if (!this.perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Updated to current model name
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide comprehensive, factual information with sources.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        return_citations: true,
        return_images: false,
        search_recency_filter: 'year' // Last year of data
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Extract content and citations
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    // Transform to our standard format
    const results = citations.slice(0, maxResults).map((citation, index) => ({
      title: citation.title || `Source ${index + 1}`,
      url: citation.url || citation,
      snippet: citation.snippet || citation.text || '',
      source: citation.url ? new URL(citation.url).hostname : 'unknown',
      relevance: 1 - (index / citations.length) // Higher for earlier results
    }));

    return {
      success: true,
      provider: 'perplexity',
      query,
      summary: content,
      results,
      totalResults: results.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * SerpAPI Search
   */
  async searchWithSerpAPI(query, maxResults = 10) {
    if (!this.serpApiKey) {
      throw new Error('SerpAPI key not configured');
    }

    const params = new URLSearchParams({
      q: query,
      api_key: this.serpApiKey,
      num: maxResults,
      engine: 'google'
    });

    const response = await fetch(`https://serpapi.com/search?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SerpAPI error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Extract organic results
    const organicResults = data.organic_results || [];

    // Transform to our standard format
    const results = organicResults.slice(0, maxResults).map((result, index) => ({
      title: result.title || '',
      url: result.link || '',
      snippet: result.snippet || '',
      source: result.link ? new URL(result.link).hostname : 'unknown',
      relevance: 1 - (index / organicResults.length),
      date: result.date || null
    }));

    // Create summary from snippets
    const summary = `Search results for "${query}": ` +
      results.slice(0, 3).map(r => r.snippet).join(' ');

    return {
      success: true,
      provider: 'serpapi',
      query,
      summary,
      results,
      totalResults: data.search_information?.total_results || results.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Claude Search (using extended thinking)
   */
  async searchWithClaude(query, maxResults = 10) {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = `Research and provide comprehensive information about: "${query}"

Focus on:
1. Recent events and developments (last 12 months)
2. Specific incidents, companies, people, and dates
3. Factual, verifiable information

Provide your response in this JSON format:
{
  "summary": "Overall summary of findings",
  "results": [
    {
      "title": "Specific event or topic title",
      "snippet": "Detailed description with specifics",
      "date": "Approximate date (YYYY-MM or YYYY-MM-DD if known)",
      "entities": ["Company/Person/Location names mentioned"],
      "relevance": 0.9
    }
  ]
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Claude response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      provider: 'claude',
      query,
      summary: data.summary || content.substring(0, 500),
      results: (data.results || []).slice(0, maxResults).map(r => ({
        ...r,
        url: r.url || null,
        source: 'claude-research'
      })),
      totalResults: data.results?.length || 0,
      timestamp: new Date().toISOString(),
      note: 'Results from Claude AI research - verify independently'
    };
  }
}

// Singleton instance
let searchServiceInstance;

export function getSearchService() {
  if (!searchServiceInstance) {
    searchServiceInstance = new MultiTierSearchService();
  }
  return searchServiceInstance;
}

// Convenience function
export async function performMultiTierSearch(query, options) {
  const service = getSearchService();
  return service.search(query, options);
}
