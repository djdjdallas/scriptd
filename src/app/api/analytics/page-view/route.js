import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    // Create supabase client with proper error handling
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    const { page, referrer, metadata } = await request.json();
    
    // Get user session if available
    const sessionId = request.cookies.get('session_id')?.value || 
                     `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Parse referrer for UTM parameters
    const url = new URL(request.url);
    const utmSource = url.searchParams.get('utm_source');
    const utmMedium = url.searchParams.get('utm_medium');
    const utmCampaign = url.searchParams.get('utm_campaign');
    
    // Store page view
    const { data, error } = await supabase
      .from('page_views')
      .insert({
        page,
        session_id: sessionId,
        referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        metadata,
        viewed_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Set session cookie if not exists
    const response = NextResponse.json({ success: true });
    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    return response;
  } catch (error) {
    apiLogger.error('Failed to track page view', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}