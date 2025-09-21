'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RemixChannelWizard } from '@/components/channel/remix-channel-wizard';
import {
  ArrowLeft,
  Shuffle,
  Lock,
  Crown
} from 'lucide-react';

export default function RemixChannelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      const isPremiumUser = data?.subscription_tier && data.subscription_tier !== 'free';
      setIsPremium(isPremiumUser);
    }
    
    setCheckingPremium(false);
  };

  if (checkingPremium) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shuffle className="h-12 w-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link href="/channels">
            <Button variant="ghost" size="sm" className="mb-4 text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Channels
            </Button>
          </Link>
        </div>

        <div className="glass-card p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Crown className="h-10 w-10 text-yellow-400" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Premium Feature
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Remix Channel is a premium feature that lets you combine successful channel strategies to create your unique approach.
            </p>
          </div>

          <Link href="/pricing">
            <Button 
              className="glass-button bg-gradient-to-r from-yellow-500/50 to-orange-500/50 text-white"
              size="lg"
            >
              <Lock className="mr-2 h-5 w-5" />
              Unlock with Premium
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/channels/add">
          <Button variant="ghost" size="sm" className="mb-4 text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Add Channel
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Shuffle className="h-8 w-8 text-purple-400" />
          Remix Channels
        </h1>
        <p className="text-gray-400 mt-2">
          Combine successful channel strategies to create your unique approach
        </p>
      </div>

      {/* Wizard Component */}
      <RemixChannelWizard />
    </div>
  );
}