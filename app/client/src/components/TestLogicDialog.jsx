import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Timer,
} from 'lucide-react';
import { groupReferenceIndicatorsByTimeframe } from '../app/conditionDefaults';
import { TIMEFRAME_LABELS } from '../app/constants';
import {
  CONDITION_SECTION_LABELS,
  GROUP_OPERATOR_LABELS,
} from '../app/constants';
import {
  evaluateLogic,
  formatNaturalLanguageCondition,
} from '../app/conditionDefaults';

/**
 * TestLogicDialog Component
 *
 * Dialog displaying logic evaluation results against current market data.
 * Shows pass/fail status for each condition and group with values.
 *
 * @param {boolean} isOpen - Whether the dialog is open
 * @param {Function} onClose - Callback to close the dialog
 * @param {string} section - The section being evaluated
 * @param {Array} conditions - All conditions
 * @param {Array} groups - All groups
 * @param {Object} candleData - Current candle data { open, high, low, close, time }
 * @param {Object} indicatorValues - Map of indicator instanceId -> current value
 * @param {Object} patternDetections - Map of pattern instanceId -> boolean
 * @param {Object} previousCandleData - Previous candle data
 * @param {Object} previousIndicatorValues - Previous indicator values
 * @param {Object} referenceIndicatorValues - Map of reference indicator ID -> current value
 * @param {Array} referenceIndicators - Array of reference indicator objects
 */
