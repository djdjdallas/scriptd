'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { 
  Edit, 
  History, 
  Share2, 
  Download, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  ExternalLink,
  FileText,
  Loader2,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function ScriptActions({ 
  script, 
  onDelete, 
  onShare,
  showEditButton = true,
  showHistoryButton = true,
  showShareButton = true,
  showExportButton = true,
  compact = false 
}) {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    try {
      const scriptText = `${script.title}\n\n${script.hook ? script.hook + '\n\n' : ''}${script.content}`;
      await navigator.clipboard.writeText(scriptText);
      toast({
        title: "Copied!",
        description: "Script content copied to clipboard",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  const handleExport = async (format = 'pdf') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/scripts/${script.id}/export?format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'pdf') {
        // For PDF, we get a blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For other formats, we might get JSON
        const data = await response.json();
        const content = data.content;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: "Export Complete",
        description: `Script exported as ${format.toUpperCase()}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${script.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(script.id);
      } else {
        // Default delete implementation
        const response = await fetch(`/api/scripts/${script.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete script');
        }
      }
      
      toast({
        title: "Script Deleted",
        description: "The script has been deleted successfully.",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete script",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      if (onShare) {
        await onShare(script);
      } else {
        // Default share implementation - copy link
        const url = `${window.location.origin}/scripts/${script.id}`;
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Script link copied to clipboard",
          duration: 2000
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share script",
        variant: "destructive"
      });
    }
  };

  if (compact) {
    // Compact version with dropdown menu
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="glass-button" size="icon">
            <MoreHorizontal className="h-4 w-4 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass bg-gray-900/95 border-white/20 backdrop-blur-md">
          <DropdownMenuItem className="text-white hover:bg-white/10">
            <Link href={`/scripts/${script.id}`} className="flex items-center w-full">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </DropdownMenuItem>
          
          {showEditButton && (
            <DropdownMenuItem className="text-white hover:bg-white/10">
              <Link href={`/scripts/${script.id}/edit`} className="flex items-center w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            className="text-white hover:bg-white/10"
            onClick={handleCopy}
            disabled={copying}
          >
            {copying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy Content
          </DropdownMenuItem>
          
          {showHistoryButton && (
            <DropdownMenuItem className="text-white hover:bg-white/10">
              <Link href={`/scripts/${script.id}/history`} className="flex items-center w-full">
                <History className="h-4 w-4 mr-2" />
                View History
              </Link>
            </DropdownMenuItem>
          )}
          
          {showExportButton && (
            <DropdownMenuItem 
              className="text-white hover:bg-white/10"
              onClick={() => handleExport('pdf')}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </DropdownMenuItem>
          )}
          
          {showShareButton && (
            <DropdownMenuItem 
              className="text-white hover:bg-white/10"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator className="bg-white/20" />
          
          <DropdownMenuItem 
            className="text-red-300 hover:bg-red-500/20"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full button layout
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={`/scripts/${script.id}`}>
        <Button className="glass-button hover:bg-blue-500/20" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </Link>
      
      {showEditButton && (
        <Link href={`/scripts/${script.id}/edit`}>
          <Button className="glass-button hover:bg-purple-500/20" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      )}
      
      <Button 
        onClick={handleCopy}
        className="glass-button hover:bg-green-500/20" 
        size="sm"
        disabled={copying}
      >
        {copying ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        Copy
      </Button>
      
      {showHistoryButton && (
        <Link href={`/scripts/${script.id}/history`}>
          <Button className="glass-button hover:bg-yellow-500/20" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </Link>
      )}
      
      {showExportButton && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className="glass-button hover:bg-indigo-500/20" 
              size="sm"
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass bg-gray-900/95 border-white/20 backdrop-blur-md">
            <DropdownMenuItem 
              className="text-white hover:bg-white/10"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-white hover:bg-white/10"
              onClick={() => handleExport('txt')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as TXT
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-white hover:bg-white/10"
              onClick={() => handleExport('docx')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {showShareButton && (
        <Button 
          onClick={handleShare}
          className="glass-button hover:bg-pink-500/20" 
          size="sm"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}
      
      <Button 
        onClick={handleDelete}
        className="glass-button hover:bg-red-500/20" 
        size="sm"
        disabled={deleting}
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 mr-2" />
        )}
        Delete
      </Button>
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Script"
        message={`Are you sure you want to delete "${script.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}

// Quick action buttons for script cards
export function QuickActions({ script, onDelete, onShare }) {
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  const handleQuickCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(script.content);
      toast({
        title: "Copied!",
        description: "Script copied to clipboard",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Link href={`/scripts/${script.id}/edit`}>
        <Button className="glass-button hover:bg-purple-500/20" size="icon">
          <Edit className="h-4 w-4 text-white" />
        </Button>
      </Link>
      
      <Button 
        onClick={handleQuickCopy}
        className="glass-button hover:bg-green-500/20" 
        size="icon"
        disabled={copying}
      >
        {copying ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <Copy className="h-4 w-4 text-white" />
        )}
      </Button>
      
      <Link href={`/scripts/${script.id}/history`}>
        <Button className="glass-button hover:bg-yellow-500/20" size="icon">
          <History className="h-4 w-4 text-white" />
        </Button>
      </Link>
      
      <Button 
        onClick={() => onShare && onShare(script)}
        className="glass-button hover:bg-blue-500/20" 
        size="icon"
      >
        <Share2 className="h-4 w-4 text-white" />
      </Button>
      
      <Button 
        onClick={() => onDelete && onDelete(script.id)}
        className="glass-button hover:bg-red-500/20" 
        size="icon"
      >
        <Trash2 className="h-4 w-4 text-white" />
      </Button>
    </div>
  );
}