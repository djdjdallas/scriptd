import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Manual trigger for metrics collection (for admin users only)
export async function POST(request) {
  try {
    // Check if user is authenticated and is admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Option 1: Call Supabase function directly
    try {
      const { data: result, error } = await supabase.rpc('collect_metrics_direct');
      
      if (error) {
        throw error;
      }
      
      return NextResponse.json({
        success: true,
        message: 'Metrics collection completed via Supabase',
        result
      });
    } catch (supabaseError) {
      console.log('Falling back to API endpoint:', supabaseError);
      
      // Option 2: Fall back to calling the cron endpoint
      const cronUrl = new URL('/api/cron/collect-metrics', request.url);
      const response = await fetch(cronUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || 'default-secret'}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to collect metrics', details: result },
          { status: response.status }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Metrics collection initiated via API',
        result
      });
    }
    
  } catch (error) {
    console.error('Error triggering metrics collection:', error);
    return NextResponse.json(
      { error: 'Failed to trigger metrics collection', details: error.message },
      { status: 500 }
    );
  }
}