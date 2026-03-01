import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/auth/admin-guard';

export async function GET(request) {
  try {
    const { user, supabase } = await getAuthenticatedUser();

    const admin = await isAdminUser(user, supabase);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const channelId = searchParams.get('channelId');
    const userId = searchParams.get('userId');
    const path = searchParams.get('path'); // 'enhanced' | 'v2_standard'
    const hookFilter = searchParams.get('hook'); // 'engine' | 'fallback'
    const complianceFilter = searchParams.get('compliance'); // 'good' | 'needs_work'

    // Build query for paginated logs
    let query = supabase
      .from('generation_debug_logs')
      .select(`
        *,
        scripts:script_id (id, title),
        channels:channel_id (id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (channelId) query = query.eq('channel_id', channelId);
    if (userId) query = query.eq('user_id', userId);
    if (path) query = query.eq('generation_path', path);
    if (hookFilter === 'engine') {
      query = query.eq('hook_engine_used', true).eq('hook_engine_fallback', false);
    } else if (hookFilter === 'fallback') {
      query = query.eq('hook_engine_fallback', true);
    }

    const { data: logs, count, error } = await query;

    if (error) {
      console.error('Debug logs query error:', error);
      return NextResponse.json({ error: 'Failed to fetch debug logs' }, { status: 500 });
    }

    // Client-side compliance filtering (jsonb field, can't easily filter in Supabase query)
    let filteredLogs = logs || [];
    if (complianceFilter === 'good') {
      filteredLogs = filteredLogs.filter(l => l.compliance_scores?.overall >= 80);
    } else if (complianceFilter === 'needs_work') {
      filteredLogs = filteredLogs.filter(l =>
        l.compliance_scores?.overall != null && l.compliance_scores.overall < 60
      );
    }

    // Fetch aggregate stats (all-time, unfiltered)
    const { data: allLogs } = await supabase
      .from('generation_debug_logs')
      .select('generation_path, hook_engine_used, hook_engine_fallback, compliance_scores, voice_confidence_score, profile_source');

    const stats = computeAggregateStats(allLogs || []);

    return NextResponse.json({
      success: true,
      logs: filteredLogs,
      total: count || 0,
      limit,
      offset,
      stats,
    });
  } catch (error) {
    console.error('Admin debug route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function computeAggregateStats(logs) {
  if (logs.length === 0) {
    return {
      total: 0,
      enhancedPercent: 0,
      hookSuccessRate: 0,
      avgComplianceScore: 0,
      avgVoiceConfidence: 0,
      profileSourceDistribution: { deep: 0, basic: 0, placeholder: 0 },
    };
  }

  const total = logs.length;
  const enhancedCount = logs.filter(l => l.generation_path === 'enhanced').length;

  const hookAttempts = logs.filter(l => l.hook_engine_used);
  const hookSuccesses = hookAttempts.filter(l => !l.hook_engine_fallback);

  const complianceLogs = logs.filter(l => l.compliance_scores?.overall != null);
  const avgCompliance = complianceLogs.length > 0
    ? Math.round(complianceLogs.reduce((s, l) => s + l.compliance_scores.overall, 0) / complianceLogs.length)
    : 0;

  const confidenceLogs = logs.filter(l => l.voice_confidence_score != null);
  const avgConfidence = confidenceLogs.length > 0
    ? Math.round(confidenceLogs.reduce((s, l) => s + l.voice_confidence_score, 0) / confidenceLogs.length)
    : 0;

  const profileSourceDistribution = { deep: 0, basic: 0, placeholder: 0 };
  logs.forEach(l => {
    if (l.profile_source && profileSourceDistribution[l.profile_source] !== undefined) {
      profileSourceDistribution[l.profile_source]++;
    }
  });

  return {
    total,
    enhancedPercent: Math.round((enhancedCount / total) * 100),
    hookSuccessRate: hookAttempts.length > 0
      ? Math.round((hookSuccesses.length / hookAttempts.length) * 100)
      : 0,
    avgComplianceScore: avgCompliance,
    avgVoiceConfidence: avgConfidence,
    profileSourceDistribution,
  };
}
