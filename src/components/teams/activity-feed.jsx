'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  RefreshCw, 
  ChevronDown, 
  Clock,
  AlertCircle,
} from 'lucide-react';
import { getTeamActivities } from '@/lib/teams/activity-logger-client';

export default function ActivityFeed({ teamId, currentUser, className = "" }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const ITEMS_PER_PAGE = 20;

  const loadActivities = async (pageNumber = 0, append = false) => {
    try {
      if (!append) setIsLoading(true);
      setError('');

      const { data, error: fetchError } = await getTeamActivities(
        teamId,
        ITEMS_PER_PAGE
      );

      if (fetchError) {
        throw new Error(fetchError);
      }

      if (append) {
        setActivities(prev => [...prev, ...data]);
      } else {
        setActivities(data);
      }

      // Check if there are more activities
      setHasMore(data.length === ITEMS_PER_PAGE);
      setPage(pageNumber);
      
    } catch (err) {
      setError(err.message || 'Failed to load activity feed');
      if (!append) {
        setActivities([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    loadActivities(page + 1, true);
  };

  const refresh = () => {
    setPage(0);
    loadActivities(0, false);
  };

  useEffect(() => {
    if (teamId && currentUser?.id) {
      loadActivities();
    }
  }, [teamId, currentUser?.id]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || '??';
  };

  if (isLoading && activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Feed
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {activities.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No recent activity in this team
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Team activities will appear here as they happen
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={`${activity.id}-${index}`} className="flex items-start gap-3">
                {/* Activity Icon */}
                <div 
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    activity.color?.includes('green') ? 'bg-green-100' :
                    activity.color?.includes('blue') ? 'bg-blue-100' :
                    activity.color?.includes('red') ? 'bg-red-100' :
                    activity.color?.includes('yellow') ? 'bg-yellow-100' :
                    activity.color?.includes('purple') ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}
                >
                  {activity.icon}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {activity.profiles?.full_name || activity.profiles?.email || 'Unknown User'}
                        </span>{' '}
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                    
                    {/* User Avatar */}
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      {activity.profiles?.avatar_url ? (
                        <img 
                          src={activity.profiles.avatar_url} 
                          alt={activity.profiles.full_name || activity.profiles.email}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-full">
                          <span className="text-xs font-medium text-gray-600">
                            {getInitials(activity.profiles?.full_name, activity.profiles?.email)}
                          </span>
                        </div>
                      )}
                    </Avatar>
                  </div>

                  {/* Activity Details (if any) */}
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      {JSON.stringify(activity.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {isLoading && <RefreshCw className="w-3 h-3 mr-2 animate-spin" />}
                  <ChevronDown className="w-3 h-3 mr-2" />
                  Load More
                </Button>
              </div>
            )}

            {!hasMore && activities.length > 5 && (
              <p className="text-center text-xs text-gray-400 pt-4">
                That's all the recent activity
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}