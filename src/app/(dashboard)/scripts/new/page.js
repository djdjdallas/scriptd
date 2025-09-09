'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  FileText,
  Brain,
  Wand2,
  Target,
  Hash,
  Plus,
  X,
  Zap,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Lock,
  Crown
} from 'lucide-react';
import { SCRIPT_TYPES, SCRIPT_LENGTHS, AI_MODELS, CREDIT_COSTS, PREMIUM_AI_MODELS } from '@/lib/constants';
import { getKeyPointRecommendations, filterNewRecommendations } from '@/lib/key-points-recommendations';
import { hasAccessToModel, isPremiumModel, getMinimumTierForModel, getTierDisplayName } from '@/lib/subscription-helpers';

const STEPS = [
  { 
    id: 'basics', 
    title: 'Basic Information', 
    description: 'Title and video type',
    icon: FileText,
    color: 'from-purple-500/20'
  },
  { 
    id: 'details', 
    title: 'Video Details', 
    description: 'Length, tone, and audience',
    icon: Target,
    color: 'from-pink-500/20'
  },
  { 
    id: 'content', 
    title: 'Content Points', 
    description: 'Key topics to cover',
    icon: Hash,
    color: 'from-blue-500/20'
  },
  { 
    id: 'settings', 
    title: 'AI Settings', 
    description: 'Model and voice options',
    icon: Brain,
    color: 'from-green-500/20'
  },
  { 
    id: 'review', 
    title: 'Review & Generate', 
    description: 'Confirm your choices',
    icon: CheckCircle2,
    color: 'from-yellow-500/20'
  }
];

