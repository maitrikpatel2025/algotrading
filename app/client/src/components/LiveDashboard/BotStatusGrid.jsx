import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Bot, ArrowUp, ArrowDown } from 'lucide-react';
import BotCard from './BotCard';

/**
 * BotStatusGrid Component - Precision Swiss Design System
 *
 * Displays all trading bots in a responsive grid layout:
 * - Header with title and bot count
 * - Sort controls for Name, Status, P/L, Last Activity
 * - Sort direction toggle
 * - Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
 * - Empty and loading states
 */
function BotStatusGrid({ botsStatus, loading = false }) {
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedBotId, setExpandedBotId] = useState(null);

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'pnl', label: 'P/L' },
    { value: 'activity', label: 'Last Activity' },
  ];

  // Sort bots based on current sort settings
  const sortedBots = useMemo(() => {
    // Status priority for sorting
    const statusPriority = {
      running: 1,
      paused: 2,
      stopped: 3,
      error: 4,
    };
    if (!botsStatus?.bots?.length) return [];

    const bots = [...botsStatus.bots];

    bots.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'status':
          comparison =
            (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
          break;
        case 'pnl':
          const pnlA = a.current_pnl ?? -Infinity;
          const pnlB = b.current_pnl ?? -Infinity;
          comparison = pnlB - pnlA; // Default descending for P/L
          break;
        case 'activity':
          const dateA = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          const dateB = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          comparison = dateB - dateA; // Default descending for activity
          break;
        default:
          comparison = 0;
      }

      // Apply sort direction
      if (sortDirection === 'desc') {
        // For P/L and Activity, we already sorted descending by default
        // So we flip the comparison for other cases when desc
        if (sortBy !== 'pnl' && sortBy !== 'activity') {
          comparison = -comparison;
        }
      } else {
        // For P/L and Activity, we flip when asc
        if (sortBy === 'pnl' || sortBy === 'activity') {
          comparison = -comparison;
        }
      }

      return comparison;
    });

    return bots;
  }, [botsStatus?.bots, sortBy, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleCardToggle = (botId) => {
    setExpandedBotId((prev) => (prev === botId ? null : botId));
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mt-1" />
              </div>
            </div>
            <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-neutral-100 dark:bg-neutral-700 rounded-md animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const botCount = botsStatus?.count || 0;

  return (
    <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light dark:bg-primary/20">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                Bot Status Grid
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {botCount} {botCount === 1 ? 'bot' : 'bots'}
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm border',
                'bg-white dark:bg-neutral-700',
                'border-neutral-200 dark:border-neutral-600',
                'text-neutral-900 dark:text-neutral-50',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={toggleSortDirection}
              className={cn(
                'p-1.5 rounded-md border transition-colors',
                'bg-white dark:bg-neutral-700',
                'border-neutral-200 dark:border-neutral-600',
                'hover:bg-neutral-50 dark:hover:bg-neutral-600',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortDirection === 'asc' ? (
                <ArrowUp className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              ) : (
                <ArrowDown className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {botCount === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700 mb-3">
              <Bot className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">No bots configured</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Configure trading bots to see them here
            </p>
          </div>
        ) : (
          // Bot grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                expanded={expandedBotId === bot.id}
                onToggle={() => handleCardToggle(bot.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BotStatusGrid;
