'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StaticCard } from '@/components/ui/static-card';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Youtube,
  Users,
  Eye,
  Video,
  X,
  Plus,
  Check,
  Loader2,
  Sparkles,
  TrendingUp,
  Link
} from 'lucide-react';

export function ChannelSelector({ selectedChannels, onSelectChannel, onRemoveChannel, maxChannels = 3 }) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularChannels, setPopularChannels] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [inputMode, setInputMode] = useState('search'); // 'search' or 'url'
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    fetchPopularChannels();
  }, []);

  const fetchPopularChannels = async () => {
    try {
      const response = await fetch('/api/channels/search?limit=6');
      if (response.ok) {
        const data = await response.json();
        setPopularChannels(data.channels || []);
      }
    } catch (error) {
      console.error('Error fetching popular channels:', error);
    } finally {
      setLoadingPopular(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Check if the input looks like a YouTube URL
    if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
      // Auto-switch to URL mode and process
      setInputMode('url');
      setUrlInput(searchQuery);
      setSearchQuery('');
      await handleUrlAdd(searchQuery);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/channels/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // Make sure we're not accidentally modifying selectedChannels
        const results = data.channels || [];
        console.log('Search results:', results.length, 'channels');
        console.log('Currently selected:', selectedChannels.length, 'channels');
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlAdd = async (url = urlInput) => {
    if (!url?.trim()) {
      setUrlError('Please enter a YouTube channel URL');
      return;
    }

    setIsFetchingUrl(true);
    setUrlError('');

    try {
      const response = await fetch('/api/channels/fetch-by-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setUrlError(data.message || data.error || 'Failed to fetch channel');
        return;
      }

      if (data.channel) {
        // Check if already selected
        const alreadySelected = selectedChannels.some(c => 
          c.youtube_channel_id === data.channel.youtube_channel_id ||
          c.channelId === data.channel.youtube_channel_id
        );

        if (alreadySelected) {
          setUrlError('This channel is already selected');
          return;
        }

        // Add the channel
        onSelectChannel(data.channel);
        setUrlInput('');
        setUrlError('');
        
        // Switch back to search mode after successful add
        setInputMode('search');
      }
    } catch (error) {
      console.error('Error fetching channel by URL:', error);
      setUrlError('Failed to fetch channel. Please check the URL and try again.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const isChannelSelected = (channel) => {
    if (!channel || !selectedChannels || selectedChannels.length === 0) return false;
    
    const channelId = channel.id || channel.channelId;
    if (!channelId) return false;
    
    const isSelected = selectedChannels.some(c => {
      if (!c) return false;
      const selectedId = c.id || c.channelId;
      if (!selectedId) return false;
      
      // Compare IDs as strings to avoid type issues
      return String(selectedId) === String(channelId);
    });
    
    return isSelected;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    const n = parseInt(num);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const ChannelCard = ({ channel }) => {
    const channelId = channel.id || channel.channelId;
    const selected = isChannelSelected(channel);
    
    // Detailed debug to understand the issue
    if (channel.title && channel.title.includes('TroyYaeger')) {
      console.log('TroyYaeger channel debug:', {
        channel,
        channelId,
        selected,
        selectedChannels,
        comparison: selectedChannels.map(c => ({
          id: c.id || c.channelId,
          matches: (c.id || c.channelId) === channelId
        }))
      });
    }
    
    return (
      <StaticCard className="glass-card p-4 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {channel.thumbnails?.default?.url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={channel.thumbnails.default.url}
                  alt={channel.title}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                  }}
                />
                <div className="fallback-icon hidden w-12 h-12 rounded-full bg-gray-700 items-center justify-center absolute inset-0">
                  <Youtube className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Youtube className="h-6 w-6 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <h4 className="font-medium text-white line-clamp-1">{channel.title}</h4>
              <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                {channel.description || 'No description available'}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1 text-gray-400">
                  <Users className="h-3 w-3" />
                  {formatNumber(channel.subscriberCount)}
                </span>
                {channel.viewCount && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Eye className="h-3 w-3" />
                    {formatNumber(channel.viewCount)}
                  </span>
                )}
                {channel.videoCount && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Video className="h-3 w-3" />
                    {formatNumber(channel.videoCount)}
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                {channel.hasAnalysis && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Analyzed
                  </Badge>
                )}
                {channel.isFromDatabase && (
                  <Badge variant="outline" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {selected === true ? (
            <Button
              onClick={() => onRemoveChannel(channelId)}
              size="sm"
              className="glass-button bg-red-500/20 hover:bg-red-500/30"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                console.log('ChannelSelector - Selecting channel:', channel);
                
                // Check if channel has a YouTube ID
                if (!channel.channelId && !channel.youtube_channel_id) {
                  console.log('Channel missing YouTube ID, prompting user to use URL method');
                  // Show toast with instructions
                  toast({
                    title: "YouTube ID Required",
                    description: "Please use the URL input method to add this channel. Switch to URL mode and paste the channel's YouTube URL.",
                    variant: "destructive",
                  });
                  // Auto-switch to URL mode for convenience
                  setInputMode('url');
                  return;
                }
                
                onSelectChannel(channel);
              }}
              disabled={selectedChannels.length >= maxChannels}
              size="sm"
              className={`glass-button ${
                selectedChannels.length >= maxChannels 
                  ? 'bg-gray-500/20 cursor-not-allowed opacity-50' 
                  : 'bg-purple-500/20 hover:bg-purple-500/30'
              }`}
              title={selectedChannels.length >= maxChannels ? `Maximum ${maxChannels} channels allowed` : 'Add channel'}
            >
              {selectedChannels.length >= maxChannels ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </StaticCard>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Select Channels to Remix</h3>
        <p className="text-gray-400">
          Choose up to {maxChannels} successful channels whose strategies you want to combine
        </p>
      </div>

      {/* Selected Channels */}
      {selectedChannels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Selected Channels ({selectedChannels.length}/{maxChannels})
            </h4>
            {selectedChannels.length === maxChannels && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                <Check className="h-3 w-3 mr-1" />
                Maximum reached
              </Badge>
            )}
          </div>
          <div className="grid gap-3">
            {selectedChannels.map((channel, index) => (
              <ChannelCard key={`selected-${channel.id || channel.channelId || index}`} channel={channel} />
            ))}
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Add Channels
          </h4>
          <div className="flex gap-2">
            <Button
              onClick={() => setInputMode('search')}
              size="sm"
              variant={inputMode === 'search' ? 'default' : 'ghost'}
              className={inputMode === 'search' ? 'glass-button bg-purple-500/20' : 'text-gray-400'}
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
            <Button
              onClick={() => setInputMode('url')}
              size="sm"
              variant={inputMode === 'url' ? 'default' : 'ghost'}
              className={inputMode === 'url' ? 'glass-button bg-purple-500/20' : 'text-gray-400'}
            >
              <Link className="h-4 w-4 mr-1" />
              URL
            </Button>
          </div>
        </div>

        {/* Search Input */}
        {inputMode === 'search' && (
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for channels or paste YouTube URL..."
              className="glass-input flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="glass-button"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* URL Input */}
        {inputMode === 'url' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
                placeholder="Paste YouTube channel URL (e.g., youtube.com/@channelname)"
                className="glass-input flex-1"
              />
              <Button
                onClick={() => handleUrlAdd()}
                disabled={isFetchingUrl || !urlInput.trim() || selectedChannels.length >= maxChannels}
                className="glass-button"
              >
                {isFetchingUrl ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
            {urlError && (
              <p className="text-sm text-red-400">{urlError}</p>
            )}
            <div className="text-xs text-gray-500">
              Supported formats: youtube.com/@handle, youtube.com/channel/ID, youtube.com/c/customname
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Search Results
            </h4>
            <Button
              onClick={() => {
                setSearchResults([]);
                setSearchQuery('');
              }}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {searchResults.map((channel, index) => (
              <ChannelCard key={`search-${channel.id || channel.channelId || index}`} channel={channel} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Channels - Always show if channels not maxed out */}
      {(searchResults.length === 0 || selectedChannels.length < maxChannels) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {searchResults.length > 0 ? 'Or Choose From Popular Channels' : 'Popular Channels'}
          </h4>
          {loadingPopular ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="grid gap-3">
              {popularChannels
                .filter(channel => !isChannelSelected(channel))
                .map((channel, index) => (
                  <ChannelCard key={`popular-${channel.id || channel.channelId || index}`} channel={channel} />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Message when max channels selected */}
      {selectedChannels.length === maxChannels && searchResults.length === 0 && (
        <div className="glass-card p-6 text-center">
          <Check className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-2">
            You've selected the maximum {maxChannels} channels
          </p>
          <p className="text-sm text-gray-400">
            Click "Next" to configure your remix, or remove a channel to select a different one
          </p>
        </div>
      )}
    </div>
  );
}