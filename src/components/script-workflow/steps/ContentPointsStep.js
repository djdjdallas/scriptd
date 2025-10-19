'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Target, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ContentIdeaBanner from '../ContentIdeaBanner';

export default function ContentPointsStep() {
  const { workflowData, updateStepData, markStepComplete, trackCredits } = useWorkflow();
  const [contentPoints, setContentPoints] = useState(workflowData.contentPoints?.points || []);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const targetDuration = workflowData.summary?.targetDuration || 300;

  const generateContentPoints = async () => {
    setIsGenerating(true);
    toast.loading('Generating content points from research...');

    try {
      const response = await fetch('/api/workflow/generate-content-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: workflowData.summary?.topic,
          frame: workflowData.frame,
          research: workflowData.research,
          targetAudience: workflowData.summary?.targetAudience,
          targetDuration: workflowData.summary?.targetDuration || 300,
          workflowId: workflowData.id,
          researchSources: workflowData.research?.sources
        })
      });

      if (!response.ok) throw new Error('Failed to generate content points');

      const { points, creditsUsed, sourcesUsed } = await response.json();

      setContentPoints(points);
      trackCredits(creditsUsed);

      toast.dismiss();
      toast.success(`Generated ${points.length} content points using ${sourcesUsed || 0} research sources!`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate content points');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addContentPoint = () => {
    setContentPoints([
      ...contentPoints,
      {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        duration: 60,
        keyTakeaway: ''
      }
    ]);
  };

  const updateContentPoint = (id, field, value) => {
    setContentPoints(contentPoints.map(point =>
      point.id === id ? { ...point, [field]: value } : point
    ));
  };

  const removeContentPoint = (id) => {
    setContentPoints(contentPoints.filter(point => point.id !== id));
  };

  const movePoint = (index, direction) => {
    const newPoints = [...contentPoints];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < contentPoints.length) {
      [newPoints[index], newPoints[newIndex]] = [newPoints[newIndex], newPoints[index]];
      setContentPoints(newPoints);
    }
  };

  const handleSave = () => {
    updateStepData('contentPoints', { points: contentPoints });
    
    if (contentPoints.length > 0) {
      markStepComplete(7);
      toast.success('Content points saved!');
    }
  };

  const calculateTotalDuration = () => {
    return contentPoints.reduce((total, point) => total + (point.duration || 0), 0);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Key Content Points
        </h2>
        <p className="text-gray-400">
          Define the main value points of your video
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

      {contentPoints.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Add Content Points
          </h3>
          <p className="text-gray-400 mb-6">
            Structure your video with key talking points (1 credit per generation)
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={generateContentPoints}
              disabled={isGenerating}
              className="glass-button bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Points (1 credit)
                </>
              )}
            </button>
            <button
              onClick={addContentPoint}
              className="glass-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Total: <span className={`font-medium ${
                  Math.abs(calculateTotalDuration() - targetDuration) <= targetDuration * 0.1
                    ? 'text-green-400'
                    : calculateTotalDuration() > targetDuration
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}>
                  {formatDuration(calculateTotalDuration())}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Target: <span className="text-purple-400 font-medium">
                  {formatDuration(targetDuration)}
                </span>
              </div>
              {Math.abs(calculateTotalDuration() - targetDuration) > targetDuration * 0.1 && (
                <div className="text-xs text-yellow-500">
                  {calculateTotalDuration() > targetDuration
                    ? `${formatDuration(calculateTotalDuration() - targetDuration)} over`
                    : `${formatDuration(targetDuration - calculateTotalDuration())} under`}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateContentPoints}
                disabled={isGenerating}
                className="glass-button text-sm"
              >
                Regenerate (1 credit)
              </button>
              <button
                onClick={addContentPoint}
                className="glass-button text-sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Point
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {contentPoints.map((point, index) => (
              <div key={point.id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 mt-2">
                    <button
                      onClick={() => movePoint(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <GripVertical className="h-4 w-4 text-gray-500" />
                    <button
                      onClick={() => movePoint(index, 'down')}
                      disabled={index === contentPoints.length - 1}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        Point {index + 1}
                      </span>
                      <input
                        type="text"
                        value={point.title}
                        onChange={(e) => updateContentPoint(point.id, 'title', e.target.value)}
                        placeholder="Point title..."
                        className="flex-1 px-3 py-1 bg-gray-800/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={formatDuration(point.duration)}
                        onChange={(e) => {
                          const parts = e.target.value.split(':');
                          let seconds = 0;
                          if (parts.length === 2) {
                            seconds = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
                          } else if (parts.length === 1) {
                            seconds = parseInt(parts[0]) || 0;
                          }
                          updateContentPoint(point.id, 'duration', seconds);
                        }}
                        placeholder="M:SS"
                        className="w-20 px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-white focus:border-purple-500 focus:outline-none text-sm text-center"
                      />
                    </div>

                    <textarea
                      value={point.description}
                      onChange={(e) => updateContentPoint(point.id, 'description', e.target.value)}
                      placeholder="Describe this content point..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-y text-sm min-h-[4rem]"
                    />

                    <textarea
                      value={point.keyTakeaway}
                      onChange={(e) => updateContentPoint(point.id, 'keyTakeaway', e.target.value)}
                      placeholder="Key takeaway for viewers..."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-y text-sm min-h-[3rem]"
                    />
                  </div>

                  <button
                    onClick={() => removeContentPoint(point.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="glass-button bg-purple-600 hover:bg-purple-700 px-6 py-3"
            >
              Save Content Points
            </button>
          </div>
        </div>
      )}
    </div>
  );
}