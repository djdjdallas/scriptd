'use client';

import { useState } from 'react';
import { ChevronRight, Menu, X, FileText, Search, Layout, Type, Image, Zap, Target, Edit, Wand2, Download, Send, Check } from 'lucide-react';

const Icons = {
  FileText,
  Search,
  Layout,
  Type,
  Image,
  Zap,
  Target,
  Edit,
  Wand2,
  Download,
  Send
};

export default function WorkflowSidebar({ steps, currentStep, completedSteps, onStepClick }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 glass-button p-2"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 bg-gray-900/95 border-r border-gray-800
        transform transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Script Creation Steps
          </h3>
          
          {steps.map((step) => {
            const Icon = Icons[step.icon];
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <button
                key={step.id}
                onClick={() => {
                  onStepClick(step.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg
                  transition-all text-left
                  ${isActive 
                    ? 'bg-purple-600 text-white' 
                    : isCompleted
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {isCompleted && !isActive && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
                {isActive && (
                  <ChevronRight className="h-3 w-3 ml-auto" />
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-600 rounded"></div>
                <span>Current Step</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500/20 rounded flex items-center justify-center">
                  <Check className="h-2 w-2 text-green-400" />
                </div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-700 rounded"></div>
                <span>Not Started</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}