'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Send, Users, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  channelName: z.string().min(2, 'Channel name is required'),
  channelUrl: z.string().url('Please enter a valid YouTube channel URL'),
  subscriberCount: z.string().min(1, 'Please select your subscriber range'),
  contentType: z.string().min(1, 'Please select your content type'),
  currentTools: z.string().optional(),
  biggestChallenge: z.string().min(20, 'Please describe your challenge (min 20 characters)'),
  monthlyVideos: z.string().min(1, 'Please select how many videos you create'),
  hoursPerVideo: z.string().min(1, 'Please select time spent per video'),
  whyJoinBeta: z.string().min(20, 'Please tell us why you want to join (min 20 characters)'),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms to continue',
  }),
});

export function BetaSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(25);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
      
      // Update spots remaining if returned from API
      if (result.spotsRemaining !== undefined) {
        setSpotsRemaining(result.spotsRemaining);
      }
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
      console.error('Beta signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto" id="beta-form">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold">Application Submitted!</h3>
            <p className="text-muted-foreground">
              Thank you for applying to the Subscribr beta program. We&apos;ll review your application and get back to you within 48 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              Check your email for a confirmation message. If you don&apos;t see it, please check your spam folder.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto" id="beta-form">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Apply for Beta Access</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span className="font-semibold text-primary">{spotsRemaining} spots left</span>
          </div>
        </div>
        <CardDescription>
          Fill out this form to apply for our exclusive beta program. We&apos;ll review applications and notify selected creators within 48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">About You</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Channel Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Channel</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channelName">Channel Name *</Label>
                <Input
                  id="channelName"
                  {...register('channelName')}
                  placeholder="TechExplained"
                />
                {errors.channelName && (
                  <p className="text-sm text-destructive">{errors.channelName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelUrl">Channel URL *</Label>
                <Input
                  id="channelUrl"
                  {...register('channelUrl')}
                  placeholder="https://youtube.com/@yourchannel"
                />
                {errors.channelUrl && (
                  <p className="text-sm text-destructive">{errors.channelUrl.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriberCount">Subscriber Count *</Label>
                <Select onValueChange={(value) => setValue('subscriberCount', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10k-50k">10K - 50K</SelectItem>
                    <SelectItem value="50k-100k">50K - 100K</SelectItem>
                    <SelectItem value="100k-200k">100K - 200K</SelectItem>
                    <SelectItem value="200k-500k">200K - 500K</SelectItem>
                    <SelectItem value="500k+">500K+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.subscriberCount && (
                  <p className="text-sm text-destructive">{errors.subscriberCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Primary Content Type *</Label>
                <Select onValueChange={(value) => setValue('contentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.contentType && (
                  <p className="text-sm text-destructive">{errors.contentType.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Current Workflow */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Current Workflow</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyVideos">Videos per Month *</Label>
                <Select onValueChange={(value) => setValue('monthlyVideos', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 videos</SelectItem>
                    <SelectItem value="3-4">3-4 videos</SelectItem>
                    <SelectItem value="5-8">5-8 videos</SelectItem>
                    <SelectItem value="9-12">9-12 videos</SelectItem>
                    <SelectItem value="12+">12+ videos</SelectItem>
                  </SelectContent>
                </Select>
                {errors.monthlyVideos && (
                  <p className="text-sm text-destructive">{errors.monthlyVideos.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerVideo">Hours per Video *</Label>
                <Select onValueChange={(value) => setValue('hoursPerVideo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-10">5-10 hours</SelectItem>
                    <SelectItem value="10-20">10-20 hours</SelectItem>
                    <SelectItem value="20-30">20-30 hours</SelectItem>
                    <SelectItem value="30-40">30-40 hours</SelectItem>
                    <SelectItem value="40+">40+ hours</SelectItem>
                  </SelectContent>
                </Select>
                {errors.hoursPerVideo && (
                  <p className="text-sm text-destructive">{errors.hoursPerVideo.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentTools">Current Tools (Optional)</Label>
              <Input
                id="currentTools"
                {...register('currentTools')}
                placeholder="TubeBuddy, VidIQ, Canva, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="biggestChallenge">Biggest Content Creation Challenge *</Label>
              <Textarea
                id="biggestChallenge"
                {...register('biggestChallenge')}
                placeholder="What takes the most time? What's most frustrating about your current process?"
                rows={3}
              />
              {errors.biggestChallenge && (
                <p className="text-sm text-destructive">{errors.biggestChallenge.message}</p>
              )}
            </div>
          </div>

          {/* Why Join Beta */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Why Subscribr?</h3>
            
            <div className="space-y-2">
              <Label htmlFor="whyJoinBeta">Why do you want to join our beta? *</Label>
              <Textarea
                id="whyJoinBeta"
                {...register('whyJoinBeta')}
                placeholder="What excites you about AI-powered content creation? What would you like to achieve with Subscribr?"
                rows={3}
              />
              {errors.whyJoinBeta && (
                <p className="text-sm text-destructive">{errors.whyJoinBeta.message}</p>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreedToTerms"
                onCheckedChange={(checked) => setValue('agreedToTerms', checked)}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="agreedToTerms"
                  className="text-sm font-normal cursor-pointer"
                >
                  I understand this is a beta program and agree to provide feedback and test new features. 
                  I also agree to the Terms of Service and Privacy Policy.
                </Label>
              </div>
            </div>
            {errors.agreedToTerms && (
              <p className="text-sm text-destructive">{errors.agreedToTerms.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  Apply for Beta Access
                  <TrendingUp className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            We&apos;ll review your application within 48 hours. No credit card required.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}