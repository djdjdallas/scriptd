/**
 * Enhanced Research Expansion System
 * Analyzes initial research for gaps and performs targeted expansion searches
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Analyzes research for gaps and generates expansion plan
 * @param {string} topic - The research topic
 * @param {Array} initialSources - Initial research sources
 * @param {number} targetDuration - Target duration in minutes
 * @returns {Promise<Object>} Expansion plan with identified gaps and search queries
 */
export async function analyzeResearchGaps(topic, initialSources, targetDuration = 30) {
  const totalWords = calculateTotalWords(initialSources);
  const targetWords = targetDuration * 150; // 150 words per minute
  const needsExpansion = totalWords < (targetWords * 0.75);

  if (!needsExpansion) {
    return null;
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const sourceSummary = initialSources.slice(0, 5).map((s, i) => `
Source ${i + 1}: ${s.source_title || 'Untitled'}
Preview: ${(s.source_content || '').substring(0, 250)}...
`).join('\n');

  const analysisPrompt = `You are a research analyst preparing for a comprehensive video script about: "${topic}"

CURRENT RESEARCH (showing first 5 of ${initialSources.length} sources):
${sourceSummary}

TARGET: The script needs approximately ${targetWords} words of source material.
CURRENT: We have approximately ${totalWords} words.

ANALYSIS TASK:
1. Identify what core facts are already well-covered in the existing research
2. Identify critical information gaps that would make the script more comprehensive
3. Design 5-7 strategic search queries to fill those gaps

IMPORTANT: We want DIVERSE information sources, not more articles about the exact same event.

Search for contextual information like:
- Technical explanations of systems/processes mentioned
- Legal/regulatory frameworks involved
- Psychological/behavioral context
- Historical comparisons or similar cases
- Industry best practices or prevention methods
- Impact analysis and broader implications

FORMAT YOUR RESPONSE AS JSON (no markdown, just raw JSON):
{
  "core_facts_covered": [
    "List 3-5 key facts that are well-documented in existing research"
  ],
  "identified_gaps": [
    {
      "category": "Technical Details" | "Legal Framework" | "Psychology" | "Historical Context" | "Prevention" | "Impact",
      "missing_info": "Specific information that's missing",
      "why_important": "Why this would make the script better"
    }
  ],
  "expansion_searches": [
    {
      "query": "specific search query without quotes",
      "target": "What type of information this will find",
      "expected_value": "How this fills a gap"
    }
  ]
}

CRITICAL: Make sure each search query is DIFFERENT and targets a DIFFERENT type of information. Don't create 5 queries that will all return the same articles.

Examples of GOOD diverse queries for a fraud case:
- "how virtual credit card systems work corporate expense management"
- "gambling addiction statistics white collar professionals"
- "wire fraud sentencing federal guidelines"
- "sports embezzlement cases comparison history"
- "internal audit fraud detection techniques"

Examples of BAD queries (would return same articles):
- "amit patel jaguars embezzlement"
- "jacksonville jaguars $22 million fraud"
- "patel sentenced embezzlement"

Respond with ONLY the JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: analysisPrompt
      }]
    });

    const responseText = message.content[0].text;

    // Try to extract JSON if wrapped in markdown
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const expansionPlan = JSON.parse(jsonText);

    return expansionPlan;
  } catch (error) {
    console.error('Failed to analyze research gaps:', error);
    // Return a minimal plan on failure
    return {
      core_facts_covered: [],
      identified_gaps: [],
      expansion_searches: [],
      priority_order: [],
      error: error.message
    };
  }
}

/**
 * Executes expansion searches using Claude's web_search tool
 * @param {Object} expansionPlan - Plan from analyzeResearchGaps
 * @param {number} maxSearches - Maximum number of searches to perform
 * @returns {Promise<Array>} Array of new research sources
 */
export async function executeExpansionSearches(expansionPlan, maxSearches = 6) {
  const expandedSources = [];

  if (!expansionPlan || !expansionPlan.expansion_searches || expansionPlan.expansion_searches.length === 0) {
    return expandedSources;
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const searchesToExecute = expansionPlan.expansion_searches.slice(0, maxSearches);

  for (let i = 0; i < searchesToExecute.length; i++) {
    const search = searchesToExecute[i];

    try {
      // Use Claude with web_search tool
      const searchPrompt = `Use the web_search tool to find information about: ${search.query}

Target: ${search.target}

After searching, extract the most relevant and substantial content from the top 2-3 results. For each source, provide:
1. The full URL
2. The page title
3. A comprehensive extract of the relevant content (aim for 500-1000 words if available)

Focus on finding sources that provide CONTEXTUAL or EDUCATIONAL information, not just news articles about a specific event.

Format your response as a clear list of sources with their details.`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: searchPrompt
        }]
      });

      // Parse the response to extract sources
      const responseText = message.content[0].text;
      const sources = parseSearchResponse(responseText, search);

      if (sources.length > 0) {
        expandedSources.push(...sources);
      }

      // Rate limiting between searches
      if (i < searchesToExecute.length - 1) {
        await sleep(1500);
      }

    } catch (error) {
      console.error(`Search failed: ${error.message}`);
    }
  }

  return expandedSources;
}

/**
 * Parse Claude's search response into source objects
 * @param {string} responseText - Claude's response text
 * @param {Object} searchInfo - Information about the search query
 * @returns {Array} Array of source objects
 */
function parseSearchResponse(responseText, searchInfo) {
  const sources = [];

  try {
    // Extract URLs from the response
    const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const urls = [...new Set(responseText.match(urlPattern) || [])]; // Dedupe URLs

    if (urls.length === 0) {
      return sources;
    }

    // Split response into sections by URLs
    for (const url of urls.slice(0, 3)) { // Max 3 per search
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
        .replace(/^[\s\n]+|[\s\n]+$/g, '') // Trim whitespace
        .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
        .replace(/https?:\/\/[^\s]+/g, ''); // Remove URLs from content

      if (content.length < 100) {
        continue; // Skip sources with insufficient content
      }

      sources.push({
        id: crypto.randomUUID(),
        source_url: url.replace(/[<>"{}|\\^`\[\]]/g, ''), // Clean URL
        source_type: 'web',
        source_title: title.substring(0, 200),
        source_content: content,
        search_category: searchInfo.target,
        relevance: 0.75,
        is_starred: false,
        fact_check_status: 'pending',
        expansion_query: searchInfo.query
      });
    }

  } catch (error) {
    console.error('Error parsing search response:', error);
  }

  return sources;
}

