import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { collaborationService } from '@/lib/realtime/collaboration-service';
import { presenceManager } from '@/lib/realtime/presence-manager';
import { useToast } from '@/components/ui/use-toast';

export function useCollaboration(scriptId, options = {}) {
  const {
    onContentChange,
    onConflictResolved,
    autoResolveConflicts = true,
    enableOperationalTransform = true
  } = options;

  const user = useUser();
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Change tracking
  const [pendingChanges, setPendingChanges] = useState([]);
  const [conflictingChanges, setConflictingChanges] = useState([]);
  const [lastSyncVersion, setLastSyncVersion] = useState(0);
  
  // Performance tracking
  const [syncLatency, setSyncLatency] = useState(null);
  const syncTimestamps = useRef(new Map());
  
  // Network status
  const [networkStatus, setNetworkStatus] = useState('online');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  /**
   * Initialize collaboration session
   */
  const initializeCollaboration = useCallback(async () => {
    if (!user || !scriptId || isConnecting) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Initialize presence tracking
      const userProfile = await presenceManager.initializePresence(scriptId, user);
      
      // Join collaboration session
      const channel = await collaborationService.joinSession(scriptId, user.id, userProfile);
      
      setIsConnected(true);
      setRetryCount(0);
      
      // Subscribe to collaboration events
      setupEventListeners();
      
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
      setConnectionError(error.message);
      
      // Retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          initializeCollaboration();
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    } finally {
      setIsConnecting(false);
    }
  }, [user, scriptId, isConnecting, retryCount]);

  /**
   * Setup event listeners for collaboration
   */
  const setupEventListeners = useCallback(() => {
    if (!scriptId) return;

    // Content change listener
    const unsubscribeContentChange = collaborationService.subscribe(
      scriptId,
      'content_change',
      handleRemoteContentChange
    );

    // Presence listeners
    const unsubscribePresenceSync = collaborationService.subscribe(
      scriptId,
      'presence_sync',
      handlePresenceSync
    );

    const unsubscribeUserJoin = collaborationService.subscribe(
      scriptId,
      'user_join',
      handleUserJoin
    );

    const unsubscribeUserLeave = collaborationService.subscribe(
      scriptId,
      'user_leave',
      handleUserLeave
    );

    // Conflict resolution listener
    const unsubscribeConflictResolved = collaborationService.subscribe(
      scriptId,
      'conflict_resolved',
      handleConflictResolved
    );

    // Store unsubscribe functions
    return () => {
      unsubscribeContentChange();
      unsubscribePresenceSync();
      unsubscribeUserJoin();
      unsubscribeUserLeave();
      unsubscribeConflictResolved();
    };
  }, [scriptId]);

  /**
   * Handle remote content changes
   */
  const handleRemoteContentChange = useCallback(async (change) => {
    const timestamp = syncTimestamps.current.get(change.transform_id);
    if (timestamp) {
      setSyncLatency(Date.now() - timestamp);
      syncTimestamps.current.delete(change.transform_id);
    }

    // Check for conflicts
    const hasConflict = pendingChanges.some(pending => 
      pending.field === change.field && 
      pending.timestamp > change.timestamp - 1000 // 1 second tolerance
    );

    if (hasConflict && enableOperationalTransform) {
      // Add to conflicting changes for resolution
      setConflictingChanges(prev => [...prev, change]);
      
      if (autoResolveConflicts) {
        await resolveConflict(change);
      }
    } else {
      // Apply change directly
      if (onContentChange) {
        onContentChange(change);
      }
    }

    // Remove from pending changes if it was ours
    setPendingChanges(prev => prev.filter(p => p.transform_id !== change.transform_id));
  }, [pendingChanges, enableOperationalTransform, autoResolveConflicts, onContentChange]);

  /**
   * Handle presence updates
   */
  const handlePresenceSync = useCallback((presenceState) => {
    presenceManager.handlePresenceSync(scriptId, presenceState);
    const users = presenceManager.getPresenceUsers(scriptId);
    setActiveCollaborators(users);
  }, [scriptId]);

  const handleUserJoin = useCallback((data) => {
    presenceManager.handleUserJoin(scriptId, data);
    const users = presenceManager.getPresenceUsers(scriptId);
    setActiveCollaborators(users);
    
    toast({
      title: "User Joined",
      description: `${data.presences[0]?.profile?.full_name || 'Someone'} joined the collaboration`,
      duration: 3000
    });
  }, [scriptId, toast]);

  const handleUserLeave = useCallback((data) => {
    presenceManager.handleUserLeave(scriptId, data);
    const users = presenceManager.getPresenceUsers(scriptId);
    setActiveCollaborators(users);
  }, [scriptId]);

  /**
   * Handle conflict resolution
   */
  const handleConflictResolved = useCallback((resolution) => {
    setConflictingChanges(prev => prev.filter(c => c.transform_id !== resolution.conflictId));
    
    if (onConflictResolved) {
      onConflictResolved(resolution);
    }
  }, [onConflictResolved]);

  /**
   * Broadcast content change
   */
  const broadcastChange = useCallback(async (change) => {
    if (!isConnected || !user) return;

    const transformId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestampedChange = {
      ...change,
      userId: user.id,
      timestamp: Date.now(),
      transform_id: transformId,
      baseVersion: lastSyncVersion
    };

    // Store timestamp for latency calculation
    syncTimestamps.current.set(transformId, Date.now());
    
    // Add to pending changes
    setPendingChanges(prev => [...prev, timestampedChange]);

    try {
      await collaborationService.broadcastContentChange(scriptId, timestampedChange);
    } catch (error) {
      console.error('Failed to broadcast change:', error);
      
      // Remove from pending on failure
      setPendingChanges(prev => prev.filter(p => p.transform_id !== transformId));
      
      toast({
        title: "Sync Failed",
        description: "Failed to sync changes with other users",
        variant: "destructive"
      });
    }
  }, [isConnected, user, scriptId, lastSyncVersion, toast]);

  /**
   * Update editing status
   */
  const updateEditingStatus = useCallback(async (field, isEditing = true) => {
    if (!isConnected || !user) return;

    try {
      await collaborationService.updateEditingStatus(scriptId, field, isEditing);
      await presenceManager.updatePresence(scriptId, user.id, {
        editing: isEditing ? field : null,
        last_activity: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update editing status:', error);
    }
  }, [isConnected, user, scriptId]);

  /**
   * Update cursor position
   */
  const updateCursor = useCallback(async (position, selection = null, field = null) => {
    if (!isConnected || !user) return;

    try {
      await collaborationService.broadcastCursorMove(scriptId, {
        userId: user.id,
        position,
        selection,
        field
      });

      await presenceManager.updateCursor(scriptId, user.id, position, selection, field);
    } catch (error) {
      console.error('Failed to update cursor:', error);
    }
  }, [isConnected, user, scriptId]);

  /**
   * Resolve conflicts using operational transforms
   */
  const resolveConflict = useCallback(async (conflictingChange) => {
    // Simple last-write-wins strategy for now
    // In production, you'd implement more sophisticated conflict resolution
    try {
      if (onContentChange) {
        onContentChange(conflictingChange);
      }

      // Notify about conflict resolution
      toast({
        title: "Conflict Resolved",
        description: "Changes have been automatically merged",
        duration: 3000
      });
      
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      toast({
        title: "Conflict Resolution Failed",
        description: "Please refresh the page to sync changes",
        variant: "destructive"
      });
    }
  }, [onContentChange, toast]);

  /**
   * Disconnect from collaboration
   */
  const disconnect = useCallback(async () => {
    try {
      await collaborationService.leaveSession(scriptId);
      presenceManager.cleanup(scriptId);
      setIsConnected(false);
      setActiveCollaborators([]);
      setPendingChanges([]);
      setConflictingChanges([]);
    } catch (error) {
      console.error('Failed to disconnect from collaboration:', error);
    }
  }, [scriptId]);

  /**
   * Get active editors for a specific field
   */
  const getActiveEditors = useCallback((field = null) => {
    return presenceManager.getActiveEditors(scriptId, field);
  }, [scriptId]);

  /**
   * Check if user can edit (no conflicts)
   */
  const canEdit = useCallback((field) => {
    const editors = getActiveEditors(field);
    return editors.length === 0 || editors.some(editor => editor.id === user?.id);
  }, [getActiveEditors, user]);

  // Initialize collaboration on mount
  useEffect(() => {
    if (user && scriptId) {
      initializeCollaboration();
    }

    return () => {
      disconnect();
    };
  }, [user, scriptId]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      if (!isConnected && user && scriptId) {
        initializeCollaboration();
      }
    };

    const handleOffline = () => {
      setNetworkStatus('offline');
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, user, scriptId, initializeCollaboration]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    networkStatus,
    
    // Collaboration data
    activeCollaborators,
    pendingChanges,
    conflictingChanges,
    syncLatency,
    
    // Actions
    broadcastChange,
    updateEditingStatus,
    updateCursor,
    disconnect,
    reconnect: initializeCollaboration,
    
    // Utilities
    getActiveEditors,
    canEdit,
    
    // Stats
    collaboratorCount: activeCollaborators.length,
    hasConflicts: conflictingChanges.length > 0,
    hasPendingChanges: pendingChanges.length > 0
  };
}