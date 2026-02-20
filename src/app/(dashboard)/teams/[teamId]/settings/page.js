'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { getTeamById, updateTeam, deleteTeam } from '@/lib/teams/team-service-client';
import { getUserPermissions } from '@/lib/teams/permissions';
import { createClient } from '@/lib/supabase/client';

export default function TeamSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId;

  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

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

      const { data: teamData, error: teamError } = await getTeamById(teamId, userId, false);
      if (teamError) {
        throw new Error(teamError);
      }
      
      setTeam(teamData);
      setFormData({
        name: teamData.name || '',
        description: teamData.description || '',
      });

    } catch (err) {
      setError(err.message || 'Failed to load team settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    if (formData.name.length < 2) {
      setError('Team name must be at least 2 characters long');
      return;
    }

    if (formData.name.length > 50) {
      setError('Team name must be less than 50 characters');
      return;
    }

    if (formData.description.length > 200) {
      setError('Description must be less than 200 characters');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      const { error: updateError } = await updateTeam({
        teamId,
        updates,
        updatedBy: user.id,
        isServerSide: false,
      });

      if (updateError) {
        throw new Error(updateError);
      }

      setSuccess('Team settings updated successfully');
      
      // Update local team data
      setTeam(prev => ({
        ...prev,
        ...updates,
      }));

    } catch (err) {
      setError(err.message || 'Failed to update team settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsSaving(true);
    setError('');

    try {
      const { error: deleteError } = await deleteTeam({
        teamId,
        deletedBy: user.id,
        isServerSide: false,
      });

      if (deleteError) {
        throw new Error(deleteError);
      }

      // Redirect to teams page after successful deletion
      router.push('/teams?deleted=true');

    } catch (err) {
      setError(err.message || 'Failed to delete team');
      setIsSaving(false);
      setShowDeleteDialog(false);
    }
  };

  const hasChanges = () => {
    if (!team) return false;
    return (
      formData.name !== team.name ||
      formData.description !== (team.description || '')
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-400" />
            <p className="text-white/50">Loading team settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !team) {
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

  // Redirect if user doesn't have permission to edit settings
  if (!userPermissions.canEditSettings) {
    router.push(`/teams/${teamId}`);
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold font-display text-white">
            Team Settings
          </h1>
          {team.user_role === 'owner' && (
            <Crown className="w-6 h-6 text-yellow-500" />
          )}
        </div>
        <p className="text-white/50 text-lg">
          Manage settings for {team.name}
        </p>
      </div>

      <div className="space-y-6">
        {/* Success Message */}
        {success && (
          <Alert className="border-green-500/20 bg-green-500/10">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter team name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  maxLength={50}
                />
                <p className="text-xs text-white/40">
                  {formData.name.length}/50 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your team's purpose (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  maxLength={200}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-white/40">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSaving || !hasChanges()}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Team Information */}
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-white/50">Team ID</Label>
                <p className="text-sm text-white font-mono">{team.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-white/50">Owner</Label>
                <p className="text-sm text-white">
                  {team.user_role === 'owner' ? 'You' : 'Another team member'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-white/50">Created</Label>
                <p className="text-sm text-white">
                  {new Date(team.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-white/50">Last Updated</Label>
                <p className="text-sm text-white">
                  {new Date(team.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Only for owners */}
        {userPermissions.canDeleteTeam && (
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-500/10 rounded-lg">
                <h4 className="font-medium text-red-300 mb-2">Delete Team</h4>
                <p className="text-sm text-red-400/80 mb-4">
                  Once you delete a team, there is no going back. This will permanently delete 
                  the team, remove all members, and delete all associated data including scripts.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Team
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete Team
            </DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete <strong>{team.name}</strong>? 
              This action cannot be undone and will permanently remove:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ul className="text-sm text-white/40 space-y-1 ml-4">
              <li>• All team members will be removed</li>
              <li>• All team scripts will be deleted</li>
              <li>• All team activity history will be lost</li>
              <li>• All pending invitations will be cancelled</li>
            </ul>
          </div>

          <div className="bg-red-500/10 p-3 rounded text-sm text-red-300">
            <strong>Warning:</strong> This action is irreversible. Make sure you have backed up 
            any important scripts before proceeding.
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Team Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}