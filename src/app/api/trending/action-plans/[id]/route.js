import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

// DELETE - Delete a specific action plan
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete the action plan (only if it belongs to the user)
    const { error: deleteError } = await supabase
      .from('action_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      apiLogger.error('Error deleting action plan', deleteError, { planId: id, userId: user.id });
      return NextResponse.json(
        { error: 'Failed to delete action plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Action plan deleted successfully'
    });

  } catch (error) {
    apiLogger.error('Error in action plan DELETE', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch a specific action plan
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch the specific action plan
    const { data: plan, error: fetchError } = await supabase
      .from('action_plans')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json(
        { error: 'Action plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);

  } catch (error) {
    apiLogger.error('Error in action plan GET', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}