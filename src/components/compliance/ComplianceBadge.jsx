'use client';

/**
 * ComplianceBadge Component
 *
 * Visual badge indicating script compliance status.
 * Three states: approved (green), needs-review (yellow), high-risk (red)
 */

import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, XCircle, Shield } from 'lucide-react';
import { BADGE_STATUS } from '@/lib/compliance';

const BADGE_STYLES = {
  approved: {
    bg: 'bg-green-500/10 hover:bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: CheckCircle,
    glow: 'shadow-green-500/20'
  },
  'needs-review': {
    bg: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: AlertCircle,
    glow: 'shadow-yellow-500/20'
  },
  'high-risk': {
    bg: 'bg-red-500/10 hover:bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: XCircle,
    glow: 'shadow-red-500/20'
  }
};

const SIZE_STYLES = {
  sm: {
    container: 'px-2 py-1 text-xs gap-1',
    icon: 'w-3 h-3',
    score: 'text-[10px]'
  },
  md: {
    container: 'px-3 py-1.5 text-sm gap-1.5',
    icon: 'w-4 h-4',
    score: 'text-xs'
  },
  lg: {
    container: 'px-4 py-2 text-base gap-2',
    icon: 'w-5 h-5',
    score: 'text-sm'
  }
};

/**
 * ComplianceBadge displays the compliance status of a script
 *
 * @param {Object} props
 * @param {'approved'|'needs-review'|'high-risk'} props.status - Compliance status
 * @param {number} props.score - Optional score to display (0-100)
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {boolean} props.showScore - Whether to display the score
 * @param {boolean} props.showIcon - Whether to display the icon
 * @param {boolean} props.animate - Whether to animate on status change
 * @param {string} props.className - Additional CSS classes
 */
export function ComplianceBadge({
  status = 'high-risk',
  score,
  size = 'md',
  showScore = true,
  showIcon = true,
  animate = true,
  className
}) {
  const styles = BADGE_STYLES[status] || BADGE_STYLES['high-risk'];
  const sizeStyles = SIZE_STYLES[size] || SIZE_STYLES.md;
  const badgeInfo = BADGE_STATUS[status] || BADGE_STATUS['high-risk'];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all duration-300',
        styles.bg,
        styles.border,
        styles.text,
        sizeStyles.container,
        animate && 'animate-in fade-in-0 zoom-in-95',
        className
      )}
      title={badgeInfo.description}
      role="status"
      aria-label={`Compliance status: ${badgeInfo.label}`}
    >
      {showIcon && (
        <Icon
          className={cn(
            sizeStyles.icon,
            'flex-shrink-0',
            animate && 'animate-in spin-in-90 duration-300'
          )}
        />
      )}

      <span className="font-semibold whitespace-nowrap">
        {badgeInfo.label}
      </span>

      {showScore && typeof score === 'number' && (
        <span
          className={cn(
            'font-mono opacity-75',
            sizeStyles.score
          )}
        >
          ({score})
        </span>
      )}
    </div>
  );
}

/**
 * ComplianceBadgeCompact - A smaller, icon-only version of the badge
 */
export function ComplianceBadgeCompact({
  status = 'high-risk',
  score,
  size = 'md',
  className
}) {
  const styles = BADGE_STYLES[status] || BADGE_STYLES['high-risk'];
  const sizeStyles = SIZE_STYLES[size] || SIZE_STYLES.md;
  const badgeInfo = BADGE_STATUS[status] || BADGE_STATUS['high-risk'];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full border p-1.5 transition-all duration-300',
        styles.bg,
        styles.border,
        styles.text,
        className
      )}
      title={`${badgeInfo.label}${typeof score === 'number' ? ` (${score}/100)` : ''}`}
    >
      <Icon className={sizeStyles.icon} />
    </div>
  );
}

/**
 * ComplianceBadgePill - A pill-shaped badge with shield icon
 */
export function ComplianceBadgePill({
  status = 'high-risk',
  score,
  className
}) {
  const styles = BADGE_STYLES[status] || BADGE_STYLES['high-risk'];
  const badgeInfo = BADGE_STATUS[status] || BADGE_STATUS['high-risk'];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm',
        styles.bg,
        styles.border,
        styles.text,
        className
      )}
    >
      <Shield className="w-5 h-5" />
      <div className="flex flex-col">
        <span className="font-semibold text-sm leading-tight">
          {badgeInfo.label}
        </span>
        {typeof score === 'number' && (
          <span className="text-xs opacity-75 font-mono">
            Score: {score}/100
          </span>
        )}
      </div>
    </div>
  );
}

export default ComplianceBadge;