export default function NewScriptPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userData, setUserData] = useState({
    credits: 0,
    channels: [],
    voiceProfiles: [],
    subscriptionTier: 'free'
  });
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    length: 'MEDIUM',
    tone: 'professional',
    targetAudience: 'general',
    keyPoints: [''],
    model: AI_MODELS.GPT4_TURBO,
    channelId: '',
    voiceProfileId: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userResponse, channelsResponse, voiceResponse] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/channels'),
        fetch('/api/voice')
      ]);

      const userData = await userResponse.json();
      const channelsData = await channelsResponse.json();
      const voiceData = await voiceResponse.json();

      setUserData({
        credits: userData.data?.credits || 0,
        channels: channelsData.data || [],
        voiceProfiles: voiceData.data || [],
        subscriptionTier: userData.data?.subscription_tier || 'free'
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, '']
    }));
  };

  const updateKeyPoint = (index, value) => {
    const newKeyPoints = [...formData.keyPoints];
    newKeyPoints[index] = value;
    setFormData(prev => ({ ...prev, keyPoints: newKeyPoints }));
  };

  const removeKeyPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  const generateRecommendations = () => {
    // Get recommendations based on current form data
    const recs = getKeyPointRecommendations(formData);
    // Filter out any that are already in key points
    const filtered = filterNewRecommendations(recs, formData.keyPoints);
    setRecommendations(filtered);
    setShowRecommendations(true);
  };

  const addRecommendation = (recommendation) => {
    // Find the first empty key point or add a new one
    const emptyIndex = formData.keyPoints.findIndex(point => !point.trim());
    
    if (emptyIndex !== -1) {
      // Replace empty key point
      const newKeyPoints = [...formData.keyPoints];
      newKeyPoints[emptyIndex] = recommendation;
      setFormData(prev => ({ ...prev, keyPoints: newKeyPoints }));
    } else {
      // Add as new key point
      setFormData(prev => ({
        ...prev,
        keyPoints: [...prev.keyPoints, recommendation]
      }));
    }
    
    // Remove this recommendation from the list
    setRecommendations(prev => prev.filter(r => r !== recommendation));
    
    // Hide recommendations if none left
    if (recommendations.length <= 1) {
      setShowRecommendations(false);
    }
  };

  const creditCost = CREDIT_COSTS.SCRIPT_GENERATION[formData.model] || 10;
  const canGenerate = userData.credits >= creditCost;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditCost} credits to generate a script. You have ${userData.credits}.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convert length from key to actual minutes value
      const lengthMinutes = SCRIPT_LENGTHS[formData.length]?.min || 10;
      
      const requestBody = {
        ...formData,
        length: lengthMinutes, // Send as number
        keyPoints: formData.keyPoints.filter(p => p.trim())
      };
      
      console.log('Sending script generation request:', requestBody);
      
      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate script';
        try {
          const error = await response.json();
          console.error('Script generation failed:', error);
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      toast({
        title: "Script Generated!",
        description: "Your script has been created successfully."
      });

      router.push(`/scripts/${data.scriptId}`);
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.type;
      case 1:
        return formData.length && formData.tone && formData.targetAudience;
      case 2:
        return formData.keyPoints.some(p => p.trim());
      case 3:
        return formData.model;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <Wand2 className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
          <p className="mt-4 text-gray-300">Loading wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Wand2 className="h-10 w-10 text-purple-400 neon-glow" />
          Create New Script
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Generate AI-powered scripts in your unique voice
        </p>
      </div>

      {/* Credit Balance */}
      <div className="glass-card p-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-gray-300">Credit Balance:</span>
            <span className="text-xl font-bold gradient-text">{userData.credits}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Cost:</span>
            <Badge className="glass border-purple-400/50 text-purple-300">
              {creditCost} credits
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  index < STEPS.length - 1 ? 'flex-1' : ''
                }`}>
                  <div className={`w-12 h-12 glass rounded-xl flex items-center justify-center mb-2 transition-all ${
                    isActive ? 'scale-110 bg-gradient-to-br ' + step.color + ' to-transparent' : ''
                  } ${isCompleted ? 'bg-green-500/20' : ''}`}>
                    {isCompleted ? (
                      <Check className="h-6 w-6 text-green-400" />
                    ) : (
                      <Icon className={`h-6 w-6 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <p className={`text-xs ${
                    isActive ? 'text-white font-medium' : 'text-gray-400'
                  }`}>{step.title}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 mb-8 ${
                    isCompleted ? 'bg-green-400/50' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <Progress value={(currentStep + 1) / STEPS.length * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <div>
        <div className="glass-card p-8 animate-reveal" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-semibold text-white mb-2">{STEPS[currentStep].title}</h2>
          <p className="text-gray-400 mb-6">{STEPS[currentStep].description}</p>

          {/* Step 1: Basics */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">Script Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Enter your video title..."
                  className="glass-input text-white mt-2"
                />
              </div>

              <div>
                <Label className="text-gray-300">Video Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {Object.entries(SCRIPT_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => updateFormData('type', value)}
                      className={`glass-button py-3 px-4 text-sm transition-all ${
                        formData.type === value
                          ? 'bg-purple-500/20 text-white ring-2 ring-purple-400'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="length" className="text-gray-300">Video Length (minutes)</Label>
                <Select value={formData.length} onValueChange={(value) => updateFormData('length', value)}>
                  <SelectTrigger className="w-full px-3 py-2 mt-2 text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 [&>span]:text-white">
                    <SelectValue placeholder="Select video length" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border border-white/20 [&_*]:text-white">
                    {Object.entries(SCRIPT_LENGTHS).map(([key, value]) => (
                      <SelectItem key={key} value={key} className="text-gray-300 hover:text-white hover:bg-white/20 focus:bg-white/20 focus:text-white cursor-pointer py-2 px-3">
                        {value.label} - {value.credits} credits
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.length && (
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-400" />
                      {SCRIPT_LENGTHS[formData.length].tokens}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      {SCRIPT_LENGTHS[formData.length].credits} credits
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-gray-300">Tone</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['professional', 'casual', 'educational', 'entertaining'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => updateFormData('tone', tone)}
                      className={`glass-button py-3 px-4 text-sm capitalize transition-all ${
                        formData.tone === tone
                          ? 'bg-purple-500/20 text-white ring-2 ring-purple-400'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="audience" className="text-gray-300">Target Audience</Label>
                <Input
                  id="audience"
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                  placeholder="e.g., Developers, Students, Entrepreneurs..."
                  className="glass-input text-white mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 3: Content */}
          {currentStep === 2 && (
            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-gray-300">Key Points to Cover</Label>
                    <p className="text-sm text-gray-400 mt-1">Add the main topics you want to include in your script</p>
                  </div>
                  {formData.title && formData.type && (
                    <Button
                      onClick={generateRecommendations}
                      className="glass-button bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-white border-yellow-400/50"
                      variant="outline"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Suggestions
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {formData.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) => updateKeyPoint(index, e.target.value)}
                        placeholder={`Key point ${index + 1}...`}
                        className="glass-input text-white"
                      />
                      {formData.keyPoints.length > 1 && (
                        <Button
                          onClick={() => removeKeyPoint(index)}
                          className="glass-button hover:bg-red-500/20"
                          size="icon"
                        >
                          <X className="h-4 w-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={addKeyPoint}
                    className="glass-button bg-purple-500/20 hover:bg-purple-500/30 text-white border-purple-400/50"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key Point
                  </Button>
                </div>

                {/* Recommendations Panel */}
                {showRecommendations && recommendations.length > 0 && (
                  <div className="mt-6 glass-card p-4 border border-yellow-400/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Suggested Key Points
                      </h4>
                      <Button
                        onClick={() => setShowRecommendations(false)}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-gray-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recommendations.map((rec, index) => (
                        <button
                          key={index}
                          onClick={() => addRecommendation(rec)}
                          className="w-full text-left p-3 glass rounded-lg hover:bg-white/10 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 group-hover:text-white">
                              {rec}
                            </span>
                            <Plus className="h-4 w-4 text-gray-500 group-hover:text-yellow-400 flex-shrink-0 ml-2" />
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Click any suggestion to add it to your key points
                    </p>
                  </div>
                )}

                {/* Info message when no details provided */}
                {(!formData.title || !formData.type) && currentStep === 2 && (
                  <div className="mt-4 p-3 glass-card border border-blue-400/30">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        Complete the <span className="text-white font-medium">Basic Information</span> and <span className="text-white font-medium">Video Details</span> steps to get AI-powered key point suggestions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: AI Settings */}
          {currentStep === 3 && (
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <Label className="text-gray-300">AI Model</Label>
                <div className="grid gap-3 mt-2">
                  {Object.entries(AI_MODELS).map(([key, value]) => {
                    const cost = CREDIT_COSTS.SCRIPT_GENERATION[value];
                    const hasAccess = hasAccessToModel(value, userData.subscriptionTier);
                    const isPremium = isPremiumModel(value);
                    const minimumTier = getMinimumTierForModel(value);
                    
                    return (
                      <button
                        key={key}
                        onClick={() => hasAccess && updateFormData('model', value)}
                        disabled={!hasAccess}
                        className={`glass-button p-4 text-left transition-all relative ${
                          formData.model === value
                            ? 'bg-purple-500/20 ring-2 ring-purple-400'
                            : hasAccess ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{value}</p>
                              {isPremium && (
                                <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 text-yellow-300">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                              {!hasAccess && (
                                <Badge variant="outline" className="border-red-400/50 text-red-300">
                                  <Lock className="h-3 w-3 mr-1" />
                                  {getTierDisplayName(minimumTier)}+
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              {key.includes('GPT5') ? 'Most advanced GPT model' :
                               key.includes('CLAUDE_4_OPUS') ? 'Most capable Claude model' :
                               key.includes('GPT4') && !key.includes('TURBO') ? 'Powerful reasoning' :
                               key.includes('TURBO') ? 'Fast & efficient' :
                               key.includes('SONNET') ? 'Balanced performance' :
                               key.includes('HAIKU') ? 'Quick & affordable' :
                               key.includes('MIXTRAL') ? 'Open-source alternative' :
                               'Advanced capabilities'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className="glass border-purple-400/50 text-purple-300">
                              {cost} credits
                            </Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {userData.voiceProfiles.length > 0 && (
                <div>
                  <Label className="text-gray-300">Voice Profile (Optional)</Label>
                  <Select value={formData.voiceProfileId} onValueChange={(value) => updateFormData('voiceProfileId', value)}>
                    <SelectTrigger className="glass-input text-white mt-2">
                      <SelectValue placeholder="Select a voice profile..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-white/20 text-white">
                      <SelectItem value="" className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer">
                        No voice profile
                      </SelectItem>
                      {userData.voiceProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id} className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer">
                          {profile.profile_name || profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="glass p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Script Summary</h3>
                
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Length:</span>
                    <span className="text-white">{formData.length} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tone:</span>
                    <span className="text-white capitalize">{formData.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Model:</span>
                    <span className="text-white">{formData.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Key Points:</span>
                    <span className="text-white">{formData.keyPoints.filter(p => p.trim()).length}</span>
                  </div>
                </div>
              </div>

              <div className="glass p-4 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Credit Usage</span>
                </div>
                <p className="text-sm text-gray-300">
                  This script will use <span className="font-bold text-white">{creditCost} credits</span>.
                  You'll have <span className="font-bold text-white">{userData.credits - creditCost} credits</span> remaining.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="glass-button text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Pro Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-300">
              <span className="text-white font-medium">Be specific:</span> The more detailed your key points, the better the script
            </p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-300">
              <span className="text-white font-medium">Use voice profiles:</span> Train AI on your style for authentic scripts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}