function TestLogicDialog({
  isOpen,
  onClose,
  section,
  conditions,
  groups,
  candleData,
  indicatorValues = {},
  patternDetections = {},
  previousCandleData = null,
  previousIndicatorValues = null,
  referenceIndicatorValues = {},
  referenceIndicators = [],
}) {
  // Evaluate logic
  const evaluationResult = useMemo(() => {
    if (!isOpen || !section) return null;

    return evaluateLogic(
      section,
      conditions,
      groups,
      candleData,
      indicatorValues,
      patternDetections,
      previousCandleData,
      previousIndicatorValues
    );
  }, [isOpen, section, conditions, groups, candleData, indicatorValues, patternDetections, previousCandleData, previousIndicatorValues]);

  // Format number for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1000) return value.toFixed(0);
      if (Math.abs(value) >= 1) return value.toFixed(4);
      return value.toFixed(6);
    }
    return String(value);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return String(timestamp);
    }
  };

  // Render evaluation result recursively
  const renderResult = (result, depth = 0) => {
    const indent = depth * 16;

    if (result.type === 'condition') {
      const condition = conditions.find(c => c.id === result.id);
      const preview = condition ? formatNaturalLanguageCondition(condition) : 'Unknown condition';

      return (
        <div
          key={result.id}
          className={cn(
            "flex items-start gap-3 py-2 px-3 rounded-md",
            result.result ? "bg-success/5" : "bg-destructive/5"
          )}
          style={{ marginLeft: `${indent}px` }}
        >
          {/* Status icon */}
          {result.result ? (
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium",
              result.result ? "text-success" : "text-destructive"
            )}>
              {preview || 'Condition'}
            </p>

            {/* Values */}
            <div className="flex flex-wrap gap-4 mt-1 text-xs text-muted-foreground">
              <span>
                Left: <span className="font-mono">{formatValue(result.leftValue)}</span>
              </span>
              {result.rightValue !== null && result.rightValue !== undefined && (
                <span>
                  Right: <span className="font-mono">{formatValue(result.rightValue)}</span>
                </span>
              )}
              {result.rightMaxValue !== null && result.rightMaxValue !== undefined && (
                <span>
                  Max: <span className="font-mono">{formatValue(result.rightMaxValue)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Group result
    return (
      <div key={result.id} className="space-y-2" style={{ marginLeft: `${indent}px` }}>
        {/* Group header */}
        <div className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md",
          result.result ? "bg-success/10" : "bg-destructive/10"
        )}>
          {result.result ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}

          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-semibold",
            result.operator === 'and'
              ? "bg-blue-500/20 text-blue-600"
              : "bg-amber-500/20 text-amber-600"
          )}>
            {GROUP_OPERATOR_LABELS[result.operator]}
          </span>

          <span className="text-sm text-muted-foreground">
            Group ({result.childResults?.length || 0} items)
          </span>

          <span className={cn(
            "ml-auto text-xs font-medium",
            result.result ? "text-success" : "text-destructive"
          )}>
            {result.result ? 'PASS' : 'FAIL'}
          </span>
        </div>

        {/* Child results */}
        {result.childResults && (
          <div className="ml-4 space-y-2 border-l-2 border-border/50 pl-2">
            {result.childResults.map(child => renderResult(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Test Logic
              </h2>
              <p className="text-sm text-muted-foreground">
                {CONDITION_SECTION_LABELS[section] || section}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-2 rounded-md text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Market Data */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Current Candle Data
          </h3>

          {candleData ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Open</span>
                <span className="font-mono">{formatValue(candleData.open)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">High</span>
                <span className="font-mono text-success">{formatValue(candleData.high)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Low</span>
                <span className="font-mono text-destructive">{formatValue(candleData.low)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Close</span>
                <span className="font-mono">{formatValue(candleData.close)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Time
                </span>
                <span className="text-xs">{formatTime(candleData.time)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No candle data available</p>
          )}

          {/* Indicator Values */}
          {Object.keys(indicatorValues).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Indicator Values</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(indicatorValues).map(([instanceId, value]) => (
                  <span
                    key={instanceId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                  >
                    <span className="text-muted-foreground">{instanceId.split('-')[0]}:</span>
                    <span className="font-mono">
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : formatValue(value)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reference Indicator Values (Multi-Timeframe) */}
          {referenceIndicators.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Reference Timeframes
              </h4>
              {(() => {
                const grouped = groupReferenceIndicatorsByTimeframe(referenceIndicators);
                return Object.entries(grouped).map(([timeframe, indicators]) => (
                  <div key={timeframe} className="mb-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold mb-1">
                      {timeframe}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {TIMEFRAME_LABELS[timeframe]}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {indicators.map(ri => {
                        const value = referenceIndicatorValues[ri.id];
                        return (
                          <span
                            key={ri.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                            style={{ borderLeft: `3px solid ${ri.color || 'hsl(var(--border))'}` }}
                          >
                            <span className="text-muted-foreground">{ri.shortName || ri.indicatorId}:</span>
                            <span className="font-mono">
                              {value === null || value === undefined
                                ? 'N/A'
                                : typeof value === 'object'
                                  ? Object.entries(value).map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ')
                                  : formatValue(value)}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Evaluation Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Evaluation Results
          </h3>

          {evaluationResult ? (
            <div className="space-y-3">
              {/* Overall Result Banner */}
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-lg",
                evaluationResult.result
                  ? "bg-success/10 border border-success/30"
                  : "bg-destructive/10 border border-destructive/30"
              )}>
                {evaluationResult.result ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-medium text-success">Signal Would Fire</p>
                      <p className="text-sm text-muted-foreground">
                        All conditions are met ({evaluationResult.summary.passed}/{evaluationResult.summary.total} passed)
                      </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-success ml-auto" />
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">Signal Would Not Fire</p>
                      <p className="text-sm text-muted-foreground">
                        {evaluationResult.summary.failed} of {evaluationResult.summary.total} conditions failed
                      </p>
                    </div>
                    <TrendingDown className="h-5 w-5 text-destructive ml-auto" />
                  </>
                )}
              </div>

              {/* Individual Results */}
              <div className="space-y-2">
                {evaluationResult.itemResults.map(result => renderResult(result, 0))}
              </div>

              {/* Empty State */}
              {evaluationResult.itemResults.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No conditions to evaluate in this section
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              Unable to evaluate - missing data
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Evaluation based on most recent candle data
            </p>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestLogicDialog;
