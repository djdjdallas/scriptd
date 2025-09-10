'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCollaboration } from '@/hooks/useCollaboration';
import { usePresence } from '@/hooks/usePresence';
import CollaborationPresence from './collaboration-presence';
import LiveCursor from './live-cursor';
import { 
  Save, 
  Clock, 
  Users, 
  History, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  WifiOff,
  Wifi,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AUTOSAVE_DELAY = 30000; // 30 seconds
const TYPING_DEBOUNCE = 300; // 300ms

export default function CollaborativeScriptEditor({ 
  script, 
  onSave, 
  onVersionSave,
  onRevert,
  canEdit = true,
  className = ''
}) {
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState(script.title || '');
  const [content, setContent] = useState(script.content || '');
  const [hook, setHook] = useState(script.hook || '');
  const [description, setDescription] = useState(script.description || '');
  const [tags, setTags] = useState(script.tags?.join(', ') || '');
  
  // Editor state
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(script.updated_at ? new Date(script.updated_at) : null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveError, setSaveError] = useState(null);
  
  // Character and timing calculations
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    estimatedDuration: 0
  });
  
  // Collaboration hooks
  const collaboration = useCollaboration(script.id, {
    onContentChange: handleRemoteContentChange,
    onConflictResolved: handleConflictResolved,
    autoResolveConflicts: true
  });

  const presence = usePresence(script.id, {
    trackCursor: true,
    trackTyping: true,
    typingTimeout: 3000
  });

  // Refs
  const autoSaveTimeoutRef = useRef(null);
  const typingTimeouts = useRef(new Map());
  const textAreaRefs = useRef(new Map());
  const initialDataRef = useRef({
    title: script.title || '',
    content: script.content || '',
    hook: script.hook || '',
    description: script.description || '',
    tags: script.tags?.join(', ') || ''
  });

  /**
   * Handle remote content changes from collaborators
   */
  function handleRemoteContentChange(change) {
    try {
      switch (change.field) {
        case 'title':
          setTitle(change.value);
          break;
        case 'content':
          setContent(change.value);
          break;
        case 'hook':
          setHook(change.value);
          break;
        case 'description':
          setDescription(change.value);
          break;
        case 'tags':
          setTags(change.value);
          break;
      }

      // Update initial data to prevent unsaved changes flag
      initialDataRef.current[change.field] = change.value;
    } catch (error) {
      console.error('Error applying remote change:', error);
    }
  }

  /**
   * Handle conflict resolution
   */
  function handleConflictResolved(resolution) {
    toast({
      title: "Conflict Resolved",
      description: `Changes to ${resolution.field} have been automatically merged`,
      duration: 3000
    });
  }

  /**
   * Broadcast local changes to collaborators
   */
  const broadcastChange = useCallback(async (field, value, operation = 'update') => {
    if (!collaboration.isConnected) return;

    try {
      await collaboration.broadcastChange({
        field,
        value,
        operation,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to broadcast change:', error);
    }
  }, [collaboration]);

  /**
   * Handle input changes with collaboration
   */
  const handleInputChange = useCallback(async (field, value, element = null) => {
    // Update local state first
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'content':
        setContent(value);
        break;
      case 'hook':
        setHook(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'tags':
        setTags(value);
        break;
    }

    // Track cursor position if element provided
    if (element && presence.isInitialized) {
      const cursorPosition = element.selectionStart;
      const selection = element.selectionStart !== element.selectionEnd ? {
        start: element.selectionStart,
        end: element.selectionEnd
      } : null;
      
      await presence.updateCursor(cursorPosition, selection, field);
    }

    // Set typing indicator
    if (presence.isInitialized) {
      await presence.setTyping(field, true);
      
      // Clear existing timeout
      if (typingTimeouts.current.has(field)) {
        clearTimeout(typingTimeouts.current.get(field));
      }
      
      // Set timeout to stop typing
      const timeout = setTimeout(async () => {
        await presence.stopTyping(field);
        typingTimeouts.current.delete(field);
      }, TYPING_DEBOUNCE);
      
      typingTimeouts.current.set(field, timeout);
    }

    // Broadcast change with debouncing
    const debounceKey = `${field}_broadcast`;
    clearTimeout(window[debounceKey]);
    window[debounceKey] = setTimeout(() => {
      broadcastChange(field, value);
    }, 500);
    
  }, [broadcastChange, presence]);

  /**
   * Handle focus events
   */
  const handleFocus = useCallback(async (field) => {
    if (presence.isInitialized) {
      await presence.setEditing(field, true);
    }
  }, [presence]);

  /**
   * Handle blur events  
   */
  const handleBlur = useCallback(async (field) => {
    if (presence.isInitialized) {
      await presence.setEditing(field, false);
      await presence.stopTyping(field);
    }
  }, [presence]);

  // Calculate stats whenever content changes
  useEffect(() => {
    const totalText = `${title} ${content} ${hook} ${description}`;
    const characters = totalText.length;
    const words = totalText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const estimatedDuration = Math.max(1, Math.round(words / 150)); // 150 words per minute
    
    setStats({ characters, words, estimatedDuration });
  }, [title, content, hook, description]);

  // Track unsaved changes
  useEffect(() => {
    const currentData = { title, content, hook, description, tags };
    const hasChanges = Object.keys(currentData).some(
      key => currentData[key] !== initialDataRef.current[key]
    );
    setHasUnsavedChanges(hasChanges);
  }, [title, content, hook, description, tags]);

  // Auto-save functionality
  const performSave = useCallback(async (isAutoSave = false) => {
    if (!canEdit || saving) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      const updatedScript = {
        ...script,
        title: title.trim(),
        content: content.trim(),
        hook: hook.trim(),
        description: description.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
        edit_count: (script.edit_count || 0) + 1
      };
      
      await onSave(updatedScript);
      
      setLastSaved(new Date());
      initialDataRef.current = { title, content, hook, description, tags };
      setHasUnsavedChanges(false);
      
      if (!isAutoSave) {
        toast({
          title: "Script Saved",
          description: "Your changes have been saved successfully.",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(error.message);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [canEdit, saving, script, title, content, hook, description, tags, onSave, toast]);

  // Auto-save timer
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !canEdit) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave(true);
    }, AUTOSAVE_DELAY);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSaveEnabled, hasUnsavedChanges, canEdit, performSave]);

  // Manual save
  const handleSave = () => {
    performSave(false);
  };

  // Save as new version
  const handleSaveVersion = async () => {
    if (!canEdit || saving) return;
    
    try {
      setSaving(true);
      const versionData = {
        title: title.trim(),
        content: content.trim(),
        hook: hook.trim(),
        description: description.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      await onVersionSave(versionData);
      
      toast({
        title: "Version Saved",
        description: "A new version of your script has been created.",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Version Save Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            if (e.shiftKey && onRevert) {
              e.preventDefault();
              onRevert();
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, onRevert]);

  if (!canEdit) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Read Only</h3>
          <p className="text-gray-400">You don't have permission to edit this script.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Collaboration Status Bar */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-5 w-5 text-purple-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Collaborative Script Editor</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {lastSaved && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {presence.totalUsers} collaborator{presence.totalUsers !== 1 ? 's' : ''}
                </span>
                {script.edit_count > 0 && (
                  <span className="flex items-center gap-1">
                    <History className="h-3 w-3" />
                    {script.edit_count} edit{script.edit_count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            {collaboration.networkStatus === 'offline' ? (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/50">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            ) : collaboration.isConnected ? (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
                {collaboration.syncLatency && (
                  <span className="ml-1">({collaboration.syncLatency}ms)</span>
                )}
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Connecting...
              </Badge>
            )}

            {/* Save Status */}
            {hasUnsavedChanges && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                Unsaved changes
              </Badge>
            )}
            
            {saving && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Saving...
              </Badge>
            )}
            
            {!hasUnsavedChanges && lastSaved && !saving && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}

            {/* Conflicts */}
            {collaboration.hasConflicts && (
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Conflicts
              </Badge>
            )}
            
            {saveError && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/50">
                <AlertCircle className="h-3 w-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </div>
        
        {saveError && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-300 text-sm">{saveError}</p>
          </div>
        )}
      </Card>

      {/* Active Collaborators */}
      <CollaborationPresence 
        users={presence.presenceUsers}
        activeEditors={presence.activeEditors}
        typingUsers={presence.typingUsers}
        className="mb-4"
      />

      {/* Script Stats */}
      <Card className="glass-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold gradient-text">{stats.characters}</div>
            <p className="text-sm text-gray-400">Characters</p>
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text">{stats.words}</div>
            <p className="text-sm text-gray-400">Words</p>
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text">{stats.estimatedDuration}</div>
            <p className="text-sm text-gray-400">Min Duration</p>
          </div>
        </div>
      </Card>

      {/* Editor Form */}
      <Card className="glass-card p-6 relative">
        <LiveCursor cursors={presence.cursors} />
        
        <div className="space-y-6">
          {/* Title */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Script Title
              {presence.getFieldPresence('title').hasActivity && (
                <span className="ml-2 text-xs text-blue-400">
                  {presence.getTypingText('title')}
                </span>
              )}
            </label>
            <Input
              ref={(el) => textAreaRefs.current.set('title', el)}
              value={title}
              onChange={(e) => handleInputChange('title', e.target.value, e.target)}
              onFocus={() => handleFocus('title')}
              onBlur={() => handleBlur('title')}
              placeholder="Enter script title..."
              className={`glass-input text-white ${
                presence.getFieldEditors('title').length > 0 ? 'ring-2 ring-blue-400/50' : ''
              }`}
              maxLength={200}
              disabled={!presence.canEditField('title')}
            />
          </div>

          {/* Hook */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Hook (Opening Line)
              {presence.getFieldPresence('hook').hasActivity && (
                <span className="ml-2 text-xs text-blue-400">
                  {presence.getTypingText('hook')}
                </span>
              )}
            </label>
            <Input
              ref={(el) => textAreaRefs.current.set('hook', el)}
              value={hook}
              onChange={(e) => handleInputChange('hook', e.target.value, e.target)}
              onFocus={() => handleFocus('hook')}
              onBlur={() => handleBlur('hook')}
              placeholder="Enter your compelling opening hook..."
              className={`glass-input text-white ${
                presence.getFieldEditors('hook').length > 0 ? 'ring-2 ring-blue-400/50' : ''
              }`}
              maxLength={300}
              disabled={!presence.canEditField('hook')}
            />
          </div>

          {/* Content */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Script Content
              {presence.getFieldPresence('content').hasActivity && (
                <span className="ml-2 text-xs text-blue-400">
                  {presence.getTypingText('content')}
                </span>
              )}
            </label>
            <Textarea
              ref={(el) => textAreaRefs.current.set('content', el)}
              value={content}
              onChange={(e) => handleInputChange('content', e.target.value, e.target)}
              onFocus={() => handleFocus('content')}
              onBlur={() => handleBlur('content')}
              placeholder="Write your script content here..."
              className={`glass-input text-white min-h-[400px] font-mono ${
                presence.getFieldEditors('content').length > 0 ? 'ring-2 ring-blue-400/50' : ''
              }`}
              rows={20}
              disabled={!presence.canEditField('content')}
            />
          </div>

          {/* Description */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
              {presence.getFieldPresence('description').hasActivity && (
                <span className="ml-2 text-xs text-blue-400">
                  {presence.getTypingText('description')}
                </span>
              )}
            </label>
            <Textarea
              ref={(el) => textAreaRefs.current.set('description', el)}
              value={description}
              onChange={(e) => handleInputChange('description', e.target.value, e.target)}
              onFocus={() => handleFocus('description')}
              onBlur={() => handleBlur('description')}
              placeholder="Add a description for this script..."
              className={`glass-input text-white ${
                presence.getFieldEditors('description').length > 0 ? 'ring-2 ring-blue-400/50' : ''
              }`}
              rows={3}
              maxLength={500}
              disabled={!presence.canEditField('description')}
            />
          </div>

          {/* Tags */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tags (comma-separated)
              {presence.getFieldPresence('tags').hasActivity && (
                <span className="ml-2 text-xs text-blue-400">
                  {presence.getTypingText('tags')}
                </span>
              )}
            </label>
            <Input
              ref={(el) => textAreaRefs.current.set('tags', el)}
              value={tags}
              onChange={(e) => handleInputChange('tags', e.target.value, e.target)}
              onFocus={() => handleFocus('tags')}
              onBlur={() => handleBlur('tags')}
              placeholder="tutorial, beginner, viral, trending..."
              className={`glass-input text-white ${
                presence.getFieldEditors('tags').length > 0 ? 'ring-2 ring-blue-400/50' : ''
              }`}
              disabled={!presence.canEditField('tags')}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="text-purple-500 rounded"
              />
              Auto-save every 30s
            </label>
            
            {!collaboration.isConnected && (
              <Button
                onClick={collaboration.reconnect}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                Reconnect
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {onRevert && (
              <Button
                onClick={onRevert}
                variant="outline"
                className="glass-button"
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Revert Changes
              </Button>
            )}
            
            {onVersionSave && (
              <Button
                onClick={handleSaveVersion}
                variant="outline"
                className="glass-button"
                disabled={saving || !hasUnsavedChanges}
              >
                <History className="h-4 w-4 mr-2" />
                Save as Version
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50"
              disabled={saving || !hasUnsavedChanges}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Script
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}