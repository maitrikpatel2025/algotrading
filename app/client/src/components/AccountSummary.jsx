import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import { cn } from '../lib/utils';
import { Wallet, TrendingUp, Scale, Percent, Layers } from 'lucide-react';

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

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="skeleton h-6 w-40" />
          </div>
        </div>
        <div className="card-content pt-6 space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-5 w-24" />
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
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="card-title">Account Summary</h3>
          </div>
        </div>
        <div className="card-content pt-6">
          <p className="text-muted-foreground text-center py-8">
            Unable to load account data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="card-title">Account Summary</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time account metrics</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="card-content pt-6">
        <div className="space-y-4">
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
                  index !== DATA_KEYS.length - 1 && "border-b border-border/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    isPositive && "bg-success/10",
                    isNegative && "bg-destructive/10",
                    !isProfit && "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      isPositive && "text-success",
                      isNegative && "text-destructive",
                      !isProfit && "text-muted-foreground"
                    )} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.name}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  isPositive && "text-success",
                  isNegative && "text-destructive",
                  !isProfit && "text-foreground"
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
