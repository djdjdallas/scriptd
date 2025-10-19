import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/workflow/approve-outline
 *
 * Approve or reject a generated outline
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { outlineId, status, feedback, edits } = body;

    console.log(`${status === 'approved' ? '✅' : '❌'} Outline ${outlineId} ${status}`);

    // Validate required fields
    if (!outlineId || !status) {
      return NextResponse.json({
        error: 'Missing required fields: outlineId, status'
      }, { status: 400 });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({
        error: 'Status must be either "approved" or "rejected"'
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

    // Fetch the outline to verify ownership
    const { data: outline, error: fetchError } = await supabase
      .from('script_outlines')
      .select('*, script_workflows!inner(user_id)')
      .eq('id', outlineId)
      .single();

    if (fetchError) {
      console.error('Error fetching outline:', fetchError);
      return NextResponse.json({
        error: 'Outline not found'
      }, { status: 404 });
    }

    // Verify user owns this workflow
    if (outline.script_workflows.user_id !== user.id) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 403 });
    }

    // Prepare update data
    const updateData = {
      status,
      user_feedback: feedback || null
    };

    // If approved, set approved_at timestamp
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();

      // If user provided edits, merge them into outline_data
      if (edits && Object.keys(edits).length > 0) {
        console.log('📝 Applying user edits to outline');
        const updatedOutlineData = {
          ...outline.outline_data,
          ...edits,
          userEdited: true,
          editedAt: new Date().toISOString()
        };
        updateData.outline_data = updatedOutlineData;
      }
    }

    // Update the outline
    const { data: updated, error: updateError } = await supabase
      .from('script_outlines')
      .update(updateData)
      .eq('id', outlineId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating outline:', updateError);
      return NextResponse.json({
        error: 'Failed to update outline'
      }, { status: 500 });
    }

    // If approved, update workflow progress to unlock draft step
    if (status === 'approved') {
      const { data: workflow, error: workflowError } = await supabase
        .from('script_workflows')
        .select('completed_steps, workflow_data')
        .eq('id', outline.workflow_id)
        .single();

      if (!workflowError && workflow) {
        const completedSteps = workflow.completed_steps || [];
        const workflowData = workflow.workflow_data || {};

        // Add outline step to completed if not already there
        if (!completedSteps.includes('outlineApproval')) {
          completedSteps.push('outlineApproval');
        }

        // Store outline reference in workflow data
        workflowData.approvedOutline = {
          id: outlineId,
          approvedAt: new Date().toISOString(),
          chunkCount: outline.chunk_count,
          totalMinutes: outline.total_minutes
        };

        await supabase
          .from('script_workflows')
          .update({
            completed_steps: completedSteps,
            workflow_data: workflowData,
            updated_at: new Date().toISOString()
          })
          .eq('id', outline.workflow_id);

        console.log('✅ Workflow updated with approved outline');
      }
    }

    return NextResponse.json({
      success: true,
      outline: updated,
      message: status === 'approved'
        ? 'Outline approved successfully. You can now generate the script.'
        : 'Outline rejected. Please regenerate with your feedback.'
    });

  } catch (error) {
    console.error('Error in approve-outline:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * PUT /api/workflow/approve-outline
 *
 * Regenerate an outline with user feedback
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { outlineId, feedback } = body;

    if (!outlineId || !feedback) {
      return NextResponse.json({
        error: 'Missing required fields: outlineId, feedback'
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

    // Update outline status to regenerating
    const { error: updateError } = await supabase
      .from('script_outlines')
      .update({
        status: 'regenerating',
        user_feedback: feedback
      })
      .eq('id', outlineId);

    if (updateError) {
      console.error('Error updating outline:', updateError);
      return NextResponse.json({
        error: 'Failed to update outline'
      }, { status: 500 });
    }

    // Note: Actual regeneration would trigger the generate-outline endpoint
    // This endpoint just marks it for regeneration

    return NextResponse.json({
      success: true,
      message: 'Outline marked for regeneration. Please regenerate the outline with your feedback.'
    });

  } catch (error) {
    console.error('Error in PUT approve-outline:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
