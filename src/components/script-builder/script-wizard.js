'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { SCRIPT_TYPES, SCRIPT_LENGTHS, AI_MODELS, CREDIT_COSTS } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';

const STEPS = [
  { id: 'basics', title: 'Basic Information', description: 'Title and video type' },
  { id: 'details', title: 'Video Details', description: 'Length, tone, and audience' },
  { id: 'content', title: 'Content Points', description: 'Key topics to cover' },
  { id: 'settings', title: 'AI Settings', description: 'Model and voice options' },
  { id: 'review', title: 'Review & Generate', description: 'Confirm your choices' }
];

export function ScriptWizard({ channels = [], voiceProfiles = [], userCredits = 0 }) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    length: '10',
    tone: 'professional',
    targetAudience: 'general',
    keyPoints: [''],
    model: AI_MODELS.GPT4_TURBO,
    channelId: '',
    voiceProfileId: ''
  });

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

  const creditCost = CREDIT_COSTS.SCRIPT_GENERATION[formData.model] || 10;
  const canGenerate = userCredits >= creditCost;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditCost} credits to generate a script. You have ${userCredits}.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keyPoints: formData.keyPoints.filter(p => p.trim())
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate script');
      }

      const data = await response.json();
      
      toast({
        title: "Script Generated!",
        description: "Your script has been created successfully."
      });

      // Redirect to the script page
      router.push(`/scripts/${data.script.id}`);
      
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

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                placeholder="Enter your video title..."
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Video Type</Label>
              <Select value={formData.type} onValueChange={(v) => updateFormData('type', v)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCRIPT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1: // Details
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="length">Video Length (minutes)</Label>
              <Input
                id="length"
                type="number"
                min="1"
                max="120"
                value={formData.length}
                onChange={(e) => updateFormData('length', e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                {Object.entries(SCRIPT_LENGTHS).map(([key, { min, max, label }]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={
                      formData.length >= min && (max === null || formData.length <= max)
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => updateFormData('length', min === 30 ? '30' : String(min + 2))}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(v) => updateFormData('tone', v)}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Beginners, Professionals, Teens..."
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
              />
            </div>
          </div>
        );

      case 2: // Content
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Key Points to Cover</Label>
              <p className="text-sm text-muted-foreground">
                Add the main topics or points you want to include in your script
              </p>
            </div>
            
            {formData.keyPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Point ${index + 1}`}
                  value={point}
                  onChange={(e) => updateKeyPoint(index, e.target.value)}
                />
                {formData.keyPoints.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeKeyPoint(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addKeyPoint}
              className="w-full"
            >
              Add Another Point
            </Button>
          </div>
        );

      case 3: // Settings
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={formData.model} onValueChange={(v) => updateFormData('model', v)}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AI_MODELS).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{value}</span>
                        <Badge variant="secondary" className="ml-2">
                          {CREDIT_COSTS.SCRIPT_GENERATION[value]} credits
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {channels.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="channel">Channel (Optional)</Label>
                <Select value={formData.channelId} onValueChange={(v) => updateFormData('channelId', v)}>
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {channels.map(channel => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {voiceProfiles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="voice">Voice Profile (Optional)</Label>
                <Select value={formData.voiceProfileId} onValueChange={(v) => updateFormData('voiceProfileId', v)}>
                  <SelectTrigger id="voice">
                    <SelectValue placeholder="Select a voice profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {voiceProfiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{formData.title || 'Not set'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{formData.type || 'Not set'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Length</p>
                <p className="font-medium">{formData.length} minutes</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">AI Model</p>
                <p className="font-medium">{formData.model}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Credit Cost</p>
                <p className="font-medium">{creditCost} credits</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                You have <span className="font-semibold">{userCredits} credits</span> available.
                {canGenerate ? (
                  <span className="text-green-600 ml-1">✓ Sufficient credits</span>
                ) : (
                  <span className="text-red-600 ml-1">✗ Insufficient credits</span>
                )}
              </p>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title.trim() && formData.type;
      case 1:
        return formData.length && formData.tone && formData.targetAudience;
      case 2:
        return formData.keyPoints.some(p => p.trim());
      case 3:
        return formData.model;
      case 4:
        return canGenerate;
      default:
        return true;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate YouTube Script</CardTitle>
        <CardDescription>
          Follow the steps to create your perfect script
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div>
          <Progress value={(currentStep + 1) / STEPS.length * 100} className="mb-4" />
          <div className="flex justify-between text-sm">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  index < currentStep ? 'bg-primary text-primary-foreground' :
                  index === currentStep ? 'bg-primary/20 border-2 border-primary' :
                  'bg-muted'
                }`}>
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current step content */}
        <div className="min-h-[300px]">
          <h3 className="text-lg font-semibold mb-1">{STEPS[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {STEPS[currentStep].description}
          </p>
          
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!canProceed() || isGenerating}
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
      </CardContent>
    </Card>
  );
}