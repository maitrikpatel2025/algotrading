import React from 'react';
import { cn } from '../lib/utils';
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

function OpenTrades({ trades = [], loading = false }) {
  const formatValue = (value, decimals = 2) => {
    if (value === undefined || value === null) return '-';
    if (typeof value !== 'number') return String(value);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatPrice = (value) => {
    if (value === undefined || value === null || value === 0) return '-';
    return formatValue(value, 5);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="skeleton h-6 w-32" />
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-8 flex-1" />
                <div className="skeleton h-8 flex-1" />
                <div className="skeleton h-8 flex-1" />
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
      <div className="card">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Open Trades</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Currently active positions</p>
            </div>
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No open trades</p>
            <p className="text-xs text-muted-foreground mt-1">Your active positions will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Open Trades</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Currently active positions</p>
            </div>
          </div>
          <span className="badge-default">{trades.length} active</span>
        </div>
      </div>

      {/* Table */}
      <div className="card-content pt-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">Instrument</th>
                <th className="table-head">Side</th>
                <th className="table-head text-right">Amount</th>
                <th className="table-head text-right">Entry Price</th>
                <th className="table-head text-right">P/L</th>
                <th className="table-head text-right">Margin</th>
                <th className="table-head text-right">SL</th>
                <th className="table-head text-right">TP</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {trades.map((trade) => {
                const isProfit = trade.unrealized_pl >= 0;
                const side = trade.initial_amount > 0 ? 'Buy' : 'Sell';
                const isBuy = side === 'Buy';

                return (
                  <tr key={trade.id} className="table-row">
                    <td className="table-cell font-medium">{trade.instrument}</td>
                    <td className="table-cell">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold",
                        isBuy ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      )}>
                        {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {side}
                      </span>
                    </td>
                    <td className="table-cell text-right tabular-nums">
                      {formatValue(Math.abs(trade.initial_amount), 0)}
                    </td>
                    <td className="table-cell text-right tabular-nums">
                      {formatPrice(trade.price)}
                    </td>
                    <td className={cn(
                      "table-cell text-right tabular-nums font-semibold",
                      isProfit ? "text-success" : "text-destructive"
                    )}>
                      {isProfit && '+'}{formatValue(trade.unrealized_pl)}
                    </td>
                    <td className="table-cell text-right tabular-nums">
                      {formatValue(trade.margin_used)}
                    </td>
                    <td className="table-cell text-right tabular-nums text-muted-foreground">
                      {formatPrice(trade.stop_loss)}
                    </td>
                    <td className="table-cell text-right tabular-nums text-muted-foreground">
                      {formatPrice(trade.take_profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OpenTrades;
