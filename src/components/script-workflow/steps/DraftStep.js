'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { FileText, Sparkles, ScrollText, Copy } from 'lucide-react';
import { toast } from 'sonner';

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
      voiceProfile: workflowData.summary?.voiceProfile
    });
    
    console.log('2. RESEARCH DATA:', {
      hasResearch: !!workflowData.research,
      sourcesCount: workflowData.research?.sources?.length || 0,
      sources: workflowData.research?.sources?.map((s, i) => ({
        index: i,
        title: s.source_title,
        url: s.source_url,
        type: s.source_type,
        verified: s.fact_check_status,
        starred: s.is_starred
      })),
      keywords: workflowData.research?.keywords,
      summary: workflowData.research?.summary?.substring(0, 200) + '...'
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
    
    const requestBody = {
      type,
      title: workflowData.title?.selected || workflowData.summary?.topic,
      topic: workflowData.summary?.topic,
      voiceProfile: workflowData.summary?.voiceProfile,
      research: workflowData.research,
      frame: workflowData.frame,
      hook: workflowData.hook?.selected,
      contentPoints: workflowData.contentPoints,
      thumbnail: workflowData.thumbnail,
      model: workflowData.summary?.aiModel || 'claude-3-5-haiku',
      targetAudience: workflowData.summary?.targetAudience,
      tone: workflowData.summary?.tone,
      targetDuration: workflowData.summary?.targetDuration || 300,
      workflowId: workflowId
    };
    
    console.log('8. FINAL REQUEST BODY:', {
      ...requestBody,
      research: requestBody.research ? {
        sourcesCount: requestBody.research.sources?.length,
        hasKeywords: !!requestBody.research.keywords,
        hasSummary: !!requestBody.research.summary
      } : null
    });
    
    console.log('=== END DEBUG ===');
    
    try {
      console.log('Fetching /api/workflow/generate-script...');
      
      // Add timeout to fetch request (120 seconds for script generation - increased for longer scripts)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
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
          throw new Error('Request timed out after 2 minutes. For longer scripts, please try a shorter duration or simpler topic.');
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
            className="glass-button bg-blue-600 hover:bg-blue-700 w-full"
          >
            {isGenerating && generationType === 'outline' ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating Outline...
              </>
            ) : (
              'Generate Outline'
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
            className="glass-button bg-purple-600 hover:bg-purple-700 w-full"
          >
            {isGenerating && generationType === 'full' ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating Full Script...
              </>
            ) : (
              'Generate Full Script'
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