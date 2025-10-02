// File: /src/components/admin/script-analytics-dashboard.jsx
// Purpose: Script analytics dashboard showing generation patterns and usage insights

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FileText,
  TrendingUp,
  Edit,
  Users,
  Zap,
  RefreshCw,
  AlertCircle,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

export default function ScriptAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  /**
   * Load script analytics data
   */
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { scriptAnalyticsService } = await import('@/lib/admin/script-analytics-service');
      const data = await scriptAnalyticsService.getScriptAnalytics(timeRange);

      setAnalytics(data);
    } catch (err) {
      console.error('Error loading script analytics:', err);
      setError('Failed to load script analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh analytics data
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading && !analytics) {
    return <ScriptAnalyticsSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Analytics</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={loadAnalytics} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Script Analytics</h2>
          <p className="text-slate-400 mt-1">
            Generation patterns and usage insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Scripts"
          value={analytics?.total || 0}
          icon={FileText}
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
        />
        <MetricCard
          title="Total Edits"
          value={analytics?.editMetrics?.totalEdits || 0}
          subtitle={`${analytics?.editMetrics?.avgEdits || 0} avg per script`}
          icon={Edit}
          iconColor="text-purple-400"
          iconBg="bg-purple-400/10"
        />
        <MetricCard
          title="Active Creators"
          value={analytics?.topUsers?.length || 0}
          icon={Users}
          iconColor="text-green-400"
          iconBg="bg-green-400/10"
        />
        <MetricCard
          title="Scripts Edited"
          value={analytics?.editMetrics?.scriptsWithEdits || 0}
          subtitle={`${analytics?.total > 0 ? Math.round((analytics.editMetrics.scriptsWithEdits / analytics.total) * 100) : 0}% of total`}
          icon={Zap}
          iconColor="text-orange-400"
          iconBg="bg-orange-400/10"
        />
      </div>

      {/* Generation Trend Chart */}
      {analytics?.trend && analytics.trend.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Script Generation Trend</CardTitle>
            <CardDescription>Daily script creation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Scripts Created"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Script Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scripts by Type */}
        {analytics?.byType && analytics.byType.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Scripts by Type</CardTitle>
              <CardDescription>Distribution of script categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Scripts by Quality Tier */}
        {analytics?.byTier && analytics.byTier.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Scripts by Quality Tier</CardTitle>
              <CardDescription>Fast, Balanced, and Premium usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.byTier}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scripts by Length */}
      {analytics?.byLength && analytics.byLength.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Scripts by Length</CardTitle>
            <CardDescription>Distribution of script durations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.byLength}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Script Creators */}
      {analytics?.topUsers && analytics.topUsers.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Top Script Creators
            </CardTitle>
            <CardDescription>Most active users in this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topUsers.map((user, index) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                      index === 0 && "bg-yellow-400/20 text-yellow-400",
                      index === 1 && "bg-slate-400/20 text-slate-400",
                      index === 2 && "bg-orange-400/20 text-orange-400",
                      index > 2 && "bg-slate-700 text-slate-400"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{user.count}</p>
                    <p className="text-xs text-slate-400">scripts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Reusable metric card component
 */
function MetricCard({ title, value, subtitle, icon: Icon, iconColor, iconBg }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">{title}</p>
          <div className={cn("p-2 rounded-lg", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton
 */
function ScriptAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 bg-slate-800" />
          <Skeleton className="h-4 w-48 bg-slate-800 mt-2" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 bg-slate-800" />
          <Skeleton className="h-10 w-24 bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full bg-slate-800" />
        </CardContent>
      </Card>
    </div>
  );
}
