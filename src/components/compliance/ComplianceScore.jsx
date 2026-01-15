'use client';

/**
 * ComplianceScore Component
 *
 * Displays overall compliance score and category breakdowns
 * with color-coded progress bars.
 */

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Lightbulb, Bot, LayoutTemplate, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_INFO, STATUS_THRESHOLDS } from '@/lib/compliance';

const CATEGORY_ICONS = {
  repetitiveness: RefreshCw,
  originalInsight: Lightbulb,
  aiPatterns: Bot,
  structure: LayoutTemplate
};

const CATEGORY_COLORS = {
  repetitiveness: {
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    light: 'bg-blue-500/20'
  },
  originalInsight: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    light: 'bg-yellow-500/20'
  },
  aiPatterns: {
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    light: 'bg-purple-500/20'
  },
  structure: {
    bg: 'bg-green-500',
    text: 'text-green-400',
    light: 'bg-green-500/20'
  }
};

/**
 * Returns the color class based on score value
 */
function getScoreColor(score) {
  if (score >= STATUS_THRESHOLDS.approved) return 'text-green-400';
  if (score >= STATUS_THRESHOLDS.needsReview) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Returns the progress bar color based on score value
 */
function getProgressColor(score) {
  if (score >= STATUS_THRESHOLDS.approved) return 'bg-green-500';
  if (score >= STATUS_THRESHOLDS.needsReview) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * CircularScore - Circular progress indicator for overall score
 */
function CircularScore({ score, size = 120 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colorClass = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-gray-700"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn(
            'transition-all duration-700 ease-out',
            colorClass.replace('text-', 'stroke-')
          )}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', colorClass)}>
          {score}
        </span>
        <span className="text-xs text-gray-400">out of 100</span>
      </div>
    </div>
  );
}

/**
 * CategoryScoreBar - Individual category score display
 */
function CategoryScoreBar({ category, score, issues = [], expanded = false, onToggle }) {
  const Icon = CATEGORY_ICONS[category] || RefreshCw;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.repetitiveness;
  const info = CATEGORY_INFO[category] || { name: category, description: '' };

  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', colors.light)}>
            <Icon className={cn('w-4 h-4', colors.text)} />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{info.name}</div>
            <div className="text-xs text-gray-500">{info.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-lg font-bold font-mono', getScoreColor(score))}>
            {score}
          </span>
          {issues.length > 0 && (
            expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )
          )}
        </div>
      </button>

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            getProgressColor(score)
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Expanded issues */}
      {expanded && issues.length > 0 && (
        <ul className="mt-3 space-y-1 pl-12">
          {issues.map((issue, idx) => (
            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">-</span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * ComplianceScore displays the overall score and category breakdowns
 *
 * @param {Object} props
 * @param {number} props.score - Overall compliance score (0-100)
 * @param {Object} props.categories - Category scores and issues
 * @param {boolean} props.compact - Use compact layout
 * @param {boolean} props.showCategories - Whether to show category breakdowns
 * @param {string} props.className - Additional CSS classes
 */
export function ComplianceScore({
  score = 0,
  categories = {},
  compact = false,
  showCategories = true,
  className
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              className="text-gray-700"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="28"
              cx="32"
              cy="32"
            />
            <circle
              className={cn(
                'transition-all duration-500',
                getScoreColor(score).replace('text-', 'stroke-')
              )}
              strokeWidth="4"
              strokeDasharray={175.93}
              strokeDashoffset={175.93 - (score / 100) * 175.93}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="28"
              cx="32"
              cy="32"
            />
          </svg>
          <span className={cn(
            'absolute inset-0 flex items-center justify-center text-lg font-bold',
            getScoreColor(score)
          )}>
            {score}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Compliance Score
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Score */}
      <div className="flex flex-col items-center">
        <CircularScore score={score} />
        <div className="mt-3 text-center">
          <div className="text-lg font-semibold text-white">
            Overall Compliance
          </div>
          <div className="text-sm text-gray-400">
            {score >= STATUS_THRESHOLDS.approved && 'Safe to publish'}
            {score >= STATUS_THRESHOLDS.needsReview && score < STATUS_THRESHOLDS.approved && 'Review recommended'}
            {score < STATUS_THRESHOLDS.needsReview && 'Needs significant improvements'}
          </div>
        </div>
      </div>

      {/* Category Breakdowns */}
      {showCategories && Object.keys(categories).length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            Category Scores
          </div>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, data]) => (
              <CategoryScoreBar
                key={category}
                category={category}
                score={data.score || 0}
                issues={data.issues || []}
                expanded={expandedCategory === category}
                onToggle={() => setExpandedCategory(
                  expandedCategory === category ? null : category
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ComplianceScoreInline - Inline score display for lists/tables
 */
export function ComplianceScoreInline({ score, className }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative w-8 h-8">
        <svg className="transform -rotate-90 w-8 h-8">
          <circle
            className="text-gray-700"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="12"
            cx="16"
            cy="16"
          />
          <circle
            className={cn(
              'transition-all duration-300',
              getScoreColor(score).replace('text-', 'stroke-')
            )}
            strokeWidth="2"
            strokeDasharray={75.4}
            strokeDashoffset={75.4 - (score / 100) * 75.4}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="12"
            cx="16"
            cy="16"
          />
        </svg>
      </div>
      <span className={cn('text-sm font-bold font-mono', getScoreColor(score))}>
        {score}
      </span>
    </div>
  );
}

export default ComplianceScore;
