'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles, 
  Gift,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function VoiceTrainingStatus({ channelId, initialStatus = 'pending' }) {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!channelId) return;

    const supabase = createClient();
    
    // Set up real-time subscription for status updates
    const subscription = supabase
      .channel(`voice-training-${channelId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'channels',
        filter: `id=eq.${channelId}`
      }, (payload) => {
        const { voice_training_status, voice_training_error, voice_profile, voice_training_progress } = payload.new;
        setStatus(voice_training_status);
        setError(voice_training_error);
        if (voice_profile) {
          setProfile(voice_profile);
        }
        
        // Use voice_training_progress if available, otherwise fall back to status-based progress
        if (voice_training_progress !== undefined && voice_training_progress !== null) {
          setProgress(voice_training_progress);
        } else {
          // Fallback to status-based progress
          switch (voice_training_status) {
            case 'queued':
              setProgress(10);
              break;
            case 'in_progress':
              setProgress(50);
              break;
            case 'completed':
              setProgress(100);
              break;
            case 'failed':
              setProgress(0);
              break;
          }
        }
      })
      .subscribe();

    // Fetch initial status
    fetchStatus();

    return () => {
      subscription.unsubscribe();
    };
  }, [channelId]);

  const fetchStatus = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('channels')
      .select('voice_training_status, voice_training_error, voice_profile, voice_training_progress')
      .eq('id', channelId)
      .single();

    if (data) {
      setStatus(data.voice_training_status);
      setError(data.voice_training_error);
      setProfile(data.voice_profile);
      
      // Use voice_training_progress if available
      if (data.voice_training_progress !== undefined && data.voice_training_progress !== null) {
        setProgress(data.voice_training_progress);
      } else {
        // Fallback to status-based progress
        switch (data.voice_training_status) {
          case 'queued':
            setProgress(10);
            break;
          case 'in_progress':
            setProgress(50);
            break;
          case 'completed':
            setProgress(100);
            break;
          default:
            setProgress(0);
        }
      }
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch('/api/voice/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          profileName: 'Default Voice Profile',
          description: 'Retry voice training after failure'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to retry voice training');
      }

      toast.success('Voice training restarted (FREE)!');
      setStatus('queued');
      setProgress(10);
      setError(null);
    } catch (error) {
      console.error('Error retrying voice training:', error);
      toast.error('Failed to retry voice training');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          text: 'Waiting to start',
          color: 'text-gray-400',
          badge: 'default'
        };
      case 'queued':
        return {
          icon: <Clock className="h-5 w-5 animate-pulse" />,
          text: 'In queue',
          color: 'text-blue-400',
          badge: 'secondary'
        };
      case 'in_progress':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          text: 'Training in progress',
          color: 'text-purple-400',
          badge: 'default'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          text: 'Training complete',
          color: 'text-green-400',
          badge: 'success'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-5 w-5" />,
          text: 'Training failed',
          color: 'text-red-400',
          badge: 'destructive'
        };
      case 'skipped':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          text: 'Training skipped',
          color: 'text-yellow-400',
          badge: 'warning'
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          text: 'Unknown status',
          color: 'text-gray-400',
          badge: 'default'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Voice Training Status</CardTitle>
            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-full">
              <Gift className="h-3 w-3 text-green-400" />
              <span className="text-xs font-medium text-green-400">FREE</span>
            </div>
          </div>
          <Badge variant={statusDisplay.badge}>
            <span className={statusDisplay.color}>{statusDisplay.icon}</span>
            <span className="ml-2">{statusDisplay.text}</span>
          </Badge>
        </div>
        <CardDescription>
          {status === 'completed' 
            ? 'Your AI voice model is ready to use!'
            : status === 'failed'
            ? 'Voice training encountered an issue'
            : 'Training your unique voice and style - completely FREE'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        {(status === 'queued' || status === 'in_progress') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Status-specific content */}
        {status === 'in_progress' && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
              <span className="text-sm font-medium">Analyzing your content...</span>
            </div>
            <p className="text-xs text-muted-foreground">
              We're learning your unique style, vocabulary, and voice patterns from your channel.
            </p>
          </div>
        )}

        {status === 'completed' && profile && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Training successful!</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-2 font-medium">{profile.confidence?.score ?? profile.accuracy ?? 0}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium text-green-400 capitalize">{profile.confidence?.status || 'Ready'}</span>
              </div>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium">Training failed</span>
            </div>
            {error && (
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
            )}
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Retry Training (FREE)
                </>
              )}
            </Button>
          </div>
        )}

        {status === 'queued' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-medium">Queued for processing</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your FREE voice training will start automatically. This usually takes 1-2 minutes.
            </p>
          </div>
        )}

        {/* Free badge reminder */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t">
          <Gift className="h-4 w-4 text-green-400" />
          <span className="text-xs text-muted-foreground">
            Voice training is always FREE - no credits required!
          </span>
        </div>
      </CardContent>
    </Card>
  );
}