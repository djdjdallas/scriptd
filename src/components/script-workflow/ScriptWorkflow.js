'use client';

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import WorkflowSidebar from './WorkflowSidebar';
import WorkflowHeader from './WorkflowHeader';

// PERFORMANCE FIX: Native debounce implementation replaces 160KB lodash import
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

import SummaryStep from './steps/SummaryStep';
import ResearchStep from './steps/ResearchStep';
import FrameStep from './steps/FrameStep';
import TitleStep from './steps/TitleStep';
import ThumbnailStep from './steps/ThumbnailStep';
import HookStep from './steps/HookStep';
import ContentPointsStep from './steps/ContentPointsStep';
import SponsorStep from './steps/SponsorStep';
import DraftStep from './steps/DraftStep';
import EditStep from './steps/EditStep';
import ExportStep from './steps/ExportStep';
import PublishStep from './steps/PublishStep';

const WORKFLOW_STEPS = [
  { id: 1, name: 'summary', title: 'Summary', component: SummaryStep, icon: 'FileText' },
  { id: 2, name: 'research', title: 'Research', component: ResearchStep, icon: 'Search' },
  { id: 3, name: 'frame', title: 'Frame', component: FrameStep, icon: 'Layout' },
  { id: 4, name: 'title', title: 'Title', component: TitleStep, icon: 'Type' },
  { id: 5, name: 'thumbnail', title: 'Thumbnail', component: ThumbnailStep, icon: 'Image' },
  { id: 6, name: 'hook', title: 'Hook', component: HookStep, icon: 'Zap' },
  { id: 7, name: 'contentPoints', title: 'Content Points', component: ContentPointsStep, icon: 'Target' },
  { id: 8, name: 'sponsor', title: 'Sponsor', component: SponsorStep, icon: 'DollarSign' },
  { id: 9, name: 'draft', title: 'Draft', component: DraftStep, icon: 'Edit' },
  { id: 10, name: 'edit', title: 'Edit', component: EditStep, icon: 'Wand2' },
  { id: 11, name: 'export', title: 'Export', component: ExportStep, icon: 'Download' },
  { id: 12, name: 'publish', title: 'Publish', component: PublishStep, icon: 'Send' }
];

const WorkflowContext = createContext();

export function useWorkflow() {
  return useContext(WorkflowContext);
}

