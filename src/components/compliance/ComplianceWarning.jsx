'use client';

/**
 * ComplianceWarning Component
 *
 * Displays inline warning markers with tooltips and action buttons.
 * Supports different severity levels: info, warning, critical
 */

import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, X, Lightbulb, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SEVERITY_LEVELS, CATEGORY_INFO } from '@/lib/compliance';

const SEVERITY_STYLES = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: Info,
    highlight: 'bg-blue-500/20',
    hoverHighlight: 'hover:bg-blue-500/30'
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: AlertTriangle,
    highlight: 'bg-yellow-500/20',
    hoverHighlight: 'hover:bg-yellow-500/30'
  },
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: AlertCircle,
    highlight: 'bg-red-500/20',
    hoverHighlight: 'hover:bg-red-500/30'
  }
};

/**
 * ComplianceWarning displays a single warning with details and actions
 *
 * @param {Object} props
 * @param {Object} props.warning - Warning object with severity, message, suggestion
 * @param {Function} props.onApplySuggestion - Callback when suggestion is applied
 * @param {Function} props.onDismiss - Callback when warning is dismissed
 * @param {boolean} props.showCategory - Whether to show the category label
 * @param {boolean} props.compact - Use compact layout
 * @param {string} props.className - Additional CSS classes
 */
export function ComplianceWarning({
  warning,
  onApplySuggestion,
  onDismiss,
  showCategory = true,
  compact = false,
  className
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const severity = warning?.severity || SEVERITY_LEVELS.info;
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
  const Icon = styles.icon;
  const categoryInfo = warning?.type ? CATEGORY_INFO[warning.type] : null;

  const handleApply = async () => {
    if (!onApplySuggestion || !warning?.suggestion) return;
    setIsApplying(true);
    try {
      await onApplySuggestion(warning);
    } finally {
      setIsApplying(false);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs',
          styles.bg,
          styles.text,
          className
        )}
        title={warning?.message}
      >
        <Icon className="w-3 h-3" />
        <span className="truncate max-w-[200px]">
          {warning?.message || 'Issue detected'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-200',
        styles.bg,
        styles.border,
        isExpanded && 'ring-1 ring-white/10',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn('p-1.5 rounded', styles.highlight)}>
            <Icon className={cn('w-4 h-4', styles.text)} />
          </div>

          <div className="flex-1 min-w-0">
            {showCategory && categoryInfo && (
              <div className="text-xs text-gray-500 mb-1">
                {categoryInfo.name}
              </div>
            )}
            <p className="text-sm text-gray-200">
              {warning?.message || 'Issue detected'}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={() => onDismiss(warning)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Suggestion */}
      {warning?.suggestion && (
        <div className="mt-3 flex items-start gap-2 pl-9">
          <Lightbulb className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-400">
              {warning.suggestion}
            </p>

            {onApplySuggestion && (
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  'mt-2 h-7 text-xs',
                  styles.text,
                  styles.hoverHighlight
                )}
                onClick={handleApply}
                disabled={isApplying}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                {isApplying ? 'Applying...' : 'Apply Fix'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Location info */}
      {warning?.locations && warning.locations.length > 0 && (
        <div className="mt-3 pl-9">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} {warning.locations.length} location{warning.locations.length > 1 ? 's' : ''}
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-1">
              {warning.locations.slice(0, 5).map((loc, idx) => (
                <div
                  key={idx}
                  className="text-xs font-mono text-gray-500 bg-black/20 px-2 py-1 rounded"
                >
                  Position: {loc.start}-{loc.end}
                </div>
              ))}
              {warning.locations.length > 5 && (
                <div className="text-xs text-gray-600">
                  +{warning.locations.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ComplianceWarningList displays a list of warnings grouped by severity
 */
export function ComplianceWarningList({
  warnings = [],
  onApplySuggestion,
  onDismiss,
  maxWarnings = 10,
  className
}) {
  if (warnings.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No issues detected</p>
      </div>
    );
  }

  // Group warnings by severity
  const grouped = {
    critical: warnings.filter(w => w.severity === 'critical'),
    warning: warnings.filter(w => w.severity === 'warning'),
    info: warnings.filter(w => w.severity === 'info')
  };

  const displayWarnings = warnings.slice(0, maxWarnings);
  const hiddenCount = warnings.length - maxWarnings;

  return (
    <div className={cn('space-y-3', className)}>
      {displayWarnings.map((warning, idx) => (
        <ComplianceWarning
          key={idx}
          warning={warning}
          onApplySuggestion={onApplySuggestion}
          onDismiss={onDismiss}
        />
      ))}

      {hiddenCount > 0 && (
        <div className="text-center py-2 text-sm text-gray-500">
          +{hiddenCount} more warning{hiddenCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-800">
        {grouped.critical.length > 0 && (
          <span className="text-xs text-red-400">
            {grouped.critical.length} critical
          </span>
        )}
        {grouped.warning.length > 0 && (
          <span className="text-xs text-yellow-400">
            {grouped.warning.length} warning{grouped.warning.length > 1 ? 's' : ''}
          </span>
        )}
        {grouped.info.length > 0 && (
          <span className="text-xs text-blue-400">
            {grouped.info.length} info
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * InlineWarningHighlight - Highlights text with a warning indicator
 */
export function InlineWarningHighlight({
  children,
  severity = 'warning',
  message,
  onClick,
  className
}) {
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.warning;

  return (
    <span
      className={cn(
        'relative cursor-pointer rounded px-0.5',
        styles.highlight,
        styles.hoverHighlight,
        'underline decoration-wavy decoration-1 underline-offset-2',
        severity === 'critical' && 'decoration-red-500',
        severity === 'warning' && 'decoration-yellow-500',
        severity === 'info' && 'decoration-blue-500',
        className
      )}
      onClick={onClick}
      title={message}
    >
      {children}
    </span>
  );
}

export default ComplianceWarning;
