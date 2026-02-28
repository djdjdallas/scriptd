'use client';

import { useState } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Download, FileText, FileJson, Copy, Check, Printer, Film, Music } from 'lucide-react';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import ContentIdeaBanner from '../ContentIdeaBanner';

export default function ExportStep() {
  const { generatedScript, workflowData, markStepComplete } = useWorkflow();
  const [exportFormat, setExportFormat] = useState('txt');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(null);

  const exportFormats = [
    { id: 'txt', name: 'Plain Text', icon: FileText, description: 'Simple text format' },
    { id: 'markdown', name: 'Markdown', icon: FileText, description: 'Formatted with headers' },
    { id: 'pdf', name: 'PDF Document', icon: Printer, description: 'Print-ready format' },
    { id: 'docx', name: 'Word Document', icon: FileText, description: 'Microsoft Word' },
    { id: 'srt', name: 'SRT Subtitles', icon: Film, description: 'Subtitle file format' },
    { id: 'json', name: 'JSON', icon: FileJson, description: 'Structured data' }
  ];

  const handleExport = async (format) => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      const response = await fetch('/api/workflow/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: generatedScript,
          format,
          metadata: {
            title: workflowData.title?.selected || 'Untitled Script',
            topic: workflowData.summary?.topic,
            duration: Math.ceil(generatedScript.split(' ').length / 150),
            createdAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflowData.title?.selected || 'script'}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);

      markStepComplete(10);

      posthog.capture('script_exported', {
        export_format: format,
        word_count: generatedScript.split(' ').length,
        title: workflowData.title?.selected || 'Untitled',
      });

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export script');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async (format) => {
    let formattedScript = generatedScript;

    if (format === 'markdown') {
      formattedScript = `# ${workflowData.title?.selected || 'Script'}\n\n` +
        `**Topic:** ${workflowData.summary?.topic}\n` +
        `**Duration:** ${Math.ceil(generatedScript.split(' ').length / 150)} minutes\n\n` +
        `---\n\n${generatedScript}`;
    } else if (format === 'json') {
      formattedScript = JSON.stringify({
        title: workflowData.title?.selected,
        script: generatedScript,
        metadata: workflowData
      }, null, 2);
    }

    await navigator.clipboard.writeText(formattedScript);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
    toast.success('Copied to clipboard');
  };

  const getYouTubeDescription = () => {
    const sources = workflowData.research?.sources?.filter(s => s.is_starred) || [];
    const description = `${workflowData.summary?.topic || ''}

Timestamps:
${workflowData.contentPoints?.points?.map((point, index) => {
  const startTime = workflowData.contentPoints.points
    .slice(0, index)
    .reduce((acc, p) => acc + (p.duration || 60), 0);
  const minutes = Math.floor(startTime / 60);
  const seconds = startTime % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')} - ${point.title}`;
}).join('\n') || '0:00 - Introduction'}

${sources.length > 0 ? `\nSources:\n${sources.map(s => `• ${s.source_title}: ${s.source_url}`).join('\n')}` : ''}

#youtube #video #content`;
    
    return description;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Export Script
        </h2>
        <p className="text-gray-400">
          Download your script in various formats
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {exportFormats.map((format) => {
          const Icon = format.icon;
          return (
            <div
              key={format.id}
              className="glass-card p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className="h-6 w-6 text-purple-400" />
                <button
                  onClick={() => copyToClipboard(format.id)}
                  className="text-gray-400 hover:text-white"
                >
                  {copiedFormat === format.id ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {format.name}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {format.description}
              </p>
              <button
                onClick={() => handleExport(format.id)}
                disabled={isExporting && exportFormat === format.id}
                className="glass-button w-full text-xs"
              >
                {isExporting && exportFormat === format.id ? (
                  'Exporting...'
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            YouTube Description
          </h3>
          <textarea
            value={getYouTubeDescription()}
            readOnly
            className="w-full h-40 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white font-mono text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(getYouTubeDescription());
              toast.success('Description copied');
            }}
            className="glass-button mt-3"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Description
          </button>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Export Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Title:</span>
              <span className="text-white">{workflowData.title?.selected || 'Untitled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Word Count:</span>
              <span className="text-white">{generatedScript.split(' ').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Duration:</span>
              <span className="text-white">{Math.ceil(generatedScript.split(' ').length / 150)} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Content Points:</span>
              <span className="text-white">{workflowData.contentPoints?.points?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sources Used:</span>
              <span className="text-white">{workflowData.research?.sources?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}