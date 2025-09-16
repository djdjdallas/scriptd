'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MoreHorizontal, 
  Crown, 
  Settings, 
  UserMinus, 
  Shield, 
  Edit, 
  Eye,
  Loader2,
} from 'lucide-react';
import { 
  getRoleBadgeColor, 
  getRoleIcon, 
  ROLE_NAMES,
  getAssignableRoles,
  canManageUser,
  validateRoleAssignment,
} from '@/lib/teams/permissions';
import { updateMemberRole, removeMember } from '@/lib/teams/team-service-client';

export default function TeamMemberList({ 
  members = [], 
  currentUser, 
  userRole, 
  teamId, 
  onMemberUpdated 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'role' or 'remove'
  const [newRole, setNewRole] = useState('');

  const handleRoleChange = (member) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setDialogType('role');
    setError('');
  };

  const handleRemoveMember = (member) => {
    setSelectedMember(member);
    setDialogType('remove');
    setError('');
  };

  const confirmRoleChange = async () => {
    if (!selectedMember || !newRole) return;

    setIsLoading(true);
    setError('');

    try {
      const validation = validateRoleAssignment({
        assignerRole: userRole,
        currentRole: selectedMember.role,
        newRole,
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { error: updateError } = await updateMemberRole({
        teamId,
        memberId: selectedMember.id,
        newRole,
        updatedBy: currentUser.id,
        isServerSide: false,
      });

      if (updateError) {
        throw new Error(updateError);
      }

      // Update local state
      onMemberUpdated?.();
      setDialogType(null);
      setSelectedMember(null);
      setNewRole('');
    } catch (err) {
      setError(err.message || 'Failed to update member role');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: removeError } = await removeMember({
        teamId,
        memberId: selectedMember.id,
        removedBy: currentUser.id,
        isServerSide: false,
      });

      if (removeError) {
        throw new Error(removeError);
      }

      // Update local state
      onMemberUpdated?.();
      setDialogType(null);
      setSelectedMember(null);
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedMember(null);
    setNewRole('');
    setError('');
  };

  const formatJoinedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || '??';
  };

  if (!members.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No team members found</p>
        </CardContent>
      </Card>
    );
  }

  const assignableRoles = getAssignableRoles(userRole);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {members.map((member) => {
              const canManage = canManageUser(userRole, member.role);
              const isCurrentUser = member.profiles?.id === currentUser.id;
              
              return (
                <div key={member.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-10 h-10">
                        {member.profiles?.avatar_url ? (
                          <img 
                            src={member.profiles.avatar_url} 
                            alt={member.profiles.full_name || member.profiles.email}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center rounded-full">
                            <span className="text-sm font-medium text-blue-600">
                              {getInitials(member.profiles?.full_name, member.profiles?.email)}
                            </span>
                          </div>
                        )}
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {member.profiles?.full_name || member.profiles?.email}
                            {isCurrentUser && (
                              <span className="text-sm text-gray-500 ml-1">(You)</span>
                            )}
                          </h4>
                          {member.role === 'owner' && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {member.profiles?.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {formatJoinedDate(member.joined_at)}
                        </p>
                      </div>
                      
                      <Badge className={getRoleBadgeColor(member.role)}>
                        <span className="mr-1">{getRoleIcon(member.role)}</span>
                        {ROLE_NAMES[member.role]}
                      </Badge>
                    </div>

                    {canManage && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(member)}
                            disabled={!assignableRoles.length}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          {member.role !== 'owner' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={dialogType === 'role'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update {selectedMember?.profiles?.full_name || selectedMember?.profiles?.email}'s role in the team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <span>{getRoleIcon(role)}</span>
                      <span>{ROLE_NAMES[role]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRoleChange} 
              disabled={isLoading || !newRole || newRole === selectedMember?.role}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={dialogType === 'remove'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.profiles?.full_name || selectedMember?.profiles?.email} from the team? 
              This action cannot be undone and they will lose access to all team scripts.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRemoveMember} 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}