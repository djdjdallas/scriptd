'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Sparkles, RefreshCw, Copy, Check, Type } from 'lucide-react';
import { toast } from 'sonner';

export default function TitleStep() {
  const { workflowData, updateStepData, markStepComplete, trackCredits } = useWorkflow();
  const [titles, setTitles] = useState(workflowData.title?.variations || []);
  const [selectedTitle, setSelectedTitle] = useState(workflowData.title?.selected || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateTitles = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/workflow/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: workflowData.summary?.topic || '',
          keywords: workflowData.research?.keywords || [],
          audience: workflowData.summary?.targetAudience || 'general',
          tone: workflowData.summary?.tone || 'professional',
          voiceProfile: workflowData.summary?.voiceProfile || null,
          model: workflowData.summary?.aiModel || 'gpt-4-turbo'
        })
      });

      if (!response.ok) throw new Error('Failed to generate titles');

      const { titles: generatedTitles, creditsUsed } = await response.json();
      
      setTitles(generatedTitles);
      updateStepData('title', { variations: generatedTitles });
      trackCredits(creditsUsed);
      
      toast.success(`Generated ${generatedTitles.length} title variations!`);
    } catch (error) {
      toast.error('Failed to generate titles');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectTitle = (title) => {
    setSelectedTitle(title.text);
    updateStepData('title', { 
      selected: title.text,
      variations: titles 
    });
    markStepComplete(4);
  };

  const copyTitle = (title, index) => {
    navigator.clipboard.writeText(title.text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Generate Video Titles
        </h2>
        <p className="text-gray-400">
          AI-powered title generation optimized for YouTube CTR
        </p>
      </div>

      {titles.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Type className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Ready to Generate Titles?
          </h3>
          <p className="text-gray-400 mb-6">
            We'll create 10 optimized variations using AI (1 credit)
          </p>
          <button
            onClick={generateTitles}
            disabled={isGenerating}
            className="glass-button bg-purple-600 hover:bg-purple-700 px-6 py-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Titles...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Title Variations (1 credit)
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Generated Titles ({titles.length})
            </h3>
            <button
              onClick={generateTitles}
              disabled={isGenerating}
              className="glass-button text-sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Regenerate (1 credit)
            </button>
          </div>

          {titles.map((title, index) => (
            <div
              key={index}
              onClick={() => selectTitle(title)}
              className={`glass-card p-4 cursor-pointer transition-all ${
                selectedTitle === title.text 
                  ? 'ring-2 ring-purple-500 bg-purple-500/10' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{title.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      {title.text.length} chars
                    </span>
                    <span className="text-xs text-purple-400">
                      {title.emotion}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      title.ctrEstimate === 'High' 
                        ? 'bg-green-500/20 text-green-400'
                        : title.ctrEstimate === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {title.ctrEstimate} CTR
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyTitle(title, index);
                  }}
                  className="text-gray-400 hover:text-white ml-4"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {selectedTitle && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500 rounded-lg">
              <p className="text-sm text-purple-300 mb-1">Selected Title:</p>
              <p className="text-white font-medium">{selectedTitle}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}