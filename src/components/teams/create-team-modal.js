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
import { useToast } from '@/components/ui/use-toast'
import { Users, Loader2 } from 'lucide-react'

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated }) {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [teamData, setTeamData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  const handleNameChange = (e) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    setTeamData({
      ...teamData,
      name,
      slug
    })
  }

  const handleSlugChange = (e) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
    
    setTeamData({
      ...teamData,
      slug
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!teamData.name || !teamData.slug) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsCreating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          slug: teamData.slug,
          description: teamData.description || null,
          owner_id: user.id,
          subscription_tier: 'free',
          max_members: 1,
          is_active: true
        })
        .select()
        .single()

      if (teamError) throw teamError

      // Add the creator as the owner
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        })

      if (memberError) throw memberError

      // Create default team settings
      const { error: settingsError } = await supabase
        .from('team_settings')
        .insert({
          team_id: team.id,
          auto_save_enabled: true,
          version_retention_days: 30,
          notification_preferences: {},
          collaboration_settings: {},
          export_settings: {}
        })

      if (settingsError) {
        console.warn('Failed to create team settings:', settingsError)
      }

      // Log team creation activity
      const { error: activityError } = await supabase
        .from('team_activity')
        .insert({
          team_id: team.id,
          user_id: user.id,
          action: 'team_created',
          resource_type: 'team',
          metadata: {
            team_name: team.name
          }
        })

      if (activityError) {
        console.warn('Failed to log activity:', activityError)
      }

      toast({
        title: 'Success',
        description: `Team "${team.name}" created successfully!`
      })

      // Reset form
      setTeamData({
        name: '',
        slug: '',
        description: ''
      })

      // Notify parent component
      if (onTeamCreated) {
        onTeamCreated(team)
      }

      onClose()
    } catch (error) {
      console.error('Error creating team:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create team',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create New Team
          </DialogTitle>
          <DialogDescription>
            Create a team to collaborate with others on scripts and content.
            Upgrade to Professional or Agency plan to add team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My Content Team"
                value={teamData.name}
                onChange={handleNameChange}
                disabled={isCreating}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Team URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">subscribr.app/teams/</span>
                <Input
                  id="slug"
                  placeholder="my-content-team"
                  value={teamData.slug}
                  onChange={handleSlugChange}
                  disabled={isCreating}
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                  required
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this team about?"
                value={teamData.description}
                onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                disabled={isCreating}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}