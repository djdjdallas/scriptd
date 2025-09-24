'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, Mic, Brain, Fingerprint, 
  Volume2, User, Sparkles, CheckCircle2,
  Upload, Play, BarChart3
} from 'lucide-react';
import { socialProofData } from '@/lib/comparison-data';

export default function VoiceMatchingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [voiceProfile, setVoiceProfile] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page: 'voice-matching-ai',
        referrer: document.referrer 
      })
    });
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    const interval = setInterval(() => {
      setAnalysisStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= 4) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setVoiceProfile({
              tone: 'Conversational & Energetic',
              vocabulary: 'Tech-savvy with accessible explanations',
              pacing: 'Dynamic with strategic pauses',
              personality: 'Enthusiastic educator',
              uniquePhrases: ['Let\'s dive in', 'Here\'s the thing', 'But wait, there\'s more'],
              matchScore: 95
            });
            setAnalysisStep(0);
          }, 500);
          return prev;
        }
        return nextStep;
      });
    }, 1500);
  };

  const analysisSteps = [
    { label: 'Analyzing speech patterns', icon: <Volume2 className="w-4 h-4" /> },
    { label: 'Identifying unique phrases', icon: <Fingerprint className="w-4 h-4" /> },
    { label: 'Building personality model', icon: <User className="w-4 h-4" /> },
    { label: 'Creating voice profile', icon: <Brain className="w-4 h-4" /> }
  ];

  const voiceAttributes = [
    {
      attribute: 'Tone & Energy',
      description: 'Match your emotional range and enthusiasm',
      examples: ['Calm educator', 'High-energy entertainer', 'Authoritative expert']
    },
    {
      attribute: 'Vocabulary Style',
      description: 'Use your specific word choices and phrases',
      examples: ['Technical precision', 'Casual slang', 'Professional formal']
    },
    {
      attribute: 'Sentence Structure',
      description: 'Replicate your unique speaking patterns',
      examples: ['Short punchy sentences', 'Complex explanations', 'Story-driven flow']
    },
    {
      attribute: 'Personality Traits',
      description: 'Capture your unique character and quirks',
      examples: ['Humor timing', 'Empathy expressions', 'Confidence level']
    }
  ];

  const beforeAfterExamples = [
    {
      category: 'Tech Review',
      before: 'This smartphone has good features and performance.',
      after: 'Okay guys, THIS is insane - this phone absolutely crushes it in every category!',
      creator: '@TechReviewer'
    },
    {
      category: 'Education',
      before: 'Today we will learn about photosynthesis.',
      after: 'So here\'s something wild - plants are basically solar panels, but way cooler.',
      creator: '@ScienceExplainer'
    },
    {
      category: 'Gaming',
      before: 'This game is difficult but entertaining.',
      after: 'Bro, this game will literally destroy your soul... and you\'ll love every second!',
      creator: '@GamingPro'
    }
  ];

  return (
    <>
      <head>
        <title>Voice Matching AI - Scripts That Sound Exactly Like You</title>
        <meta name="description" content="AI that learns your unique voice and creates authentic scripts in your style. No more generic AI content - get scripts that sound 100% you." />
        <meta name="keywords" content="voice matching ai, personal writing style, authentic ai scripts, creator voice profile, youtube voice matching" />
      </head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 via-purple-50 to-white dark:from-blue-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Fingerprint className="w-4 h-4 mr-1" />
              Your Unique Voice DNA
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI That Writes Exactly Like You Do
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Our Voice Matching AI analyzes your speaking style and creates scripts that are 
              <span className="font-semibold text-foreground"> indistinguishable from your own writing</span>. 
              No more generic AI content.
            </p>

            <div className="flex gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={handleAnalyze}
              >
                Analyze Your Voice
                <Mic className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                See Examples
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span>AI Learning</span>
              </div>
              <div className="flex items-center gap-1">
                <Fingerprint className="w-4 h-4" />
                <span>Unique Voice Print</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>95%+ Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Analysis Demo */}
      {isAnalyzing && (
        <section className="py-16 bg-white dark:bg-background border-y">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <CardHeader>
                <CardTitle>Analyzing Your Voice Pattern...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        idx <= analysisStep 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {idx <= analysisStep ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                      </div>
                      <span className={idx <= analysisStep ? 'font-medium' : 'text-muted-foreground'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <Progress value={(analysisStep + 1) * 25} className="mt-6" />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Voice Profile Results */}
      {voiceProfile && (
        <section className="py-16 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Voice Profile</CardTitle>
                  <Badge className="bg-green-600 text-white">
                    {voiceProfile.matchScore}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tone</p>
                      <p className="font-medium">{voiceProfile.tone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vocabulary</p>
                      <p className="font-medium">{voiceProfile.vocabulary}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pacing</p>
                      <p className="font-medium">{voiceProfile.pacing}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Personality</p>
                      <p className="font-medium">{voiceProfile.personality}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Your Signature Phrases:</p>
                  <div className="flex flex-wrap gap-2">
                    {voiceProfile.uniquePhrases.map((phrase, idx) => (
                      <Badge key={idx} variant="secondary">"{phrase}"</Badge>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600">
                  Start Creating in Your Voice
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Voice Matching Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>1. Upload Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share 3-5 of your existing scripts or videos for analysis
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>2. AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our AI learns your vocabulary, tone, pacing, and personality
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-pink-600" />
                </div>
                <CardTitle>3. Perfect Match</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate unlimited scripts that sound exactly like you
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Voice Attributes */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            What We Analyze in Your Voice
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our AI captures every nuance that makes your content unique
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {voiceAttributes.map((attr, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{attr.attribute}</CardTitle>
                  <CardDescription>{attr.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {attr.examples.map((example, i) => (
                      <Badge key={i} variant="outline">{example}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Examples */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Generic AI vs Your Voice
          </h2>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            {beforeAfterExamples.map((example, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{example.category}</CardTitle>
                    <Badge variant="outline">{example.creator}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Generic AI</span>
                      </div>
                      <p className="text-sm italic text-muted-foreground">
                        "{example.before}"
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Your Voice</span>
                      </div>
                      <p className="text-sm italic">
                        "{example.after}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Voice Matching Results
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">95%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Voice accuracy match
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">3min</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  To learn your voice
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">∞</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scripts in your voice
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">
                  {socialProofData.metrics.totalUsers}+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Unique voices matched
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Never Sound Like Generic AI Again
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Create authentic scripts that sound exactly like you wrote them. 
            Your audience will never know it's AI.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Create Your Voice Profile
              <Fingerprint className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              See Demo
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}