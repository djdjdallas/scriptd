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

  // Mock data for charts
  const viewsData = [
    { date: 'Mon', views: 1200, scripts: 3 },
    { date: 'Tue', views: 1800, scripts: 4 },
    { date: 'Wed', views: 1600, scripts: 2 },
    { date: 'Thu', views: 2200, scripts: 5 },
    { date: 'Fri', views: 2800, scripts: 6 },
    { date: 'Sat', views: 3200, scripts: 4 },
    { date: 'Sun', views: 2900, scripts: 3 }
  ];

  const performanceData = [
    { name: 'Hook Rate', value: 68, color: '#9333ea' },
    { name: 'Retention', value: 45, color: '#ec4899' },
    { name: 'CTR', value: 12, color: '#3b82f6' },
    { name: 'Engagement', value: 25, color: '#10b981' }
  ];

  const topScripts = [
    { title: '10 AI Tools You Need', views: 45000, growth: 23.5 },
    { title: 'Future of Web Development', views: 38000, growth: 18.2 },
    { title: 'Building with Next.js 14', views: 32000, growth: -5.3 },
    { title: 'React Best Practices', views: 28000, growth: 12.8 }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate fetching analytics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalScripts: 27,
        totalViews: 156000,
        avgEngagement: 4.2,
        growthRate: 15.7
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
            <SelectTrigger className="glass-button w-[180px] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass bg-gray-900/90 border-white/20">
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
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