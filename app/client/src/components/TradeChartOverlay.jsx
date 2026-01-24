import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { TRADE_MARKERS_VISIBLE_KEY, TRADE_MARKERS_FILTER_KEY } from '../app/constants';

/**
 * TradeChartOverlay - Controls for toggling and filtering trade markers on charts
 *
 * Features:
 * - Toggle trade visibility (show/hide all trades)
 * - Filter by outcome (all/winners/losers)
 * - Display active trade count
 * - Persist preferences to localStorage
 */
function TradeChartOverlay({
  trades = [],
  visible = true,
  filter = 'all',
  onVisibilityChange,
  onFilterChange,
}) {
  const [isVisible, setIsVisible] = useState(visible);
  const [activeFilter, setActiveFilter] = useState(filter);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedVisible = localStorage.getItem(TRADE_MARKERS_VISIBLE_KEY);
    const savedFilter = localStorage.getItem(TRADE_MARKERS_FILTER_KEY);

    if (savedVisible !== null) {
      const visibleValue = savedVisible === 'true';
      setIsVisible(visibleValue);
      if (onVisibilityChange) {
        onVisibilityChange(visibleValue);
      }
    }

    if (savedFilter) {
      setActiveFilter(savedFilter);
      if (onFilterChange) {
        onFilterChange(savedFilter);
      }
    }
  }, []);

  // Handle visibility toggle
  const handleToggleVisibility = () => {
    const newVisible = !isVisible;
    setIsVisible(newVisible);
    localStorage.setItem(TRADE_MARKERS_VISIBLE_KEY, String(newVisible));
    if (onVisibilityChange) {
      onVisibilityChange(newVisible);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    localStorage.setItem(TRADE_MARKERS_FILTER_KEY, newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  // Calculate filtered trade count
  const getFilteredTradeCount = () => {
    if (!trades || trades.length === 0) return 0;

    switch (activeFilter) {
      case 'winners':
        return trades.filter(t => t.pnl > 0).length;
      case 'losers':
        return trades.filter(t => t.pnl <= 0).length;
      case 'all':
      default:
        return trades.length;
    }
  };

  const filteredCount = getFilteredTradeCount();

  return (
    <div className="flex items-center gap-2 mb-2">
      {/* Visibility Toggle */}
      <button
        onClick={handleToggleVisibility}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          isVisible
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
        title={isVisible ? "Hide trades" : "Show trades"}
      >
        {isVisible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
        <span>Trades</span>
      </button>

      {/* Filter Buttons */}
      {isVisible && (
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <button
            onClick={() => handleFilterChange('all')}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              activeFilter === 'all'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('winners')}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              activeFilter === 'winners'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Winners
          </button>
          <button
            onClick={() => handleFilterChange('losers')}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              activeFilter === 'losers'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Losers
          </button>
        </div>
      )}

      {/* Trade Count Badge */}
      {isVisible && filteredCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md">
          <span className="text-xs font-medium text-muted-foreground">
            {filteredCount} {activeFilter === 'all' ? 'of' : ''} {activeFilter === 'all' ? trades.length : ''} trade{filteredCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export default TradeChartOverlay;
