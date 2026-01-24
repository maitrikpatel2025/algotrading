import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Clock, Info } from 'lucide-react';

/**
 * DrawdownDurationCard Component
 *
 * Displays average and maximum drawdown duration metrics.
 * Shows how long the strategy typically stays in drawdown before recovering.
 */
function DrawdownDurationCard({ avgDurationMinutes, maxDurationMinutes, className }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Format duration in minutes to human-readable format
  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return '--';

    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) {
      // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      // Days
      const days = Math.floor(minutes / 1440);
      const hours = Math.round((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  // Determine if durations are concerning (subjective threshold)
  const getDurationSeverity = (minutes) => {
    if (minutes === null || minutes === undefined) return 'neutral';
    // Convert to hours for evaluation
    const hours = minutes / 60;
    if (hours < 24) return 'good'; // Less than a day
    if (hours < 168) return 'moderate'; // Less than a week
    return 'concerning'; // More than a week
  };

  const avgSeverity = getDurationSeverity(avgDurationMinutes);
  const maxSeverity = getDurationSeverity(maxDurationMinutes);

  const hasData = avgDurationMinutes !== null || maxDurationMinutes !== null;

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
          <Clock className="h-4 w-4 text-neutral-500" />
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Drawdown Duration
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
            aria-label="Drawdown Duration info"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute z-50 bottom-full right-0 mb-2 w-64 p-2.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md shadow-lg animate-fade-in"
              role="tooltip"
            >
              <p className="mb-2">
                <strong>Drawdown Duration</strong> measures how long your equity stays below its
                previous peak before recovering.
              </p>
              <p className="text-neutral-500">
                <strong>Avg:</strong> Average time to recover from drawdowns.
                <br />
                <strong>Max:</strong> Longest drawdown period in the backtest.
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
          {/* Average Duration */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">Average</div>
            <div
              className={cn(
                'text-lg font-semibold tabular-nums',
                avgSeverity === 'good' && 'text-success',
                avgSeverity === 'moderate' && 'text-amber-600',
                avgSeverity === 'concerning' && 'text-danger',
                avgSeverity === 'neutral' && 'text-neutral-400'
              )}
            >
              {formatDuration(avgDurationMinutes)}
            </div>
          </div>

          {/* Max Duration */}
          <div>
            <div className="text-xs text-neutral-500 mb-1">Maximum</div>
            <div
              className={cn(
                'text-lg font-semibold tabular-nums',
                maxSeverity === 'good' && 'text-success',
                maxSeverity === 'moderate' && 'text-amber-600',
                maxSeverity === 'concerning' && 'text-danger',
                maxSeverity === 'neutral' && 'text-neutral-400'
              )}
            >
              {formatDuration(maxDurationMinutes)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <span className="text-sm text-neutral-400">No drawdown data available</span>
        </div>
      )}

      {/* Severity Indicator */}
      {hasData && maxSeverity === 'concerning' && (
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <div className="flex items-center gap-1.5 text-xs text-danger">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            Extended drawdown periods detected
          </div>
        </div>
      )}
    </div>
  );
}

export default DrawdownDurationCard;
