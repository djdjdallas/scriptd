/**
 * Research Service
 * Handles AI-powered research with Perplexity (primary) and Claude (fallback)
 */

class ResearchService {
  /**
   * Perform research using Perplexity API with Claude fallback
   * @param {Object} options - Research options
   * @param {string} options.query - The research query
   * @param {string} options.topic - The main topic (optional)
   * @param {string} options.context - Additional context (optional)
   * @param {boolean} options.includeSources - Whether to include sources (default: true)
   * @returns {Object} Research results
   */
  static async performResearch(options) {
    const { 
      query, 
      topic = '', 
      context = '',
      includeSources = true 
    } = options;

    // Try Perplexity first
    if (process.env.PERPLEXITY_API_KEY) {
      const perplexityResult = await this.perplexityResearch({
        query,
        topic,
        context,
        includeSources
      });
      
      if (perplexityResult.success) {
        return {
          ...perplexityResult,
          provider: 'perplexity'
        };
      }
      
      console.warn('Perplexity research failed, falling back to Claude:', perplexityResult.error);
    }

    // Fallback to Claude
    if (process.env.ANTHROPIC_API_KEY) {
      const claudeResult = await this.claudeResearch({
        query,
        topic,
        context
      });
      
      if (claudeResult.success) {
        return {
          ...claudeResult,
          provider: 'claude'
        };
      }
      
      console.error('Claude research also failed:', claudeResult.error);
    }

    // Return error if both fail
    return {
      success: false,
      error: 'Both Perplexity and Claude research failed',
      results: [],
      summary: '',
      provider: 'none'
    };
  }

  /**
   * Research using Perplexity API
   */
  static async perplexityResearch({ query, topic, context, includeSources }) {
    try {
      const systemPrompt = `You are a research assistant helping to gather comprehensive information for YouTube video scripts. 
Provide factual, well-researched information with sources.
Focus on: current trends, statistics, expert opinions, case studies, and actionable insights.
${context ? `Additional context: ${context}` : ''}`;

      const userPrompt = `Research the following for a YouTube video script:
Query: "${query}"
${topic ? `Main Topic: ${topic}` : ''}

Please provide:
1. Key facts and statistics (with dates)
2. Recent developments and trends
3. Expert opinions and quotes
4. Interesting angles and perspectives
5. Common misconceptions to address
6. Related topics to explore
7. Actionable takeaways for viewers

Include credible sources and be specific with data.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'sonar', // Perplexity's standard model with online search
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          stream: false,
          return_citations: includeSources,
          return_related_questions: true,
          // search_domain_filter: [], // No domain filtering for comprehensive results
          search_recency_filter: 'month', // Focus on recent information
          top_p: 0.9,
          temperature: 0.2, // Lower temperature for factual accuracy
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Perplexity API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        throw new Error(`Perplexity API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Extract main content
      const mainContent = data.choices?.[0]?.message?.content || '';
      
      // Extract and format citations
      const citations = data.citations || [];
      const results = citations.map((citation, index) => ({
        url: citation.url || citation,
        title: citation.title || `Source ${index + 1}`,
        snippet: citation.snippet || citation.text || '',
        relevance: citation.score || 0.8,
        isVerified: true,
        domain: citation.url ? new URL(citation.url).hostname : ''
      }));

      // Add synthesized summary as primary source
      if (mainContent) {
        results.unshift({
          url: '#ai-synthesis',
          title: '🔬 Research Synthesis',
          snippet: mainContent.substring(0, 500) + (mainContent.length > 500 ? '...' : ''),
          fullContent: mainContent,
          relevance: 1.0,
          isVerified: true,
          isSynthesized: true
        });
      }

      // Extract related questions for further research
      const relatedQuestions = data.related_questions || [];

      // Parse key insights from the content
      const insights = this.extractKeyInsights(mainContent);

      return {
        success: true,
        results,
        summary: mainContent,
        relatedQuestions,
        insights,
        citations: citations.length,
        creditsUsed: 1
      };

    } catch (error) {
      console.error('Perplexity research error:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        summary: ''
      };
    }
  }

