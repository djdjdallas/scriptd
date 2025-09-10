'use client';

import { CheckCircle, Circle, Lock } from 'lucide-react';

export function ProgressIndicator({ steps, currentStep, completedSteps = [] }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-700 -translate-y-1/2" />
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Step Indicators */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLocked = stepNumber > currentStep;

          return (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center"
            >
              {/* Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white scale-110' : ''}
                  ${isCurrent ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ring-4 ring-purple-500/30 scale-110' : ''}
                  ${isLocked ? 'bg-gray-800 text-gray-500 border-2 border-gray-700' : ''}
                  ${!isCompleted && !isCurrent && !isLocked ? 'bg-gray-700 text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : isLocked ? (
                  <Lock className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{stepNumber}</span>
                )}
              </div>

              {/* Label */}
              <div className="absolute top-14 text-center">
                <p className={`
                  text-xs font-medium whitespace-nowrap
                  ${isCurrent ? 'text-white' : 'text-gray-400'}
                `}>
                  {step.title}
                </p>
                {isCurrent && (
                  <p className="text-xs text-purple-400 mt-1">Current</p>
                )}
              </div>

              {/* Pulse Animation for Current Step */}
              {isCurrent && (
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-purple-500/30 animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}