import React from 'react';
import { cn } from '../../lib/utils';
import { Briefcase, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * OpenPositions Component - Precision Swiss Design System
 *
 * Displays open trades in a compact table:
 * - Instrument
 * - Side (Buy/Sell with icon)
 * - Amount
 * - Entry Price
 * - Current P/L (colored)
 * Limited to 5 rows with "View All" link to Account page
 */
function OpenPositions({ trades = [], loading = false }) {
  const MAX_DISPLAY = 5;

  const formatValue = (value, decimals = 2) => {
    if (value === undefined || value === null) return '-';
    if (typeof value !== 'number') return String(value);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPrice = (value) => {
    if (value === undefined || value === null || value === 0) return '-';
    return formatValue(value, 5);
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
              <div key={i} className="flex gap-4">
                <div className="h-8 flex-1 bg-neutral-100 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!trades || trades.length === 0) {
    return (
      <div className="card dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light dark:bg-primary/20">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                Open Positions
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Active trades
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700 mb-3">
              <Briefcase className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">No open positions</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Your active trades will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayTrades = trades.slice(0, MAX_DISPLAY);
  const hasMore = trades.length > MAX_DISPLAY;

  return (
    <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light dark:bg-primary/20">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                Open Positions
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Active trades
              </p>
            </div>
          </div>
          <span className="badge badge-primary">{trades.length} active</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Instrument
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Entry
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                P/L
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {displayTrades.map((trade) => {
              const isProfit = trade.unrealized_pl >= 0;
              const side = trade.initial_amount > 0 ? 'Buy' : 'Sell';
              const isBuy = side === 'Buy';

              return (
                <tr
                  key={trade.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                    {trade.instrument}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold',
                        isBuy
                          ? 'bg-success-light dark:bg-success/20 text-success'
                          : 'bg-danger-light dark:bg-danger/20 text-danger'
                      )}
                    >
                      {isBuy ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-900 dark:text-neutral-50">
                    {formatValue(Math.abs(trade.initial_amount), 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-500 dark:text-neutral-400">
                    {formatPrice(trade.price)}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 text-sm text-right tabular-nums font-semibold',
                      isProfit ? 'text-success' : 'text-danger'
                    )}
                  >
                    {isProfit && '+'}
                    {formatValue(trade.unrealized_pl)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View All Link */}
      {hasMore && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <Link
            to="/account"
            className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            View All Positions
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default OpenPositions;
