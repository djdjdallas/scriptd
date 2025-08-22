'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Loader2, 
  Search,
  Link as LinkIcon,
  FileText,
  Star,
  ExternalLink,
  Copy,
  Trash2,
  Bot,
  User
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function ResearchChat({ sessionId, onSourcesUpdate }) {
  const { toast } = useToast();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/research/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
          context: sources.map(s => ({
            url: s.url,
            title: s.title,
            content: s.summary
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Add AI response
      const aiMessage = {
        id: data.messageId,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        sources: data.sources || []
      };

      setMessages(prev => [...prev, aiMessage]);

      // Add any new sources
      if (data.newSources && data.newSources.length > 0) {
        const uniqueSources = data.newSources.filter(
          newSource => !sources.some(s => s.url === newSource.url)
        );
        setSources(prev => [...prev, ...uniqueSources]);
        onSourcesUpdate?.(sources.concat(uniqueSources));
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addUrlAsSource = async (url) => {
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/research/sources/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, sessionId })
      });

      if (!response.ok) throw new Error('Failed to add source');

      const data = await response.json();
      setSources(prev => [...prev, data.source]);
      onSourcesUpdate?.([...sources, data.source]);

      toast({
        title: "Source Added",
        description: "The URL has been added to your research sources."
      });

    } catch (error) {
      console.error('Add source error:', error);
      toast({
        title: "Error",
        description: "Failed to add source. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStarSource = async (sourceId) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    try {
      const response = await fetch(`/api/research/sources/${sourceId}/star`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !source.starred })
      });

      if (response.ok) {
        setSources(prev => prev.map(s => 
          s.id === sourceId ? { ...s, starred: !s.starred } : s
        ));
      }
    } catch (error) {
      console.error('Star toggle error:', error);
    }
  };

  const removeSource = async (sourceId) => {
    try {
      const response = await fetch(`/api/research/sources/${sourceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSources(prev => prev.filter(s => s.id !== sourceId));
        onSourcesUpdate?.(sources.filter(s => s.id !== sourceId));
      }
    } catch (error) {
      console.error('Remove source error:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Research Assistant</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6">
            <TabsTrigger value="chat">
              Chat
              {messages.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {messages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sources">
              Sources
              {sources.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {sources.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 px-6 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation to research your topic</p>
                  <p className="text-sm mt-2">Ask questions, request summaries, or explore ideas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[80%] ${
                        message.role === 'user' ? 'order-1' : 'order-2'
                      }`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.sources.map((source, idx) => (
                              <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                              >
                                <LinkIcon className="h-3 w-3" />
                                {source.title}
                              </a>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 order-2">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-6 pt-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your research topic..."
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="sources" className="flex-1 flex flex-col mt-0">
            {/* Add source */}
            <div className="px-6 py-4 border-b">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const url = e.target.url.value;
                  addUrlAsSource(url);
                  e.target.reset();
                }}
                className="flex gap-2"
              >
                <Input
                  name="url"
                  placeholder="Enter URL to add as source..."
                  type="url"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  Add Source
                </Button>
              </form>
            </div>

            {/* Sources list */}
            <ScrollArea className="flex-1 px-6 py-4">
              {sources.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sources added yet</p>
                  <p className="text-sm mt-2">Add URLs to build your research library</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sources.map((source) => (
                    <Card key={source.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {source.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {source.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View source
                              </a>
                              <span className="text-xs text-muted-foreground">
                                {source.wordCount} words
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleStarSource(source.id)}
                            >
                              <Star className={`h-4 w-4 ${
                                source.starred ? 'fill-yellow-500 text-yellow-500' : ''
                              }`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyToClipboard(source.content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeSource(source.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}