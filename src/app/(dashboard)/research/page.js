'use client';

import { useState, useEffect } from 'react';
import { ResearchChat } from '@/components/research/research-chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search,
  FileText,
  MessageSquare,
  Calendar,
  Trash2,
  Loader2,
  Sparkles,
  Clock,
  BookOpen,
  Lightbulb,
  Target
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ResearchPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/research/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        
        // Set current session to the most recent one
        if (data.sessions?.length > 0 && !currentSessionId) {
          setCurrentSessionId(data.sessions[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/research/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Research Session'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(prev => [data.session, ...prev]);
        setCurrentSessionId(data.session.id);
        
        toast({
          title: "New Session Created",
          description: "Start researching your topic"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive"
      });
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Delete this research session? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/research/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          setCurrentSessionId(sessions.find(s => s.id !== sessionId)?.id || null);
        }
        
        toast({
          title: "Session Deleted",
          description: "Research session has been deleted"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive"
      });
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 -z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="flex items-center justify-center min-h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      
      <div className="relative">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Research Hub</h1>
          </div>
          <p className="text-white/70">
            Deep dive into topics, gather insights, and create data-driven content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-white">{sessions.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Active Research</p>
                  <p className="text-2xl font-bold text-white">
                    {sessions.filter(s => {
                      const lastUpdate = new Date(s.updatedAt);
                      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                      return lastUpdate > dayAgo;
                    }).length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Messages</p>
                  <p className="text-2xl font-bold text-white">
                    {sessions.reduce((acc, s) => acc + (s.messageCount || 0), 0)}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Insights Found</p>
                  <p className="text-2xl font-bold text-white">
                    {sessions.reduce((acc, s) => acc + (s.sourceCount || 0), 0)}
                  </p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-400px)]">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Research Sessions</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={createNewSession}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Search */}
                <div className="px-4 py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      placeholder="Search sessions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15"
                    />
                  </div>
                </div>

                {/* Sessions List */}
                <ScrollArea className="flex-1 px-4">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-white/30 mb-4" />
                      <p className="text-sm text-white/60">
                        {search ? 'No sessions found' : 'No research sessions yet'}
                      </p>
                      {!search && (
                        <Button
                          variant="link"
                          onClick={createNewSession}
                          className="mt-2 text-purple-300 hover:text-purple-200"
                        >
                          Create your first session
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pb-4">
                      {filteredSessions.map((session) => (
                        <Card
                          key={session.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            currentSessionId === session.id
                              ? 'bg-purple-500/20 border-purple-400/50 shadow-lg'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                          onClick={() => setCurrentSessionId(session.id)}
                        >
                          <CardContent className="p-3 group">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate text-white">
                                  {session.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{session.messageCount || 0}</span>
                                  <Clock className="h-3 w-3 ml-1" />
                                  <span>
                                    {formatDistanceToNow(new Date(session.updatedAt), { 
                                      addSuffix: true 
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-white/60 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Research Area */}
          <div className="lg:col-span-3">
            {currentSessionId ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl h-full">
                <ResearchChat
                  sessionId={currentSessionId}
                  onSourcesUpdate={(sources) => {
                    // Update session metadata with source count
                    setSessions(prev => prev.map(s => 
                      s.id === currentSessionId 
                        ? { ...s, sourceCount: sources.length }
                        : s
                    ));
                  }}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
                <CardContent className="text-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full inline-flex mb-4">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Start Your Research Journey</h3>
                  <p className="text-white/70 mb-6 max-w-md">
                    Create a new session to begin researching your YouTube video topic with AI-powered insights
                  </p>
                  <Button 
                    onClick={createNewSession}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Research Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}