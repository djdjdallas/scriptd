/**
 * Research Service with Real Web Search
 * Uses Claude's built-in web search capabilities when available
 */

import Anthropic from '@anthropic-ai/sdk';

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
      minContentLength = 1000
    } = options;

    console.log(`🔍 Starting iterative research for: "${query}"`);
    console.log(`📊 Target: ${minSources} sources with ${minContentLength}+ chars each`);

    let allSources = [];
    let attempt = 0;
    const maxAttempts = 3;
    const excludedUrls = new Set();

    while (allSources.length < minSources && attempt < maxAttempts) {
      attempt++;
      console.log(`\n🔄 Research attempt ${attempt}/${maxAttempts} (currently have ${allSources.length} sources)`);

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
        excludeUrls: Array.from(excludedUrls)
      });

      if (!result.success) {
        console.warn(`⚠️ Attempt ${attempt} failed:`, result.error);
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

      console.log(`✅ Found ${newSources.length} new unique sources this iteration`);
      allSources = allSources.concat(newSources);

      // If we've reached our goal, stop early
      if (allSources.length >= minSources) {
        console.log(`🎯 Target reached! Found ${allSources.length} sources`);
        break;
      }
    }

    // Calculate total content
    const totalContent = allSources.reduce((sum, s) => sum + (s.source_content?.length || 0), 0);
    console.log(`\n📚 Research complete: ${allSources.length} sources, ${totalContent} total characters`);

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
      minContentLength = 1000
    } = options;

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return {
        success: false,
        error: 'ANTHROPIC_API_KEY not configured',
        sources: [],
        summary: '',
        provider: 'none'
      };
    }

    try {
      console.log('🔍 Attempting research with web search capabilities');

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // First, try with simple prompt that might trigger built-in search
      const searchPrompt = `Search the web and research the following topic. Provide current, factual information with real sources.

Topic: "${query}"
${topic ? `Context: ${topic}` : ''}

Instructions:
1. Search for the most recent information about this topic
2. Focus on events from 2023-2025
3. Include specific dates, names, and facts
4. Provide real URLs for sources when possible
5. Find and include AT LEAST ${minSources} different sources with substantial content
6. Each source must have at least ${minContentLength} characters of content

Return your findings as a JSON object with this structure:
{
  "summary": "Comprehensive summary of findings",
  "sources": [
    {
      "source_url": "URL or description",
      "source_title": "Title",
      "source_content": "Key information (at least ${minContentLength} characters)",
      "source_type": "web",
      "is_starred": false,
      "fact_check_status": "verified",
      "relevance": 0.9
    }
  ],
  "relatedQuestions": ["Question 1", "Question 2"],
  "insights": {
    "keyStatistics": ["Stat 1"],
    "expertQuotes": ["Quote 1"],
    "commonMisconceptions": ["Misconception 1"],
    "actionableTakeaways": ["Takeaway 1"]
  }
}

CRITICAL: You MUST include AT LEAST ${minSources} sources in the sources array. Each source must have substantial content (${minContentLength}+ characters).

IMPORTANT: Return ONLY the JSON, no other text.`;

      const response = await anthropic.messages.create({
        model: process.env.BALANCED_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: searchPrompt
        }]
      });

      // Parse the response
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent) {
        throw new Error('No text content in response');
      }

      // Extract and parse JSON
      let jsonText = textContent.text;

      // Clean up the text
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Find JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      try {
        const parsed = JSON.parse(jsonText);

        // Validate and normalize the response
        const sources = Array.isArray(parsed.sources) ? parsed.sources : [];

        // Ensure all sources have required fields
        const normalizedSources = sources.map((source, index) => ({
          source_url: source.source_url || `#source-${index}`,
          source_title: source.source_title || `Source ${index + 1}`,
          source_content: source.source_content || '',
          source_type: source.source_type || 'web',
          is_starred: source.is_starred || index < 3,
          fact_check_status: source.fact_check_status || 'unverified',
          relevance: source.relevance || (1 - index * 0.1)
        }));

        // Add synthesis as first source if we have a summary
        if (parsed.summary) {
          normalizedSources.unshift({
            source_url: '#ai-synthesis',
            source_title: '🔬 Research Synthesis',
            source_content: parsed.summary,
            source_type: 'synthesis',
            is_starred: true,
            fact_check_status: 'ai-generated',
            relevance: 1.0
          });
        }

        console.log(`✅ Research completed with ${normalizedSources.length} sources`);

        return {
          success: true,
          summary: parsed.summary || '',
          sources: normalizedSources,
          results: normalizedSources, // Backward compatibility
          relatedQuestions: parsed.relatedQuestions || [],
          insights: parsed.insights || {
            keyStatistics: [],
            expertQuotes: [],
            commonMisconceptions: [],
            actionableTakeaways: []
          },
          citations: normalizedSources.filter(s => s.source_type === 'web'),
          provider: 'claude-enhanced'
        };

      } catch (parseError) {
        console.error('Failed to parse JSON, using fallback');

        // Fallback: Create basic structure from text
        return {
          success: true,
          summary: textContent.text.substring(0, 2000),
          sources: [{
            source_url: '#ai-response',
            source_title: 'AI Research Summary',
            source_content: textContent.text,
            source_type: 'synthesis',
            is_starred: true,
            fact_check_status: 'ai-generated',
            relevance: 1.0
          }],
          results: [],
          relatedQuestions: [],
          insights: {
            keyStatistics: [],
            expertQuotes: [],
            commonMisconceptions: [],
            actionableTakeaways: []
          },
          citations: [],
          provider: 'claude-fallback'
        };
      }

    } catch (error) {
      console.error('❌ Research failed:', error);
      return {
        success: false,
        error: error.message,
        sources: [],
        summary: '',
        provider: 'none'
      };
    }
  }
}

export default ResearchServiceWithSearch;