/**
 * Intelligent Research System
 * Generalized research that works for ANY topic without hardcoding
 */

import Anthropic from '@anthropic-ai/sdk';
import { fetchMultipleUrls } from '@/lib/utils/web-content-fetcher';

/**
 * Extracts key entities and facts from a research topic to create targeted searches
 * @param {string} topic - The research topic
 * @returns {Promise<Object>} Extracted entities and search strategies
 */
export async function extractSearchableEntities(topic) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const extractionPrompt = `Analyze this research topic and extract key searchable entities:

"${topic}"

Identify:
1. **People**: Names of individuals mentioned (if any)
2. **Organizations**: Companies, teams, institutions mentioned
3. **Specific Events**: Particular incidents, cases, or events
4. **Amounts/Numbers**: Specific figures mentioned (money, quantities, etc.)
5. **Locations**: Places, cities, states mentioned
6. **Time References**: Years, dates, timeframes mentioned
7. **Key Concepts**: Main topics or themes

Return as JSON (no markdown, just raw JSON):
{
  "primarySubject": "Main topic in 2-4 words",
  "entities": {
    "people": ["person1", "person2"],
    "organizations": ["org1", "org2"],
    "events": ["event1"],
    "amounts": ["$22 million", "22M"],
    "locations": ["location1"],
    "timeframes": ["2024", "March 2024"],
    "concepts": ["embezzlement", "fraud"]
  },
  "searchStrategies": {
    "specific": "Search for the exact case/event",
    "contextual": "Search for background information",
    "comparative": "Search for similar cases/events"
  }
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: extractionPrompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn('Could not extract JSON from entity extraction response');
      return null;
    }

    const entities = JSON.parse(jsonMatch[0]);

    return entities;
  } catch (error) {
    console.error('Entity extraction failed:', error.message);
    return null;
  }
}

/**
 * Generates targeted search queries based on extracted entities
 * @param {Object} extractedData - Data from extractSearchableEntities
 * @returns {Array} Array of search query objects
 */
export function generateSearchQueries(extractedData) {
  const queries = [];
  const { entities, primarySubject } = extractedData;

  // Strategy 1: Combine all specific entities for exact match (no quotes for less restrictive search)
  if (entities.people?.length > 0 && entities.organizations?.length > 0) {
    const person = entities.people[0];
    const org = entities.organizations[0];
    const amount = entities.amounts?.[0] || '';

    queries.push({
      query: `${person} ${org} ${amount}`.trim(),
      type: 'exact',
      target: 'Find the specific case/story'
    });
  }

  // Strategy 2: Event + Organization + Timeframe
  if (entities.events?.length > 0 && entities.organizations?.length > 0) {
    const event = entities.events[0];
    const org = entities.organizations[0];
    const timeframe = entities.timeframes?.[0] || '';

    queries.push({
      query: `${event} ${org} ${timeframe}`.trim(),
      type: 'event-based',
      target: 'Find news about the specific event'
    });
  }

  // Strategy 3: Add date constraints if we have timeframes
  if (entities.timeframes?.length > 0) {
    const year = entities.timeframes[0].match(/\d{4}/)?.[0];
    if (year) {
      queries.push({
        query: `${primarySubject} after:${parseInt(year) - 1}-01-01 before:${parseInt(year) + 1}-12-31`,
        type: 'time-bounded',
        target: 'Find content from relevant time period'
      });
    }
  }

  // Strategy 4: Main concepts without names (for when entity extraction fails)
  if (entities.concepts?.length > 0) {
    const mainConcept = entities.concepts.slice(0, 2).join(' ');
    queries.push({
      query: `${mainConcept} ${entities.organizations?.[0] || ''} case details`.trim(),
      type: 'concept-based',
      target: 'Find general information about the topic'
    });
  }

  // Strategy 5: Alternative search without quotes (sometimes quotes are too restrictive)
  if (entities.people?.length > 0) {
    queries.push({
      query: `${entities.people[0]} ${primarySubject}`.trim(),
      type: 'flexible',
      target: 'Broader search without strict matching'
    });
  }

  // Strategy 6: Pure topic search as fallback
  queries.push({
    query: primarySubject,
    type: 'fallback',
    target: 'Broad search on main topic'
  });

  return queries;
}

/**
 * Performs a single search using Claude's REAL web search tool
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of source objects
 */
async function performSearch(query) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Correct Sonnet 4.5 model
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: `Research this topic using web search: "${query}"

