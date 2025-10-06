import { NextResponse } from 'next/server';
import ResearchService from '@/lib/ai/research-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, topic, context, workflowId } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Research request:', { query, topic, workflowId });

    // Perform research using Claude with web search
    const researchResult = await ResearchService.performResearch({
      query,
      topic,
      context,
      minSources: 5,
      minContentLength: 1000
    });

    if (!researchResult.success) {
      console.error('❌ Research failed:', researchResult.error);
      return NextResponse.json(
        { error: researchResult.error || 'Research failed' },
        { status: 500 }
      );
    }

    console.log('✅ Research successful:', {
      sourcesCount: researchResult.sources?.length || 0,
      provider: researchResult.provider,
      totalContent: researchResult.sources?.reduce((sum, s) => sum + (s.source_content?.length || 0), 0)
    });

    // Calculate credits (1 credit per research call)
    const creditsUsed = 1;

    // Update user credits
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('credits_used')
      .eq('user_id', user.id)
      .single();

    if (currentCredits) {
      await supabase
        .from('user_credits')
        .update({
          credits_used: (currentCredits.credits_used || 0) + creditsUsed
        })
        .eq('user_id', user.id);
    }

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
        source_content: source.source_content, // Already has full content!
        fact_check_status: source.fact_check_status || 'verified',
        is_starred: source.is_starred || false,
        is_selected: true, // Auto-select since Claude verified them
        relevance: source.relevance || 0.8,
        added_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('workflow_research')
        .insert(sourcesToSave);

      if (insertError) {
        console.error('Failed to save research:', insertError);
      } else {
        console.log(`✅ Saved ${sourcesToSave.length} sources to workflow`);
      }
    }

    // Return results in format expected by frontend
    return NextResponse.json({
      success: true,
      results: researchResult.sources || [],
      summary: researchResult.summary,
      researchSummary: researchResult.summary, // Backward compatibility
      relatedQuestions: researchResult.relatedQuestions || [],
      insights: researchResult.insights,
      creditsUsed,
      searchProvider: researchResult.provider,
      citations: researchResult.citations || []
    });

  } catch (error) {
    console.error('❌ Research API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform research',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}