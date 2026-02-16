'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  Activity,
  Database,
  FileText,
  TrendingUp
} from 'lucide-react';

const adminNavItems = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Admin dashboard overview'
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Detailed platform analytics'
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
    description: 'User management'
  },
  {
    href: '/admin/teams',
    label: 'Teams',
    icon: Users,
    description: 'Team management'
  },
  {
    href: '/admin/posthog',
    label: 'PostHog',
    icon: Activity,
    description: 'Product analytics & events'
  }
];

export default function AdminNav({ collapsed = false, onCollapse }) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className={cn(
      "admin-nav bg-slate-900/95 backdrop-blur border-r border-slate-800 flex flex-col h-full transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="font-semibold text-white">Admin Panel</span>
            </div>
          )}
          {collapsed && (
            <Shield className="h-6 w-6 text-red-500 mx-auto" />
          )}
          
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                    : "hover:bg-slate-800 text-slate-300 hover:text-white",
                  collapsed && "justify-center px-3"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform",
                  isActive && "text-red-400",
                  hoveredItem === item.href && !isActive && "scale-110"
                )} />
                
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    <div className="text-xs text-slate-400 truncate">{item.description}</div>
                  </div>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && hoveredItem === item.href && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg whitespace-nowrap z-50">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Badge */}
      <div className="p-4 border-t border-slate-800">
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg",
          collapsed && "justify-center"
        )}>
          <UserCog className="h-4 w-4 text-red-400 flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium text-red-300">Administrator</span>
          )}
        </div>
      </div>
    </div>
  );
}