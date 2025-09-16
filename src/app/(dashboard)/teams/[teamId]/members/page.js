'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  UserPlus,
  Users,
  Crown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getTeamById, getTeamMembers } from '@/lib/teams/team-service-client';
import { getUserPermissions, ROLE_NAMES, getRoleBadgeColor, getRoleIcon } from '@/lib/teams/permissions';
import TeamMemberList from '@/components/teams/team-member-list';
import TeamInvitationForm from '@/components/teams/team-invitation-form';
import { createClient } from '@/lib/supabase/client';

export default function TeamMembersPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId;

  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
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

    } catch (err) {
      setError(err.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberUpdated = () => {
    // Refresh member list when a member is updated or removed
    if (user?.id) {
      loadTeamData(user.id);
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

  const getMembersByRole = (role) => {
    return members.filter(member => member.role === role);
  };

  const getRoleStats = () => {
    const stats = {
      owner: getMembersByRole('owner').length,
      admin: getMembersByRole('admin').length,
      editor: getMembersByRole('editor').length,
      viewer: getMembersByRole('viewer').length,
    };
    return stats;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading team members...</p>
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
  const roleStats = getRoleStats();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
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
                Team Members
              </h1>
              {team.user_role === 'owner' && (
                <Crown className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-600 text-lg">
              Manage {team.name} team members and their roles
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {members.length} {members.length === 1 ? 'member' : 'members'} total
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {userPermissions.canInvite && (
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Owners</p>
                <p className="text-2xl font-bold text-purple-600">{roleStats.owner}</p>
              </div>
              <div className="text-2xl">👑</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-red-600">{roleStats.admin}</p>
              </div>
              <div className="text-2xl">🔧</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Editors</p>
                <p className="text-2xl font-bold text-blue-600">{roleStats.editor}</p>
              </div>
              <div className="text-2xl">✏️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Viewers</p>
                <p className="text-2xl font-bold text-gray-600">{roleStats.viewer}</p>
              </div>
              <div className="text-2xl">👁️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Permissions Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Badge className={getRoleBadgeColor('owner')}>
                <span className="mr-1">{getRoleIcon('owner')}</span>
                {ROLE_NAMES['owner']}
              </Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full team control</li>
                <li>• Manage all members</li>
                <li>• Delete team</li>
                <li>• Transfer ownership</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Badge className={getRoleBadgeColor('admin')}>
                <span className="mr-1">{getRoleIcon('admin')}</span>
                {ROLE_NAMES['admin']}
              </Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Invite members</li>
                <li>• Manage roles</li>
                <li>• Edit team settings</li>
                <li>• Full script access</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Badge className={getRoleBadgeColor('editor')}>
                <span className="mr-1">{getRoleIcon('editor')}</span>
                {ROLE_NAMES['editor']}
              </Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create scripts</li>
                <li>• Edit scripts</li>
                <li>• View team content</li>
                <li>• Comment on scripts</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Badge className={getRoleBadgeColor('viewer')}>
                <span className="mr-1">{getRoleIcon('viewer')}</span>
                {ROLE_NAMES['viewer']}
              </Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View scripts</li>
                <li>• View team info</li>
                <li>• Read-only access</li>
                <li>• Comment on scripts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member List */}
      <TeamMemberList
        members={members}
        currentUser={user}
        userRole={team.user_role}
        teamId={teamId}
        onMemberUpdated={handleMemberUpdated}
      />

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