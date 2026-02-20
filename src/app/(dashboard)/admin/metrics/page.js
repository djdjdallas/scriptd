'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw, Database, TrendingUp } from 'lucide-react';

export default function MetricsAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const collectMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/collect-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Metrics collected: ${data.result?.metrics?.channelsCollected || 0} channels, ${data.result?.metrics?.topicsCollected || 0} topics`);
        setResult(data.result);
      } else {
        toast.error(data.error || 'Failed to collect metrics');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to trigger metrics collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-white flex items-center gap-2">
          <Database className="h-8 w-8 text-violet-400" />
          Metrics Collection Admin
        </h1>
        <p className="text-gray-400 mt-2">
          Manually trigger historical data collection for trending analytics
        </p>
      </div>

      <div className="vb-card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold font-display text-white mb-2">Manual Collection</h2>
          <p className="text-gray-400 text-sm mb-4">
            This will fetch current trending data from YouTube and store it for historical tracking.
            Run this every 6-12 hours to build up historical data for growth calculations.
          </p>
          
          <Button
            onClick={collectMetrics}
            disabled={loading}
            className="vb-btn-primary bg-gradient-to-r from-violet-600 to-cyan-600 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Collecting...' : 'Collect Metrics Now'}
          </Button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-white/[0.04] border border-white/[0.06] rounded-xl">
            <h3 className="text-lg font-semibold font-display text-white mb-2">Last Collection Result</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Topics Collected:</span>
                <span className="text-white">{result.metrics?.topicsCollected || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Channels Collected:</span>
                <span className="text-white">{result.metrics?.channelsCollected || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-white">
                  {result.metrics?.timestamp ? new Date(result.metrics.timestamp).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-semibold font-display">Why is growth showing "N/A"?</h3>
              <p className="text-yellow-200/80 text-sm mt-1">
                Growth calculations require historical data. You need to:
              </p>
              <ol className="text-yellow-200/80 text-sm mt-2 space-y-1 list-decimal list-inside">
                <li>Run this collection now to establish a baseline</li>
                <li>Wait 6-12 hours and run it again</li>
                <li>After 2-3 collections, growth data will appear</li>
              </ol>
              <p className="text-yellow-200/80 text-sm mt-2">
                The more frequently you collect (every 6 hours is ideal), the more accurate the growth tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/[0.04] border border-white/[0.06] rounded-xl">
          <h3 className="text-lg font-semibold font-display text-white mb-2">Automation Setup</h3>
          <p className="text-gray-400 text-sm">
            For automatic collection, you can:
          </p>
          <ul className="text-gray-400 text-sm mt-2 space-y-2">
            <li>• <strong className="text-white">Vercel:</strong> Deploy with vercel.json cron configuration</li>
            <li>• <strong className="text-white">GitHub Actions:</strong> Set up a scheduled workflow</li>
            <li>• <strong className="text-white">External Service:</strong> Use cron-job.org or similar to call the endpoint</li>
            <li>• <strong className="text-white">Self-hosted:</strong> Set up a system cron job on your server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}