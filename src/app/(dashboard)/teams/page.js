'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Users, 
  Settings, 
  Crown, 
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getUserTeams } from '@/lib/teams/team-service-client';
import { getRoleBadgeColor, getRoleIcon, ROLE_NAMES } from '@/lib/teams/permissions';
import { createClient } from '@/lib/supabase/client';

export default function TeamsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setError('Failed to get user information');
        return;
      }
      setUser(user);
      return user;
    };

    getCurrentUser().then(currentUser => {
      if (currentUser) {
        loadTeams(currentUser.id);
      }
    });
  }, []);

  const loadTeams = async (userId) => {
    try {
      setIsLoading(true);
      setError('');

      const { data, error: teamsError } = await getUserTeams(userId);
      
      if (teamsError) {
        throw new Error(teamsError);
      }

      setTeams(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load teams');
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = () => {
    router.push('/teams/create');
  };

  const handleTeamClick = (teamId) => {
    router.push(`/teams/${teamId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your teams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teams
          </h1>
          <p className="text-gray-600">
            Collaborate with your team on YouTube scripts
          </p>
        </div>
        <Button onClick={handleCreateTeam}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No teams yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first team to start collaborating with others on YouTube scripts. 
              Teams make it easy to share ideas, assign roles, and work together.
            </p>
            <Button onClick={handleCreateTeam}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card 
              key={team.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleTeamClick(team.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate mb-1">
                      {team.name}
                      {team.user_role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-500 ml-2 inline" />
                      )}
                    </CardTitle>
                    {team.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getRoleBadgeColor(team.user_role)}>
                    <span className="mr-1">{getRoleIcon(team.user_role)}</span>
                    {ROLE_NAMES[team.user_role]}
                  </Badge>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div>Created {formatDate(team.created_at)}</div>
                  {team.joined_at !== team.created_at && (
                    <div>Joined {formatDate(team.joined_at)}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {teams.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Teams</p>
                  <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teams You Own</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teams.filter(team => team.user_role === 'owner').length}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teams.reduce((sum, team) => sum + team.member_count, 0)}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}