export default function ScriptWorkflow({ workflowId = null, initialTemplateData = null, initialContentIdeaData = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState('Untitled Script');
  const [generatedScript, setGeneratedScript] = useState('');

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    } else {
      // For new workflows, we'll let the database handle the user_id
      // using RLS policies and the authenticated user from the session
      createNewWorkflow(initialTemplateData, initialContentIdeaData);
    }
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('script_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;

      const workflowDataLoaded = data.workflow_data || {};
      setWorkflowData(workflowDataLoaded);
      // Handle both string 'summary' and number current_step values
      const step = data.current_step === 'summary' ? 1 : (data.current_step || 1);
      setCurrentStep(typeof step === 'number' ? step : 1);
      setCompletedSteps(data.completed_steps || []);
      setWorkflowTitle(data.title || 'Untitled Script');
      
      // Restore generated script if it exists
      if (workflowDataLoaded.generatedScript) {
        setGeneratedScript(workflowDataLoaded.generatedScript);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewWorkflow = async (templateData = null, contentIdeaData = null) => {
    try {
      console.log('[ScriptWorkflow] Starting workflow creation...');

      // Get the current user - this is required for workflow creation
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('[ScriptWorkflow] Error getting user:', userError);
        console.error('[ScriptWorkflow] Full error details:', JSON.stringify(userError, null, 2));
      }

      if (!user) {
        console.error('[ScriptWorkflow] No user found, cannot create workflow');
        toast.error('Authentication required. Please sign in again.');
        router.push('/login');
        return;
      }

      console.log('[ScriptWorkflow] Creating workflow for user:', user.email, 'ID:', user.id);

      // Prepare initial workflow data with template or content idea info if provided
      let initialData = {};
      let title = 'Untitled Script';

      if (contentIdeaData) {
        console.log('[ScriptWorkflow] Pre-filling with content idea data:', contentIdeaData);

        // Extract video title from the content idea title
        const videoTitle = contentIdeaData.contentIdeaTitle || '';

        // Use the event/specifics as the topic, or extract from title
        const specificTopic = contentIdeaData.contentIdeaEvent ||
                             contentIdeaData.contentIdeaTitle ||
                             contentIdeaData.topic;

        initialData = {
          summary: {
            topic: specificTopic, // Use specific event/title as topic
            targetAudience: '',
            tone: 'professional',
            targetDuration: 900, // Default 15 minutes for content ideas
            niche: contentIdeaData.niche, // Store the niche separately
            contentIdeaInfo: {
              title: contentIdeaData.contentIdeaTitle,
              hook: contentIdeaData.contentIdeaHook,
              description: contentIdeaData.contentIdeaDescription,
              basedOnEvent: contentIdeaData.contentIdeaEvent,
              specifics: contentIdeaData.contentIdeaSpecifics,
              estimatedViews: contentIdeaData.estimatedViews,
            },
          },
          title: {
            mainTitle: videoTitle,
          },
          hook: {
            hookText: contentIdeaData.contentIdeaHook,
          },
        };

        title = videoTitle || `${specificTopic} Script`;
        toast.success(`Content idea loaded: ${videoTitle.substring(0, 50)}...`);
      } else if (templateData) {
        console.log('[ScriptWorkflow] Pre-filling with template data:', templateData);

        // Convert duration string to seconds
        const durationMatch = templateData.templateDuration?.match(/(\d+)/);
        const durationInSeconds = durationMatch ? parseInt(durationMatch[0]) * 60 : 300;

        initialData = {
          summary: {
            topic: templateData.topic || '',
            targetAudience: '',
            tone: 'professional',
            targetDuration: durationInSeconds,
            templateInfo: {
              title: templateData.templateTitle,
              type: templateData.templateType,
              format: templateData.templateFormat,
              hook: templateData.templateHook,
            },
          },
        };

        title = `${templateData.templateType || 'Script'} - ${templateData.topic || 'Untitled'}`;
        toast.success(`Template loaded: ${templateData.templateType}`);
      }

      const workflowData = {
        user_id: user.id,
        title: title,
        workflow_data: initialData,
        current_step: 1,  // Start at step 1 (Summary)
        completed_steps: []
      };
      
      console.log('[ScriptWorkflow] Inserting workflow data:', JSON.stringify(workflowData, null, 2));
      
      const { data, error } = await supabase
        .from('script_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) {
        console.error('[ScriptWorkflow] Database error:', JSON.stringify(error, null, 2));
        console.error('[ScriptWorkflow] Error code:', error.code);
        console.error('[ScriptWorkflow] Error message:', error.message);
        console.error('[ScriptWorkflow] Error details:', error.details);
        console.error('[ScriptWorkflow] Error hint:', error.hint);
        
        // Check for specific error types
        if (error.code === '23503') {
          toast.error('User account issue. Please sign out and sign in again.');
          return;
        } else if (error.code === '42501') {
          toast.error('Permission denied. Please check your account status.');
          return;
        }
        
        throw error;
      }

      console.log('[ScriptWorkflow] Workflow created successfully:', data);
      console.log('[ScriptWorkflow] Redirecting to:', `/scripts/create/${data.id}`);
      
      // Use replace instead of push to avoid back button issues
      router.replace(`/scripts/create/${data.id}`);
    } catch (error) {
      console.error('[ScriptWorkflow] Unexpected error:', error);
      toast.error('Failed to create workflow. Please try again.');
      setIsLoading(false);
    }
  };

  const saveWorkflow = useCallback(
    debounce(async (data, script) => {
      if (!workflowId) return;
      
      setIsSaving(true);
      try {
        const workflowDataWithScript = {
          ...data,
          generatedScript: script
        };
        
        const { error } = await supabase
          .from('script_workflows')
          .update({
            title: workflowTitle,
            workflow_data: workflowDataWithScript,
            current_step: currentStep,
            completed_steps: completedSteps,
            updated_at: new Date().toISOString()
          })
          .eq('id', workflowId);

        if (error) throw error;
      } catch (error) {
        console.error('Error saving workflow:', error);
        toast.error('Failed to save progress');
      } finally {
        setIsSaving(false);
      }
    }, 3000),
    [workflowId, currentStep, completedSteps, workflowTitle]
  );

  useEffect(() => {
    if (Object.keys(workflowData).length > 0 && !isLoading) {
      saveWorkflow(workflowData, generatedScript);
    }
  }, [workflowData, generatedScript, saveWorkflow]);

  const updateStepData = (stepName, data) => {
    setWorkflowData(prev => ({
      ...prev,
      [stepName]: { ...prev[stepName], ...data }
    }));
  };

  const markStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const trackCredits = (credits) => {
    // Track credits in workflow data instead
    setWorkflowData(prev => ({
      ...prev,
      totalCreditsUsed: (prev.totalCreditsUsed || 0) + credits
    }));
  };

  const goToStep = (stepId) => {
    setCurrentStep(stepId);
  };

  const updateWorkflowTitle = (title) => {
    setWorkflowTitle(title);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = WORKFLOW_STEPS[currentStep - 1]?.component;
  
  // Calculate current total duration from content points
  const calculateCurrentDuration = () => {
    const contentPoints = workflowData.contentPoints?.points || [];
    return contentPoints.reduce((total, point) => total + (point.duration || 0), 0);
  };

  return (
    <WorkflowContext.Provider value={{
      workflowData,
      updateStepData,
      currentStep,
      goToStep,
      completedSteps,
      markStepComplete,
      trackCredits,
      workflowId,
      workflowTitle,
      updateWorkflowTitle,
      generatedScript,
      setGeneratedScript
    }}>
      <div className="flex h-screen bg-black">
        <WorkflowSidebar 
          steps={WORKFLOW_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        <div className="flex-1 flex flex-col">
          <WorkflowHeader 
            title={workflowTitle}
            isSaving={isSaving}
            creditsUsed={workflowData.totalCreditsUsed || 0}
            targetDuration={workflowData.summary?.targetDuration}
            currentDuration={calculateCurrentDuration()}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full">
              {CurrentStepComponent && <CurrentStepComponent />}
            </div>
          </div>

          <div className="border-t border-gray-800 p-4 flex justify-between items-center bg-gray-900/50">
            <button
              onClick={() => goToStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="glass-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="text-sm text-gray-400">
              Step {currentStep} of {WORKFLOW_STEPS.length}
            </div>

            <button
              onClick={() => {
                markStepComplete(currentStep);
                goToStep(Math.min(WORKFLOW_STEPS.length, currentStep + 1));
              }}
              disabled={currentStep === WORKFLOW_STEPS.length}
              className="glass-button bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </WorkflowContext.Provider>
  );
}