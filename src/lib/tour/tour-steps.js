import {
  Home,
  FileText,
  Play,
  Calendar,
  TrendingUp,
  Bookmark,
  Brain,
  Mic,
  BarChart3,
  CreditCard,
  Settings,
} from 'lucide-react';

export const tourSteps = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Your home base. See recent scripts, channel performance, and quick actions.',
    icon: Home,
  },
  {
    id: 'scripts',
    title: 'Scripts',
    description: 'Create and manage AI-generated scripts. Access Workflow Studio or Quick Create.',
    icon: FileText,
  },
  {
    id: 'channels',
    title: 'Channels',
    description: 'Connect YouTube channels. Powers personalized scripts and voice training.',
    icon: Play,
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'Plan and schedule your content publishing timeline.',
    icon: Calendar,
  },
  {
    id: 'trending',
    title: 'Trending',
    description: 'Discover trending topics, rising channels, and build action plans.',
    icon: TrendingUp,
  },
  {
    id: 'saved',
    title: 'Saved Videos',
    description: 'Bookmark videos for research and inspiration.',
    icon: Bookmark,
  },
  {
    id: 'research',
    title: 'Research',
    description: 'AI research assistant. Chat about strategy and use YouTube tools.',
    icon: Brain,
  },
  {
    id: 'voice',
    title: 'Voice Training',
    description: 'Train AI to write in your unique voice and style.',
    icon: Mic,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track script metrics, credit usage, and content performance.',
    icon: BarChart3,
  },
  {
    id: 'credits',
    title: 'Credits',
    description: 'View balance, purchase credits, or upgrade your plan.',
    icon: CreditCard,
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Manage profile, preferences, and restart this tour anytime.',
    icon: Settings,
  },
];
