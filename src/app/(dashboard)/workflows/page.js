'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, Clock, Calendar, Edit, Trash2, 
  Plus, Loader2, PlayCircle, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, workflow: null });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Please sign in to view your workflows');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('script_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (workflow) => {
    setDeleteModal({ isOpen: true, workflow });
  };

  const deleteWorkflow = async () => {
    const workflowId = deleteModal.workflow.id;
    
    try {
      const { error } = await supabase
        .from('script_workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(workflows.filter(w => w.id !== workflowId));
      toast.success('Workflow deleted');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    } finally {
      setDeleteModal({ isOpen: false, workflow: null });
    }
  };

  const continueWorkflow = (workflowId) => {
    router.push(`/scripts/create?workflow=${workflowId}`);
  };

  const getStepName = (stepNumber) => {
    const steps = [
      'Summary', 'Research', 'Frame', 'Title', 'Thumbnail', 
      'Hook', 'Content Points', 'Draft', 'Edit', 'Export', 'Publish'
    ];
    return steps[stepNumber - 1] || 'Unknown';
  };

  const getCompletionPercentage = (completedSteps) => {
    if (!completedSteps || !Array.isArray(completedSteps)) return 0;
    return Math.round((completedSteps.length / 11) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto" />
          <p className="mt-4 text-gray-400">Loading your workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <FileText className="h-10 w-10 text-purple-400" />
              Script Workflows
            </h1>
            <p className="text-gray-400 mt-2">
              Continue working on your saved script drafts
            </p>
          </div>

          <Link href="/scripts/create">
            <Button className="glass-button bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Script
            </Button>
          </Link>
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="h-20 w-20 mx-auto text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No workflows yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start creating your first script workflow
            </p>
            <Link href="/scripts/create">
              <Button className="glass-button bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Script
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {workflow.title || 'Untitled Script'}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="glass border-purple-400/50 text-purple-300">
                        Step {workflow.current_step}: {getStepName(workflow.current_step)}
                      </Badge>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getCompletionPercentage(workflow.completed_steps)}% complete
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${getCompletionPercentage(workflow.completed_steps)}%` }}
                      />
                    </div>

                    {/* Workflow data preview */}
                    {workflow.workflow_data && (
                      <div className="text-sm text-gray-400">
                        {workflow.workflow_data.summary?.topic && (
                          <p>Topic: {workflow.workflow_data.summary.topic}</p>
                        )}
                        {workflow.workflow_data.summary?.targetDuration && (
                          <p>Duration: {Math.ceil(workflow.workflow_data.summary.targetDuration / 60)} minutes</p>
                        )}
                        {workflow.workflow_data.summary?.aiModel && (
                          <p>Model: {
                            workflow.workflow_data.summary.aiModel === 'claude-opus-4-1' ? 'Hollywood' :
                            workflow.workflow_data.summary.aiModel === 'claude-3-5-sonnet' ? 'Professional' : 'Fast'
                          }</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      onClick={() => continueWorkflow(workflow.id)}
                      className="glass-button bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(workflow)}
                      className="glass-button hover:bg-red-500/20"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, workflow: null })}
        onConfirm={deleteWorkflow}
        title="Delete Workflow"
        message={`Are you sure you want to delete "${deleteModal.workflow?.title || 'this workflow'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}