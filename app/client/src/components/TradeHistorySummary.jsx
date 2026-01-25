import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Calendar, CalendarDays, BarChart3 } from 'lucide-react';

/**
 * TradeHistorySummary Component
 *
 * Displays running P/L totals in a card format above the trade history table:
 * - Daily P/L (today's running total)
 * - Weekly P/L (this week's running total)
 * - Total P/L (for filtered period)
 *
 * Color-codes values (green for profit, red for loss)
 * Includes trade count for each period
 */
function TradeHistorySummary({ summary }) {
  const {
    daily_pl = 0,
    daily_trade_count = 0,
    weekly_pl = 0,
    weekly_trade_count = 0,
    total_pl = 0,
    total_trade_count = 0,
  } = summary || {};

  const formatValue = (value) => {
    const absValue = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    if (value > 0) return `+$${absValue}`;
    if (value < 0) return `-$${absValue}`;
    return `$${absValue}`;
  };

  const getValueColor = (value) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Daily P/L Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Today</span>
          </div>
          {getIcon(daily_pl)}
        </div>
        <div className={cn('text-2xl font-bold tabular-nums', getValueColor(daily_pl))}>
          {formatValue(daily_pl)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {daily_trade_count} {daily_trade_count === 1 ? 'trade' : 'trades'}
        </div>
      </div>

      {/* Weekly P/L Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">This Week</span>
          </div>
          {getIcon(weekly_pl)}
        </div>
        <div className={cn('text-2xl font-bold tabular-nums', getValueColor(weekly_pl))}>
          {formatValue(weekly_pl)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {weekly_trade_count} {weekly_trade_count === 1 ? 'trade' : 'trades'}
        </div>
      </div>

      {/* Total P/L Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total (Filtered)</span>
          </div>
          {getIcon(total_pl)}
        </div>
        <div className={cn('text-2xl font-bold tabular-nums', getValueColor(total_pl))}>
          {formatValue(total_pl)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {total_trade_count} {total_trade_count === 1 ? 'trade' : 'trades'}
        </div>
      </div>
    </div>
  );
}

export default TradeHistorySummary;
