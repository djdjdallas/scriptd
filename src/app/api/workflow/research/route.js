import { NextResponse } from 'next/server';
import ResearchService from '@/lib/ai/research-service';
import ResearchServiceWithSearch from '@/lib/ai/research-service-with-search';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      query,
      topic,
      context,
      workflowId,
      targetDuration,
      enableExpansion = false, // New option for enhanced research with gap analysis
      contentIdeaInfo, // Rich content idea context from Summary step
      niche // Content niche for targeted research
    } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Research request:', {
      query,
      topic,
      workflowId,
      targetDuration,
      enableExpansion,
      hasContentIdeaInfo: !!contentIdeaInfo,
      niche
    });

    // Try the enhanced service first, fall back to regular if needed
    let researchResult;

    try {
      // Use enhanced research with gap analysis if enabled
      if (enableExpansion) {
        console.log('🔬 Using enhanced research with gap analysis and expansion');
        researchResult = await ResearchService.performEnhancedResearch({
          query,
          topic,
          context,
          targetDuration: targetDuration || 600,
          enableExpansion: true,
          maxExpansionSearches: 6,
          minSources: 10,
          minContentLength: 1000,
          contentIdeaInfo, // Pass content idea context for targeted research
          niche // Pass niche for better query generation
        });
      } else {
        // First attempt with enhanced search service
        researchResult = await ResearchServiceWithSearch.performResearch({
          query,
          topic,
          context,
          minSources: 10, // Increased from 5 for better content depth
          minContentLength: 1000,
          contentIdeaInfo, // Pass content idea context for targeted research
          niche // Pass niche for better query generation
        });
      }
    } catch (error) {
      console.warn('Enhanced search failed, falling back to regular service:', error.message);
      // Fallback to regular service
      researchResult = await ResearchService.performResearch({
        query,
        topic,
        context,
        minSources: 10, // Increased from 5 for better content depth
        minContentLength: 1000,
        contentIdeaInfo, // Pass content idea context for targeted research
        niche // Pass niche for better query generation
      });
    }

    if (!researchResult.success) {
      console.error('❌ Research failed:', researchResult.error);
      return NextResponse.json(
        {
          error: researchResult.error || 'Research failed',
          suggestion: researchResult.suggestion
        },
        { status: 500 }
      );
    }

    console.log('✅ Research successful:', {
      sourcesCount: researchResult.sources?.length || 0,
      provider: researchResult.provider,
      totalContent: researchResult.sources?.reduce((sum, s) => sum + (s.source_content?.length || 0), 0)
    });

    // Save research to workflow if workflowId provided
    if (workflowId && researchResult.sources?.length > 0) {
      console.log('💾 Saving research to workflow:', workflowId);

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
        source_content: source.source_content, // Full content from Claude!
        fact_check_status: source.fact_check_status || 'verified',
        is_starred: source.is_starred || false,
        is_selected: true, // Auto-select since Claude verified them
        relevance: source.relevance || (1 - index * 0.1),
        added_at: new Date().toISOString()
      }));

      const { data: savedSources, error: saveError } = await supabase
        .from('workflow_research')
        .insert(sourcesToSave)
        .select();

      if (saveError) {
        console.error('Error saving research:', saveError);
        // Log specific error details to help with debugging
        if (saveError.code === 'PGRST204' && saveError.message.includes('relevance')) {
          console.error('❌ Database schema issue: relevance column missing');
          console.error('Please run the migration to add the relevance column');
        }
      } else {
        console.log(`✅ Saved ${savedSources?.length || sourcesToSave.length} sources to workflow`);
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
      sources: researchResult.sources || [], // Include sources directly
      summary: researchResult.summary,
      researchSummary: researchResult.summary, // Backward compatibility
      relatedQuestions: researchResult.relatedQuestions || [],
      insights: researchResult.insights,
      expansionPlan: researchResult.expansionPlan, // Include expansion plan if available
      metrics: researchResult.metrics, // Include metrics if available
      creditsUsed,
      searchProvider: researchResult.provider,
      citations: researchResult.citations || [],
      toolsUsed: researchResult.toolsUsed // Include tool usage stats
    });

  } catch (error) {
    console.error('❌ Research API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}