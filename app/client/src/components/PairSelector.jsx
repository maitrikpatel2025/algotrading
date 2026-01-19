import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import endPoints from '../app/api';
import { Search, ChevronDown, Check, X, Loader2, Clock, AlertCircle } from 'lucide-react';

// localStorage key for recent pairs
const RECENT_PAIRS_KEY = 'forex_dash_recent_pairs';
const MAX_RECENT_PAIRS = 5;
const SPREAD_REFRESH_INTERVAL = 5000; // 5 seconds
const SEARCH_DEBOUNCE_MS = 150;

// Category display order
const CATEGORY_ORDER = ['Major', 'Minor', 'Exotic'];

function PairSelector({
  options = [],
  defaultValue,
  onSelected,
  hasLoadedData = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recentPairs, setRecentPairs] = useState([]);
  const [spreads, setSpreads] = useState({});
  const [spreadLoading, setSpreadLoading] = useState({});
  const [pendingSelection, setPendingSelection] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const spreadIntervalRef = useRef(null);

  // Load recent pairs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_PAIRS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentPairs(Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_PAIRS) : []);
      }
    } catch (e) {
      console.warn('Failed to load recent pairs from localStorage:', e);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Filter and group pairs by category
  const { flatList } = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();

    // Filter pairs based on search
    const filtered = options.filter(opt =>
      opt.text.toLowerCase().includes(term) ||
      opt.value.toLowerCase().includes(term)
    );

    // Group by category
    const grouped = {};
    CATEGORY_ORDER.forEach(cat => {
      grouped[cat] = filtered.filter(opt => opt.category === cat);
    });

    // Build flat list for keyboard navigation
    const flat = [];

    // Add recent pairs first (if not searching)
    if (!term && recentPairs.length > 0) {
      const recentOptions = recentPairs
        .map(pair => options.find(opt => opt.value === pair))
        .filter(Boolean);
      if (recentOptions.length > 0) {
        flat.push({ type: 'header', label: 'Recent' });
        recentOptions.forEach(opt => flat.push({ type: 'option', ...opt }));
      }
    }

    // Add categorized pairs
    CATEGORY_ORDER.forEach(cat => {
      if (grouped[cat].length > 0) {
        flat.push({ type: 'header', label: cat });
        grouped[cat].forEach(opt => flat.push({ type: 'option', ...opt }));
      }
    });

    return { flatList: flat };
  }, [options, debouncedSearchTerm, recentPairs]);

  // Get selectable items only (excluding headers)
  const selectableItems = useMemo(() =>
    flatList.filter(item => item.type === 'option'),
    [flatList]
  );

  // Fetch spread for visible pairs when dropdown opens
  const fetchSpreads = useCallback(async () => {
    const pairsToFetch = selectableItems.slice(0, 20).map(item => item.value);

    for (const pair of pairsToFetch) {
      if (spreadLoading[pair]) continue;

      setSpreadLoading(prev => ({ ...prev, [pair]: true }));

      try {
        const data = await endPoints.spread(pair);
        if (data && !data.error) {
          setSpreads(prev => ({
            ...prev,
            [pair]: { spread: data.spread, timestamp: Date.now() }
          }));
        } else {
          setSpreads(prev => ({
            ...prev,
            [pair]: { error: true, timestamp: Date.now() }
          }));
        }
      } catch (e) {
        setSpreads(prev => ({
          ...prev,
          [pair]: { error: true, timestamp: Date.now() }
        }));
      } finally {
        setSpreadLoading(prev => ({ ...prev, [pair]: false }));
      }
    }
  }, [selectableItems, spreadLoading]);

  // Start/stop spread fetching interval when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      fetchSpreads();
      spreadIntervalRef.current = setInterval(fetchSpreads, SPREAD_REFRESH_INTERVAL);
    } else {
      if (spreadIntervalRef.current) {
        clearInterval(spreadIntervalRef.current);
        spreadIntervalRef.current = null;
      }
    }

    return () => {
      if (spreadIntervalRef.current) {
        clearInterval(spreadIntervalRef.current);
      }
    };
  }, [isOpen, fetchSpreads]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [debouncedSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save recent pair to localStorage
  const saveRecentPair = useCallback((pair) => {
    setRecentPairs(prev => {
      const updated = [pair, ...prev.filter(p => p !== pair)].slice(0, MAX_RECENT_PAIRS);
      try {
        localStorage.setItem(RECENT_PAIRS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent pairs to localStorage:', e);
      }
      return updated;
    });
  }, []);

  // Handle pair selection
  const handleSelect = useCallback((pair) => {
    if (hasLoadedData && pair !== defaultValue) {
      // Show confirmation dialog
      setPendingSelection(pair);
      setShowConfirmDialog(true);
    } else {
      // Direct selection
      saveRecentPair(pair);
      onSelected(pair);
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [hasLoadedData, defaultValue, saveRecentPair, onSelected]);

  // Handle confirmation dialog
  const handleConfirm = useCallback(() => {
    if (pendingSelection) {
      saveRecentPair(pendingSelection);
      onSelected(pendingSelection);
    }
    setShowConfirmDialog(false);
    setPendingSelection(null);
    setIsOpen(false);
    setSearchTerm('');
  }, [pendingSelection, saveRecentPair, onSelected]);

  const handleCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingSelection(null);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          Math.min(prev + 1, selectableItems.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectableItems[highlightedIndex]) {
          handleSelect(selectableItems[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        break;
      default:
        // If typing letters/numbers, focus search and let it handle input
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          searchInputRef.current?.focus();
        }
        break;
    }
  }, [isOpen, highlightedIndex, selectableItems, handleSelect]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-selectable="true"]');
      const item = items[highlightedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen, highlightedIndex]);

  // Highlight matching text
  const highlightMatch = (text, term) => {
    if (!term) return text;
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="font-bold text-primary">{text.slice(index, index + term.length)}</span>
        {text.slice(index + term.length)}
      </>
    );
  };

  // Render spread badge
  const renderSpread = (pair) => {
    const spreadData = spreads[pair];
    const isLoading = spreadLoading[pair];

    if (isLoading && !spreadData) {
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
        </span>
      );
    }

    if (!spreadData) {
      return null;
    }

    if (spreadData.error) {
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>--</span>
        </span>
      );
    }

    // Check if data is stale (older than 30 seconds)
    const isStale = Date.now() - spreadData.timestamp > 30000;

    return (
      <span className={cn(
        "text-xs px-1.5 py-0.5 rounded",
        isStale
          ? "bg-warning/10 text-warning"
          : "bg-muted text-muted-foreground"
      )}>
        {spreadData.spread} pips
      </span>
    );
  };

  // Get selected option display
  const selectedOption = options.find(opt => opt.value === defaultValue);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-1.5", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Label */}
      <label className="text-sm font-medium text-muted-foreground">
        Currency Pair
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 w-full px-3 py-2",
          "rounded-lg border border-border bg-background",
          "text-sm text-foreground",
          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
          "transition-colors cursor-pointer",
          isOpen && "ring-2 ring-primary/50"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {selectedOption?.text || defaultValue || 'Select pair...'}
          </span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 top-full left-0 right-0 mt-1",
          "bg-card border border-border rounded-lg shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-150"
        )}>
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pairs..."
                className={cn(
                  "w-full pl-8 pr-8 py-2 text-sm",
                  "rounded-md border border-border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "placeholder:text-muted-foreground"
                )}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-[300px] overflow-y-auto"
            role="listbox"
          >
            {flatList.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No pairs match '{debouncedSearchTerm}'
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="block mx-auto mt-2 text-primary hover:underline"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              flatList.map((item, index) => {
                if (item.type === 'header') {
                  return (
                    <div
                      key={`header-${item.label}`}
                      className={cn(
                        "sticky top-0 px-3 py-2 text-xs font-semibold uppercase",
                        "text-muted-foreground bg-muted/50 backdrop-blur-sm",
                        "flex items-center gap-2"
                      )}
                    >
                      {item.label === 'Recent' && <Clock className="h-3 w-3" />}
                      {item.label}
                    </div>
                  );
                }

                const selectableIndex = selectableItems.findIndex(
                  si => si.value === item.value
                );
                const isHighlighted = selectableIndex === highlightedIndex;
                const isSelected = item.value === defaultValue;

                return (
                  <button
                    key={item.key}
                    type="button"
                    data-selectable="true"
                    onClick={() => handleSelect(item.value)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-3",
                      "text-sm text-left cursor-pointer",
                      "min-h-[44px]", // Mobile touch target
                      "hover:bg-muted/50 transition-colors",
                      isHighlighted && "bg-muted",
                      isSelected && "bg-primary/10"
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="w-4" />
                      )}
                      <span className={isSelected ? "font-semibold" : ""}>
                        {highlightMatch(item.text, debouncedSearchTerm)}
                      </span>
                    </div>
                    {renderSpread(item.value)}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancel}
          />
          <div className="relative bg-card border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Change Currency Pair?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Changing the currency pair will reset the currently loaded technical indicators and chart data. Do you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PairSelector;
