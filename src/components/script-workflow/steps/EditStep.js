'use client';

import { useState, useEffect } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Wand2, Sparkles, Lock, Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

export default function EditStep() {
  const { 
    generatedScript, 
    setGeneratedScript,
    updateStepData,
    markStepComplete,
    trackCredits,
    goToStep 
  } = useWorkflow();
  
  const [editedScript, setEditedScript] = useState(generatedScript || '');
  const [selectedText, setSelectedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  useEffect(() => {
    setEditedScript(generatedScript || '');
  }, [generatedScript]);

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();
      
      setIsPremium(data?.status === 'active');
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleAIEdit = async () => {
    if (!isPremium) {
      toast.error('AI editing is a premium feature');
      return;
    }

    if (!selectedText || !aiEditPrompt) {
      toast.error('Please select text and provide instructions');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/workflow/ai-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          instruction: aiEditPrompt,
          context: editedScript
        })
      });

      if (!response.ok) throw new Error('AI edit failed');

      const { editedText, creditsUsed } = await response.json();
      
      const newScript = editedScript.replace(selectedText, editedText);
      setEditedScript(newScript);
      setSelectedText('');
      setAiEditPrompt('');
      
      trackCredits(creditsUsed);
      toast.success('AI edit applied!');
    } catch (error) {
      toast.error('Failed to apply AI edit');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    if (text) {
      setSelectedText(text);
    }
  };

  const improveSection = async (type) => {
    if (!isPremium) {
      toast.error('This feature requires premium');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/workflow/improve-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: editedScript,
          improvementType: type
        })
      });

      if (!response.ok) throw new Error('Improvement failed');

      const { improvedScript, creditsUsed } = await response.json();
      
      setEditedScript(improvedScript);
      trackCredits(creditsUsed);
      toast.success(`Script ${type} improved!`);
    } catch (error) {
      toast.error('Failed to improve script');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    setGeneratedScript(editedScript);
    updateStepData('edit', { editedScript });
    markStepComplete(9);
    toast.success('Script saved!');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Edit Script
        </h2>
        <p className="text-gray-400">
          Refine and perfect your script with AI assistance
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Script Editor</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => goToStep(8)}
                  className="glass-button"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Draft
                </button>
                <button
                  onClick={handleSave}
                  className="glass-button bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
            
            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              onMouseUp={handleTextSelection}
              className="w-full h-[600px] px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
              placeholder="Your script content..."
            />

            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
              <div>
                Word count: {editedScript.split(' ').length}
              </div>
              <div>
                Est. duration: {Math.ceil(editedScript.split(' ').length / 150)} minutes
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {!isPremium && (
            <div className="glass-card p-4 bg-yellow-500/10 border border-yellow-500/50">
              <div className="flex items-center gap-2 text-yellow-400">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Premium Feature</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Upgrade to premium to unlock AI-powered editing features
              </p>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Edit Assistant
            </h3>

            {selectedText && (
              <div className="mb-4 p-3 bg-gray-800/50 rounded">
                <p className="text-xs text-gray-400 mb-1">Selected text:</p>
                <p className="text-sm text-white line-clamp-3">{selectedText}</p>
              </div>
            )}

            <textarea
              value={aiEditPrompt}
              onChange={(e) => setAiEditPrompt(e.target.value)}
              placeholder="How should I edit the selected text? (e.g., 'Make it more engaging', 'Add statistics', 'Simplify language')"
              className="w-full h-20 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none text-sm mb-3"
              disabled={!isPremium}
            />

            <button
              onClick={handleAIEdit}
              disabled={!isPremium || isProcessing || !selectedText || !aiEditPrompt}
              className="glass-button bg-purple-600 hover:bg-purple-700 w-full disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply AI Edit
                </>
              )}
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Improvements
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => improveSection('clarity')}
                disabled={!isPremium || isProcessing}
                className="glass-button w-full text-sm justify-start disabled:opacity-50"
              >
                Improve Clarity
              </button>
              <button
                onClick={() => improveSection('engagement')}
                disabled={!isPremium || isProcessing}
                className="glass-button w-full text-sm justify-start disabled:opacity-50"
              >
                Boost Engagement
              </button>
              <button
                onClick={() => improveSection('conciseness')}
                disabled={!isPremium || isProcessing}
                className="glass-button w-full text-sm justify-start disabled:opacity-50"
              >
                Make More Concise
              </button>
              <button
                onClick={() => improveSection('transitions')}
                disabled={!isPremium || isProcessing}
                className="glass-button w-full text-sm justify-start disabled:opacity-50"
              >
                Smooth Transitions
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Editing Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Select text to edit with AI</li>
              <li>• Keep paragraphs short for YouTube</li>
              <li>• Add timestamps for sections</li>
              <li>• Include visual cues in [brackets]</li>
              <li>• Use conversational tone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}