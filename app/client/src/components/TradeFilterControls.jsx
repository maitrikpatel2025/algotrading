import React from 'react';
import { cn } from '../lib/utils';
import { Filter, X } from 'lucide-react';

/**
 * TradeFilterControls Component
 *
 * Provides filtering controls for the trade list including:
 * - Trade outcome filter (All, Winners, Losers)
 * - Trade direction filter (Both, Long, Short)
 * - Date range filter (start and end dates)
 * - Clear filters button
 * - Active filter count badge
 */
function TradeFilterControls({ filters, onFilterChange }) {
  const {
    outcome = 'all',
    direction = 'both',
    startDate = '',
    endDate = '',
  } = filters;

  // Count active filters
  const activeFilterCount = [
    outcome !== 'all',
    direction !== 'both',
    startDate !== '',
    endDate !== '',
  ].filter(Boolean).length;

  // Handle filter changes
  const handleOutcomeChange = (value) => {
    onFilterChange({ ...filters, outcome: value });
  };

  const handleDirectionChange = (value) => {
    onFilterChange({ ...filters, direction: value });
  };

  const handleStartDateChange = (e) => {
    onFilterChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    onFilterChange({ ...filters, endDate: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      outcome: 'all',
      direction: 'both',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-3">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-700">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Outcome Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            Outcome
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleOutcomeChange('all')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                outcome === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleOutcomeChange('winners')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                outcome === 'winners'
                  ? 'bg-success text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              Winners
            </button>
            <button
              type="button"
              onClick={() => handleOutcomeChange('losers')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                outcome === 'losers'
                  ? 'bg-danger text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              Losers
            </button>
          </div>
        </div>

        {/* Direction Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            Direction
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleDirectionChange('both')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                direction === 'both'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('long')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                direction === 'long'
                  ? 'bg-success text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('short')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                direction === 'short'
                  ? 'bg-danger text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              Short
            </button>
          </div>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="trade-start-date"
            className="text-xs font-medium text-neutral-600 uppercase tracking-wide"
          >
            Start Date
          </label>
          <input
            type="date"
            id="trade-start-date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="trade-end-date"
            className="text-xs font-medium text-neutral-600 uppercase tracking-wide"
          >
            End Date
          </label>
          <input
            type="date"
            id="trade-end-date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
        </div>
      </div>
    </div>
  );
}

export default TradeFilterControls;
