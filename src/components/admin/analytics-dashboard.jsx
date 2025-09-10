'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/lib/admin/admin-service';
import { AnalyticsCalculator, ChartDataProcessors } from '@/lib/admin/analytics';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  FileText,
  TeamIcon,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChartIcon,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

const CHART_COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  users: '#3b82f6',
  scripts: '#8b5cf6',
  teams: '#10b981',
  revenue: '#f59e0b'
};

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalyticsData(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      const exportData = {
        analytics: analyticsData,
        timeRange,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (loading) {
    return <AnalyticsDashboardSkeleton />;
  }

  const { userGrowth, scriptGeneration, teamActivity } = analyticsData || {};

  // Process data for charts
  const userGrowthChart = ChartDataProcessors.processTimeSeriesData(userGrowth || [], 'date', 'users');
  const scriptGenerationChart = ChartDataProcessors.processTimeSeriesData(scriptGeneration || [], 'date', 'scripts');
  const teamActivityChart = ChartDataProcessors.processTimeSeriesData(teamActivity || [], 'date', 'teams');

  // Calculate cumulative data
  const cumulativeUserGrowth = AnalyticsCalculator.calculateCumulative(userGrowthChart, 'value');
  const cumulativeScriptGeneration = AnalyticsCalculator.calculateCumulative(scriptGenerationChart, 'value');

  // Combine data for comparison chart
  const combinedData = userGrowthChart.map((item, index) => ({
    date: item.date,
    users: item.value,
    scripts: scriptGenerationChart[index]?.value || 0,
    teams: teamActivityChart[index]?.value || 0
  }));

  // Calculate growth rates
  const userGrowthRate = AnalyticsCalculator.calculateGrowthRate(userGrowthChart, 'date', 'value');
  const scriptGrowthRate = AnalyticsCalculator.calculateGrowthRate(scriptGenerationChart, 'date', 'value');
  const teamGrowthRate = AnalyticsCalculator.calculateGrowthRate(teamActivityChart, 'date', 'value');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Detailed platform analytics and insights</p>
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
            onClick={handleExport}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
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

      {/* Growth Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GrowthCard
          title="User Growth"
          value={userGrowthRate}
          icon={Users}
          color="blue"
        />
        <GrowthCard
          title="Script Growth"
          value={scriptGrowthRate}
          icon={FileText}
          color="purple"
        />
        <GrowthCard
          title="Team Growth"
          value={teamGrowthRate}
          icon={TeamIcon}
          color="green"
        />
      </div>

      {/* User Growth Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth Trend
            </CardTitle>
            <CardDescription>Daily user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.users}
                    fill={CHART_COLORS.users}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cumulative User Growth
            </CardTitle>
            <CardDescription>Total registered users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke={CHART_COLORS.users}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.users, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Script Generation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Script Generation Trend
            </CardTitle>
            <CardDescription>Daily script creation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scriptGenerationChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={CHART_COLORS.scripts}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TeamIcon className="h-5 w-5" />
              Team Activity Trend
            </CardTitle>
            <CardDescription>Team creation and collaboration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={teamActivityChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.teams}
                    fill={CHART_COLORS.teams}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Analysis */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Activity Comparison
          </CardTitle>
          <CardDescription>Combined view of users, scripts, and teams activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={CHART_COLORS.users}
                  strokeWidth={2}
                  name="New Users"
                />
                <Line
                  type="monotone"
                  dataKey="scripts"
                  stroke={CHART_COLORS.scripts}
                  strokeWidth={2}
                  name="New Scripts"
                />
                <Line
                  type="monotone"
                  dataKey="teams"
                  stroke={CHART_COLORS.teams}
                  strokeWidth={2}
                  name="New Teams"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Feature Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Feature Adoption Rates</CardTitle>
            <CardDescription>How users are engaging with platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FeatureAdoptionItem
                feature="Script Generation"
                adoption={85}
                users={1240}
                color="purple"
              />
              <FeatureAdoptionItem
                feature="Team Collaboration"
                adoption={42}
                users={612}
                color="green"
              />
              <FeatureAdoptionItem
                feature="Voice Training"
                adoption={28}
                users={408}
                color="blue"
              />
              <FeatureAdoptionItem
                feature="Analytics Dashboard"
                adoption={65}
                users={945}
                color="yellow"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Engagement Statistics</CardTitle>
            <CardDescription>Key engagement metrics and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">73%</div>
                <div className="text-sm text-slate-400">Daily Active Users</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">4.2</div>
                <div className="text-sm text-slate-400">Avg Scripts/User</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">12m</div>
                <div className="text-sm text-slate-400">Avg Session</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">92%</div>
                <div className="text-sm text-slate-400">Feature Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GrowthCard({ title, value, icon: Icon, color }) {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
      purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
      green: 'border-green-500/20 bg-green-500/5 text-green-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className={cn("bg-slate-900/50 border-slate-800", getColorClasses(color))}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <h3 className="text-2xl font-bold text-white">
                {AnalyticsCalculator.formatPercentage(value)}
              </h3>
              <TrendingUp className={cn("h-4 w-4", value >= 0 ? "text-green-500" : "text-red-500")} />
            </div>
            <p className="text-xs text-slate-500 mt-1">Growth rate</p>
          </div>
          <Icon className="h-8 w-8 opacity-80" />
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureAdoptionItem({ feature, adoption, users, color }) {
  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500'
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium text-white">{feature}</div>
        <div className="text-sm text-slate-400">{users.toLocaleString()} users</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 bg-slate-700 rounded-full h-2">
          <div 
            className={cn("h-2 rounded-full", getColorClass(color))}
            style={{ width: `${adoption}%` }}
          />
        </div>
        <Badge variant="outline" className="text-xs">
          {adoption}%
        </Badge>
      </div>
    </div>
  );
}

function AnalyticsDashboardSkeleton() {
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
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}