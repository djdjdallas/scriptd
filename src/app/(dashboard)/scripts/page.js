'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TiltCard } from '@/components/ui/tilt-card';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  Calendar,
  Trash2,
  Edit,
  Loader2,
  Filter,
  Sparkles,
  Zap,
  TrendingUp,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { SCRIPT_TYPES } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ScriptsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredScript, setHoveredScript] = useState(null);

  useEffect(() => {
    fetchScripts();
  }, [search, typeFilter, sortBy, page]);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder: 'desc'
      });

      if (search) params.append('search', search);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/scripts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch scripts');

      const result = await response.json();
      
      if (result.success && result.data) {
        setScripts(result.data.items || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setScripts([]);
        throw new Error(result.error?.message || 'Failed to fetch scripts');
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setScripts([]);
      toast({
        title: "Error",
        description: error.message || "Failed to load scripts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scriptId) => {
    if (!confirm('Are you sure you want to delete this script?')) return;

    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete script');

      toast({
        title: "Script Deleted",
        description: "The script has been deleted successfully."
      });

      fetchScripts();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading && scripts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto" />
          <p className="mt-4 text-gray-300">Loading your scripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -right-48 opacity-20" />
        <div className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -left-48 opacity-20" style={{ animationDelay: '10s' }} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-reveal">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <FileText className="h-10 w-10 text-purple-400 neon-glow" />
              Scripts
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-gray-400 mt-2">
              Manage and create your viral YouTube scripts
            </p>
          </div>
          
          <Link href="/scripts/new">
            <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white group">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
              New Script
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">{scripts.length}</div>
            <p className="text-sm text-gray-400">Total Scripts</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">
              {scripts.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-sm text-gray-400">This Week</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">
              {scripts.reduce((acc, s) => acc + (s.length || 0), 0)}
            </div>
            <p className="text-sm text-gray-400">Total Minutes</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {Math.round(scripts.length * 2.5)}K
            </div>
            <p className="text-sm text-gray-400">Est. Views</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search scripts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input pl-10 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="glass-button w-[180px] text-white">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="glass bg-gray-900/90 border-white/20">
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(SCRIPT_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="glass-button w-[180px] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass bg-gray-900/90 border-white/20">
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="updated_at">Recently updated</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="length">Length</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scripts Grid */}
        {scripts.length === 0 ? (
          <div className="glass-card p-12 text-center animate-reveal" style={{ animationDelay: '0.3s' }}>
            <div className="relative inline-block">
              <FileText className="h-20 w-20 mx-auto text-purple-400 neon-glow" />
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mt-6 mb-2">No scripts yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start creating viral content with AI-powered script generation
            </p>
            <Link href="/scripts/new">
              <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Script
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 stagger-children">
            {scripts.map((script, index) => (
              <TiltCard key={script.id}>
                <div 
                  className="glass-card glass-hover overflow-hidden group"
                  onMouseEnter={() => setHoveredScript(script.id)}
                  onMouseLeave={() => setHoveredScript(null)}
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                          <Link 
                            href={`/scripts/${script.id}`}
                            className="hover:text-purple-400 transition-colors"
                          >
                            {script.title}
                          </Link>
                          {hoveredScript === script.id && (
                            <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                          )}
                        </h3>
                        
                        <p className="text-gray-400 mb-4 line-clamp-2">
                          {script.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className="glass border-purple-400/50 text-purple-300">
                            {script.type}
                          </Badge>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock className="h-3 w-3" />
                            {script.length} min
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(script.createdAt), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Eye className="h-3 w-3" />
                            {Math.round(Math.random() * 10000)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-6">
                        <Link href={`/scripts/${script.id}`}>
                          <Button
                            className="glass-button hover:bg-purple-500/20"
                            size="icon"
                          >
                            <Edit className="h-4 w-4 text-white" />
                          </Button>
                        </Link>
                        <Button
                          className="glass-button hover:bg-pink-500/20"
                          size="icon"
                          onClick={() => handleDelete(script.id)}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          className="glass-button hover:bg-blue-500/20"
                          size="icon"
                        >
                          <Share2 className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {hoveredScript === script.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 animate-shimmer" />
                    )}
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 animate-reveal">
            <Button
              className="glass-button text-white"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gray-300">
                Page <span className="gradient-text font-bold">{page}</span> of <span className="gradient-text font-bold">{totalPages}</span>
              </span>
            </div>
            <Button
              className="glass-button text-white"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Floating action hints */}
      <div className="fixed bottom-6 right-6 glass-card p-4 animate-float max-w-xs">
        <p className="text-sm text-gray-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          Pro tip: Use AI to generate viral hooks!
        </p>
      </div>
    </div>
  );
}