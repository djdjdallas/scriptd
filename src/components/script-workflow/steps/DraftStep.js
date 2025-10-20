'use client';

import { useState, useEffect } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { FileText, Sparkles, ScrollText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import ContentIdeaBanner from '../ContentIdeaBanner';

export default function DraftStep() {
  const {
    workflowData,
    generatedScript,
    setGeneratedScript,
    updateStepData,
    markStepComplete,
    trackCredits,
    workflowId
  } = useWorkflow();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState('');
  const [researchSources, setResearchSources] = useState(workflowData.research?.sources || []);

  const supabase = createClient();

  // Load research sources directly from database to ensure we have all sources
  useEffect(() => {
    const loadResearchSources = async () => {
      if (!workflowId) return;

      try {
        console.log('📚 Loading research sources from database for workflow:', workflowId);

        const { data, error } = await supabase
          .from('workflow_research')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading research sources:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log(`✅ Loaded ${data.length} research sources from database`);
          console.log('Source types:', data.map(s => s.source_type));
          console.log('Synthesis sources:', data.filter(s => s.source_type === 'synthesis').length);

          // Convert to format expected by script generation
          const sources = data.map(source => ({
            id: source.id,
            source_type: source.source_type,
            source_url: source.source_url,
            source_title: source.source_title,
            source_content: source.source_content,
            fact_check_status: source.fact_check_status,
            is_starred: source.is_starred,
            relevance: source.relevance || 0.5
          }));

          setResearchSources(sources);

          // Update workflowData if needed (this ensures the research is saved to workflow_data)
          if (!workflowData.research?.sources || workflowData.research.sources.length < sources.length) {
            console.log(`📝 Updating workflowData.research with ${sources.length} sources (was ${workflowData.research?.sources?.length || 0})`);
            updateStepData('research', {
              ...workflowData.research,
              sources
            });
          }
        } else {
          console.log('No research sources found in database');
        }
      } catch (error) {
        console.error('Error loading research:', error);
      }
    };

    loadResearchSources();
  }, [workflowId]);

  // Debug: Log workflow data
  console.log('DraftStep - workflowData.summary:', workflowData.summary);

  const generateScript = async (type) => {
    setIsGenerating(true);
    setGenerationType(type);
    
    // Comprehensive debug logging for script generation
    console.log('=== DRAFT STEP: SCRIPT GENERATION DEBUG ===');
    console.log('Generation Type:', type);
    console.log('Workflow ID:', workflowId);
    
    // Log each component of the workflow data
    console.log('1. SUMMARY DATA:', {
      topic: workflowData.summary?.topic,
      aiModel: workflowData.summary?.aiModel,
      targetAudience: workflowData.summary?.targetAudience,
      tone: workflowData.summary?.tone,
      targetDuration: workflowData.summary?.targetDuration,
      voiceProfile: workflowData.summary?.voiceProfile,
      niche: workflowData.summary?.niche,
      hasContentIdeaInfo: !!workflowData.summary?.contentIdeaInfo,
      contentIdeaInfo: workflowData.summary?.contentIdeaInfo
    });
    
    // Use loaded research sources (from database) instead of workflowData
    const researchData = {
      ...workflowData.research,
      sources: researchSources // ✅ Use directly loaded sources from database
    };

    console.log('2. RESEARCH DATA (from database):', {
      hasResearch: !!researchData,
      sourcesCount: researchData?.sources?.length || 0,
      fromDatabase: researchSources.length,
      fromWorkflowData: workflowData.research?.sources?.length || 0,
      sources: researchData?.sources?.map((s, i) => ({
        index: i,
        title: s.source_title,
        url: s.source_url,
        type: s.source_type,
        verified: s.fact_check_status,
        starred: s.is_starred
      })),
      keywords: workflowData.research?.keywords,
      summary: workflowData.research?.summary?.substring(0, 200)
    });

    console.log('3. FRAME DATA:', {
      hasFrame: !!workflowData.frame,
      problemStatement: workflowData.frame?.problem_statement,
      solutionApproach: workflowData.frame?.solution_approach,
      transformationOutcome: workflowData.frame?.transformation_outcome
    });

    console.log('4. HOOK DATA:', {
      selected: workflowData.hook?.selected,
      allHooks: workflowData.hook?.hooks
    });

    console.log('5. CONTENT POINTS:', {
      hasContentPoints: !!workflowData.contentPoints,
      pointsCount: workflowData.contentPoints?.points?.length || 0,
      points: workflowData.contentPoints?.points?.map(p => ({
        title: p.title,
        duration: p.duration,
        keyTakeaway: p.keyTakeaway
      }))
    });

    console.log('6. TITLE DATA:', {
      selectedTitle: workflowData.title?.selected,
      allTitles: workflowData.title?.titles
    });

    console.log('7. THUMBNAIL DATA:', {
      hasThumbnail: !!workflowData.thumbnail,
      description: workflowData.thumbnail?.description
    });

    // Load sponsor data from database
    let sponsorData = null;
    if (workflowId) {
      try {
        const { data, error } = await supabase
          .from('workflow_sponsors')
          .select('*')
          .eq('workflow_id', workflowId)
          .single();

        if (data && !error) {
          sponsorData = data;
          console.log('✅ Sponsor data loaded:', sponsorData.sponsor_name);
        }
      } catch (error) {
        console.error('Error loading sponsor data:', error);
      }
    }

    console.log('8. SPONSOR DATA:', {
      hasSponsor: !!sponsorData,
      sponsorName: sponsorData?.sponsor_name,
      placement: sponsorData?.placement_preference,
      duration: sponsorData?.sponsor_duration,
      keyPointsCount: sponsorData?.sponsor_key_points?.length || 0
    });

    const requestBody = {
      type,
      title: workflowData.title?.selected || workflowData.summary?.topic,
      topic: workflowData.summary?.topic,
      voiceProfile: workflowData.summary?.voiceProfile,
      research: researchData, // ✅ Use research with sources from database
      frame: workflowData.frame,
      hook: workflowData.hook?.selected,
      contentPoints: workflowData.contentPoints,
      thumbnail: workflowData.thumbnail,
      sponsor: sponsorData, // ✅ Add sponsor data
      model: workflowData.summary?.aiModel || 'claude-3-5-haiku',
      targetAudience: workflowData.summary?.targetAudience,
      tone: workflowData.summary?.tone,
      targetDuration: workflowData.summary?.targetDuration || 300,
      workflowId: workflowId,
      // Include content idea info if available
      contentIdeaInfo: workflowData.summary?.contentIdeaInfo,
      niche: workflowData.summary?.niche
    };

    // Debug voice profile structure being sent
    if (requestBody.voiceProfile) {
      console.log('9. VOICE PROFILE DEBUG:', {
        profile_name: requestBody.voiceProfile.profile_name,
        hasBasicProfile: !!requestBody.voiceProfile.basicProfile,
        hasEnhancedProfile: !!requestBody.voiceProfile.enhancedProfile,
        hasVoiceProfileData: !!requestBody.voiceProfile.voiceProfileData,
        hasMetadata: !!requestBody.voiceProfile.metadata,
        basedOnRealData: requestBody.voiceProfile.basedOnRealData,
        allKeys: Object.keys(requestBody.voiceProfile),
        basicProfileKeys: requestBody.voiceProfile.basicProfile ? Object.keys(requestBody.voiceProfile.basicProfile) : [],
        enhancedProfileKeys: requestBody.voiceProfile.enhancedProfile ? Object.keys(requestBody.voiceProfile.enhancedProfile) : []
      });
    }

    console.log('10. FINAL REQUEST BODY:', {
      ...requestBody,
      research: requestBody.research ? {
        sourcesCount: requestBody.research.sources?.length,
        hasKeywords: !!requestBody.research.keywords,
        hasSummary: !!requestBody.research.summary
      } : null,
      sponsor: requestBody.sponsor ? {
        name: requestBody.sponsor.sponsor_name,
        placement: requestBody.sponsor.placement_preference,
        duration: requestBody.sponsor.sponsor_duration
      } : null
    });
    
    console.log('=== END DEBUG ===');
    
    try {
      console.log('Fetching /api/workflow/generate-script...');
      
      // Add timeout to fetch request (5 minutes for script generation - allows time for long chunked scripts)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      
      const response = await fetch('/api/workflow/generate-script', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }).catch(fetchError => {
        clearTimeout(timeoutId);
        console.error('Fetch error details:', {
          message: fetchError.message,
          stack: fetchError.stack,
          type: fetchError.name,
          isAbort: fetchError.name === 'AbortError'
        });
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 5 minutes. For longer scripts, please try a shorter duration or simpler topic.');
        }
        throw fetchError;
      });
      
      clearTimeout(timeoutId);

      if (!response) {
        console.error('No response received from server');
        throw new Error('No response from server - possible network or CORS issue');
      }

      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Script generation error:', errorData);
        throw new Error(errorData.error || `Failed to generate script: ${response.statusText}`);
      }

      console.log('Parsing response...');
      const responseData = await response.json().catch(jsonError => {
        console.error('Failed to parse success response:', jsonError);
        throw new Error('Invalid response format from server');
      });
      
      console.log('Response data:', { 
        hasScript: !!responseData.script,
        creditsUsed: responseData.creditsUsed,
        scriptId: responseData.scriptId 
      });
      
      const { script, creditsUsed, scriptId } = responseData;
      
      setGeneratedScript(script);
      updateStepData('draft', { script, type, scriptId });
      trackCredits(creditsUsed);
      markStepComplete(8);
      
      toast.success(`${type === 'outline' ? 'Outline' : 'Full script'} generated and saved!`);
    } catch (error) {
      console.error('Generation error full details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        type: error.constructor.name
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate script';
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection and try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: Server configuration issue. Please contact support.';
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication error: Please sign in again.';
      } else if (error.message.includes('credits')) {
        errorMessage = error.message; // Credit-related errors are already user-friendly
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
      setGenerationType('');
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    toast.success('Script copied to clipboard');
  };

  const formatScript = (script) => {
    const lines = script.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('#')) {
        return (
          <h3 key={index} className="text-lg font-bold text-purple-400 mt-4 mb-2">
            {line.replace(/^#+\s/, '')}
          </h3>
        );
      } else if (line.startsWith('[') && line.endsWith(']')) {
        return (
          <p key={index} className="text-sm text-yellow-400 italic my-2">
            {line}
          </p>
        );
      } else if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <li key={index} className="text-gray-300 ml-4">
            {line.substring(1).trim()}
          </li>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="text-gray-300 mb-2">
            {line}
          </p>
        );
      }
    });
  };

  if (generatedScript) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Generated Script
          </h2>
          <p className="text-gray-400">
            Your script has been generated. You can edit it in the next step.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {workflowData.title?.selected || 'Untitled Script'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyScript}
                className="glass-button text-sm"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </button>
              <button
                onClick={() => {
                  setGeneratedScript('');
                  updateStepData('draft', { script: '', type: '' });
                }}
                className="glass-button text-sm"
              >
                Back to Generate
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <div className="prose prose-invert max-w-none">
              {formatScript(generatedScript)}
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Word count: {generatedScript.split(' ').length} | 
              Est. duration: {Math.ceil(generatedScript.split(' ').length / 150)} minutes
            </div>
            <button
              onClick={() => markStepComplete(8)}
              className="glass-button bg-purple-600 hover:bg-purple-700"
            >
              Continue to Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Generate Your Script
        </h2>
        <p className="text-gray-400">
          Choose to generate an outline or a complete script
        </p>
      </div>

      {/* Content Idea Banner */}
      {workflowData.summary?.contentIdeaInfo && (
        <div className="mb-6">
          <ContentIdeaBanner
            contentIdeaInfo={workflowData.summary.contentIdeaInfo}
            niche={workflowData.summary.niche}
            compact={true}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 text-center">
          <ScrollText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Generate Outline
          </h3>
          <p className="text-gray-400 mb-6">
            Create a structured outline with main points and sections
          </p>
          <ul className="text-left text-sm text-gray-400 mb-6 space-y-1">
            <li>• Section headers</li>
            <li>• Key talking points</li>
            <li>• Time markers</li>
            <li>• Research citations</li>
          </ul>
          <button
            onClick={() => generateScript('outline')}
            disabled={isGenerating}
            className={`glass-button bg-blue-600 hover:bg-blue-700 w-full py-4 min-h-[80px] flex flex-col items-center justify-center gap-2 transition-all ${
              isGenerating ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating && generationType === 'outline' ? (
              <>
                <Sparkles className="h-6 w-6 animate-spin" />
                <span className="text-sm">Generating Outline...</span>
              </>
            ) : (
              <>
                <ScrollText className="h-5 w-5" />
                <span className="text-sm font-medium">Generate Outline</span>
              </>
            )}
          </button>
        </div>

        <div className="glass-card p-6 text-center">
          <FileText className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Generate Full Script
          </h3>
          <p className="text-gray-400 mb-6">
            Create a complete, ready-to-use script
          </p>
          <ul className="text-left text-sm text-gray-400 mb-6 space-y-1">
            <li>• Complete narration</li>
            <li>• Production notes</li>
            <li>• Visual cues</li>
            <li>• Fact-checked sources</li>
          </ul>
          <button
            onClick={() => generateScript('full')}
            disabled={isGenerating}
            className={`glass-button bg-purple-600 hover:bg-purple-700 w-full py-4 min-h-[80px] flex flex-col items-center justify-center gap-2 transition-all ${
              isGenerating ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating && generationType === 'full' ? (
              <>
                <Sparkles className="h-6 w-6 animate-spin" />
                <span className="text-sm">Generating Full Script...</span>
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Generate Full Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Script will include:</h4>
        <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-400">
          <div>✓ {workflowData.hook?.selected ? 'Custom opening hook' : 'Opening hook'}</div>
          <div>✓ {workflowData.contentPoints?.points?.length || 0} content points</div>
          <div>✓ {workflowData.research?.sources?.filter(s => s.is_starred).length || 0} starred sources</div>
          <div>✓ Voice profile: {workflowData.summary?.voiceProfile?.name || 'Default'}</div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Script Duration:</span>
            <span className="text-white font-semibold">
              {Math.ceil((workflowData.summary?.targetDuration || 300) / 60)} minutes
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-400">AI Model:</span>
            <span className="text-white font-semibold">
              {workflowData.summary?.aiModel === 'claude-opus-4-1' ? 'Hollywood' :
               workflowData.summary?.aiModel === 'claude-3-5-sonnet' ? 'Professional' :
               'Fast'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-400">Credits Required:</span>
            <span className="text-purple-400 font-semibold">
              {(() => {
                const targetDuration = workflowData.summary?.targetDuration || 300;
                const minutes = Math.ceil(targetDuration / 60);
                // Base rate: 0.33 credits per minute (so 10 min Professional = 5 credits)
                const baseRate = 0.33;
                const model = workflowData.summary?.aiModel || 'claude-3-5-haiku';
                const multiplier = model === 'claude-opus-4-1' ? 3.5 : model === 'claude-3-5-sonnet' ? 1.5 : 1;
                const credits = Math.max(1, Math.round(minutes * baseRate * multiplier));
                
                console.log('Credit Calculation Debug:', {
                  targetDuration,
                  minutes,
                  model,
                  multiplier,
                  baseRate,
                  calculation: `${minutes} * ${baseRate} * ${multiplier} = ${minutes * baseRate * multiplier}`,
                  credits
                });
                
                return credits;
              })()} credits
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            {(() => {
              const targetDuration = workflowData.summary?.targetDuration || 300;
              const minutes = Math.ceil(targetDuration / 60);
              const baseRate = 0.33; // 0.33 credits per minute
              const baseCredits = minutes * baseRate;
              const modelName = workflowData.summary?.aiModel === 'claude-opus-4-1' ? 'Hollywood' :
                               workflowData.summary?.aiModel === 'claude-3-5-sonnet' ? 'Professional' : 'Fast';
              const multiplierNum = workflowData.summary?.aiModel === 'claude-opus-4-1' ? 3.5 :
                                   workflowData.summary?.aiModel === 'claude-3-5-sonnet' ? 1.5 : 1;
              const multiplier = workflowData.summary?.aiModel === 'claude-opus-4-1' ? '3.5x' :
                                workflowData.summary?.aiModel === 'claude-3-5-sonnet' ? '1.5x' : '1x';
              const finalCredits = Math.max(1, Math.round(baseCredits * multiplierNum));
              return `${minutes} min × ${baseRate} credits/min = ${baseCredits} base × ${multiplier} (${modelName}) = ${finalCredits} total`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}