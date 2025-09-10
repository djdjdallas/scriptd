'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Settings,
  Users,
  FileText,
  Plus,
  Activity,
  Crown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getTeamById, getTeamMembers } from '@/lib/teams/team-service';
import { getUserPermissions, ROLE_NAMES, getRoleBadgeColor, getRoleIcon } from '@/lib/teams/permissions';
import ActivityFeed from '@/components/teams/activity-feed';
import TeamInvitationForm from '@/components/teams/team-invitation-form';
import { createClient } from '@/lib/supabase/client';

export default function TeamDashboard() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId;

  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [recentScripts, setRecentScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

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

      // Load team members
      const { data: membersData, error: membersError } = await getTeamMembers(teamId, userId, false);
      if (membersError) {
        throw new Error(membersError);
      }
      setMembers(membersData || []);

      // TODO: Load recent team scripts
      // This would integrate with your existing scripts system
      setRecentScripts([]);

    } catch (err) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSent = () => {
    // Refresh member list when invitation is sent
    if (user?.id) {
      loadTeamData(user.id);
    }
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
            <p className="text-gray-600">Loading team dashboard...</p>
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
          <Button variant="outline" onClick={() => router.push('/teams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
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
          onClick={() => router.push('/teams')}
          className="mb-4 p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                {team.name}
              </h1>
              {team.user_role === 'owner' && (
                <Crown className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              )}
              <Badge className={getRoleBadgeColor(team.user_role)}>
                <span className="mr-1">{getRoleIcon(team.user_role)}</span>
                {ROLE_NAMES[team.user_role]}
              </Badge>
            </div>
            {team.description && (
              <p className="text-gray-600 text-lg">{team.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Created {formatDate(team.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {userPermissions.canInvite && (
              <Button onClick={() => setShowInviteForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
            {userPermissions.canEditSettings && (
              <Button 
                variant="outline"
                onClick={() => router.push(`/teams/${teamId}/settings`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Members</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scripts</p>
                <p className="text-2xl font-bold text-gray-900">{recentScripts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/teams/${teamId}/members`)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manage</p>
                <p className="text-sm font-bold text-blue-600">Members →</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/teams/${teamId}/scripts`)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">View</p>
                <p className="text-sm font-bold text-green-600">Scripts →</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Team Members */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push(`/teams/${teamId}/members`)}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {member.profiles?.full_name
                          ? member.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                          : member.profiles?.email?.slice(0, 2).toUpperCase() || '??'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.profiles?.full_name || member.profiles?.email}
                      </p>
                      <Badge size="sm" className={getRoleBadgeColor(member.role)}>
                        {getRoleIcon(member.role)} {ROLE_NAMES[member.role]}
                      </Badge>
                    </div>
                  </div>
                ))}
                {members.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{members.length - 5} more members
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed 
            teamId={teamId}
            currentUser={user}
          />
        </div>
      </div>

      {/* Recent Scripts Section */}
      {recentScripts.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Scripts
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push(`/teams/${teamId}/scripts`)}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentScripts.map((script) => (
                  <div key={script.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{script.title}</h4>
                      <p className="text-sm text-gray-600">
                        Updated {formatDate(script.updated_at)} by {script.author_name}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invitation Form */}
      <TeamInvitationForm
        teamId={teamId}
        currentUser={user}
        userRole={team.user_role}
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}