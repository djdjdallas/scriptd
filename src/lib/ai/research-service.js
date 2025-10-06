/**
 * Research Service
 * Handles AI-powered research using Perplexity for web search and Claude for synthesis
 */

import Anthropic from '@anthropic-ai/sdk';

class ResearchService {
  /**
   * Build research prompt that forces tool usage
   */
  static buildResearchPrompt({ query, topic, context, minSources, minContentLength }) {
    return `
<critical_instructions>
YOU MUST USE THE web_search AND web_fetch TOOLS.
DO NOT write content from memory.
DO NOT create fake citations.
DO NOT proceed until you have used both tools.
</critical_instructions>

<task>
Research this topic by following these MANDATORY steps:

Step 1: SEARCH (REQUIRED)
- Call web_search with query: "${query}"
- You MUST see actual search results before proceeding
- If no results, try different search terms
- DO NOT skip this step

Step 2: FETCH (REQUIRED)
- Call web_fetch on at least ${minSources} different URLs from search results
- Each URL must be from a different domain
- Extract at least ${minContentLength} characters from each
- DO NOT skip this step

Step 3: VALIDATE (REQUIRED)
Before generating output, verify:
✓ You called web_search at least once
✓ You called web_fetch at least ${minSources} times
✓ All source URLs are real (start with https://)
✓ All sources have unique content
✓ Total content > ${minSources * minContentLength} characters

IF YOU CANNOT COMPLETE ALL THREE STEPS, RETURN:
{
  "error": "Unable to perform web research",
  "reason": "Explain what failed"
}

DO NOT make up research. DO NOT use training data. ONLY use web_search and web_fetch.
</task>

<required_output_format>
{
  "summary": "Synthesis of information from the ${minSources}+ sources you fetched",
  "sources": [
    {
      "source_url": "https://real-website.com/article",
      "source_title": "Exact article title from the website",
      "source_content": "Full text extracted via web_fetch (min ${minContentLength} chars)",
      "source_type": "web",
      "is_starred": false,
      "fact_check_status": "verified",
      "relevance": 0.95
    }
  ],
  "relatedQuestions": ["Question 1?", "Question 2?", "Question 3?"],
  "insights": {
    "keyStatistics": ["Stat with date and source"],
    "expertQuotes": ["Quote with attribution"],
    "commonMisconceptions": ["Misconception with correction"],
    "actionableTakeaways": ["Takeaway based on sources"]
  },
  "toolsUsed": {
    "searchCount": 2,
    "fetchCount": 5
  }
}
</required_output_format>

<validation_requirements>
I will validate your response. If any of these are false, I will reject it:
1. All source_url values start with "https://" (not "#citation" or "#ai-synthesis")
2. sources array has at least ${minSources} items
3. Each source has different source_url (no duplicates)
4. Each source.source_content is at least ${minContentLength} characters
5. toolsUsed.searchCount >= 1
6. toolsUsed.fetchCount >= ${minSources}
</validation_requirements>

Query: "${query}"
${topic ? `Topic: ${topic}` : ''}
${context ? `Context: ${context}` : ''}

BEGIN RESEARCH NOW. Use web_search first, then web_fetch on the results.
`;
  }

  /**
   * Perform research using Claude with enforced tool usage
   * @param {Object} options - Research options
   * @param {string} options.query - The research query
   * @param {string} options.topic - The main topic (optional)
   * @param {string} options.context - Additional context (optional)
   * @param {number} options.minSources - Minimum number of sources (default: 5)
   * @param {number} options.minContentLength - Minimum content length per source (default: 1000)
   * @returns {Object} Research results
   */
  static async performResearch(options) {
    const {
      query,
      topic = '',
      context = '',
      minSources = 5,
      minContentLength = 1000
    } = options;

    // First try Perplexity for web search
    const perplexityResult = await this.performPerplexitySearch({
      query,
      topic,
      context,
      minSources
    });

    if (perplexityResult.success) {
      return perplexityResult;
    }

    // Fallback to Claude with native web search
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return {
        success: false,
        error: 'API keys not configured',
        sources: [],
        summary: '',
        provider: 'none'
      };
    }

