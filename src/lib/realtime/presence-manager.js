import { collaborationService } from './collaboration-service';

class PresenceManager {
  constructor() {
    this.userProfiles = new Map();
    this.presenceStates = new Map();
    this.activityTimers = new Map();
    this.IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    this.HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
  }

  /**
   * Initialize presence tracking for a script session
   */
  async initializePresence(scriptId, currentUser) {
    if (!currentUser?.id) {
      throw new Error('Current user is required for presence tracking');
    }

    // Store current user profile
    this.userProfiles.set(currentUser.id, {
      id: currentUser.id,
      email: currentUser.email,
      full_name: currentUser.user_metadata?.full_name || currentUser.email,
      avatar_url: currentUser.user_metadata?.avatar_url,
      color: this._generateUserColor(currentUser.id)
    });

    // Initialize presence state for script
    if (!this.presenceStates.has(scriptId)) {
      this.presenceStates.set(scriptId, new Map());
    }

    // Start activity monitoring
    this._startActivityMonitoring(scriptId, currentUser.id);

    // Start heartbeat
    this._startHeartbeat(scriptId, currentUser.id);

    return this.userProfiles.get(currentUser.id);
  }

  /**
   * Update user's presence state
   */
  async updatePresence(scriptId, userId, presenceData) {
    const scriptPresence = this.presenceStates.get(scriptId);
    if (!scriptPresence) return;

    const currentPresence = scriptPresence.get(userId) || {};
    const updatedPresence = {
      ...currentPresence,
      ...presenceData,
      last_activity: new Date().toISOString(),
      status: 'active'
    };

    scriptPresence.set(userId, updatedPresence);
    this._resetActivityTimer(scriptId, userId);

    // Broadcast presence update through collaboration service
    await collaborationService.updateEditingStatus(
      scriptId,
      presenceData.editing,
      !!presenceData.editing
    );
  }

  /**
   * Get all users present in a script session
   */
  getPresenceUsers(scriptId) {
    const scriptPresence = this.presenceStates.get(scriptId) || new Map();
    const users = [];

    for (const [userId, presence] of scriptPresence) {
      const profile = this.userProfiles.get(userId);
      if (profile) {
        users.push({
          ...profile,
          ...presence,
          isActive: this._isUserActive(presence),
          lastSeenTime: presence.last_activity ? new Date(presence.last_activity) : null
        });
      }
    }

    return users.sort((a, b) => {
      // Sort by active status first, then by last activity
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      const aTime = a.lastSeenTime || new Date(0);
      const bTime = b.lastSeenTime || new Date(0);
      return bTime - aTime;
    });
  }

  /**
   * Get active editors for specific fields
   */
  getActiveEditors(scriptId, field = null) {
    const users = this.getPresenceUsers(scriptId);
    
    return users.filter(user => {
      if (!user.isActive) return false;
      if (!user.editing) return false;
      if (field && user.editing !== field) return false;
      return true;
    });
  }

  /**
   * Get users with cursor positions
   */
  getUserCursors(scriptId, excludeUserId = null) {
    const scriptPresence = this.presenceStates.get(scriptId) || new Map();
    const cursors = [];

    for (const [userId, presence] of scriptPresence) {
      if (userId === excludeUserId) continue;
      if (!this._isUserActive(presence)) continue;
      if (!presence.cursor_position) continue;

      const profile = this.userProfiles.get(userId);
      if (profile) {
        cursors.push({
          userId,
          profile,
          position: presence.cursor_position,
          selection: presence.selection,
          field: presence.editing
        });
      }
    }

    return cursors;
  }

  /**
   * Handle presence sync from collaboration service
   */
  handlePresenceSync(scriptId, presenceState) {
    const scriptPresence = this.presenceStates.get(scriptId) || new Map();

    // Clear existing presence
    scriptPresence.clear();

    // Process presence state from Supabase
    Object.entries(presenceState).forEach(([userId, presences]) => {
      if (presences && presences.length > 0) {
        // Use the latest presence data
        const latestPresence = presences[presences.length - 1];
        scriptPresence.set(userId, {
          ...latestPresence,
          status: this._calculateUserStatus(latestPresence)
        });

        // Store user profile if not already stored
        if (latestPresence.profile && !this.userProfiles.has(userId)) {
          this.userProfiles.set(userId, {
            ...latestPresence.profile,
            color: this._generateUserColor(userId)
          });
        }
      }
    });

    this.presenceStates.set(scriptId, scriptPresence);
  }

