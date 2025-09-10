'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  User,
  Crown,
  Loader2,
  AlertCircle,
  Eye,
  Edit,
} from 'lucide-react';
import { getTeamById } from '@/lib/teams/team-service';
import { getUserPermissions, ROLE_NAMES, getRoleBadgeColor, getRoleIcon } from '@/lib/teams/permissions';
import { createClient } from '@/lib/supabase/client';

export default function TeamScriptsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId;

  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const supabase = createClient();
    
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);
      return user;
    };

    getCurrentUser().then(currentUser => {
      if (currentUser) {
        loadTeamData(currentUser.id);
      }
    });
  }, [teamId, router]);

  const loadTeamData = async (userId) => {
    try {
      setIsLoading(true);
      setError('');

      // Load team details
      const { data: teamData, error: teamError } = await getTeamById(teamId, userId, false);
      if (teamError) {
        throw new Error(teamError);
      }
      setTeam(teamData);

      // TODO: Load team scripts from your existing scripts system
      // This would integrate with your scripts table, filtering by team_id
      // For now, using mock data to show the UI structure
      setScripts([
        {
          id: '1',
          title: 'How to Create Engaging YouTube Content',
          description: 'A comprehensive guide for content creators',
          status: 'draft',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          author: { name: 'John Doe', email: 'john@example.com' },
          word_count: 1250,
          collaborators: 3,
        },
        {
          id: '2',
          title: '10 YouTube Trends for 2024',
          description: 'Staying ahead of the curve',
          status: 'published',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 7200000).toISOString(),
          author: { name: 'Jane Smith', email: 'jane@example.com' },
          word_count: 850,
          collaborators: 2,
        },
      ]);

    } catch (err) {
      setError(err.message || 'Failed to load team scripts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScript = () => {
    // Navigate to script creation with team context
    router.push(`/scripts/new?team=${teamId}`);
  };

  const handleScriptClick = (scriptId) => {
    router.push(`/scripts/${scriptId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      published: 'bg-green-100 text-green-800 border-green-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || colors.draft;
  };

  const filteredScripts = scripts.filter(script =>
    script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading team scripts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push(`/teams/${teamId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  const userPermissions = getUserPermissions(team.user_role);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/teams/${teamId}`)}
          className="mb-4 p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Team Dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                Team Scripts
              </h1>
              {team.user_role === 'owner' && (
                <Crown className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-600 text-lg">
              Collaborate on scripts for {team.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {scripts.length} {scripts.length === 1 ? 'script' : 'scripts'} total
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {userPermissions.canCreateScripts && (
              <Button onClick={handleCreateScript}>
                <Plus className="w-4 h-4 mr-2" />
                New Script
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search scripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              <div className="border-l pl-2 ml-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="ml-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scripts Content */}
      {filteredScripts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No scripts found' : 'No scripts yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No scripts match "${searchQuery}". Try adjusting your search terms.`
                : 'Create your first team script to start collaborating on YouTube content.'
              }
            </p>
            {!searchQuery && userPermissions.canCreateScripts && (
              <Button onClick={handleCreateScript}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Script
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {filteredScripts.map((script) => (
            <Card 
              key={script.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleScriptClick(script.id)}
            >
              {viewMode === 'grid' ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(script.status)}>
                        {script.status}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        {script.collaborators}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {script.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {script.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{script.word_count} words</span>
                      <span>Updated {formatTimeAgo(script.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {script.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 truncate">
                        {script.author.name}
                      </span>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {script.title}
                        </h3>
                        <Badge className={getStatusColor(script.status)} size="sm">
                          {script.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        {script.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{script.word_count} words</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {script.collaborators} collaborators
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {formatTimeAgo(script.updated_at)}
                        </span>
                        <span>by {script.author.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {userPermissions.canEditScripts ? (
                        <Edit className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Script Statistics */}
      {scripts.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scripts</p>
                  <p className="text-2xl font-bold text-gray-900">{scripts.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Scripts</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {scripts.filter(s => s.status === 'draft').length}
                  </p>
                </div>
                <Edit className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {scripts.filter(s => s.status === 'published').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Words</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {scripts.reduce((sum, script) => sum + script.word_count, 0).toLocaleString()}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}