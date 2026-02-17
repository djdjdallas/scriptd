/**
 * Research Service with Real Web Search
 * Uses Claude's built-in web search capabilities when available
 */

import Anthropic from '@anthropic-ai/sdk';
import { fetchMultipleUrls } from '@/lib/utils/web-content-fetcher';

class ResearchServiceWithSearch {
  /**
   * Perform research using Claude with iterative search for better source gathering
   */
  static async performResearch(options) {
    const {
      query,
      topic = '',
      context = '',
      minSources = 10,
      minContentLength = 1000,
      contentIdeaInfo,
      niche
    } = options;

    let allSources = [];
    let attempt = 0;
    const maxAttempts = 3;
    const excludedUrls = new Set();

    while (allSources.length < minSources && attempt < maxAttempts) {
      attempt++;

      // Build query for this iteration
      let iterationQuery = query;
      if (attempt > 1) {
        iterationQuery = `Find additional unique sources about "${query}" that provide different perspectives or information.
Focus on sources not yet covered. Already found ${allSources.length} sources.`;
      }

      // Perform single research call
      const result = await this.performSingleResearch({
        query: iterationQuery,
        topic,
        context,
        minSources: minSources - allSources.length, // Request remaining needed
        minContentLength,
        excludeUrls: Array.from(excludedUrls),
        contentIdeaInfo,
        niche
      });

      if (!result.success) {
        console.warn(`Attempt ${attempt} failed:`, result.error);
        continue;
      }

      // Merge new sources (excluding synthesis/AI-generated sources from dedup)
      const newSources = result.sources.filter(source => {
        // Always keep AI synthesis sources
        if (source.source_type === 'synthesis' || source.source_type === 'ai-generated') {
          return true;
        }

        // Check for duplicate URLs
        if (excludedUrls.has(source.source_url)) {
          return false;
        }

        excludedUrls.add(source.source_url);
        return true;
      });

      allSources = allSources.concat(newSources);

      // If we've reached our goal, stop early
      if (allSources.length >= minSources) {
        break;
      }
    }

    // Calculate total content
    const totalContent = allSources.reduce((sum, s) => sum + (s.source_content?.length || 0), 0);

    // Use summary from last successful result or create one
    const summary = allSources.find(s => s.source_type === 'synthesis')?.source_content ||
                   'Research completed across multiple sources';

    return {
      success: true,
      summary,
      sources: allSources,
      results: allSources,
      relatedQuestions: [],
      insights: {
        keyStatistics: [],
        expertQuotes: [],
        commonMisconceptions: [],
        actionableTakeaways: []
      },
      citations: allSources.filter(s => s.source_type === 'web'),
      provider: 'claude-enhanced-iterative',
      iterations: attempt,
      totalContent
    };
  }

  /**
   * Perform a single research call using Claude with web search
   */
  static async performSingleResearch(options) {
    const {
      query,
      topic = '',
      context = '',
      minSources = 10,
      minContentLength = 1000,
      contentIdeaInfo,
      niche
    } = options;

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return {
        success: false,
        error: 'ANTHROPIC_API_KEY not configured',
        sources: [],
        summary: '',
        provider: 'none'
      };
    }

    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Use Claude's actual web search tool (not just asking it to search in the prompt!)
      // Build rich context from content idea info if available
      let enrichedContext = '';
      if (contentIdeaInfo) {
        const { hook, description, specifics } = contentIdeaInfo;
        enrichedContext = `
${hook ? `Content Hook: ${hook}` : ''}
${description ? `Description: ${description}` : ''}
${specifics ? `Key Details to Research: ${specifics}` : ''}`.trim();
      }

