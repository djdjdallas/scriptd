import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateComprehensiveOutline, validateOutlineStructure } from '@/lib/script-generation/outline-generator';
import { validateResearchForDuration, calculateResearchScore } from '@/lib/script-generation/research-validator';

/**
 * POST /api/workflow/generate-outline
 *
 * Generates a comprehensive outline for 35+ minute scripts
 * with research validation and quality scoring
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      workflowId,
      title,
      topic,
      contentPoints,
      targetDuration,
      hook,
      targetAudience,
      tone
    } = body;

    console.log(`📝 Generating outline for workflow ${workflowId} (${Math.ceil(targetDuration / 60)} minutes)`);

    // Validate required fields
    if (!workflowId || !title || !topic || !targetDuration) {
      return NextResponse.json({
        error: 'Missing required fields: workflowId, title, topic, targetDuration'
      }, { status: 400 });
    }

    const totalMinutes = Math.ceil(targetDuration / 60);

    // Validate duration (must be 35+ minutes)
    if (totalMinutes < 35) {
      return NextResponse.json({
        error: 'Outline generation is only available for 35+ minute scripts',
        currentDuration: totalMinutes
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Fetch research for this workflow
    const { data: research, error: researchError } = await supabase
      .from('workflow_research')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('is_selected', true);

    if (researchError) {
      console.error('Error fetching research:', researchError);
      return NextResponse.json({
        error: 'Failed to fetch research data'
      }, { status: 500 });
    }

    console.log(`📚 Found ${research?.length || 0} research sources`);

    // Calculate research score
    const researchScore = calculateResearchScore(research || []);
    console.log(`📊 Research score: ${researchScore.overallScore}`);

    // Validate research adequacy
    const hasUserDocuments = research?.some(r => r.source_type === 'document') || false;
    const validation = validateResearchForDuration(
      { sources: research },
      totalMinutes,
      hasUserDocuments
    );

    console.log(`✅ Research validation:`, {
      isAdequate: validation.isAdequate,
      score: validation.score,
      gaps: validation.gaps.length
    });

    // If research is insufficient, return error with recommendations
    if (!validation.isAdequate) {
      return NextResponse.json({
        error: 'Insufficient research for outline generation',
        validation,
        researchScore,
        recommendations: validation.recommendations
      }, { status: 400 });
    }

    // Determine chunk count based on duration
    const chunkCount = totalMinutes <= 40 ? 3 : totalMinutes <= 50 ? 4 : 5;

    // Generate comprehensive outline
    console.log(`🎯 Generating outline with ${chunkCount} chunks...`);

    const outline = await generateComprehensiveOutline({
      title,
      topic,
      contentPoints: contentPoints?.points || contentPoints || [],
      totalMinutes,
      chunkCount,
      research: { sources: research },
      hook,
      targetAudience,
      tone,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-5-sonnet-20241022'
    });

    if (!outline) {
      return NextResponse.json({
        error: 'Failed to generate outline. Please try again.'
      }, { status: 500 });
    }

    // Validate outline structure
    if (!validateOutlineStructure(outline)) {
      console.error('Generated outline has invalid structure');
      return NextResponse.json({
        error: 'Generated outline validation failed. Please try again.'
      }, { status: 500 });
    }

    // Determine recommended model based on research quality
    const recommendedModel = researchScore.overallScore > 0.8
      ? 'claude-3-5-sonnet'
      : 'claude-3-5-opus';

    // Estimate generation time
    const estimatedMinutes = chunkCount * 4; // ~4 min per chunk
    const estimatedGenerationTime = `${estimatedMinutes}-${estimatedMinutes + 3} minutes`;

    // Save outline to database
    const { data: savedOutline, error: saveError } = await supabase
      .from('script_outlines')
      .insert({
        workflow_id: workflowId,
        title,
        total_minutes: totalMinutes,
        chunk_count: chunkCount,
        outline_data: outline,
        status: 'pending',
        research_score: researchScore.overallScore,
        recommended_model: recommendedModel,
        estimated_generation_time: estimatedGenerationTime
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving outline:', saveError);
      return NextResponse.json({
        error: 'Failed to save outline to database'
      }, { status: 500 });
    }

    console.log(`✅ Outline saved with ID: ${savedOutline.id}`);

    // Return success response
    return NextResponse.json({
      success: true,
      outlineId: savedOutline.id,
      outline,
      researchScore: researchScore.overallScore,
      researchDetails: {
        totalWords: researchScore.totalWords,
        sourceCount: researchScore.sourceCount,
        averageQuality: researchScore.averageQuality,
        breakdown: researchScore.breakdown
      },
      recommendedModel,
      estimatedGenerationTime,
      chunkCount,
      validation
    });

  } catch (error) {
    console.error('Error in generate-outline:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * GET /api/workflow/generate-outline?workflowId=xxx
 *
 * Retrieve the latest outline for a workflow
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json({
        error: 'Missing workflowId parameter'
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Fetch latest outline for this workflow
    const { data: outline, error: fetchError } = await supabase
      .from('script_outlines')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No outline found
        return NextResponse.json({
          outline: null,
          hasOutline: false
        });
      }

      console.error('Error fetching outline:', fetchError);
      return NextResponse.json({
        error: 'Failed to fetch outline'
      }, { status: 500 });
    }

    return NextResponse.json({
      outline,
      hasOutline: true
    });

  } catch (error) {
    console.error('Error in GET generate-outline:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
