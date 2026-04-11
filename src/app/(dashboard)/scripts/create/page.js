'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import ScriptWorkflow from '@/components/script-workflow/ScriptWorkflow';

export default function CreateScriptPage() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflow');

  // Extract template parameters if present
  const templateData = {
    templateTitle: searchParams.get('templateTitle'),
    templateType: searchParams.get('templateType'),
    templateFormat: searchParams.get('templateFormat'),
    templateHook: searchParams.get('templateHook'),
    templateDuration: searchParams.get('templateDuration'),
    topic: searchParams.get('topic'),
    niche: searchParams.get('niche'),
  };

  // Extract content idea parameters if present
  const contentIdeaData = {
    contentIdeaTitle: searchParams.get('contentIdeaTitle'),
    contentIdeaHook: searchParams.get('contentIdeaHook'),
    contentIdeaDescription: searchParams.get('contentIdeaDescription'),
    contentIdeaEvent: searchParams.get('contentIdeaEvent'),
    contentIdeaSpecifics: searchParams.get('contentIdeaSpecifics'),
    estimatedViews: searchParams.get('estimatedViews'),
    topic: searchParams.get('topic'),
    niche: searchParams.get('niche'),
    sourceType: searchParams.get('sourceType'),
  };

  // Check if any template data or content idea data exists
  const hasTemplateData = Object.values(templateData).some(val => val !== null);
  const hasContentIdeaData = searchParams.get('sourceType') === 'content-idea';

  const pageViewedFiredRef = useRef(false);
  useEffect(() => {
    if (pageViewedFiredRef.current) return;
    pageViewedFiredRef.current = true;
    posthog.capture('script_create_page_viewed', {
      source: workflowId ? 'resume_workflow' : 'new_workflow',
      has_template: hasTemplateData,
      has_content_idea: hasContentIdeaData,
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#030303]">
      <ScriptWorkflow
        workflowId={workflowId}
        initialTemplateData={hasTemplateData ? templateData : null}
        initialContentIdeaData={hasContentIdeaData ? contentIdeaData : null}
      />
    </div>
  );
}