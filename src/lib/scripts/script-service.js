import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

/**
 * Script Service - Handles all script CRUD operations and versioning
 */
export class ScriptService {
  constructor(supabaseClient = null) {
    this.supabase = supabaseClient;
  }

  async getSupabase() {
    if (this.supabase) return this.supabase;
    
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      return createBrowserClient();
    } else {
      return await createClient();
    }
  }

  /**
   * Get a script by ID with user permission check
   */
  async getScript(scriptId, userId) {
    const supabase = await this.getSupabase();

    // Use LEFT JOIN to support scripts without channels
    const { data: script, error } = await supabase
      .from('scripts')
      .select(`
        *,
        channels(
          id,
          name,
          user_id
        )
      `)
      .eq('id', scriptId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Script not found or access denied');
      }
      throw new Error(`Failed to fetch script: ${error.message}`);
    }

    // Check permissions: user must own the script directly OR own the channel
    const hasAccess = script.user_id === userId || script.channels?.user_id === userId;

    if (!hasAccess) {
      throw new Error('Script not found or access denied');
    }

    return {
      ...script,
      channelName: script.channels?.name || 'No Channel',
      canEdit: hasAccess,
      canDelete: hasAccess,
      canShare: hasAccess
    };
  }

  /**
   * Update a script and create version history
   */
  async updateScript(scriptId, userId, updateData, options = {}) {
    const supabase = await this.getSupabase();
    const { createVersion = true, isAutoSave = false } = options;

    // First verify user has permission to edit
    const existingScript = await this.getScript(scriptId, userId);
    if (!existingScript.canEdit) {
      throw new Error('You do not have permission to edit this script');
    }

    // Create version history entry if requested
    if (createVersion) {
      await this.createScriptVersion(scriptId, existingScript, {
        isAutoSave,
        changeSummary: this.generateChangeSummary(existingScript, updateData)
      });
    }

    // Update the script
    const { data: updatedScript, error } = await supabase
      .from('scripts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        edit_count: (existingScript.edit_count || 0) + 1,
        last_edited_by: userId
      })
      .eq('id', scriptId)
      .select(`
        *,
        channels(
          id,
          name,
          user_id
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update script: ${error.message}`);
    }

    return {
      ...updatedScript,
      channelName: updatedScript.channels?.name
    };
  }

  /**
   * Create a new version entry in script history
   */
  async createScriptVersion(scriptId, scriptData, options = {}) {
    const supabase = await this.getSupabase();
    const { isAutoSave = false, changeSummary = null } = options;

    const versionData = {
      script_id: scriptId,
      title: scriptData.title,
      content: scriptData.content,
      hook: scriptData.hook,
      description: scriptData.description,
      tags: scriptData.tags,
      metadata: scriptData.metadata,
      version_number: await this.getNextVersionNumber(scriptId),
      is_auto_save: isAutoSave,
      is_manual_save: !isAutoSave,
      change_summary: changeSummary,
      created_by: scriptData.last_edited_by || scriptData.channels?.user_id,
      created_at: new Date().toISOString()
    };

    const { data: version, error } = await supabase
      .from('script_versions')
      .insert(versionData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create script version:', error);
      // Don't throw here as this is secondary to the main update
    }

    return version;
  }

  /**
   * Get script version history
   */
  async getScriptVersions(scriptId, userId, limit = 50) {
    const supabase = await this.getSupabase();

    // Verify user has access to this script
    await this.getScript(scriptId, userId);

    const { data: versions, error } = await supabase
      .from('script_versions')
      .select('*')
      .eq('script_id', scriptId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch script versions: ${error.message}`);
    }

    return { versions: versions || [] };
  }

  /**
   * Revert script to a previous version
   */
  async revertToVersion(scriptId, versionId, userId) {
    const supabase = await this.getSupabase();

    // Get the version to revert to
    const { data: version, error: versionError } = await supabase
      .from('script_versions')
      .select('*')
      .eq('id', versionId)
      .eq('script_id', scriptId)
      .single();

    if (versionError) {
      throw new Error(`Version not found: ${versionError.message}`);
    }

    // Update the script with the version data
    const revertData = {
      title: version.title,
      content: version.content,
      hook: version.hook,
      description: version.description,
      tags: version.tags,
      metadata: version.metadata
    };

    return await this.updateScript(scriptId, userId, revertData, {
      createVersion: true,
      isAutoSave: false
    });
  }

  /**
   * Delete a script and all its versions
   */
  async deleteScript(scriptId, userId) {
    const supabase = await this.getSupabase();

    // Verify user has permission to delete
    const script = await this.getScript(scriptId, userId);
    if (!script.canDelete) {
      throw new Error('You do not have permission to delete this script');
    }

    // Delete all versions first (if foreign key constraints require it)
    const { error: versionsError } = await supabase
      .from('script_versions')
      .delete()
      .eq('script_id', scriptId);

    if (versionsError) {
      console.warn('Failed to delete script versions:', versionsError);
      // Continue with script deletion even if versions deletion fails
    }

    // Delete the script
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', scriptId);

    if (error) {
      throw new Error(`Failed to delete script: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Create a new manual script version (save as version)
   */
  async saveAsVersion(scriptId, userId, versionData, changeSummary = null) {
    const supabase = await this.getSupabase();

    // Verify user has permission
    const script = await this.getScript(scriptId, userId);
    if (!script.canEdit) {
      throw new Error('You do not have permission to create versions for this script');
    }

    // Create the version
    const version = await this.createScriptVersion(scriptId, {
      ...script,
      ...versionData
    }, {
      isAutoSave: false,
      changeSummary: changeSummary || 'Manual version save'
    });

    return version;
  }

  /**
   * Get sharing information for a script
   */
  async getScriptShareInfo(scriptId, userId) {
    const script = await this.getScript(scriptId, userId);
    
    return {
      id: script.id,
      title: script.title,
      canShare: script.canShare,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/scripts/${scriptId}`,
      embedCode: `<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/scripts/${scriptId}/embed" width="100%" height="600"></iframe>`
    };
  }

  /**
   * Helper: Get next version number for a script
   */
  async getNextVersionNumber(scriptId) {
    const supabase = await this.getSupabase();

    const { data: lastVersion } = await supabase
      .from('script_versions')
      .select('version_number')
      .eq('script_id', scriptId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    return (lastVersion?.version_number || 0) + 1;
  }

  /**
   * Helper: Generate a change summary by comparing old and new data
   */
  generateChangeSummary(oldData, newData) {
    const changes = [];

    if (oldData.title !== newData.title) {
      changes.push('title updated');
    }
    
    if (oldData.content !== newData.content) {
      const oldWordCount = oldData.content?.split(/\s+/).length || 0;
      const newWordCount = newData.content?.split(/\s+/).length || 0;
      const wordDiff = newWordCount - oldWordCount;
      
      if (wordDiff > 0) {
        changes.push(`added ${wordDiff} words`);
      } else if (wordDiff < 0) {
        changes.push(`removed ${Math.abs(wordDiff)} words`);
      } else {
        changes.push('content modified');
      }
    }

    if (oldData.hook !== newData.hook) {
      changes.push('hook updated');
    }

    if (oldData.description !== newData.description) {
      changes.push('description updated');
    }

    if (JSON.stringify(oldData.tags) !== JSON.stringify(newData.tags)) {
      changes.push('tags updated');
    }

    return changes.length > 0 ? changes.join(', ') : 'minor changes';
  }

  /**
   * Helper: Clean up old auto-save versions to prevent bloat
   */
  async cleanupOldAutoSaves(scriptId, keepCount = 10) {
    const supabase = await this.getSupabase();

    const { data: autoSaves } = await supabase
      .from('script_versions')
      .select('id')
      .eq('script_id', scriptId)
      .eq('is_auto_save', true)
      .order('created_at', { ascending: false })
      .range(keepCount, 1000); // Get versions beyond keepCount

    if (autoSaves && autoSaves.length > 0) {
      const idsToDelete = autoSaves.map(v => v.id);
      
      await supabase
        .from('script_versions')
        .delete()
        .in('id', idsToDelete);
    }
  }

  /**
   * Get script statistics
   */
  async getScriptStats(scriptId, userId) {
    const script = await this.getScript(scriptId, userId);
    const { versions } = await this.getScriptVersions(scriptId, userId);

    const content = script.content || '';
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const characters = content.length;
    const estimatedDuration = Math.max(1, Math.round(words / 150)); // 150 WPM average

    return {
      characters,
      words,
      estimatedDuration,
      versionCount: versions.length,
      editCount: script.edit_count || 0,
      lastEdited: script.updated_at,
      createdAt: script.created_at
    };
  }
}

// Export a default instance for convenience
export const scriptService = new ScriptService();

// Export individual functions for direct use
export async function getScript(scriptId, userId) {
  return scriptService.getScript(scriptId, userId);
}

export async function updateScript(scriptId, userId, updateData, options) {
  return scriptService.updateScript(scriptId, userId, updateData, options);
}

export async function getScriptVersions(scriptId, userId, limit) {
  return scriptService.getScriptVersions(scriptId, userId, limit);
}

export async function revertToVersion(scriptId, versionId, userId) {
  return scriptService.revertToVersion(scriptId, versionId, userId);
}

export async function deleteScript(scriptId, userId) {
  return scriptService.deleteScript(scriptId, userId);
}

export async function saveAsVersion(scriptId, userId, versionData, changeSummary) {
  return scriptService.saveAsVersion(scriptId, userId, versionData, changeSummary);
}