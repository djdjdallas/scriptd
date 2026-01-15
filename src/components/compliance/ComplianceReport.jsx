'use client';

/**
 * ComplianceReport Component
 *
 * Full detailed analysis report using tabs for each category.
 * Shows issues, suggestions, and actionable improvements.
 */

import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw, Lightbulb, Bot, LayoutTemplate, CheckCircle,
  AlertTriangle, FileText, BarChart3
} from 'lucide-react';
import { ComplianceWarningList } from './ComplianceWarning';
import { CATEGORY_INFO, STATUS_THRESHOLDS, SUGGESTIONS } from '@/lib/compliance';

const CATEGORY_ICONS = {
  repetitiveness: RefreshCw,
  originalInsight: Lightbulb,
  aiPatterns: Bot,
  structure: LayoutTemplate
};

const CATEGORY_ORDER = ['repetitiveness', 'originalInsight', 'aiPatterns', 'structure'];

/**
 * Returns score status text
 */
function getScoreStatus(score) {
  if (score >= 90) return { text: 'Excellent', color: 'text-green-400' };
  if (score >= STATUS_THRESHOLDS.approved) return { text: 'Good', color: 'text-green-400' };
  if (score >= STATUS_THRESHOLDS.needsReview) return { text: 'Fair', color: 'text-yellow-400' };
  if (score >= 40) return { text: 'Poor', color: 'text-orange-400' };
  return { text: 'Critical', color: 'text-red-400' };
}

/**
 * CategoryTabContent - Content for each category tab
 */
function CategoryTabContent({
  category,
  data,
  warnings,
  onApplySuggestion
}) {
  const info = CATEGORY_INFO[category];
  const categoryWarnings = warnings.filter(w => w.type === category);
  const status = getScoreStatus(data.score);
  const suggestions = data.suggestions || SUGGESTIONS[category] || [];

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="flex items-center justify-between p-4 glass-card rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-white">{info.name}</h3>
          <p className="text-sm text-gray-400">{info.description}</p>
        </div>
        <div className="text-right">
          <div className={cn('text-3xl font-bold font-mono', status.color)}>
            {data.score}
          </div>
          <div className={cn('text-sm', status.color)}>{status.text}</div>
        </div>
      </div>

      {/* Issues Found */}
      {data.issues && data.issues.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Issues Found ({data.issues.length})
          </h4>
          <ul className="space-y-2">
            {data.issues.map((issue, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
              >
                <span className="text-yellow-400 mt-0.5">-</span>
                <span className="text-sm text-gray-300">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-sm text-green-400">No issues found in this category</span>
        </div>
      )}

      {/* Warnings with Actions */}
      {categoryWarnings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            Detailed Warnings
          </h4>
          <ComplianceWarningList
            warnings={categoryWarnings}
            onApplySuggestion={onApplySuggestion}
            showCategory={false}
            maxWarnings={5}
          />
        </div>
      )}

      {/* Suggestions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-purple-400" />
          Improvement Tips
        </h4>
        <ul className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg"
            >
              <span className="text-purple-400 font-mono text-sm">{idx + 1}.</span>
              <span className="text-sm text-gray-300">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * OverviewTabContent - Overview tab with summary stats
 */
function OverviewTabContent({ result, stats }) {
  const issueCount = Object.values(result.categories).reduce(
    (sum, cat) => sum + (cat.issues?.length || 0), 0
  );
  const warningCount = result.warnings?.length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.wordCount}</div>
          <div className="text-xs text-gray-400">Words</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.sentenceCount}</div>
          <div className="text-xs text-gray-400">Sentences</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(stats.vocabularyDiversity * 100)}%
          </div>
          <div className="text-xs text-gray-400">Vocab Diversity</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(stats.avgSentenceLength)}
          </div>
          <div className="text-xs text-gray-400">Avg Words/Sentence</div>
        </div>
      </div>

      {/* Category Summary */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          Category Breakdown
        </h4>
        <div className="grid gap-3">
          {CATEGORY_ORDER.map(category => {
            const data = result.categories[category];
            const info = CATEGORY_INFO[category];
            const Icon = CATEGORY_ICONS[category];
            const status = getScoreStatus(data.score);

            return (
              <div
                key={category}
                className="flex items-center justify-between p-4 glass-card rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-white">{info.name}</div>
                    <div className="text-xs text-gray-500">
                      {data.issues?.length || 0} issue{data.issues?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className={cn('text-xl font-bold font-mono', status.color)}>
                  {data.score}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue Summary */}
      <div className="flex items-center justify-between p-4 glass-card rounded-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-white">Total Issues</span>
        </div>
        <div className="text-xl font-bold text-yellow-400">{issueCount}</div>
      </div>

      {/* Overall Recommendation */}
      <div className={cn(
        'p-4 rounded-lg border',
        result.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'
      )}>
        <div className="flex items-start gap-3">
          {result.passed ? (
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          )}
          <div>
            <div className={cn(
              'font-semibold',
              result.passed ? 'text-green-400' : 'text-yellow-400'
            )}>
              {result.passed ? 'Ready for Review' : 'Improvements Recommended'}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {result.passed
                ? 'Your script meets basic compliance requirements. Consider addressing any remaining warnings for best results.'
                : `Address the ${issueCount} issue${issueCount !== 1 ? 's' : ''} above to improve your compliance score.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ComplianceReport displays the full analysis report with tabs
 *
 * @param {Object} props
 * @param {Object} props.result - Full compliance analysis result
 * @param {Function} props.onApplySuggestion - Callback when suggestion is applied
 * @param {string} props.defaultTab - Default tab to show
 * @param {string} props.className - Additional CSS classes
 */
export function ComplianceReport({
  result,
  onApplySuggestion,
  defaultTab = 'overview',
  className
}) {
  if (!result) {
    return (
      <div className={cn('text-center py-12 text-gray-500', className)}>
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No analysis results available</p>
        <p className="text-sm mt-1">Enter text to analyze</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab} className={cn('w-full', className)}>
      <TabsList className="w-full justify-start bg-gray-900/50 p-1 rounded-lg overflow-x-auto">
        <TabsTrigger value="overview" className="gap-1.5">
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        {CATEGORY_ORDER.map(category => {
          const Icon = CATEGORY_ICONS[category];
          const info = CATEGORY_INFO[category];
          const score = result.categories[category]?.score || 0;

          return (
            <TabsTrigger key={category} value={category} className="gap-1.5">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{info.name}</span>
              <span className={cn(
                'text-xs font-mono',
                score >= STATUS_THRESHOLDS.approved && 'text-green-400',
                score >= STATUS_THRESHOLDS.needsReview && score < STATUS_THRESHOLDS.approved && 'text-yellow-400',
                score < STATUS_THRESHOLDS.needsReview && 'text-red-400'
              )}>
                {score}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTabContent result={result} stats={result.stats} />
      </TabsContent>

      {CATEGORY_ORDER.map(category => (
        <TabsContent key={category} value={category} className="mt-6">
          <CategoryTabContent
            category={category}
            data={result.categories[category]}
            warnings={result.warnings}
            onApplySuggestion={onApplySuggestion}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default ComplianceReport;
