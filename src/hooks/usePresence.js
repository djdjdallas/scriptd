import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { presenceManager } from '@/lib/realtime/presence-manager';

export function usePresence(scriptId, options = {}) {
  const {
    trackCursor = true,
    trackTyping = true,
    typingTimeout = 3000, // 3 seconds
    enableHeartbeat = true
  } = options;

  const user = useUser();
  
  const [presenceUsers, setPresenceUsers] = useState([]);
  const [activeEditors, setActiveEditors] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [cursors, setCursors] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Typing indicators
  const typingTimeouts = useRef(new Map());
  const lastActivity = useRef(new Map());

  /**
   * Initialize presence tracking
   */
  const initializePresence = useCallback(async () => {
    if (!user || !scriptId || isInitialized) return;

    try {
      await presenceManager.initializePresence(scriptId, user);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize presence:', error);
    }
  }, [user, scriptId, isInitialized]);

  /**
   * Update presence users list
   */
  const updatePresenceUsers = useCallback(() => {
    if (!scriptId) return;
    
    const users = presenceManager.getPresenceUsers(scriptId);
    setPresenceUsers(users);

    // Update active editors by field
    const editorsByField = {};
    const typing = {};
    
    users.forEach(user => {
      if (user.editing) {
        if (!editorsByField[user.editing]) {
          editorsByField[user.editing] = [];
        }
        editorsByField[user.editing].push(user);
      }
      
      if (user.typing && user.typing_field) {
        if (!typing[user.typing_field]) {
          typing[user.typing_field] = [];
        }
        typing[user.typing_field].push(user);
      }
    });

    setActiveEditors(editorsByField);
    setTypingUsers(typing);

    // Update cursors
    if (trackCursor) {
      const userCursors = presenceManager.getUserCursors(scriptId, user?.id);
      setCursors(userCursors);
    }
  }, [scriptId, trackCursor, user?.id]);

  /**
   * Set typing status for a field
   */
  const setTyping = useCallback(async (field, isTyping = true) => {
    if (!user || !scriptId) return;

    try {
      await presenceManager.setTyping(scriptId, user.id, field, isTyping);
      
      if (isTyping && trackTyping) {
        // Clear existing timeout
        const timeoutKey = `${field}_${user.id}`;
        if (typingTimeouts.current.has(timeoutKey)) {
          clearTimeout(typingTimeouts.current.get(timeoutKey));
        }

        // Set new timeout to stop typing indicator
        const timeout = setTimeout(async () => {
          await presenceManager.setTyping(scriptId, user.id, field, false);
          typingTimeouts.current.delete(timeoutKey);
        }, typingTimeout);

        typingTimeouts.current.set(timeoutKey, timeout);
      }
      
      updatePresenceUsers();
    } catch (error) {
      console.error('Failed to set typing status:', error);
    }
  }, [user, scriptId, trackTyping, typingTimeout, updatePresenceUsers]);

  /**
   * Stop typing for a field
   */
  const stopTyping = useCallback(async (field) => {
    if (!user || !scriptId) return;

    try {
      await presenceManager.setTyping(scriptId, user.id, field, false);
      
      // Clear timeout
      const timeoutKey = `${field}_${user.id}`;
      if (typingTimeouts.current.has(timeoutKey)) {
        clearTimeout(typingTimeouts.current.get(timeoutKey));
        typingTimeouts.current.delete(timeoutKey);
      }
      
      updatePresenceUsers();
    } catch (error) {
      console.error('Failed to stop typing:', error);
    }
  }, [user, scriptId, updatePresenceUsers]);

  /**
   * Update cursor position
   */
  const updateCursor = useCallback(async (position, selection = null, field = null) => {
    if (!user || !scriptId || !trackCursor) return;

    try {
      await presenceManager.updateCursor(scriptId, user.id, position, selection, field);
      
      // Update cursors list
      const userCursors = presenceManager.getUserCursors(scriptId, user.id);
      setCursors(userCursors);
    } catch (error) {
      console.error('Failed to update cursor:', error);
    }
  }, [user, scriptId, trackCursor]);

  /**
   * Update editing status
   */
  const setEditing = useCallback(async (field, isEditing = true) => {
    if (!user || !scriptId) return;

    try {
      await presenceManager.updatePresence(scriptId, user.id, {
        editing: isEditing ? field : null,
        last_activity: new Date().toISOString()
      });
      
      updatePresenceUsers();
    } catch (error) {
      console.error('Failed to set editing status:', error);
    }
  }, [user, scriptId, updatePresenceUsers]);

  /**
   * Get users currently editing a specific field
   */
  const getFieldEditors = useCallback((field) => {
    return activeEditors[field] || [];
  }, [activeEditors]);

  /**
   * Get users currently typing in a specific field
   */
  const getFieldTyping = useCallback((field) => {
    return typingUsers[field] || [];
  }, [typingUsers]);

  /**
   * Check if current user can edit a field
   */
  const canEditField = useCallback((field) => {
    const editors = getFieldEditors(field);
    return editors.length === 0 || editors.some(editor => editor.id === user?.id);
  }, [getFieldEditors, user?.id]);

  /**
   * Get presence summary for a field
   */
  const getFieldPresence = useCallback((field) => {
    return {
      editors: getFieldEditors(field),
      typing: getFieldTyping(field),
      canEdit: canEditField(field),
      hasActivity: getFieldEditors(field).length > 0 || getFieldTyping(field).length > 0
    };
  }, [getFieldEditors, getFieldTyping, canEditField]);

  /**
   * Activity tracking for auto-presence updates
   */
  const trackActivity = useCallback(async (field = null) => {
    if (!user || !scriptId) return;

    const now = Date.now();
    const lastActivityTime = lastActivity.current.get(field || 'general') || 0;
    
    // Throttle activity updates to prevent spam
    if (now - lastActivityTime > 1000) { // 1 second throttle
      lastActivity.current.set(field || 'general', now);
      
      await presenceManager.updatePresence(scriptId, user.id, {
        last_activity: new Date().toISOString(),
        editing: field
      });
    }
  }, [user, scriptId]);

  /**
   * Get typing indicator text
   */
  const getTypingText = useCallback((field) => {
    const typing = getFieldTyping(field);
    if (typing.length === 0) return '';
    
    if (typing.length === 1) {
      return `${typing[0].full_name || typing[0].email} is typing...`;
    } else if (typing.length === 2) {
      return `${typing[0].full_name || typing[0].email} and ${typing[1].full_name || typing[1].email} are typing...`;
    } else {
      return `${typing[0].full_name || typing[0].email} and ${typing.length - 1} others are typing...`;
    }
  }, [getFieldTyping]);

  /**
   * Cleanup presence
   */
  const cleanup = useCallback(() => {
    if (scriptId) {
      presenceManager.cleanup(scriptId);
    }
    
    // Clear all typing timeouts
    for (const timeout of typingTimeouts.current.values()) {
      clearTimeout(timeout);
    }
    typingTimeouts.current.clear();
    
    setIsInitialized(false);
    setPresenceUsers([]);
    setActiveEditors({});
    setTypingUsers({});
    setCursors([]);
  }, [scriptId]);

  // Initialize presence on mount
  useEffect(() => {
    initializePresence();
    return cleanup;
  }, [initializePresence, cleanup]);

  // Periodic presence updates
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      updatePresenceUsers();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isInitialized, updatePresenceUsers]);

  // Heartbeat for maintaining presence
  useEffect(() => {
    if (!user || !scriptId || !enableHeartbeat || !isInitialized) return;

    const heartbeat = setInterval(async () => {
      try {
        await presenceManager.updatePresence(scriptId, user.id, {
          heartbeat: new Date().toISOString()
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeat);
  }, [user, scriptId, enableHeartbeat, isInitialized]);

  return {
    // Presence data
    presenceUsers,
    activeEditors,
    typingUsers,
    cursors,
    isInitialized,
    
    // Actions
    setTyping,
    stopTyping,
    setEditing,
    updateCursor,
    trackActivity,
    
    // Utilities
    getFieldEditors,
    getFieldTyping,
    getFieldPresence,
    canEditField,
    getTypingText,
    
    // Stats
    totalUsers: presenceUsers.length,
    activeUsers: presenceUsers.filter(u => u.isActive).length,
    totalEditors: Object.values(activeEditors).flat().length,
    totalTyping: Object.values(typingUsers).flat().length,
    
    // Cleanup
    cleanup
  };
}