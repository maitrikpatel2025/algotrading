import React from 'react';
import { cn } from '../lib/utils';
import { Filter, X, ChevronDown } from 'lucide-react';

/**
 * TradeHistoryFilters Component
 *
 * Provides filtering controls for trade history including:
 * - Date range inputs (Start Date, End Date)
 * - Bot dropdown filter
 * - Pair dropdown filter
 * - Direction toggle (Both/Long/Short)
 * - Outcome toggle (All/Winners/Losers)
 * - Clear filters button
 * - Active filter count badge
 */
function TradeHistoryFilters({
  filters,
  onFilterChange,
  availableBots = [],
  availablePairs = [],
}) {
  const {
    startDate = '',
    endDate = '',
    bot = '',
    pair = '',
    direction = 'both',
    outcome = 'all',
  } = filters;

  // Count active filters
  const activeFilterCount = [
    startDate !== '',
    endDate !== '',
    bot !== '',
    pair !== '',
    direction !== 'both',
    outcome !== 'all',
  ].filter(Boolean).length;

  // Handle filter changes
  const handleStartDateChange = (e) => {
    onFilterChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    onFilterChange({ ...filters, endDate: e.target.value });
  };

  const handleBotChange = (e) => {
    onFilterChange({ ...filters, bot: e.target.value });
  };

  const handlePairChange = (e) => {
    onFilterChange({ ...filters, pair: e.target.value });
  };

  const handleDirectionChange = (value) => {
    onFilterChange({ ...filters, direction: value });
  };

  const handleOutcomeChange = (value) => {
    onFilterChange({ ...filters, outcome: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      startDate: '',
      endDate: '',
      bot: '',
      pair: '',
      direction: 'both',
      outcome: 'all',
    });
  };

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Start Date Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="history-start-date"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Start Date
          </label>
          <input
            type="date"
            id="history-start-date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="history-end-date"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            End Date
          </label>
          <input
            type="date"
            id="history-end-date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
        </div>

        {/* Bot Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="history-bot-filter"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Bot
          </label>
          <div className="relative">
            <select
              id="history-bot-filter"
              value={bot}
              onChange={handleBotChange}
              className="w-full px-3 py-1.5 text-sm border border-border rounded bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow pr-8"
            >
              <option value="">All Bots</option>
              {availableBots.map((botName) => (
                <option key={botName} value={botName}>
                  {botName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Pair Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="history-pair-filter"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Pair
          </label>
          <div className="relative">
            <select
              id="history-pair-filter"
              value={pair}
              onChange={handlePairChange}
              className="w-full px-3 py-1.5 text-sm border border-border rounded bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow pr-8"
            >
              <option value="">All Pairs</option>
              {availablePairs.map((pairName) => (
                <option key={pairName} value={pairName}>
                  {pairName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Direction Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Direction
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleDirectionChange('both')}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
                direction === 'both'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('long')}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
                direction === 'long'
                  ? 'bg-success text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('short')}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
                direction === 'short'
                  ? 'bg-destructive text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Short
            </button>
          </div>
        </div>

        {/* Outcome Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Outcome
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleOutcomeChange('all')}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
                outcome === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleOutcomeChange('winners')}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
                outcome === 'winners'
                  ? 'bg-success text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Winners
            </button>
            <button
              type="button"
              onClick={() => handleOutcomeChange('losers')}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
                outcome === 'losers'
                  ? 'bg-destructive text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Losers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradeHistoryFilters;
