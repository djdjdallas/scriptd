'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Star, Clock, Users, TrendingUp, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function VideoIdeasGenerator({ channelId }) {
  const [ideas, setIdeas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('viral');

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/video-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId })
      });
      
      const data = await response.json();
      if (data.success) {
        setIdeas(data.ideas);
        toast.success('Video ideas generated!');
      } else {
        toast.error(data.error || 'Failed to generate ideas');
      }
    } catch (error) {
      toast.error('Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const categories = [
    { id: 'viral', label: '🔥 Viral Potential', key: 'viralPotentialIdeas' },
    { id: 'series', label: '📺 Series Ideas', key: 'seriesIdeas' },
    { id: 'trending', label: '📈 Trending', key: 'trendingAdaptations' },
    { id: 'evergreen', label: '🌲 Evergreen', key: 'evergreenContent' },
    { id: 'quick', label: '⚡ Quick Wins', key: 'quickWins' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            AI Video Ideas Generator
          </h2>
          <p className="text-gray-400 mt-1">
            Get personalized video ideas based on your channel's performance
          </p>
        </div>
        <Button
          onClick={generateIdeas}
          disabled={loading}
          className="bg-gradient-to-r from-yellow-500 to-orange-500"
        >
          {loading ? 'Generating...' : 'Generate Ideas'}
        </Button>
      </div>

      {/* Category Tabs */}
      {ideas && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'bg-purple-600' : ''}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-pulse">
                <Lightbulb className="h-12 w-12 text-yellow-400" />
              </div>
              <p className="text-gray-400">Generating creative video ideas...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ideas Display */}
      {ideas && !loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {ideas[categories.find(c => c.id === selectedCategory)?.key]?.map((idea, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800 hover:border-purple-700 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-white flex-1">
                    {idea.title || idea.seriesName}
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(idea.title || idea.seriesName)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-4">
                  {idea.concept}
                </p>
                
                {idea.hook && (
                  <div className="bg-purple-900/20 border border-purple-800 rounded p-3 mb-4">
                    <p className="text-xs text-purple-400 mb-1">Hook:</p>
                    <p className="text-sm text-white">{idea.hook}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {idea.viralScore && (
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {idea.viralScore}% viral
                    </Badge>
                  )}
                  {idea.estimatedLength && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {idea.estimatedLength}
                    </Badge>
                  )}
                  {idea.expectedViews && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {idea.expectedViews}
                    </Badge>
                  )}
                  {idea.productionComplexity && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        idea.productionComplexity === 'Easy' ? 'text-green-400' :
                        idea.productionComplexity === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}
                    >
                      {idea.productionComplexity}
                    </Badge>
                  )}
                </div>
                
                {idea.thumbnailConcept && (
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold">Thumbnail:</span> {idea.thumbnailConcept}
                  </div>
                )}
                
                {idea.episodes && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">
                      Series with {idea.episodeCount} episodes:
                    </p>
                    <ul className="space-y-1">
                      {idea.episodes.slice(0, 3).map((ep, j) => (
                        <li key={j} className="text-xs text-gray-300">
                          {ep.episodeNumber}. {ep.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}