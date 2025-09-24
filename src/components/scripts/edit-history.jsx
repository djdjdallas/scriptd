'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  History, 
  User, 
  Clock, 
  RotateCcw, 
  Eye, 
  GitBranch,
  FileText,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function EditHistory({ 
  scriptId, 
  onRevert,
  currentVersion,
  className = '' 
}) {
  const { toast } = useToast();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [reverting, setReverting] = useState(null);
  const [diffView, setDiffView] = useState(null);
  const [revertModal, setRevertModal] = useState({ isOpen: false, version: null });

  useEffect(() => {
    fetchVersionHistory();
  }, [scriptId]);

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scripts/${scriptId}/history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }
      
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error fetching version history:', error);
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevertClick = (version) => {
    setRevertModal({ isOpen: true, version });
  };

  const handleRevert = async () => {
    const versionId = revertModal.version.id;
    setReverting(versionId);
    
    try {
      if (onRevert) {
        await onRevert(versionId);
      } else {
        const response = await fetch(`/api/scripts/${scriptId}/revert/${versionId}`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error('Failed to revert to version');
        }
      }

      toast({
        title: "Reverted Successfully",
        description: "Script has been reverted to the selected version",
        duration: 3000
      });

      // Refresh version history
      fetchVersionHistory();
    } catch (error) {
      toast({
        title: "Revert Failed",
        description: error.message || "Failed to revert to version",
        variant: "destructive"
      });
    } finally {
      setReverting(null);
      setRevertModal({ isOpen: false, version: null });
    }
  };

  const toggleExpanded = (versionId) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const generateDiff = (oldContent, newContent) => {
    // Simple word-level diff generator
    const oldWords = oldContent.split(/(\s+)/);
    const newWords = newContent.split(/(\s+)/);
    
    const diff = [];
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldWords.length || newIndex < newWords.length) {
      const oldWord = oldWords[oldIndex];
      const newWord = newWords[newIndex];
      
      if (oldWord === newWord) {
        diff.push({ type: 'unchanged', text: oldWord });
        oldIndex++;
        newIndex++;
      } else if (oldIndex >= oldWords.length) {
        diff.push({ type: 'added', text: newWord });
        newIndex++;
      } else if (newIndex >= newWords.length) {
        diff.push({ type: 'removed', text: oldWord });
        oldIndex++;
      } else {
        // Find the next matching word
        let found = false;
        for (let i = newIndex + 1; i < Math.min(newWords.length, newIndex + 10); i++) {
          if (newWords[i] === oldWord) {
            // Add new words up to the match
            for (let j = newIndex; j < i; j++) {
              diff.push({ type: 'added', text: newWords[j] });
            }
            diff.push({ type: 'unchanged', text: oldWord });
            oldIndex++;
            newIndex = i + 1;
            found = true;
            break;
          }
        }
        
        if (!found) {
          diff.push({ type: 'removed', text: oldWord });
          oldIndex++;
        }
      }
    }
    
    return diff;
  };

  const showDiff = (version, previousVersion) => {
    if (!previousVersion) return;
    
    const diff = generateDiff(previousVersion.content, version.content);
    setDiffView({ version, previousVersion, diff });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <History className="h-12 w-12 text-gray-500 mb-4" />
        <p className="text-gray-400 text-center">
          This script doesn't have any saved versions yet. Start editing to create version history.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="glass-card">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Version History</h2>
                <p className="text-gray-400 text-sm">{versions.length} version{versions.length !== 1 ? 's' : ''} available</p>
              </div>
            </div>
            <Button 
              onClick={fetchVersionHistory} 
              className="glass-button"
              size="sm"
            >
              <History className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {versions.map((version, index) => {
              const isExpanded = expandedVersions.has(version.id);
              const isCurrent = version.id === currentVersion?.id;
              const previousVersion = versions[index + 1];

              return (
                <Card key={version.id} className={`glass-card ${isCurrent ? 'ring-2 ring-purple-500/50' : ''}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Button
                          onClick={() => toggleExpanded(version.id)}
                          className="glass-button p-1 h-6 w-6 mt-1"
                          size="sm"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GitBranch className="h-4 w-4 text-purple-400" />
                            <span className="text-white font-semibold">
                              Version {versions.length - index}
                            </span>
                            {isCurrent && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/50 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Current
                              </Badge>
                            )}
                            {version.is_manual_save && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 text-xs">
                                Manual Save
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {version.edited_by || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>

                          {version.change_summary && (
                            <p className="text-gray-300 text-sm mt-2">
                              {version.change_summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="glass-button"
                              size="sm"
                              onClick={() => setSelectedVersion(version)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Version {versions.length - index} - {version.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-sm text-gray-400">
                                Created {format(new Date(version.created_at), 'MMMM d, yyyy h:mm a')}
                                {version.edited_by && ` by ${version.edited_by}`}
                              </div>
                              <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/20 p-4 rounded-md">
                                  {version.content}
                                </pre>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {previousVersion && (
                          <Button 
                            onClick={() => showDiff(version, previousVersion)}
                            className="glass-button"
                            size="sm"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Diff
                          </Button>
                        )}

                        {!isCurrent && (
                          <Button 
                            onClick={() => handleRevertClick(version)}
                            className="glass-button hover:bg-yellow-500/20"
                            size="sm"
                            disabled={reverting === version.id}
                          >
                            {reverting === version.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4 mr-2" />
                            )}
                            Revert
                          </Button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <Tabs defaultValue="preview" className="w-full">
                          <TabsList className="glass-card">
                            <TabsTrigger value="preview" className="text-white">Preview</TabsTrigger>
                            <TabsTrigger value="raw" className="text-white">Raw Content</TabsTrigger>
                            <TabsTrigger value="metadata" className="text-white">Metadata</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="preview" className="mt-4">
                            <div className="glass-card p-4 max-h-60 overflow-y-auto">
                              <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-gray-300 whitespace-pre-wrap line-clamp-10">
                                  {version.content}
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="raw" className="mt-4">
                            <div className="glass-card p-4 max-h-60 overflow-y-auto">
                              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                                {version.content}
                              </pre>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="metadata" className="mt-4">
                            <div className="glass-card p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Title:</span>
                                  <span className="text-white ml-2">{version.title}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Length:</span>
                                  <span className="text-white ml-2">{version.content?.length || 0} characters</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Word Count:</span>
                                  <span className="text-white ml-2">
                                    {version.content?.split(/\s+/).filter(word => word.length > 0).length || 0} words
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Est. Duration:</span>
                                  <span className="text-white ml-2">
                                    {Math.max(1, Math.round((version.content?.split(/\s+/).filter(word => word.length > 0).length || 0) / 150))} min
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Diff Dialog */}
      {diffView && (
        <Dialog open={!!diffView} onOpenChange={() => setDiffView(null)}>
          <DialogContent className="glass-card max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                Comparing Version {versions.findIndex(v => v.id === diffView.previousVersion.id) + 1} → 
                Version {versions.findIndex(v => v.id === diffView.version.id) + 1}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-400">
                Changes from {format(new Date(diffView.previousVersion.created_at), 'MMM d h:mm a')} to{' '}
                {format(new Date(diffView.version.created_at), 'MMM d h:mm a')}
              </div>
              <div className="prose prose-invert max-w-none">
                <div className="bg-black/20 p-4 rounded-md font-mono text-sm">
                  {diffView.diff.map((chunk, index) => (
                    <span
                      key={index}
                      className={
                        chunk.type === 'added'
                          ? 'bg-green-500/20 text-green-300'
                          : chunk.type === 'removed'
                          ? 'bg-red-500/20 text-red-300'
                          : 'text-gray-300'
                      }
                    >
                      {chunk.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <ConfirmationModal
        isOpen={revertModal.isOpen}
        onClose={() => setRevertModal({ isOpen: false, version: null })}
        onConfirm={handleRevert}
        title="Revert to Previous Version"
        message={`Are you sure you want to revert to Version ${revertModal.version ? versions.length - versions.findIndex(v => v.id === revertModal.version.id) : ''}? This will create a new version with the reverted content.`}
        confirmText="Revert"
        cancelText="Cancel"
        loading={reverting !== null}
      />
    </div>
  );
}