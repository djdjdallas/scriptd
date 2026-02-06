"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { VoiceTrainingNotifications } from "@/components/notifications/voice-training-notification";
import { CreditsProvider, useCredits } from "@/contexts/CreditsContext";
import { TourProvider, useTour } from "@/contexts/TourContext";
import { SidebarTour } from "@/components/tour/SidebarTour";
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
  ChevronDown,
  Zap,
  TrendingUp,
  Bookmark,
  Youtube,
  Wrench,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Memoized sidebar credits component using the shared context
const SidebarCredits = memo(function SidebarCredits() {
  const { credits, loading } = useCredits();

  return (
    <div className="glass-card p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-medium text-gray-300">Credits</span>
        </div>
        {loading ? (
          <span className="text-sm font-bold text-gray-500">...</span>
        ) : (
          <span className="text-sm font-bold gradient-text">
            {credits.toLocaleString()}
          </span>
        )}
      </div>
      <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${Math.min((credits / 1000) * 100, 100)}%` }}
        />
      </div>
      <Link href="/credits" className="block">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs py-1.5 h-auto"
        >
          Get More
        </Button>
      </Link>
    </div>
  );
});

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  {
    href: "/scripts",
    label: "Scripts",
    icon: FileText,
    subItems: [
      { href: "/scripts", label: "All Scripts", icon: FileText },
      { href: "/workflows", label: "Workflow Studio", icon: Zap },
      { href: "/scripts/create", label: "Quick Create", icon: Sparkles },
    ],
  },
  { href: "/channels", label: "Channels", icon: Play },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  {
    href: "/trending",
    label: "Trending",
    icon: TrendingUp,
    subItems: [
      { href: "/trending", label: "Trending Overview", icon: TrendingUp },
      { href: "/trending/channels", label: "Rising Channels", icon: Youtube },
      { href: "/trending/action-plans", label: "My Action Plans", icon: Zap },
    ],
  },
  { href: "/saved", label: "Saved Videos", icon: Bookmark },
  {
    href: "/research",
    label: "Research",
    icon: Brain,
    subItems: [
      { href: "/research", label: "Research Chat", icon: Brain },
      { href: "/research/youtube-tools", label: "YouTube Tools", icon: Wrench },
    ],
  },
  { href: "/voice", label: "Voice Training", icon: Mic },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/credits", label: "Credits", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Inner layout that can access TourContext
function DashboardInner({ children, user, handleSignOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed] = useState(true); // Start collapsed
  const [sidebarHovered, setSidebarHovered] = useState(false); // Track hover state
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState([
    "scripts",
    "research",
    "trending",
  ]); // Keep scripts, research and trending expanded by default
  const pathname = usePathname();
  const router = useRouter();
  const { isTourActive, startTour } = useTour();

  // Compute effective collapsed state — force expanded during tour
  const isCollapsed = sidebarCollapsed && !sidebarHovered && !isTourActive;

  // Force mobile sidebar open during tour
  useEffect(() => {
    if (isTourActive) {
      setSidebarOpen(true);
    }
  }, [isTourActive]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSidebarMouseEnter = useCallback(() => {
    setSidebarHovered(true);
  }, []);

  const handleSidebarMouseLeave = useCallback(() => {
    setSidebarHovered(false);
  }, []);

  const handleItemHover = useCallback((href) => {
    setHoveredItem(href);
  }, []);

  const handleItemLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  const handleExpandToggle = useCallback((label) => {
    setExpandedItems((prev) =>
      prev.includes(label.toLowerCase())
        ? prev.filter((i) => i !== label.toLowerCase())
        : [...prev, label.toLowerCase()]
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Voice Training Notifications */}
      {user && <VoiceTrainingNotifications userId={user.id} />}

      {/* Sidebar Tour */}
      <SidebarTour />

      {/* Static Background - no animations for performance */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -top-48 -left-48" />
        <div className="absolute w-96 h-96 bg-pink-600/10 rounded-full blur-3xl -bottom-48 -right-48" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 glass-button p-3"
      >
        {sidebarOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={cn(
          "fixed left-0 top-0 h-full glass border-r border-white/10 z-40 flex flex-col overflow-hidden",
          "transition-[width] duration-200 ease-out will-change-[width]",
          isCollapsed ? "w-20" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-purple-400 neon-glow flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-2xl font-bold gradient-text">
                  GenScript
                </span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.subItems &&
                  item.subItems.some((sub) => pathname === sub.href));
              const isExpanded = expandedItems.includes(
                item.label.toLowerCase()
              );
              const Icon = item.icon;

              return (
                <div key={item.href}>
                  <div
                    data-tour-step={item.href.replace(/^\//, '')}
                    onClick={() => {
                      if (isTourActive) return; // Prevent navigation during tour
                      if (
                        item.subItems &&
                        !isCollapsed
                      ) {
                        handleExpandToggle(item.label);
                      } else {
                        router.push(item.href);
                      }
                    }}
                    onMouseEnter={() => handleItemHover(item.href)}
                    onMouseLeave={handleItemLeave}
                    className={cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-300 group relative cursor-pointer",
                      isCollapsed
                        ? "justify-center px-3 py-3"
                        : "px-4 py-3",
                      isActive
                        ? "glass bg-purple-500/20 text-white"
                        : "hover:glass hover:bg-white/10 text-gray-300 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform flex-shrink-0",
                        isActive && "text-purple-400",
                        hoveredItem === item.href && "scale-110"
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        {item.subItems ? (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 ml-auto transition-transform",
                              isExpanded ? "rotate-180" : "",
                              isActive ? "text-purple-400" : "text-gray-400"
                            )}
                          />
                        ) : (
                          isActive && (
                            <ChevronRight className="h-4 w-4 ml-auto text-purple-400" />
                          )
                        )}
                        {hoveredItem === item.href &&
                          !isActive &&
                          !item.subItems && (
                            <Sparkles className="h-3 w-3 ml-auto text-yellow-400 animate-pulse" />
                          )}
                      </>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed &&
                      hoveredItem === item.href && (
                        <div className="absolute left-full ml-2 px-3 py-1 glass rounded-lg whitespace-nowrap z-50">
                          <span className="text-sm text-white leading-none">
                            {item.label}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Sub-items */}
                  {item.subItems &&
                    !isCollapsed &&
                    isExpanded && (
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
                              <SubIcon
                                className={cn(
                                  "h-4 w-4",
                                  isSubActive && "text-purple-400"
                                )}
                              />
                              <span className="text-sm leading-none">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
          </nav>

          {/* Credits Display Card */}
          {!isCollapsed && (
            <div className="mt-auto pt-4 border-t border-white/10">
              <SidebarCredits />
            </div>
          )}

          {/* Product Tour Button */}
          {!isCollapsed && (
            <div className="mt-4">
              <Button
                onClick={startTour}
                className="glass-button text-gray-300 hover:text-white w-full"
              >
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                <span className="ml-2 leading-none">Product Tour</span>
              </Button>
            </div>
          )}

          {/* Sign Out */}
          <div className="mt-2">
            <Button
              onClick={handleSignOut}
              className={cn(
                "glass-button text-white w-full",
                isCollapsed && "px-3"
              )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-2 leading-none">Sign Out</span>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-[margin] duration-200 ease-out will-change-[margin]",
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && !isTourActive && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // IMPORTANT: Let middleware handle auth
    // This component just needs to get the current user for display
    const checkUser = async () => {
      // Prevent multiple simultaneous checks
      if (!loading) return;

      const supabase = createClient();

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        // Don't redirect here - let middleware handle it
        // The middleware will redirect to login if needed
        setUser(user);
      } catch (error) {
        // Silent fail - middleware handles auth
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []); // Only run once on mount

  // Add auth timeout - redirect if stuck on "Authenticating..." for too long
  useEffect(() => {
    if (!loading && !user) {
      const timeout = setTimeout(() => {
        router.push('/login?error=auth_timeout&message=Authentication timed out. Please try signing in again.');
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    const supabase = createClient();

    try {
      // Clear client-side auth state
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }

    // Hard navigation to clear server-side state via middleware
    // Using window.location ensures full page reload and cookie clearing
    window.location.href = '/login';
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
    <CreditsProvider userId={user?.id}>
      <TourProvider userId={user?.id}>
        <DashboardInner user={user} handleSignOut={handleSignOut}>
          {children}
        </DashboardInner>
      </TourProvider>
    </CreditsProvider>
  );
}
