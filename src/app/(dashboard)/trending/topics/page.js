'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Hash, 
  Eye, 
  ArrowUpRight,
  ChevronLeft,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/ui/tilt-card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AllTrendingTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score'); // score, growth, views, engagement
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchAllTopics();
  }, []);

  useEffect(() => {
    filterAndSortTopics();
  }, [topics, searchQuery, sortBy, filterCategory]);

  const fetchAllTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trending?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.data.trendingTopics || []);
      } else {
        loadMockTopics();
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load trending topics');
      loadMockTopics();
    } finally {
      setLoading(false);
    }
  };

  const loadMockTopics = () => {
    // Extended mock data for demonstration
    const mockTopics = [
      {
        id: 1,
        topic: 'AI Tools & Applications',
        category: 'Technology',
        growth: '+1,250%',
        searches: '2.5M',
        videos: '15K',
        engagement: 'Very High',
        hashtags: ['#AITools', '#TechReview', '#AI2024'],
        description: 'Comprehensive reviews and tutorials of the latest AI tools',
        score: 98
      },
      {
        id: 2,
        topic: 'YouTube Growth Strategies',
        category: 'Content Creation',
        growth: '+890%',
        searches: '1.8M',
        videos: '8.2K',
        engagement: 'High',
        hashtags: ['#YouTubeGrowth', '#ContentStrategy', '#Algorithm'],
        description: 'Tips and tricks for growing your YouTube channel',
        score: 92
      },
      {
        id: 3,
        topic: 'Fitness Transformation',
        category: 'Fitness',
        growth: '+650%',
        searches: '3.1M',
        videos: '12K',
        engagement: 'Very High',
        hashtags: ['#FitnessJourney', '#Transformation', '#WorkoutMotivation'],
        description: '30-day and 90-day fitness transformation content',
        score: 89
      },
      // Add more mock topics...
    ];
    setTopics(mockTopics);
  };

  const filterAndSortTopics = () => {
    let filtered = [...topics];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(topic =>
        topic.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(topic =>
        topic.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'growth':
        filtered.sort((a, b) => {
          const aGrowth = parseInt(a.growth.replace(/[^0-9]/g, ''));
          const bGrowth = parseInt(b.growth.replace(/[^0-9]/g, ''));
          return bGrowth - aGrowth;
        });
        break;
      case 'views':
        filtered.sort((a, b) => {
          const aViews = parseFloat(a.searches.replace('M', '').replace('K', ''));
          const bViews = parseFloat(b.searches.replace('M', '').replace('K', ''));
          return bViews - aViews;
        });
        break;
      case 'engagement':
        filtered.sort((a, b) => {
          const engagementOrder = { 'Very High': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
          return (engagementOrder[b.engagement] || 0) - (engagementOrder[a.engagement] || 0);
        });
        break;
      default: // score
        filtered.sort((a, b) => b.score - a.score);
    }

    setFilteredTopics(filtered);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
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
          <p className="text-white text-lg">Loading all trending topics...</p>
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
        
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-purple-400" />
          All Trending Topics
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Explore all {filteredTopics.length} trending topics on YouTube
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
                placeholder="Search topics, hashtags, or descriptions..."
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
              <option value="score">Trending Score</option>
              <option value="growth">Growth Rate</option>
              <option value="views">Search Volume</option>
              <option value="engagement">Engagement</option>
            </select>
          </div>

          {/* Refresh */}
          <Button onClick={fetchAllTopics} className="glass-button text-white">
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

      {/* Topics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic, index) => (
          <TiltCard key={topic.id || index}>
            <div className="glass-card p-6 h-full animate-reveal" style={{ animationDelay: `${0.2 + (index % 9) * 0.05}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 glass rounded-lg flex items-center justify-center">
                    <Hash className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">{topic.category}</span>
                    <h3 className="font-semibold text-white">{topic.topic}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getScoreColor(topic.score)}`}>{topic.score}</p>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4">{topic.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {topic.hashtags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs glass px-2 py-1 rounded-full text-purple-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Growth</p>
                  <p className="text-sm font-bold text-green-400">{topic.growth}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Searches</p>
                  <p className="text-sm font-bold text-white">{topic.searches}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Videos</p>
                  <p className="text-sm font-bold text-white">{topic.videos}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full glass ${
                  topic.engagement === 'Very High' ? 'text-green-400' : 
                  topic.engagement === 'High' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {topic.engagement} Engagement
                </span>
                <Button size="sm" className="glass-button text-white">
                  Explore
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-lg">No topics found matching your criteria.</p>
          <Button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }} className="glass-button text-white mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}