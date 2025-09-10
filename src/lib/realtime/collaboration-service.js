import { createClient } from '@/lib/supabase/client';

class CollaborationService {
  constructor() {
    this.supabase = createClient();
    this.channels = new Map();
    this.subscribers = new Map();
    this.operationalTransforms = new Map();
  }

  /**
   * Join a collaborative session for a script
   */
  async joinSession(scriptId, userId, userProfile = {}) {
    const channelName = `script_${scriptId}_collaboration`;
    
    // Check if already connected to this channel
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = this.supabase.channel(channelName, {
      config: {
        presence: { key: userId }
      }
    });

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        this._handlePresenceSync(scriptId, presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this._handlePresenceJoin(scriptId, key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this._handlePresenceLeave(scriptId, key, leftPresences);
      })
      // Handle collaborative edits
      .on('broadcast', { event: 'content_change' }, (payload) => {
        this._handleContentChange(scriptId, payload);
      })
      .on('broadcast', { event: 'cursor_move' }, (payload) => {
        this._handleCursorMove(scriptId, payload);
      })
      .on('broadcast', { event: 'selection_change' }, (payload) => {
        this._handleSelectionChange(scriptId, payload);
      })
      .on('broadcast', { event: 'conflict_resolution' }, (payload) => {
        this._handleConflictResolution(scriptId, payload);
      });

    // Subscribe to the channel
    const status = await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Send initial presence
        await channel.track({
          user_id: userId,
          profile: userProfile,
          joined_at: new Date().toISOString(),
          active: true,
          editing: null,
          cursor_position: null,
          selection: null
        });
      }
    });

    if (status !== 'SUBSCRIBED') {
      throw new Error('Failed to join collaboration session');
    }

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Leave a collaborative session
   */
  async leaveSession(scriptId) {
    const channelName = `script_${scriptId}_collaboration`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
      this.subscribers.delete(scriptId);
      this.operationalTransforms.delete(scriptId);
    }
  }

  /**
   * Broadcast content changes to other collaborators
   */
  async broadcastContentChange(scriptId, change) {
    const channelName = `script_${scriptId}_collaboration`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      // Add operational transform data
      const transformedChange = {
        ...change,
        timestamp: Date.now(),
        transform_id: this._generateTransformId(),
        base_version: change.baseVersion || 0
      };

      await channel.send({
        type: 'broadcast',
        event: 'content_change',
        payload: transformedChange
      });

      // Store for conflict resolution
      this._storeOperation(scriptId, transformedChange);
    }
  }

  /**
   * Broadcast cursor movement
   */
  async broadcastCursorMove(scriptId, cursorData) {
    const channelName = `script_${scriptId}_collaboration`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: {
          ...cursorData,
          timestamp: Date.now()
        }
      });

      // Update presence
      await channel.track({
        cursor_position: cursorData.position,
        selection: cursorData.selection
      });
    }
  }

  /**
   * Broadcast text selection changes
   */
  async broadcastSelectionChange(scriptId, selectionData) {
    const channelName = `script_${scriptId}_collaboration`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'selection_change',
        payload: {
          ...selectionData,
          timestamp: Date.now()
        }
      });
    }
  }

  /**
   * Update user's editing status
   */
  async updateEditingStatus(scriptId, field, isEditing = true) {
    const channelName = `script_${scriptId}_collaboration`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await channel.track({
        editing: isEditing ? field : null,
        active: true,
        last_activity: new Date().toISOString()
      });
    }
  }

  /**
   * Subscribe to collaboration events
   */
  subscribe(scriptId, eventType, callback) {
    if (!this.subscribers.has(scriptId)) {
      this.subscribers.set(scriptId, new Map());
    }
    
    const scriptSubscribers = this.subscribers.get(scriptId);
    if (!scriptSubscribers.has(eventType)) {
      scriptSubscribers.set(eventType, new Set());
    }
    
    scriptSubscribers.get(eventType).add(callback);
    
    // Return unsubscribe function
    return () => {
      scriptSubscribers.get(eventType).delete(callback);
    };
  }

  /**
   * Apply operational transformation for conflict resolution
   */
  _applyOperationalTransform(operation1, operation2) {
    // Simple operational transform for text operations
    // In a production environment, you'd use a more sophisticated OT library
    
    if (operation1.type === 'insert' && operation2.type === 'insert') {
      if (operation1.position <= operation2.position) {
        return {
          ...operation2,
          position: operation2.position + operation1.text.length
        };
      }
    } else if (operation1.type === 'delete' && operation2.type === 'insert') {
      if (operation1.position < operation2.position) {
        return {
          ...operation2,
          position: operation2.position - operation1.length
        };
      }
    } else if (operation1.type === 'insert' && operation2.type === 'delete') {
      if (operation1.position <= operation2.position) {
        return {
          ...operation2,
          position: operation2.position + operation1.text.length
        };
      }
    } else if (operation1.type === 'delete' && operation2.type === 'delete') {
      if (operation1.position < operation2.position) {
        return {
          ...operation2,
          position: operation2.position - operation1.length
        };
      }
    }
    
    return operation2;
  }

  /**
   * Handle presence sync events
   */
  _handlePresenceSync(scriptId, presenceState) {
    const subscribers = this.subscribers.get(scriptId);
    if (subscribers && subscribers.has('presence_sync')) {
      subscribers.get('presence_sync').forEach(callback => {
        callback(presenceState);
      });
    }
  }

  /**
   * Handle user join events
   */
  _handlePresenceJoin(scriptId, key, newPresences) {
    const subscribers = this.subscribers.get(scriptId);
    if (subscribers && subscribers.has('user_join')) {
      subscribers.get('user_join').forEach(callback => {
        callback({ userId: key, presences: newPresences });
      });
    }
  }

  /**
   * Handle user leave events
   */
  _handlePresenceLeave(scriptId, key, leftPresences) {
    const subscribers = this.subscribers.get(scriptId);
    if (subscribers && subscribers.has('user_leave')) {
      subscribers.get('user_leave').forEach(callback => {
        callback({ userId: key, presences: leftPresences });
      });
    }
  }

  /**
   * Handle content change events
   */
  _handleContentChange(scriptId, payload) {
    // Apply operational transform if needed
    const transformedPayload = this._resolveConflicts(scriptId, payload);
    
    const subscribers = this.subscribers.get(scriptId);
    if (subscribers && subscribers.has('content_change')) {
      subscribers.get('content_change').forEach(callback => {
        callback(transformedPayload);
      });
    }
  }

  /**
   * Handle cursor movement events
   */
  _handleCursorMove(scriptId, payload) {
    const subscribers = this.subscribers.get(scriptId);
    if (subscribers && subscribers.has('cursor_move')) {
      subscribers.get('cursor_move').forEach(callback => {
        callback(payload);
      });
    }
  }

  /**
   * Handle selection change events
   */
  _handleSelectionChange(scriptId, payload) {
    const subscribers = this.subscribers.get(scriptId);
    if (subscribers && subscribers.has('selection_change')) {
      subscribers.get('selection_change').forEach(callback => {
        callback(payload);
      });
    }
  }

  /**
   * Handle conflict resolution
   */
  _handleConflictResolution(scriptId, payload) {
    const subscribers = this.subscribers.get(scriptId);
    if (subscribers && subscribers.has('conflict_resolved')) {
      subscribers.get('conflict_resolved').forEach(callback => {
        callback(payload);
      });
    }
  }

  /**
   * Resolve conflicts using operational transforms
   */
  _resolveConflicts(scriptId, newOperation) {
    const operations = this.operationalTransforms.get(scriptId) || [];
    let transformedOperation = { ...newOperation };

    // Apply operational transforms against concurrent operations
    for (const operation of operations) {
      if (operation.timestamp < newOperation.timestamp && 
          operation.transform_id !== newOperation.transform_id) {
        transformedOperation = this._applyOperationalTransform(
          operation, 
          transformedOperation
        );
      }
    }

    return transformedOperation;
  }

  /**
   * Store operation for conflict resolution
   */
  _storeOperation(scriptId, operation) {
    if (!this.operationalTransforms.has(scriptId)) {
      this.operationalTransforms.set(scriptId, []);
    }

    const operations = this.operationalTransforms.get(scriptId);
    operations.push(operation);

    // Keep only recent operations (last 100)
    if (operations.length > 100) {
      operations.splice(0, operations.length - 100);
    }
  }

  /**
   * Generate unique transform ID
   */
  _generateTransformId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    for (const [channelName, channel] of this.channels) {
      await channel.unsubscribe();
    }
    
    this.channels.clear();
    this.subscribers.clear();
    this.operationalTransforms.clear();
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
export default collaborationService;