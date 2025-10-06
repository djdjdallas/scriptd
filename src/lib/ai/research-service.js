/**
 * Research Service
 * Handles AI-powered research using Claude's native web search
 */

import Anthropic from '@anthropic-ai/sdk';

class ResearchService {
  /**
   * Perform research using Claude with web_search and web_fetch
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

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return {
        success: false,
        error: 'Claude API key not configured',
        sources: [],
        summary: '',
        provider: 'none'
      };
    }

    try {
      console.log('🔍 Starting Claude web research for:', query);

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Create the research prompt
      const researchPrompt = this.buildResearchPrompt({
        query,
        topic,
        context,
        minSources,
        minContentLength
      });

      // Call Claude with web search enabled
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        temperature: 0.3, // Lower temperature for factual research
        messages: [
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        tools: [
          {
            type: 'computer_20241022',
            name: 'web_search',
            display_name: 'Web Search',
            description: 'Search the web for current information'
          },
          {
            type: 'computer_20241022',
            name: 'web_fetch',
            display_name: 'Web Fetch',
            description: 'Fetch and extract content from specific URLs'
          }
        ],
        tool_choice: 'auto'
      });

      console.log('📊 Claude research completed');
      console.log('Message content blocks:', response.content.length);

      // Extract the research results from Claude's response
      const result = this.parseClaudeResponse(response);

      console.log('✅ Research successful:', {
        sourcesFound: result.sources.length,
        totalContentLength: result.sources.reduce((sum, s) => sum + (s.source_content?.length || 0), 0),
        hasSummary: !!result.summary
      });

      return {
        success: true,
        ...result,
        provider: 'claude'
      };

    } catch (error) {
      console.error('❌ Claude research failed:', error);
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
   * Build the research prompt for Claude
   */
  static buildResearchPrompt({ query, topic, context, minSources, minContentLength }) {
    return `You are a research assistant gathering comprehensive information for a YouTube video script.

Research Query: "${query}"
${topic ? `Main Topic: ${topic}` : ''}
${context ? `Additional Context: ${context}` : ''}

INSTRUCTIONS:
1. Search for at least ${minSources} credible sources about this topic
2. Extract at least ${minContentLength} characters of substantive content from each source
3. Prioritize recent sources (last 2 years) and authoritative domains
4. Verify information across multiple sources

REQUIRED OUTPUT FORMAT (return as valid JSON):
{
  "summary": "A comprehensive 3-4 paragraph synthesis covering key facts, trends, expert perspectives, and insights",
  "sources": [
    {
      "source_url": "URL here",
      "source_title": "Title here",
      "source_content": "Full extracted text (min ${minContentLength} chars)",
      "source_type": "web",
      "is_starred": false,
      "fact_check_status": "verified",
      "relevance": 0.95
    }
  ],
  "relatedQuestions": ["Question 1", "Question 2", "Question 3"],
  "insights": {
    "keyStatistics": ["Stat 1", "Stat 2"],
    "expertQuotes": ["Quote 1", "Quote 2"],
    "commonMisconceptions": ["Misconception 1"],
    "actionableTakeaways": ["Takeaway 1", "Takeaway 2"]
  }
}

Begin research now using web search and content extraction.`;
  }

  /**
   * Parse Claude's response and extract research data
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

      // Add AI synthesis as first source
      const sources = [
        {
          source_url: '#ai-synthesis',
          source_title: '🔬 Research Synthesis',
          source_content: parsed.summary || '',
          source_type: 'synthesis',
          is_starred: true,
          fact_check_status: 'verified',
          relevance: 1.0
        },
        ...(parsed.sources || [])
      ];

      return {
        summary: parsed.summary || '',
        sources: sources,
        results: sources, // For backward compatibility
        relatedQuestions: parsed.relatedQuestions || [],
        insights: parsed.insights || {},
        citations: sources.filter(s => s.source_type === 'web')
      };

    } catch (error) {
      console.error('❌ Failed to parse Claude JSON response:', error);

      // Fallback: extract any content we can find
      const allText = response.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n\n');

      // Try to find sources mentioned in the text
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = allText.match(urlRegex) || [];

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
        results: [], // For backward compatibility
        relatedQuestions: [],
        insights: {},
        citations: urls.map(url => ({
          source_url: url,
          source_title: 'Web Source',
          source_type: 'web'
        }))
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