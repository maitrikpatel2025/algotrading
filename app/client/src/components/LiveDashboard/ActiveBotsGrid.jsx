import React from 'react';
import { cn } from '../../lib/utils';
import { Bot, Clock, Signal, Layers } from 'lucide-react';

/**
 * ActiveBotsGrid Component - Precision Swiss Design System
 *
 * Displays bots in a responsive grid layout showing:
 * - Bot name/strategy
 * - Status badge (running/stopped/error)
 * - Uptime if running
 * - Last signal time (relative)
 * - Monitored pairs count
 */
function ActiveBotsGrid({ botStatus, loading = false }) {
  const formatUptime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
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
      case 'starting':
      case 'stopping':
        return {
          label: status === 'starting' ? 'Starting' : 'Stopping',
          bgColor: 'bg-warning-light dark:bg-warning/20',
          textColor: 'text-warning',
          borderColor: 'border-l-warning',
          pulse: true,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-neutral-100 dark:bg-neutral-700 rounded-md animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = botStatus ? getStatusConfig(botStatus.status) : getStatusConfig('stopped');
  const pairsCount = botStatus?.monitored_pairs?.length || 0;

  return (
    <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light dark:bg-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              Active Bots
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Trading bot status
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!botStatus ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700 mb-3">
              <Bot className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">No active bots</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Start a trading bot from the Bot Status panel
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bot Card */}
            <div
              className={cn(
                'p-4 rounded-md border-l-4 bg-white dark:bg-neutral-700/50',
                'border border-neutral-200 dark:border-neutral-600',
                statusConfig.borderColor
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  {botStatus.active_strategy?.name || 'Trading Bot'}
                </span>
                {/* Status Badge */}
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
                          statusConfig.textColor === 'text-success'
                            ? 'bg-success'
                            : 'bg-warning'
                        )}
                      />
                      <span
                        className={cn(
                          'relative inline-flex rounded-full h-1.5 w-1.5',
                          statusConfig.textColor === 'text-success'
                            ? 'bg-success'
                            : 'bg-warning'
                        )}
                      />
                    </span>
                  )}
                  <span className={statusConfig.textColor}>{statusConfig.label}</span>
                </div>
              </div>

              {/* Bot Metrics */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                {/* Uptime */}
                <div>
                  <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Uptime</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50 tabular-nums">
                    {formatUptime(botStatus.uptime_seconds)}
                  </span>
                </div>

                {/* Last Signal */}
                <div>
                  <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 mb-1">
                    <Signal className="h-3 w-3" />
                    <span>Last Signal</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50 tabular-nums">
                    {formatRelativeTime(botStatus.last_signal_time)}
                  </span>
                </div>

                {/* Pairs */}
                <div>
                  <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500 mb-1">
                    <Layers className="h-3 w-3" />
                    <span>Pairs</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50 tabular-nums">
                    {pairsCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveBotsGrid;
