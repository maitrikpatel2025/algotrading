import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Bot, ArrowUp, ArrowDown, X } from 'lucide-react';
import BotCard from './BotCard';
import { EmergencyStopButton, PreStartChecklist, PauseDurationDialog, StopOptionsDialog } from '../BotControls';
import endPoints from '../../app/api';

/**
 * Toast notification component for BotStatusGrid
 */
function Toast({ message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-md shadow-elevated animate-fade-in border-l-4",
      type === 'success' ? 'border-l-success' : 'border-l-danger'
    )}>
      <span className={cn("text-sm font-medium", type === 'success' ? 'text-success' : 'text-danger')}>
        {message}
      </span>
      <button
        onClick={onClose}
        className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * BotStatusGrid Component - Precision Swiss Design System
 *
 * Displays all trading bots in a responsive grid layout:
 * - Header with title, bot count, and Emergency Stop button
 * - Sort controls for Name, Status, P/L, Last Activity
 * - Sort direction toggle
 * - Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
 * - Empty and loading states
 * - Individual bot controls with dialogs
 */
function BotStatusGrid({ botsStatus, loading = false, onRefresh }) {
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedBotId, setExpandedBotId] = useState(null);

  // Loading states for individual bot operations
  const [loadingBotId, setLoadingBotId] = useState(null);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);

  // Dialog states
  const [selectedBot, setSelectedBot] = useState(null);
  const [showPreStartChecklist, setShowPreStartChecklist] = useState(false);
  const [showPauseDurationDialog, setShowPauseDurationDialog] = useState(false);
  const [showStopOptionsDialog, setShowStopOptionsDialog] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

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

  // Bot control handlers
  const handleStartClick = (bot) => {
    setSelectedBot(bot);
    setShowPreStartChecklist(true);
  };

  const handleConfirmStart = async () => {
    setShowPreStartChecklist(false);
    if (!selectedBot) return;

    setLoadingBotId(selectedBot.id);
    try {
      await endPoints.botStart({ strategy: 'Bollinger Bands Strategy' });
      showToast(`${selectedBot.name} started successfully`, 'success');
      onRefresh?.();
    } catch (err) {
      console.error('Error starting bot:', err);
      showToast(`Failed to start ${selectedBot.name}: ${err.message}`, 'error');
    } finally {
      setLoadingBotId(null);
      setSelectedBot(null);
    }
  };

  const handlePauseClick = (bot) => {
    setSelectedBot(bot);
    setShowPauseDurationDialog(true);
  };

  const handleConfirmPause = async (durationMinutes) => {
    setShowPauseDurationDialog(false);
    if (!selectedBot) return;

    setLoadingBotId(selectedBot.id);
    try {
      await endPoints.botPause(durationMinutes);
      const durationText = durationMinutes ? `for ${durationMinutes} minutes` : 'indefinitely';
      showToast(`${selectedBot.name} paused ${durationText}`, 'success');
      onRefresh?.();
    } catch (err) {
      console.error('Error pausing bot:', err);
      showToast(`Failed to pause ${selectedBot.name}: ${err.message}`, 'error');
    } finally {
      setLoadingBotId(null);
      setSelectedBot(null);
    }
  };

  const handleResumeClick = async (bot) => {
    setLoadingBotId(bot.id);
    try {
      await endPoints.botResume();
      showToast(`${bot.name} resumed successfully`, 'success');
      onRefresh?.();
    } catch (err) {
      console.error('Error resuming bot:', err);
      showToast(`Failed to resume ${bot.name}: ${err.message}`, 'error');
    } finally {
      setLoadingBotId(null);
    }
  };

  const handleStopClick = (bot) => {
    setSelectedBot(bot);
    setShowStopOptionsDialog(true);
  };

  const handleConfirmStop = async (stopOption) => {
    setShowStopOptionsDialog(false);
    if (!selectedBot) return;

    setLoadingBotId(selectedBot.id);
    try {
      const result = await endPoints.botStopWithOptions(stopOption);
      let message = `${selectedBot.name} stopped successfully`;
      if (result.positions_closed > 0) {
        const pnlText = result.final_pnl != null
          ? ` (P/L: ${result.final_pnl >= 0 ? '+' : ''}$${result.final_pnl.toFixed(2)})`
          : '';
        message = `${selectedBot.name} stopped, ${result.positions_closed} positions closed${pnlText}`;
      }
      showToast(message, 'success');
      onRefresh?.();
    } catch (err) {
      console.error('Error stopping bot:', err);
      showToast(`Failed to stop ${selectedBot.name}: ${err.message}`, 'error');
    } finally {
      setLoadingBotId(null);
      setSelectedBot(null);
    }
  };

  // Emergency stop handler
  const handleEmergencyStop = async () => {
    setIsEmergencyLoading(true);
    try {
      const result = await endPoints.botEmergencyStop();
      onRefresh?.();
      return result;
    } catch (err) {
      console.error('Emergency stop error:', err);
      throw err;
    } finally {
      setIsEmergencyLoading(false);
    }
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
      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Dialogs */}
      <PreStartChecklist
        isOpen={showPreStartChecklist}
        onClose={() => { setShowPreStartChecklist(false); setSelectedBot(null); }}
        onConfirmStart={handleConfirmStart}
        botName={selectedBot?.name || 'Bot'}
      />

      <PauseDurationDialog
        isOpen={showPauseDurationDialog}
        onClose={() => { setShowPauseDurationDialog(false); setSelectedBot(null); }}
        onConfirmPause={handleConfirmPause}
        isLoading={loadingBotId === selectedBot?.id}
      />

      <StopOptionsDialog
        isOpen={showStopOptionsDialog}
        onClose={() => { setShowStopOptionsDialog(false); setSelectedBot(null); }}
        onConfirmStop={handleConfirmStop}
        isLoading={loadingBotId === selectedBot?.id}
      />

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

          {/* Controls: Sort and Emergency Stop */}
          <div className="flex items-center gap-3">
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

            {/* Emergency Stop Button */}
            <EmergencyStopButton
              onEmergencyStop={handleEmergencyStop}
              isLoading={isEmergencyLoading}
            />
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
                onStartClick={() => handleStartClick(bot)}
                onPauseClick={() => handlePauseClick(bot)}
                onResumeClick={() => handleResumeClick(bot)}
                onStopClick={() => handleStopClick(bot)}
                isLoading={loadingBotId === bot.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BotStatusGrid;
