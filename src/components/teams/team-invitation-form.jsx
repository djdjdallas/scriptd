'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  UserPlus, 
  Mail, 
  Loader2, 
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { 
  ROLE_NAMES,
  ROLE_DESCRIPTIONS,
  getRoleIcon,
  getAssignableRoles,
} from '@/lib/teams/permissions';
import { inviteUserToTeam } from '@/lib/teams/team-service';

export default function TeamInvitationForm({ 
  teamId, 
  currentUser, 
  userRole, 
  isOpen, 
  onClose, 
  onInviteSent 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'editor',
  });

  const assignableRoles = getAssignableRoles(userRole);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    if (!assignableRoles.includes(formData.role)) {
      setError('You cannot assign this role level');
      return;
    }

    // Check if inviting themselves
    if (formData.email.toLowerCase() === currentUser.email?.toLowerCase()) {
      setError('You cannot invite yourself to the team');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: inviteError } = await inviteUserToTeam({
        teamId,
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        invitedBy: currentUser.id,
        isServerSide: false,
      });

      if (inviteError) {
        throw new Error(inviteError);
      }

      setSuccess(true);
      setFormData({ email: '', role: 'editor' });
      
      // Call callback to refresh member list or show notification
      onInviteSent?.({
        email: formData.email,
        role: formData.role,
      });

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'editor' });
    setError('');
    setSuccess(false);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on your team's scripts.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Invitation Sent!
            </h3>
            <p className="text-sm text-gray-600">
              We've sent an invitation to <strong>{formData.email}</strong>.
              They'll receive an email with a link to join the team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">{getRoleIcon(role)}</span>
                        <div>
                          <div className="font-medium">{ROLE_NAMES[role]}</div>
                          <div className="text-xs text-gray-500">
                            {ROLE_DESCRIPTIONS[role]}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Invitation Details
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Invitation expires in 7 days</li>
                <li>• Recipient must have an account to join</li>
                <li>• You can resend or cancel invitations anytime</li>
                <li>• Role can be changed after joining</li>
              </ul>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.email.trim() || !formData.role}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}