import React, { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import {
  ChevronDown,
  ChevronRight,
  X,
  Clock,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import {
  TIMEFRAME_LABELS,
  MULTI_TIMEFRAME_WARNING_TEXT,
} from '../app/constants';
import {
  groupReferenceIndicatorsByTimeframe,
} from '../app/conditionDefaults';

/**
 * ReferenceIndicatorsPanel Component
 *
 * A collapsible panel displaying reference indicators from other timeframes.
 * Groups indicators by timeframe and shows their current calculated values.
 *
 * @param {Array} referenceIndicators - Array of reference indicator objects
 * @param {Object} referenceIndicatorValues - Map of reference indicator ID -> current value
 * @param {Function} getReferenceDisplayName - Function to get display name for a reference indicator
 * @param {Function} onDeleteReferenceIndicator - Callback when delete is clicked
 * @param {boolean} loading - Whether reference data is being loaded
 */
function ReferenceIndicatorsPanel({
  referenceIndicators = [],
  referenceIndicatorValues = {},
  getReferenceDisplayName,
  onDeleteReferenceIndicator,
  loading = false,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Group indicators by timeframe
  const groupedIndicators = groupReferenceIndicatorsByTimeframe(referenceIndicators);
  const timeframes = Object.keys(groupedIndicators);
  const totalCount = referenceIndicators.length;

  // Toggle panel expansion
  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Handle delete with indicator ID
  const handleDelete = useCallback((referenceIndicatorId) => {
    if (onDeleteReferenceIndicator) {
      onDeleteReferenceIndicator(referenceIndicatorId);
    }
  }, [onDeleteReferenceIndicator]);

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1000) return value.toFixed(0);
      if (Math.abs(value) >= 1) return value.toFixed(4);
      return value.toFixed(6);
    }
    if (typeof value === 'object') {
      // Multi-component indicator - show first value or summary
      const keys = Object.keys(value);
      if (keys.length === 0) return 'N/A';
      const firstKey = keys[0];
      return `${firstKey}: ${formatValue(value[firstKey])}`;
    }
    return String(value);
  };

  // Don't render if no reference indicators
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="border-t border-border">
      {/* Panel Header */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center w-full px-4 py-2.5",
          "bg-muted/30 hover:bg-muted/50",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/50"
        )}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground mr-2" />
        )}
        <Clock className="h-4 w-4 text-primary mr-2" />
        <span className="text-sm font-medium text-foreground">Reference Indicators</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {totalCount}
        </span>
      </button>

      {/* Panel Content */}
      {isExpanded && (
        <div className="px-3 py-3 space-y-3">
          {/* Performance Warning Banner */}
          <div className={cn(
            "flex items-start gap-2 p-2 rounded-md",
            "bg-amber-500/10 border border-amber-500/20"
          )}>
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {MULTI_TIMEFRAME_WARNING_TEXT}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading reference data...</span>
            </div>
          )}

          {/* Timeframe Groups */}
          {timeframes.map(timeframe => (
            <div key={timeframe} className="space-y-2">
              {/* Timeframe Header */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-semibold",
                  "bg-primary/10 text-primary"
                )}>
                  {timeframe}
                </span>
                <span className="text-xs text-muted-foreground">
                  {TIMEFRAME_LABELS[timeframe] || timeframe}
                </span>
              </div>

              {/* Indicators in this timeframe */}
              <div className="space-y-1.5 ml-2">
                {groupedIndicators[timeframe].map(refIndicator => {
                  const displayName = getReferenceDisplayName
                    ? getReferenceDisplayName(refIndicator)
                    : `${refIndicator.indicatorId}`;
                  const value = referenceIndicatorValues[refIndicator.id];

                  return (
                    <div
                      key={refIndicator.id}
                      className={cn(
                        "group flex items-center justify-between p-2 rounded-md",
                        "bg-card border border-border",
                        "hover:bg-muted/30 transition-colors"
                      )}
                      style={{
                        borderLeftWidth: '3px',
                        borderLeftColor: refIndicator.color || 'hsl(var(--border))',
                      }}
                    >
                      {/* Indicator Info */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Activity className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Value: <span className="font-mono">{formatValue(value)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(refIndicator.id)}
                        className={cn(
                          "p-1 rounded",
                          "opacity-0 group-hover:opacity-100",
                          "text-muted-foreground hover:text-destructive",
                          "hover:bg-destructive/10",
                          "transition-all focus:outline-none focus:ring-2 focus:ring-destructive/50"
                        )}
                        title="Remove reference indicator"
                        aria-label="Remove reference indicator"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty State (shouldn't show if we have indicators, but just in case) */}
          {timeframes.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No reference indicators.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add multi-timeframe conditions to see indicators from other timeframes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReferenceIndicatorsPanel;
