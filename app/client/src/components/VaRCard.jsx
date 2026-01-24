import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, Info } from 'lucide-react';

/**
 * VaRCard Component
 *
 * Displays Value at Risk (VaR) metrics at 95% and 99% confidence levels.
 * VaR represents the maximum expected loss at a given confidence level.
 */
function VaRCard({ var95, var99, currency = '$', className }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Format currency value
  const formatValue = (value) => {
    if (value === null || value === undefined) return '--';
    const formatted = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return value >= 0 ? `${currency}${formatted}` : `-${currency}${formatted}`;
  };

  // Determine severity based on VaR value relative to typical trade
  const getVaRSeverity = (value) => {
    if (value === null || value === undefined) return 'neutral';
    // More negative = worse VaR
    if (value >= 0) return 'good'; // Positive VaR means even worst case is profitable
    if (value > -50) return 'moderate';
    return 'concerning';
  };

  const var95Severity = getVaRSeverity(var95);
  const var99Severity = getVaRSeverity(var99);

  const hasData = var95 !== null || var99 !== null;

  return (
    <div
      className={cn(
        'rounded-md border border-neutral-200 p-4 bg-neutral-50 animate-fade-in',
        className
      )}
    >
      {/* Header with Icon and Tooltip */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-neutral-500" />
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Value at Risk
          </span>
        </div>

        {/* Info Icon with Tooltip */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-white/50 transition-colors"
            aria-label="Value at Risk info"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute z-50 bottom-full right-0 mb-2 w-72 p-2.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md shadow-lg animate-fade-in"
              role="tooltip"
            >
              <p className="mb-2">
                <strong>Value at Risk (VaR)</strong> estimates the maximum expected loss based on
                historical trade performance.
              </p>
              <p className="text-neutral-500 mb-1">
                <strong>VaR 95%:</strong> 95% of trades will not lose more than this amount.
              </p>
              <p className="text-neutral-500">
                <strong>VaR 99%:</strong> 99% of trades will not lose more than this amount (more
                conservative).
              </p>
              {/* Arrow */}
              <div className="absolute top-full right-3 -mt-px">
                <div className="w-2 h-2 bg-white border-r border-b border-neutral-200 transform rotate-45 -translate-y-1" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      {hasData ? (
        <div className="grid grid-cols-2 gap-4">
          {/* VaR 95% */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">95% Confidence</div>
            <div
              className={cn(
                'text-lg font-semibold tabular-nums',
                var95Severity === 'good' && 'text-success',
                var95Severity === 'moderate' && 'text-amber-600',
                var95Severity === 'concerning' && 'text-danger',
                var95Severity === 'neutral' && 'text-neutral-400'
              )}
            >
              {formatValue(var95)}
            </div>
          </div>

          {/* VaR 99% */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">99% Confidence</div>
            <div
              className={cn(
                'text-lg font-semibold tabular-nums',
                var99Severity === 'good' && 'text-success',
                var99Severity === 'moderate' && 'text-amber-600',
                var99Severity === 'concerning' && 'text-danger',
                var99Severity === 'neutral' && 'text-neutral-400'
              )}
            >
              {formatValue(var99)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <span className="text-sm text-neutral-400">
            Insufficient trades for VaR calculation
          </span>
        </div>
      )}

      {/* Interpretation Guide */}
      {hasData && (
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span
              className={cn(
                'inline-block w-1.5 h-1.5 rounded-full',
                var99 !== null && var99 < -100 ? 'bg-danger' : 'bg-neutral-300'
              )}
            />
            {var99 !== null && var99 < -100
              ? 'Tail risk exposure detected'
              : 'Normal tail risk levels'}
          </div>
        </div>
      )}
    </div>
  );
}

export default VaRCard;
