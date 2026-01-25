import React from 'react';
import { cn } from '../../lib/utils';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * RecentTrades Component - Precision Swiss Design System
 *
 * Displays last 5 closed trades as an activity feed:
 * - Timestamp (relative, e.g., "2m ago")
 * - Instrument and side
 * - P/L result (colored)
 */
function RecentTrades({ history = [], loading = false }) {
  const MAX_DISPLAY = 5;

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const formatValue = (value, decimals = 2) => {
    if (value === undefined || value === null) return '-';
    if (typeof value !== 'number') return String(value);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-700 rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!history || history.length === 0) {
    return (
      <div className="card dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-700">
              <History className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                Recent Trades
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Activity feed
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700 mb-3">
              <History className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">No recent trades</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Your closed trades will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayTrades = history.slice(0, MAX_DISPLAY);

  return (
    <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-700">
            <History className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              Recent Trades
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Activity feed
            </p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="p-4">
        <div className="space-y-3">
          {displayTrades.map((trade) => {
            const isProfit = trade.realized_pl >= 0;
            const isBuy = trade.side === 'Buy' || trade.side === 'buy';

            return (
              <div
                key={trade.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-md transition-colors',
                  'bg-neutral-50 dark:bg-neutral-700/50',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                )}
              >
                {/* Side Icon */}
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    isBuy
                      ? 'bg-success-light dark:bg-success/20'
                      : 'bg-danger-light dark:bg-danger/20'
                  )}
                >
                  {isBuy ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger" />
                  )}
                </div>

                {/* Trade Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
                    {trade.instrument} - {trade.side}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatRelativeTime(trade.closed_at)}
                  </p>
                </div>

                {/* P/L */}
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    isProfit ? 'text-success' : 'text-danger'
                  )}
                >
                  {isProfit && '+'}${formatValue(trade.realized_pl)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RecentTrades;