/**
 * Performs comprehensive research with gap analysis and expansion
 * @param {string} topic - Research topic
 * @param {Function} initialResearchFn - Function to perform initial research
 * @param {number} targetDuration - Target video duration in minutes (not seconds!)
 * @param {boolean} enableExpansion - Whether to enable gap analysis and expansion
 * @returns {Promise<Object>} Complete research results with metrics
 */
export async function performComprehensiveResearch(
  topic,
  initialResearchFn,
  targetDuration = 30,
  enableExpansion = true
) {
  // PHASE 1: Initial Research
  const initialResults = await initialResearchFn(topic);

  const initialSourceCount = initialResults.sources?.length || 0;

  if (initialSourceCount === 0) {
    console.error('No initial sources found, cannot continue');
    return {
      sources: [],
      expansionPlan: null,
      metrics: {
        initialSourceCount: 0,
        expandedSourceCount: 0,
        finalSourceCount: 0,
        totalWords: 0,
        targetWords: targetDuration * 150,
        coveragePercent: 0
      }
    };
  }

  let finalSources = [...initialResults.sources];
  let expansionPlan = null;

  // PHASE 2-4: Analyze and expand if enabled
  if (enableExpansion) {
    // PHASE 2: Analyze Gaps
    expansionPlan = await analyzeResearchGaps(topic, initialResults.sources, targetDuration);

    // PHASE 3: Execute expansion if needed
    if (expansionPlan && expansionPlan.expansion_searches?.length > 0) {
      const expandedSources = await executeExpansionSearches(expansionPlan, 6);

      if (expandedSources.length > 0) {
        finalSources = [...initialResults.sources, ...expandedSources];
      }
    }
  }

  // PHASE 4 (or 2 if expansion disabled): Deduplicate and organize
  const deduplicatedSources = deduplicateSources(finalSources);

  const totalWords = calculateTotalWords(deduplicatedSources);
  const targetWords = targetDuration * 150;

  const metrics = {
    initialSourceCount: initialSourceCount,
    expandedSourceCount: finalSources.length - initialSourceCount,
    finalSourceCount: deduplicatedSources.length,
    totalWords: totalWords,
    targetWords: targetWords,
    coveragePercent: (totalWords / targetWords) * 100
  };

  return {
    sources: deduplicatedSources,
    expansionPlan: expansionPlan,
    metrics: metrics,
    summary: initialResults.summary,
    insights: initialResults.insights
  };
}

/**
 * Calculate total word count across all sources
 * @param {Array} sources - Array of source objects
 * @returns {number} Total word count
 */
export function calculateTotalWords(sources) {
  if (!sources || !Array.isArray(sources)) return 0;

  return sources.reduce((total, source) => {
    const content = source.source_content || '';
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    return total + words;
  }, 0);
}

/**
 * Remove duplicate sources based on content similarity
 * @param {Array} sources - Array of source objects
 * @returns {Array} Deduplicated sources
 */
export function deduplicateSources(sources) {
  if (!sources || !Array.isArray(sources)) return [];

  const seen = new Set();
  const seenUrls = new Set();
  const unique = [];

  for (const source of sources) {
    // First check URL
    if (source.source_url && seenUrls.has(source.source_url)) {
      continue;
    }

    // Create fingerprint from first 200 chars
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
 * Sleep utility for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  analyzeResearchGaps,
  executeExpansionSearches,
  performComprehensiveResearch,
  calculateTotalWords,
  deduplicateSources
};
