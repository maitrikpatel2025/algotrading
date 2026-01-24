import React, { useMemo } from 'react';

/**
 * HoldingPeriodHistogram Component
 *
 * Displays a horizontal bar chart showing the distribution of trade holding periods.
 * X-axis represents duration buckets, Y-axis represents trade count.
 */
function HoldingPeriodHistogram({ data = [] }) {
  // Calculate max count for scaling
  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((bucket) => bucket.count));
  }, [data]);

  // Format duration in minutes to human-readable format
  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';

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

  // Get bar width as percentage
  const getBarWidth = (count) => {
    if (count === 0 || maxCount === 0) return 0;
    return Math.max((count / maxCount) * 100, 2); // Minimum 2% for visibility
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-neutral-500 text-sm">No holding period data available</p>
      </div>
    );
  }

  // Calculate summary stats
  const totalTrades = data.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <div className="space-y-2">
      {/* Chart Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Holding Period Distribution
        </span>
        <span className="text-xs text-neutral-400">{totalTrades} trades</span>
      </div>

      {/* Histogram Bars */}
      <div className="space-y-1">
        {data.map((bucket, index) => {
          const barWidth = getBarWidth(bucket.count);

          return (
            <div
              key={index}
              className="flex items-center gap-2 py-0.5 rounded hover:bg-neutral-50 transition-colors group"
            >
              {/* Range Label */}
              <div className="w-28 flex-shrink-0 text-right text-xs tabular-nums text-neutral-500">
                {formatDuration(bucket.bucket_min_minutes)} –{' '}
                {formatDuration(bucket.bucket_max_minutes)}
              </div>

              {/* Bar Container */}
              <div className="flex-1 flex items-center">
                <div className="w-full relative h-5 bg-neutral-100 rounded-sm">
                  {barWidth > 0 && (
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-sm transition-all bg-blue-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Count */}
              <div className="w-12 flex-shrink-0 text-right text-xs tabular-nums font-medium text-neutral-700">
                {bucket.count}
              </div>

              {/* Percentage */}
              <div className="w-12 flex-shrink-0 text-right text-xs tabular-nums text-neutral-400">
                {totalTrades > 0 ? `${Math.round((bucket.count / totalTrades) * 100)}%` : '0%'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-500">
        <span>
          Min: {formatDuration(data[0]?.bucket_min_minutes || 0)}
        </span>
        <span>
          Max: {formatDuration(data[data.length - 1]?.bucket_max_minutes || 0)}
        </span>
      </div>
    </div>
  );
}

export default HoldingPeriodHistogram;
