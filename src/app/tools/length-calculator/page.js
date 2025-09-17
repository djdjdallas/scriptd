'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  FileText,
  Gauge,
  Timer,
  Calculator,
  Info,
  TrendingUp,
  Copy
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SPEAKING_PACES = [
  { 
    id: 'slow', 
    label: 'Slow', 
    wpm: 120, 
    description: 'Educational, complex topics' 
  },
  { 
    id: 'normal', 
    label: 'Normal', 
    wpm: 150, 
    description: 'Most YouTube content' 
  },
  { 
    id: 'fast', 
    label: 'Fast', 
    wpm: 180, 
    description: 'Entertainment, energetic content' 
  },
  { 
    id: 'very-fast', 
    label: 'Very Fast', 
    wpm: 200, 
    description: 'Quick tips, rapid-fire content' 
  }
];

const VIDEO_LENGTHS = [
  { value: 60, label: '1 minute', type: 'Shorts' },
  { value: 180, label: '3 minutes', type: 'Short' },
  { value: 300, label: '5 minutes', type: 'Standard' },
  { value: 480, label: '8 minutes', type: 'Standard' },
  { value: 600, label: '10 minutes', type: 'Standard' },
  { value: 900, label: '15 minutes', type: 'Long' },
  { value: 1200, label: '20 minutes', type: 'Long' },
  { value: 1800, label: '30 minutes', type: 'Extended' },
];

