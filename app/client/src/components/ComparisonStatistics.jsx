import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { METRIC_DEFINITIONS } from '../app/metricDefinitions';

/**
 * ComparisonStatistics Component
 *
 * Displays statistical significance analysis for metric differences between backtests.
 * Features:
 * - P-value display with significance indicators
 * - Green checkmark for significant differences (p < 0.05)
 * - Yellow warning for non-significant differences
 * - Interpretation text for each metric
 * - Expandable methodology section
 */
function ComparisonStatistics({ statisticalSignificance = [] }) {
  const [methodologyExpanded, setMethodologyExpanded] = useState(false);

  if (statisticalSignificance.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500">
        No statistical significance data available
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                P-Value
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Significant
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Best Performer
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {statisticalSignificance.map((stat) => {
              const metricDef = METRIC_DEFINITIONS[stat.metric];
              const displayName = metricDef?.label || stat.metric.replace(/_/g, ' ');

              return (
                <tr key={stat.metric} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                    <div className="flex items-center gap-1.5">
                      <span>{displayName}</span>
                      {metricDef?.tooltip && (
                        <div className="group relative">
                          <Info className="h-3.5 w-3.5 text-neutral-400 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                            <div className="bg-neutral-900 text-white text-xs rounded-md px-3 py-2 max-w-xs shadow-lg">
                              {metricDef.tooltip}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums">
                    {stat.p_value !== null ? (
                      <span
                        className={cn(
                          'font-medium',
                          stat.is_significant ? 'text-success' : 'text-neutral-500'
                        )}
                      >
                        {stat.p_value.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-neutral-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stat.p_value !== null ? (
                      stat.is_significant ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-success/10 rounded-full">
                            <CheckCircle className="h-3.5 w-3.5 text-success" />
                            <span className="text-xs font-medium text-success">Yes</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-warning/10 rounded-full">
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                            <span className="text-xs font-medium text-warning">No</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-neutral-400 text-xs">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900">
                    {stat.best_backtest_name || '--'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interpretation Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700">Interpretation</h4>
        <div className="space-y-2">
          {statisticalSignificance.map((stat) => (
            <div
              key={`interpretation-${stat.metric}`}
              className={cn(
                'p-3 rounded-md text-sm',
                stat.is_significant
                  ? 'bg-success/5 border border-success/20'
                  : 'bg-neutral-50 border border-neutral-100'
              )}
            >
              <div className="flex items-start gap-2">
                {stat.is_significant ? (
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                )}
                <p className="text-neutral-700">{stat.interpretation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Section */}
      <div className="border-t border-neutral-100 pt-4">
        <button
          onClick={() => setMethodologyExpanded(!methodologyExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          {methodologyExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Methodology
        </button>

        {methodologyExpanded && (
          <div className="mt-3 p-4 bg-neutral-50 rounded-md text-sm text-neutral-600 space-y-2">
            <p>
              <strong>Statistical Test:</strong> Bootstrap permutation test with 1,000 iterations.
            </p>
            <p>
              <strong>Significance Level:</strong> p &lt; 0.05 (95% confidence).
            </p>
            <p>
              <strong>Method:</strong> The test compares the distribution of trade returns between
              backtests using resampling. The observed difference in means is compared against the
              null distribution generated by random permutation of the combined trade returns.
            </p>
            <p>
              <strong>Interpretation:</strong> A significant result (p &lt; 0.05) indicates that the
              difference in performance between the backtests is unlikely to be due to random chance
              alone. However, statistical significance does not guarantee future performance differences.
            </p>
            <p className="text-neutral-500 italic">
              Note: Results are based on historical trade data. Past performance is not indicative of
              future results. Consider sample size, market conditions, and other factors when interpreting
              these results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComparisonStatistics;
