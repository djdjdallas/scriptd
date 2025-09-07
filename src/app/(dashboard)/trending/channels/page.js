'use client';

import { useState, useEffect } from 'react';
import { 
  Youtube, 
  Users, 
  Eye, 
  TrendingUp,
  ChevronLeft,
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
  const [sortBy, setSortBy] = useState('growth'); // growth, subscribers, views, upload
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchAllChannels();
  }, [filterCategory]); // Re-fetch when category changes

  useEffect(() => {
    filterAndSortChannels();
  }, [channels, searchQuery, sortBy]); // Remove filterCategory from here since we're fetching new data

  const fetchAllChannels = async () => {
    setLoading(true);
    try {
      // Include category parameter in API call
      const params = new URLSearchParams({
        limit: '50',
        category: filterCategory
      });
      const response = await fetch(`/api/trending?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setChannels(data.data.trendingChannels || []);
      } else {
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
    // Extended mock data
    const mockChannels = [
      {
        id: 1,
        name: 'TechVision Pro',
        handle: '@techvisionpro',
        subscribers: '2.5M',
        growth: '+45K/week',
        category: 'Technology',
        thumbnail: '/youtube-default.svg',
        avgViews: '500K',
        uploadFreq: '3/week',
        topVideo: 'ChatGPT vs Claude: Ultimate Comparison',
        verified: true,
        description: 'Tech reviews and AI tutorials'
      },
      {
        id: 2,
        name: 'FitLife Journey',
        handle: '@fitlifejourney',
        subscribers: '890K',
        growth: '+22K/week',
        category: 'Fitness',
        thumbnail: '/youtube-default.svg',
        avgViews: '250K',
        uploadFreq: 'Daily',
        topVideo: '30 Day Transformation Challenge',
        verified: false,
        description: 'Fitness transformations and workout guides'
      },
      {
        id: 3,
        name: 'Gaming Universe',
        handle: '@gaminguniverse',
        subscribers: '3.2M',
        growth: '+38K/week',
        category: 'Gaming',
        thumbnail: '/youtube-default.svg',
        avgViews: '750K',
        uploadFreq: '5/week',
        topVideo: 'New Game World Record Speedrun',
        verified: true,
        description: 'Gaming content and speedruns'
      }
    ];
    setChannels(mockChannels);
  };

  const filterAndSortChannels = () => {
    let filtered = [...channels];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.topVideo.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
          All Rising Channels
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Discover {filteredChannels.length} rapidly growing YouTube channels
        </p>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6 space-y-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels or videos..."
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
            >
              <option value="growth">Growth Rate</option>
              <option value="subscribers">Subscribers</option>
              <option value="views">Average Views</option>
              <option value="upload">Upload Frequency</option>
            </select>
          </div>

          {/* Refresh */}
          <Button onClick={fetchAllChannels} className="glass-button text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Category Filter */}
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
      </div>

      {/* Channels Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredChannels.map((channel, index) => (
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
                    <Button size="sm" className="glass-button flex-1 text-white">
                      <Eye className="mr-1 h-3 w-3" />
                      Analyze
                    </Button>
                    <Button size="sm" className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 flex-1 text-white">
                      <Users className="mr-1 h-3 w-3" />
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-lg">No channels found matching your criteria.</p>
          <Button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }} className="glass-button text-white mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}