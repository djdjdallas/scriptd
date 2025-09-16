'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminService } from '@/lib/admin/admin-service';
import {
  User,
  Search,
  Shield,
  Ban,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Mail,
  CreditCard,
  Users,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Crown,
  UserCog,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' }
];

const USER_STATUS_FILTERS = [
  { value: 'all', label: 'All Users' },
  { value: 'active', label: 'Active Users' },
  { value: 'suspended', label: 'Suspended Users' }
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers(currentPage, 50, searchTerm);
      
      // Filter by status if needed
      let filteredUsers = response.users;
      if (statusFilter === 'active') {
        filteredUsers = response.users.filter(user => !user.suspended);
      } else if (statusFilter === 'suspended') {
        filteredUsers = response.users.filter(user => user.suspended);
      }
      
      setUsers(filteredUsers);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleViewUserDetails = async (user) => {
    try {
      const details = await adminService.getUserDetails(user.id);
      setSelectedUser(details);
      setShowUserDetails(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole);
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please try again.');
    }
  };

  const handleSuspendUser = async (userId, shouldSuspend = true) => {
    const action = shouldSuspend ? 'suspend' : 'unsuspend';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await adminService.suspendUser(userId, shouldSuspend);
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Error ${action}ing user. Please try again.`);
    }
  };

  const handleExportUsers = async () => {
    try {
      const csvData = await adminService.exportUserData('csv');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const getUserRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return Crown;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  };

  const getUserRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <UserManagementSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage platform users and their permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportUsers}
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
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-48 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {users.length > 0 ? (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onViewDetails={() => handleViewUserDetails(user)}
              onUpdateRole={(newRole) => handleUpdateUserRole(user.id, newRole)}
              onSuspend={(shouldSuspend) => handleSuspendUser(user.id, shouldSuspend)}
              getRoleIcon={getUserRoleIcon}
              getRoleBadge={getUserRoleBadge}
            />
          ))
        ) : (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
              <p className="text-slate-400">
                {searchTerm ? 'No users match your search criteria.' : 'No users found.'}
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

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              User Details: {selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Comprehensive user information and activity
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <UserDetailsContent 
              user={selectedUser} 
              onUpdateRole={(newRole) => handleUpdateUserRole(selectedUser.id, newRole)}
              onSuspend={(shouldSuspend) => handleSuspendUser(selectedUser.id, shouldSuspend)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserCard({ user, onViewDetails, onUpdateRole, onSuspend, getRoleIcon, getRoleBadge }) {
  const RoleIcon = getRoleIcon(user.role || 'user');
  const isSuspended = user.suspended;

  return (
    <Card className={cn(
      "bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors",
      isSuspended && "border-red-500/30 bg-red-500/5"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {user.full_name || user.email}
                  {isSuspended && <Ban className="h-4 w-4 text-red-400" />}
                </h3>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <RoleIcon className="h-4 w-4" />
                <Badge variant={getRoleBadge(user.role || 'user')}>
                  {user.role || 'user'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CreditCard className="h-4 w-4" />
                <span>{user.credits || 0} credits</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {isSuspended ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400">Suspended</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Active</span>
                  </>
                )}
              </div>
            </div>

            {user.last_sign_in_at && (
              <p className="text-xs text-slate-500">
                Last sign in: {new Date(user.last_sign_in_at).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={onViewDetails}
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Select onValueChange={onUpdateRole} value={user.role || 'user'}>
              <SelectTrigger className="w-24 h-8 text-xs border-slate-700">
                <Settings className="h-3 w-3" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => onSuspend(!isSuspended)}
              variant="outline"
              size="sm"
              className={cn(
                "border-slate-700 hover:bg-slate-800",
                isSuspended 
                  ? "border-green-700 hover:bg-green-900/20 text-green-400" 
                  : "border-red-700 hover:bg-red-900/20 text-red-400"
              )}
            >
              {isSuspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserDetailsContent({ user, onUpdateRole, onSuspend }) {
  const scriptCount = Array.isArray(user.scripts) ? user.scripts.length : (user.scripts?.count || 0);
  const teamCount = user.team_members?.length || 0;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Full Name</label>
              <p className="text-white">{user.full_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Role</label>
              <p className="text-white">{user.role || 'user'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Status</label>
              <Badge variant={user.suspended ? 'destructive' : 'default'}>
                {user.suspended ? 'Suspended' : 'Active'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Credits</label>
              <p className="text-white">{user.credits || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Join Date</label>
              <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          {user.last_sign_in_at && (
            <div>
              <label className="text-sm font-medium text-slate-400">Last Sign In</label>
              <p className="text-white">{new Date(user.last_sign_in_at).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{scriptCount}</div>
              <div className="text-sm text-slate-400">Scripts Created</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{teamCount}</div>
              <div className="text-sm text-slate-400">Teams Joined</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <CreditCard className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{user.credits || 0}</div>
              <div className="text-sm text-slate-400">Credits Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Memberships */}
      {user.team_members && user.team_members.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Team Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.team_members.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">{membership.teams?.name}</p>
                      <p className="text-sm text-slate-400">
                        Joined {new Date(membership.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{membership.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select onValueChange={onUpdateRole} value={user.role || 'user'}>
              <SelectTrigger className="w-48 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => onSuspend(!user.suspended)}
              variant={user.suspended ? 'default' : 'destructive'}
            >
              {user.suspended ? 'Unsuspend User' : 'Suspend User'}
            </Button>
          </div>
          
          {user.suspended && (
            <Alert className="mt-4 border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                This user is currently suspended and cannot access the platform.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserManagementSkeleton() {
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
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 flex-1 bg-slate-800" />
            <Skeleton className="h-10 w-48 bg-slate-800" />
          </div>
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