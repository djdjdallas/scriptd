'use client';

import { Save, Coins, ChevronLeft, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkflowHeader({ title, isSaving, creditsUsed, targetDuration, currentDuration }) {
  const router = useRouter();
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationStatus = () => {
    if (!targetDuration || !currentDuration) return 'neutral';
    const ratio = currentDuration / targetDuration;
    if (ratio <= 1.1) return 'good';
    if (ratio <= 1.3) return 'warning';
    return 'over';
  };

  return (
    <div className="border-b border-gray-800 px-6 py-4 bg-gray-900/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/scripts')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-white">
              {title || 'Untitled Script'}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                {isSaving ? (
                  <>
                    <Save className="h-3 w-3 animate-pulse" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    <span>Saved</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-purple-400">
                <Coins className="h-3 w-3" />
                <span>{creditsUsed} credits used</span>
              </div>
              
              {targetDuration && (
                <div className={`flex items-center gap-1 text-sm ${
                  getDurationStatus() === 'good' ? 'text-green-400' :
                  getDurationStatus() === 'warning' ? 'text-yellow-400' :
                  getDurationStatus() === 'over' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDuration(currentDuration || 0)} / {formatDuration(targetDuration)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/scripts')}
            className="glass-button text-sm"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
}