  /**
   * Handle user joining
   */
  handleUserJoin(scriptId, { userId, presences }) {
    if (presences && presences.length > 0) {
      const latestPresence = presences[presences.length - 1];
      
      // Store user profile
      if (latestPresence.profile) {
        this.userProfiles.set(userId, {
          ...latestPresence.profile,
          color: this._generateUserColor(userId)
        });
      }

      // Update presence state
      const scriptPresence = this.presenceStates.get(scriptId) || new Map();
      scriptPresence.set(userId, {
        ...latestPresence,
        status: 'active'
      });
      this.presenceStates.set(scriptId, scriptPresence);
    }
  }

  /**
   * Handle user leaving
   */
  handleUserLeave(scriptId, { userId }) {
    const scriptPresence = this.presenceStates.get(scriptId);
    if (scriptPresence) {
      scriptPresence.delete(userId);
    }

    // Clear activity timer
    const timerId = this.activityTimers.get(`${scriptId}_${userId}`);
    if (timerId) {
      clearTimeout(timerId);
      this.activityTimers.delete(`${scriptId}_${userId}`);
    }
  }

  /**
   * Set user as typing in a specific field
   */
  async setTyping(scriptId, userId, field, isTyping = true) {
    await this.updatePresence(scriptId, userId, {
      editing: isTyping ? field : null,
      typing: isTyping,
      typing_field: isTyping ? field : null
    });
  }

  /**
   * Update user's cursor position
   */
  async updateCursor(scriptId, userId, position, selection = null, field = null) {
    await this.updatePresence(scriptId, userId, {
      cursor_position: position,
      selection,
      editing: field
    });
  }

  /**
   * Clean up presence for a script
   */
  cleanup(scriptId) {
    this.presenceStates.delete(scriptId);
    
    // Clear activity timers for this script
    for (const [key, timerId] of this.activityTimers) {
      if (key.startsWith(`${scriptId}_`)) {
        clearTimeout(timerId);
        this.activityTimers.delete(key);
      }
    }
  }

  /**
   * Start monitoring user activity
   */
  _startActivityMonitoring(scriptId, userId) {
    this._resetActivityTimer(scriptId, userId);
  }

  /**
   * Reset activity timer for user
   */
  _resetActivityTimer(scriptId, userId) {
    const timerKey = `${scriptId}_${userId}`;
    
    // Clear existing timer
    const existingTimer = this.activityTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this._markUserIdle(scriptId, userId);
    }, this.IDLE_TIMEOUT);

    this.activityTimers.set(timerKey, timer);
  }

  /**
   * Mark user as idle
   */
  _markUserIdle(scriptId, userId) {
    const scriptPresence = this.presenceStates.get(scriptId);
    if (scriptPresence && scriptPresence.has(userId)) {
      const presence = scriptPresence.get(userId);
      scriptPresence.set(userId, {
        ...presence,
        status: 'idle',
        editing: null,
        typing: false
      });
    }
  }

  /**
   * Start heartbeat for presence
   */
  _startHeartbeat(scriptId, userId) {
    const heartbeatKey = `heartbeat_${scriptId}_${userId}`;
    
    const heartbeat = setInterval(async () => {
      const scriptPresence = this.presenceStates.get(scriptId);
      if (scriptPresence && scriptPresence.has(userId)) {
        await this.updatePresence(scriptId, userId, {
          heartbeat: new Date().toISOString()
        });
      } else {
        clearInterval(heartbeat);
        this.activityTimers.delete(heartbeatKey);
      }
    }, this.HEARTBEAT_INTERVAL);

    this.activityTimers.set(heartbeatKey, heartbeat);
  }

  /**
   * Check if user is currently active
   */
  _isUserActive(presence) {
    if (!presence.last_activity) return false;
    
    const lastActivity = new Date(presence.last_activity);
    const now = new Date();
    const timeDiff = now - lastActivity;
    
    return timeDiff < this.IDLE_TIMEOUT;
  }

  /**
   * Calculate user status based on presence data
   */
  _calculateUserStatus(presence) {
    if (!presence.last_activity) return 'offline';
    
    const isActive = this._isUserActive(presence);
    if (!isActive) return 'idle';
    
    return presence.editing ? 'editing' : 'active';
  }

  /**
   * Generate a consistent color for a user
   */
  _generateUserColor(userId) {
    const colors = [
      '#ef4444', // red-500
      '#f97316', // orange-500
      '#eab308', // yellow-500
      '#22c55e', // green-500
      '#06b6d4', // cyan-500
      '#3b82f6', // blue-500
      '#8b5cf6', // violet-500
      '#d946ef', // fuchsia-500
      '#f43f5e', // rose-500
      '#84cc16', // lime-500
      '#14b8a6', // teal-500
      '#6366f1'  // indigo-500
    ];

    // Generate consistent hash for userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return colors[Math.abs(hash) % colors.length];
  }
}

// Export singleton instance
export const presenceManager = new PresenceManager();
export default presenceManager;