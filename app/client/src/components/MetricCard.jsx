import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Info } from 'lucide-react';

/**
 * MetricCard Component - Precision Swiss Design System
 *
 * Reusable card for displaying metrics with:
 * - Label at top in small uppercase text
 * - Large value with optional prefix/suffix
 * - Color coding: green for positive, red for negative, gray for neutral
 * - Info icon that shows tooltip on hover
 * - Subtle animation on mount
 */
function MetricCard({
  label,
  value,
  prefix = '',
  suffix = '',
  tooltip,
  trend = 'neutral', // 'positive', 'negative', 'neutral'
  className,
  size = 'default', // 'default', 'large'
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Format value for display
  const formatValue = () => {
    if (value === null || value === undefined) return '--';
    if (typeof value === 'number') {
      // Add sign for positive trend values
      const sign = trend === 'positive' && value > 0 ? '+' : '';
      return `${sign}${prefix}${value.toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
      })}${suffix}`;
    }
    return `${prefix}${value}${suffix}`;
  };

  // Get trend-based styling
  const getTrendStyles = () => {
    switch (trend) {
      case 'positive':
        return {
          text: 'text-success',
          bg: 'bg-success-light',
        };
      case 'negative':
        return {
          text: 'text-danger',
          bg: 'bg-danger-light',
        };
      default:
        return {
          text: 'text-neutral-900',
          bg: 'bg-neutral-50',
        };
    }
  };

  const trendStyles = getTrendStyles();

  return (
    <div
      className={cn(
        'rounded-md border border-neutral-200 p-4 animate-fade-in',
        trendStyles.bg,
        className
      )}
    >
      {/* Label Row with Tooltip */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </span>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-white/50 transition-colors"
              aria-label={`Info: ${label}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>

            {/* Tooltip */}
            {showTooltip && (
              <div
                className="absolute z-50 bottom-full right-0 mb-2 w-56 p-2 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md shadow-lg animate-fade-in"
                role="tooltip"
              >
                {tooltip}
                {/* Arrow */}
                <div className="absolute top-full right-3 -mt-px">
                  <div className="w-2 h-2 bg-white border-r border-b border-neutral-200 transform rotate-45 -translate-y-1" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className={cn(
          'font-semibold tabular-nums',
          trendStyles.text,
          size === 'large' ? 'text-2xl' : 'text-lg'
        )}
      >
        {formatValue()}
      </div>
    </div>
  );
}

export default MetricCard;
