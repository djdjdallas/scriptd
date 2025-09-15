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
    trackCredits 
  } = useWorkflow();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState('');

  const generateScript = async (type) => {
    setIsGenerating(true);
    setGenerationType(type);
    
    try {
      const response = await fetch('/api/workflow/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: workflowData.title?.selected || workflowData.summary?.topic,
          topic: workflowData.summary?.topic,
          voiceProfile: workflowData.summary?.voiceProfile,
          research: workflowData.research,
          frame: workflowData.frame,
          hook: workflowData.hook?.selected,
          contentPoints: workflowData.contentPoints,
          thumbnail: workflowData.thumbnail,
          model: workflowData.summary?.aiModel || 'claude-3-opus',
          targetAudience: workflowData.summary?.targetAudience,
          tone: workflowData.summary?.tone
        })
      });

      if (!response.ok) throw new Error('Failed to generate script');

      const { script, creditsUsed } = await response.json();
      
      setGeneratedScript(script);
      updateStepData('draft', { script, type });
      trackCredits(creditsUsed);
      markStepComplete(8);
      
      toast.success(`${type === 'outline' ? 'Outline' : 'Full script'} generated!`);
    } catch (error) {
      toast.error('Failed to generate script');
      console.error(error);
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
            <li>• ~5 credits</li>
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
            <li>• ~20 credits</li>
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
      </div>
    </div>
  );
}