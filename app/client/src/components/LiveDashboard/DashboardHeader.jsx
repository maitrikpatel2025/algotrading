import React from 'react';
import { cn } from '../../lib/utils';
import { RefreshCw, Sun, Moon, Loader2 } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';

/**
 * DashboardHeader Component - Precision Swiss Design System
 *
 * Displays dashboard header with:
 * - Page title and subtitle
 * - Last updated timestamp
 * - Manual refresh button with loading state
 * - Dark mode toggle button
 * - Connection status indicator
 */
function DashboardHeader({
  lastUpdated,
  isRefreshing,
  connectionStatus,
  onRefresh,
  isDark,
  onToggleDarkMode,
}) {
  const formatLastUpdated = (date) => {
    if (!date) return '--';
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffMins > 0) return `Updated ${diffMins}m ago`;
    if (diffSecs > 0) return `Updated ${diffSecs}s ago`;
    return 'Just updated';
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Title Section */}
      <div>
        <h1 className="heading-1 dark:text-neutral-50">Live Trading Dashboard</h1>
        <p className="body-sm mt-1 dark:text-neutral-400">Real-time monitoring</p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Last Updated */}
        <div className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
          {formatLastUpdated(lastUpdated)}
        </div>

        {/* Connection Status */}
        <ConnectionStatus status={connectionStatus} />

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'border border-neutral-200 dark:border-neutral-700',
            'bg-white dark:bg-neutral-800',
            'text-neutral-700 dark:text-neutral-300',
            'hover:bg-neutral-50 dark:hover:bg-neutral-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Refresh dashboard"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={cn(
            'flex items-center justify-center p-2 rounded-md transition-colors',
            'border border-neutral-200 dark:border-neutral-700',
            'bg-white dark:bg-neutral-800',
            'text-neutral-700 dark:text-neutral-300',
            'hover:bg-neutral-50 dark:hover:bg-neutral-700'
          )}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;
