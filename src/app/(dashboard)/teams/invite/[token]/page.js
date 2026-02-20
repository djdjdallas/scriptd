'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  UserCheck,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { acceptInvitation } from '@/lib/teams/team-service-client';
import { getRoleBadgeColor, getRoleIcon, ROLE_NAMES, ROLE_DESCRIPTIONS } from '@/lib/teams/permissions';
import { createClient } from '@/lib/supabase/client';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  const [user, setUser] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push(`/auth/signin?redirect=/teams/invite/${token}`);
        return;
      }
      setUser(user);
      return user;
    };

    getCurrentUser().then(currentUser => {
      if (currentUser) {
        loadInvitationData();
      }
    });
  }, [token, router]);

  const loadInvitationData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const supabase = createClient();
      
      // Get invitation details
      const { data: invitationData, error: invitationError } = await supabase
        .from('team_invitations')
        .select(`
          *,
          teams (
            id,
            name,
            description
          )
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (invitationError) {
        if (invitationError.code === 'PGRST116') {
          throw new Error('Invitation not found or has already been used');
        }
        throw new Error('Failed to load invitation details');
      }

      // Check if invitation has expired
      if (new Date(invitationData.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      setInvitation(invitationData);

    } catch (err) {
      setError(err.message || 'Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) return;

    setIsAccepting(true);
    setError('');

    try {
      const { data: team, error: acceptError } = await acceptInvitation({
        token,
        userId: user.id,
        isServerSide: false,
      });

      if (acceptError) {
        throw new Error(acceptError);
      }

      setSuccess(true);

      // Redirect to team dashboard after a short delay
      setTimeout(() => {
        router.push(`/teams/${team.id}`);
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push('/teams');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-400" />
            <p className="text-white/50">Loading invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400/60 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Invitation Not Found
            </h2>
            <p className="text-white/50 mb-6">
              {error}
            </p>
            <Button onClick={() => router.push('/teams')}>
              Go to Teams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome to the Team!
            </h2>
            <p className="text-white/50 mb-6">
              You've successfully joined <strong>{invitation.teams.name}</strong>. 
              You'll be redirected to the team dashboard shortly.
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-violet-400" />
          </div>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
          <p className="text-white/50">
            You've been invited to join a team
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Team Information */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">
              {invitation.teams.name}
            </h3>
            {invitation.teams.description && (
              <p className="text-white/50 text-sm mb-4">
                {invitation.teams.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                <span>Role: {ROLE_NAMES[invitation.role]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Expires: {formatDate(invitation.expires_at)}</span>
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(invitation.role)}`}>
                <span className="mr-1">{getRoleIcon(invitation.role)}</span>
                {ROLE_NAMES[invitation.role]}
              </span>
              Role Permissions
            </h4>
            <p className="text-sm text-white/50 mb-3">
              {ROLE_DESCRIPTIONS[invitation.role]}
            </p>
            
            {invitation.role === 'owner' && (
              <ul className="text-xs text-white/50 space-y-1">
                <li>• Full control over team settings</li>
                <li>• Manage all team members</li>
                <li>• Create, edit, and delete scripts</li>
                <li>• Delete the team</li>
              </ul>
            )}
            
            {invitation.role === 'admin' && (
              <ul className="text-xs text-white/50 space-y-1">
                <li>• Invite and manage team members</li>
                <li>• Edit team settings</li>
                <li>• Create, edit, and delete scripts</li>
                <li>• View team analytics</li>
              </ul>
            )}
            
            {invitation.role === 'editor' && (
              <ul className="text-xs text-white/50 space-y-1">
                <li>• Create and edit team scripts</li>
                <li>• Comment on scripts</li>
                <li>• View team content</li>
                <li>• Collaborate with team members</li>
              </ul>
            )}
            
            {invitation.role === 'viewer' && (
              <ul className="text-xs text-white/50 space-y-1">
                <li>• View team scripts</li>
                <li>• Comment on scripts</li>
                <li>• View team information</li>
                <li>• Read-only access</li>
              </ul>
            )}
          </div>

          {/* User Information */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="font-medium text-white mb-2">
              Joining as
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-violet-400">
                  {user?.user_metadata?.full_name
                    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : user?.email?.slice(0, 2).toUpperCase() || '??'}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-sm text-white/50">{user?.email}</p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isAccepting}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
              className="flex-1"
            >
              {isAccepting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Accept Invitation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-center text-white/40 pt-2">
            By accepting this invitation, you'll be able to collaborate on team scripts 
            and access team resources based on your assigned role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}