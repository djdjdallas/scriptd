'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Calendar, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Search,
  Eye,
  Trash2,
  Youtube,
  Target,
  AlertCircle,
  Loader2,
  Users,
  DollarSign,
  Sparkles,
  FileText,
  BarChart3,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaticCard } from '@/components/ui/static-card';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function ActionPlansPage() {
  const [actionPlans, setActionPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null, planTitle: '' });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (hasCheckedUser && user) {
      fetchActionPlans();
    } else if (hasCheckedUser && !user) {
      setLoading(false);
    }
  }, [hasCheckedUser, user]);

  useEffect(() => {
    filterPlans();
  }, [actionPlans, searchQuery]);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setHasCheckedUser(true);
  };

  const fetchActionPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trending/action-plans');
      
      if (!response.ok) {
        throw new Error('Failed to fetch action plans');
      }

      const data = await response.json();
      console.log('Fetched action plans:', data.plans?.length, 'total');
      
      // Remove any duplicates based on ID (shouldn't be necessary but just in case)
      const uniquePlans = data.plans ? 
        Array.from(new Map(data.plans.map(p => [p.id, p])).values()) : [];
      
      setActionPlans(uniquePlans);
    } catch (error) {
      console.error('Error fetching action plans:', error);
      toast.error('Failed to load action plans');
      setActionPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = [...actionPlans];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plan => 
        plan.channel_name?.toLowerCase().includes(query) ||
        plan.topic?.toLowerCase().includes(query) ||
        plan.plan_data?.strategy?.toLowerCase().includes(query)
      );
    }

    setFilteredPlans(filtered);
  };

  const handleDeleteClick = (planId, planTitle) => {
    setDeleteModal({ 
      isOpen: true, 
      planId, 
      planTitle: planTitle || 'this action plan'
    });
  };

  const handleDeleteConfirm = async () => {
    const planId = deleteModal.planId;
    setDeleteModal({ isOpen: false, planId: null, planTitle: '' });
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/trending/action-plans/${planId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete action plan');
      }

      toast.success('Action plan deleted');
      fetchActionPlans(); // Refresh the list
    } catch (error) {
      console.error('Error deleting action plan:', error);
      toast.error('Failed to delete action plan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, planId: null, planTitle: '' });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="vb-card p-8 text-center">
          <Loader2 className="h-12 w-12 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your action plans...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="vb-card p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h3>
          <p className="text-gray-400">Please sign in to view your action plans</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
          <Zap className="h-10 w-10 text-yellow-400" />
          My Action Plans
          <span className="text-sm font-normal bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-1 rounded-full">
            {actionPlans.length} Total
          </span>
        </h1>
        <p className="text-gray-400 mt-2">
          Track and manage your trend-following strategies
        </p>
      </div>

      {/* Controls Bar */}
      <div className="vb-card p-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans by channel or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.06] border border-white/5 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={fetchActionPlans}
              className="vb-btn-outline text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link href="/trending/channels">
              <Button className="vb-btn-primary text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create New Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {actionPlans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="vb-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Plans</p>
                <p className="text-3xl font-bold text-white mt-1">{actionPlans.length}</p>
              </div>
              <FileText className="h-8 w-8 text-violet-400 opacity-50" />
            </div>
          </div>

          <div className="vb-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unique Channels</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {new Set(actionPlans.map(p => p.channel_name)).size}
                </p>
              </div>
              <Youtube className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </div>

          <div className="vb-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Topics Covered</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {new Set(actionPlans.map(p => p.topic)).size}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="vb-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">This Month</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {actionPlans.filter(p => {
                    const planDate = new Date(p.created_at);
                    const now = new Date();
                    return planDate.getMonth() === now.getMonth() &&
                           planDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Action Plans Grid */}
      {filteredPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan, index) => (
            <StaticCard key={plan.id}>
              <div
                className="vb-card-interactive p-6 h-full animate-reveal cursor-pointer hover:border-violet-500/50 transition-all"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-red-400" />
                      {plan.channel_name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {plan.topic}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(plan.id, plan.channel_name);
                    }}
                    disabled={deleteLoading}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Strategy & Timeline */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-violet-400" />
                    <span className="text-sm text-gray-300">
                      {plan.plan_data?.strategy || 'Growth Strategy'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      {plan.plan_data?.timeline || '30 Days'}
                    </span>
                  </div>
                </div>

                {/* Expected Results */}
                {plan.plan_data?.estimatedResults && (
                  <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-2">Expected Results</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Eye className="h-3 w-3" />
                          Views
                        </div>
                        <p className="text-green-400 font-bold text-sm">
                          {plan.plan_data.estimatedResults.views}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Users className="h-3 w-3" />
                          Subs
                        </div>
                        <p className="text-blue-400 font-bold text-sm">
                          {plan.plan_data.estimatedResults.subscribers}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <DollarSign className="h-3 w-3" />
                          Revenue
                        </div>
                        <p className="text-yellow-400 font-bold text-sm">
                          {plan.plan_data.estimatedResults.revenue}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Indicator (if plan has weeks) */}
                {plan.plan_data?.weeklyPlan && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>Week 1 of 4</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-600 to-cyan-600 h-2 rounded-full" style={{ width: '25%' }} />

                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-gray-500">
                    Created {formatDate(plan.created_at)}
                  </span>
                  <Link 
                    href={`/trending/follow?channel=${encodeURIComponent(plan.channel_name)}&topic=${encodeURIComponent(plan.topic)}&planId=${plan.id}`}
                  >
                    <Button size="sm" variant="ghost" className="vb-btn-outline">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </StaticCard>
          ))}
        </div>
      ) : (
        <div className="vb-card p-12 text-center animate-reveal" style={{ animationDelay: '0.3s' }}>
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">
              {searchQuery ? 'No plans found' : 'No action plans yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Start by exploring trending channels and generating personalized action plans to grow your channel.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/trending">
                <Button className="vb-btn-outline text-white">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Trends
                </Button>
              </Link>
              <Link href="/trending/channels">
                <Button className="vb-btn-primary text-white">
                  <Youtube className="mr-2 h-4 w-4" />
                  Find Channels
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Action Plan"
        message={`Are you sure you want to delete the action plan for ${deleteModal.planTitle}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
      />
    </div>
  );
}