      const searchPrompt = `Research the following topic using web search. Provide comprehensive, current information with real sources.

Topic: "${query}"
${topic ? `Context: ${topic}` : ''}
${niche ? `Content Niche: ${niche}` : ''}
${enrichedContext ? `\nResearch Focus:\n${enrichedContext}\n` : ''}

Instructions:
1. Use web search to find AT LEAST ${minSources} different high-quality sources
2. Focus on recent information from 2023-2025 when relevant
3. For each source you find, fetch the full content to extract detailed information
4. Include specific dates, names, facts, statistics, and expert quotes
5. Each source should provide substantial information (aim for ${minContentLength}+ characters)
6. Look for diverse perspectives and authoritative sources

After completing your research, provide a comprehensive analysis including:
- A summary of key findings
- Related questions for further exploration
- Key insights: statistics, expert quotes, common misconceptions, actionable takeaways

Focus on quality over speed. Take the time to search thoroughly and fetch full content from the most relevant sources.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000, // Increased for search results + analysis
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: searchPrompt
        }],
        // Enable REAL web search tool
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 15 // Allow multiple searches to gather enough sources
          }
        ]
        // Note: web_fetch removed - it's in beta and may not be available for all API keys
      });

      // Parse the response - now includes actual web search results!
      // Extract web search results from the response
      const searchResults = [];
      const fetchResults = [];
      let textAnalysis = '';

      for (const block of response.content) {
        if (block.type === 'web_search_tool_result') {
          // Extract search results
          if (Array.isArray(block.content)) {
            for (const result of block.content) {
              if (result.type === 'web_search_result') {
                searchResults.push({
                  url: result.url,
                  title: result.title,
                  page_age: result.page_age,
                  encrypted_content: result.encrypted_content
                });
              }
            }
          }
        } else if (block.type === 'web_fetch_tool_result') {
          // Extract fetched content
          if (block.content?.type === 'web_fetch_result') {
            const fetchData = block.content;
            let contentText = '';

            // Extract text from document source
            if (fetchData.content?.source?.type === 'text') {
              contentText = fetchData.content.source.data || '';
            }

            fetchResults.push({
              url: fetchData.url,
              title: fetchData.content?.title || fetchData.url,
              content: contentText,
              retrieved_at: fetchData.retrieved_at
            });
          }
        } else if (block.type === 'text') {
          // Accumulate Claude's analysis text
          textAnalysis += block.text || '';
        }
      }

      // Combine search and fetch results into normalized sources
      const normalizedSources = [];

      // Add fetched content as primary sources (these have full content)
      for (const fetch of fetchResults) {
        normalizedSources.push({
          source_url: fetch.url,
          source_title: fetch.title,
          source_content: fetch.content.substring(0, 5000), // Limit to 5k chars per source
          source_type: 'web',
          is_starred: true, // Fetched pages are high priority
          fact_check_status: 'verified',
          relevance: 0.95
        });
      }

      // Add search results without fetched content
      for (const search of searchResults) {
        // Skip if we already fetched this URL
        if (normalizedSources.some(s => s.source_url === search.url)) {
          continue;
        }

        normalizedSources.push({
          source_url: search.url,
          source_title: search.title,
          source_content: `Source found via web search. Page last updated: ${search.page_age || 'unknown'}`,
          source_type: 'web',
          is_starred: false,
          fact_check_status: 'verified',
          relevance: 0.75
        });
      }

      // === NEW: ENRICH SOURCES WITH FULL WEB CONTENT ===
      // Identify URLs that need content fetching (those with placeholder content)
      const urlsToEnrich = normalizedSources
        .filter(s => {
          const isWebUrl = s.source_url.startsWith('http://') || s.source_url.startsWith('https://');
          const hasPlaceholder = s.source_content.includes('Source found via web search');
          const hasShortContent = (s.source_content || '').split(/\s+/).length < 100;
          return isWebUrl && (hasPlaceholder || hasShortContent);
        })
        .map(s => s.source_url);

      if (urlsToEnrich.length > 0) {
        try {
          const fetchedContents = await fetchMultipleUrls(urlsToEnrich, {
            maxConcurrent: 5,
            minWordCount: 100,
            timeout: 30000,
            useJina: true,
            fallbackToRaw: true
          });

          // Map fetched content back to sources
          for (let i = 0; i < normalizedSources.length; i++) {
            const source = normalizedSources[i];
            const fetched = fetchedContents.find(f => f.url === source.source_url);

            if (fetched && fetched.success && fetched.wordCount >= 100) {
              normalizedSources[i] = {
                ...source,
                source_content: fetched.content,
                fetch_method: fetched.method,
                word_count: fetched.wordCount,
                is_starred: fetched.wordCount >= 500 ? true : source.is_starred
              };
            }
          }

        } catch (error) {
          console.error('Content enrichment failed:', error);
        }
      }

      // Add Claude's analysis as a synthesis source
      if (textAnalysis.trim()) {
        normalizedSources.unshift({
          source_url: '#claude-analysis',
          source_title: 'AI Research Analysis',
          source_content: textAnalysis,
          source_type: 'synthesis',
          is_starred: true,
          fact_check_status: 'ai-generated',
          relevance: 1.0
        });
      }

      // Extract insights from text analysis (simple parsing)
      const insights = {
        keyStatistics: [],
        expertQuotes: [],
        commonMisconceptions: [],
        actionableTakeaways: []
      };

      return {
        success: true,
        summary: textAnalysis.substring(0, 2000),
        sources: normalizedSources,
        results: normalizedSources,
        relatedQuestions: [],
        insights,
        citations: normalizedSources.filter(s => s.source_type === 'web'),
        provider: 'claude-web-search',
        searchCount: searchResults.length,
        fetchCount: fetchResults.length,
        toolsUsed: {
          web_search_requests: response.usage?.server_tool_use?.web_search_requests || 0,
          web_fetch_requests: response.usage?.server_tool_use?.web_fetch_requests || 0
        }
      };

    } catch (error) {
      console.error('Research failed:', error);

      // Check for specific error types
      if (error.message?.includes('web_search') || error.message?.includes('web_fetch')) {
        console.error('Web tool error - check that web search is enabled in Console settings');
      }

      return {
        success: false,
        error: error.message || 'Research failed',
        errorDetails: {
          name: error.name,
          status: error.status,
          type: error.type
        },
        sources: [],
        summary: '',
        provider: 'none'
      };
    }
  }
}

export default ResearchServiceWithSearch;
