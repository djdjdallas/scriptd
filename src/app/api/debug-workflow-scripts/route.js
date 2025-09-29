import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler } from '@/lib/api-handler';

export const GET = createApiHandler(async (req) => {
  const { user, supabase } = await getAuthenticatedUser();
  
  // Get user's workflows
  const { data: workflows, error: workflowsError } = await supabase
    .from('script_workflows')
    .select('id, title, workflow_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Get scripts that reference workflows in metadata
  const { data: scriptsWithWorkflow, error: scriptsError } = await supabase
    .from('scripts')
    .select('id, title, user_id, channel_id, metadata, created_at')
    .not('metadata->workflow_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  // Get scripts by user_id
  const { data: userScripts, error: userScriptsError } = await supabase
    .from('scripts')
    .select('id, title, user_id, channel_id, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);
  
  // For each workflow, check if there's a matching script
  const workflowScriptMapping = [];
  for (const workflow of workflows || []) {
    // Check if workflow has scriptId in workflow_data
    const scriptId = workflow.workflow_data?.draft?.scriptId || 
                    workflow.workflow_data?.scriptId;
    
    let matchingScript = null;
    if (scriptId) {
      const { data: script } = await supabase
        .from('scripts')
        .select('id, title, user_id, channel_id')
        .eq('id', scriptId)
        .single();
      matchingScript = script;
    }
    
    // Also check for scripts with this workflow_id in metadata
    const { data: metadataScripts } = await supabase
      .from('scripts')
      .select('id, title, user_id, channel_id')
      .eq('metadata->workflow_id', workflow.id);
    
    workflowScriptMapping.push({
      workflow_id: workflow.id,
      workflow_title: workflow.title,
      stored_script_id: scriptId,
      matching_script: matchingScript,
      scripts_with_workflow_in_metadata: metadataScripts || []
    });
  }
  
  return NextResponse.json({
    debug: {
      user: {
        id: user.id,
        email: user.email
      },
      workflows: {
        count: workflows?.length || 0,
        data: workflows?.map(w => ({
          id: w.id,
          title: w.title,
          has_generated_script: !!w.workflow_data?.generatedScript,
          has_script_id: !!(w.workflow_data?.draft?.scriptId || w.workflow_data?.scriptId),
          script_id: w.workflow_data?.draft?.scriptId || w.workflow_data?.scriptId
        }))
      },
      scripts_with_workflow_metadata: {
        count: scriptsWithWorkflow?.length || 0,
        scripts: scriptsWithWorkflow?.map(s => ({
          id: s.id,
          title: s.title,
          workflow_id: s.metadata?.workflow_id,
          user_id: s.user_id,
          channel_id: s.channel_id
        }))
      },
      user_scripts: {
        count: userScripts?.length || 0,
        scripts: userScripts?.map(s => ({
          id: s.id,
          title: s.title,
          workflow_id: s.metadata?.workflow_id,
          user_id: s.user_id,
          channel_id: s.channel_id
        }))
      },
      workflow_script_mapping: workflowScriptMapping
    }
  });
});