'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Layout, ArrowRight, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import ContentIdeaBanner from '../ContentIdeaBanner';

export default function FrameStep() {
  const { workflowData, updateStepData, markStepComplete } = useWorkflow();
  const [problemStatement, setProblemStatement] = useState(workflowData.frame?.problem_statement || '');
  const [solutionApproach, setSolutionApproach] = useState(workflowData.frame?.solution_approach || '');
  const [transformationOutcome, setTransformationOutcome] = useState(workflowData.frame?.transformation_outcome || '');
  const [selectedFramework, setSelectedFramework] = useState(workflowData.frame?.framework || 'problem-solution');

  const frameworks = [
    {
      id: 'problem-solution',
      name: 'Problem → Solution → Impact',
      description: 'Show the obstacle, the action taken, and the measurable results',
      icon: Lightbulb
    },
    {
      id: 'before-after',
      name: 'Before → After → Bridge',
      description: 'Contrast the past state with the current reality and explain the journey',
      icon: TrendingUp
    },
    {
      id: 'myth-truth',
      name: 'Myth → Truth → Awakening',
      description: 'Expose the misconception, reveal the facts, and show the transformation',
      icon: Target
    }
  ];

  const handleSave = () => {
    const frameData = {
      framework: selectedFramework,
      problem_statement: problemStatement,
      solution_approach: solutionApproach,
      transformation_outcome: transformationOutcome
    };
    
    updateStepData('frame', frameData);
    
    if (problemStatement && solutionApproach) {
      markStepComplete(3);
      toast.success('Frame saved!');
    }
  };

  const generateFrameSuggestions = async () => {
    try {
      toast.loading('Generating frame from research...');

      const response = await fetch('/api/workflow/suggest-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: workflowData.summary?.topic,
          framework: selectedFramework,
          workflowId: workflowData.id,
          researchSources: workflowData.research?.sources,
          targetAudience: workflowData.summary?.targetAudience
        })
      });

      if (!response.ok) throw new Error('Failed to generate suggestions');

      const { suggestions, sourcesUsed } = await response.json();

      setProblemStatement(suggestions.problem);
      setSolutionApproach(suggestions.solution);
      setTransformationOutcome(suggestions.transformation);

      toast.dismiss();
      toast.success(`Frame generated using ${sourcesUsed || 0} research sources!`);
    } catch (error) {
      console.error('Frame suggestion error:', error);
      toast.dismiss();
      toast.error('Failed to generate suggestions');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Narrative Frame
        </h2>
        <p className="text-gray-400">
          Structure your video's story arc for maximum impact
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

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Choose Framework
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {frameworks.map((framework) => {
              const Icon = framework.icon;
              return (
                <button
                  key={framework.id}
                  onClick={() => setSelectedFramework(framework.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedFramework === framework.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-6 w-6 text-purple-400 mb-2" />
                  <h4 className="text-sm font-medium text-white mb-1">
                    {framework.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {framework.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={generateFrameSuggestions}
            className="glass-button text-sm"
          >
            Generate Suggestions
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-300">
                Problem / Current State
              </span>
            </label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Describe the problem or current situation your audience faces..."
              className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-y"
            />
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-purple-400" />
          </div>

          <div className="glass-card p-6">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-300">
                Solution / Bridge
              </span>
            </label>
            <textarea
              value={solutionApproach}
              onChange={(e) => setSolutionApproach(e.target.value)}
              placeholder="Explain the solution or method that bridges the gap..."
              className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-y"
            />
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-purple-400" />
          </div>

          <div className="glass-card p-6">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-300">
                Transformation / Outcome
              </span>
            </label>
            <textarea
              value={transformationOutcome}
              onChange={(e) => setTransformationOutcome(e.target.value)}
              placeholder="Describe the transformation or desired outcome..."
              className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="glass-button bg-purple-600 hover:bg-purple-700 px-6 py-3"
          >
            Save Frame
          </button>
        </div>
      </div>
    </div>
  );
}