Find 3-5 highly relevant sources. For each source you find, fetch the full content to extract detailed information.

Provide comprehensive information from each source including specific facts, statistics, dates, and quotes.`
      }],
      // Enable REAL web search tool
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
      // Note: web_fetch removed - it's in beta and may not be available for all API keys
    });

    // Parse the response - extract web search and fetch results
    const sources = parseWebSearchResults(message.content, query);

    return sources;
  } catch (error) {
    console.error(`Search error: ${error.message}`);
    return [];
  }
}

/**
 * Parses search results from Claude's response
 * @param {string} responseText - Claude's response
 * @param {string} query - Original query
 * @returns {Array} Parsed sources
 */
function parseSearchResults(responseText, query) {
  const sources = [];

  try {
    const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const urls = [...new Set(responseText.match(urlPattern) || [])];

    for (const url of urls.slice(0, 5)) {
      const urlIndex = responseText.indexOf(url);

      // Extract title (look backwards from URL)
      const beforeUrl = responseText.substring(Math.max(0, urlIndex - 200), urlIndex);
      const titleMatch = beforeUrl.match(/(?:Title|Source|Page):\s*(.+?)(?:\n|$)/i) ||
                         beforeUrl.match(/\d+\.\s*(.+?)(?:\n|http)/i) ||
                         beforeUrl.match(/\*\*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1].trim() : 'Research Source';

      // Extract content (look forwards from URL)
      const afterUrl = responseText.substring(urlIndex, Math.min(responseText.length, urlIndex + 2000));
      const contentMatch = afterUrl.match(/(?:Content|Extract|Summary):\s*([\s\S]+?)(?=\n\n(?:URL|Source|\d+\.)|$)/i);
      let content = contentMatch ? contentMatch[1].trim() : afterUrl.substring(0, 1000);

      // Clean up content
      content = content
        .replace(/^[\s\n]+|[\s\n]+$/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/https?:\/\/[^\s]+/g, '');

      if (content.length < 100) {
        continue;
      }

      sources.push({
        id: crypto.randomUUID(),
        source_url: url.replace(/[<>"{}|\\^`\[\]]/g, ''),
        source_type: 'web',
        source_title: title.substring(0, 200),
        source_content: content,
        relevance: 0.85,
        is_starred: false,
        fact_check_status: 'verified',
        search_query: query
      });
    }
  } catch (error) {
    console.error('Error parsing search results:', error);
  }

  return sources;
}

/**
 * Parses web search results from Claude's response content blocks
 * @param {Array} contentBlocks - Claude's response content blocks
 * @param {string} query - Original query
 * @returns {Array} Parsed sources
 */
