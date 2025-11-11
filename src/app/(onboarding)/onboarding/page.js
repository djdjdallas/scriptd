'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OnboardingContainer } from '@/components/onboarding/onboarding-container';
import { WelcomeStep } from '@/components/onboarding/welcome-step';
import { ProfileStep } from '@/components/onboarding/profile-step';
import { ChannelStep } from '@/components/onboarding/channel-step';
import { GoalsStep } from '@/components/onboarding/goals-step';
import { VoiceStep } from '@/components/onboarding/voice-step';
import { FirstScriptStep } from '@/components/onboarding/first-script-step';
import { TourStep } from '@/components/onboarding/tour-step';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user data and onboarding status
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userProfile?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }

      setUserData(userProfile);
      
      // Resume from last step if returning
      if (userProfile?.onboarding_step) {
        setCurrentStep(Math.min(userProfile.onboarding_step + 1, 7));
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (stepName, stepNumber, data = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Ensure data is a valid object for JSONB
      const safeData = data && typeof data === 'object' ? data : {};

      const { error } = await supabase.rpc('update_onboarding_progress', {
        p_user_id: user.id,
        p_step_name: stepName,
        p_step_number: stepNumber,
        p_completed: true,
        p_data: safeData
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error; // Re-throw so handlers can catch it
    }
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      const stepNames = [
        'welcome', 'profile', 'channel', 'goals',
        'voice', 'first_script', 'tour'
      ];

      await updateProgress(stepNames[currentStep - 1], currentStep, { skipped: true });
      handleNext();
    } catch (error) {
      console.error('Error skipping step:', error);
      toast.error('Failed to save progress, but continuing...');
      handleNext(); // Continue anyway
    }
  };

  // Step completion handlers
  const handleWelcomeComplete = async (data) => {
    try {
      await updateProgress('welcome', 1, data || {});
      handleNext();
    } catch (error) {
      console.error('Error completing welcome step:', error);
      toast.error('Failed to save progress, but continuing...');
      handleNext(); // Continue anyway
    }
  };

  const handleProfileComplete = async (profileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update user profile
      await supabase
        .from('users')
        .update({
          name: profileData.name,
          user_type: profileData.user_type,
          experience_level: profileData.experience_level
        })
        .eq('id', user.id);

      // Update profile table if it exists
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url
        });

      await updateProgress('profile', 2, profileData);
      setUserData({ ...userData, ...profileData });
      handleNext();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleChannelComplete = async (channelData) => {
    try {
      await updateProgress('channel', 3, channelData || {});
      // Store channel data in userData for later steps
      if (channelData && channelData.channel_id) {
        setUserData({ ...userData, channel_id: channelData.channel_id, channel: channelData.channel });
      }
      handleNext();
    } catch (error) {
      console.error('Error completing channel step:', error);
      toast.error('Failed to save progress, but continuing...');
      handleNext(); // Continue anyway
    }
  };

  const handleGoalsComplete = async (goalsData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('users')
        .update({
          content_goals: goalsData.content_goals,
          upload_frequency: goalsData.upload_frequency,
          target_audience: goalsData.target_audience
        })
        .eq('id', user.id);

      await updateProgress('goals', 4, goalsData);
      handleNext();
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals');
    }
  };

  const handleVoiceComplete = async (voiceData) => {
    try {
      await updateProgress('voice', 5, voiceData || {});
      handleNext();
    } catch (error) {
      console.error('Error completing voice step:', error);
      toast.error('Failed to save progress, but continuing...');
      handleNext(); // Continue anyway
    }
  };

  const handleFirstScriptComplete = async (scriptData) => {
    try {
      await updateProgress('first_script', 6, scriptData || {});
      handleNext();
    } catch (error) {
      console.error('Error completing first script step:', error);
      toast.error('Failed to save progress, but continuing...');
      handleNext(); // Continue anyway
    }
  };

  const handleTourComplete = async (tourData) => {
    try {
      await updateProgress('tour', 7, tourData);

      // Mark onboarding as complete and grant bonus credits
      const { data: { user } } = await supabase.auth.getUser();

      const { data: result, error } = await supabase
        .rpc('complete_onboarding', { p_user_id: user.id });

      if (error) throw error;

      if (result?.success) {
        toast.success('🎉 Welcome to GenScript! You earned 5 bonus credits!');
        router.push('/dashboard');
      } else {
        toast.error(result?.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep userData={userData} onComplete={handleWelcomeComplete} />;
      case 2:
        return <ProfileStep userData={userData} onComplete={handleProfileComplete} />;
      case 3:
        return <ChannelStep userData={userData} onComplete={handleChannelComplete} />;
      case 4:
        return <GoalsStep userData={userData} onComplete={handleGoalsComplete} />;
      case 5:
        return <VoiceStep userData={userData} onComplete={handleVoiceComplete} />;
      case 6:
        return <FirstScriptStep userData={userData} onComplete={handleFirstScriptComplete} />;
      case 7:
        return <TourStep userData={userData} onComplete={handleTourComplete} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingContainer
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={currentStep < 7 ? handleSkip : null}
    >
      {renderStep()}
    </OnboardingContainer>
  );
}