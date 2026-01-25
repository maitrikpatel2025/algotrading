import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Settings, TrendingUp } from 'lucide-react';
import PriceTickerRow from './PriceTickerRow';
import LatencyIndicator from './LatencyIndicator';
import WatchlistEditor from './WatchlistEditor';
import usePriceFeed from '../../hooks/usePriceFeed';

/**
 * PriceFeedCard Component
 *
 * Main container for the real-time price feed:
 * - Card header with title, latency indicator, and edit button
 * - Table of price rows for each watched pair
 * - Loading skeleton state
 * - Empty state with call-to-action
 * - Dark mode support
 */
function PriceFeedCard() {
  const {
    watchlist,
    prices,
    priceChanges,
    addPair,
    removePair,
    calculateChange,
    isLoading,
    latencyMs,
    error,
    maxWatchlistSize,
  } = usePriceFeed();

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Loading skeleton
  if (isLoading && watchlist.length > 0) {
    return (
      <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>

          {/* Table skeleton */}
          <div className="space-y-3">
            {Array.from({ length: Math.min(watchlist.length, 3) }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-neutral-100 dark:bg-neutral-700/50 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (watchlist.length === 0) {
    return (
      <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Price Feed
              </h2>
            </div>
          </div>

          {/* Empty state content */}
          <div className="py-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              Add pairs to your watchlist to see live prices
            </p>
            <button
              onClick={() => setIsEditorOpen(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'text-sm font-medium',
                'bg-primary text-white',
                'rounded-md',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              <Settings className="h-4 w-4" />
              Add Pairs
            </button>
          </div>
        </div>

        {/* Watchlist Editor Modal */}
        <WatchlistEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          watchlist={watchlist}
          onAddPair={addPair}
          onRemovePair={removePair}
          maxWatchlistSize={maxWatchlistSize}
        />
      </div>
    );
  }

  return (
    <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Price Feed
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Latency Indicator */}
            <LatencyIndicator latencyMs={latencyMs} error={error} />

            {/* Edit Watchlist Button */}
            <button
              onClick={() => setIsEditorOpen(true)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5',
                'text-xs font-medium',
                'text-neutral-600 dark:text-neutral-300',
                'bg-neutral-100 dark:bg-neutral-700',
                'rounded-md',
                'hover:bg-neutral-200 dark:hover:bg-neutral-600',
                'transition-colors'
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              Edit Watchlist
            </button>
          </div>
        </div>

        {/* Price Table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="py-2 px-4 text-left text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                  Pair
                </th>
                <th className="py-2 px-2 text-right text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                  Bid
                </th>
                <th className="py-2 px-2 text-right text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                  Ask
                </th>
                <th className="py-2 px-2 text-right text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                  Spread
                </th>
                <th className="py-2 px-2 text-right text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                  Chg (pips)
                </th>
                <th className="py-2 px-2 text-right text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                  Chg (%)
                </th>
                <th className="py-2 px-2 text-right text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 hidden md:table-cell">
                  High
                </th>
                <th className="py-2 px-2 text-right text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 hidden md:table-cell">
                  Low
                </th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((pair) => (
                <PriceTickerRow
                  key={pair}
                  pair={pair}
                  priceData={prices[pair]}
                  change={calculateChange(pair)}
                  flashDirection={priceChanges[pair]}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-md">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
      </div>

      {/* Watchlist Editor Modal */}
      <WatchlistEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        watchlist={watchlist}
        onAddPair={addPair}
        onRemovePair={removePair}
        maxWatchlistSize={maxWatchlistSize}
      />
    </div>
  );
}

export default PriceFeedCard;
