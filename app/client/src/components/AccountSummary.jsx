import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import { cn } from '../lib/utils';
import { Wallet, TrendingUp, Scale, Percent, Layers } from 'lucide-react';

/**
 * AccountSummary Component - Precision Swiss Design System
 *
 * Clean card with proper KPI styling.
 * Tabular numbers for financial data.
 * No gradients, clean borders.
 */

const DATA_KEYS = [
  { name: "Account Number", key: "Id", fixed: -1, icon: Wallet },
  { name: "Balance", key: "Balance", fixed: 2, prefix: "$", icon: Wallet },
  { name: "Equity", key: "Equity", fixed: 2, prefix: "$", icon: Scale },
  { name: "Profit", key: "Profit", fixed: 2, prefix: "$", colored: true, icon: TrendingUp },
  { name: "Margin", key: "Margin", fixed: 2, prefix: "$", icon: Layers },
  { name: "Margin Level", key: "MarginLevel", fixed: 2, suffix: "%", icon: Percent },
  { name: "Leverage", key: "Leverage", fixed: -1, prefix: "1:", icon: Scale },
];

function AccountSummary() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const data = await endPoints.account();
      setAccount(data);
    } catch (error) {
      console.error('Error loading account:', error);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, fixed, prefix = '', suffix = '') => {
    if (value === undefined || value === null) return '-';
    let formatted = fixed > 0 && typeof value === 'number'
      ? value.toLocaleString('en-US', { minimumFractionDigits: fixed, maximumFractionDigits: fixed })
      : String(value);
    return `${prefix}${formatted}${suffix}`;
  };

  // Loading skeleton - Precision Swiss Design
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-neutral-200 animate-pulse" />
            <div className="h-5 w-40 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No data state
  if (!account) {
    return (
      <div className="card">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
              <Wallet className="h-5 w-5 text-neutral-400" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Account Summary</h3>
          </div>
        </div>
        <div className="p-4">
          <p className="text-neutral-500 text-center py-8">
            Unable to load account data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Header - Precision Swiss Design */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Account Summary</h3>
            <p className="text-xs text-neutral-500">Real-time account metrics</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-3">
          {DATA_KEYS.map((item, index) => {
            const value = account[item.key];
            const isProfit = item.colored && typeof value === 'number';
            const isPositive = isProfit && value >= 0;
            const isNegative = isProfit && value < 0;
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-center justify-between py-2 transition-colors",
                  index !== DATA_KEYS.length - 1 && "border-b border-neutral-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    isPositive && "bg-success-light",
                    isNegative && "bg-danger-light",
                    !isProfit && "bg-neutral-100"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      isPositive && "text-success",
                      isNegative && "text-danger",
                      !isProfit && "text-neutral-400"
                    )} />
                  </div>
                  <span className="text-sm font-medium text-neutral-500">
                    {item.name}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  isPositive && "pnl-positive",
                  isNegative && "pnl-negative",
                  !isProfit && "text-neutral-900"
                )}>
                  {isProfit && value >= 0 && "+"}
                  {formatValue(value, item.fixed, item.prefix, item.suffix)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AccountSummary;
