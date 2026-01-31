'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StaticCard } from '@/components/ui/static-card'
import { useToast } from '@/components/ui/use-toast'
import { 
  Users, 
  Share2, 
  History, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Trophy, 
  Crown,
  CheckCircle,
  Plus,
  CreditCard,
  Building2,
  UserPlus,
  ArrowRight
} from 'lucide-react'
import CreateTeamModal from '@/components/teams/create-team-modal'

export default function TeamsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadUserAndTeams()
  }, [])

  const loadUserAndTeams = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)

      // Load user's teams
      const { data: teamsData } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (
            id,
            name,
            description,
            subscription_tier,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (teamsData) {
        setTeams(teamsData.map(tm => ({ ...tm.teams, role: tm.role })))
      }
    } catch (error) {
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamCreated = (team) => {
    router.push(`/teams/${team.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20">
          <Sparkles className="w-3 h-3 mr-1" />
          Team Collaboration
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Work Better Together
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Collaborate on scripts, share voice profiles, and scale your content production with your team.
        </p>
        
        {user && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your Team
            </Button>
            {teams.length > 0 && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push(`/teams/${teams[0].id}`)}
              >
                <Users className="w-5 h-5 mr-2" />
                Go to My Teams ({teams.length})
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Team Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Invite team members with different roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Owner, Admin, Editor, and Viewer permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Manage access and permissions</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Share2 className="h-8 w-8 text-primary" />
              <CardTitle>Collaborative Editing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Real-time collaboration on scripts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>See who's editing what</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Leave comments and suggestions</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              <CardTitle>Version Control</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Track all changes with version history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Restore previous versions anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>See who made what changes</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <CardTitle>Team Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Activity feed for transparency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Notifications for important updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Audit trail for compliance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          All plans include team collaboration features. Individual subscriptions include personal credits.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free Trial */}
          <StaticCard className="relative h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  Free Trial
                </Badge>
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                50 credits included
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>50 free credits</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Fast generation only</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>5-16 short scripts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Basic export formats</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Personal use only</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => router.push('/signup')}
              >
                Start Free
              </Button>
            </CardContent>
          </StaticCard>

          {/* Creator Plan */}
          <StaticCard className="relative h-full border-primary/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs bg-primary/5">
                  Creator
                </Badge>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Creator</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$39</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                300 credits/month • 30-100 scripts
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>300 credits/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Fast & Professional quality</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>3 channels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Voice profiles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>All export formats</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => router.push('/subscription')}
              >
                Get Started
              </Button>
            </CardContent>
          </StaticCard>

          {/* Professional Plan */}
          <StaticCard className="relative h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  Professional
                </Badge>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">Professional</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$79</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                800 credits/month • 80-260 scripts
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>800 credits/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>All quality tiers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>10 channels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Team seats (3)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Button 
                className="w-full"
                onClick={() => router.push('/subscription')}
              >
                Get Started
              </Button>
            </CardContent>
          </StaticCard>

          {/* Agency Plan */}
          <StaticCard className="relative h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs bg-purple-500/10">
                  Agency
                </Badge>
                <Crown className="h-5 w-5 text-purple-500" />
              </div>
              <CardTitle className="text-xl">Agency</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                2000 credits/month • 200-600+ scripts
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>2000 credits/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>All quality tiers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Unlimited channels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Team seats (10)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>White label option</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push('/subscription')}
              >
                Get Started
              </Button>
            </CardContent>
          </StaticCard>
        </div>
      </div>

      {/* Your Teams Section */}
      {teams.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card 
                key={team.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/teams/${team.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <Badge variant="outline">
                      {team.role === 'owner' ? (
                        <Crown className="w-3 h-3 mr-1" />
                      ) : (
                        <Users className="w-3 h-3 mr-1" />
                      )}
                      {team.role}
                    </Badge>
                  </div>
                  {team.description && (
                    <CardDescription className="line-clamp-2">
                      {team.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Plan: {team.subscription_tier}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card 
              className="border-dashed border-2 hover:border-primary transition-colors cursor-pointer bg-muted/10"
              onClick={() => setShowCreateModal(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[150px]">
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-muted-foreground font-medium">Create New Team</span>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  )
}