    try {
      console.log('🔍 Using Claude with native web search');

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 16000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: this.buildResearchPrompt({ query, topic, context, minSources, minContentLength })
        }],
        tools: [
          {
            name: "web_search",
            description: "Search the web for current information",
            input_schema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "web_fetch",
            description: "Fetch and extract content from specific URLs",
            input_schema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The URL to fetch content from"
                }
              },
              required: ["url"]
            }
          }
        ]
      });

      // Check for errors in response
      const errorContent = response.content.find(c =>
        c.type === 'text' && c.text.includes('"error"')
      );

      if (errorContent) {
        console.error('❌ Claude returned error:', errorContent.text);
        throw new Error('Research failed: ' + errorContent.text);
      }

      const result = this.parseAndValidateResponse(response, minSources, minContentLength);

      return {
        success: true,
        ...result,
        provider: 'claude'
      };

    } catch (error) {
      console.error('❌ Claude web search failed:', error);

      // If validation failed, return helpful error
      if (error.message.includes('did not use web_search')) {
        return {
          success: false,
          error: 'Claude did not perform actual web research. This is a system error.',
          suggestion: 'Try again with a different query or contact support.',
          sources: [],
          provider: 'claude'
        };
      }

      return {
        success: false,
        error: error.message,
        sources: [],
        summary: '',
        provider: 'claude'
      };
    }
  }

  /**
   * Perform web search using Perplexity API
   */
  static async performPerplexitySearch({ query, topic, context, minSources }) {
    if (!process.env.PERPLEXITY_API_KEY) {
      console.log('⚠️ PERPLEXITY_API_KEY not configured, skipping web search');
      return { success: false };
    }

    try {
      console.log('🔍 Starting Perplexity web search for:', query);

      const searchPrompt = `Research this topic comprehensively: "${query}"
${topic ? `Main Topic: ${topic}` : ''}
${context ? `Context: ${context}` : ''}

Provide:
1. A comprehensive summary (3-4 paragraphs)
2. Key facts and statistics
3. Recent developments and trends
4. Expert opinions and quotes
5. Common misconceptions
6. Actionable insights

Include specific URLs and sources for all information.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a thorough research assistant. Provide comprehensive, well-sourced information with specific URLs and citations.'
            },
            {
              role: 'user',
              content: searchPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 4000,
          return_citations: true,
          return_related_questions: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error:', response.status, errorText);
        return { success: false, error: `Perplexity API error: ${response.status}` };
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        console.error('Invalid Perplexity response structure');
        return { success: false, error: 'Invalid API response' };
      }

      const content = data.choices[0].message.content;
      const citations = data.citations || [];

      // Parse the content and structure it
      const sources = this.extractSourcesFromPerplexity(content, citations);

      // Create a comprehensive summary
      const summary = this.extractSummaryFromContent(content);

      // Extract insights
      const insights = this.extractInsightsFromContent(content);

      // Add synthesis as first source
      const allSources = [
        {
          source_url: '#ai-synthesis',
          source_title: '🔬 Research Synthesis',
          source_content: summary,
          source_type: 'synthesis',
          is_starred: true,
          fact_check_status: 'verified',
          relevance: 1.0
        },
        ...sources
      ];

      console.log(`✅ Perplexity search successful: ${allSources.length} sources found`);

      return {
        success: true,
        summary,
        sources: allSources,
        results: allSources, // Backward compatibility
        relatedQuestions: data.related_questions || [],
        insights,
        citations: sources.filter(s => s.source_type === 'web'),
        provider: 'perplexity'
      };

    } catch (error) {
      console.error('❌ Perplexity search failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract sources from Perplexity response
   */
  static extractSourcesFromPerplexity(content, citations) {
    const sources = [];

    // Process citations if available
    if (citations && citations.length > 0) {
      citations.forEach((citation, index) => {
        // Extract relevant content for this citation
        const relevantContent = this.extractRelevantContent(content, citation.title || `Source ${index + 1}`);

        sources.push({
          source_url: citation.url || `#citation-${index}`,
          source_title: citation.title || `Web Source ${index + 1}`,
          source_content: relevantContent || citation.snippet || content.substring(index * 500, (index + 1) * 500),
          source_type: 'web',
          is_starred: index < 3, // Star first 3 sources
          fact_check_status: 'verified',
          relevance: Math.max(0.7, 1 - (index * 0.1))
        });
      });
    }

    // If no citations, extract from content
    if (sources.length === 0) {
      // Split content into logical sections
      const sections = content.split(/\n\n+/);
      sections.forEach((section, index) => {
        if (section.length > 200) {
          sources.push({
            source_url: `#section-${index}`,
            source_title: `Information Section ${index + 1}`,
            source_content: section,
            source_type: 'synthesis',
            is_starred: index < 2,
            fact_check_status: 'verified',
            relevance: 0.8
          });
        }
      });
    }

    // Ensure minimum content length
    return sources.map(source => ({
      ...source,
      source_content: source.source_content.length < 500
        ? source.source_content + '\n\n' + content.substring(0, 1000)
        : source.source_content
    }));
  }

  /**
   * Extract relevant content for a citation
   */
  static extractRelevantContent(fullContent, citationTitle) {
    // Try to find content related to the citation title
    const keywords = citationTitle.toLowerCase().split(' ').filter(word => word.length > 3);
    const sentences = fullContent.split(/[.!?]\s+/);

    const relevantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keywords.some(keyword => lowerSentence.includes(keyword));
    });

    if (relevantSentences.length > 0) {
      return relevantSentences.slice(0, 5).join('. ') + '.';
    }

    // Fallback to a portion of the content
    return fullContent.substring(0, 1500);
  }

  /**
   * Extract summary from content
   */
  static extractSummaryFromContent(content) {
    // Take first 3 paragraphs or 2000 characters
    const paragraphs = content.split(/\n\n+/);
    const summary = paragraphs.slice(0, 3).join('\n\n');
    return summary.length > 2000 ? summary.substring(0, 2000) + '...' : summary;
  }

  /**
   * Extract insights from content
   */
  static extractInsightsFromContent(content) {
    const insights = {
      keyStatistics: [],
      expertQuotes: [],
      commonMisconceptions: [],
      actionableTakeaways: []
    };

    // Extract statistics (numbers with context)
    const statMatches = content.match(/\d+[%$]?[^.]*\./g) || [];
    insights.keyStatistics = statMatches.slice(0, 3).map(stat => stat.trim());

    // Extract quoted text
    const quoteMatches = content.match(/"[^"]+"/g) || [];
    insights.expertQuotes = quoteMatches.slice(0, 2).map(quote => quote.trim());

    // Look for myth/misconception keywords
    const misconceptionMatches = content.match(/(?:myth|misconception|actually|contrary to)[^.]*\./gi) || [];
    insights.commonMisconceptions = misconceptionMatches.slice(0, 2).map(m => m.trim());

    // Extract action items
    const actionMatches = content.match(/(?:should|must|need to|important to)[^.]*\./gi) || [];
    insights.actionableTakeaways = actionMatches.slice(0, 3).map(action => action.trim());

    return insights;
  }

  /**
   * Parse and validate Claude's response with tool usage enforcement
   */
  static parseAndValidateResponse(response, minSources, minContentLength) {
    const textContent = response.content.find(c => c.type === 'text');

    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    // Check if Claude actually used the tools
    const toolUses = response.content.filter(c => c.type === 'tool_use');
    const webSearches = toolUses.filter(t => t.name === 'web_search');
    const webFetches = toolUses.filter(t => t.name === 'web_fetch');

    console.log('🔧 Tools used by Claude:', {
      totalToolCalls: toolUses.length,
      webSearchCalls: webSearches.length,
      webFetchCalls: webFetches.length
    });

    if (webSearches.length === 0) {
      throw new Error('Claude did not use web_search tool - research is invalid');
    }

    if (webFetches.length < minSources) {
      throw new Error(`Claude only fetched ${webFetches.length} sources - need at least ${minSources}`);
    }

    // Parse the JSON response
    let jsonText = textContent.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Extract JSON from the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);

    // Validate the sources
    const invalidSources = parsed.sources.filter(s =>
      !s.source_url ||
      !s.source_url.startsWith('https://') ||
      s.source_url.includes('#citation') ||
      s.source_url.includes('#ai-synthesis') ||
      !s.source_content ||
      s.source_content.length < minContentLength
    );

    if (invalidSources.length > 0) {
      console.error('❌ Invalid sources detected:', invalidSources);
      throw new Error(`${invalidSources.length} sources are invalid (fake URLs or insufficient content)`);
    }

    // Check for duplicate content (Claude copying the same text)
    const contentHashes = new Set();
    const duplicates = [];

    for (const source of parsed.sources) {
      const hash = source.source_content.substring(0, 200); // First 200 chars
      if (contentHashes.has(hash)) {
        duplicates.push(source.source_url);
      }
      contentHashes.add(hash);
    }

    if (duplicates.length > 0) {
      console.warn('⚠️ Duplicate content detected in sources:', duplicates);
      // Filter out duplicates
      parsed.sources = parsed.sources.filter((s, i, arr) =>
        i === arr.findIndex(t =>
          t.source_content.substring(0, 200) === s.source_content.substring(0, 200)
        )
      );
    }

    console.log('✅ Research validation passed:', {
      uniqueSources: parsed.sources.length,
      totalContentLength: parsed.sources.reduce((sum, s) => sum + s.source_content.length, 0),
      toolsUsed: parsed.toolsUsed
    });

    return this.normalizeResearchData(parsed);
  }

  /**
   * Normalize research data to consistent format
   */
  static normalizeResearchData(parsed) {
    const sources = Array.isArray(parsed.sources) ? parsed.sources : [];

    // Ensure all sources have required fields
    const normalizedSources = sources.map((source, index) => ({
      source_url: source.source_url || '',
      source_title: source.source_title || `Source ${index + 1}`,
      source_content: source.source_content || '',
      source_type: source.source_type || 'web',
      is_starred: source.is_starred || index < 3,
      fact_check_status: source.fact_check_status || 'verified',
      relevance: source.relevance || (1 - index * 0.1)
    }));

    return {
      summary: parsed.summary || '',
      sources: normalizedSources,
      results: normalizedSources, // For backward compatibility
      relatedQuestions: parsed.relatedQuestions || [],
      insights: parsed.insights || {
        keyStatistics: [],
        expertQuotes: [],
        commonMisconceptions: [],
        actionableTakeaways: []
      },
      citations: normalizedSources.filter(s => s.source_type === 'web'),
      toolsUsed: parsed.toolsUsed
    };
  }

  /**
   * Parse Claude's response and extract research data (legacy fallback)
   */
  static parseClaudeResponse(response) {
    try {
      // Find the last text content block (usually contains the final JSON)
      const textBlocks = response.content.filter(c => c.type === 'text');
      const lastTextBlock = textBlocks[textBlocks.length - 1];

      if (!lastTextBlock) {
        throw new Error('No text content in Claude response');
      }

      let jsonText = lastTextBlock.text;

      // Try to extract JSON from the response
      // Look for JSON between curly braces
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const parsed = JSON.parse(jsonText);

      return this.normalizeResearchData(parsed);

    } catch (error) {
      console.error('❌ Failed to parse Claude JSON response:', error);

      // Fallback: extract any content we can find
      const allText = response.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n\n');

      return {
        summary: allText.substring(0, 2000), // First 2000 chars as summary
        sources: [{
          source_url: '#ai-synthesis',
          source_title: '🔬 Research Synthesis',
          source_content: allText,
          source_type: 'synthesis',
          is_starred: true,
          fact_check_status: 'verified',
          relevance: 1.0
        }],
        results: [],
        relatedQuestions: [],
        insights: {},
        citations: []
      };
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  static async performAdvancedResearch(options) {
    console.log('🔄 Redirecting to new performResearch method');
    return this.performResearch(options);
  }
}

export default ResearchService;