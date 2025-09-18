'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { UserPlus, Loader2, Mail } from 'lucide-react'
import { ROLE_NAMES, ROLE_DESCRIPTIONS } from '@/lib/teams/permissions'

export default function InviteMemberModal({ 
  isOpen, 
  onClose, 
  teamId, 
  teamName,
  currentUserRole,
  onInviteSent 
}) {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'viewer',
    message: ''
  })

  // Determine which roles the current user can assign
  const getAssignableRoles = () => {
    const roles = ['viewer', 'editor']
    if (currentUserRole === 'owner' || currentUserRole === 'admin') {
      roles.push('admin')
    }
    return roles
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inviteData.email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteData.email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      })
      return
    }

    setIsSending(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate a unique invitation token
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      // Create the invitation
      const { data: invitation, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          email: inviteData.email,
          role: inviteData.role,
          invited_by: user.id,
          token: token,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        if (error.message.includes('duplicate')) {
          throw new Error('This person has already been invited to the team')
        }
        throw error
      }

      // Log the invitation activity
      await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: user.id,
          action: 'member_invited',
          resource_type: 'invitation',
          resource_id: invitation.id,
          metadata: {
            invited_email: inviteData.email,
            role: inviteData.role
          }
        })

      // Send invitation email via API route
      const response = await fetch('/api/teams/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteData.email,
          teamName: teamName,
          inviterName: user.email,
          role: inviteData.role,
          message: inviteData.message,
          token: token
        })
      })

      if (!response.ok) {
        console.warn('Failed to send invitation email')
      }

      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${inviteData.email}`
      })

      // Reset form
      setInviteData({
        email: '',
        role: 'viewer',
        message: ''
      })

      // Notify parent component
      if (onInviteSent) {
        onInviteSent(invitation)
      }

      onClose()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive'
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleReset = () => {
    setInviteData({
      email: '',
      role: 'viewer',
      message: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join <strong>{teamName}</strong>.
            The invitation will expire in 7 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  disabled={isSending}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                disabled={isSending}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAssignableRoles().map((role) => (
                    <SelectItem key={role} value={role}>
                      <div>
                        <div className="font-medium">{ROLE_NAMES[role]}</div>
                        <div className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS[role]}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the invitation..."
                value={inviteData.message}
                onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                disabled={isSending}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This message will be included in the invitation email
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}