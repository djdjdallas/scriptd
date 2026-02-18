'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/lib/admin/admin-service';
import { AnalyticsCalculator } from '@/lib/admin/analytics';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  UserPlus,
  FileCheck,
  Zap,
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, activityData] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getRecentActivity(15)
      ]);
      
      setMetrics(metricsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleExportData = async () => {
    try {
      // Export basic metrics data
      const exportData = {
        metrics,
        recentActivity,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  const { users, scripts, teams, revenue } = metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview and key metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportData}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={users?.total || 0}
          change={users?.newThisMonth || 0}
          changeLabel="new this month"
          icon={Users}
          trend="up"
          className="border-blue-500/20 bg-blue-500/5"
          iconClassName="text-blue-400"
        />
        
        <MetricCard
          title="Active Users"
          value={users?.active || 0}
          change={users?.total ? ((users.active / users.total) * 100).toFixed(1) : 0}
          changeLabel="of total users"
          icon={Activity}
          trend="up"
          className="border-green-500/20 bg-green-500/5"
          iconClassName="text-green-400"
        />
        
        <MetricCard
          title="Total Scripts"
          value={scripts?.total || 0}
          change={scripts?.thisMonth || 0}
          changeLabel="created this month"
          icon={FileText}
          trend="up"
          className="border-purple-500/20 bg-purple-500/5"
          iconClassName="text-purple-400"
        />
        
        <MetricCard
          title="Monthly Revenue"
          value={`$${AnalyticsCalculator.formatNumber(revenue?.mrr || 0)}`}
          change={revenue?.growth || 0}
          changeLabel="growth"
          icon={DollarSign}
          trend={revenue?.growth > 0 ? "up" : "down"}
          className="border-yellow-500/20 bg-yellow-500/5"
          iconClassName="text-yellow-400"
          isPercentage
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Stats */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
            <CardDescription>Detailed platform metrics and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <StatItem
                label="Script Edits"
                value={scripts?.totalEdits || 0}
                icon={FileCheck}
                description="Total script versions created"
              />
              <StatItem
                label="Active Teams"
                value={teams?.active || 0}
                icon={Users}
                description={`of ${teams?.total || 0} total teams`}
              />
              <StatItem
                label="New Users (30d)"
                value={users?.newThisMonth || 0}
                icon={UserPlus}
                description="User registrations this month"
              />
              <StatItem
                label="Total Revenue"
                value={`$${AnalyticsCalculator.formatNumber(revenue?.totalRevenue || 0)}`}
                icon={DollarSign}
                description="All-time platform revenue"
              />
            </div>
            
            {/* Engagement Metrics */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Engagement Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {scripts?.total && users?.total ? (scripts.total / users.total).toFixed(1) : '0.0'}
                  </div>
                  <div className="text-xs text-slate-400">Scripts per User</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {users?.active && users?.total ? ((users.active / users.total) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-xs text-slate-400">Active User Rate</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {teams?.active && teams?.total ? ((teams.active / teams.total) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-xs text-slate-400">Team Activity Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 10).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Platform health and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusIndicator
              label="Platform Status"
              status="operational"
              description="All systems running normally"
            />
            <StatusIndicator
              label="Database"
              status="operational"
              description="Response time: 45ms"
            />
            <StatusIndicator
              label="API Services"
              status="operational"
              description="99.9% uptime"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, trend, className, iconClassName, isPercentage = false }) {
  return (
    <Card className={cn("bg-slate-900/50 border-slate-800", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={cn(
                "text-xs",
                trend === "up" ? "text-green-500" : "text-red-500"
              )}>
                {isPercentage ? `${change}%` : change} {changeLabel}
              </span>
            </div>
          </div>
          <Icon className={cn("h-8 w-8", iconClassName)} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, icon: Icon, description }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="font-semibold text-white">{value}</div>
        <div className="text-sm font-medium text-slate-300">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_signup':
        return UserPlus;
      case 'script_created':
        return FileText;
      case 'team_created':
        return Users;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_signup':
        return 'text-blue-400';
      case 'script_created':
        return 'text-purple-400';
      case 'team_created':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", colorClass)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">{activity.description}</p>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function StatusIndicator({ label, status, description }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-3 h-3 rounded-full", getStatusColor(status))} />
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 bg-slate-800" />
          <Skeleton className="h-4 w-48 bg-slate-800 mt-2" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 bg-slate-800" />
          <Skeleton className="h-10 w-24 bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full bg-slate-800" />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full bg-slate-800" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}