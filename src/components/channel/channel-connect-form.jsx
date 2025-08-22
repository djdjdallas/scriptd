'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Youtube, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const formSchema = z.object({
  url: z.string()
    .min(1, 'YouTube URL is required')
    .refine((url) => {
      const patterns = [
        /youtube\.com\/channel\//,
        /youtube\.com\/c\//,
        /youtube\.com\/@/,
        /youtube\.com\/user\//,
        /^[a-zA-Z0-9_-]{24}$/,
      ];
      return patterns.some(pattern => pattern.test(url));
    }, 'Please enter a valid YouTube channel URL'),
});

export function ChannelConnectForm({ onSuccess }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('input'); // input, connecting, success

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
      toast.success('Channel connected successfully!');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result.channel);
      } else {
        // Redirect to channel analysis
        setTimeout(() => {
          router.push(`/channels/${result.channel.id}/analyze`);
        }, 1500);
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-6 w-6" />
          Connect Your YouTube Channel
        </CardTitle>
        <CardDescription>
          Enter your YouTube channel URL to start analyzing your content and audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Channel Connected!</h3>
            <p className="text-muted-foreground">
              Redirecting to analysis...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Channel URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://youtube.com/@yourchannel"
                {...register('url')}
                disabled={isLoading}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Supported formats:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>youtube.com/@channelhandle</li>
                <li>youtube.com/channel/CHANNEL_ID</li>
                <li>youtube.com/c/customname</li>
                <li>youtube.com/user/username</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {step === 'connecting' ? 'Connecting Channel...' : 'Processing...'}
                </>
              ) : (
                'Connect Channel'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}