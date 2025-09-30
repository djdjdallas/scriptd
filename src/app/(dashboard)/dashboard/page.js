'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TiltCard } from '@/components/ui/tilt-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  Play,
  CreditCard,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Brain,
  Mic,
  BarChart3,
  Calendar,
  Star,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  Activity,
  Target,
  Award,
  Rocket,
  Trophy
} from 'lucide-react';

// Helper function to calculate weekly activity from actual scripts
const calculateWeeklyActivity = (scripts) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekActivity = Array.from({ length: 7 }, (_, i) => ({
    day: days[i],
    scripts: 0,
    views: 0
  }));

  // Get scripts from the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  scripts.forEach(script => {
    const scriptDate = new Date(script.created_at);
    if (scriptDate >= oneWeekAgo) {
      const dayIndex = scriptDate.getDay();
      weekActivity[dayIndex].scripts += 1;
      weekActivity[dayIndex].views += script.metadata?.views || script.views || 0;
    }
  });

  return weekActivity;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScripts: 0,
    totalViews: 0,
    totalChannels: 0,
    credits: 0,
    recentScripts: [],
    weeklyActivity: [],
    popularScripts: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // First fetch user's channels
        const channelsResponse = await supabase
          .from('channels')
          .select('*')
          .eq('user_id', user.id);
        
        const channels = channelsResponse.data || [];
        const channelIds = channels.map(c => c.id);
        
        // Fetch scripts for all user's channels
        let scripts = [];
        if (channelIds.length > 0) {
          const scriptsResponse = await supabase
            .from('scripts')
            .select('*, channels(name)')
            .in('channel_id', channelIds)
            .order('created_at', { ascending: false });
          scripts = scriptsResponse.data || [];
        }
        
        // Fetch user credits using the same method as sidebar
        // First try RPC function for accurate balance
        const { data: creditBalance, error: rpcError } = await supabase
          .rpc('get_available_credit_balance', { p_user_id: user.id });
        
        let credits = 0;
        
        if (rpcError) {
          console.error('[Dashboard] Error fetching credits via RPC:', rpcError);
          // Fallback to direct table query
          const userResponse = await supabase
            .from('users')
            .select('credits')
            .eq('id', user.id)
            .single();
          
          const userData = userResponse.data || { credits: 0 };
          credits = userData.credits;
          console.log('[Dashboard] Credits from users table:', credits);
        } else {
          credits = creditBalance || 0;
          console.log('[Dashboard] Credits from RPC function:', credits);
        }

        // Calculate total views (use metadata if available, otherwise 0)
        const totalViews = scripts.reduce((sum, script) => {
          const views = script.metadata?.views || script.views || 0;
          return sum + views;
        }, 0);

        // Get recent scripts (already sorted by created_at from query)
        const recentScripts = scripts.slice(0, 5);

        // Get popular scripts (based on available data)
        const popularScripts = scripts
          .map(script => ({ 
            ...script, 
            views: script.metadata?.views || script.views || 0 
          }))
          .filter(script => script.views > 0) // Only show scripts with actual view data
          .sort((a, b) => b.views - a.views)
          .slice(0, 3);

        // Calculate weekly activity based on actual script creation dates
        const weeklyActivity = calculateWeeklyActivity(scripts);

        setStats({
          totalScripts: scripts.length,
          totalViews,
          totalChannels: channels.length,
          credits: credits,
          recentScripts,
          weeklyActivity,
          popularScripts
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <BarChart3 className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-40 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
        <div className="absolute top-60 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '10s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Rocket className="h-10 w-10 text-purple-400 neon-glow" />
          Dashboard
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Welcome back! Here's your content creation overview
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <Link href="/scripts/create">
          <Button className="w-full glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white p-6 h-auto">
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-8 w-8" />
              <span className="text-lg font-medium">Create Script</span>
              <span className="text-sm text-gray-300">Generate AI content</span>
            </div>
          </Button>
        </Link>
        <Link href="/channels">
          <Button className="w-full glass-button text-white p-6 h-auto hover:bg-blue-500/20">
            <div className="flex flex-col items-center gap-2">
              <Play className="h-8 w-8 text-blue-400" />
              <span className="text-lg font-medium">Add Channel</span>
              <span className="text-sm text-gray-300">Connect YouTube</span>
            </div>
          </Button>
        </Link>
        <Link href="/voice">
          <Button className="w-full glass-button text-white p-6 h-auto hover:bg-green-500/20">
            <div className="flex flex-col items-center gap-2">
              <Mic className="h-8 w-8 text-green-400" />
              <span className="text-lg font-medium">Train Voice</span>
              <span className="text-sm text-gray-300">Clone your style</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <TiltCard>
          <div className="glass-card glass-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalScripts}</p>
            <p className="text-sm text-gray-400 mt-1">Total Scripts</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-green-400">+12%</span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-card glass-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">Total Views</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-green-400">+23%</span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-card glass-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-pink-400" />
              </div>
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalChannels}</p>
            <p className="text-sm text-gray-400 mt-1">Channels</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-yellow-400">Active</span>
              <span className="text-gray-500">connections</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard>
          <div className="glass-card glass-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-400" />
              </div>
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold gradient-text">{stats.credits}</p>
            <p className="text-sm text-gray-400 mt-1">Credits</p>
            <Link href="/credits">
              <Button className="w-full mt-3 glass-button text-white text-xs">
                Get More
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </TiltCard>
      </div>

      {/* Weekly Activity */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Weekly Activity
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {stats.weeklyActivity.map((day, index) => {
            const maxScripts = Math.max(...stats.weeklyActivity.map(d => d.scripts));
            const height = day.scripts === 0 ? 10 : (day.scripts / maxScripts) * 100;
            
            return (
              <div key={index} className="text-center">
                <div className="glass rounded-lg p-3 mb-2 relative overflow-hidden group hover:scale-105 transition-transform">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500/50 to-transparent transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <p className="text-2xl font-bold text-white relative z-10">{day.scripts}</p>
                  <p className="text-xs text-gray-400 relative z-10 mt-1">{day.views} views</p>
                </div>
                <p className="text-xs text-gray-500">{day.day}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Scripts */}
        <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Recent Scripts
            </h2>
            <Link href="/scripts">
              <Button className="glass-button text-white text-sm">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {stats.recentScripts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No scripts yet</p>
              <Link href="/scripts/create">
                <Button className="mt-4 glass-button text-white">
                  Create Your First Script
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentScripts.map((script) => (
                <Link key={script.id} href={`/scripts/${script.id}`}>
                  <div className="glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                          {script.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(script.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing */}
        <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Top Performing
            </h2>
            <Link href="/analytics">
              <Button className="glass-button text-white text-sm">
                Analytics
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {stats.popularScripts.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No data yet</p>
              <p className="text-sm text-gray-500 mt-2">Create more scripts to see performance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.popularScripts.map((script, index) => (
                <div key={script.id} className="glass p-4 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 glass rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{script.title}</h3>
                      <p className="text-sm text-gray-400">{script.views} views</p>
                    </div>
                    {index === 0 && <Trophy className="h-5 w-5 text-yellow-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Tips */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Getting Started Tips
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Connect a Channel</p>
              <p className="text-xs text-gray-400 mt-1">Link your YouTube channel to publish directly</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Train Your Voice</p>
              <p className="text-xs text-gray-400 mt-1">Create AI scripts in your unique style</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Use Templates</p>
              <p className="text-xs text-gray-400 mt-1">Start with proven script formats</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Check Analytics</p>
              <p className="text-xs text-gray-400 mt-1">Track performance and optimize</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}