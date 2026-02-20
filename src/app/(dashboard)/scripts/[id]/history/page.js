'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import EditHistory from '@/components/scripts/edit-history';
import { 
  ChevronLeft, 
  Loader2, 
  History as HistoryIcon, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function ScriptHistoryPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
          throw new Error('You don\'t have permission to view this script');
        } else {
          throw new Error('Failed to load script');
        }
      }
      
      const data = await response.json();
      setScript(data);
      
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="vb-card p-8 animate-pulse-slow">
          <Loader2 className="h-12 w-12 animate-spin text-violet-400 mx-auto" />
          <p className="mt-4 text-gray-300">Loading version history...</p>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="vb-card p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Script Not Found</h2>
          <p className="text-gray-400 mb-6">
            This script doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/scripts">
            <Button className="vb-btn-outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-reveal">
          <div className="flex items-center gap-4">
            <Link href={`/scripts/${scriptId}`}>
              <Button className="vb-btn-outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Script
              </Button>
            </Link>
            
            <div>
              <div className="flex items-center gap-3">
                <HistoryIcon className="h-6 w-6 text-violet-400" />
                <h1 className="font-display text-2xl md:text-3xl text-white">Version History</h1>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <FileText className="h-3 w-3" />
                <span>{script.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/scripts/${scriptId}/edit`}>
              <Button className="vb-btn-primary">
                Edit Script
              </Button>
            </Link>
          </div>
        </div>

        {/* Version History Component */}
        <div className="animate-reveal" style={{ animationDelay: '0.1s' }}>
          <EditHistory
            scriptId={scriptId}
            onRevert={handleRevert}
            currentVersion={script}
          />
        </div>

        {/* Help Text */}
        <div className="vb-card animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-3">
            <HistoryIcon className="h-5 w-5 text-violet-400 mt-0.5" />
            <div className="text-sm text-gray-300">
              <h3 className="font-semibold mb-1">About Version History:</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Versions are automatically created when you save changes</li>
                <li>• Manual versions can be created using "Save as Version" in the editor</li>
                <li>• You can view, compare, and revert to any previous version</li>
                <li>• Reverting creates a new version based on the selected one</li>
                <li>• Old auto-save versions are cleaned up periodically to save space</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}