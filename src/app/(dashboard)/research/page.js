"use client";

import { useState, useEffect } from "react";
import YouTubeTools from "@/components/youtube-tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Youtube,
  Send,
  Copy,
  BookOpen,
  Zap,
  Target,
  Eye,
  AtSign,
  Hash,
  Users,
  PlayCircle,
  BarChart3,
  ChevronRight,
  Loader2,
  Wrench,
  Plus,
  Trash2,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Preset research templates
const RESEARCH_TEMPLATES = [
  {
    id: "content-strategy",
    icon: <Target className="h-5 w-5" />,
    title: "Analyze Content Strategy",
    description: "Get insights into successful content",
    prompt: "Analyze @{channel}'s content strategy",
    category: "analysis",
  },
  {
    id: "viral-titles",
    icon: <Zap className="h-5 w-5" />,
    title: "Generate Engaging Titles",
    description: "Create catchy video titles that convert",
    prompt: "Generate 10 viral video titles for {topic}",
    category: "generation",
  },
  {
    id: "channel-insights",
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Channel Performance Analysis",
    description: "Deep dive into channel metrics and growth",
    prompt: "Analyze @{channel}'s growth strategy and performance",
    category: "analysis",
  },
  {
    id: "thumbnail-ideas",
    icon: <Eye className="h-5 w-5" />,
    title: "Thumbnail Concepts",
    description: "Generate clickable thumbnail ideas",
    prompt: "Create thumbnail concepts for {topic}",
    category: "generation",
  },
  {
    id: "trending-topics",
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Find Trending Topics",
    description: "Discover what's hot in your niche",
    prompt: "Find trending topics in {niche}",
    category: "research",
  },
  {
    id: "competitor-analysis",
    icon: <Users className="h-5 w-5" />,
    title: "Competitor Analysis",
    description: "Compare channels and find gaps",
    prompt: "Compare @{channel1} vs @{channel2}",
    category: "analysis",
  },
  {
    id: "video-breakdown",
    icon: <PlayCircle className="h-5 w-5" />,
    title: "Video Performance Analysis",
    description: "Analyze why specific videos went viral",
    prompt: "Analyze this video: {url}",
    category: "analysis",
  },
  {
    id: "hashtag-research",
    icon: <Hash className="h-5 w-5" />,
    title: "Hashtag Research",
    description: "Find the best hashtags for reach",
    prompt: "Find best hashtags for {topic}",
    category: "research",
  },
];

// Prompt library for quick access
const PROMPT_LIBRARY = [
  {
    category: "Channel Analysis",
    prompts: [
      "What makes @MrBeast's videos go viral?",
      "Analyze @PewDiePie's content evolution",
      "Break down @MrBeast's thumbnail strategy",
      "What's @MKBHD's upload schedule pattern?",
    ],
  },
  {
    category: "Content Ideas",
    prompts: [
      "Generate 20 video ideas for tech reviews",
      "Create hooks for fitness content",
      "Suggest series ideas for gaming channels",
      "Generate reaction video concepts",
    ],
  },
  {
    category: "Growth Strategy",
    prompts: [
      "How to grow from 0 to 1000 subscribers",
      "Best times to upload for maximum reach",
      "YouTube Shorts vs Long-form content strategy",
      "Collaboration strategies for small channels",
    ],
  },
  {
    category: "SEO & Discovery",
    prompts: [
      "Optimize video description for SEO",
      "Best keywords for cooking videos",
      "How to rank in YouTube search",
      "Tags strategy for better discovery",
    ],
  },
];

