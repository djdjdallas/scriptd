// File: /src/components/admin/revenue-dashboard.jsx
// Purpose: Comprehensive revenue analytics dashboard with Stripe data visualization

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Activity,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Color palette for charts
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function RevenueDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRevenueData();
  }, []);

  /**
   * Load revenue data from the revenue service
   * This fetches real-time data from Stripe
   */
  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Dynamically import to avoid bundling Stripe on client
      const { revenueService } = await import('@/lib/admin/revenue-service');
      const data = await revenueService.getRevenueMetrics();

      setMetrics(data);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setError('Failed to load revenue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh revenue data
   * Clears cache and fetches fresh data from Stripe
   */
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      const { revenueService } = await import('@/lib/admin/revenue-service');
      revenueService.clearCache(); // Force fresh data
      await loadRevenueData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Format currency for display
   * Converts numbers to readable dollar amounts
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Format percentage for display
   */
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading && !metrics) {
    return <RevenueDashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Revenue Data</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={loadRevenueData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for plan breakdown pie chart
  const planData = Object.entries(metrics?.byPlan || {}).map(([name, data]) => ({
    name,
    value: data.mrr,
    count: data.count
  }));

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Revenue Analytics</h2>
          <p className="text-slate-400 mt-1">
            Real-time revenue metrics from Stripe
          </p>
        </div>
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(metrics?.mrr || 0)}
          change={metrics?.growth || 0}
          icon={DollarSign}
          iconColor="text-green-400"
          iconBg="bg-green-400/10"
        />

        {/* ARR Card */}
        <MetricCard
          title="Annual Recurring Revenue"
          value={formatCurrency(metrics?.arr || 0)}
          subtitle="MRR × 12"
          icon={TrendingUp}
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
        />

        {/* Active Subscriptions */}
        <MetricCard
          title="Active Subscriptions"
          value={metrics?.activeSubscriptions || 0}
          subtitle={`${formatCurrency(metrics?.averageRevenuePerUser || 0)} avg/user`}
          icon={Users}
          iconColor="text-purple-400"
          iconBg="bg-purple-400/10"
        />

        {/* Customer Lifetime Value */}
        <MetricCard
          title="Customer Lifetime Value"
          value={formatCurrency(metrics?.clv || 0)}
          subtitle={`${metrics?.churnRate?.toFixed(1)}% churn rate`}
          icon={Activity}
          iconColor="text-orange-400"
          iconBg="bg-orange-400/10"
        />
      </div>

      {/* Revenue Trend Chart */}
      {metrics?.revenueTrend && metrics.revenueTrend.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trend (Last 30 Days)</CardTitle>
            <CardDescription>Daily revenue from successful payments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.revenueTrend}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Plan */}
      {planData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Revenue by Plan</CardTitle>
              <CardDescription>MRR distribution across subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
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
                    formatter={(value) => `$${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Plan Breakdown Table */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Plan Breakdown</CardTitle>
              <CardDescription>Detailed subscription plan metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {planData.map((plan, index) => (
                  <div
                    key={plan.name}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <div>
                        <p className="text-white font-medium">{plan.name}</p>
                        <p className="text-sm text-slate-400">{plan.count} subscribers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(plan.value)}</p>
                      <p className="text-xs text-slate-400">MRR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Total Revenue</p>
              <CreditCard className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(metrics?.totalRevenue || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">All-time revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Average Revenue Per User</p>
              <DollarSign className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(metrics?.averageRevenuePerUser || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Monthly average</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Monthly Churn Rate</p>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics?.churnRate?.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Customers leaving per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      {metrics?.lastUpdated && (
        <p className="text-xs text-slate-500 text-center">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}

/**
 * Reusable metric card component
 * Shows a key metric with optional growth indicator
 */
function MetricCard({ title, value, subtitle, change, icon: Icon, iconColor, iconBg }) {
  const isPositive = change >= 0;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">{title}</p>
          <div className={cn("p-2 rounded-lg", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-bold text-white">{value}</p>

          {change !== undefined && (
            <div className="flex items-center gap-2">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-green-400" : "text-red-400"
              )}>
                {Math.abs(change).toFixed(1)}% vs last month
              </span>
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for revenue dashboard
 */
function RevenueDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 bg-slate-800" />
          <Skeleton className="h-4 w-48 bg-slate-800 mt-2" />
        </div>
        <Skeleton className="h-10 w-24 bg-slate-800" />
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
