"use client";

import { useState, useEffect } from "react";
import YouTubeTools from "@/components/youtube-tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Link2,
  AtSign,
  FileText,
  Lightbulb,
  Hash,
  Users,
  PlayCircle,
  BarChart3,
  Clock,
  ChevronRight,
  Loader2,
  Plus,
  Wrench,
  Video,
  ThumbsUp,
  Tag,
  Image,
  FileVideo,
  PenTool,
  Download,
  AlertCircle,
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [channelInput, setChannelInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [sessionId, setSessionId] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    createSession();
  }, []);

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
    setSelectedTemplate(template);
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

  const handleChannelAnalysis = () => {
    if (!channelInput.trim()) return;

    const prompt = `Analyze @${channelInput.replace(
      "@",
      ""
    )}'s YouTube channel: content strategy, upload frequency, video performance, thumbnail style, and growth tactics.`;
    sendMessage(prompt);
    setChannelInput("");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-600 rounded-full">
              <Youtube className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              YouTube Research Hub
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Your AI partner for viral YouTube content ideas and channel analysis
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Channel Analysis */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AtSign className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Analyze Channel
                </h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="@MrBeast or channel name..."
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleChannelAnalysis()
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleChannelAnalysis}
                  disabled={!channelInput.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Video Analysis */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Link2 className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">
                  Analyze Video
                </h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube video URL..."
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleVideoAnalysis()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleVideoAnalysis}
                  disabled={!videoUrlInput.trim() || isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <PlayCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Quick Research Templates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RESEARCH_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 cursor-pointer transition-all group"
                onClick={() => handleTemplateClick(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/10 rounded-lg text-purple-400 group-hover:text-purple-300">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white mb-1">
                        {template.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Chat/Library Interface */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="border-b border-white/10">
              <TabsList className="bg-white/5">
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-white/10"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Research Chat
                </TabsTrigger>
                <TabsTrigger
                  value="library"
                  className="data-[state=active]:bg-white/10"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Prompt Library
                </TabsTrigger>
                <TabsTrigger
                  value="tools"
                  className="data-[state=active]:bg-white/10"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  YouTube Tools
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-0">
              <TabsContent value="chat" className="m-0">
              <div className="flex flex-col h-[500px]">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-purple-400" />
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
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            onClick={() => sendMessage(example)}
                            className="text-xs border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
                          >
                            {example}
                          </Button>
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
                                ? "bg-purple-600 text-white"
                                : "bg-white/10 text-white"
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
                          <div className="bg-white/10 p-4 rounded-lg">
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
                      className="min-h-[60px] bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      rows={2}
                    />
                    <Button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
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
              <ScrollArea className="h-[500px] p-6">
                <div className="space-y-6">
                  {PROMPT_LIBRARY.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        {category.category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.prompts.map((prompt, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            className="justify-start text-left h-auto py-3 px-4 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{prompt}</span>
                          </Button>
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
            </CardContent>
          </Tabs>
        </Card>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Research Sessions</p>
                  <p className="text-xl font-bold text-white">
                    {messages.filter((m) => m.role === "user").length}
                  </p>
                </div>
                <MessageSquare className="h-5 w-5 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Ideas Generated</p>
                  <p className="text-xl font-bold text-white">
                    {messages.filter((m) => m.role === "assistant").length * 5}
                  </p>
                </div>
                <Lightbulb className="h-5 w-5 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Channels Analyzed</p>
                  <p className="text-xl font-bold text-white">
                    {messages.filter((m) => m.content.includes("@")).length}
                  </p>
                </div>
                <Users className="h-5 w-5 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Time Saved</p>
                  <p className="text-xl font-bold text-white">
                    {Math.round(messages.length * 15)} min
                  </p>
                </div>
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
