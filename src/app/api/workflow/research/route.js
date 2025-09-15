import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper function to extract relevant snippet from content
function extractRelevantSnippet(content, index) {
  // Try to find a relevant sentence from the content
  const sentences = content.split('. ');
  if (sentences[index]) {
    return sentences[index] + '.';
  }
  return content.substring(index * 100, (index + 1) * 100) + '...';
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, topic, workflowId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use Perplexity API for comprehensive research
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            model: 'sonar-small-online', // or 'sonar-medium-online' for better quality
            messages: [
              {
                role: 'system',
                content: 'You are a research assistant helping to gather information for YouTube video scripts. Provide comprehensive, factual information with sources.'
              },
              {
                role: 'user',
                content: `Research the following topic for a YouTube video script: "${query}". ${topic ? `The main video topic is: ${topic}.` : ''} Please provide key facts, statistics, recent developments, and interesting angles. Include sources.`
              }
            ],
            stream: false,
            return_citations: true,
            return_related_questions: true,
            search_recency_filter: 'month', // Get recent information
            top_p: 0.9,
            temperature: 0.1 // Low temperature for factual responses
          })
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          
          // Extract the main content
          const mainContent = perplexityData.choices?.[0]?.message?.content || '';
          
          // Parse citations from the response
          const citations = perplexityData.citations || [];
          
          // Format results to match our structure
          const results = citations.map((citation, index) => ({
            url: citation.url || citation,
            title: citation.title || `Source ${index + 1}`,
            snippet: citation.snippet || citation.text || extractRelevantSnippet(mainContent, index),
            relevance: citation.score || 0.8,
            isVerified: true
          }));

          // Add the synthesized answer as the first "source"
          if (mainContent) {
            results.unshift({
              url: '#synthesized',
              title: '🤖 AI Research Summary',
              snippet: mainContent.substring(0, 500) + (mainContent.length > 500 ? '...' : ''),
              fullContent: mainContent,
              relevance: 1.0,
              isVerified: true,
              isSynthesized: true
            });
          }

          // Extract related questions if available
          const relatedQuestions = perplexityData.related_questions || [];

          return NextResponse.json({
            results,
            relatedQuestions,
            creditsUsed: 3, // Perplexity queries might cost more credits
            researchSummary: mainContent
          });
        }
      } catch (perplexityError) {
        console.error('Perplexity API error:', perplexityError);
      }
    }

    // Try Claude Web Search as fallback
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            temperature: 0.1,
            system: 'You are a research assistant. Search the web for information and return relevant results in JSON format.',
            messages: [
              {
                role: 'user',
                content: `Search the web for: "${query}". Return results as JSON with this structure: { "results": [{ "title": "...", "url": "...", "snippet": "..." }], "summary": "..." }`
              }
            ],
            tools: [
              {
                type: 'computer_20241022',
                name: 'web_search',
                description: 'Search the web for information',
                input_schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' }
                  },
                  required: ['query']
                }
              }
            ]
          })
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          
          // Parse the response to extract search results
          let results = [];
          let researchSummary = '';
          
          try {
            const content = claudeData.content?.[0]?.text || '';
            const parsed = JSON.parse(content);
            
            results = parsed.results?.map((item, index) => ({
              url: item.url,
              title: item.title,
              snippet: item.snippet,
              relevance: 1 - (index * 0.05),
              isVerified: false
            })) || [];
            
            researchSummary = parsed.summary || `Found ${results.length} results for "${query}"`;
          } catch (parseError) {
            // If parsing fails, create mock results from the response
            console.log('Claude response parsing failed, using fallback');
          }

          // Suggest related searches
          const relatedQuestions = [
            `What are the latest developments in ${query}?`,
            `How does ${query} work?`,
            `What are the benefits of ${query}?`,
            `${query} best practices`,
            `Common misconceptions about ${query}`
          ];

          return NextResponse.json({
            results,
            relatedQuestions,
            creditsUsed: 1, // Claude API usage
            researchSummary,
            searchProvider: 'claude'
          });
        }
      } catch (claudeError) {
        console.error('Claude Web Search error:', claudeError);
      }
    }

    // If no search APIs are configured, return educational results
    // These are real, useful resources for content creators
    const educationalResults = [
      {
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        title: `Google Search: ${query}`,
        snippet: `Search Google for comprehensive information about "${query}" from across the web.`
      },
      {
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        title: `YouTube Search: ${query}`,
        snippet: `Search YouTube for videos related to "${query}" to see what content already exists and identify gaps in coverage.`
      },
      {
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(query)}`,
        title: `Google Trends: ${query}`,
        snippet: `Explore search interest over time for "${query}" and discover related topics and queries that are trending.`
      },
      {
        url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
        title: `Reddit Discussions: ${query}`,
        snippet: `Find community discussions and real user questions about "${query}" on Reddit.`
      },
      {
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
        title: `Academic Research: ${query}`,
        snippet: `Access scholarly articles and academic research papers about "${query}" for authoritative information.`
      },
      {
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        title: `Wikipedia: ${query}`,
        snippet: `Find encyclopedia articles about "${query}" for factual background information and references.`
      }
    ];

    // Add topic-specific resources if we have a topic
    if (topic) {
      educationalResults.push({
        url: `https://answerthepublic.com/reports/${encodeURIComponent(topic.toLowerCase().replace(/\s+/g, '-'))}`,
        title: `Common Questions About ${topic}`,
        snippet: `Discover what people are asking about "${topic}" to create content that answers real questions.`
      });
    }

    return NextResponse.json({
      results: educationalResults,
      creditsUsed: 0, // No credits for educational links
      message: 'Using educational resources. Configure search API for web results.'
    });

  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform research' },
      { status: 500 }
    );
  }
}