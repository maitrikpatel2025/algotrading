import React from 'react';
import { cn } from '../lib/utils';
import { History, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';

function TradeHistory({ history = [], loading = false, message = null, error = null, onRetry = null }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Error state
  if (error) {
    return (
      <div className="card">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Trade History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Closed trades and transaction history</p>
            </div>
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-destructive/10 mb-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Error Loading Trade History</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-outline mt-4 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Empty state with optional message
  if (!history || history.length === 0) {
    return (
      <div className="card">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Trade History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Closed trades and transaction history</p>
            </div>
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No trade history</p>
            {message ? (
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">{message}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Your closed trades will appear here</p>
            )}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Trade History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Closed trades and transaction history</p>
            </div>
          </div>
          <span className="badge-secondary">{history.length} trades</span>
        </div>
      </div>

      {/* Table */}
      <div className="card-content pt-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">Date</th>
                <th className="table-head">Instrument</th>
                <th className="table-head">Side</th>
                <th className="table-head text-right">Amount</th>
                <th className="table-head text-right">Entry Price</th>
                <th className="table-head text-right">Exit Price</th>
                <th className="table-head text-right">P/L</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {history.map((trade) => {
                const isProfit = trade.realized_pl >= 0;
                const isBuy = trade.side === 'Buy' || trade.side === 'buy';

                return (
                  <tr key={trade.id} className="table-row">
                    <td className="table-cell text-muted-foreground text-sm">
                      {formatDate(trade.closed_at)}
                    </td>
                    <td className="table-cell font-medium">{trade.instrument}</td>
                    <td className="table-cell">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold",
                        isBuy ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      )}>
                        {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trade.side}
                      </span>
                    </td>
                    <td className="table-cell text-right tabular-nums">
                      {formatValue(Math.abs(trade.amount), 0)}
                    </td>
                    <td className="table-cell text-right tabular-nums">
                      {formatPrice(trade.entry_price)}
                    </td>
                    <td className="table-cell text-right tabular-nums">
                      {formatPrice(trade.exit_price)}
                    </td>
                    <td className={cn(
                      "table-cell text-right tabular-nums font-semibold",
                      isProfit ? "text-success" : "text-destructive"
                    )}>
                      {isProfit && '+'}{formatValue(trade.realized_pl)}
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

export default TradeHistory;
