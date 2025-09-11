'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  Brain,
  BarChart3,
  Fingerprint,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Zap,
  Target,
  Activity,
  Hash,
  Smile,
  BookOpen,
  Users,
  Video,
  Clock
} from 'lucide-react';

export function VoiceProfileAdvanced({ profile }) {
  if (!profile?.parameters) return null;

  const { prosody, personality, quality, fingerprint, creatorPatterns } = profile.parameters;

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<Mic className="h-4 w-4" />}
          label="Videos Analyzed"
          value={profile.training_data?.analyzedVideos?.length || 5}
          subtext="transcripts"
        />
        <StatsCard
          icon={<Hash className="h-4 w-4" />}
          label="Total Words"
          value={(profile.training_data?.totalWords || 0).toLocaleString()}
          subtext="analyzed"
        />
        <StatsCard
          icon={<Brain className="h-4 w-4" />}
          label="Accuracy"
          value={`${profile.parameters.accuracy || 85}%`}
          subtext="confidence"
        />
        <StatsCard
          icon={<Zap className="h-4 w-4" />}
          label="Energy Level"
          value={prosody?.energyLevel?.level || 'Medium'}
          subtext={`${prosody?.energyLevel?.score || 0} score`}
        />
      </div>

      {/* Advanced Metrics Tabs */}
      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="prosody">Prosody</TabsTrigger>
          <TabsTrigger value="creator">Creator Style</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="fingerprint">Fingerprint</TabsTrigger>
        </TabsList>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-purple-400" />
                Voice Personality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formality Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Formality</span>
                  <span className="text-muted-foreground">
                    {personality?.formalityScore?.level || 'Balanced'}
                  </span>
                </div>
                <Progress value={personality?.formalityScore?.score || 50} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Casual</span>
                  <span>Formal</span>
                </div>
              </div>

              {/* Humor Frequency */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Humor Usage</span>
                  <Badge variant="outline">
                    {personality?.humorFrequency?.level || 'Occasional'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {personality?.humorFrequency?.density || 0} instances per 1000 words
                </div>
              </div>

              {/* Technical Depth */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Technical Depth</span>
                  <Badge variant="outline">
                    {personality?.technicalDepth?.level || 'Semi-technical'}
                  </Badge>
                </div>
                <Progress value={personality?.technicalDepth?.score || 30} className="h-2" />
              </div>

              {/* Emotional Range */}
              {personality?.emotionalRange && (
                <div className="space-y-2">
                  <span className="text-sm">Emotional Range</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(personality.emotionalRange.scores || {}).map(([emotion, score]) => (
                      <Badge 
                        key={emotion} 
                        variant={emotion === personality.emotionalRange.dominant ? 'default' : 'outline'}
                      >
                        {emotion}: {score}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prosody Tab */}
        <TabsContent value="prosody" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Speech Prosody Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sentence Length Variation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Sentence Length</span>
                  <div className="text-2xl font-bold">
                    {prosody?.sentenceLengthVariation?.avg || 0}
                  </div>
                  <span className="text-xs text-muted-foreground">avg words</span>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Variation</span>
                  <Badge variant="outline" className="mt-2">
                    {prosody?.sentenceLengthVariation?.variance || 'Medium'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {prosody?.sentenceLengthVariation?.min || 0} - {prosody?.sentenceLengthVariation?.max || 0} words
                  </div>
                </div>
              </div>

              {/* Question Frequency */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Question Usage</span>
                  <span>{prosody?.questionFrequency?.percentage || 0}%</span>
                </div>
                <Progress value={prosody?.questionFrequency?.percentage || 0} className="h-2" />
                {prosody?.questionFrequency?.types && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Engagement: {prosody.questionFrequency.types.engagement || 0}</span>
                    <span>Rhetorical: {prosody.questionFrequency.types.rhetorical || 0}</span>
                    <span>Info: {prosody.questionFrequency.types.informational || 0}</span>
                  </div>
                )}
              </div>

              {/* Speech Tempo */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Speech Tempo</span>
                  <Badge variant="outline">
                    {prosody?.speechTempo?.pace || 'Moderate'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  ~{prosody?.speechTempo?.wordsPerMinute || 150} words per minute
                </div>
              </div>

              {/* Pause Patterns */}
              {prosody?.pausePatterns && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Pause Patterns</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Short pauses:</span>
                      <span>{prosody.pausePatterns.shortPauses || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Long pauses:</span>
                      <span>{prosody.pausePatterns.longPauses || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creator Style Tab */}
        <TabsContent value="creator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-red-400" />
                YouTube Creator Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Intro Style */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Intro Style</span>
                <div className="flex items-center gap-2">
                  <Badge>{creatorPatterns?.introStyle?.style || 'Standard'}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {creatorPatterns?.introStyle?.consistency || 0}% consistent
                  </span>
                </div>
              </div>

              {/* Hook Patterns */}
              {creatorPatterns?.hookPatterns && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Hook Type</span>
                  <Badge variant="outline">
                    {creatorPatterns.hookPatterns.primaryHook || 'Standard'}
                  </Badge>
                </div>
              )}

              {/* Call to Actions */}
              {creatorPatterns?.ctaPatterns && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Call to Actions</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(creatorPatterns.ctaPatterns).map(([type, data]) => (
                      <div key={type} className="text-center">
                        <div className={`text-xs ${data.present ? 'text-green-400' : 'text-gray-400'}`}>
                          {type}
                        </div>
                        <Badge variant={data.present ? 'default' : 'outline'} className="mt-1">
                          {data.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Questions */}
              {creatorPatterns?.engagementQuestions && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Engagement Questions</span>
                    <Badge variant="outline">
                      {creatorPatterns.engagementQuestions.count || 0} total
                    </Badge>
                  </div>
                  {creatorPatterns.engagementQuestions.questions?.length > 0 && (
                    <div className="space-y-1">
                      {creatorPatterns.engagementQuestions.questions.slice(0, 3).map((q, i) => (
                        <div key={i} className="text-xs text-muted-foreground italic">
                          "{q}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Transition Phrases */}
              {creatorPatterns?.transitionPhrases && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Transition Styles</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(creatorPatterns.transitionPhrases).map(([type, data]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}: {data.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Content Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vocabulary Diversity */}
              {quality?.vocabularyDiversity && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vocabulary Diversity</span>
                    <Badge variant="outline">
                      {quality.vocabularyDiversity.level || 'Moderate'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>Unique words: {quality.vocabularyDiversity.uniqueWords || 0}</div>
                    <div>Richness: {quality.vocabularyDiversity.richnessScore || 0}</div>
                  </div>
                </div>
              )}

              {/* Filler Words */}
              {quality?.fillerWordUsage && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Filler Word Usage</span>
                    <Badge variant={quality.fillerWordUsage.level === 'low' ? 'success' : 'outline'}>
                      {quality.fillerWordUsage.level || 'Low'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {quality.fillerWordUsage.density || 0}% of total words
                  </div>
                  {quality.fillerWordUsage.fillers && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(quality.fillerWordUsage.fillers)
                        .filter(([_, count]) => count > 0)
                        .slice(0, 5)
                        .map(([word, count]) => (
                          <Badge key={word} variant="outline" className="text-xs">
                            {word}: {count}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sentence Complexity */}
              {quality?.averageSentenceComplexity && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Sentence Complexity</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Simple: {quality.averageSentenceComplexity.distribution?.simple || 0}
                    </Badge>
                    <Badge variant="outline">
                      Moderate: {quality.averageSentenceComplexity.distribution?.moderate || 0}
                    </Badge>
                    <Badge variant="outline">
                      Complex: {quality.averageSentenceComplexity.distribution?.complex || 0}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Consistency Score */}
              {quality?.consistencyScore && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Style Consistency</span>
                    <span>{quality.consistencyScore.score || 0}%</span>
                  </div>
                  <Progress value={quality.consistencyScore.score || 0} className="h-2" />
                  <Badge variant="outline" className="text-xs">
                    {quality.consistencyScore.level || 'Moderate'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fingerprint Tab */}
        <TabsContent value="fingerprint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-yellow-400" />
                Voice Fingerprint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Core Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {fingerprint?.metrics?.avgSentenceLength || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg sentence</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {fingerprint?.metrics?.questionFrequency || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {fingerprint?.metrics?.speakingPace || 150}
                  </div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
              </div>

              {/* Signature Phrases */}
              {fingerprint?.signaturePhrases?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Signature Phrases</span>
                  <div className="space-y-1">
                    {fingerprint.signaturePhrases.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">"{item.phrase}"</span>
                        <Badge variant="outline" className="text-xs">
                          {item.count}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Vocabulary */}
              {fingerprint?.topVocabulary?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Distinctive Vocabulary</span>
                  <div className="flex flex-wrap gap-1">
                    {fingerprint.topVocabulary.slice(0, 15).map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {item.word} ({item.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Personality Markers */}
              {fingerprint?.uniqueIdentifiers?.personalityMarkers && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Personality Markers</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(fingerprint.uniqueIdentifiers.personalityMarkers).map(([trait, count]) => (
                      <div key={trait} className="flex justify-between">
                        <span className="capitalize">{trait}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ icon, label, value, subtext }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">{icon}</div>
          <div className="text-right">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}