import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '../../lib/utils';
import endPoints from '../../app/api';
import { X, Search, Plus, Check, AlertCircle } from 'lucide-react';

// Category display order
const CATEGORY_ORDER = ['Major', 'Minor', 'Exotic'];

/**
 * WatchlistEditor Component
 *
 * Modal dialog for managing the price feed watchlist:
 * - Search/filter pairs
 * - View pairs grouped by category
 * - Add pairs to watchlist (click)
 * - Remove pairs from watchlist (X button)
 * - Max 10 pairs limit enforcement
 */
function WatchlistEditor({
  isOpen,
  onClose,
  watchlist,
  onAddPair,
  onRemovePair,
  maxWatchlistSize,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allPairs, setAllPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);

  // Fetch available pairs on mount
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const options = await endPoints.options();
        if (options && options.pairs) {
          setAllPairs(options.pairs);
        }
      } catch (error) {
        console.error('Failed to fetch pairs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPairs();
    }
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter and group pairs
  const { groupedPairs, hasResults } = useMemo(() => {
    const term = searchTerm.toLowerCase();

    // Filter pairs
    const filtered = allPairs.filter((pair) =>
      pair.text?.toLowerCase().includes(term) ||
      pair.value?.toLowerCase().includes(term)
    );

    // Group by category
    const grouped = {};
    CATEGORY_ORDER.forEach((cat) => {
      grouped[cat] = filtered.filter((pair) => pair.category === cat);
    });

    const hasAnyResults = filtered.length > 0;

    return { groupedPairs: grouped, hasResults: hasAnyResults };
  }, [allPairs, searchTerm]);

  // Check if pair is in watchlist
  const isInWatchlist = (pair) => watchlist.includes(pair);

  // Check if watchlist is at max capacity
  const isWatchlistFull = watchlist.length >= maxWatchlistSize;

  // Handle pair click
  const handlePairClick = (pair) => {
    if (isInWatchlist(pair)) {
      onRemovePair(pair);
    } else if (!isWatchlistFull) {
      onAddPair(pair);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative w-full max-w-md mx-4',
          'bg-white dark:bg-neutral-800',
          'border border-neutral-200 dark:border-neutral-700',
          'rounded-lg shadow-xl',
          'animate-slide-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Edit Watchlist
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {watchlist.length}/{maxWatchlistSize} pairs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Current Watchlist */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-2">
            Current Watchlist
          </h3>
          {watchlist.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              No pairs in watchlist
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {watchlist.map((pair) => (
                <span
                  key={pair}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1',
                    'text-sm font-medium',
                    'bg-primary/10 text-primary',
                    'rounded-md'
                  )}
                >
                  {pair.replace('_', '/')}
                  <button
                    onClick={() => onRemovePair(pair)}
                    className="p-0.5 hover:bg-primary/20 rounded"
                    aria-label={`Remove ${pair}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pairs..."
              className={cn(
                'w-full pl-9 pr-4 py-2 text-sm',
                'rounded-md border border-neutral-200 dark:border-neutral-600',
                'bg-white dark:bg-neutral-700',
                'text-neutral-900 dark:text-neutral-50',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded"
              >
                <X className="h-3 w-3 text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        {/* Pair List */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-neutral-500">
              Loading pairs...
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-neutral-500">
              No pairs match "{searchTerm}"
            </div>
          ) : (
            CATEGORY_ORDER.map((category) => {
              const pairs = groupedPairs[category];
              if (pairs.length === 0) return null;

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div
                    className={cn(
                      'sticky top-0 px-4 py-2',
                      'text-xs font-semibold uppercase',
                      'text-neutral-500 dark:text-neutral-400',
                      'bg-neutral-50 dark:bg-neutral-800/95',
                      'backdrop-blur-sm'
                    )}
                  >
                    {category}
                  </div>

                  {/* Pairs */}
                  {pairs.map((pair) => {
                    const inWatchlist = isInWatchlist(pair.value);
                    const canAdd = !inWatchlist && !isWatchlistFull;

                    return (
                      <button
                        key={pair.key}
                        onClick={() => handlePairClick(pair.value)}
                        disabled={!canAdd && !inWatchlist}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3',
                          'text-sm text-left',
                          'hover:bg-neutral-50 dark:hover:bg-neutral-700/50',
                          'transition-colors',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          inWatchlist && 'bg-primary/5'
                        )}
                      >
                        <span
                          className={cn(
                            'font-medium',
                            inWatchlist
                              ? 'text-primary'
                              : 'text-neutral-700 dark:text-neutral-200'
                          )}
                        >
                          {pair.text || pair.value.replace('_', '/')}
                        </span>

                        {inWatchlist ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : canAdd ? (
                          <Plus className="h-4 w-4 text-neutral-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer with limit warning */}
        {isWatchlistFull && (
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-warning/10">
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertCircle className="h-4 w-4" />
              <span>Watchlist limit reached ({maxWatchlistSize} pairs max)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistEditor;
