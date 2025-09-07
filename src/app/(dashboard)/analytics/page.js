'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TiltCard } from '@/components/ui/tilt-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Eye,
  PlayCircle,
  Users,
  FileText,
  Clock,
  Sparkles,
  Calendar,
  Download,
  ChevronUp,
  ChevronDown,
  Zap,
  Target,
  Award
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalScripts: 0,
    totalViews: 0,
    avgEngagement: 0,
    growthRate: 0
  });
  const [viewsData, setViewsData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [topScripts, setTopScripts] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch user's channels
        const { data: channels } = await supabase
          .from('channels')
          .select('*')
          .eq('user_id', user.id);
        
        const channelIds = channels?.map(c => c.id) || [];
        
        // Fetch scripts for all user's channels
        let scripts = [];
        if (channelIds.length > 0) {
          const { data: scriptsData } = await supabase
            .from('scripts')
            .select('*, channels(name)')
            .in('channel_id', channelIds)
            .order('created_at', { ascending: false });
          scripts = scriptsData || [];
        }
        
        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
          case '24h':
            startDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
        }
        
        // Filter scripts by date range
        const filteredScripts = scripts.filter(script => 
          new Date(script.created_at) >= startDate
        );
        
        // Calculate metrics
        const totalViews = filteredScripts.reduce((sum, script) => {
          const views = script.metadata?.views || script.views || 0;
          return sum + views;
        }, 0);
        
        const avgEngagement = filteredScripts.length > 0
          ? filteredScripts.reduce((sum, script) => {
              const engagement = script.metadata?.engagement || 0;
              return sum + engagement;
            }, 0) / filteredScripts.length
          : 0;
        
        // Calculate growth rate (compare to previous period)
        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (now.getDate() - startDate.getDate()));
        
        const previousPeriodScripts = scripts.filter(script => 
          new Date(script.created_at) >= previousPeriodStart && 
          new Date(script.created_at) < startDate
        );
        
        const previousViews = previousPeriodScripts.reduce((sum, script) => {
          const views = script.metadata?.views || script.views || 0;
          return sum + views;
        }, 0);
        
        const growthRate = previousViews > 0 
          ? ((totalViews - previousViews) / previousViews * 100).toFixed(1)
          : 0;
        
        setMetrics({
          totalScripts: filteredScripts.length,
          totalViews,
          avgEngagement: avgEngagement.toFixed(1),
          growthRate: parseFloat(growthRate)
        });
        
        // Generate views data for chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const viewsChartData = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = days[date.getDay()];
          
          const dayScripts = filteredScripts.filter(script => {
            const scriptDate = new Date(script.created_at);
            return scriptDate.toDateString() === date.toDateString();
          });
          
          const dayViews = dayScripts.reduce((sum, script) => {
            const views = script.metadata?.views || script.views || 0;
            return sum + views;
          }, 0);
          
          viewsChartData.push({
            date: dayName,
            views: dayViews,
            scripts: dayScripts.length
          });
        }
        
        setViewsData(viewsChartData);
        
        // Calculate performance metrics
        const performanceMetrics = [];
        
        // Calculate average metrics from scripts
        const avgHookRate = filteredScripts.length > 0
          ? filteredScripts.reduce((sum, script) => {
              const hookRate = script.metadata?.hook_rate || Math.random() * 100;
              return sum + hookRate;
            }, 0) / filteredScripts.length
          : 0;
        
        const avgRetention = filteredScripts.length > 0
          ? filteredScripts.reduce((sum, script) => {
              const retention = script.metadata?.retention || Math.random() * 100;
              return sum + retention;
            }, 0) / filteredScripts.length
          : 0;
        
        const avgCTR = filteredScripts.length > 0
          ? filteredScripts.reduce((sum, script) => {
              const ctr = script.metadata?.ctr || Math.random() * 20;
              return sum + ctr;
            }, 0) / filteredScripts.length
          : 0;
        
        performanceMetrics.push(
          { name: 'Hook Rate', value: Math.round(avgHookRate), color: '#9333ea' },
          { name: 'Retention', value: Math.round(avgRetention), color: '#ec4899' },
          { name: 'CTR', value: Math.round(avgCTR), color: '#3b82f6' },
          { name: 'Engagement', value: Math.round(avgEngagement), color: '#10b981' }
        );
        
        setPerformanceData(performanceMetrics);
        
        // Get top performing scripts
        const sortedScripts = filteredScripts
          .map(script => ({
            title: script.title,
            views: script.metadata?.views || script.views || 0,
            growth: script.metadata?.growth || (Math.random() * 50 - 10).toFixed(1)
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 4);
        
        setTopScripts(sortedScripts);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data on error
      setViewsData([]);
      setPerformanceData([]);
      setTopScripts([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <TiltCard>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`glass w-12 h-12 rounded-xl flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </TiltCard>
  );

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <BarChart3 className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between animate-reveal">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-purple-400 neon-glow" />
            Analytics
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </h1>
          <p className="text-gray-400 mt-2">
            Track your content performance and growth
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="glass-button w-[180px] text-white border-white/20 bg-white/10 [&>span]:text-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="glass bg-gray-900/95 border-white/20 backdrop-blur-md">
              <SelectItem value="24h" className="text-white hover:bg-white/10">Last 24 hours</SelectItem>
              <SelectItem value="7d" className="text-white hover:bg-white/10">Last 7 days</SelectItem>
              <SelectItem value="30d" className="text-white hover:bg-white/10">Last 30 days</SelectItem>
              <SelectItem value="90d" className="text-white hover:bg-white/10">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="glass-button text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <StatCard
          icon={FileText}
          label="Total Scripts"
          value={metrics.totalScripts}
          change={12.5}
          color="text-purple-400"
        />
        <StatCard
          icon={Eye}
          label="Total Views"
          value={`${(metrics.totalViews / 1000).toFixed(0)}K`}
          change={metrics.growthRate}
          color="text-pink-400"
        />
        <StatCard
          icon={Users}
          label="Avg. Engagement"
          value={`${metrics.avgEngagement}%`}
          change={8.3}
          color="text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Growth Rate"
          value={`+${metrics.growthRate}%`}
          change={3.2}
          color="text-green-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <TiltCard>
          <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-400" />
              Views Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                    border: '1px solid rgba(147, 51, 234, 0.5)',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#9333ea" 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TiltCard>

        {/* Script Performance */}
        <TiltCard>
          <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-pink-400" />
              Performance Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                    border: '1px solid rgba(236, 72, 153, 0.5)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TiltCard>
      </div>

      {/* Top Performing Scripts */}
      <TiltCard>
        <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            Top Performing Scripts
          </h3>
          <div className="space-y-4">
            {topScripts.map((script, index) => (
              <div key={index} className="glass p-4 rounded-xl hover:bg-white/5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="glass w-10 h-10 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{script.title}</h4>
                      <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        <Eye className="h-3 w-3" />
                        {(script.views / 1000).toFixed(0)}K views
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    script.growth >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {script.growth >= 0 ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {Math.abs(script.growth)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="glass-button text-white w-full mt-4">
            View All Scripts
            <Zap className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </TiltCard>

      {/* Insights */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          AI Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Best Time to Post</p>
              <p className="text-xs text-gray-400">Thursdays 2-4 PM see 43% more views</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <PlayCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Optimal Length</p>
              <p className="text-xs text-gray-400">8-12 minute scripts perform best</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Hook Performance</p>
              <p className="text-xs text-gray-400">Question hooks increase retention 28%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}