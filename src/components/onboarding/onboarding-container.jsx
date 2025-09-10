'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  CheckCircle,
  Gift
} from 'lucide-react';

const TOTAL_STEPS = 7;

export function OnboardingContainer({ children, currentStep, onNext, onBack, onSkip }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAll = async () => {
    if (confirm('Are you sure you want to skip the onboarding? You can always access these features later.')) {
      try {
        const { error } = await supabase.rpc('skip_onboarding', {
          p_user_id: user.id
        });

        if (error) throw error;

        toast.success('Onboarding skipped. Welcome to Subscribr!');
        router.push('/dashboard');
      } catch (error) {
        console.error('Error skipping onboarding:', error);
        toast.error('Failed to skip onboarding');
      }
    }
  };

  const progressPercentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepTitles = [
    'Welcome',
    'Complete Profile',
    'Connect Channel',
    'Set Your Goals',
    'Voice Training',
    'Create First Script',
    'Platform Tour'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-40 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Welcome to Subscribr</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleSkipAll}
            className="text-gray-400 hover:text-white"
          >
            Skip Setup
            <X className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">
              Step {currentStep} of {TOTAL_STEPS}
            </p>
            <p className="text-sm font-medium text-white">
              {stepTitles[currentStep - 1]}
            </p>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isCurrent ? 'bg-purple-500 text-white ring-4 ring-purple-500/30' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-gray-700 text-gray-400' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {title.split(' ')[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="glass-card p-8 mb-8">
          {children}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={currentStep === 1}
            className="glass-button text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {onSkip && currentStep < TOTAL_STEPS && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-gray-400 hover:text-white"
              >
                Skip This Step
              </Button>
            )}

            <Button
              onClick={onNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              {currentStep === TOTAL_STEPS ? (
                <>
                  Complete Setup
                  <Gift className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Completion Reward Notice */}
        {currentStep === TOTAL_STEPS && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Complete the onboarding to receive{' '}
              <span className="text-yellow-400 font-semibold">5 bonus credits!</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}