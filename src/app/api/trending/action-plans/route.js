import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

// GET - Fetch all action plans for the current user
export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user's action plans
    const { data: plans, error: fetchError } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      apiLogger.error('Error fetching action plans', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch action plans' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      plans: plans || [],
      total: plans?.length || 0
    });

  } catch (error) {
    apiLogger.error('Error in action plans GET', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}