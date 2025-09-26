'use client';

import { useSearchParams } from 'next/navigation';
import ScriptWorkflow from '@/components/script-workflow/ScriptWorkflow';

export default function CreateScriptPage() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflow');
  
  return (
    <div className="min-h-screen bg-black">
      <ScriptWorkflow workflowId={workflowId} />
    </div>
  );
}