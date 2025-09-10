'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  Edit3, 
  Type, 
  Eye, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Circle,
  Minus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CollaborationPresence({ 
  users = [], 
  activeEditors = {}, 
  typingUsers = {},
  showDetails = true,
  maxVisible = 8,
  className = '' 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTypingIndicators, setShowTypingIndicators] = useState(true);

  // Sort users by activity level
  const sortedUsers = [...users].sort((a, b) => {
    // Active editors first
    if (a.editing && !b.editing) return -1;
    if (!a.editing && b.editing) return 1;
    
    // Then by active status
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Finally by last activity
    const aTime = a.lastSeenTime || new Date(0);
    const bTime = b.lastSeenTime || new Date(0);
    return bTime - aTime;
  });

  const visibleUsers = isExpanded ? sortedUsers : sortedUsers.slice(0, maxVisible);
  const hiddenUsersCount = Math.max(0, sortedUsers.length - maxVisible);

  /**
   * Get user status
   */
  const getUserStatus = (user) => {
    if (user.editing) return 'editing';
    if (user.typing) return 'typing';
    if (user.isActive) return 'active';
    return 'idle';
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'editing':
        return 'text-blue-400';
      case 'typing':
        return 'text-green-400';
      case 'active':
        return 'text-green-400';
      case 'idle':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'editing':
        return Edit3;
      case 'typing':
        return Type;
      case 'active':
        return Eye;
      case 'idle':
        return Clock;
      default:
        return Minus;
    }
  };

  /**
   * Get typing indicators for all fields
   */
  const getTypingIndicators = () => {
    const indicators = [];
    
    Object.entries(typingUsers).forEach(([field, users]) => {
      if (users.length > 0) {
        indicators.push({
          field,
          users,
          text: getTypingText(field, users)
        });
      }
    });
    
    return indicators;
  };

  /**
   * Generate typing text
   */
  const getTypingText = (field, users) => {
    if (users.length === 0) return '';
    
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    
    if (users.length === 1) {
      return `${users[0].full_name || users[0].email} is typing in ${fieldName}...`;
    } else if (users.length === 2) {
      return `${users[0].full_name || users[0].email} and ${users[1].full_name || users[1].email} are typing in ${fieldName}...`;
    } else {
      return `${users[0].full_name || users[0].email} and ${users.length - 1} others are typing in ${fieldName}...`;
    }
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (user) => {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email ? user.email[0].toUpperCase() : '?';
  };

  /**
   * Get user tooltip content
   */
  const getUserTooltip = (user) => {
    const status = getUserStatus(user);
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <div className="text-center">
        <p className="font-medium">{user.full_name || user.email}</p>
        <p className="text-xs text-gray-400">{statusText}</p>
        {user.editing && (
          <p className="text-xs text-blue-400">Editing {user.editing}</p>
        )}
        {user.lastSeenTime && (
          <p className="text-xs text-gray-500">
            {status === 'active' ? 'Active' : 'Last seen'} {formatDistanceToNow(user.lastSeenTime, { addSuffix: true })}
          </p>
        )}
      </div>
    );
  };

  if (users.length === 0) {
    return (
      <Card className={`glass-card p-4 ${className}`}>
        <div className="flex items-center justify-center text-gray-400">
          <Users className="h-5 w-5 mr-2" />
          <span>No collaborators connected</span>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`glass-card p-4 ${className}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="font-semibold text-white">
                Active Collaborators ({users.length})
              </span>
            </div>
            
            {hiddenUsersCount > 0 && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show All ({hiddenUsersCount} more)
                  </>
                )}
              </Button>
            )}
          </div>

          {/* User Avatars */}
          <div className="flex items-center gap-3 flex-wrap">
            {visibleUsers.map(user => {
              const status = getUserStatus(user);
              const StatusIcon = getStatusIcon(status);
              
              return (
                <Tooltip key={user.id}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar 
                        className="h-10 w-10 border-2 transition-all duration-200 hover:scale-110"
                        style={{ borderColor: user.color || '#8b5cf6' }}
                      >
                        <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                        <AvatarFallback 
                          className="text-white text-sm font-semibold"
                          style={{ backgroundColor: user.color || '#8b5cf6' }}
                        >
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Status indicator */}
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-gray-900 flex items-center justify-center"
                           style={{ backgroundColor: user.color || '#8b5cf6' }}>
                        <StatusIcon className={`h-2.5 w-2.5 text-white`} />
                      </div>
                      
                      {/* Active pulse for editors */}
                      {status === 'editing' && (
                        <div className="absolute inset-0 rounded-full border-2 animate-pulse"
                             style={{ borderColor: user.color || '#8b5cf6' }}>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {getUserTooltip(user)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Active Editors Summary */}
          {showDetails && Object.keys(activeEditors).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Currently Editing
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeEditors).map(([field, editors]) => (
                  <Badge key={field} className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                    <span className="capitalize">{field}</span>
                    <span className="mx-1">•</span>
                    <span>{editors.length} user{editors.length !== 1 ? 's' : ''}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Typing Indicators */}
          {showDetails && showTypingIndicators && (
            <div className="space-y-2">
              {getTypingIndicators().map(indicator => (
                <div key={indicator.field} className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Type className="h-3 w-3 text-green-400" />
                    <div className="flex space-x-1">
                      <Circle className="h-2 w-2 text-green-400 animate-bounce" />
                      <Circle className="h-2 w-2 text-green-400 animate-bounce" style={{animationDelay: '0.1s'}} />
                      <Circle className="h-2 w-2 text-green-400 animate-bounce" style={{animationDelay: '0.2s'}} />
                    </div>
                  </div>
                  <span className="text-green-300">{indicator.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {showDetails && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-700/50 text-center">
              <div>
                <div className="text-lg font-bold text-green-400">
                  {users.filter(u => u.isActive).length}
                </div>
                <p className="text-xs text-gray-400">Active</p>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {Object.values(activeEditors).flat().length}
                </div>
                <p className="text-xs text-gray-400">Editing</p>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {Object.values(typingUsers).flat().length}
                </div>
                <p className="text-xs text-gray-400">Typing</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
}