  /**
   * Research using Claude API (fallback)
   */
  static async claudeResearch({ query, topic, context }) {
    try {
      const systemPrompt = `You are a research assistant specializing in YouTube content creation.
Generate comprehensive research based on your knowledge up to January 2025.
Focus on providing factual, engaging information suitable for video scripts.
${context ? `Context: ${context}` : ''}`;

      const userPrompt = `Research the following for a YouTube video:
Query: "${query}"
${topic ? `Topic: ${topic}` : ''}

Provide a comprehensive research summary including:
1. Key facts and statistics
2. Important concepts and definitions
3. Current trends and developments
4. Common questions and answers
5. Interesting angles for content creation
6. Expert perspectives
7. Practical applications and examples

Format your response as structured JSON with these sections:
{
  "summary": "Overall research summary",
  "keyFacts": ["fact1", "fact2", ...],
  "trends": ["trend1", "trend2", ...],
  "angles": ["angle1", "angle2", ...],
  "questions": ["question1", "question2", ...],
  "examples": ["example1", "example2", ...]
}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      
      // Try to parse JSON response
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        // If not JSON, create structured data from text
        parsedContent = {
          summary: content,
          keyFacts: this.extractBulletPoints(content, 'facts'),
          trends: this.extractBulletPoints(content, 'trends'),
          angles: this.extractBulletPoints(content, 'angles'),
          questions: this.extractBulletPoints(content, 'questions'),
          examples: this.extractBulletPoints(content, 'examples')
        };
      }

      // Format as research results
      const results = [
        {
          url: '#claude-research',
          title: '🤖 AI Research Analysis',
          snippet: parsedContent.summary?.substring(0, 500) || content.substring(0, 500),
          fullContent: parsedContent.summary || content,
          relevance: 1.0,
          isVerified: true,
          isSynthesized: true
        }
      ];

      // Add structured insights as separate "sources"
      if (parsedContent.keyFacts?.length > 0) {
        results.push({
          url: '#key-facts',
          title: '📊 Key Facts & Statistics',
          snippet: parsedContent.keyFacts.slice(0, 3).join(' • '),
          fullContent: parsedContent.keyFacts.join('\n'),
          relevance: 0.95,
          isVerified: true
        });
      }

      if (parsedContent.trends?.length > 0) {
        results.push({
          url: '#current-trends',
          title: '📈 Current Trends',
          snippet: parsedContent.trends.slice(0, 2).join(' • '),
          fullContent: parsedContent.trends.join('\n'),
          relevance: 0.9,
          isVerified: true
        });
      }

      // Generate related questions
      const relatedQuestions = parsedContent.questions || [
        `What are the latest developments in ${query}?`,
        `How to get started with ${query}?`,
        `Common mistakes to avoid with ${query}`,
        `Best practices for ${query}`,
        `Future of ${query}`
      ];

      return {
        success: true,
        results,
        summary: parsedContent.summary || content,
        relatedQuestions,
        insights: {
          facts: parsedContent.keyFacts || [],
          trends: parsedContent.trends || [],
          angles: parsedContent.angles || [],
          examples: parsedContent.examples || []
        },
        creditsUsed: 1
      };

    } catch (error) {
      console.error('Claude research error:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        summary: ''
      };
    }
  }

  /**
   * Extract key insights from research content
   */
  static extractKeyInsights(content) {
    const insights = {
      statistics: [],
      quotes: [],
      trends: [],
      facts: []
    };

    // Extract statistics (numbers with context)
    const statMatches = content.match(/\d+%[^.]*\.|[\d,]+\s+\w+[^.]*statistics|survey[^.]*\d+/gi) || [];
    insights.statistics = statMatches.slice(0, 5);

    // Extract potential quotes
    const quoteMatches = content.match(/"[^"]{20,200}"/g) || [];
    insights.quotes = quoteMatches.slice(0, 3);

    // Extract trends
    const trendKeywords = ['trending', 'growing', 'increasing', 'popular', 'emerging'];
    const trendMatches = content.split('.').filter(sentence => 
      trendKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    insights.trends = trendMatches.slice(0, 3).map(s => s.trim());

    // Extract key facts
    const factKeywords = ['research shows', 'studies indicate', 'according to', 'data reveals'];
    const factMatches = content.split('.').filter(sentence => 
      factKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    insights.facts = factMatches.slice(0, 5).map(s => s.trim());

    return insights;
  }

  /**
   * Extract bullet points from content
   */
  static extractBulletPoints(content, type) {
    const lines = content.split('\n');
    const bullets = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        bullets.push(trimmed.replace(/^[•\-\*\d+\.]\s*/, ''));
      }
    }

    return bullets.slice(0, 5); // Limit to 5 items
  }

  /**
   * Format research for script generation
   */
  static formatForScriptGeneration(researchResult) {
    if (!researchResult.success) {
      return {
        sources: [],
        summary: '',
        keyPoints: []
      };
    }

    const sources = researchResult.results
      .filter(r => !r.url.startsWith('#'))
      .map(r => ({
        url: r.url,
        title: r.title,
        content: r.snippet,
        verified: r.isVerified
      }));

    const keyPoints = [];
    
    // Add insights as key points
    if (researchResult.insights) {
      if (researchResult.insights.facts?.length > 0) {
        keyPoints.push(...researchResult.insights.facts);
      }
      if (researchResult.insights.statistics?.length > 0) {
        keyPoints.push(...researchResult.insights.statistics);
      }
    }

    return {
      sources,
      summary: researchResult.summary,
      keyPoints,
      relatedTopics: researchResult.relatedQuestions || []
    };
  }
}

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResearchService;
  module.exports.ResearchService = ResearchService;
}

export default ResearchService;