export default function YouTubeResearchPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [channelInput, setChannelInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Initialize session on mount and load sessions
  useEffect(() => {
    loadSessions();
    createSession();
  }, []);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/research/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/research/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Research Chat' })
      });
      
      if (response.ok) {
        const data = await response.json();
        await loadSessions();
        setSessionId(data.session.id);
        setMessages([]);
        toast({
          title: "New chat created",
          description: "Started a new research conversation",
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    }
  };

  const loadSession = async (session) => {
    try {
      const response = await fetch(`/api/research/sessions/${session.id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setSessionId(session.id);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (sessionIdToDelete, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch(`/api/research/sessions?id=${sessionIdToDelete}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadSessions();
        if (sessionIdToDelete === sessionId) {
          setSessionId(null);
          setMessages([]);
        }
        toast({
          title: "Chat deleted",
          description: "Conversation has been removed",
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const createSession = async () => {
    try {
      const response = await fetch("/api/research/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "YouTube Research Session",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.id);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/research/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          sources: data.sources || [],
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        // Reload sessions to update sidebar
        await loadSessions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    let prompt = template.prompt;

    // Replace placeholders based on template
    if (
      template.id === "content-strategy" ||
      template.id === "channel-insights"
    ) {
      if (channelInput) {
        prompt = prompt.replace("{channel}", channelInput);
        sendMessage(prompt);
      } else {
        setInput(prompt.replace("{channel}", "channel_name"));
      }
    } else if (template.id === "video-breakdown") {
      if (videoUrlInput) {
        prompt = prompt.replace("{url}", videoUrlInput);
        sendMessage(prompt);
      } else {
        setInput(prompt.replace("{url}", "video_url"));
      }
    } else {
      setInput(prompt);
    }
  };

  const handleChannelAnalysis = async () => {
    if (!channelInput.trim()) return;

    setIsLoading(true);
    const cleanHandle = channelInput.replace("@", "");
    
    try {
      // First fetch actual channel data from YouTube API
      const channelResponse = await fetch(`/api/youtube/channel?handle=${encodeURIComponent(cleanHandle)}`);
      
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        
        // Create a detailed prompt with real channel data
        const prompt = `Analyze @${cleanHandle}'s YouTube channel based on this data:

Channel: ${channelData.title}
Subscribers: ${channelData.statistics?.subscriberCount?.toLocaleString() || 'N/A'}
Total Views: ${channelData.statistics?.viewCount?.toLocaleString() || 'N/A'}
Videos: ${channelData.statistics?.videoCount || 'N/A'}
Description: ${channelData.description?.substring(0, 500) || 'No description'}

Recent Videos:
${channelData.recentVideos?.map((v, i) => 
  `${i + 1}. "${v.title}" - ${v.views?.toLocaleString() || 'N/A'} views`
).join('\n') || 'No recent videos available'}

Please analyze:
1. Content strategy and niche focus
2. Upload frequency and consistency
3. Video performance and engagement patterns
4. Thumbnail and title strategy
5. Growth tactics and audience engagement
6. Strengths and areas for improvement
7. Key success factors`;
        
        sendMessage(prompt);
      } else {
        // Fallback to basic analysis if API fails
        const prompt = `Analyze @${cleanHandle}'s YouTube channel: content strategy, upload frequency, video performance, thumbnail style, and growth tactics. Please provide insights based on publicly available information.`;
        sendMessage(prompt);
      }
    } catch (error) {
      console.error("Error fetching channel data:", error);
      // Fallback to basic analysis
      const prompt = `Analyze @${cleanHandle}'s YouTube channel: content strategy, upload frequency, video performance, thumbnail style, and growth tactics. Please provide insights based on publicly available information.`;
      sendMessage(prompt);
    } finally {
      setChannelInput("");
      setIsLoading(false);
    }
  };

  const handleVideoAnalysis = () => {
    if (!videoUrlInput.trim()) return;

    const prompt = `Analyze this YouTube video: ${videoUrlInput}. Break down the title strategy, thumbnail effectiveness, hook, content structure, and engagement tactics.`;
    sendMessage(prompt);
    setVideoUrlInput("");
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-black/40 border-r border-white/10 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Chat History</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <button
            onClick={createNewSession}
            className="w-full glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-purple-500/60 hover:to-pink-500/60 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No conversations yet</p>
              <p className="text-gray-500 text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all ${
                    sessionId === session.id
                      ? 'glass bg-purple-500/20 ring-2 ring-purple-400'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {session.title}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {session.last_message_preview || session.metadata?.lastMessage || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {new Date(session.updatedAt || session.updated_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {session.messageCount || 0} messages
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-400" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">YouTube Research Assistant</h1>
              <p className="text-gray-400 text-sm">Analyze channels, generate ideas, and research trending content</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Youtube className="h-10 w-10 text-red-400 neon-glow" />
          YouTube Research
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          AI-powered insights for viral content and channel growth
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        {/* Analyze Channel */}
        <div className="glass-card p-6 glass-hover group">
          <div className="flex items-center gap-3 mb-4">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <AtSign className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Analyze Channel
              </h3>
              <p className="text-xs text-gray-400">Deep dive into any YouTube channel</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter @handle or channel name..."
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleChannelAnalysis()
              }
              className="glass-input text-white"
            />
            <Button
              onClick={handleChannelAnalysis}
              disabled={!channelInput.trim() || isLoading}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Analyze Video */}
        <div className="glass-card p-6 glass-hover group">
          <div className="flex items-center gap-3 mb-4">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Analyze Video
              </h3>
              <p className="text-xs text-gray-400">Break down viral video strategies</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube video URL..."
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleVideoAnalysis()}
              className="glass-input text-white"
            />
            <Button
              onClick={handleVideoAnalysis}
              disabled={!videoUrlInput.trim() || isLoading}
              className="glass-button bg-gradient-to-r from-red-500/50 to-orange-500/50 text-white"
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Research Templates */}
      <div className="animate-reveal" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Quick Research Templates
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RESEARCH_TEMPLATES.map((template, index) => (
            <div
              key={template.id}
              className="glass-card p-4 glass-hover cursor-pointer group"
              onClick={() => handleTemplateClick(template)}
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="glass w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform text-purple-400">
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white mb-1 truncate">
                    {template.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat/Library Interface */}
      <div className="glass-card overflow-hidden animate-reveal" style={{ animationDelay: '0.3s' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-white/10 p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'chat'
                    ? 'bg-purple-500/20 text-white ring-2 ring-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Research Chat
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'library'
                    ? 'bg-purple-500/20 text-white ring-2 ring-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Prompt Library
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'tools'
                    ? 'bg-purple-500/20 text-white ring-2 ring-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Wrench className="h-4 w-4" />
                YouTube Tools
              </button>
            </div>
          </div>

          <div className="p-0">
            <TabsContent value="chat" className="m-0">
              <div className="flex flex-col h-[700px]">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="glass w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-10 w-10 text-purple-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Start Your Research
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Ask anything about YouTube channels, content strategy,
                        or video ideas
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "What makes MrBeast's videos viral?",
                          "Generate 10 tech review video ideas",
                          "Best upload schedule for gaming content",
                        ].map((example, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(example)}
                            className="glass-button text-sm px-3 py-2 text-gray-300 hover:text-white"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              message.role === "user"
                                ? "glass bg-purple-500/20 text-white"
                                : "glass text-white"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/20">
                                <p className="text-xs text-white/70 mb-2">
                                  Sources:
                                </p>
                                <div className="space-y-1">
                                  {message.sources.map((source, i) => (
                                    <a
                                      key={i}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-300 hover:text-blue-200 block"
                                    >
                                      {source.title}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="glass p-4 rounded-lg">
                            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask anything about YouTube..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      className="glass-input min-h-[60px] text-white !bg-gray-900/40 dark:!bg-gray-900/60"
                      rows={2}
                    />
                    <Button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Shift+Enter for new line • {messages.length} messages in
                    this session
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="library" className="m-0">
              <ScrollArea className="h-[700px] p-6">
                <div className="space-y-6">
                  {PROMPT_LIBRARY.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        {category.category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.prompts.map((prompt, i) => (
                          <button
                            key={i}
                            className="glass glass-hover p-3 text-left text-gray-300 hover:text-white transition-all group"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            <div className="flex items-start gap-2">
                              <Copy className="h-4 w-4 flex-shrink-0 mt-0.5 group-hover:text-purple-400" />
                              <span className="text-sm">{prompt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tools" className="m-0">
              <div className="p-6">
                <YouTubeTools />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
        </div>
      </div>
    </div>
  );
}
