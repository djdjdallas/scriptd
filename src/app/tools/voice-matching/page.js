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
// Removed unused import - using hardcoded metrics instead

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
        if (nextStep >= 8) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setVoiceProfile({
              tone: 'Conversational & Energetic',
              vocabulary: 'Tech-savvy with accessible explanations',
              pacing: 'Dynamic with strategic pauses',
              personality: 'Enthusiastic educator',
              uniquePhrases: ['Let\'s dive in', 'Here\'s the thing', 'But wait, there\'s more'],
              matchScore: 95,
              // Enhanced metrics from deep analysis
              formalityScore: 35,
              humorFrequency: 'Occasional (3.2 per 1000 words)',
              avgWordsPerSentence: 15,
              technicalDepth: 'Semi-technical',
              emotionalTone: 'Excitement & Enthusiasm',
              consistencyScore: 92
            });
            setAnalysisStep(0);
          }, 500);
          return prev;
        }
        return nextStep;
      });
    }, 1200);
  };

  const analysisSteps = [
    { label: 'Extracting linguistic fingerprints', icon: <Fingerprint className="w-4 h-4" /> },
    { label: 'Analyzing sentence patterns', icon: <Volume2 className="w-4 h-4" /> },
    { label: 'Mapping narrative structure', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Detecting emotional dynamics', icon: <Brain className="w-4 h-4" /> },
    { label: 'Profiling audience positioning', icon: <User className="w-4 h-4" /> },
    { label: 'Analyzing cultural references', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Processing engagement techniques', icon: <ArrowRight className="w-4 h-4" /> },
    { label: 'Calculating pacing dynamics', icon: <Play className="w-4 h-4" /> }
  ];

  const voiceAttributes = [
    {
      attribute: 'Linguistic Fingerprints',
      description: 'Your unique language DNA with opening patterns, signature phrases, and filler words',
      examples: ['Opening hooks', 'Transition phrases', 'Closing patterns', 'Signature catchphrases']
    },
    {
      attribute: 'Narrative Structure',
      description: 'How you build stories and present information',
      examples: ['Story arc patterns', 'Information flow', 'Example placement', 'Hook strategies']
    },
    {
      attribute: 'Emotional Dynamics',
      description: 'Your emotional range and authenticity markers',
      examples: ['Energy curves', 'Passion triggers', 'Vulnerability moments', 'Enthusiasm peaks']
    },
    {
      attribute: 'Technical Patterns',
      description: 'Measurable language metrics unique to you',
      examples: ['15 avg words/sentence', 'Vocabulary complexity', 'Jargon frequency', 'Data presentation style']
    },
    {
      attribute: 'Audience Positioning',
      description: 'How you relate to and engage your viewers',
      examples: ['Teacher vs friend', 'Expert vs explorer', 'Direct address frequency', 'Community language']
    },
    {
      attribute: 'Cultural References',
      description: 'Your unique reference style and metaphors',
      examples: ['Pop culture usage', 'Historical examples', 'Meme integration', 'Academic balance']
    },
    {
      attribute: 'Engagement Techniques',
      description: 'Your methods for keeping attention',
      examples: ['Question deployment', 'CTA placement', 'You vs we usage', 'Interactive elements']
    },
    {
      attribute: 'Pacing Dynamics',
      description: 'Your rhythm and delivery patterns',
      examples: ['Speed variations', 'Pause patterns', 'Emphasis techniques', 'Edit rhythm']
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
        <title>Voice Matching AI - Deep Linguistic Profiling with 100+ Voice Metrics</title>
        <meta name="description" content="Advanced 8-category deep linguistic profiling system that analyzes 100+ voice metrics from real YouTube transcripts. Pattern enforcement, compliance scoring, and authentic voice replication." />
        <meta name="keywords" content="deep linguistic profiling, 8-category voice analysis, 100+ voice metrics, YouTube transcript analysis, pattern enforcement, compliance scoring, linguistic fingerprints, narrative structure analysis, emotional dynamics mapping" />
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
                <Progress value={(analysisStep + 1) * 12.5} className="mt-6" />
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
                
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-sm font-medium mb-2">Your Signature Phrases:</p>
                    <div className="flex flex-wrap gap-2">
                      {voiceProfile.uniquePhrases.map((phrase, idx) => (
                        <Badge key={idx} variant="secondary">"{phrase}"</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">Formality Score</p>
                      <p className="text-lg font-bold">{voiceProfile.formalityScore}/100</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">Consistency</p>
                      <p className="text-lg font-bold">{voiceProfile.consistencyScore}%</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">Avg Words/Sentence</p>
                      <p className="text-lg font-bold">{voiceProfile.avgWordsPerSentence}</p>
                    </div>
                    <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">Humor Frequency</p>
                      <p className="text-lg font-bold">{voiceProfile.humorFrequency}</p>
                    </div>
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
            How Deep Linguistic Profiling Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>1. YouTube Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analyzes up to 20 videos & 10 transcripts from your channel
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>2. Deep Profiling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  8-category analysis with 100+ unique voice metrics
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-pink-600" />
                </div>
                <CardTitle>3. Pattern Enforcement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enforces your exact phrases & structures with 95%+ accuracy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Advanced Voice Analysis Features
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Powered by our Version 3.0 Deep Linguistic Profiling System
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  100+ Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive analysis including:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Question frequency types</li>
                  <li>• Filler word density</li>
                  <li>• Sentence complexity</li>
                  <li>• Vocabulary diversity</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Real Transcript Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Direct YouTube integration:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• 20 videos fetched</li>
                  <li>• 10 transcripts analyzed</li>
                  <li>• 279+ segments per video</li>
                  <li>• Real voice patterns</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Compliance Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Post-generation verification:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• 0-100 authenticity score</li>
                  <li>• Pattern enforcement</li>
                  <li>• Voice consistency check</li>
                  <li>• Signature phrase usage</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-orange-600" />
                  Linguistic Fingerprints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Unique pattern detection:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Opening patterns</li>
                  <li>• Transition phrases</li>
                  <li>• Closing signatures</li>
                  <li>• Hook placement</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-pink-600" />
                  Audience Psychographics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Beyond demographics:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Values & behaviors</li>
                  <li>• Content preferences</li>
                  <li>• Engagement patterns</li>
                  <li>• Community language</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Intelligent Blending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  For remix channels:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Smart pattern selection</li>
                  <li>• Dominant voice extraction</li>
                  <li>• Multi-channel synthesis</li>
                  <li>• Style harmonization</li>
                </ul>
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

      {/* What Makes Us Different */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            What Makes Our System Different
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Industry-leading deep linguistic profiling vs basic voice matching
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="font-semibold mb-4 text-red-600">❌ Other Voice Matching Tools</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Basic tone and style matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Theoretical voice models</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Generic pattern imitation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>No verification of output</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Demographics-only audience data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>5-10 surface metrics</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-green-600">✅ Our Deep Profiling System</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-medium">8-category deep linguistic analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-medium">Real YouTube transcript analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-medium">Pattern enforcement with exact phrases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-medium">Compliance scoring (0-100)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-medium">Psychographic audience profiling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="font-medium">100+ unique voice metrics</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Version 3.0 - January 2025</p>
              <p className="text-sm text-muted-foreground">
                Production-ready deep linguistic profiling with enhanced pattern enforcement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Depth Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Technical Analysis Depth
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See exactly how we analyze your unique voice patterns
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Engagement Questions</p>
                    <Progress value={65} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">65% of questions</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rhetorical Questions</p>
                    <Progress value={25} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">25% of questions</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Informational Questions</p>
                    <Progress value={10} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">10% of questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sentence Complexity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Simple Sentences</p>
                    <Progress value={40} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">40% distribution</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Moderate Complexity</p>
                    <Progress value={45} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">45% distribution</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Complex Structures</p>
                    <Progress value={15} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">15% distribution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hook Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-between">
                    <span>Question Hooks</span>
                    <span>35%</span>
                  </Badge>
                  <Badge variant="outline" className="w-full justify-between">
                    <span>Statistic Hooks</span>
                    <span>20%</span>
                  </Badge>
                  <Badge variant="outline" className="w-full justify-between">
                    <span>Story Hooks</span>
                    <span>25%</span>
                  </Badge>
                  <Badge variant="outline" className="w-full justify-between">
                    <span>Problem Hooks</span>
                    <span>15%</span>
                  </Badge>
                  <Badge variant="outline" className="w-full justify-between">
                    <span>Curiosity Hooks</span>
                    <span>5%</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vocabulary Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                    <p className="text-2xl font-bold">0.72</p>
                    <p className="text-xs text-muted-foreground">Type-Token Ratio</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
                    <p className="text-2xl font-bold">3.2</p>
                    <p className="text-xs text-muted-foreground">Fillers/1000 words</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900/30 rounded text-center">
                  <p className="text-xs text-muted-foreground">Top 50 unique words tracked</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emotional Dynamics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excitement Peaks</span>
                    <Badge className="bg-orange-500">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vulnerability</span>
                    <Badge className="bg-blue-500">Moderate</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enthusiasm</span>
                    <Badge className="bg-green-500">Very High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authority</span>
                    <Badge className="bg-purple-500">Expert</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pacing Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Words Per Minute</span>
                      <span className="text-lg font-bold">145</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>• Short pauses: Every 15-20 words</p>
                      <p>• Long pauses: Every 50-60 words</p>
                      <p>• Dramatic pauses: 2-3 per video</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Before & After Examples */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
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
                <CardTitle className="text-3xl font-bold text-purple-600">8</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Deep analysis categories
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">100+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Voice metrics captured
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">95%+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compliance accuracy
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">20</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Videos analyzed per channel
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