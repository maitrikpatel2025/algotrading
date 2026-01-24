import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { METRIC_DEFINITIONS } from '../app/metricDefinitions';

/**
 * ComparisonMetricsTable Component
 *
 * Displays a side-by-side comparison of metrics across multiple backtests.
 * Features:
 * - Metric rows with formatted values for each backtest
 * - Best value highlighting (green background)
 * - Tooltips with metric descriptions
 * - Responsive layout
 */

// Metrics to display in the comparison table
const DISPLAY_METRICS = [
  'total_net_profit',
  'return_on_investment',
  'final_balance',
  'total_trades',
  'win_rate',
  'profit_factor',
  'average_win',
  'average_loss',
  'win_loss_ratio',
  'largest_win',
  'largest_loss',
  'expectancy',
  'max_drawdown_dollars',
  'max_drawdown_percent',
  'recovery_factor',
  'sharpe_ratio',
  'sortino_ratio',
  'average_trade_duration_minutes',
];

function ComparisonMetricsTable({
  backtests = [],
  metricsComparison = {},
  bestValues = {},
  colors = [],
}) {
  if (backtests.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500">
        No backtests to compare
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-neutral-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider sticky left-0 bg-neutral-50 z-10">
              Metric
            </th>
            {backtests.map((backtest, index) => (
              <th
                key={backtest.id}
                className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider min-w-[120px]"
              >
                <div className="flex items-center justify-end gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index]?.line }}
                  />
                  <span className="truncate max-w-[100px]" title={backtest.name}>
                    {backtest.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {DISPLAY_METRICS.map((metricKey) => {
            const metricDef = METRIC_DEFINITIONS[metricKey];
            const metricValues = metricsComparison[metricKey] || [];
            const bestIndex = bestValues[metricKey];

            if (!metricDef) return null;

            return (
              <tr key={metricKey} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-neutral-900 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-1.5">
                    <span>{metricDef.label}</span>
                    {metricDef.tooltip && (
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
                {backtests.map((backtest, index) => {
                  const metricValue = metricValues.find(
                    (mv) => mv.backtest_id === backtest.id
                  );
                  const isBest = bestIndex === index;
                  const value = metricValue?.value;
                  const formattedValue = metricValue?.formatted_value || '--';

                  // Determine text color based on metric type and value
                  let textColorClass = 'text-neutral-900';
                  if (value !== null && value !== undefined) {
                    if (
                      [
                        'total_net_profit',
                        'return_on_investment',
                        'expectancy',
                        'strategy_vs_benchmark',
                      ].includes(metricKey)
                    ) {
                      textColorClass = value >= 0 ? 'text-success' : 'text-danger';
                    } else if (metricKey === 'win_rate') {
                      if (value >= 50) textColorClass = 'text-success';
                      else if (value < 40) textColorClass = 'text-danger';
                    }
                  }

                  return (
                    <td
                      key={`${metricKey}-${backtest.id}`}
                      className={cn(
                        'px-4 py-3 text-sm text-right tabular-nums',
                        isBest && 'bg-success/10 font-semibold',
                        textColorClass
                      )}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ComparisonMetricsTable;
