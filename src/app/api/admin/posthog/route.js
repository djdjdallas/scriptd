import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const POSTHOG_API_BASE = 'https://us.posthog.com';
const PROJECT_ID = 275555;
const DASHBOARD_ID = 960030;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory cache
let cache = {};

function getCacheKey(range) {
  return `posthog_${range}`;
}

function getCachedData(range) {
  const key = getCacheKey(range);
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCachedData(range, data) {
  cache[getCacheKey(range)] = { data, timestamp: Date.now() };
}

function getRangeDays(range) {
  const map = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 };
  return map[range] || 30;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function posthogQuery(apiKey, query) {
  const res = await fetch(`${POSTHOG_API_BASE}/api/projects/${PROJECT_ID}/query/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog query failed (${res.status}): ${text}`);
  }

  return res.json();
}

async function fetchDashboard(apiKey) {
  const res = await fetch(
    `${POSTHOG_API_BASE}/api/projects/${PROJECT_ID}/dashboards/${DASHBOARD_ID}/`,
    {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog dashboard fetch failed (${res.status}): ${text}`);
  }

  return res.json();
}

function parseDashboardTiles(dashboard) {
  const growthAccounting = [];
  const retention = [];

  if (!dashboard?.tiles) return { growthAccounting, retention };

  for (const tile of dashboard.tiles) {
    const insight = tile.insight;
    if (!insight) continue;

    const name = (insight.name || '').toLowerCase();

    if (name.includes('growth accounting') || name.includes('lifecycle')) {
      // Growth accounting / lifecycle data
      const results = insight.result || [];
      const dateMap = {};

      for (const series of results) {
        const status = series.status || series.label || '';
        const days = series.days || [];
        const data = series.data || [];

        for (let i = 0; i < days.length; i++) {
          const date = days[i];
          if (!dateMap[date]) {
            dateMap[date] = { date: formatDate(date), new: 0, returning: 0, resurrecting: 0, dormant: 0 };
          }
          const val = data[i] || 0;
          if (status === 'new') dateMap[date].new = val;
          else if (status === 'returning') dateMap[date].returning = val;
          else if (status === 'resurrecting') dateMap[date].resurrecting = val;
          else if (status === 'dormant') dateMap[date].dormant = -Math.abs(val);
        }
      }

      growthAccounting.push(...Object.values(dateMap));
    }

    if (name.includes('retention')) {
      // Retention cohort data
      const result = insight.result || [];
      for (const cohort of result) {
        const label = cohort.label || cohort.date || '';
        const size = cohort.values?.[0]?.count || 0;
        const values = (cohort.values || []).map((v) => {
          if (size === 0) return 0;
          return Math.round((v.count / size) * 100);
        });
        retention.push({
          cohort: label,
          size,
          values,
        });
      }
    }
  }

  return { growthAccounting, retention };
}

export async function GET(request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check for API key
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'POSTHOG_PERSONAL_API_KEY environment variable is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const refresh = searchParams.get('refresh') === 'true';

    // Check cache
    if (!refresh) {
      const cached = getCachedData(range);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const days = getRangeDays(range);
    const dateFilter = `toDate(timestamp) >= today() - interval ${days} day`;

    // Run queries in parallel
    const [dauResult, wauResult, referrersResult, eventsResult, todayResult, dashboard] =
      await Promise.all([
        // DAU trend
        posthogQuery(
          apiKey,
          `SELECT toDate(timestamp) AS day, count(DISTINCT distinct_id) AS users
           FROM events
           WHERE ${dateFilter}
           GROUP BY day
           ORDER BY day`
        ),
        // WAU trend
        posthogQuery(
          apiKey,
          `SELECT toStartOfWeek(timestamp) AS week, count(DISTINCT distinct_id) AS users
           FROM events
           WHERE ${dateFilter}
           GROUP BY week
           ORDER BY week`
        ),
        // Referring domains
        posthogQuery(
          apiKey,
          `SELECT properties.$referring_domain AS domain, count() AS cnt
           FROM events
           WHERE ${dateFilter}
             AND properties.$referring_domain IS NOT NULL
             AND properties.$referring_domain != ''
             AND properties.$referring_domain != '$direct'
           GROUP BY domain
           ORDER BY cnt DESC
           LIMIT 15`
        ),
        // Events breakdown
        posthogQuery(
          apiKey,
          `SELECT event, count() AS cnt
           FROM events
           WHERE ${dateFilter}
           GROUP BY event
           ORDER BY cnt DESC`
        ),
        // Today's total events
        posthogQuery(
          apiKey,
          `SELECT count() AS total
           FROM events
           WHERE toDate(timestamp) = today()`
        ),
        // Dashboard (growth accounting + retention)
        fetchDashboard(apiKey).catch((err) => {
          console.warn('Dashboard fetch failed, skipping:', err.message);
          return null;
        }),
      ]);

    // Process DAU trend
    const dauTrend = (dauResult.results || []).map((row) => ({
      date: formatDate(row[0]),
      value: row[1],
    }));

    // Process WAU trend
    const wauTrend = (wauResult.results || []).map((row) => ({
      date: formatDate(row[0]),
      value: row[1],
    }));

    // Process referring domains
    const referringDomains = (referrersResult.results || []).map((row) => ({
      domain: row[0],
      count: row[1],
    }));

    // Process events breakdown
    const eventsBreakdown = (eventsResult.results || []).map((row) => ({
      event: row[0],
      count: row[1],
    }));

    // Today's events
    const totalEventsToday = todayResult.results?.[0]?.[0] || 0;

    // KPIs
    const latestDau = dauTrend.length > 0 ? dauTrend[dauTrend.length - 1].value : 0;
    const latestWau = wauTrend.length > 0 ? wauTrend[wauTrend.length - 1].value : 0;

    // Dashboard data
    const { growthAccounting, retention } = dashboard
      ? parseDashboardTiles(dashboard)
      : { growthAccounting: [], retention: [] };

    const responseData = {
      kpis: {
        dau: latestDau,
        wau: latestWau,
        totalEventsToday,
      },
      dauTrend,
      wauTrend,
      referringDomains,
      growthAccounting,
      retention,
      eventsBreakdown,
      lastUpdated: new Date().toISOString(),
    };

    setCachedData(range, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('PostHog API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PostHog data', details: error.message },
      { status: 500 }
    );
  }
}
