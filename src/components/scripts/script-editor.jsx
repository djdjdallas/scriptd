'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Save, 
  Clock, 
  User, 
  History, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AUTOSAVE_DELAY = 30000; // 30 seconds

export default function ScriptEditor({ 
  script, 
  onSave, 
  onVersionSave,
  onRevert,
  canEdit = true,
  className = ''
}) {
  const { toast } = useToast();
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
  
  const autoSaveTimeoutRef = useRef(null);
  const initialDataRef = useRef({
    title: script.title || '',
    content: script.content || '',
    hook: script.hook || '',
    description: script.description || '',
    tags: script.tags?.join(', ') || ''
  });

  // Calculate stats whenever content changes
  useEffect(() => {
    const totalText = `${title} ${content} ${hook} ${description}`;
    const characters = totalText.length;
    const words = totalText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const estimatedDuration = Math.max(1, Math.round(words / 150)); // 150 words per minute average speaking rate
    
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
        edit_count: (script.edit_count || 0) + 1,
        last_edited_by: script.user_id // This would come from auth context
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
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout
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
      {/* Editor Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-5 w-5 text-purple-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Script Editor</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {lastSaved && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                  </span>
                )}
                {script.last_edited_by && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Edited by {script.last_edited_by}
                  </span>
                )}
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
      </div>

      {/* Script Stats */}
      <div className="glass-card p-4">
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
      </div>

      {/* Editor Form */}
      <div className="glass-card p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Script Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter script title..."
              className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-purple-500/50"
              maxLength={200}
            />
          </div>

          {/* Hook */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Hook (Opening Line)
            </label>
            <Input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Enter your compelling opening hook..."
              className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-purple-500/50"
              maxLength={300}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Script Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your script content here..."
              className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-purple-500/50 min-h-[400px] font-mono resize-none scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
              rows={20}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this script..."
              className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-purple-500/50 resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tutorial, beginner, viral, trending..."
              className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-500 bg-gray-900/50 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-gray-300">Auto-save every 30s</span>
            </label>
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
      </div>
    </div>
  );
}