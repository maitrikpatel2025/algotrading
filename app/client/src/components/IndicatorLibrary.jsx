import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  TrendingUp,
  Activity,
  BarChart3,
  Volume2,
  Settings2,
  GripVertical,
  Shapes,
} from 'lucide-react';
import { INDICATORS, INDICATOR_CATEGORIES } from '../app/indicators';
import { PATTERNS, PATTERN_TYPES } from '../app/patterns';

// localStorage key for category state
const CATEGORY_STATE_KEY = 'forex_dash_indicator_categories';

// Category icon mapping
const CATEGORY_ICON_MAP = {
  Trend: TrendingUp,
  Momentum: Activity,
  Volatility: BarChart3,
  Volume: Volume2,
  Custom: Settings2,
  Patterns: Shapes,
};

// All categories including Patterns
const ALL_CATEGORIES = [...INDICATOR_CATEGORIES, 'Patterns'];

// Combine indicators and patterns for unified display
const ALL_ITEMS = [
  ...INDICATORS,
  ...PATTERNS.map(p => ({ ...p, isPattern: true })),
];

/**
 * IndicatorLibrary Component
 *
 * A collapsible left sidebar panel displaying categorized technical indicators.
 * Features search filtering, collapsible categories, and localStorage persistence.
 *
 * @param {boolean} isCollapsed - Whether the panel is collapsed
 * @param {Function} onToggleCollapse - Callback to toggle panel collapse state
 * @param {Function} onIndicatorSelect - Optional callback when an indicator is selected (for future use)
 */
function IndicatorLibrary({ isCollapsed, onToggleCollapse, onIndicatorSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Initialize with all categories expanded
    const initial = {};
    ALL_CATEGORIES.forEach(cat => {
      initial[cat] = true;
    });
    return initial;
  });
  const [draggingIndicator, setDraggingIndicator] = useState(null);
  const dragImageRef = useRef(null);

  // Load category state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CATEGORY_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpandedCategories(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to load category state from localStorage:', e);
    }
  }, []);

  // Filter indicators and patterns based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return ALL_ITEMS;
    }
    const term = searchTerm.toLowerCase();
    return ALL_ITEMS.filter(
      item =>
        item.name.toLowerCase().includes(term) ||
        item.shortName.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const grouped = {};
    ALL_CATEGORIES.forEach(category => {
      grouped[category] = filteredItems.filter(
        item => item.category === category
      );
    });
    return grouped;
  }, [filteredItems]);

  // Toggle category expand/collapse
  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => {
      const updated = { ...prev, [category]: !prev[category] };
      // Persist to localStorage
      try {
        localStorage.setItem(CATEGORY_STATE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save category state to localStorage:', e);
      }
      return updated;
    });
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Handle item click (for future use)
  const handleItemClick = useCallback((item) => {
    if (onIndicatorSelect) {
      onIndicatorSelect(item);
    }
  }, [onIndicatorSelect]);

  // Handle drag start
  const handleDragStart = useCallback((e, item) => {
    setDraggingIndicator(item.id);

    // Set drag data - include isPattern flag for patterns
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';

    // Create custom drag image
    if (dragImageRef.current) {
      dragImageRef.current.textContent = item.shortName;
      // Color the drag image based on pattern type
      if (item.isPattern) {
        dragImageRef.current.style.backgroundColor =
          item.patternType === PATTERN_TYPES.BULLISH ? '#22C55E' :
          item.patternType === PATTERN_TYPES.BEARISH ? '#EF4444' : '#6B7280';
      } else {
        dragImageRef.current.style.backgroundColor = '';
      }
      dragImageRef.current.style.display = 'block';
      e.dataTransfer.setDragImage(dragImageRef.current, 30, 15);
      // Hide it after drag starts
      setTimeout(() => {
        if (dragImageRef.current) {
          dragImageRef.current.style.display = 'none';
        }
      }, 0);
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggingIndicator(null);
  }, []);

  // Highlight matching text in indicator names
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

  // Collapsed state - minimal vertical bar
  if (isCollapsed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center py-4 bg-card border-r border-border",
          "w-10 min-h-full cursor-pointer",
          "hover:bg-muted/50 transition-colors duration-200"
        )}
        onClick={onToggleCollapse}
        role="button"
        aria-label="Expand indicator library panel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleCollapse();
          }
        }}
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div className="mt-4 flex flex-col items-center gap-3">
          {ALL_CATEGORIES.slice(0, 5).map(category => {
            const IconComponent = CATEGORY_ICON_MAP[category];
            return (
              <div
                key={category}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                title={category}
              >
                <IconComponent className="h-4 w-4" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Expanded state - full panel
  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border",
        "w-64 min-h-full",
        "transition-all duration-200 ease-out"
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Indicators</h2>
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground",
            "hover:bg-muted hover:text-foreground",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
          aria-label="Collapse indicator library panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search indicators..."
            className={cn(
              "w-full pl-8 pr-8 py-2 text-sm",
              "rounded-md border border-border bg-background",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "placeholder:text-muted-foreground",
              "transition-shadow"
            )}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-1",
                "hover:bg-muted rounded transition-colors"
              )}
              aria-label="Clear search"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Drag Image (hidden, used for custom drag preview) */}
      <div
        ref={dragImageRef}
        className="fixed -left-[9999px] px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-lg whitespace-nowrap"
        style={{ display: 'none' }}
      />

      {/* Categories and Items (Indicators + Patterns) */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No indicators or patterns match '{searchTerm}'
            <button
              type="button"
              onClick={handleClearSearch}
              className="block mx-auto mt-2 text-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          ALL_CATEGORIES.map(category => {
            const categoryItems = groupedItems[category];
            const IconComponent = CATEGORY_ICON_MAP[category];
            const isExpanded = expandedCategories[category];

            // Hide empty categories when searching
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="border-b border-border last:border-b-0">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5",
                    "text-sm font-medium text-foreground",
                    "hover:bg-muted/50 transition-colors",
                    "focus:outline-none focus:bg-muted/50"
                  )}
                  aria-expanded={isExpanded}
                  aria-controls={`category-${category}`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span>{category}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {categoryItems.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-150",
                      !isExpanded && "-rotate-90"
                    )}
                  />
                </button>

                {/* Category Content */}
                <div
                  id={`category-${category}`}
                  className={cn(
                    "overflow-hidden transition-all duration-150 ease-out",
                    isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="pb-2">
                    {categoryItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "flex items-center gap-2 w-full px-4 py-2.5",
                          "text-sm text-foreground text-left",
                          "min-h-[44px]", // Mobile touch target
                          "hover:bg-muted/50 transition-colors",
                          "focus:outline-none focus:bg-muted/50",
                          "group cursor-grab active:cursor-grabbing",
                          draggingIndicator === item.id && "opacity-50"
                        )}
                        title={`${item.name}\n\n${item.description}\n\nDrag to add to chart`}
                      >
                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        {/* Pattern type indicator (colored dot) */}
                        {item.isPattern && (
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                            title={item.patternType}
                          />
                        )}
                        <div className="flex-1 truncate">
                          {searchTerm ? (
                            highlightMatch(item.shortName, searchTerm)
                          ) : (
                            item.shortName
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default IndicatorLibrary;
