'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { tourSteps } from '@/lib/tour/tour-steps';

const TourContext = createContext(null);

export function TourProvider({ children, userId }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(true);
  const initializedRef = useRef(false);

  // Check onboarding status on mount
  useEffect(() => {
    if (!userId || initializedRef.current) return;
    initializedRef.current = true;

    const checkOnboarding = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('onboarding_completed, onboarding_step')
        .eq('id', userId)
        .single();

      if (data && !data.onboarding_completed) {
        setTourCompleted(false);
        setCurrentStep(data.onboarding_step || 0);
        // Auto-start after 800ms delay to let dashboard render
        setTimeout(() => {
          setIsTourActive(true);
        }, 800);
      }
    };

    checkOnboarding();
  }, [userId]);

  const persistToDb = useCallback(async (completed, step) => {
    if (!userId) return;
    const supabase = createClient();
    const update = {
      onboarding_completed: completed,
      onboarding_step: step,
    };
    if (completed) {
      update.onboarding_completed_at = new Date().toISOString();
    }
    await supabase.from('users').update(update).eq('id', userId);
  }, [userId]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsTourActive(true);
    setTourCompleted(false);
    if (userId) {
      const supabase = createClient();
      supabase.from('users').update({
        onboarding_completed: false,
        onboarding_step: 0,
        onboarding_started_at: new Date().toISOString(),
        onboarding_completed_at: null,
      }).eq('id', userId).then(() => {});
    }
  }, [userId]);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setTourCompleted(true);
    persistToDb(true, tourSteps.length);
  }, [persistToDb]);

  const nextStep = useCallback(() => {
    if (currentStep >= tourSteps.length - 1) {
      endTour();
    } else {
      const next = currentStep + 1;
      setCurrentStep(next);
      persistToDb(false, next);
    }
  }, [currentStep, endTour, persistToDb]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setTourCompleted(true);
    persistToDb(true, currentStep);
  }, [currentStep, persistToDb]);

  return (
    <TourContext.Provider value={{
      isTourActive,
      currentStep,
      tourCompleted,
      totalSteps: tourSteps.length,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      endTour,
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    return {
      isTourActive: false,
      currentStep: 0,
      tourCompleted: true,
      totalSteps: 0,
      startTour: () => {},
      nextStep: () => {},
      prevStep: () => {},
      skipTour: () => {},
      endTour: () => {},
    };
  }
  return context;
}
