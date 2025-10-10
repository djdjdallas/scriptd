'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Zap, RefreshCw, Clock, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function HookStep() {
  const { workflowData, updateStepData, markStepComplete, trackCredits } = useWorkflow();
  const [hooks, setHooks] = useState(workflowData.hook?.variations || []);
  const [selectedHook, setSelectedHook] = useState(workflowData.hook?.selected || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const hookPatterns = [
    { icon: HelpCircle, type: 'question', label: 'Question Hook' },
    { icon: AlertCircle, type: 'shocking', label: 'Shocking Statement' },
    { icon: Clock, type: 'time', label: 'Time-Based' },
    { icon: TrendingUp, type: 'statistic', label: 'Statistic/Fact' }
  ];

  const generateHooks = async () => {
    setIsGenerating(true);
    toast.loading('Generating hooks from research...');

    try {
      const response = await fetch('/api/workflow/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: workflowData.title?.selected,
          topic: workflowData.summary?.topic,
          frame: workflowData.frame,
          audience: workflowData.summary?.targetAudience,
          tone: workflowData.summary?.tone,
          workflowId: workflowData.id,
          researchSources: workflowData.research?.sources
        })
      });

      if (!response.ok) throw new Error('Failed to generate hooks');

      const { hooks: generatedHooks, creditsUsed, sourcesUsed } = await response.json();

      setHooks(generatedHooks);
      updateStepData('hook', { variations: generatedHooks });
      trackCredits(creditsUsed);

      toast.dismiss();
      toast.success(`Generated ${generatedHooks.length} hooks using ${sourcesUsed || 0} research sources!`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate hooks');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectHook = (hook) => {
    setSelectedHook(hook.text);
    updateStepData('hook', { 
      selected: hook.text,
      variations: hooks 
    });
    markStepComplete(6);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Opening Hook
        </h2>
        <p className="text-gray-400">
          Capture attention in the first 3 seconds
        </p>
      </div>

      {hooks.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Generate Opening Hooks
          </h3>
          <p className="text-gray-400 mb-6">
            Create attention-grabbing openings for your video (1 credit per generation)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {hookPatterns.map(({ icon: Icon, type, label }) => (
              <div key={type} className="glass-card p-3 text-center">
                <Icon className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-gray-300">{label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={generateHooks}
            disabled={isGenerating}
            className="glass-button bg-purple-600 hover:bg-purple-700 px-6 py-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Hooks...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Hook Variations (1 credit)
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Generated Hooks ({hooks.length})
            </h3>
            <button
              onClick={generateHooks}
              disabled={isGenerating}
              className="glass-button text-sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Regenerate (1 credit)
            </button>
          </div>

          {hooks.map((hook, index) => {
            const PatternIcon = hookPatterns.find(p => p.type === hook.type)?.icon || Zap;
            
            return (
              <div
                key={index}
                onClick={() => selectHook(hook)}
                className={`glass-card p-4 cursor-pointer transition-all ${
                  selectedHook === hook.text 
                    ? 'ring-2 ring-purple-500 bg-purple-500/10' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <PatternIcon className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{hook.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                        {hook.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        ~{hook.duration}s
                      </span>
                      <span className={`text-xs ${
                        hook.strength === 'Strong' 
                          ? 'text-green-400' 
                          : hook.strength === 'Medium'
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}>
                        {hook.strength} Impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {selectedHook && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500 rounded-lg">
              <p className="text-sm text-purple-300 mb-1">Selected Hook:</p>
              <p className="text-white font-medium">{selectedHook}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}