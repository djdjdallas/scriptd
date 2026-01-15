'use client';

/**
 * ComplianceChecker Component
 *
 * Main compliance checking interface with real-time analysis,
 * score display, and detailed reports.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield, RefreshCw, Copy, Download, Trash2, Loader2,
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { analyzeCompliance } from '@/lib/compliance';
import { ComplianceBadge, ComplianceBadgePill } from './ComplianceBadge';
import { ComplianceScore } from './ComplianceScore';
import { ComplianceReport } from './ComplianceReport';
import { ComplianceWarningList } from './ComplianceWarning';

/**
 * Debounce function for real-time analysis
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * ComplianceChecker provides full compliance checking functionality
 *
 * @param {Object} props
 * @param {string} props.initialText - Initial text to analyze
 * @param {Function} props.onAnalysisComplete - Callback when analysis completes
 * @param {boolean} props.autoAnalyze - Whether to analyze automatically on text change
 * @param {number} props.debounceMs - Debounce delay for auto-analysis (default 500ms)
 * @param {boolean} props.showDetailedReport - Whether to show detailed report tabs
 * @param {boolean} props.readOnly - Whether the text input is read-only
 * @param {string} props.className - Additional CSS classes
 */
export function ComplianceChecker({
  initialText = '',
  onAnalysisComplete,
  autoAnalyze = true,
  debounceMs = 500,
  showDetailedReport = true,
  readOnly = false,
  className
}) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const textareaRef = useRef(null);

  const debouncedText = useDebounce(text, debounceMs);

  // Run analysis when debounced text changes (if autoAnalyze is enabled)
  useEffect(() => {
    if (autoAnalyze && debouncedText.trim()) {
      runAnalysis(debouncedText);
    } else if (!debouncedText.trim()) {
      setResult(null);
    }
  }, [debouncedText, autoAnalyze]);

  // Update text when initialText prop changes
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  /**
   * Run compliance analysis on the provided text
   */
  const runAnalysis = useCallback(async (textToAnalyze) => {
    if (!textToAnalyze?.trim()) return;

    setIsAnalyzing(true);
    try {
      // Small delay to show loading state (analysis is fast)
      await new Promise(resolve => setTimeout(resolve, 100));

      const analysisResult = analyzeCompliance(textToAnalyze);
      setResult(analysisResult);

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (error) {
      console.error('Compliance analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  /**
   * Manual analysis trigger
   */
  const handleAnalyze = () => {
    runAnalysis(text);
  };

  /**
   * Clear text and results
   */
  const handleClear = () => {
    setText('');
    setResult(null);
    textareaRef.current?.focus();
  };

  /**
   * Copy text to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Apply suggestion to text
   */
  const handleApplySuggestion = useCallback((warning) => {
    // This is a placeholder for more sophisticated suggestion application
    // In a real implementation, you might replace specific text patterns
    console.log('Apply suggestion:', warning);
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Compliance Checker</h2>
            <p className="text-sm text-gray-400">Check your script for YouTube policy compliance</p>
          </div>
        </div>

        {result && (
          <ComplianceBadge
            status={result.badge}
            score={result.overallScore}
            size="md"
          />
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Text Input */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your YouTube script here to check for compliance issues..."
              className={cn(
                'min-h-[400px] resize-none bg-gray-900/50 border-gray-700 text-gray-100',
                'placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
              )}
              readOnly={readOnly}
            />

            {/* Word count */}
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!text}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!text}
                className="text-gray-400 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            {!autoAnalyze && (
              <Button
                onClick={handleAnalyze}
                disabled={!text || isAnalyzing}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Analyze Script
              </Button>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] glass-card rounded-lg">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
              <p className="text-gray-400">Analyzing your script...</p>
            </div>
          ) : result ? (
            <>
              {/* Score Display */}
              <div className="glass-card rounded-lg p-6">
                <ComplianceScore
                  score={result.overallScore}
                  categories={result.categories}
                  showCategories={true}
                />
              </div>

              {/* Warnings Toggle */}
              {result.warnings.length > 0 && (
                <div className="glass-card rounded-lg p-4">
                  <button
                    onClick={() => setShowWarnings(!showWarnings)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-medium text-gray-300">
                      Warnings ({result.warnings.length})
                    </span>
                    {showWarnings ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {showWarnings && (
                    <div className="mt-4">
                      <ComplianceWarningList
                        warnings={result.warnings}
                        onApplySuggestion={handleApplySuggestion}
                        maxWarnings={5}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] glass-card rounded-lg text-center px-6">
              <Shield className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Ready to Analyze
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Paste your YouTube script in the text area to check for compliance issues,
                AI patterns, and authenticity markers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Report Toggle */}
      {showDetailedReport && result && (
        <div className="space-y-4">
          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full flex items-center justify-center gap-2 py-3 glass-card rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium text-gray-300">
              {showReport ? 'Hide' : 'Show'} Detailed Report
            </span>
            {showReport ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showReport && (
            <div className="glass-card rounded-lg p-6">
              <ComplianceReport
                result={result}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ComplianceCheckerCompact - A compact version for embedding
 */
export function ComplianceCheckerCompact({
  text,
  onAnalyze,
  className
}) {
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text?.trim()) return;

    setIsAnalyzing(true);
    try {
      const analysisResult = analyzeCompliance(text);
      setResult(analysisResult);
      if (onAnalyze) {
        onAnalyze(analysisResult);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAnalyze}
        disabled={!text || isAnalyzing}
      >
        {isAnalyzing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Shield className="w-4 h-4 mr-2" />
        )}
        Check Compliance
      </Button>

      {result && (
        <ComplianceBadge
          status={result.badge}
          score={result.overallScore}
          size="sm"
        />
      )}
    </div>
  );
}

export default ComplianceChecker;