function parseWebSearchResults(contentBlocks, query) {
  const sources = [];
  const searchResults = [];
  const fetchResults = [];

  try {
    // Extract web search and fetch results from content blocks
    for (const block of contentBlocks) {
      if (block.type === 'web_search_tool_result') {
        // Extract search results
        if (Array.isArray(block.content)) {
          for (const result of block.content) {
            if (result.type === 'web_search_result') {
              searchResults.push({
                url: result.url,
                title: result.title,
                page_age: result.page_age
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
            content: contentText
          });
        }
      }
    }

    // Add fetched content as sources (priority - has full content)
    for (const fetch of fetchResults) {
      sources.push({
        id: crypto.randomUUID(),
        source_url: fetch.url,
        source_type: 'web',
        source_title: fetch.title,
        source_content: fetch.content.substring(0, 3000), // Limit to 3k chars
        relevance: 0.9,
        is_starred: true, // Fetched content is high priority
        fact_check_status: 'verified',
        search_query: query
      });
    }

    // Add search results without fetched content
    for (const search of searchResults) {
      // Skip if already fetched
      if (sources.some(s => s.source_url === search.url)) {
        continue;
      }

      sources.push({
        id: crypto.randomUUID(),
        source_url: search.url,
        source_type: 'web',
        source_title: search.title,
        source_content: `Source found via web search. Page last updated: ${search.page_age || 'unknown'}`,
        relevance: 0.75,
        is_starred: false,
        fact_check_status: 'verified',
        search_query: query
      });
    }

  } catch (error) {
    console.error('Error parsing web search results:', error);
  }

  return sources;
}

/**
 * Expands research with contextual information based on what we found
 * @param {Object} entities - Extracted entities
 * @param {Array} primarySources - Primary research sources
 * @param {number} targetDuration - Target duration in minutes
 * @returns {Promise<Array>} Expanded sources
 */
async function expandResearch(entities, primarySources, targetDuration) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const expansionPrompt = `Based on this research topic and what we found, identify knowledge gaps:

Primary Subject: ${entities.primarySubject}
Key Entities: ${JSON.stringify(entities.entities, null, 2)}

Existing Sources: ${primarySources.slice(0, 3).map(s => s.source_title).join(', ')}

Generate 5-6 expansion searches that provide CONTEXT, not more of the same story.
Focus on:
- Technical/system explanations (how things mentioned actually work)
- Legal/regulatory frameworks (laws, regulations involved)
- Psychological/behavioral context (why this happens)
- Historical comparisons (similar past cases)
- Prevention/solutions (how to avoid this)
- Impact analysis (consequences and aftermath)

Return ONLY a JSON array of search queries:
[
  {
    "query": "specific search query without entity names",
    "category": "technical|legal|psychological|historical|prevention|impact",
    "target": "What this will find"
  }
]

IMPORTANT: Each query should find DIFFERENT types of information, not more articles about the same event.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: expansionPrompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.error('Failed to generate expansion queries');
      return [];
    }

    const expansionQueries = JSON.parse(jsonMatch[0]);
    const expandedSources = [];

    // Import ResearchService for Perplexity searches
    const { default: ResearchService } = await import('./research-service.js');

    for (let i = 0; i < expansionQueries.slice(0, 6).length; i++) {
      const query = expansionQueries[i];
      try {
        // Use Perplexity instead of Claude's performSearch
        const result = await ResearchService.performPerplexitySearch({
          query: query.query,
          topic: query.target,
          context: '',
          minSources: 2,
          recencyFilter: null
        });

        if (result.success && result.sources?.length > 0) {
          // Make synthesis URLs unique to prevent deduplication
          const sourcesToAdd = result.sources.slice(0, 2).map(source => {
            if (source.source_url === '#perplexity-synthesis') {
              return {
                ...source,
                source_url: `#perplexity-synthesis-${query.category}-${i}`,
                source_title: `Research: ${query.target}`
              };
            }
            return source;
          });

          expandedSources.push(...sourcesToAdd);
        }
        await sleep(1500);
      } catch (error) {
        console.error(`Expansion failed: ${error.message}`);
      }
    }

    return expandedSources;
  } catch (error) {
    console.error('Expansion failed:', error.message);
    return [];
  }
}

/**
 * Main intelligent research function
 * @param {string} topic - Research topic
 * @param {number} targetDuration - Target duration in minutes
 * @param {Function} initialResearchFn - Function to perform initial research
 * @returns {Promise<Object>} Research results with sources and metrics
 */
export async function performIntelligentResearch(topic, targetDuration, initialResearchFn) {
  // STEP 1: Extract searchable entities from the topic
  const entities = await extractSearchableEntities(topic);

  if (!entities) {
    console.warn('Entity extraction failed, using simple research');
    const simpleResults = await initialResearchFn(topic);
    return {
      sources: simpleResults.sources || [],
      metrics: {
        primarySources: simpleResults.sources?.length || 0,
        expandedSources: 0,
        totalWords: calculateTotalWords(simpleResults.sources || []),
        method: 'simple-fallback'
      },
      summary: simpleResults.summary,
      insights: simpleResults.insights
    };
  }

  // STEP 2: Generate multiple search strategies
  const searchQueries = generateSearchQueries(entities);

  // STEP 3: Try searches in order of specificity
  let allSources = [];

  for (const searchQuery of searchQueries) {
    try {
      const results = await performSearch(searchQuery.query);

      if (results && results.length > 0) {
        allSources.push(...results);

        // If we found substantial content, we can move forward
        if (allSources.length >= 3) {
          break;
        }
      }
    } catch (error) {
      console.error(`Search failed: ${error.message}`);
    }

    await sleep(1500);
  }

  // STEP 4: If still no results, try initial research function
  if (allSources.length === 0) {
    const fallbackResults = await initialResearchFn(topic);
    allSources = fallbackResults.sources || [];
  }

  // STEP 5: Deduplicate sources
  const uniqueSources = deduplicateSources(allSources);

  // STEP 6: Check if we need expansion
  const totalWords = calculateTotalWords(uniqueSources);
  const targetWords = targetDuration * 150;
  const needsExpansion = totalWords < (targetWords * 0.75);

  if (needsExpansion && uniqueSources.length > 0) {
    const expandedSources = await expandResearch(entities, uniqueSources, targetDuration);

    const allUniqueSources = deduplicateSources([...uniqueSources, ...expandedSources]);

    // Enrich sources with full web content
    const enrichedSources = await enrichSourcesWithWebContent(allUniqueSources);

    return {
      sources: enrichedSources,
      metrics: {
        primarySources: uniqueSources.length,
        expandedSources: expandedSources.length,
        finalSources: enrichedSources.length,
        totalWords: calculateTotalWords(enrichedSources),
        targetWords: targetWords,
        coveragePercent: (calculateTotalWords(enrichedSources) / targetWords) * 100,
        method: 'intelligent-expanded'
      }
    };
  }

  // Enrich sources with full web content before returning
  const enrichedSources = await enrichSourcesWithWebContent(uniqueSources);

  return {
    sources: enrichedSources,
    metrics: {
      primarySources: uniqueSources.length,
      expandedSources: 0,
      finalSources: enrichedSources.length,
      totalWords: calculateTotalWords(enrichedSources),
      targetWords: targetWords,
      coveragePercent: (calculateTotalWords(enrichedSources) / targetWords) * 100,
      method: 'intelligent-basic'
    }
  };
}

