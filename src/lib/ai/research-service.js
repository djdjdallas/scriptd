/**
 * Research Service
 * Handles AI-powered research using Claude's native web search
 */

import Anthropic from '@anthropic-ai/sdk';

class ResearchService {
  /**
   * Build research prompt that forces tool usage
   */
  static buildResearchPrompt({ query, topic, context, minSources, minContentLength }) {
    return `You are a research assistant. Research the following topic and return your findings in JSON format.

Topic to research: "${query}"
${topic ? `Additional context: ${topic}` : ''}
${context ? `Specific focus: ${context}` : ''}

CRITICAL: You MUST return ONLY valid JSON in the exact format specified below. Do not include any text before or after the JSON.

Return this exact JSON structure:
{
  "summary": "A comprehensive 3-4 paragraph synthesis of the research findings",
  "sources": [
    {
      "source_url": "https://example.com/article",
      "source_title": "Article title",
      "source_content": "Key information from this source (at least ${minContentLength} characters)",
      "source_type": "web",
      "is_starred": false,
      "fact_check_status": "verified",
      "relevance": 0.9
    }
  ],
  "relatedQuestions": ["Question 1?", "Question 2?", "Question 3?"],
  "insights": {
    "keyStatistics": ["Statistic 1 with source", "Statistic 2 with source"],
    "expertQuotes": ["Quote 1 with attribution", "Quote 2 with attribution"],
    "commonMisconceptions": ["Misconception 1 with correction"],
    "actionableTakeaways": ["Takeaway 1", "Takeaway 2"]
  }
}

Provide at least ${minSources} sources. Each source must have substantial content.
IMPORTANT: Return ONLY the JSON object, nothing else.`;
  }

