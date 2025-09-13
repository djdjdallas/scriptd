'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast as toastSonner } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Target, 
  Hash, 
  Brain, 
  CheckCircle2,
  Plus,
  X,
  Loader2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Lock,
  Check,
  ChevronLeft,
  AlertCircle,
  Users
} from 'lucide-react';
import { 
  MODEL_TIERS,
  TIER_ACCESS_BY_SUBSCRIPTION,
  calculateScriptCost,
  SCRIPT_TYPES, 
  SCRIPT_LENGTHS 
} from '@/lib/constants';

const TONE_OPTIONS = ['professional', 'casual', 'educational', 'entertaining', 'inspirational', 'conversational'];

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
    title: 'Quality Settings', 
    description: 'Quality tier and voice options',
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [voiceProfiles, setVoiceProfiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [userData, setUserData] = useState({
    credits: 0,
    subscriptionTier: 'free'
  });

  // Helper function to check if user has access to a tier
  const hasAccessToTier = (tier, userTier = 'free') => {
    const allowedTiers = TIER_ACCESS_BY_SUBSCRIPTION[userTier] || [];
    return allowedTiers.includes(tier);
  };

  // Helper function to calculate scripts remaining for a tier
  const calculateScriptsRemaining = (tier, credits, length) => {
    const cost = calculateScriptCost(tier, length);
    return Math.floor(credits / cost);
  };
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    length: 10, // Default to 10 minutes
    tone: 'professional',
    targetAudience: 'general',
    keyPoints: [''],
    qualityTier: 'BALANCED', // Default to BALANCED tier as recommended
    channelId: '',
    voiceId: null,
    additionalInstructions: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchVoiceProfiles();
    fetchChannels();
  }, []);

  useEffect(() => {
    // Auto-select channel if there's only one
    if (channels.length === 1 && !formData.channelId) {
      const firstChannel = channels[0];
      setFormData(prev => ({
        ...prev,
        channelId: firstChannel.id,
        targetAudience: firstChannel.audience_description || prev.targetAudience
      }));
    }
  }, [channels]);

  const fetchChannels = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setChannels(data);
        // Auto-fill audience from first channel if available
        if (data.length > 0 && data[0].audience_description) {
          const firstChannel = data[0];
          setFormData(prev => ({
            ...prev,
            channelId: firstChannel.id,
            targetAudience: firstChannel.audience_description || prev.targetAudience
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fillAudienceFromChannel = () => {
    if (formData.channelId) {
      const selectedChannel = channels.find(c => c.id === formData.channelId);
      if (selectedChannel && selectedChannel.audience_description) {
        setFormData(prev => ({
          ...prev,
          targetAudience: selectedChannel.audience_description
        }));
      }
    }
  };

  // Auto-fill audience when channel changes
  useEffect(() => {
    if (formData.channelId) {
      const selectedChannel = channels.find(c => c.id === formData.channelId);
      if (selectedChannel && selectedChannel.audience_description) {
        setFormData(prev => ({
          ...prev,
          targetAudience: selectedChannel.audience_description
        }));
        toast({
          title: "Audience Auto-filled",
          description: "Target audience has been filled from your channel analysis.",
        });
      }
    }
  }, [formData.channelId, channels]);

  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('credits, subscription_tier')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserData({
          credits: data.credits || 0,
          subscriptionTier: data.subscription_tier || 'free'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const generateRecommendations = async () => {
    console.log('Generating recommendations with:', { title: formData.title, type: formData.type });
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/scripts/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          targetAudience: formData.targetAudience,
          tone: formData.tone,
          length: formData.length,
          existingPoints: formData.keyPoints.filter(p => p.trim())
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Recommendations received:', data);
      
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setShowRecommendations(true);
        toast({
          title: "Success",
          description: `Generated ${data.recommendations.length} suggestions`,
        });
      } else {
        toast({
          title: "No suggestions",
          description: "Could not generate suggestions for this topic",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive"
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const addRecommendation = (rec) => {
    const emptyIndex = formData.keyPoints.findIndex(p => !p.trim());
    if (emptyIndex !== -1) {
      updateKeyPoint(emptyIndex, rec);
    } else {
      addKeyPoint();
      updateKeyPoint(formData.keyPoints.length, rec);
    }
  };

  const fetchVoiceProfiles = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!error && data) {
        setVoiceProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching voice profiles:', error);
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
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.map((point, i) => i === index ? value : point)
    }));
  };

  const removeKeyPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Calculate credit cost using new tier-based system
  const creditCost = calculateScriptCost(formData.qualityTier, formData.length);

  const handleGenerate = async () => {
    // Check credit balance
    if (userData.credits < creditCost) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditCost} credits to generate this script. You have ${userData.credits} credits.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Send the request with qualityTier (API handles the model mapping internally)
      const requestData = {
        ...formData,
        // qualityTier is already included in formData
        // Backend will map this to the appropriate model
      };
      
      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        toastSonner.success('Script generated successfully!');
        router.push(`/scripts/${data.scriptId || data.script?.id}`);
      } else {
        throw new Error(data.error || 'Failed to generate script');
      }
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

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.type;
      case 1:
        return formData.length && formData.tone && formData.targetAudience;
      case 2:
        return formData.keyPoints.some(p => p.trim());
      case 3:
        return formData.qualityTier;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-4xl font-bold text-white mb-2">Create New Script</h1>
        <p className="text-gray-400">Follow the steps to generate your perfect YouTube script</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`flex flex-col items-center ${
                index <= currentStep ? 'text-white' : 'text-gray-500'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  index < currentStep 
                    ? 'bg-purple-500' 
                    : index === currentStep 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 ring-4 ring-purple-500/30' 
                    : 'bg-gray-700'
                }`}>
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden md:block">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${
                  index < currentStep ? 'bg-purple-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            {(() => {
              const Icon = STEPS[currentStep].icon;
              return <Icon className="h-6 w-6 text-purple-400" />;
            })()}
            {STEPS[currentStep].title}
          </h2>
          <p className="text-gray-400">{STEPS[currentStep].description}</p>
        </div>

        <div className="min-h-[400px]">
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">Video Title</Label>
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
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Video Details - Length, Tone, and Audience */}
          {currentStep === 1 && (
            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Video Length */}
              <div>
                <Label className="text-gray-300 mb-4 block">Select Video Duration</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(SCRIPT_LENGTHS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => updateFormData('length', value.minutes)}
                      className={`glass-button p-4 text-left transition-all relative ${
                        formData.length === value.minutes
                          ? 'bg-purple-500/20 ring-2 ring-purple-400'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold text-lg">{value.minutes} min</span>
                          {formData.length === value.minutes && (
                            <Check className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{value.words}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tone & Style */}
              <div>
                <Label className="text-gray-300 mb-4 block">Select Tone & Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TONE_OPTIONS.map((tone) => (
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
              
              {/* Target Audience */}
              <div className="glass-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="audience" className="text-white text-lg font-semibold">Target Audience</Label>
                    <p className="text-sm text-gray-400 mt-1">Describe who will watch your video - their interests, age, background, and what they're looking for</p>
                  </div>
                </div>
                <textarea
                  id="audience"
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                  placeholder="This channel appeals to young adults passionate about music, fashion, and urban culture who aspire to build a career in the creative arts. They are drawn to authentic storytelling, musical talent, and behind-the-scenes glimpses into modeling and performance life. The content resonates with viewers seeking inspiration, creative expression, and insight into the challenges and excitement of pursuing artistic ambitions in a vibrant city environment. Male, age 18-28."
                  className="glass-input text-white w-full min-h-[150px] resize-none"
                  rows={6}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400">
                    {formData.targetAudience.length} / 500 characters
                  </p>
                  {formData.channelId && (
                    <Button
                      onClick={fillAudienceFromChannel}
                      size="sm"
                      variant="outline"
                      className="glass-button text-xs"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Auto-fill from Channel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Content Points */}
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
                      disabled={loadingSuggestions}
                      className="glass-button bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-white border-yellow-400/50"
                      variant="outline"
                    >
                      {loadingSuggestions ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get AI Suggestions
                        </>
                      )}
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
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Suggestions
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
                      Click to add suggestions to your key points
                    </p>
                  </div>
                )}

                {/* Info message when no details provided */}
                {(!formData.title || !formData.type) && currentStep === 2 && (
                  <div className="mt-4 p-3 glass-card border border-blue-400/30">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        Complete the <span className="text-white font-medium">Basic Information</span> step to get AI-powered key point suggestions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Quality Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Credit Cost Calculator */}
              <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">Current Cost</h4>
                    <p className="text-sm text-gray-400 mt-1">Based on selected quality and length</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-400">{creditCost}</p>
                    <p className="text-sm text-gray-400">credits</p>
                  </div>
                </div>
              </div>

              {/* Quality Tier Selection */}
              <div>
                <Label className="text-gray-300 text-lg font-semibold mb-4 block">Choose Quality Tier</Label>
                <p className="text-gray-400 text-sm mb-6">Select the quality level that best fits your content needs and budget.</p>
                
                <div className="grid gap-4">
                  {Object.entries(MODEL_TIERS).map(([key, tier]) => {
                    const userTier = userData.subscriptionTier || 'free';
                    const hasAccess = hasAccessToTier(key, userTier);
                    const cost = calculateScriptCost(key, formData.length);
                    const scriptsRemaining = calculateScriptsRemaining(key, userData.credits, formData.length);
                    
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (!hasAccess) {
                            toast({
                              title: "Upgrade Required",
                              description: `${tier.name} requires a higher subscription tier. Please upgrade your plan to access this quality level.`,
                              variant: "destructive"
                            });
                            return;
                          }
                          updateFormData('qualityTier', key);
                        }}
                        className={`glass-card p-6 cursor-pointer transition-all border ${
                          formData.qualityTier === key
                            ? 'border-purple-400 bg-purple-500/10 ring-2 ring-purple-400/30'
                            : hasAccess
                            ? 'border-gray-700 hover:border-gray-600 hover:bg-white/5'
                            : 'border-gray-800 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{tier.icon}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold text-lg ${hasAccess ? 'text-white' : 'text-gray-500'}`}>
                                  {tier.name}
                                </h3>
                                {tier.recommended && hasAccess && (
                                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-400/30">
                                    Recommended
                                  </Badge>
                                )}
                                {!hasAccess && (
                                  <Lock className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <p className={`text-sm ${hasAccess ? 'text-gray-400' : 'text-gray-600'}`}>
                                {tier.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${hasAccess ? 'text-white' : 'text-gray-500'}`}>
                              {cost} credits
                            </div>
                            {hasAccess && (
                              <p className="text-xs text-gray-400">
                                {scriptsRemaining} scripts remaining
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className={hasAccess ? 'text-gray-400' : 'text-gray-600'}>Features:</span>
                          </div>
                          <ul className="space-y-1">
                            {tier.features.map((feature, index) => (
                              <li key={index} className={`flex items-center gap-2 text-sm ${hasAccess ? 'text-gray-300' : 'text-gray-600'}`}>
                                <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {formData.qualityTier === key && (
                          <div className="mt-4 pt-4 border-t border-purple-400/30">
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <CheckCircle2 className="h-4 w-4" />
                              Selected
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Pro Tip */}
                <div className="mt-6 p-4 glass-card border border-blue-400/30 bg-blue-500/5">
                  <div className="flex gap-3">
                    <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Pro Tip</p>
                      <p className="text-sm text-gray-300">
                        Professional Quality offers the best balance of speed, cost, and output quality for most YouTube content creators.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {voiceProfiles && voiceProfiles.length > 0 && (
                <div>
                  <Label className="text-gray-300">Voice Profile (Optional)</Label>
                  <RadioGroup value={formData.voiceId || ''} onValueChange={(value) => updateFormData('voiceId', value)}>
                    <div className="grid gap-3 mt-3">
                      <div className="flex items-center space-x-3 glass p-4 rounded-lg hover:bg-white/5 cursor-pointer">
                        <RadioGroupItem value="" id="no-voice" className="text-purple-400" />
                        <Label htmlFor="no-voice" className="flex-1 cursor-pointer">
                          <span className="text-white">No Voice Profile</span>
                          <p className="text-xs text-gray-400 mt-1">Generate script without voice adaptation</p>
                        </Label>
                      </div>
                      {voiceProfiles.map((profile) => (
                        <div key={profile.id} className="flex items-center space-x-3 glass p-4 rounded-lg hover:bg-white/5 cursor-pointer">
                          <RadioGroupItem value={profile.id} id={profile.id} className="text-purple-400" />
                          <Label htmlFor={profile.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">{profile.name}</span>
                              {profile.is_trained && (
                                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Trained</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{profile.description}</p>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review & Generate */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Review Your Script Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{formData.length} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tone:</span>
                    <span className="text-white capitalize">{formData.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audience:</span>
                    <span className="text-white">{formData.targetAudience ? 'Defined' : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality Tier:</span>
                    <span className="text-white">{MODEL_TIERS[formData.qualityTier]?.name || formData.qualityTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Key Points:</span>
                    <span className="text-white">{formData.keyPoints.filter(p => p.trim()).length} points</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">Credit Cost</h4>
                    <p className="text-sm text-gray-400 mt-1">You have {userData.credits} credits available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-400">{creditCost}</p>
                    <p className="text-sm text-gray-400">credits</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handleBack}
            variant="outline"
            className="glass-button"
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || userData.credits < creditCost}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
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
  );
}