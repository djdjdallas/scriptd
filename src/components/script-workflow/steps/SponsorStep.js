'use client';

import { useState, useEffect } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { DollarSign, Info, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function SponsorStep() {
  const {
    workflowData,
    updateStepData,
    markStepComplete,
    goToStep,
    workflowId
  } = useWorkflow();

  // State for sponsor information
  const [hasSponsor, setHasSponsor] = useState(false);
  const [sponsorData, setSponsorData] = useState({
    sponsor_name: '',
    sponsor_product: '',
    sponsor_cta: '',
    sponsor_key_points: [''],
    sponsor_duration: 30,
    placement_preference: 'auto',
    custom_placement_time: null,
    transition_style: 'natural',
    tone_match: true,
    include_disclosure: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [estimatedPlacement, setEstimatedPlacement] = useState(null);

  const supabase = createClient();

  // Load existing sponsor data if available
  useEffect(() => {
    const loadSponsorData = async () => {
      if (!workflowId) return;

      try {
        const { data, error } = await supabase
          .from('workflow_sponsors')
          .select('*')
          .eq('workflow_id', workflowId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading sponsor data:', error);
          return;
        }

        if (data) {
          setHasSponsor(true);
          setSponsorData(data);
        }
      } catch (error) {
        console.error('Error loading sponsor data:', error);
      }
    };

    loadSponsorData();
  }, [workflowId]);

  // Calculate estimated placement based on content points and preferences
  useEffect(() => {
    if (!hasSponsor || !workflowData.contentPoints?.points) return;

    const calculatePlacement = () => {
      const totalDuration = workflowData.summary?.targetDuration || 300; // Default 5 minutes
      const contentPoints = workflowData.contentPoints.points;

      let placementTime;
      let placementReason;

      switch (sponsorData.placement_preference) {
        case 'early':
          // Place after hook and intro (15-25% into video)
          placementTime = Math.floor(totalDuration * 0.20);
          placementReason = 'After hook, before main content';
          break;

        case 'mid':
          // Place in the middle (45-55% into video)
          placementTime = Math.floor(totalDuration * 0.50);
          placementReason = 'Midpoint of video';
          break;

        case 'late':
          // Place near end but before conclusion (75-85% into video)
          placementTime = Math.floor(totalDuration * 0.80);
          placementReason = 'Before conclusion';
          break;

        case 'custom':
          placementTime = sponsorData.custom_placement_time;
          placementReason = 'Custom placement';
          break;

        case 'auto':
        default:
          // AI-determined optimal placement (usually 25-35% into video)
          // This is the "sweet spot" - after viewer commitment, before main climax
          placementTime = Math.floor(totalDuration * 0.30);
          placementReason = 'AI-optimized for retention (30% mark)';
          break;
      }

      // Find which content point this falls under
      let currentTime = 0;
      let targetSection = null;

      for (let i = 0; i < contentPoints.length; i++) {
        const point = contentPoints[i];
        const pointDuration = parseInt(point.duration) || 60;

        if (currentTime <= placementTime && placementTime <= currentTime + pointDuration) {
          targetSection = {
            index: i,
            title: point.title,
            beforeOrAfter: placementTime - currentTime < pointDuration / 2 ? 'After' : 'Before'
          };
          break;
        }

        currentTime += pointDuration;
      }

      setEstimatedPlacement({
        time: placementTime,
        formattedTime: `${Math.floor(placementTime / 60)}:${(placementTime % 60).toString().padStart(2, '0')}`,
        reason: placementReason,
        section: targetSection
      });
    };

    calculatePlacement();
  }, [hasSponsor, sponsorData.placement_preference, sponsorData.custom_placement_time, workflowData]);

  const handleKeyPointChange = (index, value) => {
    const newKeyPoints = [...sponsorData.sponsor_key_points];
    newKeyPoints[index] = value;
    setSponsorData({ ...sponsorData, sponsor_key_points: newKeyPoints });
  };

  const addKeyPoint = () => {
    setSponsorData({
      ...sponsorData,
      sponsor_key_points: [...sponsorData.sponsor_key_points, '']
    });
  };

  const removeKeyPoint = (index) => {
    const newKeyPoints = sponsorData.sponsor_key_points.filter((_, i) => i !== index);
    setSponsorData({ ...sponsorData, sponsor_key_points: newKeyPoints });
  };

  const saveSponsorData = async () => {
    if (!workflowId) {
      toast.error('Workflow ID not found');
      return;
    }

    // Validation
    if (hasSponsor) {
      if (!sponsorData.sponsor_name.trim()) {
        toast.error('Please enter sponsor name');
        return;
      }
      if (!sponsorData.sponsor_product.trim()) {
        toast.error('Please enter product/service name');
        return;
      }
      if (!sponsorData.sponsor_cta.trim()) {
        toast.error('Please enter call-to-action');
        return;
      }
    }

    setIsSaving(true);

    try {
      if (hasSponsor) {
        // Clean up empty key points
        const cleanedKeyPoints = sponsorData.sponsor_key_points.filter(p => p.trim() !== '');

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error('User not authenticated');
          return;
        }

        // Upsert sponsor data
        const { error } = await supabase
          .from('workflow_sponsors')
          .upsert({
            workflow_id: workflowId,
            user_id: user.id,
            ...sponsorData,
            sponsor_key_points: cleanedKeyPoints,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'workflow_id'
          });

        if (error) throw error;

        // Update workflow context
        updateStepData('sponsor', {
          ...sponsorData,
          sponsor_key_points: cleanedKeyPoints,
          estimated_placement: estimatedPlacement
        });

        toast.success('Sponsor information saved');
      } else {
        // Delete sponsor data if user selected "no sponsor"
        const { error } = await supabase
          .from('workflow_sponsors')
          .delete()
          .eq('workflow_id', workflowId);

        if (error && error.code !== 'PGRST116') throw error;

        updateStepData('sponsor', null);
        toast.success('Sponsor removed');
      }

      // Mark step as complete and go to next step (Draft)
      markStepComplete(8); // Step 8 is the sponsor step
      goToStep(9); // Go to Draft step (step 9)
    } catch (error) {
      console.error('Error saving sponsor data:', error);
      toast.error('Failed to save sponsor information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Sponsor Integration
        </h2>
        <p className="text-gray-400">
          Add sponsor information to seamlessly integrate into your script
        </p>
      </div>

      {/* Has Sponsor Toggle */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Does this video have a sponsor?
              </h3>
              <p className="text-sm text-gray-400">
                We'll integrate it naturally into your script
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasSponsor}
              onChange={(e) => setHasSponsor(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {hasSponsor && (
        <>
          {/* Sponsor Details */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Sponsor Details
            </h3>

            <div className="space-y-4">
              {/* Sponsor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sponsor Name *
                </label>
                <input
                  type="text"
                  value={sponsorData.sponsor_name}
                  onChange={(e) => setSponsorData({ ...sponsorData, sponsor_name: e.target.value })}
                  placeholder="e.g., NordVPN, Skillshare, etc."
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Product/Service */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product/Service *
                </label>
                <input
                  type="text"
                  value={sponsorData.sponsor_product}
                  onChange={(e) => setSponsorData({ ...sponsorData, sponsor_product: e.target.value })}
                  placeholder="e.g., VPN service, online learning platform, etc."
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Call to Action */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Call to Action (CTA) *
                </label>
                <input
                  type="text"
                  value={sponsorData.sponsor_cta}
                  onChange={(e) => setSponsorData({ ...sponsorData, sponsor_cta: e.target.value })}
                  placeholder="e.g., Visit nordvpn.com/yourname for 70% off"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Key Points */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Points to Mention
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Specific features or benefits the sponsor wants highlighted
                </p>
                {sponsorData.sponsor_key_points.map((point, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handleKeyPointChange(index, e.target.value)}
                      placeholder={`Key point ${index + 1}`}
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {sponsorData.sponsor_key_points.length > 1 && (
                      <button
                        onClick={() => removeKeyPoint(index)}
                        className="glass-button text-red-400 hover:bg-red-900/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addKeyPoint}
                  className="glass-button text-sm mt-2"
                >
                  + Add Key Point
                </button>
              </div>

              {/* Sponsor Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Desired Duration (seconds)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={sponsorData.sponsor_duration}
                  onChange={(e) => setSponsorData({ ...sponsorData, sponsor_duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Most sponsors require 30-60 seconds
                </p>
              </div>
            </div>
          </div>

          {/* Placement Settings */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Placement Settings
            </h3>

            <div className="space-y-4">
              {/* Placement Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  When should the sponsor segment appear?
                </label>
                <select
                  value={sponsorData.placement_preference}
                  onChange={(e) => setSponsorData({ ...sponsorData, placement_preference: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="auto">Auto (AI-Optimized) - Recommended</option>
                  <option value="early">Early (After Hook)</option>
                  <option value="mid">Middle of Video</option>
                  <option value="late">Late (Before Conclusion)</option>
                  <option value="custom">Custom Time</option>
                </select>
              </div>

              {/* Custom Placement Time */}
              {sponsorData.placement_preference === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Placement Time (seconds from start)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={workflowData.summary?.targetDuration || 300}
                    value={sponsorData.custom_placement_time || 0}
                    onChange={(e) => setSponsorData({ ...sponsorData, custom_placement_time: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Estimated Placement Preview */}
              {estimatedPlacement && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">
                        Estimated Placement
                      </h4>
                      <p className="text-sm text-gray-300">
                        <span className="font-mono text-purple-400">{estimatedPlacement.formattedTime}</span> - {estimatedPlacement.reason}
                      </p>
                      {estimatedPlacement.section && (
                        <p className="text-xs text-gray-400 mt-1">
                          {estimatedPlacement.section.beforeOrAfter} "{estimatedPlacement.section.title}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Transition Style */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transition Style
                </label>
                <select
                  value={sponsorData.transition_style}
                  onChange={(e) => setSponsorData({ ...sponsorData, transition_style: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="natural">Natural (Smooth segue)</option>
                  <option value="direct">Direct (Quick transition)</option>
                  <option value="segue">Segue (Thematic bridge)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {sponsorData.transition_style === 'natural' && 'Smoothly connects sponsor to surrounding content'}
                  {sponsorData.transition_style === 'direct' && 'Quick, straightforward transition to sponsor'}
                  {sponsorData.transition_style === 'segue' && 'Creates thematic connection between content and sponsor'}
                </p>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sponsorData.tone_match}
                    onChange={(e) => setSponsorData({ ...sponsorData, tone_match: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">
                    Match sponsor tone to overall script style
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sponsorData.include_disclosure}
                    onChange={(e) => setSponsorData({ ...sponsorData, include_disclosure: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">
                    Include sponsorship disclosure (FTC compliant)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold mb-1">How AI Integration Works:</p>
                <ul className="space-y-1 text-xs">
                  <li>• AI analyzes your content structure and flow</li>
                  <li>• Finds the optimal placement based on retention data</li>
                  <li>• Creates smooth transitions that feel natural</li>
                  <li>• Ensures all sponsor requirements are met</li>
                  <li>• Maintains your script's tone and pacing</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => goToStep(7)}
          className="glass-button"
        >
          Back to Content Points
        </button>
        <button
          onClick={saveSponsorData}
          disabled={isSaving}
          className="glass-button bg-purple-600 hover:bg-purple-700"
        >
          {isSaving ? 'Saving...' : 'Continue to Script Generation'}
        </button>
      </div>
    </div>
  );
}
