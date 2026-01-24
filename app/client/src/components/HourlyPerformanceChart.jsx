import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import { formatHour, calculatePnLRange } from '../app/tradeUtils';

/**
 * HourlyPerformanceChart Component
 *
 * Displays a horizontal bar chart showing net P/L for each hour (0-23).
 * Bars are colored green for positive P/L, red for negative.
 * Best and worst hours are highlighted with distinct styling.
 */
function HourlyPerformanceChart({ data = [], currency = '$' }) {
  // Calculate P/L range for bar scaling
  const { minPnl, maxPnl } = useMemo(() => {
    return calculatePnLRange(data);
  }, [data]);

  // Calculate the max absolute value for scaling
  const maxAbsolute = useMemo(() => {
    return Math.max(Math.abs(minPnl), Math.abs(maxPnl), 1);
  }, [minPnl, maxPnl]);

  // Format P/L value for display
  const formatPnl = (pnl) => {
    if (pnl === null || pnl === undefined) return 'N/A';
    const formatted = Math.abs(pnl).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return pnl >= 0 ? `+${currency}${formatted}` : `-${currency}${formatted}`;
  };

  // Get bar width as percentage (max 100%)
  const getBarWidth = (pnl) => {
    if (pnl === 0 || maxAbsolute === 0) return 0;
    return Math.min(Math.abs(pnl) / maxAbsolute * 100, 100);
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-neutral-500 text-sm">No hourly data available</p>
      </div>
    );
  }

  // Find best/worst hours
  const hoursWithTrades = data.filter((h) => h.trades > 0);
  const bestHour = hoursWithTrades.find((h) => h.is_best);
  const worstHour = hoursWithTrades.find((h) => h.is_worst);

  return (
    <div className="space-y-4">
      {/* Best/Worst Hour Summary */}
      <div className="flex flex-wrap gap-3 mb-4">
        {bestHour && (
          <div className="px-3 py-2 rounded-md border bg-success/5 border-success/30 text-sm">
            <span className="font-medium text-neutral-700">Best Hour: </span>
            <span className="font-semibold text-success">{formatHour(bestHour.hour)}</span>
            <span className="text-neutral-500 ml-2">({formatPnl(bestHour.net_pnl)})</span>
          </div>
        )}
        {worstHour && (
          <div className="px-3 py-2 rounded-md border bg-danger/5 border-danger/30 text-sm">
            <span className="font-medium text-neutral-700">Worst Hour: </span>
            <span className="font-semibold text-danger">{formatHour(worstHour.hour)}</span>
            <span className="text-neutral-500 ml-2">({formatPnl(worstHour.net_pnl)})</span>
          </div>
        )}
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-1">
        {data.map((hourData) => {
          const barWidth = getBarWidth(hourData.net_pnl);
          const isPositive = hourData.net_pnl >= 0;
          const hasTrades = hourData.trades > 0;
          const isBest = hourData.is_best;
          const isWorst = hourData.is_worst;

          return (
            <div
              key={hourData.hour}
              className={cn(
                'flex items-center gap-2 py-0.5 rounded transition-colors',
                isBest && 'bg-success/5',
                isWorst && 'bg-danger/5'
              )}
            >
              {/* Hour Label */}
              <div className="w-12 flex-shrink-0 text-right text-xs tabular-nums text-neutral-500">
                {formatHour(hourData.hour)}
              </div>

              {/* Bar Container */}
              <div className="flex-1 flex items-center">
                {/* Center line and bars */}
                <div className="w-full relative h-5">
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-300" />

                  {/* Bar */}
                  {hasTrades && barWidth > 0 && (
                    <div
                      className={cn(
                        'absolute top-0.5 bottom-0.5 rounded-sm transition-all',
                        isPositive
                          ? 'left-1/2 bg-success'
                          : 'right-1/2 bg-danger',
                        isBest && 'ring-2 ring-success ring-offset-1',
                        isWorst && 'ring-2 ring-danger ring-offset-1'
                      )}
                      style={{
                        width: `${barWidth / 2}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* P/L Value */}
              <div
                className={cn(
                  'w-24 flex-shrink-0 text-right text-xs tabular-nums font-medium',
                  hasTrades && isPositive && 'text-success',
                  hasTrades && !isPositive && 'text-danger',
                  !hasTrades && 'text-neutral-400'
                )}
              >
                {hasTrades ? formatPnl(hourData.net_pnl) : '-'}
              </div>

              {/* Trade Count */}
              <div className="w-16 flex-shrink-0 text-right text-xs text-neutral-400">
                {hasTrades ? `${hourData.trades} trade${hourData.trades !== 1 ? 's' : ''}` : ''}
              </div>

              {/* Best/Worst Badge */}
              <div className="w-12 flex-shrink-0">
                {isBest && (
                  <span className="text-[9px] px-1 py-0.5 bg-success/10 text-success rounded font-semibold">
                    BEST
                  </span>
                )}
                {isWorst && (
                  <span className="text-[9px] px-1 py-0.5 bg-danger/10 text-danger rounded font-semibold">
                    WORST
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale Legend */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
        <span>{formatPnl(-maxAbsolute)}</span>
        <span>0</span>
        <span>{formatPnl(maxAbsolute)}</span>
      </div>
    </div>
  );
}

export default HourlyPerformanceChart;
