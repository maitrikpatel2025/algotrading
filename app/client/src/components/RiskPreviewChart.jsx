import React, { useMemo } from 'react';
import { cn } from '../lib/utils';

/**
 * RiskPreviewChart Component
 *
 * Visual preview of stop loss and take profit levels relative to entry price.
 * Simple horizontal bar chart showing risk/reward levels.
 */

function RiskPreviewChart({ riskManagement, className }) {
  const { stop_loss, take_profit, partial_closes } = riskManagement || {};

  // Calculate normalized values for display
  const chartData = useMemo(() => {
    // Use a reference price for visualization (e.g., 1.0000)
    const entryPrice = 100; // Normalized entry at center

    // Calculate SL distance
    let slDistance = 0;
    if (stop_loss?.type !== 'none' && stop_loss?.value) {
      switch (stop_loss.type) {
        case 'fixed_pips':
          slDistance = stop_loss.value;
          break;
        case 'percentage':
          slDistance = stop_loss.value * 10; // Scale for display
          break;
        case 'atr_based':
          slDistance = stop_loss.value * 15; // Approximate ATR
          break;
        case 'fixed_dollar':
          slDistance = stop_loss.value / 10; // Scale for display
          break;
        default:
          slDistance = stop_loss.value;
      }
    }

    // Calculate TP distance
    let tpDistance = 0;
    if (take_profit?.type !== 'none' && take_profit?.value) {
      switch (take_profit.type) {
        case 'fixed_pips':
          tpDistance = take_profit.value;
          break;
        case 'percentage':
          tpDistance = take_profit.value * 10; // Scale for display
          break;
        case 'atr_based':
          tpDistance = take_profit.value * 15; // Approximate ATR
          break;
        case 'risk_reward':
          tpDistance = slDistance * take_profit.value; // Based on SL
          break;
        case 'fixed_dollar':
          tpDistance = take_profit.value / 10; // Scale for display
          break;
        default:
          tpDistance = take_profit.value;
      }
    }

    // Calculate risk:reward ratio
    const riskRewardRatio = slDistance > 0 && tpDistance > 0
      ? (tpDistance / slDistance).toFixed(2)
      : null;

    // Partial close levels
    const partialLevels = [];
    if (partial_closes?.enabled && partial_closes?.levels) {
      partial_closes.levels.forEach((level, i) => {
        if (level.target_pips > 0) {
          partialLevels.push({
            pips: level.target_pips,
            percentage: level.close_percentage,
            position: (level.target_pips / Math.max(tpDistance, 50)) * 100
          });
        }
      });
    }

    return {
      entryPrice,
      slDistance,
      tpDistance,
      riskRewardRatio,
      partialLevels,
      maxDistance: Math.max(slDistance, tpDistance, 50) // Min 50 for display
    };
  }, [stop_loss, take_profit, partial_closes]);

  // Calculate positions as percentages
  const slPosition = chartData.slDistance > 0
    ? (chartData.slDistance / chartData.maxDistance) * 40
    : 0;
  const tpPosition = chartData.tpDistance > 0
    ? (chartData.tpDistance / chartData.maxDistance) * 40
    : 0;

  return (
    <div className={cn("p-4 bg-neutral-50 rounded-md", className)}>
      <h4 className="text-sm font-medium text-neutral-900 mb-4">Risk Preview</h4>

      {/* Visual Chart */}
      <div className="relative h-24 bg-white rounded border border-neutral-200 overflow-hidden">
        {/* Center line (Entry) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-400 z-10">
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neutral-400 text-white text-xs rounded">
            Entry
          </div>
        </div>

        {/* Stop Loss Zone */}
        {slPosition > 0 && (
          <div
            className="absolute top-4 bottom-4 bg-danger/20 border-l-2 border-danger"
            style={{
              right: '50%',
              width: `${slPosition}%`
            }}
          >
            <div className="absolute right-full top-1/2 -translate-y-1/2 pr-2 text-xs text-danger font-medium whitespace-nowrap">
              SL: {chartData.slDistance.toFixed(1)} {stop_loss?.type === 'percentage' ? '%' : 'pips'}
            </div>
          </div>
        )}

        {/* Take Profit Zone */}
        {tpPosition > 0 && (
          <div
            className="absolute top-4 bottom-4 bg-success/20 border-r-2 border-success"
            style={{
              left: '50%',
              width: `${tpPosition}%`
            }}
          >
            <div className="absolute left-full top-1/2 -translate-y-1/2 pl-2 text-xs text-success font-medium whitespace-nowrap">
              TP: {chartData.tpDistance.toFixed(1)} {take_profit?.type === 'risk_reward' ? `(1:${take_profit.value})` : take_profit?.type === 'percentage' ? '%' : 'pips'}
            </div>
          </div>
        )}

        {/* Partial Close Markers */}
        {chartData.partialLevels.map((level, i) => (
          <div
            key={i}
            className="absolute top-4 bottom-4 w-0.5 bg-primary z-5"
            style={{
              left: `calc(50% + ${(level.pips / chartData.maxDistance) * 40}%)`
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-primary whitespace-nowrap">
              {level.percentage}%
            </div>
          </div>
        ))}

        {/* No Configuration Message */}
        {!slPosition && !tpPosition && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
            Configure SL/TP to see preview
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-neutral-500">Stop Loss</div>
          <div className={cn(
            "text-sm font-medium",
            stop_loss?.type !== 'none' ? "text-danger" : "text-neutral-400"
          )}>
            {stop_loss?.type !== 'none' && stop_loss?.value
              ? `${stop_loss.value} ${stop_loss.type === 'percentage' ? '%' : 'pips'}`
              : 'None'
            }
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Risk:Reward</div>
          <div className={cn(
            "text-sm font-medium",
            chartData.riskRewardRatio ? "text-neutral-900" : "text-neutral-400"
          )}>
            {chartData.riskRewardRatio ? `1:${chartData.riskRewardRatio}` : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Take Profit</div>
          <div className={cn(
            "text-sm font-medium",
            take_profit?.type !== 'none' ? "text-success" : "text-neutral-400"
          )}>
            {take_profit?.type !== 'none' && take_profit?.value
              ? take_profit.type === 'risk_reward'
                ? `1:${take_profit.value}`
                : `${take_profit.value} ${take_profit.type === 'percentage' ? '%' : 'pips'}`
              : 'None'
            }
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      {chartData.riskRewardRatio && (
        <div className={cn(
          "mt-3 p-2 rounded text-xs text-center",
          parseFloat(chartData.riskRewardRatio) >= 2
            ? "bg-success/10 text-success"
            : parseFloat(chartData.riskRewardRatio) >= 1
            ? "bg-warning/10 text-warning"
            : "bg-danger/10 text-danger"
        )}>
          {parseFloat(chartData.riskRewardRatio) >= 2
            ? 'Good risk:reward ratio'
            : parseFloat(chartData.riskRewardRatio) >= 1
            ? 'Moderate risk:reward ratio'
            : 'Poor risk:reward ratio - consider adjusting'
          }
        </div>
      )}
    </div>
  );
}

export default RiskPreviewChart;
