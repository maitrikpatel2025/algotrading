import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';

/**
 * BotCard Component - Precision Swiss Design System
 *
 * Displays individual bot information in a card format:
 * - Bot name and status badge with color coding
 * - Currency pair, Current P/L, Open position
 * - Last activity timestamp
 * - Expand/collapse functionality for detailed view
 */
function BotCard({ bot, expanded: controlledExpanded, onToggle }) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Use controlled or uncontrolled state
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;
  const toggleExpand = isControlled
    ? onToggle
    : () => setInternalExpanded((prev) => !prev);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '--';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return {
          label: 'Running',
          bgColor: 'bg-success-light dark:bg-success/20',
          textColor: 'text-success',
          borderColor: 'border-l-success',
          pulse: true,
        };
      case 'paused':
        return {
          label: 'Paused',
          bgColor: 'bg-warning-light dark:bg-warning/20',
          textColor: 'text-warning',
          borderColor: 'border-l-warning',
          pulse: false,
        };
      case 'error':
        return {
          label: 'Error',
          bgColor: 'bg-danger-light dark:bg-danger/20',
          textColor: 'text-danger',
          borderColor: 'border-l-danger',
          pulse: false,
        };
      case 'stopped':
      default:
        return {
          label: 'Stopped',
          bgColor: 'bg-neutral-100 dark:bg-neutral-700',
          textColor: 'text-neutral-500 dark:text-neutral-400',
          borderColor: 'border-l-neutral-300 dark:border-l-neutral-600',
          pulse: false,
        };
    }
  };

  const statusConfig = getStatusConfig(bot?.status);
  const pnl = bot?.current_pnl;
  const isPositive = typeof pnl === 'number' && pnl >= 0;
  const isNegative = typeof pnl === 'number' && pnl < 0;

  if (!bot) return null;

  return (
    <div
      className={cn(
        'rounded-md border-l-4 bg-white dark:bg-neutral-700/50',
        'border border-neutral-200 dark:border-neutral-600',
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-500',
        statusConfig.borderColor
      )}
      onClick={toggleExpand}
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Header: Name and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-light dark:bg-primary/20">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate max-w-[120px]">
              {bot.name}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                statusConfig.bgColor
              )}
            >
              {statusConfig.pulse && (
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className={cn(
                      'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                      'bg-success'
                    )}
                  />
                  <span
                    className={cn(
                      'relative inline-flex rounded-full h-1.5 w-1.5',
                      'bg-success'
                    )}
                  />
                </span>
              )}
              <span className={statusConfig.textColor}>{statusConfig.label}</span>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Currency Pair */}
          <div>
            <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 mb-1">
              <Activity className="h-3 w-3" />
              <span>Pair</span>
            </div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
              {bot.currency_pair || '--'}
            </span>
          </div>

          {/* Current P/L */}
          <div>
            <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 mb-1">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3 text-danger" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>P/L</span>
            </div>
            <span
              className={cn(
                'font-semibold tabular-nums',
                isPositive && 'text-success',
                isNegative && 'text-danger',
                !isPositive && !isNegative && 'text-neutral-900 dark:text-neutral-50'
              )}
            >
              {isPositive && '+'}
              {formatCurrency(pnl)}
            </span>
          </div>

          {/* Open Position */}
          <div>
            <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 mb-1">
              <span>Position</span>
            </div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
              {bot.open_position ? (
                <span
                  className={cn(
                    bot.open_position.side === 'long' ? 'text-success' : 'text-danger'
                  )}
                >
                  {bot.open_position.side?.toUpperCase()} {bot.open_position.amount?.toLocaleString()}
                </span>
              ) : (
                <span className="text-neutral-400">None</span>
              )}
            </span>
          </div>

          {/* Last Activity */}
          <div>
            <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 mb-1">
              <Clock className="h-3 w-3" />
              <span>Activity</span>
            </div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-50 tabular-nums">
              {formatRelativeTime(bot.last_activity)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-600">
          <div className="space-y-2 text-xs">
            {/* Strategy Name */}
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Strategy</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-50">
                {bot.strategy_name || 'Not configured'}
              </span>
            </div>

            {/* Detailed Position Info */}
            {bot.open_position && (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Position Side</span>
                  <span
                    className={cn(
                      'font-medium',
                      bot.open_position.side === 'long' ? 'text-success' : 'text-danger'
                    )}
                  >
                    {bot.open_position.side?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Position Size</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {bot.open_position.amount?.toLocaleString()} units
                  </span>
                </div>
                {bot.open_position.entry_price && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Entry Price</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50 tabular-nums">
                      {bot.open_position.entry_price}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Error Message */}
            {bot.status === 'error' && bot.error_message && (
              <div className="mt-2 p-2 rounded-md bg-danger-light dark:bg-danger/20">
                <div className="flex items-center gap-1.5 text-danger">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="mt-1 text-danger text-xs">{bot.error_message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BotCard;
