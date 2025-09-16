'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Image, Sparkles, Eye, Palette, Type, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ThumbnailStep() {
  const { workflowData, updateStepData, markStepComplete, trackCredits } = useWorkflow();
  const [thumbnailConcept, setThumbnailConcept] = useState(workflowData.thumbnail?.concept || '');
  const [mainText, setMainText] = useState(workflowData.thumbnail?.mainText || '');
  const [visualElements, setVisualElements] = useState(workflowData.thumbnail?.visualElements || []);
  const [colorScheme, setColorScheme] = useState(workflowData.thumbnail?.colorScheme || 'vibrant');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThumbnailIdeas = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/workflow/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: workflowData.title?.selected || workflowData.summary?.topic,
          topic: workflowData.summary?.topic,
          audience: workflowData.summary?.targetAudience
        })
      });

      if (!response.ok) throw new Error('Failed to generate thumbnail ideas');

      const { concept, elements, text, creditsUsed } = await response.json();
      
      setThumbnailConcept(concept);
      setVisualElements(elements);
      setMainText(text);
      
      trackCredits(creditsUsed);
      toast.success('Thumbnail concept generated!');
    } catch (error) {
      toast.error('Failed to generate thumbnail ideas');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const thumbnailData = {
      concept: thumbnailConcept,
      mainText,
      visualElements,
      colorScheme
    };
    
    updateStepData('thumbnail', thumbnailData);
    
    if (thumbnailConcept) {
      markStepComplete(5);
      toast.success('Thumbnail concept saved!');
    }
  };

  const addVisualElement = () => {
    setVisualElements([...visualElements, '']);
  };

  const updateVisualElement = (index, value) => {
    const updated = [...visualElements];
    updated[index] = value;
    setVisualElements(updated);
  };

  const removeVisualElement = (index) => {
    setVisualElements(visualElements.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Thumbnail Concept
        </h2>
        <p className="text-gray-400">
          Design an eye-catching thumbnail that drives clicks
        </p>
      </div>

      <div className="space-y-6">
        {!thumbnailConcept ? (
          <div className="glass-card p-8 text-center">
            <Image className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Generate Thumbnail Concept
            </h3>
            <p className="text-gray-400 mb-6">
              AI will create a compelling thumbnail concept based on your title (1 credit per generation)
            </p>
            <button
              onClick={generateThumbnailIdeas}
              disabled={isGenerating}
              className="glass-button bg-purple-600 hover:bg-purple-700 px-6 py-3"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Concept...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Thumbnail Ideas (1 credit)
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="glass-card p-6">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Thumbnail Concept
                </span>
              </label>
              <textarea
                value={thumbnailConcept}
                onChange={(e) => setThumbnailConcept(e.target.value)}
                placeholder="Describe your thumbnail concept..."
                className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <div className="glass-card p-6">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Main Text Overlay
                </span>
              </label>
              <input
                type="text"
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
                placeholder="Text to display on thumbnail..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Keep it short and impactful (3-5 words max)
              </p>
            </div>

            <div className="glass-card p-6">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Visual Elements
                </span>
              </label>
              
              <div className="space-y-3">
                {visualElements.map((element, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={element}
                      onChange={(e) => updateVisualElement(index, e.target.value)}
                      placeholder="Describe visual element..."
                      className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => removeVisualElement(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={addVisualElement}
                  className="glass-button text-sm"
                >
                  + Add Visual Element
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <label className="block mb-2">
                <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color Scheme
                </span>
              </label>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="vibrant">Vibrant & Bold</option>
                <option value="dark">Dark & Mysterious</option>
                <option value="light">Light & Clean</option>
                <option value="neon">Neon & Futuristic</option>
                <option value="warm">Warm & Inviting</option>
                <option value="cool">Cool & Professional</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                onClick={generateThumbnailIdeas}
                disabled={isGenerating}
                className="glass-button"
              >
                Regenerate Ideas (1 credit)
              </button>
              <button
                onClick={handleSave}
                className="glass-button bg-purple-600 hover:bg-purple-700 px-6 py-3"
              >
                Save Thumbnail Concept
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}