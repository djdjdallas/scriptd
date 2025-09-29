import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import ResearchService from '@/lib/ai/research-service';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, topic, workflowId, context } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use the new ResearchService with Perplexity primary and Claude fallback
    const researchResult = await ResearchService.performResearch({
      query,
      topic,
      context,
      includeSources: true
    });

    if (researchResult.success) {
      // Charge 1 credit for research
      const creditsUsed = researchResult.creditsUsed || 1;
      
      // Update user credits
      const { data: currentCredits } = await supabase
        .from('user_credits')
        .select('credits_used')
        .eq('user_id', user.id)
        .single();

      // Update with incremented value
      await supabase
        .from('user_credits')
        .update({ 
          credits_used: (currentCredits?.credits_used || 0) + creditsUsed
        })
        .eq('user_id', user.id);
      
      return NextResponse.json({
        results: researchResult.results,
        relatedQuestions: researchResult.relatedQuestions,
        creditsUsed,
        researchSummary: researchResult.summary,
        insights: researchResult.insights,
        searchProvider: researchResult.provider,
        citations: researchResult.citations
      });
    }

    // If research service fails, try educational fallback

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

    // Charge 1 credit for research (even for educational links)
    const creditsUsed = 1;
    
    // Update user credits
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('credits_used')
      .eq('user_id', user.id)
      .single();

    // Update with incremented value
    await supabase
      .from('user_credits')
      .update({ 
        credits_used: (currentCredits?.credits_used || 0) + creditsUsed
      })
      .eq('user_id', user.id);
    
    return NextResponse.json({
      results: educationalResults,
      creditsUsed,
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