export default function LengthCalculatorPage() {
  const { toast } = useToast();
  const [script, setScript] = useState('');
  const [targetDuration, setTargetDuration] = useState('600');
  const [speakingPace, setSpeakingPace] = useState('normal');
  const [customWPM, setCustomWPM] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (script) {
      calculateLength();
    }
  }, [script, speakingPace, customWPM]);

  const calculateLength = () => {
    const words = script.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = script.length;
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = script.split(/\n\n+/).filter(p => p.trim().length > 0).length;

    let wpm = 150; // default
    if (customWPM && !isNaN(customWPM)) {
      wpm = parseInt(customWPM);
    } else {
      const pace = SPEAKING_PACES.find(p => p.id === speakingPace);
      if (pace) wpm = pace.wpm;
    }

    const estimatedMinutes = words / wpm;
    const estimatedSeconds = Math.round(estimatedMinutes * 60);
    
    // Calculate words needed for target duration
    const targetSeconds = parseInt(targetDuration) || 600;
    const targetMinutes = targetSeconds / 60;
    const targetWords = Math.round(targetMinutes * wpm);
    const wordsRemaining = targetWords - words;

    setResults({
      words,
      characters,
      sentences,
      paragraphs,
      estimatedSeconds,
      estimatedMinutes: estimatedMinutes.toFixed(1),
      wpm,
      targetWords,
      wordsRemaining,
      targetSeconds,
      percentComplete: Math.min(100, Math.round((words / targetWords) * 100))
    });
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (percent) => {
    if (percent < 50) return 'text-red-500';
    if (percent < 80) return 'text-yellow-500';
    if (percent <= 110) return 'text-green-500';
    return 'text-red-500'; // Over target
  };

  const copyResults = () => {
    if (!results) return;
    
    const text = `Script Analysis:
• Word Count: ${results.words}
• Estimated Duration: ${formatTime(results.estimatedSeconds)}
• Speaking Pace: ${results.wpm} WPM
• Target Duration: ${formatTime(results.targetSeconds)}
• Words ${results.wordsRemaining >= 0 ? 'Needed' : 'Over'}: ${Math.abs(results.wordsRemaining)}
• Completion: ${results.percentComplete}%`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Script analysis copied to clipboard"
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Script Length Calculator</h1>
        <p className="text-xl text-muted-foreground">
          Calculate the perfect script length for your target video duration
        </p>
      </div>

      {/* Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Script Calculator</CardTitle>
          <CardDescription>
            Paste your script or start typing to see real-time calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Script Input */}
          <div className="space-y-2">
            <Label htmlFor="script">Your Script</Label>
            <Textarea
              id="script"
              placeholder="Paste or type your script here..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={8}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Start typing or paste your script to see live calculations
            </p>
          </div>

          {/* Target Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Target Video Duration</Label>
            <Select value={targetDuration} onValueChange={setTargetDuration}>
              <SelectTrigger id="duration" className="w-full text-foreground [&>span]:text-foreground">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_LENGTHS.map((length) => (
                  <SelectItem key={length.value} value={length.value.toString()}>
                    {length.label} ({length.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speaking Pace */}
          <div className="space-y-3">
            <Label>Speaking Pace</Label>
            <RadioGroup value={speakingPace} onValueChange={setSpeakingPace}>
              <div className="grid grid-cols-2 gap-3">
                {SPEAKING_PACES.map((pace) => (
                  <div key={pace.id}>
                    <RadioGroupItem
                      value={pace.id}
                      id={pace.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={pace.id}
                      className="flex flex-col gap-1 rounded-md border-2 border-muted bg-transparent p-3 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{pace.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {pace.wpm} WPM
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{pace.description}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Custom WPM */}
          <div className="space-y-2">
            <Label htmlFor="custom-wpm">Custom Words Per Minute (Optional)</Label>
            <Input
              id="custom-wpm"
              type="number"
              placeholder="e.g., 165"
              value={customWPM}
              onChange={(e) => setCustomWPM(e.target.value)}
              min="50"
              max="300"
            />
            <p className="text-sm text-muted-foreground">
              Override the speaking pace with a custom WPM value
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Script Analysis</CardTitle>
                  <CardDescription>
                    Based on {results.wpm} words per minute
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyResults}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Current Script Stats */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Current Script
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Words</span>
                      <span className="font-medium">{results.words.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Characters</span>
                      <span className="font-medium">{results.characters.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sentences</span>
                      <span className="font-medium">{results.sentences}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Paragraphs</span>
                      <span className="font-medium">{results.paragraphs}</span>
                    </div>
                  </div>
                </div>

                {/* Duration Stats */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration Estimate
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Est. Duration</span>
                      <span className="font-medium">{formatTime(results.estimatedSeconds)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Target Duration</span>
                      <span className="font-medium">{formatTime(results.targetSeconds)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Speaking Pace</span>
                      <span className="font-medium">{results.wpm} WPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Words/Sentence</span>
                      <span className="font-medium">
                        {results.sentences > 0 ? Math.round(results.words / results.sentences) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Target</span>
                  <span className={getProgressColor(results.percentComplete)}>
                    {results.percentComplete}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      results.percentComplete <= 110 ? 'bg-primary' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, results.percentComplete)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {results.wordsRemaining > 0 ? (
                    <>Need <span className="font-medium">{results.wordsRemaining}</span> more words</>
                  ) : results.wordsRemaining < 0 ? (
                    <>Over by <span className="font-medium">{Math.abs(results.wordsRemaining)}</span> words</>
                  ) : (
                    <>Perfect length!</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.percentComplete < 50 && (
                <div className="flex gap-3">
                  <TrendingUp className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Add more content</p>
                    <p className="text-sm text-muted-foreground">
                      Your script is significantly shorter than the target. Consider adding more examples, 
                      explanations, or additional sections.
                    </p>
                  </div>
                </div>
              )}
              
              {results.percentComplete >= 50 && results.percentComplete < 80 && (
                <div className="flex gap-3">
                  <Timer className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Almost there</p>
                    <p className="text-sm text-muted-foreground">
                      Add a bit more detail to reach your target duration. Consider expanding on key points.
                    </p>
                  </div>
                </div>
              )}
              
              {results.percentComplete >= 80 && results.percentComplete <= 110 && (
                <div className="flex gap-3">
                  <Gauge className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Perfect length!</p>
                    <p className="text-sm text-muted-foreground">
                      Your script is well-sized for your target duration. Remember to account for pauses and B-roll.
                    </p>
                  </div>
                </div>
              )}
              
              {results.percentComplete > 110 && (
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Consider trimming</p>
                    <p className="text-sm text-muted-foreground">
                      Your script is longer than the target. Consider removing redundant sections or 
                      splitting into multiple videos.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Script Length Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Account for pauses and emphasis</p>
              <p className="text-sm text-muted-foreground">
                Add 10-15% to your estimated time for natural pauses and emphasis
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Calculator className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">B-roll and visuals add time</p>
              <p className="text-sm text-muted-foreground">
                If showing visuals without narration, factor in additional time
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Timer className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Practice your delivery</p>
              <p className="text-sm text-muted-foreground">
                Read your script aloud to get a more accurate timing estimate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}