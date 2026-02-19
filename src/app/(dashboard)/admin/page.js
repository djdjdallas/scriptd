'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { adminService } from '@/lib/admin/admin-service';
import AdminDashboard from '@/components/admin/admin-dashboard';
import AdminNav from '@/components/admin/admin-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Check if user is admin
      const adminCheck = await adminService.isAdmin(user.id);
      if (!adminCheck) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-slate-900/50 border-slate-800">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-6">
              You don't have admin permissions to access this area.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex">
      {/* Admin Sidebar */}
      <AdminNav
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 transition-all duration-300">
        {/* Admin Header */}
        <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-red-500" />
              <div>
                <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Platform Administration</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-400" />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Admin Dashboard Content */}
        <main className="p-6">
          <AdminDashboard />
        </main>
      </div>
    </div>
  );
}

function AdminPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-slate-900/95 border-r border-slate-800 p-4">
        <Skeleton className="h-8 w-32 bg-slate-800 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-slate-800" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1">
        <div className="bg-slate-900/95 border-b border-slate-800 px-6 py-4">
          <Skeleton className="h-8 w-48 bg-slate-800" />
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full bg-slate-800" />
            <div className="grid grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 bg-slate-800" />
              ))}
            </div>
            <Skeleton className="h-64 w-full bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}