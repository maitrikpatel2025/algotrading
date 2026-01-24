import React, { useMemo, useState } from 'react';
import { cn } from '../lib/utils';
import { getColorForPnL, getDayName, formatHour, calculatePnLRange } from '../app/tradeUtils';

/**
 * DayOfWeekHeatmap Component
 *
 * Displays a heatmap grid showing P/L by day of week and hour of day.
 * Columns are days (Mon-Sun), rows are hours (0-23).
 * Cells are color-coded by P/L intensity.
 */
function DayOfWeekHeatmap({
  heatmapData = [],
  dayOfWeekData = [],
  currency = '$',
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Organize heatmap data into a 2D grid for efficient lookup
  const heatmapGrid = useMemo(() => {
    const grid = {};
    if (heatmapData && Array.isArray(heatmapData)) {
      heatmapData.forEach((item) => {
        const key = `${item.day}-${item.hour}`;
        grid[key] = item;
      });
    }
    return grid;
  }, [heatmapData]);

  // Calculate P/L range for color scaling
  const { minPnl, maxPnl } = useMemo(() => {
    return calculatePnLRange(heatmapData);
  }, [heatmapData]);

  // Find best/worst cells
  const { bestCell, worstCell } = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) {
      return { bestCell: null, worstCell: null };
    }

    const cellsWithTrades = heatmapData.filter((c) => c.trades > 0);
    if (cellsWithTrades.length === 0) {
      return { bestCell: null, worstCell: null };
    }

    const pnlValues = cellsWithTrades.map((c) => c.net_pnl);
    const maxPnlVal = Math.max(...pnlValues);
    const minPnlVal = Math.min(...pnlValues);

    const best = cellsWithTrades.find((c) => c.net_pnl === maxPnlVal);
    const worst = cellsWithTrades.find((c) => c.net_pnl === minPnlVal);

    return {
      bestCell: best ? `${best.day}-${best.hour}` : null,
      worstCell: worst ? `${worst.day}-${worst.hour}` : null,
    };
  }, [heatmapData]);

  // Format P/L value for display
  const formatPnl = (pnl) => {
    if (pnl === null || pnl === undefined) return 'N/A';
    const formatted = Math.abs(pnl).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return pnl >= 0 ? `+${currency}${formatted}` : `-${currency}${formatted}`;
  };

  // Get cell data for a specific day/hour
  const getCellData = (day, hour) => {
    const key = `${day}-${hour}`;
    return heatmapGrid[key] || { day, hour, net_pnl: 0, trades: 0 };
  };

  // Day labels (short form)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Generate hour labels (0-23)
  const hourLabels = Array.from({ length: 24 }, (_, i) => i);

  // Empty state
  if (!heatmapData || heatmapData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-neutral-500 text-sm">No heatmap data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Day of Week Summary */}
      {dayOfWeekData && dayOfWeekData.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {dayOfWeekData
            .filter((d) => d.is_best || d.is_worst)
            .map((d) => (
              <div
                key={d.day}
                className={cn(
                  'px-3 py-2 rounded-md border text-sm',
                  d.is_best && 'bg-success/5 border-success/30',
                  d.is_worst && 'bg-danger/5 border-danger/30'
                )}
              >
                <span className="font-medium text-neutral-700">
                  {d.is_best ? 'Best Day: ' : 'Worst Day: '}
                </span>
                <span className={cn('font-semibold', d.is_best ? 'text-success' : 'text-danger')}>
                  {d.day_name}
                </span>
                <span className="text-neutral-500 ml-2">({formatPnl(d.net_pnl)})</span>
              </div>
            ))}
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header Row - Day Labels */}
          <div className="flex">
            <div className="w-12 flex-shrink-0" /> {/* Spacer for hour labels */}
            {dayLabels.map((label, dayIndex) => (
              <div
                key={dayIndex}
                className="w-14 flex-shrink-0 px-1 py-1 text-center text-xs font-semibold text-neutral-600"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap Rows */}
          <div className="border border-neutral-200 rounded-md overflow-hidden">
            {hourLabels.map((hour) => (
              <div key={hour} className="flex border-b border-neutral-100 last:border-0">
                {/* Hour Label */}
                <div className="w-12 flex-shrink-0 px-2 py-1 text-xs text-neutral-500 tabular-nums flex items-center justify-end">
                  {hour.toString().padStart(2, '0')}
                </div>

                {/* Day Cells */}
                {dayLabels.map((_, dayIndex) => {
                  const cellData = getCellData(dayIndex, hour);
                  const cellKey = `${dayIndex}-${hour}`;
                  const isBest = cellKey === bestCell;
                  const isWorst = cellKey === worstCell;
                  const hasData = cellData.trades > 0;
                  const isHovered = hoveredCell === cellKey;

                  const bgColor = hasData
                    ? getColorForPnL(cellData.net_pnl, minPnl, maxPnl, 0.7)
                    : 'transparent';

                  return (
                    <div
                      key={cellKey}
                      className={cn(
                        'w-14 h-6 flex-shrink-0 relative cursor-pointer transition-all',
                        'border-r border-neutral-100 last:border-0',
                        isBest && 'ring-2 ring-success ring-inset',
                        isWorst && 'ring-2 ring-danger ring-inset',
                        isHovered && 'ring-2 ring-primary ring-inset z-10'
                      )}
                      style={{ backgroundColor: bgColor }}
                      onMouseEnter={() => setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && hasData && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                          <div className="bg-neutral-900 text-white text-xs rounded px-2 py-1.5 shadow-lg whitespace-nowrap">
                            <div className="font-medium">{getDayName(dayIndex)} {formatHour(hour)}</div>
                            <div className="mt-0.5">
                              <span className={cellData.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {formatPnl(cellData.net_pnl)}
                              </span>
                              <span className="text-neutral-400 ml-2">
                                {cellData.trades} trade{cellData.trades !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-neutral-600">
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: getColorForPnL(minPnl, minPnl, maxPnl, 0.7) }}
          />
          <span>Loss ({formatPnl(minPnl)})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-neutral-200" />
          <span>No trades</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: getColorForPnL(maxPnl, minPnl, maxPnl, 0.7) }}
          />
          <span>Profit ({formatPnl(maxPnl)})</span>
        </div>
      </div>
    </div>
  );
}

export default DayOfWeekHeatmap;
