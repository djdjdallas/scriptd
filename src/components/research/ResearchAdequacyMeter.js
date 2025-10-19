'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Upload, Search } from 'lucide-react';

/**
 * ResearchAdequacyMeter Component
 *
 * Displays research quality and adequacy for long-form content (35+ minutes)
 */
export default function ResearchAdequacyMeter({
  researchScore,
  targetDuration,
  currentSources = [],
  onEnhanceClick,
  onUploadClick
}) {
  const [adequacyPercent, setAdequacyPercent] = useState(0);
  const [status, setStatus] = useState('insufficient');
  const [requirements, setRequirements] = useState({});

  useEffect(() => {
    if (!researchScore) return;

    // Calculate percentage based on score
    const percent = Math.floor(researchScore.overallScore * 100);
    setAdequacyPercent(percent);

    // Determine status
    if (percent >= 80) setStatus('excellent');
    else if (percent >= 70) setStatus('good');
    else if (percent >= 50) setStatus('adequate');
    else setStatus('insufficient');

    // Set requirements
    setRequirements(researchScore.requirements || {});
  }, [researchScore]);

  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-green-400 border-green-500/50 bg-green-500/10';
      case 'good': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      case 'adequate': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      default: return 'text-red-400 border-red-500/50 bg-red-500/10';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'excellent': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'good': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'adequate': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-r from-red-500 to-pink-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-5 w-5" />;
      case 'adequate':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'excellent':
        return 'Research quality is excellent for high-quality generation';
      case 'good':
        return 'Research quality is good, generation will proceed smoothly';
      case 'adequate':
        return 'Research meets minimum requirements, but additional sources recommended';
      default:
        return 'Research insufficient for long-form content - please add more sources';
    }
  };

  const getRecommendations = () => {
    if (!researchScore || !researchScore.current) return [];

    const recs = [];
    const current = researchScore.current;

    if (current.words < requirements.minWords) {
      recs.push({
        icon: <Upload className="h-4 w-4" />,
        text: `Add ${Math.ceil((requirements.minWords - current.words) / 500)} more comprehensive sources`,
        action: onUploadClick,
        actionLabel: 'Upload Documents'
      });
    }

    if (current.sources < requirements.minSources) {
      recs.push({
        icon: <Search className="h-4 w-4" />,
        text: `Need ${requirements.minSources - current.sources} more research sources`,
        action: onEnhanceClick,
        actionLabel: 'Enhanced Research'
      });
    }

    if (current.quality < requirements.minQuality && recs.length < 2) {
      recs.push({
        icon: <TrendingUp className="h-4 w-4" />,
        text: 'Add higher-quality sources (synthesis, starred documents)',
        action: onEnhanceClick,
        actionLabel: 'Enhance Research'
      });
    }

    return recs;
  };

  const durationMinutes = Math.ceil(targetDuration / 60);

  if (durationMinutes < 35) {
    return null; // Don't show for shorter videos
  }

  return (
    <div className="bg-black/50 border border-purple-500/30 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor()} border`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Research Adequacy for {durationMinutes}-Minute Video
            </h3>
            <p className="text-sm text-gray-400">
              {getStatusMessage()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{adequacyPercent}%</div>
          <div className="text-xs text-gray-500 uppercase">{status}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(100, adequacyPercent)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Insufficient</span>
          <span>Adequate (70%)</span>
          <span>Excellent (80%+)</span>
        </div>
      </div>

      {/* Metrics Grid */}
      {researchScore && researchScore.current && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Words</div>
            <div className="text-2xl font-bold text-white">
              {researchScore.current.words.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Need: {requirements.minWords?.toLocaleString()}
            </div>
          </div>

          <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Sources</div>
            <div className="text-2xl font-bold text-white">
              {researchScore.current.sources}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Need: {requirements.minSources}
            </div>
          </div>

          <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Avg Quality</div>
            <div className="text-2xl font-bold text-white">
              {(researchScore.current.quality * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Need: {(requirements.minQuality * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Source Breakdown */}
      {researchScore && researchScore.breakdown && (
        <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4 mb-4">
          <div className="text-sm font-medium text-gray-300 mb-3">Source Breakdown</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {researchScore.breakdown.synthesis}
              </div>
              <div className="text-xs text-gray-500">Synthesis</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {researchScore.breakdown.documents}
              </div>
              <div className="text-xs text-gray-500">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">
                {researchScore.breakdown.web}
              </div>
              <div className="text-xs text-gray-500">Web</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {researchScore.breakdown.verified}
              </div>
              <div className="text-xs text-gray-500">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {researchScore.breakdown.starred}
              </div>
              <div className="text-xs text-gray-500">Starred</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {status !== 'excellent' && getRecommendations().length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Recommendations to Improve Research Quality
          </div>
          <div className="space-y-2">
            {getRecommendations().map((rec, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-yellow-400">{rec.icon}</span>
                  {rec.text}
                </div>
                {rec.action && (
                  <button
                    onClick={rec.action}
                    className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 hover:bg-yellow-500/30 transition-colors text-xs"
                  >
                    {rec.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
