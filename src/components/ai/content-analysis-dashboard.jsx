'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

export function ContentAnalysisDashboard({ channelId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/content-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      setAnalysis(data.analysis);
      toast.success('Content analysis complete!');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to analyze content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            AI Content Analysis
          </h2>
          <p className="text-gray-400 mt-1">
            Deep insights into your content quality and performance
          </p>
        </div>
        <Button
          onClick={analyzeContent}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {loading ? 'Analyzing...' : 'Analyze Content'}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
              </div>
              <p className="text-center text-gray-400">
                Analyzing your content with AI...
              </p>
              <Progress value={33} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Content Patterns Card - Expanded */}
          <Card className="bg-gray-900 border-gray-800 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Content Patterns & Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Content Patterns */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-3">Content Pillars</h4>
                    <div className="space-y-2">
                      {analysis.contentPatterns?.contentPillars?.map((pillar, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                          <span className="text-sm text-gray-300">{pillar}</span>
                          <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-3">Primary Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.contentPatterns?.primaryThemes?.map((theme, i) => (
                        <span key={i} className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Best Performing Formats</h4>
                    <ul className="space-y-1">
                      {analysis.contentPatterns?.bestPerformingFormats?.map((format, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                          <span className="text-green-400">↑</span>
                          {format}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Right Column - Quality Metrics */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/30 p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Storytelling</p>
                      <p className="text-lg font-bold text-white">
                        {analysis.contentQuality?.storytelling}/100
                      </p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Educational</p>
                      <p className="text-lg font-bold text-white">
                        {analysis.contentQuality?.educationalValue}/100
                      </p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Entertainment</p>
                      <p className="text-lg font-bold text-white">
                        {analysis.contentQuality?.entertainmentValue}/100
                      </p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">Uniqueness</p>
                      <p className="text-lg font-bold text-white">
                        {analysis.contentQuality?.uniqueness}/100
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Production Value</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        analysis.contentQuality?.productionValue === 'High' ? 'bg-green-900/30 text-green-400' :
                        analysis.contentQuality?.productionValue === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {analysis.contentQuality?.productionValue}
                      </span>
                      <span className={`text-xs ${
                        analysis.contentQuality?.qualityTrend === 'Improving' ? 'text-green-400' :
                        analysis.contentQuality?.qualityTrend === 'Declining' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {analysis.contentQuality?.qualityTrend === 'Improving' ? '↑ Improving' :
                         analysis.contentQuality?.qualityTrend === 'Declining' ? '↓ Declining' :
                         '→ Stable'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Optimal Video Length</p>
                    <p className="text-sm text-white font-medium">
                      {analysis.contentPatterns?.optimalLength || '10-15 minutes'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Position Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Competitive Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Niche Saturation</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      analysis.competitivePosition?.nicheSaturation === 'Low' ? 'bg-green-900/30 text-green-400' :
                      analysis.competitivePosition?.nicheSaturation === 'High' ? 'bg-red-900/30 text-red-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {analysis.competitivePosition?.nicheSaturation}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-2">Unique Value</p>
                  <p className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">
                    {analysis.competitivePosition?.uniqueValueProposition}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-2">Market Gaps</p>
                  <ul className="space-y-1">
                    {analysis.competitivePosition?.marketGaps?.slice(0, 3).map((gap, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-2">Competitive Advantages</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.competitivePosition?.competitiveAdvantages?.map((adv, i) => (
                      <span key={i} className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        {adv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Analytics Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Predictive Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Growth Trajectory</p>
                    <p className={`text-sm font-medium ${
                      analysis.predictiveAnalytics?.growthTrajectory === 'Rapid' ? 'text-green-400' :
                      analysis.predictiveAnalytics?.growthTrajectory === 'Steady' ? 'text-blue-400' :
                      analysis.predictiveAnalytics?.growthTrajectory === 'Slow' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {analysis.predictiveAnalytics?.growthTrajectory}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Est. Growth</p>
                    <p className="text-sm font-medium text-white">
                      {analysis.predictiveAnalytics?.estimatedGrowthRate}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-2">Opportunities</p>
                  <ul className="space-y-1">
                    {analysis.predictiveAnalytics?.opportunities?.slice(0, 2).map((opp, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">↑</span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-2">Risk Factors</p>
                  <ul className="space-y-1">
                    {analysis.predictiveAnalytics?.riskFactors?.slice(0, 2).map((risk, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                        <span className="text-red-400 mt-0.5">!</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Card - Enhanced */}
          <Card className="bg-gray-900 border-gray-800 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Priority Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Immediate High Impact */}
                  <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <h4 className="text-sm font-semibold text-purple-400">Quick Wins (This Week)</h4>
                    </div>
                    <ul className="space-y-2">
                      {analysis.recommendations?.immediate?.slice(0, 3).map((action, i) => (
                        <li key={i} className="text-sm text-gray-300">
                          <div className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <div>
                              <p className="text-white font-medium text-xs mb-1">{action}</p>
                              <p className="text-xs text-gray-400">
                                {i === 0 && "Expected: +15% engagement"}
                                {i === 1 && "Expected: +10% retention"}
                                {i === 2 && "Expected: +20% CTR"}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Growth Opportunities */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <h4 className="text-sm font-semibold text-blue-400">Growth Tactics (30 Days)</h4>
                    </div>
                    <ul className="space-y-2">
                      {analysis.recommendations?.shortTerm?.slice(0, 3).map((action, i) => (
                        <li key={i} className="text-sm text-gray-300">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <div>
                              <p className="text-white font-medium text-xs mb-1">{action}</p>
                              <p className="text-xs text-gray-400">
                                {i === 0 && "Impact: Subscriber growth"}
                                {i === 1 && "Impact: Watch time boost"}
                                {i === 2 && "Impact: Algorithm favor"}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Strategic Initiatives */}
                  <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 rounded-lg p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <h4 className="text-sm font-semibold text-green-400">Strategic Goals (Quarter)</h4>
                    </div>
                    <ul className="space-y-2">
                      {analysis.recommendations?.longTerm?.slice(0, 3).map((action, i) => (
                        <li key={i} className="text-sm text-gray-300">
                          <div className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <div>
                              <p className="text-white font-medium text-xs mb-1">{action}</p>
                              <p className="text-xs text-gray-400">
                                {i === 0 && "Goal: 2x audience size"}
                                {i === 1 && "Goal: Revenue stream"}
                                {i === 2 && "Goal: Brand authority"}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Content Focus Areas */}
                <div className="border-t border-gray-800 pt-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Content Focus Areas</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-red-400">Stop/Reduce</span>
                        <span className="text-xs text-gray-400">Low performing</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.recommendations?.contentToAvoid?.slice(0, 3).map((type, i) => (
                          <span key={i} className="text-xs bg-red-900/20 text-red-300 px-2 py-1 rounded">
                            {type}
                          </span>
                        )) || (
                          <>
                            <span className="text-xs bg-red-900/20 text-red-300 px-2 py-1 rounded">
                              Long intros (&gt;15s)
                            </span>
                            <span className="text-xs bg-red-900/20 text-red-300 px-2 py-1 rounded">
                              Generic thumbnails
                            </span>
                            <span className="text-xs bg-red-900/20 text-red-300 px-2 py-1 rounded">
                              Clickbait titles
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-green-400">Double Down</span>
                        <span className="text-xs text-gray-400">High performing</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.recommendations?.contentToDouble?.slice(0, 3).map((type, i) => (
                          <span key={i} className="text-xs bg-green-900/20 text-green-300 px-2 py-1 rounded">
                            {type}
                          </span>
                        )) || (
                          <>
                            <span className="text-xs bg-green-900/20 text-green-300 px-2 py-1 rounded">
                              Tutorial content
                            </span>
                            <span className="text-xs bg-green-900/20 text-green-300 px-2 py-1 rounded">
                              Series format
                            </span>
                            <span className="text-xs bg-green-900/20 text-green-300 px-2 py-1 rounded">
                              Community posts
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}