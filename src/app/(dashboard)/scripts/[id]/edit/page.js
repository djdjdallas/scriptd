'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import ScriptEditor from '@/components/scripts/script-editor';
import FourCardScriptEditor from '@/components/scripts/four-card-script-editor';
import EditHistory from '@/components/scripts/edit-history';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  Loader2, 
  Edit3, 
  History, 
  Save,
  AlertCircle,
  FileText,
  User,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ScriptEditPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [editorMode, setEditorMode] = useState('fourCard'); // 'fourCard' or 'classic'
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false,
    canShare: false
  });
  
  // Unwrap params Promise
  const resolvedParams = use(params);
  const scriptId = resolvedParams.id;

  useEffect(() => {
    fetchScript();
  }, [scriptId]);

  const fetchScript = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scripts/${scriptId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Script not found');
        } else if (response.status === 403) {
          throw new Error('You don\'t have permission to edit this script');
        } else {
          throw new Error('Failed to load script');
        }
      }
      
      const data = await response.json();
      setScript(data);
      
      // Check permissions (this would normally come from the API response)
      setPermissions({
        canEdit: true, // Assume user can edit if they can access the edit page
        canDelete: true,
        canShare: true
      });
      
    } catch (error) {
      console.error('Error fetching script:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load script",
        variant: "destructive"
      });
      
      // Redirect back to scripts page after a delay
      setTimeout(() => {
        router.push('/scripts');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedScript) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: updatedScript.title,
          content: updatedScript.content,
          hook: updatedScript.hook,
          description: updatedScript.description,
          tags: updatedScript.tags,
          metadata: {
            ...updatedScript.metadata,
            last_edited: new Date().toISOString(),
            edit_count: updatedScript.edit_count
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save script');
      }

      const savedScript = await response.json();
      setScript(savedScript);
      
    } catch (error) {
      console.error('Save error:', error);
      throw error; // Re-throw to let the editor handle the error display
    } finally {
      setSaving(false);
    }
  };

  const handleVersionSave = async (versionData) => {
    try {
      const response = await fetch(`/api/scripts/${scriptId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...versionData,
          is_manual_save: true,
          change_summary: 'Manual version save'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save version');
      }

      // Refresh the script to get updated version info
      await fetchScript();
      
    } catch (error) {
      console.error('Version save error:', error);
      throw error;
    }
  };

  const handleRevert = async (versionId) => {
    try {
      const response = await fetch(`/api/scripts/${scriptId}/revert/${versionId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revert to version');
      }

      const revertedScript = await response.json();
      setScript(revertedScript);
      
      // Switch to editor tab to show the reverted content
      setActiveTab('editor');
      
      toast({
        title: "Script Reverted",
        description: "Script has been reverted to the selected version",
        duration: 3000
      });
      
    } catch (error) {
      console.error('Revert error:', error);
      toast({
        title: "Revert Failed",
        description: error.message || "Failed to revert script",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -right-48 opacity-20" />
          <div className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -left-48 opacity-20" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        </div>
        <div className="glass-card p-12 max-w-md w-full text-center animate-reveal">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-purple-400 mx-auto relative" />
          </div>
          <h2 className="mt-6 text-xl font-semibold gradient-text">Loading Script Editor</h2>
          <p className="mt-2 text-gray-400">Preparing your workspace...</p>
          <div className="mt-6 flex justify-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="gradient-orb w-96 h-96 bg-red-600 -top-48 -right-48 opacity-10" />
          <div className="gradient-orb w-96 h-96 bg-orange-600 -bottom-48 -left-48 opacity-10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        </div>
        <div className="glass-card p-10 text-center max-w-md w-full animate-reveal">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <AlertCircle className="h-20 w-20 text-red-400 mx-auto relative" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Script Not Found</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            This script doesn't exist or you don't have permission to edit it.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/scripts">
              <Button className="glass-button bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Scripts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -right-48 opacity-20" />
        <div className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -left-48 opacity-20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-4 animate-reveal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href={`/scripts/${scriptId}`}>
                <Button className="glass-button group">
                  <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                    <Edit3 className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold gradient-text">Edit Script</h1>
                    <p className="text-gray-400 text-xs mt-1">
                      Make changes to your script and save them instantly
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">
                    {script.title || 'Untitled Script'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {script.updated_at && (
                      <Badge className="glass-button px-2 py-1 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Last saved {formatDistanceToNow(new Date(script.updated_at), { addSuffix: true })}
                      </Badge>
                    )}
                    {script.metadata?.words && (
                      <Badge className="glass-button px-2 py-1 text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {script.metadata.words.toLocaleString()} words • {Math.ceil(script.metadata.words / 150)} min
                      </Badge>
                    )}
                    {saving && (
                      <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30 px-2 py-1 text-xs animate-pulse">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Saving...
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/scripts">
                <Button className="glass-button bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30">
                  <FileText className="h-4 w-4 mr-2" />
                  All Scripts
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Permissions Notice */}
        {!permissions.canEdit && (
          <div className="glass-card p-6 animate-reveal border-l-4 border-yellow-500/50" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-yellow-300 font-semibold text-lg mb-1">View-Only Mode</h3>
                <p className="text-yellow-200/80 text-sm leading-relaxed">
                  You have read-only access to this script. Contact the owner to request edit permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Editor Tabs */}
        <div className="glass-card p-0 animate-reveal overflow-hidden" style={{ animationDelay: '0.05s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-white/5">
              <TabsList className="bg-transparent w-full h-auto p-0 flex gap-0">
                <TabsTrigger 
                  value="editor" 
                  className="relative bg-transparent text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-none px-6 py-4 transition-all duration-300 hover:text-gray-300"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  <span>Script Editor</span>
                  {activeTab === 'editor' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="relative bg-transparent text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-none px-6 py-4 transition-all duration-300 hover:text-gray-300"
                >
                  <History className="h-4 w-4 mr-2" />
                  <span>Edit History</span>
                  {activeTab === 'history' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="relative">
              <TabsContent value="editor" className="p-6 pt-4 mt-0 focus:outline-none">
                <div className="animate-reveal">
                  {/* Editor Mode Toggle */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {editorMode === 'fourCard' ? '4-Card System' : 'Classic Editor'}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={editorMode === 'fourCard' ? 'default' : 'ghost'}
                        onClick={() => setEditorMode('fourCard')}
                        className={editorMode === 'fourCard' ? 'glass-button bg-purple-500/20' : 'glass-button'}
                      >
                        4-Card System
                      </Button>
                      <Button
                        size="sm"
                        variant={editorMode === 'classic' ? 'default' : 'ghost'}
                        onClick={() => setEditorMode('classic')}
                        className={editorMode === 'classic' ? 'glass-button bg-purple-500/20' : 'glass-button'}
                      >
                        Classic
                      </Button>
                    </div>
                  </div>
                  
                  {/* Render appropriate editor based on mode */}
                  {editorMode === 'fourCard' ? (
                    <FourCardScriptEditor
                      script={script}
                      onSave={handleSave}
                      onVersionSave={handleVersionSave}
                      onRevert={handleRevert}
                      canEdit={permissions.canEdit}
                    />
                  ) : (
                    <ScriptEditor
                      script={script}
                      onSave={handleSave}
                      onVersionSave={handleVersionSave}
                      onRevert={handleRevert}
                      canEdit={permissions.canEdit}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="p-6 pt-4 mt-0 focus:outline-none">
                <div className="animate-reveal">
                  <EditHistory
                    scriptId={scriptId}
                    onRevert={handleRevert}
                    currentVersion={script}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Help Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card p-5 group hover:scale-[1.02] transition-transform">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Save className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Quick Save</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 bg-purple-500/20 rounded text-[10px] font-mono">Ctrl+S</kbd> or{' '}
                  <kbd className="px-1.5 py-0.5 bg-purple-500/20 rounded text-[10px] font-mono">Cmd+S</kbd> to save
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-5 group hover:scale-[1.02] transition-transform">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4 text-pink-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Auto-Save</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Changes save automatically every 30 seconds
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-5 group hover:scale-[1.02] transition-transform">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg group-hover:scale-110 transition-transform">
                <History className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Version Control</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Create restore points and track all changes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}