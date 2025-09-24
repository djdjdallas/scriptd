'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  Users, 
  Video, 
  Eye, 
  BarChart3, 
  TrendingUp,
  MoreVertical,
  RefreshCw,
  Trash
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useState } from 'react';

export function ChannelCard({ channel, onRefresh, onDelete }) {
  const [disconnectModal, setDisconnectModal] = useState({ isOpen: false });
  const handleRefresh = async () => {
    try {
      const response = await fetch(`/api/channels/${channel.id}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh channel');
      }

      toast.success('Channel data refreshed');
      if (onRefresh) {
        onRefresh(channel.id);
      }
    } catch (error) {
      toast.error('Failed to refresh channel data');
    }
  };

  const handleDeleteClick = () => {
    setDisconnectModal({ isOpen: true });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/channels/${channel.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete channel');
      }

      toast.success('Channel disconnected');
      if (onDelete) {
        onDelete(channel.id);
      }
    } catch (error) {
      toast.error('Failed to disconnect channel');
    } finally {
      setDisconnectModal({ isOpen: false });
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const performanceScore = channel.analytics_summary?.performance_score || 0;
  const growthPotential = channel.analytics_summary?.growth_potential || 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader>
        <div className="flex items-start gap-4">
          {channel.thumbnail_url && (
            <img
              src={channel.thumbnail_url}
              alt={channel.title}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{channel.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {channel.description || 'No description available'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(channel.subscriber_count)}</p>
            <p className="text-xs text-muted-foreground">Subscribers</p>
          </div>
          <div>
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Video className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(channel.video_count)}</p>
            <p className="text-xs text-muted-foreground">Videos</p>
          </div>
          <div>
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(channel.view_count)}</p>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </div>
        </div>

        {channel.analytics_summary && (
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Performance: {performanceScore}%
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Growth: {growthPotential}%
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {channel.last_analyzed_at
              ? `Analyzed ${formatDistanceToNow(new Date(channel.last_analyzed_at))} ago`
              : 'Not analyzed yet'}
          </p>
          <Link href={`/channels/${channel.id}/analyze`}>
            <Button size="sm">
              {channel.last_analyzed_at ? 'View Analysis' : 'Analyze'}
            </Button>
          </Link>
        </div>
      </CardContent>
      
      <ConfirmationModal
        isOpen={disconnectModal.isOpen}
        onClose={() => setDisconnectModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Disconnect Channel"
        message={`Are you sure you want to disconnect "${channel.title}"? This will remove the channel and all associated data from your account.`}
        confirmText="Disconnect"
        cancelText="Cancel"
      />
    </Card>
  );
}