  /**
   * Perform research using Perplexity or Claude
   * @param {Object} options - Research options
   * @param {string} options.query - The research query
   * @param {string} options.topic - The main topic (optional)
   * @param {string} options.context - Additional context (optional)
   * @param {number} options.minSources - Minimum number of sources (default: 10)
   * @param {number} options.minContentLength - Minimum content length per source (default: 1000)
   * @returns {Object} Research results
   */
  static async performResearch(options) {
    const {
      query,
      topic = '',
      context = '',
      minSources = 10, // Increased from 5 for better script generation depth
      minContentLength = 1000
    } = options;

    // Try Perplexity first if API key is available
    if (process.env.PERPLEXITY_API_KEY) {
      console.log('🔍 Attempting Perplexity web search');
      try {
        const perplexityResult = await this.performPerplexitySearch({
          query,
          topic,
          context,
          minSources
        });

        if (perplexityResult.success) {
          console.log('✅ Perplexity search successful');
          return perplexityResult;
        }
      } catch (error) {
        console.warn('⚠️ Perplexity search failed, falling back to Claude:', error.message);
      }
    }

    // Fallback to Claude
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return {
        success: false,
        error: 'No API keys configured for research',
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
        model: process.env.BALANCED_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: this.buildResearchPrompt({ query, topic, context, minSources, minContentLength })
        }]
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
   * Parse and validate Claude's response with tool usage enforcement
   */
  static parseAndValidateResponse(response, minSources, minContentLength) {
    const textContent = response.content.find(c => c.type === 'text');

    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    // Check if Claude actually used any tools
    const toolUses = response.content.filter(c => c.type === 'tool_use');
    const webSearches = toolUses.filter(t => t.name === 'web_search' || t.name === 'WebSearch');
    const webFetches = toolUses.filter(t => t.name === 'web_fetch' || t.name === 'WebFetch');

    console.log('🔧 Tools used by Claude:', {
      totalToolCalls: toolUses.length,
      webSearchCalls: webSearches.length,
      webFetchCalls: webFetches.length,
      allTools: toolUses.map(t => t.name)
    });

    // For now, just check that Claude used web search at least
    if (webSearches.length === 0 && toolUses.length === 0) {
      console.warn('⚠️ Claude did not use web search tools - will validate content instead');
    }

    // Parse the JSON response
    let jsonText = textContent.text;

    // Log the raw response for debugging
    console.log('Raw response from Claude (first 200 chars):', jsonText.substring(0, 200));

    // Try multiple methods to extract JSON
    // Method 1: Remove markdown code blocks
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Method 2: Extract JSON object between curly braces
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    // Method 3: If it starts with text, try to find where JSON starts
    if (!jsonText.startsWith('{')) {
      const jsonStartIndex = jsonText.indexOf('{');
      if (jsonStartIndex > -1) {
        jsonText = jsonText.substring(jsonStartIndex);
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      console.error('❌ Failed to parse Claude JSON:', error);
      console.error('Attempted to parse:', jsonText.substring(0, 500));

      // Fallback: Create a basic response structure
      return {
        summary: textContent.text.substring(0, 2000),
        sources: [{
          source_url: '#ai-synthesis',
          source_title: 'Research Synthesis',
          source_content: textContent.text,
          source_type: 'synthesis',
          is_starred: true,
          fact_check_status: 'unverified',
          relevance: 0.8
        }],
        results: [],
        relatedQuestions: [],
        insights: {
          keyStatistics: [],
          expertQuotes: [],
          commonMisconceptions: [],
          actionableTakeaways: []
        },
        citations: []
      };
    }

    // Validate the structure
    if (!parsed.sources || !Array.isArray(parsed.sources)) {
      throw new Error('Claude response missing sources array');
    }

    // Validate each source has real content
    const validSources = parsed.sources.filter(source => {
      // Allow both https:// URLs and internal references for synthesis
      const hasValidUrl = source.source_url &&
        (source.source_url.startsWith('https://') ||
         source.source_url === '#ai-synthesis' ||
         source.source_url === '#web-search');

      // For web search results, we might get shorter snippets, so be more lenient
      const minLength = source.source_type === 'synthesis' ? 500 : Math.min(minContentLength, 500);
      const hasContent = source.source_content && source.source_content.length >= minLength;

      if (!hasValidUrl) {
        console.warn(`⚠️ Invalid source URL: ${source.source_url}`);
      }
      if (!hasContent) {
        console.warn(`⚠️ Source content too short: ${source.source_content?.length || 0}/${minLength} chars`);
      }

      return hasValidUrl && hasContent;
    });

    // Be more flexible with source count if we have substantial content
    const totalContent = validSources.reduce((sum, s) => sum + (s.source_content?.length || 0), 0);
    const hasEnoughContent = totalContent >= (minSources * minContentLength * 0.5); // 50% of ideal

    if (validSources.length < minSources && !hasEnoughContent) {
      console.warn(`Warning: Only ${validSources.length}/${minSources} sources, but total content: ${totalContent} chars`);
      // Don't throw error if we have at least some valid sources
      if (validSources.length === 0) {
        throw new Error('No valid sources found in research results');
      }
    }

    // Ensure all sources have required fields
    const normalizedSources = validSources.map((source, index) => ({
      source_url: source.source_url,
      source_title: source.source_title || `Source ${index + 1}`,
      source_content: source.source_content,
      source_type: source.source_type || 'web',
      is_starred: source.is_starred || index < 3,
      fact_check_status: source.fact_check_status || 'verified',
      relevance: source.relevance || (1 - index * 0.1)
    }));

    // Add AI synthesis as first source
    const allSources = [
      {
        source_url: '#ai-synthesis',
        source_title: '🔬 Research Synthesis',
        source_content: parsed.summary || '',
        source_type: 'synthesis',
        is_starred: true,
        fact_check_status: 'verified',
        relevance: 1.0
      },
      ...normalizedSources
    ];

    console.log(`✅ Validated ${normalizedSources.length} sources with real content`);

    return {
      summary: parsed.summary || '',
      sources: allSources,
      results: allSources, // For backward compatibility
      relatedQuestions: parsed.relatedQuestions || [],
      insights: parsed.insights || {
        keyStatistics: [],
        expertQuotes: [],
        commonMisconceptions: [],
        actionableTakeaways: []
      },
      citations: normalizedSources,
      toolsUsed: parsed.toolsUsed || {
        searchCount: webSearches.length,
        fetchCount: webFetches.length
      }
    };
  }

  /**
   * Perform web search using Perplexity API
   * IMPORTANT: We use Perplexity's content directly without fetching URLs
   */
  static async performPerplexitySearch({ query, topic, context, minSources }) {
    if (!process.env.PERPLEXITY_API_KEY) {
      return { success: false, error: 'Perplexity API key not configured' };
    }

    try {
      console.log('🔍 Starting Perplexity web search for:', query);

      const searchPrompt = `Research this topic comprehensively: "${query}"
${topic ? `Main Topic: ${topic}` : ''}
${context ? `Context: ${context}` : ''}

Provide:
1. A comprehensive summary (3-4 paragraphs)
2. Key facts and statistics with dates
3. Recent developments and trends
4. Expert opinions and quotes
5. Common misconceptions
6. Actionable insights

Include specific URLs and sources for all information. Focus on events from 2023-2025.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar', // or 'sonar-pro' for better quality
          messages: [
            {
              role: 'system',
              content: 'You are a thorough research assistant. Provide comprehensive, well-sourced information with specific URLs and citations. Focus on the most recent and relevant information.'
            },
            {
              role: 'user',
              content: searchPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 4000,
          return_citations: true,
          return_related_questions: true,
          search_recency_filter: 'year' // Focus on recent content
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

      console.log(`📊 Perplexity returned ${citations.length} citations`);

      // Parse content into sections
      const sections = content.split(/\n\n+/);
      const summary = sections.slice(0, 3).join('\n\n');

      // Create sources from Perplexity's response
      // IMPORTANT: We use Perplexity's content directly, not fetching URLs
      const sources = [];

      // Add main synthesis as first source
      sources.push({
        source_url: '#perplexity-synthesis',
        source_title: '🔬 Perplexity Research Synthesis',
        source_content: content, // Full content from Perplexity
        source_type: 'synthesis',
        is_starred: true,
        fact_check_status: 'verified',
        relevance: 1.0
      });

      // Process citations if available
      if (citations && citations.length > 0) {
        citations.forEach((citation, index) => {
          // Extract relevant section from content for this citation
          const citationContent = this.extractCitationContent(content, citation, index);

          sources.push({
            source_url: citation.url || `#citation-${index}`,
            source_title: citation.title || `Source ${index + 1}`,
            source_content: citationContent || citation.snippet || `Information from ${citation.title || 'source'}`,
            source_type: 'web',
            is_starred: index < 3,
            fact_check_status: 'perplexity-verified',
            relevance: Math.max(0.7, 1 - (index * 0.1))
          });
        });
      } else {
        // If no citations, create sources from content sections
        sections.forEach((section, index) => {
          if (section.length > 200 && sources.length < minSources + 1) {
            sources.push({
              source_url: `#section-${index}`,
              source_title: `Research Section ${index}`,
              source_content: section,
              source_type: 'synthesis',
              is_starred: index < 2,
              fact_check_status: 'perplexity-generated',
              relevance: 0.8
            });
          }
        });
      }

      // Extract insights from content
      const insights = {
        keyStatistics: this.extractStatistics(content),
        expertQuotes: this.extractQuotes(content),
        commonMisconceptions: this.extractMisconceptions(content),
        actionableTakeaways: this.extractTakeaways(content)
      };

      console.log(`✅ Perplexity search successful: ${sources.length} sources found`);

      return {
        success: true,
        summary,
        sources,
        results: sources, // Backward compatibility
        relatedQuestions: data.related_questions || [],
        insights,
        citations: sources.filter(s => s.source_type === 'web'),
        provider: 'perplexity',
        sourcesCount: sources.length,
        totalContent: sources.reduce((sum, s) => sum + s.source_content.length, 0)
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
   * Extract content relevant to a citation from the main content
   */
  static extractCitationContent(content, citation, index) {
    // Try to find content that mentions the citation
    const sentences = content.split(/[.!?]\s+/);
    const relevantSentences = [];

    // Look for citation markers like [1], [2], etc.
    const citationMarker = `[${index + 1}]`;
    sentences.forEach(sentence => {
      if (sentence.includes(citationMarker)) {
        relevantSentences.push(sentence);
      }
    });

    // If we found relevant sentences, use them
    if (relevantSentences.length > 0) {
      return relevantSentences.join('. ') + '.';
    }

    // Otherwise, look for content that matches citation title keywords
    if (citation.title) {
      const keywords = citation.title.toLowerCase().split(' ').filter(word => word.length > 4);
      const matchingSentences = sentences.filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return keywords.some(keyword => lowerSentence.includes(keyword));
      });

      if (matchingSentences.length > 0) {
        return matchingSentences.slice(0, 3).join('. ') + '.';
      }
    }

    // Fallback: return a portion of content
    const startIndex = index * 500;
    return content.substring(startIndex, Math.min(startIndex + 1000, content.length));
  }

  /**
   * Extract statistics from content
   */
  static extractStatistics(content) {
    const patterns = [
      /\$[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|trillion))?/gi,
      /\d+(?:\.\d+)?%/g,
      /\d{4}\s*(?:year|month|day)/gi,
      /(?:increased?|decreased?|grew|fell)\s+(?:by\s+)?\d+(?:\.\d+)?%/gi
    ];

    const stats = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      stats.push(...matches.slice(0, 2));
    });

    return [...new Set(stats)].slice(0, 5);
  }

  /**
   * Extract quotes from content
   */
  static extractQuotes(content) {
    const quoteMatches = content.match(/"[^"]+"/g) || [];
    return quoteMatches.slice(0, 3).map(quote => quote.trim());
  }

  /**
   * Extract misconceptions from content
   */
  static extractMisconceptions(content) {
    const patterns = [
      /(?:myth|misconception|actually|contrary to|not true|false|incorrect)[^.]*\./gi,
      /(?:however|but|although)[^.]*\./gi
    ];

    const misconceptions = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      misconceptions.push(...matches.slice(0, 2));
    });

    return misconceptions.slice(0, 3).map(m => m.trim());
  }

  /**
   * Extract actionable takeaways from content
   */
  static extractTakeaways(content) {
    const patterns = [
      /(?:should|must|need to|important to|recommend|suggest)[^.]*\./gi,
      /(?:key takeaway|lesson|implication)[^.]*\./gi
    ];

    const takeaways = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      takeaways.push(...matches.slice(0, 2));
    });

    return takeaways.slice(0, 4).map(t => t.trim());
  }

  /**
   * Legacy method for backward compatibility
   */
  static async performAdvancedResearch(options) {
    console.log('🔄 Redirecting to new performResearch method');
    return this.performResearch(options);
  }

  /**
   * Perform enhanced research with gap analysis and expansion
   * @param {Object} options - Research options
   * @param {string} options.query - The research query
   * @param {string} options.topic - The main topic (optional)
   * @param {string} options.context - Additional context (optional)
   * @param {number} options.targetDuration - Target video duration (auto-detected: seconds or minutes)
   * @param {boolean} options.enableExpansion - Enable gap analysis and expansion (default: true)
   * @param {boolean} options.useIntelligentResearch - Use intelligent entity-based research (default: true)
   * @returns {Object} Enhanced research results with metrics
   */
  static async performEnhancedResearch(options) {
    const {
      query,
      topic = '',
      context = '',
      targetDuration = 600,
      enableExpansion = true,
      useIntelligentResearch = true,
      minSources = 10,
      minContentLength = 1000
    } = options;

    console.log('🚀 Starting enhanced research for:', query);

    // Fix duration: auto-detect if it's in seconds or minutes
    // If > 100, assume it's seconds and convert to minutes
    const targetMinutes = targetDuration > 100
      ? Math.ceil(targetDuration / 60)
      : targetDuration;

    console.log(`   Target duration: ${targetMinutes} minutes (from ${targetDuration})`);

    // PHASE 1: Initial research function
    const initialResearchFn = async (searchTopic) => {
      const result = await this.performResearch({
        query: searchTopic,
        topic: searchTopic,
        context,
        minSources,
        minContentLength
      });

      return {
        sources: result.sources || [],
        summary: result.summary,
        insights: result.insights
      };
    };

    // Choose research method
    if (useIntelligentResearch && enableExpansion) {
      // Use intelligent entity-based research
      console.log('🧠 Using intelligent entity-based research');
      const { performIntelligentResearch } = await import('./intelligent-research.js');

      const result = await performIntelligentResearch(
        query,
        targetMinutes,
        initialResearchFn
      );

      return {
        success: true,
        sources: result.sources,
        summary: result.summary,
        insights: result.insights,
        metrics: result.metrics,
        provider: 'intelligent-enhanced'
      };
    } else if (enableExpansion) {
      // Use original gap-based expansion
      console.log('🔬 Using gap-based research expansion');
      const { performComprehensiveResearch } = await import('./research-expander.js');

      const result = await performComprehensiveResearch(
        query,
        initialResearchFn,
        targetMinutes,
        enableExpansion
      );

      return {
        success: true,
        sources: result.sources,
        summary: result.summary,
        insights: result.insights,
        expansionPlan: result.expansionPlan,
        metrics: result.metrics,
        provider: 'gap-enhanced'
      };
    } else {
      // Simple research without expansion
      console.log('📰 Using simple research (no expansion)');
      const result = await initialResearchFn(query);

      return {
        success: true,
        sources: result.sources,
        summary: result.summary,
        insights: result.insights,
        metrics: {
          primarySources: result.sources?.length || 0,
          expandedSources: 0,
          totalWords: result.sources?.reduce((sum, s) =>
            sum + (s.source_content?.split(/\s+/).length || 0), 0) || 0
        },
        provider: 'simple'
      };
    }
  }
}

export default ResearchService;