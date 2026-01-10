import { NextResponse } from 'next/server';
import ResearchService from '@/lib/ai/research-service';
import ResearchServiceWithSearch from '@/lib/ai/research-service-with-search';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    // Check for Edge Function authentication FIRST
    const edgeFunctionUserId = request.headers.get('X-User-Id');
    const edgeFunctionJobId = request.headers.get('X-Job-Id');
    const edgeFunctionSecret = request.headers.get('X-Edge-Function-Secret');

    let user = null;
    let supabase = null;

    // If request is from Edge Function with proper headers, bypass cookie auth
    if (edgeFunctionUserId && edgeFunctionJobId && edgeFunctionSecret) {
      const expectedSecret = process.env.EDGE_FUNCTION_SECRET;

      if (!expectedSecret) {
        apiLogger.error('EDGE_FUNCTION_SECRET environment variable is not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      if (edgeFunctionSecret === expectedSecret) {
        user = { id: edgeFunctionUserId };

        // For Edge Function requests, create a service role client
        const { createClient: createServiceClient } = require('@supabase/supabase-js');
        supabase = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
      } else {
        apiLogger.warn('Edge Function authentication failed: Invalid secret');
        return NextResponse.json({ error: 'Unauthorized', details: 'Invalid Edge Function secret' }, { status: 401 });
      }
    } else {
      // Standard cookie-based authentication for browser requests
      supabase = await createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        apiLogger.warn('Authentication failed', { error: authError?.message });
        return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
      }
      user = authData.user;
    }

    const {
      query,
      topic,
      context,
      workflowId,
      targetDuration,
      enableExpansion = false,
      contentIdeaInfo,
      niche
    } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Try the enhanced service first, fall back to regular if needed
    let researchResult;

    try {
      // Use enhanced research with gap analysis if enabled
      if (enableExpansion) {
        researchResult = await ResearchService.performEnhancedResearch({
          query,
          topic,
          context,
          targetDuration: targetDuration || 600,
          enableExpansion: true,
          maxExpansionSearches: 6,
          minSources: 10,
          minContentLength: 1000,
          contentIdeaInfo,
          niche
        });
      } else {
        // First attempt with enhanced search service
        researchResult = await ResearchServiceWithSearch.performResearch({
          query,
          topic,
          context,
          minSources: 10,
          minContentLength: 1000,
          contentIdeaInfo,
          niche
        });
      }
    } catch (error) {
      apiLogger.warn('Enhanced search failed, falling back to regular service', { error: error.message });
      // Fallback to regular service
      researchResult = await ResearchService.performResearch({
        query,
        topic,
        context,
        minSources: 10,
        minContentLength: 1000,
        contentIdeaInfo,
        niche
      });
    }

    if (!researchResult.success) {
      const errorMessage = researchResult.error || 'Research failed';
      apiLogger.error('Research failed', null, { error: errorMessage, provider: researchResult.provider });

      return NextResponse.json(
        {
          error: errorMessage,
          suggestion: researchResult.suggestion,
          details: `Provider: ${researchResult.provider || 'unknown'}. Check server logs for more details.`
        },
        { status: 500 }
      );
    }

    // Save research to workflow if workflowId provided
    if (workflowId && researchResult.sources?.length > 0) {
      // Clear existing research for this workflow
      await supabase
        .from('workflow_research')
        .delete()
        .eq('workflow_id', workflowId);

      // Insert new research sources
      const sourcesToSave = researchResult.sources.map((source, index) => ({
        workflow_id: workflowId,
        source_type: source.source_type || 'web',
        source_url: source.source_url,
        source_title: source.source_title,
        source_content: source.source_content,
        fact_check_status: source.fact_check_status || 'verified',
        is_starred: source.is_starred || false,
        is_selected: true,
        relevance: source.relevance || (1 - index * 0.1),
        added_at: new Date().toISOString()
      }));

      const { error: saveError } = await supabase
        .from('workflow_research')
        .insert(sourcesToSave)
        .select();

      if (saveError) {
        apiLogger.error('Error saving research', saveError, { workflowId });
      }
    }

    // Track credit usage
    const creditsUsed = 1;

    // Update user credits
    const { data: currentUser } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (currentUser && currentUser.credits > 0) {
      await supabase
        .from('users')
        .update({
          credits: currentUser.credits - creditsUsed
        })
        .eq('id', user.id);

      // Log transaction
      await supabase
        .from('credits_transactions')
        .insert({
          user_id: user.id,
          amount: -creditsUsed,
          type: 'usage',
          description: `Research: ${query}`,
          metadata: {
            workflowId,
            provider: researchResult.provider,
            sourcesCount: researchResult.sources?.length
          }
        });
    }

    // Return results in format expected by frontend
    return NextResponse.json({
      success: true,
      results: researchResult.sources || [],
      sources: researchResult.sources || [],
      summary: researchResult.summary,
      researchSummary: researchResult.summary,
      relatedQuestions: researchResult.relatedQuestions || [],
      insights: researchResult.insights,
      expansionPlan: researchResult.expansionPlan,
      metrics: researchResult.metrics,
      creditsUsed,
      searchProvider: researchResult.provider,
      citations: researchResult.citations || [],
      toolsUsed: researchResult.toolsUsed
    });

  } catch (error) {
    apiLogger.error('Research API error', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
