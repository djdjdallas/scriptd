'use client';

import { useState, useEffect } from 'react';
import { 
  Youtube, 
  Users, 
  Eye, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Award,
  Search,
  SortDesc,
  Filter,
  Loader2,
  RefreshCw,
  Sparkles,
  PlayCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AllRisingChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState('growth'); // growth, subscribers, views, upload
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchMode, setSearchMode] = useState(false); // Toggle between trending and search results
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalChannels: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchAllChannels();
  }, [filterCategory, currentPage]); // Re-fetch when category or page changes

  useEffect(() => {
    // Reset to page 1 when category changes
    setCurrentPage(1);
  }, [filterCategory]);

  useEffect(() => {
    filterAndSortChannels();
  }, [channels, searchQuery, sortBy]); // Remove filterCategory from here since we're fetching new data

  const fetchAllChannels = async () => {
    setLoading(true);
    try {
      // Include category and pagination parameters in API call
      const params = new URLSearchParams({
        limit: '9',
        category: filterCategory,
        page: currentPage.toString()
      });
      const response = await fetch(`/api/trending?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setChannels(data.data.trendingChannels || []);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      } else {
        toast.error('Failed to load trending channels from YouTube');
        loadMockChannels();
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('Failed to load trending channels');
      loadMockChannels();
    } finally {
      setLoading(false);
    }
  };

  const loadMockChannels = () => {
    // No fallback data - show empty state
    setChannels([]);
    setPagination({
      totalPages: 0,
      totalChannels: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
  };

  const searchYouTubeChannels = async () => {
    if (!youtubeSearchQuery.trim()) {
      toast.error('Please enter a channel name to search');
      return;
    }

    console.log('🔍 Starting YouTube search for:', youtubeSearchQuery);
    setSearching(true);
    setSearchMode(true);
    try {
      const response = await fetch(`/api/channels/search?q=${encodeURIComponent(youtubeSearchQuery)}&limit=20`);
      const data = await response.json();
      console.log('📦 Raw API response:', data);

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('YouTube search is a premium feature');
        } else {
          throw new Error(data.error || 'Failed to search channels');
        }
        return;
      }

      if (data.channels && data.channels.length > 0) {
        console.log(`📊 Found ${data.channels.length} channels, source: ${data.source}`);
        
        // Transform YouTube search results to match trending channel format
        const transformedChannels = data.channels.map((channel, idx) => {
          console.log(`\n🎬 Processing channel ${idx + 1}:`, channel.title);
          console.log('  Raw channel object:', channel);
          
          // Use channelId for YouTube ID, but check if it's a valid YouTube ID
          // YouTube channel IDs typically start with 'UC' and are 24 characters long
          let youtubeChannelId = channel.channelId;
          
          console.log('  Initial channelId:', youtubeChannelId);
          console.log('  Initial id:', channel.id);
          
          // If channelId looks like a UUID (contains dashes), it's from the database
          // and we should check if there's a valid YouTube ID
          if (youtubeChannelId && youtubeChannelId.includes('-')) {
            console.log('  ❌ channelId looks like UUID (has dashes), rejecting:', youtubeChannelId);
            youtubeChannelId = null;
          }
          
          // Fallback to channel.id only if it looks like a YouTube ID
          if (!youtubeChannelId && channel.id && !channel.id.includes('-')) {
            console.log('  🔄 Falling back to channel.id:', channel.id);
            youtubeChannelId = channel.id;
          }
          
          const finalId = youtubeChannelId || channel.channelId || channel.id;
          
          console.log('  ✅ Final decision:');
          console.log('    - youtubeChannelId:', youtubeChannelId);
          console.log('    - finalId for component:', finalId);
          console.log('    - Is valid YouTube ID?', !!youtubeChannelId);
          console.log('    - Will Analyze work?', finalId && !finalId.includes('-') && !finalId.startsWith('demo') && finalId.length > 10);
          
          return {
            id: finalId, // Use YouTube ID if available
            name: channel.title,
            handle: channel.customUrl || '',
            description: channel.description?.substring(0, 150) || '',
            thumbnail: channel.thumbnails?.high?.url || channel.thumbnails?.default?.url || '/youtube-default.svg',
            category: 'Search Result',
            subscribers: formatSubscriberCount(channel.subscriberCount),
            growth: 'N/A',
            avgViews: formatViewCount(channel.viewCount, channel.videoCount),
            uploadFreq: 'N/A',
            topVideo: '',
            verified: false,
            isFromDatabase: channel.isFromDatabase,
            hasAnalysis: channel.hasAnalysis,
            hasVoiceProfile: channel.hasVoiceProfile,
            hasValidYouTubeId: !!youtubeChannelId
          };
        });

        setChannels(transformedChannels);
        setPagination({
          totalPages: 1,
          totalChannels: transformedChannels.length,
          hasNextPage: false,
          hasPrevPage: false
        });
        toast.success(`Found ${transformedChannels.length} channels`);
      } else {
        setChannels([]);
        toast.info('No channels found matching your search');
      }
    } catch (error) {
      console.error('Error searching YouTube channels:', error);
      toast.error('Failed to search YouTube channels');
    } finally {
      setSearching(false);
    }
  };

  const formatSubscriberCount = (count) => {
    if (!count) return '0';
    const num = parseInt(count);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatViewCount = (viewCount, videoCount) => {
    if (!viewCount || !videoCount) return '0';
    const avgViews = parseInt(viewCount) / parseInt(videoCount);
    if (avgViews >= 1000000) return `${(avgViews / 1000000).toFixed(1)}M`;
    if (avgViews >= 1000) return `${(avgViews / 1000).toFixed(1)}K`;
    return Math.round(avgViews).toString();
  };

  const clearSearch = () => {
    setYoutubeSearchQuery('');
    setSearchMode(false);
    setCurrentPage(1);
    fetchAllChannels();
  };

  const filterAndSortChannels = () => {
    let filtered = [...channels];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(channel => {
        const nameMatch = channel.name?.toLowerCase().includes(query);
        const handleMatch = channel.handle?.toLowerCase().includes(query);
        const videoMatch = channel.topVideo?.toLowerCase().includes(query);
        const categoryMatch = channel.category?.toLowerCase().includes(query);
        const descriptionMatch = channel.description?.toLowerCase().includes(query);
        
        return nameMatch || handleMatch || videoMatch || categoryMatch || descriptionMatch;
      });
    }

    // Category filtering is now handled by the API, no need to filter here

    // Apply sorting
    switch (sortBy) {
      case 'subscribers':
        filtered.sort((a, b) => {
          const aSubs = parseFloat(a.subscribers.replace('M', '').replace('K', ''));
          const bSubs = parseFloat(b.subscribers.replace('M', '').replace('K', ''));
          return bSubs - aSubs;
        });
        break;
      case 'views':
        filtered.sort((a, b) => {
          const aViews = parseFloat(a.avgViews.replace('M', '').replace('K', ''));
          const bViews = parseFloat(b.avgViews.replace('M', '').replace('K', ''));
          return bViews - aViews;
        });
        break;
      case 'upload':
        const uploadOrder = { 'Daily': 7, '5/week': 5, '4/week': 4, '3/week': 3, '2/week': 2, 'Weekly': 1 };
        filtered.sort((a, b) => {
          return (uploadOrder[b.uploadFreq] || 0) - (uploadOrder[a.uploadFreq] || 0);
        });
        break;
      default: // growth
        filtered.sort((a, b) => {
          const aGrowth = parseInt(a.growth.replace(/[^0-9]/g, ''));
          const bGrowth = parseInt(b.growth.replace(/[^0-9]/g, ''));
          return bGrowth - aGrowth;
        });
    }

    setFilteredChannels(filtered);
  };

  const categories = [
    'all', 'Technology', 'Gaming', 'Music', 'Education', 
    'Entertainment', 'Lifestyle', 'Food', 'Fitness', 'Travel'
  ];

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading rising channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float" />
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
        
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Youtube className="h-10 w-10 text-red-400" />
          {searchMode ? 'YouTube Search Results' : 'All Rising Channels'}
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          {searchMode 
            ? `Found ${filteredChannels.length} channels matching "${youtubeSearchQuery}"`
            : `Discover ${pagination.totalChannels || filteredChannels.length} rapidly growing YouTube channels`
          }
        </p>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6 space-y-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        {/* YouTube Channel Search */}
        <div className="border-b border-white/10 pb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Search YouTube Channels</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
              <input
                type="text"
                placeholder="Search for any YouTube channel..."
                value={youtubeSearchQuery}
                onChange={(e) => setYoutubeSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchYouTubeChannels()}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <Button 
              onClick={searchYouTubeChannels} 
              disabled={searching}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search YouTube
                </>
              )}
            </Button>
            {searchMode && (
              <Button 
                onClick={clearSearch}
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Filter current results */}
          <div className="flex-1">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter current results..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortDesc className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={searchMode}
            >
              <option value="growth">Growth Rate</option>
              <option value="subscribers">Subscribers</option>
              <option value="views">Average Views</option>
              <option value="upload">Upload Frequency</option>
            </select>
          </div>

          {/* Refresh */}
          <Button 
            onClick={searchMode ? clearSearch : fetchAllChannels} 
            className="glass-button text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {searchMode ? 'Back to Trending' : 'Refresh'}
          </Button>
        </div>

        {/* Category Filter - Only show when not in search mode */}
        {!searchMode && (
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white'
                      : 'glass text-gray-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Channels Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredChannels.map((channel, index) => {
          // Debug logging for button state
          const hasId = !!channel.id;
          const notUndefined = channel.id !== 'undefined';
          const notDemo = !channel.id?.startsWith('demo');
          const notUUID = !channel.id?.includes('-');
          const longEnough = channel.id?.length > 10;
          const isValidForAnalyze = hasId && notUndefined && notDemo && notUUID && longEnough;
          
          if (searchMode) {
            console.log(`\n🎯 Rendering channel: ${channel.name}`);
            console.log('  Button validation:');
            console.log(`    - Has ID: ${hasId} (${channel.id})`);
            console.log(`    - Not 'undefined': ${notUndefined}`);
            console.log(`    - Not demo: ${notDemo}`);
            console.log(`    - Not UUID: ${notUUID}`);
            console.log(`    - Length > 10: ${longEnough} (length: ${channel.id?.length})`);
            console.log(`    - ✅ Valid for Analyze: ${isValidForAnalyze}`);
          }
          return (
          <TiltCard key={channel.id || index}>
            <div className="glass-card p-6 animate-reveal" style={{ animationDelay: `${0.2 + (index % 9) * 0.05}s` }}>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img 
                    src={channel.thumbnail} 
                    alt={channel.name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-400/50"
                    onError={(e) => { e.target.src = '/youtube-default.svg'; }}
                  />
                  {channel.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-semibold text-white text-lg">{channel.name}</h3>
                    <p className="text-sm text-gray-400">{channel.handle}</p>
                    {channel.description && (
                      <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
                    )}
                  </div>
                  
                  <span className="inline-block text-xs glass px-2 py-1 rounded-full text-purple-300 mb-3">
                    {channel.category}
                  </span>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <Users className="h-3 w-3" />
                        Subscribers
                      </div>
                      <p className="text-white font-bold">{channel.subscribers}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Growth
                      </div>
                      <p className="text-green-400 font-bold">{channel.growth}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <Eye className="h-3 w-3" />
                        Avg Views
                      </div>
                      <p className="text-white font-bold">{channel.avgViews}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                        <Clock className="h-3 w-3" />
                        Upload
                      </div>
                      <p className="text-white font-bold">{channel.uploadFreq}</p>
                    </div>
                  </div>

                  <div className="glass p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <PlayCircle className="h-4 w-4 text-red-400" />
                      <p className="text-xs text-gray-400">Latest Hit:</p>
                    </div>
                    <p className="text-sm text-white line-clamp-2">{channel.topVideo}</p>
                  </div>

                  <div className="flex gap-2">
                    {channel.id && 
                     channel.id !== 'undefined' && 
                     !channel.id.startsWith('demo') && 
                     !channel.id.includes('-') && // Not a UUID
                     channel.id.length > 10 ? ( // YouTube IDs are typically 24 chars
                      <Link 
                        href={`/trending/analyze?channelId=${channel.id}&channel=${encodeURIComponent(channel.name)}`}
                        className="flex-1"
                      >
                        <Button size="sm" className="glass-button w-full text-white">
                          <Eye className="mr-1 h-3 w-3" />
                          Analyze
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        size="sm" 
                        className="glass-button flex-1 text-white opacity-50" 
                        disabled
                        title={
                          !channel.id ? "No channel ID available" :
                          channel.id.includes('-') ? "Database channel - YouTube ID required for analysis" :
                          channel.id.startsWith('demo') ? "Demo channel - analysis not available" :
                          "Invalid channel ID format"
                        }
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Analyze
                      </Button>
                    )}
                    <Link 
                      href={`/trending/follow?channel=${encodeURIComponent(channel.name)}&channelId=${encodeURIComponent(channel.id)}&topic=${encodeURIComponent(channel.category || 'Content Creation')}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 w-full text-white">
                        <Users className="mr-1 h-3 w-3" />
                        Follow Trend
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
          );
        })}
      </div>

      {filteredChannels.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-lg">No channels found matching your criteria.</p>
          <Button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }} className="glass-button text-white mt-4">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination Controls - Only show for trending, not search results */}
      {!searchMode && pagination.totalPages > 1 && (
        <div className="glass-card p-4 mt-8 animate-reveal">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * 9) + 1}-{Math.min(currentPage * 9, pagination.totalChannels)} of {pagination.totalChannels} channels
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="glass-button text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* Show first page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="w-8 h-8 rounded-lg glass text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="text-gray-500 px-1">...</span>}
                  </>
                )}

                {/* Show pages around current page */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === currentPage || 
                           (page >= currentPage - 2 && page <= currentPage + 2);
                  })
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        page === currentPage
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white font-bold'
                          : 'glass text-gray-400 hover:text-white hover:bg-purple-500/20'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Show last page */}
                {currentPage < pagination.totalPages - 2 && (
                  <>
                    {currentPage < pagination.totalPages - 3 && <span className="text-gray-500 px-1">...</span>}
                    <button
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      className="w-8 h-8 rounded-lg glass text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all"
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <Button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
                className="glass-button text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Go to Page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Go to:</span>
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= pagination.totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 px-2 py-1 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}