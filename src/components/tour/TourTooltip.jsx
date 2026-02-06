'use client';

import { useEffect, useCallback } from 'react';
import { tourSteps } from '@/lib/tour/tour-steps';
import { useTour } from '@/contexts/TourContext';

export function TourTooltip({ targetRect }) {
  const { currentStep, totalSteps, nextStep, prevStep, skipTour } = useTour();
  const step = tourSteps[currentStep];

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') skipTour();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
    else if (e.key === 'ArrowLeft') prevStep();
  }, [skipTour, nextStep, prevStep]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!targetRect || !step) return null;

  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Position tooltip to the right of target (or below on mobile)
  const tooltipWidth = 320;
  const gap = 16;

  let tooltipStyle = {};
  if (isMobile) {
    tooltipStyle = {
      top: targetRect.bottom + gap,
      left: Math.max(12, Math.min(targetRect.left, window.innerWidth - tooltipWidth - 12)),
      width: Math.min(tooltipWidth, window.innerWidth - 24),
    };
  } else {
    // Right of target, vertically centered
    let top = targetRect.top + targetRect.height / 2 - 80;
    // Clamp to viewport
    top = Math.max(12, Math.min(top, window.innerHeight - 240));

    tooltipStyle = {
      top,
      left: targetRect.right + gap,
      width: tooltipWidth,
    };
  }

  return (
    <div
      className="fixed z-[9999] pointer-events-auto"
      style={tooltipStyle}
    >
      {/* Arrow pointing left (or up on mobile) */}
      {!isMobile && (
        <div
          className="absolute -left-2 top-8 w-4 h-4 rotate-45 backdrop-blur-md border-l border-b border-purple-500/30"
          style={{ background: 'rgba(15, 10, 30, 0.85)' }}
        />
      )}
      {isMobile && (
        <div
          className="absolute -top-2 left-8 w-4 h-4 rotate-45 backdrop-blur-md border-t border-l border-purple-500/30"
          style={{ background: 'rgba(15, 10, 30, 0.85)' }}
        />
      )}

      {/* Card */}
      <div
        className="glass-card backdrop-blur-md rounded-xl p-5 border border-purple-500/20"
        style={{ background: 'rgba(15, 10, 30, 0.85)' }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-4 bg-gradient-to-r from-purple-500 to-pink-500'
                  : i < currentStep
                  ? 'w-1.5 bg-purple-500/60'
                  : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-auto">
            {currentStep + 1} of {totalSteps}
          </span>
        </div>

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Icon className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-5">
          {step.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prevStep}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-4 py-1.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
