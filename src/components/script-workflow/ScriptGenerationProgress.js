'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ScriptGenerationProgress Component
 *
 * Polls job status and displays real-time progress for async script generation
 *
 * Props:
 * - jobId: The job ID to poll
 * - onComplete: Callback when generation completes successfully
 * - onError: Callback when generation fails
 */
export default function ScriptGenerationProgress({ jobId, onComplete, onError }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Poll job status every 10 seconds
  useEffect(() => {
    if (!jobId) return;

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/workflow/job-status/${jobId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const data = await response.json();

        if (data.success && data.job) {
          setJob(data.job);
          setLoading(false);

          // Handle job completion
          if (data.job.status === 'completed') {
            console.log('✅ Script generation completed!');
            if (onComplete) {
              onComplete(data.job);
            }
          }

          // Handle job failure
          if (data.job.status === 'failed') {
            console.error('❌ Script generation failed:', data.job.error_message);
            setError(data.job.error_message || 'Script generation failed');
            if (onError) {
              onError(data.job);
            }
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        setError(err.message);
      }
    };

    // Poll immediately
    pollJobStatus();

    // Then poll every 10 seconds if job is not complete
    const interval = setInterval(() => {
      if (job?.status !== 'completed' && job?.status !== 'failed') {
        pollJobStatus();
      } else {
        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [jobId, job?.status, onComplete, onError]);

  // Cancel job
  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/workflow/job-status/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });

      if (response.ok) {
        toast.success('Script generation cancelled');
        setJob(prev => ({ ...prev, status: 'cancelled' }));
      } else {
        toast.error('Failed to cancel generation');
      }
    } catch (err) {
      console.error('Error cancelling job:', err);
      toast.error('Failed to cancel generation');
    }
  };

  if (loading && !job) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
          <p className="text-gray-300">Loading generation status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/30">
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Generation Failed</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  // Render based on job status
  const renderStatus = () => {
    switch (job.status) {
      case 'pending':
        return (
          <div className="glass-card p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Queued for Generation</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Your script is queued. Generation will start shortly...
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Position in queue: Waiting</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="glass-card p-6">
            <div className="flex items-start gap-3">
              <Loader2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">Generating Script</h3>
                  <span className="text-sm text-purple-400 font-semibold">{job.progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>

                {/* Current step */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    {job.current_step ? `Step: ${job.current_step}` : 'Processing...'}
                  </p>

                  {job.total_chunks > 0 && (
                    <p className="text-xs text-gray-500">
                      Chunk {job.current_chunk} of {job.total_chunks}
                    </p>
                  )}

                  {/* Estimated time remaining */}
                  {job.started_at && (
                    <p className="text-xs text-gray-500">
                      Started {Math.round((Date.now() - new Date(job.started_at).getTime()) / 1000)}s ago
                    </p>
                  )}
                </div>

                {/* Cancel button */}
                <button
                  onClick={handleCancel}
                  className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel Generation
                </button>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="glass-card p-6 border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Script Generated Successfully!</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Your script is ready. You can now review and edit it.
                </p>
                {job.processing_time_seconds && (
                  <p className="text-xs text-gray-500">
                    Generated in {job.processing_time_seconds}s
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="glass-card p-6 border-red-500/30">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Generation Failed</h3>
                <p className="text-sm text-gray-400 mb-2">
                  {job.error_message || 'An error occurred during script generation'}
                </p>
                {job.retry_count > 0 && (
                  <p className="text-xs text-gray-500">
                    Retried {job.retry_count} time(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'cancelled':
        return (
          <div className="glass-card p-6 border-gray-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Generation Cancelled</h3>
                <p className="text-sm text-gray-400">
                  Script generation was cancelled.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStatus();
}
