import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import {
  Search,
  X,
  TrendingUp,
  Activity,
  BarChart3,
  Volume2,
  Shapes,
  GripVertical,
  Plus,
  Settings2,
} from 'lucide-react';
import { INDICATORS, INDICATOR_CATEGORIES } from '../app/indicators';
import { PATTERNS } from '../app/patterns';

// Category icon mapping - must include all categories from INDICATOR_CATEGORIES + 'Patterns'
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

// Combine indicators and patterns
const ALL_ITEMS = [
  ...INDICATORS,
  ...PATTERNS.map(p => ({ ...p, isPattern: true })),
];

/**
 * IndicatorSearchPopup - TradingView-style indicator search popup
 * Opens as a modal/popover when clicking "+ Indicators" button
 */
function IndicatorSearchPopup({ isOpen, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const inputRef = useRef(null);
  const popupRef = useRef(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setSearchTerm('');
      setSelectedCategory(null);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = ALL_ITEMS;
    
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(term) ||
          item.shortName.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }
    
    return items;
  }, [searchTerm, selectedCategory]);

  // Group by category
  const groupedItems = useMemo(() => {
    if (selectedCategory) {
      return { [selectedCategory]: filteredItems };
    }
    const grouped = {};
    ALL_CATEGORIES.forEach(category => {
      const categoryItems = filteredItems.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        grouped[category] = categoryItems;
      }
    });
    return grouped;
  }, [filteredItems, selectedCategory]);

  const handleSelect = useCallback((item) => {
    if (onSelect) {
      onSelect(item);
    }
    onClose();
  }, [onSelect, onClose]);

  // Handle drag start for drag-and-drop
  const handleDragStart = useCallback((e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search indicators & patterns..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {ALL_CATEGORIES.map(category => {
              const IconComponent = CATEGORY_ICON_MAP[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-colors",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results for "{searchTerm}"</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  {(() => {
                    const IconComponent = CATEGORY_ICON_MAP[category];
                    return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
                  })()}
                  {category}
                  <span className="text-muted-foreground/60">({items.length})</span>
                </div>
                
                {/* Items */}
                {items.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleSelect(item)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors group"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground cursor-grab" />
                    
                    {/* Pattern indicator */}
                    {item.isPattern && (
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{item.shortName}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                    </div>
                    
                    <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        
        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
          Click to add • Drag to chart • Press <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}

export default IndicatorSearchPopup;
