'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  Calendar,
  Trash2,
  Edit,
  Loader2,
  Filter
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
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/scripts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch scripts');

      const data = await response.json();
      setScripts(data.items);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      toast({
        title: "Error",
        description: "Failed to load scripts",
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scripts</h1>
          <p className="text-muted-foreground">
            Manage and create your YouTube scripts
          </p>
        </div>
        
        <Button asChild>
          <Link href="/scripts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Script
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scripts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {Object.entries(SCRIPT_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="updated_at">Recently updated</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="length">Length</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scripts Grid */}
      {scripts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scripts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first script to get started
            </p>
            <Button asChild>
              <Link href="/scripts/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Script
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scripts.map((script) => (
            <Card key={script.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      <Link 
                        href={`/scripts/${script.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {script.title}
                      </Link>
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {script.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">{script.type}</Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {script.length} min
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(script.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link href={`/scripts/${script.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(script.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}