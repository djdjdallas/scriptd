'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Activity,
  Zap,
  RefreshCw,
  Globe,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#f3f4f6',
};

export default function PosthogDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async (refresh = false) => {
    try {
      setError(null);
      if (!refresh) setLoading(true);
      const params = new URLSearchParams({ range: timeRange });
      if (refresh) params.set('refresh', 'true');

      const res = await fetch(`/api/admin/posthog?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch (${res.status})`);
      }
      setData(await res.json());
    } catch (err) {
      console.error('PostHog load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md w-full bg-slate-900/50 border-slate-800">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load PostHog data</h3>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <Button onClick={() => loadData()} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { kpis, dauTrend, wauTrend, referringDomains, growthAccounting, retention, eventsBreakdown, lastUpdated } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Daily Active Users"
          value={kpis.dau}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Weekly Active Users"
          value={kpis.wau}
          icon={Activity}
          color="purple"
        />
        <KPICard
          title="Events Today"
          value={kpis.totalEventsToday}
          icon={Zap}
          color="green"
        />
      </div>

      {/* DAU + WAU Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              DAU Trend
            </CardTitle>
            <CardDescription>Daily active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dauTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <defs>
                    <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="url(#dauGradient)"
                    name="DAU"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              WAU Trend
            </CardTitle>
            <CardDescription>Weekly active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wauTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <defs>
                    <linearGradient id="wauGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="url(#wauGradient)"
                    name="WAU"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referring Domains */}
      {referringDomains.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Referring Domains
            </CardTitle>
            <CardDescription>Top traffic sources (excluding direct)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={referringDomains} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="domain"
                    stroke="#9ca3af"
                    fontSize={12}
                    width={110}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Visits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Accounting */}
      {growthAccounting.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Accounting
            </CardTitle>
            <CardDescription>New, returning, resurrecting, and dormant users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthAccounting}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Bar dataKey="new" stackId="a" fill="#10b981" name="New" />
                  <Bar dataKey="returning" stackId="a" fill="#3b82f6" name="Returning" />
                  <Bar dataKey="resurrecting" stackId="a" fill="#f59e0b" name="Resurrecting" />
                  <Bar dataKey="dormant" stackId="a" fill="#ef4444" name="Dormant" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retention Table */}
      {retention.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Retention Cohorts</CardTitle>
            <CardDescription>Week-over-week user retention</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 py-2 px-3 font-medium">Cohort</th>
                  <th className="text-right text-slate-400 py-2 px-3 font-medium">Size</th>
                  {retention[0]?.values?.map((_, i) => (
                    <th key={i} className="text-center text-slate-400 py-2 px-3 font-medium">
                      {i === 0 ? 'Week 0' : `Week ${i}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {retention.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50">
                    <td className="py-2 px-3 text-white font-medium whitespace-nowrap">{row.cohort}</td>
                    <td className="py-2 px-3 text-slate-300 text-right">{row.size}</td>
                    {row.values.map((pct, i) => (
                      <td key={i} className="py-2 px-3 text-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `rgba(16, 185, 129, ${Math.min(pct / 100, 1) * 0.4})`,
                            color: pct > 50 ? '#d1fae5' : pct > 0 ? '#a7f3d0' : '#6b7280',
                          }}
                        >
                          {pct}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Events Breakdown */}
      {eventsBreakdown.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Events Breakdown
            </CardTitle>
            <CardDescription>All tracked events sorted by volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 py-2 px-3 font-medium">Event</th>
                    <th className="text-right text-slate-400 py-2 px-3 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsBreakdown.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-white flex items-center gap-2">
                        {row.event.startsWith('$') && (
                          <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/30">
                            system
                          </Badge>
                        )}
                        <span className="font-mono text-sm">{row.event}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-right font-mono">
                        {row.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'text-blue-500' },
    purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'text-purple-500' },
    green: { border: 'border-green-500/20', bg: 'bg-green-500/10', text: 'text-green-400', icon: 'text-green-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Card className={cn('bg-slate-900/50 border-slate-800', c.border)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
          </div>
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', c.bg)}>
            <Icon className={cn('h-6 w-6', c.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48 bg-slate-800" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 bg-slate-800" />
          <Skeleton className="h-10 w-24 bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <Skeleton className="h-80 w-full bg-slate-800" />
        </CardContent>
      </Card>
    </div>
  );
}
