'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Youtube, CheckCircle, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const formSchema = z.object({
  url: z.string()
    .min(1, 'YouTube URL is required')
    .refine((url) => {
      const patterns = [
        // Full URLs with https://
        /^https?:\/\/(www\.)?youtube\.com\/channel\//,
        /^https?:\/\/(www\.)?youtube\.com\/c\//,
        /^https?:\/\/(www\.)?youtube\.com\/@/,
        /^https?:\/\/(www\.)?youtube\.com\/user\//,
        // URLs without protocol
        /^(www\.)?youtube\.com\/channel\//,
        /^(www\.)?youtube\.com\/c\//,
        /^(www\.)?youtube\.com\/@/,
        /^(www\.)?youtube\.com\/user\//,
        // Just the handle/username
        /^@[a-zA-Z0-9_.-]+$/,
        // Direct channel ID (24 characters starting with UC)
        /^UC[a-zA-Z0-9_-]{22}$/,
        // Any alphanumeric username (fallback)
        /^[a-zA-Z0-9_.-]+$/,
      ];
      return patterns.some(pattern => pattern.test(url.trim()));
    }, 'Please enter a valid YouTube channel URL, @handle, or channel name'),
});

export function ChannelConnectForm({ onSuccess }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('input'); // input, connecting, success
  const [voiceTrainingStatus, setVoiceTrainingStatus] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setStep('connecting');

    try {
      const response = await fetch('/api/channels/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to connect channel');
      }

      setStep('success');
      
      // Show voice training message if it was queued
      if (result.voiceTraining?.status === 'queued') {
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span>Channel connected! FREE voice training started automatically!</span>
          </div>
        );
      } else {
        toast.success('Channel connected successfully!');
      }
      
      // Store voice training status for display
      setVoiceTrainingStatus(result.voiceTraining);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result.channel);
      } else {
        // Redirect to channel analysis with a smoother delay
        setTimeout(() => {
          router.push(`/channels/${result.channel.id}/analyze`);
        }, 2500);
      }
    } catch (error) {
      console.error('Error connecting channel:', error);
      toast.error(error.message || 'Failed to connect channel');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-8 border border-white/10 glass-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center">
              <Youtube className="h-6 w-6 text-red-400" />
            </div>
            Connect Your YouTube Channel
          </h2>
          <p className="text-gray-400">
            Enter your YouTube channel URL to start analyzing your content and audience
          </p>
        </div>
        <div>
        {step === 'success' ? (
          <div className="text-center py-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              </div>
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-4 animate-in zoom-in duration-300 relative" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Channel Connected Successfully!</h3>
            
            {voiceTrainingStatus?.status === 'queued' && (
              <div className="glass bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 mb-6 mt-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Gift className="h-6 w-6 text-purple-400" />
                  <span className="text-lg font-semibold gradient-text">FREE Voice Training Started!</span>
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                </div>
                <p className="text-gray-300">
                  We're analyzing your channel's unique style and voice. This is completely FREE and will be ready soon!
                </p>
              </div>
            )}
            
            <p className="text-gray-400 mb-6">
              Preparing your channel analysis...
            </p>
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              <span className="text-sm text-gray-400">Redirecting...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="url" className="text-sm font-medium text-gray-300">Channel URL</label>
                <div className="flex items-center gap-1.5 glass bg-green-500/10 px-3 py-1 rounded-full">
                  <Gift className="h-3 w-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">FREE Voice Training Included</span>
                </div>
              </div>
              <input
                id="url"
                type="text"
                placeholder="@5minsaway293 or youtube.com/@5minsaway293"
                {...register('url')}
                disabled={isLoading}
                className="glass-input w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:bg-black/40 transition-all"
              />
              {errors.url && (
                <p className="text-sm text-red-400 flex items-center gap-1 mt-2">
                  <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                  {errors.url.message}
                </p>
              )}
              
              <div className="glass bg-black/20 rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-400 mb-2">Supported formats:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-gray-300">@username</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-gray-300">youtube.com/@channel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-gray-300">youtube.com/c/custom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-gray-300">Channel ID (UC...)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You can enter handles with or without @ symbol, or paste any YouTube channel URL
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="glass-button w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/20 hover:border-purple-500/30 transition-all group" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {step === 'connecting' ? 'Connecting Channel...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Youtube className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Connect Channel
                  <Sparkles className="ml-2 h-4 w-4 text-yellow-400 group-hover:animate-pulse" />
                </>
              )}
            </Button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}