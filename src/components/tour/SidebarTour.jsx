'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTour } from '@/contexts/TourContext';
import { tourSteps } from '@/lib/tour/tour-steps';
import { TourOverlay } from './TourOverlay';
import { TourTooltip } from './TourTooltip';

export function SidebarTour() {
  const { isTourActive, currentStep } = useTour();
  const [targetRect, setTargetRect] = useState(null);
  const recalcTimeoutRef = useRef(null);

  const recalculate = useCallback(() => {
    const step = tourSteps[currentStep];
    if (!step) return;

    const el = document.querySelector(`[data-tour-step="${step.id}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Small delay after scroll to get accurate position
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      });
    });
  }, [currentStep]);

  // Recalculate on step change (250ms delay for sidebar animation)
  useEffect(() => {
    if (!isTourActive) {
      setTargetRect(null);
      return;
    }

    recalcTimeoutRef.current = setTimeout(recalculate, 250);
    return () => clearTimeout(recalcTimeoutRef.current);
  }, [isTourActive, currentStep, recalculate]);

  // Recalculate on resize (debounced 150ms)
  useEffect(() => {
    if (!isTourActive) return;

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(recalculate, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isTourActive, recalculate]);

  if (!isTourActive) return null;

  return (
    <>
      <TourOverlay targetRect={targetRect} />
      <TourTooltip targetRect={targetRect} />
    </>
  );
}
