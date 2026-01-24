import React, { useMemo } from 'react';
import { cn } from '../lib/utils';

/**
 * WinLossHistogram Component
 *
 * Displays a horizontal bar chart showing the distribution of trade P/L values.
 * Bars are colored green for winning trades (positive P/L buckets),
 * red for losing trades (negative P/L buckets).
 */
function WinLossHistogram({ data = [], currency = '$' }) {
  // Calculate max count for scaling
  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((bucket) => bucket.count));
  }, [data]);

  // Format P/L value for display
  const formatPnl = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const formatted = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return value >= 0 ? `${currency}${formatted}` : `-${currency}${formatted}`;
  };

  // Get bar width as percentage
  const getBarWidth = (count) => {
    if (count === 0 || maxCount === 0) return 0;
    return Math.max((count / maxCount) * 100, 2); // Minimum 2% for visibility
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-neutral-500 text-sm">No P/L distribution data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Chart Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          P/L Distribution
        </span>
        <span className="text-xs text-neutral-400">{data.length} buckets</span>
      </div>

      {/* Histogram Bars */}
      <div className="space-y-1">
        {data.map((bucket, index) => {
          const isWinner = bucket.is_winner;
          const barWidth = getBarWidth(bucket.count);
          const midpoint = (bucket.bucket_min + bucket.bucket_max) / 2;

          return (
            <div
              key={index}
              className="flex items-center gap-2 py-0.5 rounded hover:bg-neutral-50 transition-colors group"
            >
              {/* Range Label */}
              <div className="w-28 flex-shrink-0 text-right text-xs tabular-nums text-neutral-500">
                {formatPnl(bucket.bucket_min)} – {formatPnl(bucket.bucket_max)}
              </div>

              {/* Bar Container */}
              <div className="flex-1 flex items-center">
                <div className="w-full relative h-5 bg-neutral-100 rounded-sm">
                  {barWidth > 0 && (
                    <div
                      className={cn(
                        'absolute left-0 top-0 bottom-0 rounded-sm transition-all',
                        isWinner ? 'bg-success' : 'bg-danger'
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Count */}
              <div
                className={cn(
                  'w-12 flex-shrink-0 text-right text-xs tabular-nums font-medium',
                  isWinner ? 'text-success' : 'text-danger'
                )}
              >
                {bucket.count}
              </div>

              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-neutral-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                {bucket.count} trade{bucket.count !== 1 ? 's' : ''} ({formatPnl(midpoint)} avg)
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-success" />
          <span className="text-xs text-neutral-600">Winners</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-danger" />
          <span className="text-xs text-neutral-600">Losers</span>
        </div>
      </div>
    </div>
  );
}

export default WinLossHistogram;
