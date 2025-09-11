'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Sparkles, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function VoiceTrainingNotifications({ userId }) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    
    // Subscribe to notifications
    const subscription = supabase
      .channel(`voice-notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const notification = payload.new;
        
        // Check if it's a voice training notification
        if (notification.type === 'voice_training_complete') {
          toast.success(
            <div 
              className="cursor-pointer"
              onClick={() => router.push(`/channels/${notification.channelId}/voice`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="font-semibold">Voice Training Complete!</span>
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-300">
                Your AI voice model is ready. Click to start generating scripts!
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Gift className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">This was FREE!</span>
              </div>
            </div>,
            {
              duration: 10000,
              position: 'bottom-right',
            }
          );
          
          // Mark notification as read
          markAsRead(notification.id);
          
        } else if (notification.type === 'voice_training_failed') {
          toast.error(
            <div 
              className="cursor-pointer"
              onClick={() => router.push(`/channels/${notification.channelId}/voice`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="font-semibold">Voice Training Failed</span>
              </div>
              <p className="text-sm text-gray-300">
                {notification.message}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Gift className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">Retry for FREE anytime!</span>
              </div>
            </div>,
            {
              duration: 10000,
              position: 'bottom-right',
            }
          );
          
          // Mark notification as read
          markAsRead(notification.id);
        }
      })
      .subscribe();

    // Function to mark notification as read
    const markAsRead = async (notificationId) => {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    };

    // Fetch any unread voice training notifications on mount
    const fetchUnreadNotifications = async () => {
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .in('type', ['voice_training_complete', 'voice_training_failed'])
        .order('created_at', { ascending: false });

      if (notifications && notifications.length > 0) {
        // Show the most recent notification
        const latest = notifications[0];
        
        if (latest.type === 'voice_training_complete') {
          toast.success(
            <div 
              className="cursor-pointer"
              onClick={() => router.push(`/channels/${latest.channelId}/voice`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="font-semibold">Voice Training Complete!</span>
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-300">
                Your AI voice model is ready. Click to start generating scripts!
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Gift className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">This was FREE!</span>
              </div>
            </div>,
            {
              duration: 10000,
              position: 'bottom-right',
            }
          );
        }
        
        // Mark all as read
        notifications.forEach(n => markAsRead(n.id));
      }
    };

    fetchUnreadNotifications();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, router]);

  return null; // This component doesn't render anything
}