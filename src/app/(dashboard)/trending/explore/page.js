'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Sparkles,
  Hash,
  Eye,
  ThumbsUp,
  MessageSquare,
  PlayCircle,
  ChevronLeft,
  Copy,
  Download,
  Share2,
  Lightbulb,
  Target,
  Clock,
  BarChart3,
  Zap,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ExploreTrendingTopicPage() {
  const searchParams = useSearchParams();
  const topicName = searchParams.get('topic') || 'AI Tools & Applications';
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [savedVideos, setSavedVideos] = useState(new Set());
  const [savingVideo, setSavingVideo] = useState(null);

  useEffect(() => {
    fetchTopicDetails();
    fetchSavedVideos();
  }, [topicName]);

  const fetchTopicDetails = async () => {
    setLoading(true);
    try {
      // In production, this would fetch detailed data about the specific topic
      // For now, we'll create comprehensive mock data
      const mockTopicData = {
        topic: topicName,
        category: 'Technology',
        growth: '+1,250%',
        searches: '2.5M',
        videos: '15K',
        engagement: 'Very High',
        score: 98,
        hashtags: ['#AITools', '#TechReview', '#AI2024', '#ContentCreation'],
        description: 'Comprehensive reviews and tutorials of the latest AI tools are dominating YouTube',
        
        // Detailed metrics
        metrics: {
          avgViews: '850K',
          avgLikes: '42K',
          avgComments: '3.2K',
          avgDuration: '12:34',
          uploadFrequency: '142 videos/day',
          peakTime: '2-4 PM EST',
          audienceRetention: '68%'
        },
        
        // Top performing videos
        topVideos: [
          {
            id: 1,
            title: 'ChatGPT vs Claude: The Ultimate AI Comparison 2024',
            channel: 'TechVision Pro',
            views: '2.3M',
            likes: '98K',
            comments: '8.5K',
            duration: '15:42',
            thumbnail: '/youtube-default.svg',
            uploadedAt: '2 days ago'
          },
          {
            id: 2,
            title: '10 Mind-Blowing AI Tools You Need to Try RIGHT NOW',
            channel: 'AI Revolution',
            views: '1.8M',
            likes: '76K',
            comments: '5.2K',
            duration: '18:30',
            thumbnail: '/youtube-default.svg',
            uploadedAt: '3 days ago'
          },
          {
            id: 3,
            title: 'How I Automated My Entire Business with AI',
            channel: 'Productivity Master',
            views: '1.2M',
            likes: '52K',
            comments: '3.8K',
            duration: '22:15',
            thumbnail: '/youtube-default.svg',
            uploadedAt: '5 days ago'
          }
        ],
        
        // Content ideas
        contentIdeas: [
          {
            title: 'AI Tools Tier List',
            description: 'Rank popular AI tools from S-tier to F-tier',
            difficulty: 'Easy',
            estimatedViews: '500K-1M'
          },
          {
            title: 'AI vs Human Challenge',
            description: 'Compare AI performance against human skills',
            difficulty: 'Medium',
            estimatedViews: '300K-700K'
          },
          {
            title: '30-Day AI Tool Challenge',
            description: 'Use a different AI tool every day for a month',
            difficulty: 'Hard',
            estimatedViews: '1M-2M'
          },
          {
            title: 'AI Tools for Small Business',
            description: 'Practical AI implementation for entrepreneurs',
            difficulty: 'Medium',
            estimatedViews: '200K-500K'
          }
        ],
        
        // Keywords and tags
        keywords: [
          { word: 'ChatGPT', volume: '5.2M', competition: 'High' },
          { word: 'Claude AI', volume: '2.1M', competition: 'Medium' },
          { word: 'AI tools 2024', volume: '890K', competition: 'Low' },
          { word: 'best AI apps', volume: '1.5M', competition: 'Medium' },
          { word: 'AI automation', volume: '670K', competition: 'Low' }
        ],
        
        // Best practices
        bestPractices: [
          'Use eye-catching thumbnails with AI tool logos',
          'Include timestamps for different tools/sections',
          'Show real-world examples and use cases',
          'Compare multiple tools side-by-side',
          'Include pricing information and free alternatives',
          'Add affiliate links in description (with disclosure)',
          'Create follow-up tutorials for specific tools'
        ]
      };
      
      setTopicData(mockTopicData);
    } catch (error) {
      console.error('Error fetching topic details:', error);
      toast.error('Failed to load topic details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedVideos = async () => {
    try {
      const response = await fetch('/api/videos/saved');
      if (response.ok) {
        const data = await response.json();
        const savedVideoIds = new Set(data.videos.map(v => v.video_id));
        setSavedVideos(savedVideoIds);
      }
    } catch (error) {
      console.error('Error fetching saved videos:', error);
    }
  };

  const handleWatchVideo = async (video) => {
    // Generate YouTube URL (we'll need the actual video ID from YouTube API)
    // For now, using a mock video ID - in production, this would come from the API
    const videoId = video.youtubeId || 'dQw4w9WgXcQ'; // Mock ID
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Track analytics
    try {
      await fetch('/api/videos/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id.toString(),
          videoTitle: video.title,
          channelName: video.channel,
          topicCategory: topicData?.category || 'unknown',
          actionType: 'watch',
          sessionId: generateSessionId()
        })
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }

    // Open YouTube in new tab
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveVideo = async (video) => {
    setSavingVideo(video.id);
    
    try {
      if (savedVideos.has(video.id.toString())) {
        // Unsave the video
        const response = await fetch(`/api/videos/saved?videoId=${video.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSavedVideos(prev => {
            const newSet = new Set(prev);
            newSet.delete(video.id.toString());
            return newSet;
          });
          toast.success('Video removed from saved list');
        } else {
          throw new Error('Failed to unsave video');
        }
      } else {
        // Save the video
        const response = await fetch('/api/videos/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: video.id.toString(),
            videoTitle: video.title,
            channelName: video.channel,
            channelId: video.channelId,
            thumbnailUrl: video.thumbnail,
            duration: video.duration,
            views: video.views,
            likes: video.likes,
            topicCategory: topicData?.category || 'unknown'
          })
        });

        if (response.ok) {
          setSavedVideos(prev => {
            const newSet = new Set(prev);
            newSet.add(video.id.toString());
            return newSet;
          });
          toast.success('Video saved for later');
        } else if (response.status === 401) {
          toast.error('Please sign in to save videos');
        } else {
          throw new Error('Failed to save video');
        }
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to update saved status');
    } finally {
      setSavingVideo(null);
    }
  };

  const generateSessionId = () => {
    // Generate a simple session ID for analytics
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return null;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'videos', label: 'Top Videos', icon: PlayCircle },
    { id: 'ideas', label: 'Content Ideas', icon: Lightbulb },
    { id: 'keywords', label: 'Keywords', icon: Hash },
    { id: 'best-practices', label: 'Best Practices', icon: CheckCircle }
  ];

  if (loading || !topicData) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4">
            <TrendingUp className="h-full w-full" />
          </div>
          <p className="text-white text-lg">Loading topic insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <Link href="/trending">
          <Button variant="ghost" className="glass-button mb-4 text-gray-400 hover:text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Trending
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Hash className="h-10 w-10 text-purple-400" />
              {topicData.topic}
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-gray-400 mt-2">{topicData.description}</p>
          </div>
          <div className="flex gap-2">
            <Button className="glass-button text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              <Zap className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{topicData.growth}</span>
          </div>
          <p className="text-xs text-gray-400">Growth Rate</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{topicData.searches}</span>
          </div>
          <p className="text-xs text-gray-400">Search Volume</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Video className="h-5 w-5 text-red-400" />
            <span className="text-2xl font-bold text-white">{topicData.videos}</span>
          </div>
          <p className="text-xs text-gray-400">Videos Created</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{topicData.score}</span>
          </div>
          <p className="text-xs text-gray-400">Trending Score</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="glass-card p-2 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="flex gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <div className="animate-reveal" style={{ animationDelay: '0.3s' }}>
        {activeSection === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Views</span>
                  <span className="text-white font-bold">{topicData.metrics.avgViews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Likes</span>
                  <span className="text-white font-bold">{topicData.metrics.avgLikes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Comments</span>
                  <span className="text-white font-bold">{topicData.metrics.avgComments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Optimal Duration</span>
                  <span className="text-white font-bold">{topicData.metrics.avgDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Upload Frequency</span>
                  <span className="text-white font-bold">{topicData.metrics.uploadFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Upload Time</span>
                  <span className="text-white font-bold">{topicData.metrics.peakTime}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Hash className="h-5 w-5 text-purple-400" />
                Trending Hashtags
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {topicData.hashtags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => copyToClipboard(tag)}
                    className="glass px-3 py-2 rounded-full text-purple-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    {tag}
                    <Copy className="h-3 w-3" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">Click to copy hashtags</p>
            </div>
          </div>
        )}

        {activeSection === 'videos' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-red-400" />
              Top Performing Videos
            </h3>
            {topicData.topVideos.map((video) => {
              const isSaved = savedVideos.has(video.id.toString());
              const isSaving = savingVideo === video.id;
              
              return (
                <div key={video.id} className="glass-card p-4 flex gap-4">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-32 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{video.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{video.channel} • {video.uploadedAt}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {video.likes}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {video.comments}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      className="glass-button text-white hover:bg-red-500/20 transition-all"
                      onClick={() => handleWatchVideo(video)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Watch
                    </Button>
                    <Button 
                      size="sm" 
                      className={`glass-button transition-all ${
                        isSaved 
                          ? 'text-yellow-400 hover:text-white hover:bg-yellow-500/20' 
                          : 'text-gray-400 hover:text-yellow-400 hover:bg-white/10'
                      }`}
                      onClick={() => handleSaveVideo(video)}
                      disabled={isSaving}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <Bookmark className="h-3 w-3 mr-1" />
                      )}
                      {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSection === 'ideas' && (
          <div className="grid md:grid-cols-2 gap-4">
            {topicData.contentIdeas.map((idea, index) => (
              <TiltCard key={index}>
                <div className="glass-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <span className={`text-xs px-2 py-1 rounded-full glass ${
                      idea.difficulty === 'Easy' ? 'text-green-400' :
                      idea.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {idea.difficulty}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">{idea.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{idea.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Est. Views: {idea.estimatedViews}</span>
                    <Button size="sm" className="glass-button text-white">
                      Use Idea
                    </Button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}

        {activeSection === 'keywords' && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-purple-400" />
              High-Value Keywords
            </h3>
            <div className="space-y-3">
              {topicData.keywords.map((keyword, index) => (
                <div key={index} className="glass p-4 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium">{keyword.word}</p>
                    <p className="text-xs text-gray-400">Volume: {keyword.volume}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-3 py-1 rounded-full glass ${
                      keyword.competition === 'Low' ? 'text-green-400' :
                      keyword.competition === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {keyword.competition} Competition
                    </span>
                    <Button size="sm" className="glass-button text-white">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'best-practices' && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Best Practices for This Topic
            </h3>
            <div className="space-y-3">
              {topicData.bestPractices.map((practice, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </div>
                  <p className="text-gray-300">{practice}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-reveal" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Ready to create content?</h3>
            <p className="text-gray-400 text-sm">Use these insights to create viral content on this trending topic</p>
          </div>
          <div className="flex gap-3">
            <Button className="glass-button text-white">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Generate Script
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}