/**
 * Calculate total word count
 * @param {Array} sources - Array of sources
 * @returns {number} Total word count
 */
function calculateTotalWords(sources) {
  if (!sources || !Array.isArray(sources)) return 0;

  return sources.reduce((total, source) => {
    const content = source.source_content || '';
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    return total + words;
  }, 0);
}

/**
 * Deduplicate sources
 * @param {Array} sources - Array of sources
 * @returns {Array} Deduplicated sources
 */
function deduplicateSources(sources) {
  if (!sources || !Array.isArray(sources)) return [];

  const seen = new Set();
  const seenUrls = new Set();
  const unique = [];

  for (const source of sources) {
    // Check URL
    if (source.source_url && seenUrls.has(source.source_url)) {
      continue;
    }

    // Create fingerprint
    const content = source.source_content || '';
    const fingerprint = content.substring(0, 200).toLowerCase().trim();

    if (!seen.has(fingerprint) && fingerprint.length > 50) {
      seen.add(fingerprint);
      if (source.source_url) {
        seenUrls.add(source.source_url);
      }
      unique.push(source);
    }
  }

  return unique;
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enrich sources with full web content via Jina AI
 * @param {Array} sources - Array of sources to enrich
 * @returns {Promise<Array>} Enriched sources
 */
async function enrichSourcesWithWebContent(sources) {
  if (!sources || sources.length === 0) return sources;

  // Identify URLs that need content fetching (web sources with short content)
  const urlsToFetch = sources
    .filter(s => {
      const isWebUrl = s.source_url?.startsWith('http://') || s.source_url?.startsWith('https://');
      const hasShortContent = (s.source_content || '').split(/\s+/).length < 100;
      return isWebUrl && hasShortContent;
    })
    .map(s => s.source_url);

  if (urlsToFetch.length === 0) {
    return sources;
  }

  try {
    // Fetch full content from URLs
    const fetchedContents = await fetchMultipleUrls(urlsToFetch, {
      maxConcurrent: 5,
      minWordCount: 100,
      timeout: 30000,
      useJina: true,
      fallbackToRaw: true,
      onProgress: () => {}
    });

    // Map fetched content back to sources
    const enrichedSources = sources.map(source => {
      const fetched = fetchedContents.find(f => f.url === source.source_url);

      if (fetched && fetched.success && fetched.wordCount >= 100) {
        return {
          ...source,
          source_content: fetched.content,
          fetch_method: fetched.method,
          word_count: fetched.wordCount,
          // Mark as highly relevant if we got good content
          is_starred: fetched.wordCount >= 500 ? true : source.is_starred
        };
      }

      // Keep original if fetch failed (synthesis sources, or fetch error)
      return source;
    });

    return enrichedSources;
  } catch (error) {
    console.error('Content enrichment failed:', error);
    return sources;
  }
}

export default {
  extractSearchableEntities,
  generateSearchQueries,
  performIntelligentResearch,
  calculateTotalWords,
  deduplicateSources
};
