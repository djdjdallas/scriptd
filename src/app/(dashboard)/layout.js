'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { VoiceTrainingNotifications } from '@/components/notifications/voice-training-notification';
import {
  FileText,
  Play,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Mic,
  Brain,
  Home,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Zap,
  TrendingUp,
  Bookmark,
  Youtube,
  Wrench,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/scripts', label: 'Scripts', icon: FileText },
  { href: '/channels', label: 'Channels', icon: Play },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { 
    href: '/trending', 
    label: 'Trending', 
    icon: TrendingUp,
    subItems: [
      { href: '/trending', label: 'Trending Overview', icon: TrendingUp },
      { href: '/trending/channels', label: 'Rising Channels', icon: Youtube },
      { href: '/trending/action-plans', label: 'My Action Plans', icon: Zap }
    ]
  },
  { href: '/saved', label: 'Saved Videos', icon: Bookmark },
  { 
    href: '/research', 
    label: 'Research', 
    icon: Brain,
    subItems: [
      { href: '/research', label: 'Research Chat', icon: Brain },
      { href: '/research/youtube-tools', label: 'YouTube Tools', icon: Wrench }
    ]
  },
  { href: '/voice', label: 'Voice Training', icon: Mic },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/credits', label: 'Credits', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState(['research', 'trending']); // Keep research and trending expanded by default
  const [credits, setCredits] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  // Debug: Track component lifecycle
  useEffect(() => {
    console.log(`[DashboardLayout] Mounted at ${new Date().toISOString()}`);
    console.log(`[DashboardLayout] Current path: ${pathname}`);
    
    return () => {
      console.log('[DashboardLayout] Unmounting');
    };
  }, []);

  useEffect(() => {
    // IMPORTANT: Let middleware handle auth
    // This component just needs to get the current user for display
    const checkUser = async () => {
      console.log('[DashboardLayout] Checking current user');
      const supabase = createClient();
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('[DashboardLayout] Error getting user:', error);
          // Don't redirect here - let middleware handle it
          // The middleware will redirect to login if needed
        }
        
        console.log(`[DashboardLayout] User: ${user?.email || 'not authenticated'}`);
        setUser(user);
      } catch (error) {
        console.error('[DashboardLayout] Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []); // Only run once on mount

  useEffect(() => {
    // Fetch credits when user is available
    if (user) {
      console.log('[DashboardLayout] Fetching credits for user:', user.email);
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;
    
    setCreditsLoading(true);
    try {
      const supabase = createClient();
      // Get credit balance using the RPC function
      const { data: balance, error: rpcError } = await supabase
        .rpc('get_available_credit_balance', { p_user_id: user.id });
      
      if (rpcError) {
        console.error('[DashboardLayout] RPC error fetching credits:', rpcError);
        // Fallback to fetch from users table
        const { data: userData } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
        
        setCredits(userData?.credits || 0);
      } else {
        setCredits(balance || 0);
      }
      
      console.log('[DashboardLayout] Credits loaded:', balance || 0);
    } catch (error) {
      console.error('[DashboardLayout] Error fetching credits:', error);
      setCredits(0);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('[DashboardLayout] Signing out');
    const supabase = createClient();
    
    try {
      await supabase.auth.signOut();
      // The auth provider or middleware will handle the redirect
      console.log('[DashboardLayout] Sign out successful');
      
      // Use router.push instead of window.location for smoother navigation
      router.push('/login');
    } catch (error) {
      console.error('[DashboardLayout] Sign out error:', error);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="glass-card p-8">
          <Sparkles className="h-12 w-12 text-purple-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, show a message (middleware will redirect if needed)
  if (!loading && !user) {
    console.log('[DashboardLayout] No user found after loading');
    // Don't render the dashboard, middleware will redirect
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="glass-card p-8">
          <Sparkles className="h-12 w-12 text-purple-400 animate-pulse mx-auto" />
          <p className="mt-4 text-gray-300">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Voice Training Notifications */}
      {user && <VoiceTrainingNotifications userId={user.id} />}
      
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -left-48 opacity-10" />
        <div className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -right-48 opacity-10" style={{ animationDelay: '10s' }} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 glass-button p-3"
      >
        {sidebarOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full glass border-r border-white/10 transition-all duration-300 z-40 flex flex-col overflow-hidden",
        sidebarCollapsed ? "w-20" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Collapse Button - Desktop Only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 glass rounded-full items-center justify-center hover:scale-110 transition-transform"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3 text-white" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-white" />
          )}
        </button>

        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-purple-400 neon-glow flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-2xl font-bold gradient-text">GenScript</span>
              )}
            </Link>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && user && (
            <div className="glass-card p-4 mb-6">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-white font-medium truncate">{user.email}</p>
            </div>
          )}

        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href));
            const isExpanded = expandedItems.includes(item.label.toLowerCase());
            const Icon = item.icon;
            
            return (
              <div key={item.href}>
                <div
                  onClick={() => {
                    if (item.subItems && !sidebarCollapsed) {
                      setExpandedItems(prev => 
                        prev.includes(item.label.toLowerCase())
                          ? prev.filter(i => i !== item.label.toLowerCase())
                          : [...prev, item.label.toLowerCase()]
                      );
                    } else {
                      router.push(item.href);
                    }
                  }}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl transition-all duration-300 group relative cursor-pointer",
                    sidebarCollapsed ? "justify-center px-3 py-3" : "px-4 py-3",
                    isActive
                      ? "glass bg-purple-500/20 text-white"
                      : "hover:glass hover:bg-white/10 text-gray-300 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-transform flex-shrink-0",
                    isActive && "text-purple-400",
                    hoveredItem === item.href && "scale-110"
                  )} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.subItems ? (
                        <ChevronDown className={cn(
                          "h-4 w-4 ml-auto transition-transform",
                          isExpanded ? "rotate-180" : "",
                          isActive ? "text-purple-400" : "text-gray-400"
                        )} />
                      ) : (
                        isActive && (
                          <ChevronRight className="h-4 w-4 ml-auto text-purple-400" />
                        )
                      )}
                      {hoveredItem === item.href && !isActive && !item.subItems && (
                        <Sparkles className="h-3 w-3 ml-auto text-yellow-400 animate-pulse" />
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && hoveredItem === item.href && (
                    <div className="absolute left-full ml-2 px-3 py-1 glass rounded-lg whitespace-nowrap z-50">
                      <span className="text-sm text-white">{item.label}</span>
                    </div>
                  )}
                </div>
                
                {/* Sub-items */}
                {item.subItems && !sidebarCollapsed && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;
                      
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                            isSubActive
                              ? "glass bg-purple-500/20 text-white"
                              : "hover:glass hover:bg-white/5 text-gray-400 hover:text-white"
                          )}
                        >
                          <SubIcon className={cn(
                            "h-4 w-4",
                            isSubActive && "text-purple-400"
                          )} />
                          <span className="text-sm">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

          {/* Credits Display */}
          {!sidebarCollapsed && (
            <div className="glass-card p-4 mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Credits</span>
                {creditsLoading ? (
                  <span className="text-lg font-bold text-gray-500 animate-pulse">...</span>
                ) : (
                  <span className="text-lg font-bold gradient-text">{credits.toLocaleString()}</span>
                )}
              </div>
              <div className="w-full h-2 glass rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-shimmer" 
                  style={{ width: `${Math.min((credits / 1000) * 100, 100)}%` }} 
                />
              </div>
              <Link href="/credits">
                <Button className="w-full mt-3 glass-button text-white text-sm">
                  Get More Credits
                </Button>
              </Link>
            </div>
          )}

          {/* Sign Out */}
          <div className="mt-auto">
            <Button
              onClick={handleSignOut}
              className={cn(
                "glass-button text-white w-full",
                sidebarCollapsed && "px-3"
              )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}