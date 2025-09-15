'use client';

import { use } from 'react';
import ScriptWorkflow from '@/components/script-workflow/ScriptWorkflow';

export default function ResumeWorkflowPage({ params }) {
  const unwrappedParams = use(params);
  
  return (
    <div className="min-h-screen bg-black">
      <ScriptWorkflow workflowId={unwrappedParams.workflowId} />
    </div>
  );
}