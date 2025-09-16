'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminService } from '@/lib/admin/admin-service';
import {
  Users,
  Search,
  FileText,
  Calendar,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  Crown,
  User,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState(new Set());

  useEffect(() => {
    loadTeams();
  }, [currentPage, searchTerm]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllTeams(currentPage, 50, searchTerm);
      setTeams(response.teams);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeams();
    setRefreshing(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleViewTeamDetails = async (team) => {
    try {
      const details = await adminService.getTeamDetails(team.id);
      setSelectedTeam(details);
      setShowTeamDetails(true);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  const handleDeleteTeam = async (team) => {
    if (!confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteTeam(team.id);
      loadTeams(); // Refresh the list
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team. Please try again.');
    }
  };

  const handleExportTeams = async () => {
    try {
      const csvData = await adminService.exportTeamData('csv');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teams-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting teams:', error);
    }
  };

  const toggleTeamExpansion = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return Crown;
      case 'admin':
        return Settings;
      default:
        return User;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <TeamManagementSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400 mt-1">Manage teams and their members</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportTeams}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search teams by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      <div className="space-y-4">
        {teams.length > 0 ? (
          teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onViewDetails={() => handleViewTeamDetails(team)}
              onDelete={() => handleDeleteTeam(team)}
              expanded={expandedTeams.has(team.id)}
              onToggleExpansion={() => toggleTeamExpansion(team.id)}
            />
          ))
        ) : (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No teams found</h3>
              <p className="text-slate-400">
                {searchTerm ? 'No teams match your search criteria.' : 'No teams have been created yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            Previous
          </Button>
          <span className="text-slate-400 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            Next
          </Button>
        </div>
      )}

      {/* Team Details Modal */}
      <Dialog open={showTeamDetails} onOpenChange={setShowTeamDetails}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Team Details: {selectedTeam?.name}
            </DialogTitle>
            <DialogDescription>
              Comprehensive team information and member details
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeam && (
            <TeamDetailsContent team={selectedTeam} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamCard({ team, onViewDetails, onDelete, expanded, onToggleExpansion }) {
  const memberCount = Array.isArray(team.team_members) ? team.team_members.length : (team.team_members?.count || 0);
  const scriptCount = Array.isArray(team.scripts) ? team.scripts.length : (team.scripts?.count || 0);

  return (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">{team.name}</h3>
              {team.description && (
                <Badge variant="outline" className="text-xs">
                  Has Description
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="h-4 w-4" />
                <span>{memberCount} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FileText className="h-4 w-4" />
                <span>{scriptCount} scripts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(team.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            {team.description && expanded && (
              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-300">{team.description}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={onToggleExpansion}
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              onClick={onViewDetails}
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="border-red-700 hover:bg-red-900/20 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamDetailsContent({ team }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400">Team Name</label>
              <p className="text-white">{team.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Created Date</label>
              <p className="text-white">{new Date(team.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {team.description && (
            <div>
              <label className="text-sm font-medium text-slate-400">Description</label>
              <p className="text-white">{team.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Team Members ({team.team_members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {team.team_members && team.team_members.length > 0 ? (
              team.team_members.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {member.users?.full_name || member.users?.email}
                        </p>
                        <p className="text-sm text-slate-400">{member.users?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {member.role}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No team members found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Scripts */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Team Scripts ({team.scripts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {team.scripts && team.scripts.length > 0 ? (
              team.scripts.slice(0, 10).map((script) => (
                <div
                  key={script.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">{script.title}</p>
                      <p className="text-sm text-slate-400">
                        Created {new Date(script.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Updated {new Date(script.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No scripts found</p>
              </div>
            )}
            {team.scripts && team.scripts.length > 10 && (
              <div className="text-center text-sm text-slate-400">
                And {team.scripts.length - 10} more scripts...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRoleIcon(role) {
  switch (role) {
    case 'owner':
      return Crown;
    case 'admin':
      return Settings;
    default:
      return User;
  }
}

function getRoleBadgeVariant(role) {
  switch (role) {
    case 'owner':
      return 'default';
    case 'admin':
      return 'secondary';
    default:
      return 'outline';
  }
}

function TeamManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 bg-slate-800" />
          <Skeleton className="h-4 w-48 bg-slate-800 mt-2" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 bg-slate-800" />
          <Skeleton className="h-10 w-24 bg-slate-800" />
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <Skeleton className="h-10 w-full bg-slate-800" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}