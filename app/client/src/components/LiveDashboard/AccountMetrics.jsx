import React from 'react';
import { cn } from '../../lib/utils';
import { Wallet, Scale, TrendingUp, Percent } from 'lucide-react';

/**
 * AccountMetrics Component - Precision Swiss Design System
 *
 * Displays key account metrics in a compact grid:
 * - Balance (with dollar sign)
 * - Equity (with dollar sign)
 * - Unrealized P/L (colored green if positive, red if negative)
 * - Margin Level (with percentage)
 */
function AccountMetrics({ account, loading = false }) {
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (value) => {
    if (value === undefined || value === null) return '-';
    return `${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  };

  const metrics = [
    {
      key: 'Balance',
      label: 'Balance',
      value: account?.Balance,
      format: formatCurrency,
      icon: Wallet,
      colored: false,
    },
    {
      key: 'Equity',
      label: 'Equity',
      value: account?.Equity,
      format: formatCurrency,
      icon: Scale,
      colored: false,
    },
    {
      key: 'Profit',
      label: 'Unrealized P/L',
      value: account?.Profit,
      format: formatCurrency,
      icon: TrendingUp,
      colored: true,
    },
    {
      key: 'MarginLevel',
      label: 'Margin Level',
      value: account?.MarginLevel,
      format: formatPercent,
      icon: Percent,
      colored: false,
    },
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-md bg-neutral-100 dark:bg-neutral-700 animate-pulse"
              >
                <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-600 rounded mb-2" />
                <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-600 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error/empty state
  if (!account) {
    return (
      <div className="card dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4">
          <div className="flex items-center justify-center py-6 text-neutral-500 dark:text-neutral-400">
            Unable to load account metrics
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const value = metric.value;
            const isPositive = metric.colored && typeof value === 'number' && value >= 0;
            const isNegative = metric.colored && typeof value === 'number' && value < 0;

            return (
              <div
                key={metric.key}
                className={cn(
                  'p-4 rounded-md border transition-colors',
                  'bg-neutral-50 border-neutral-200',
                  'dark:bg-neutral-700/50 dark:border-neutral-600'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md',
                      isPositive && 'bg-success-light dark:bg-success/20',
                      isNegative && 'bg-danger-light dark:bg-danger/20',
                      !metric.colored && 'bg-primary-light dark:bg-primary/20'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isPositive && 'text-success',
                        isNegative && 'text-danger',
                        !metric.colored && 'text-primary'
                      )}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {metric.label}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-lg font-semibold tabular-nums',
                    isPositive && 'text-success',
                    isNegative && 'text-danger',
                    !metric.colored && 'text-neutral-900 dark:text-neutral-50'
                  )}
                >
                  {metric.colored && typeof value === 'number' && value >= 0 && '+'}
                  {metric.format(value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AccountMetrics;
