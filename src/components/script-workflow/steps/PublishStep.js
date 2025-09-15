'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Send, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function PublishStep() {
  const { workflowData, completedSteps, markStepComplete } = useWorkflow();
  const [publishNotes, setPublishNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const checklist = [
    {
      id: 'title',
      label: 'Title optimized for CTR',
      completed: completedSteps.includes(4),
      required: true
    },
    {
      id: 'thumbnail',
      label: 'Thumbnail concept created',
      completed: completedSteps.includes(5),
      required: true
    },
    {
      id: 'script',
      label: 'Script generated and edited',
      completed: completedSteps.includes(8) && completedSteps.includes(9),
      required: true
    },
    {
      id: 'hook',
      label: 'Compelling opening hook',
      completed: completedSteps.includes(6),
      required: true
    },
    {
      id: 'export',
      label: 'Script exported',
      completed: completedSteps.includes(10),
      required: false
    },
    {
      id: 'research',
      label: 'Sources fact-checked',
      completed: workflowData.research?.sources?.some(s => s.fact_check_status === 'verified'),
      required: false
    },
    {
      id: 'description',
      label: 'YouTube description ready',
      completed: completedSteps.includes(10),
      required: false
    },
    {
      id: 'tags',
      label: 'Tags and keywords prepared',
      completed: workflowData.research?.keywords?.length > 0,
      required: false
    }
  ];

  const getChecklistIcon = (item) => {
    if (item.completed) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else if (item.required) {
      return <XCircle className="h-5 w-5 text-red-400" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    }
  };

  const allRequiredComplete = checklist.filter(item => item.required).every(item => item.completed);
  const completionPercentage = Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100);

  const handlePublish = () => {
    if (!allRequiredComplete) {
      toast.error('Please complete all required items');
      return;
    }

    markStepComplete(11);
    toast.success('Workflow completed! Your script is ready to publish.');
  };

  const copyPublishingData = () => {
    const data = {
      title: workflowData.title?.selected,
      description: getYouTubeDescription(),
      tags: workflowData.research?.keywords || [],
      thumbnail: workflowData.thumbnail,
      scheduledFor: scheduledDate && scheduledTime ? `${scheduledDate} ${scheduledTime}` : null,
      notes: publishNotes
    };

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Publishing data copied to clipboard');
  };

  const getYouTubeDescription = () => {
    const sources = workflowData.research?.sources?.filter(s => s.is_starred) || [];
    return `${workflowData.summary?.topic || ''}

${sources.length > 0 ? `\nSources:\n${sources.map(s => `• ${s.source_title}: ${s.source_url}`).join('\n')}` : ''}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Publish Checklist
        </h2>
        <p className="text-gray-400">
          Final review before publishing your video
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Pre-Publishing Checklist
              </h3>
              <div className="text-sm text-gray-400">
                {completionPercentage}% Complete
              </div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    item.completed 
                      ? 'bg-green-500/10' 
                      : item.required 
                      ? 'bg-red-500/10' 
                      : 'bg-yellow-500/10'
                  }`}
                >
                  {getChecklistIcon(item)}
                  <span className={`text-sm ${item.completed ? 'text-white' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                  {item.required && (
                    <span className="ml-auto text-xs text-gray-500">Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Schedule Publishing
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Publishing Notes
            </h3>
            <textarea
              value={publishNotes}
              onChange={(e) => setPublishNotes(e.target.value)}
              placeholder="Add any notes or reminders for publishing..."
              className="w-full h-24 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={copyPublishingData}
                className="glass-button w-full text-sm justify-start"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Publishing Data
              </button>
              <a
                href="https://studio.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button w-full text-sm justify-start inline-flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open YouTube Studio
              </a>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Video Details
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Title:</span>
                <p className="text-white mt-1">{workflowData.title?.selected || 'Not set'}</p>
              </div>
              <div className="mt-3">
                <span className="text-gray-400">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {workflowData.research?.keywords?.map((keyword) => (
                    <span key={keyword} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                      {keyword}
                    </span>
                  )) || <span className="text-gray-500 text-xs">No tags set</span>}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={!allRequiredComplete}
            className={`glass-button w-full py-4 text-lg font-semibold ${
              allRequiredComplete 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
          >
            {allRequiredComplete ? (
              <>
                <Send className="h-5 w-5 mr-2" />
                Complete Workflow
              </>
            ) : (
              'Complete Required Items'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}