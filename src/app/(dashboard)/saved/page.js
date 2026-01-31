'use client';

import { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Eye,
  ThumbsUp,
  Clock,
  Trash2,
  Filter,
  Search,
  PlayCircle,
  CheckCircle,
  Circle,
  SortAsc,
  SortDesc,
  Calendar,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaticCard } from '@/components/ui/static-card';
import { toast } from 'sonner';

export default function SavedVideosPage() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWatched, setFilterWatched] = useState('all'); // all, watched, unwatched
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, title
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [bulkAction, setBulkAction] = useState(null);

  useEffect(() => {
    fetchSavedVideos();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchTerm, filterWatched, sortBy]);

  const fetchSavedVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/videos/saved');
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      } else if (response.status === 401) {
        toast.error('Please sign in to view saved videos');
      } else {
        throw new Error('Failed to fetch saved videos');
      }
    } catch (error) {
      console.error('Error fetching saved videos:', error);
      toast.error('Failed to load saved videos');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let filtered = [...videos];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.video_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channel_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply watched filter
    if (filterWatched === 'watched') {
      filtered = filtered.filter(video => video.watched);
    } else if (filterWatched === 'unwatched') {
      filtered = filtered.filter(video => !video.watched);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.saved_at) - new Date(b.saved_at));
        break;
      case 'title':
        filtered.sort((a, b) => a.video_title.localeCompare(b.video_title));
        break;
    }

    setFilteredVideos(filtered);
  };

  const handleWatchVideo = async (video) => {
    // Generate YouTube URL
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.video_id}`;
    
    // Mark as watched
    if (!video.watched) {
      await handleMarkWatched(video, true);
    }

    // Track analytics
    try {
      await fetch('/api/videos/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.video_id,
          videoTitle: video.video_title,
          channelName: video.channel_name,
          topicCategory: video.topic_category,
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

  const handleMarkWatched = async (video, watched) => {
    try {
      const response = await fetch('/api/videos/saved', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.video_id,
          watched
        })
      });

      if (response.ok) {
        setVideos(prev => prev.map(v =>
          v.video_id === video.video_id ? { ...v, watched } : v
        ));
        toast.success(watched ? 'Marked as watched' : 'Marked as unwatched');
      } else {
        throw new Error('Failed to update video');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    }
  };

  const handleDeleteVideo = async (video) => {
    try {
      const response = await fetch(`/api/videos/saved?videoId=${video.video_id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setVideos(prev => prev.filter(v => v.video_id !== video.video_id));
        toast.success('Video removed from saved list');
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to remove video');
    }
  };

  const handleBulkDelete = async () => {
    setBulkAction('deleting');
    const videosToDelete = Array.from(selectedVideos);
    
    try {
      for (const videoId of videosToDelete) {
        await fetch(`/api/videos/saved?videoId=${videoId}`, {
          method: 'DELETE'
        });
      }
      
      setVideos(prev => prev.filter(v => !selectedVideos.has(v.video_id)));
      setSelectedVideos(new Set());
      toast.success(`Removed ${videosToDelete.length} videos`);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Failed to remove some videos');
    } finally {
      setBulkAction(null);
    }
  };

  const toggleVideoSelection = (videoId) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const selectAllVideos = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(filteredVideos.map(v => v.video_id)));
    }
  };

  const generateSessionId = () => {
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

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Bookmark className="h-12 w-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Loading saved videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Static Background - no animations for performance */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
          <Bookmark className="h-10 w-10 text-purple-400" />
          Saved Videos
        </h1>
        <p className="text-gray-400">Manage your watch later list</p>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 space-y-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search saved videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterWatched}
              onChange={(e) => setFilterWatched(e.target.value)}
              className="glass px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="all">All Videos</option>
              <option value="unwatched">Unwatched</option>
              <option value="watched">Watched</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVideos.size > 0 && (
          <div className="flex items-center justify-between p-3 glass rounded-lg bg-purple-500/10">
            <span className="text-white">
              {selectedVideos.size} video{selectedVideos.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedVideos(new Set())}
              >
                Clear Selection
              </Button>
              <Button
                size="sm"
                className="glass-button bg-red-500/20 text-red-400 hover:bg-red-500/30"
                onClick={handleBulkDelete}
                disabled={bulkAction === 'deleting'}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="glass-card p-4 text-center">
          <Video className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{videos.length}</p>
          <p className="text-xs text-gray-400">Total Saved</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Circle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">
            {videos.filter(v => !v.watched).length}
          </p>
          <p className="text-xs text-gray-400">Unwatched</p>
        </div>
        <div className="glass-card p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">
            {videos.filter(v => v.watched).length}
          </p>
          <p className="text-xs text-gray-400">Watched</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Calendar className="h-8 w-8 text-pink-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">
            {videos.length > 0 ? 
              Math.ceil((Date.now() - new Date(videos[videos.length - 1].saved_at)) / (1000 * 60 * 60 * 24))
              : 0
            }
          </p>
          <p className="text-xs text-gray-400">Days Active</p>
        </div>
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <div className="glass-card p-12 text-center animate-reveal" style={{ animationDelay: '0.3s' }}>
          <Bookmark className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || filterWatched !== 'all' 
              ? 'No videos match your filters' 
              : 'No saved videos yet'}
          </h3>
          <p className="text-gray-400">
            {searchTerm || filterWatched !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start saving videos from the trending page to watch later'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-reveal" style={{ animationDelay: '0.3s' }}>
          {/* Select All */}
          <div className="flex items-center gap-3 px-2">
            <button
              onClick={selectAllVideos}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              {selectedVideos.size === filteredVideos.length ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="text-sm">Select All</span>
            </button>
          </div>

          {/* Videos */}
          {filteredVideos.map((video) => {
            const isSelected = selectedVideos.has(video.video_id);
            
            return (
              <div 
                key={video.video_id} 
                className={`glass-card p-4 flex gap-4 transition-all ${
                  isSelected ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <button
                  onClick={() => toggleVideoSelection(video.video_id)}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                  {isSelected ? (
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>

                <img 
                  src={video.thumbnail_url || '/youtube-default.svg'} 
                  alt={video.video_title}
                  className="w-32 h-20 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                    {video.video_title}
                    {video.watched && (
                      <span className="text-xs px-2 py-1 rounded-full glass bg-green-500/20 text-green-400">
                        Watched
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">
                    {video.channel_name} • Saved {new Date(video.saved_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-4">
                    {video.views && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views}
                      </span>
                    )}
                    {video.likes && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {video.likes}
                      </span>
                    )}
                    {video.duration && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </span>
                    )}
                  </div>
                  {video.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">{video.notes}</p>
                  )}
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
                    variant="ghost"
                    className={`text-gray-400 hover:text-white ${
                      video.watched ? 'hover:bg-yellow-500/20' : 'hover:bg-green-500/20'
                    }`}
                    onClick={() => handleMarkWatched(video, !video.watched)}
                  >
                    {video.watched ? (
                      <>
                        <Circle className="h-3 w-3 mr-1" />
                        Unwatch
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Watched
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                    onClick={() => handleDeleteVideo(video)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}