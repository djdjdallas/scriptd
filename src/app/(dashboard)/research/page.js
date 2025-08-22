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
  Clock
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
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Sessions Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Research Sessions</CardTitle>
              <Button size="sm" onClick={createNewSession}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Search */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Sessions List */}
            <ScrollArea className="flex-1 px-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No sessions found' : 'No research sessions yet'}
                  </p>
                  {!search && (
                    <Button
                      variant="link"
                      onClick={createNewSession}
                      className="mt-2"
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
                      className={`cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentSessionId(session.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {session.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Your Research</h3>
              <p className="text-muted-foreground mb-4">
                Create a new session to begin researching your YouTube video topic
              </p>
              <Button onClick={createNewSession}>
                <Plus className="h-4 w-4 mr-2" />
                New Research Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}