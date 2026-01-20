import React, { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  X,
  FolderOpen,
  Search,
  BarChart3,
  Clock,
  Tag,
  Copy,
  Trash2,
  Download,
} from 'lucide-react';
import { TRADE_DIRECTION_ICONS, TRADE_DIRECTION_LABELS } from '../app/constants';
import StrategyListItem from './StrategyListItem';

/**
 * LoadStrategyDialog Component
 *
 * A modal dialog for browsing and loading saved strategies.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed
 * @param {Function} onLoad - Callback when a strategy is selected for loading
 * @param {Function} onDuplicate - Callback to duplicate a strategy
 * @param {Function} onDelete - Callback to delete a strategy
 * @param {Function} onExport - Callback to export a strategy
 * @param {Array} strategies - List of strategies to display
 * @param {boolean} isLoading - Whether strategies are being loaded
 * @param {boolean} hasUnsavedChanges - Whether current strategy has unsaved changes
 */
function LoadStrategyDialog({
  isOpen,
  onClose,
  onLoad,
  onDuplicate,
  onDelete,
  onExport,
  strategies = [],
  isLoading = false,
  hasUnsavedChanges = false,
}) {
  const dialogRef = useRef(null);
  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_at_desc');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingLoadStrategy, setPendingLoadStrategy] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedStrategy(null);
      setShowUnsavedWarning(false);
      setPendingLoadStrategy(null);
      setContextMenu(null);
      setMultiSelectMode(false);
      setSelectedIds(new Set());
      // Focus search input when dialog opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Keyboard handlers
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (contextMenu) {
            setContextMenu(null);
          } else if (showUnsavedWarning) {
            setShowUnsavedWarning(false);
            setPendingLoadStrategy(null);
          } else {
            onClose();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, contextMenu, showUnsavedWarning]);

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => setContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Filter and sort strategies
  const filteredStrategies = useMemo(() => {
    let result = [...strategies];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by direction
    if (directionFilter !== 'all') {
      result = result.filter((s) => s.trade_direction === directionFilter);
    }

    // Sort
    switch (sortBy) {
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'updated_at_desc':
        result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
      case 'updated_at_asc':
        result.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        break;
      case 'created_at_desc':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'created_at_asc':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        break;
    }

    return result;
  }, [strategies, searchQuery, directionFilter, sortBy]);

  const handleStrategyClick = (strategy) => {
    setSelectedStrategy(strategy);
    setContextMenu(null);
  };

  const handleStrategyDoubleClick = (strategy) => {
    handleLoadStrategy(strategy);
  };

  const handleContextMenu = (e, strategy) => {
    e.preventDefault();
    setSelectedStrategy(strategy);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      strategy,
    });
  };

  const handleLoadStrategy = (strategy) => {
    if (hasUnsavedChanges) {
      setPendingLoadStrategy(strategy);
      setShowUnsavedWarning(true);
    } else {
      onLoad(strategy);
    }
  };

  const handleConfirmLoad = () => {
    if (pendingLoadStrategy) {
      onLoad(pendingLoadStrategy);
    }
    setShowUnsavedWarning(false);
    setPendingLoadStrategy(null);
  };

  const handleDuplicate = (strategy) => {
    onDuplicate?.(strategy);
    setContextMenu(null);
  };

  const handleDelete = (strategy) => {
    onDelete?.(strategy);
    setContextMenu(null);
    if (selectedStrategy?.id === strategy.id) {
      setSelectedStrategy(null);
    }
  };

  const handleExport = (strategy) => {
    onExport?.(strategy);
    setContextMenu(null);
  };

  const handleBulkDelete = () => {
    const selectedStrategies = strategies.filter((s) => selectedIds.has(s.id));
    selectedStrategies.forEach((s) => onDelete?.(s));
    setSelectedIds(new Set());
    setMultiSelectMode(false);
  };

  const toggleStrategySelection = (strategyId, checked) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(strategyId);
    } else {
      newSelected.delete(strategyId);
    }
    setSelectedIds(newSelected);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="load-strategy-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-card rounded-lg shadow-xl",
          "border border-border",
          "w-full max-w-4xl h-[80vh] max-h-[700px]",
          "flex flex-col",
          "animate-fade-in"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2
              id="load-strategy-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              Load Strategy
            </h2>
            <span className="text-sm text-muted-foreground">
              ({filteredStrategies.length} {filteredStrategies.length === 1 ? 'strategy' : 'strategies'})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-md",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-border flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, description, or tags..."
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-md",
                "bg-background border border-input",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            />
          </div>

          {/* Direction Filter */}
          <div className="flex items-center gap-1">
            {['all', 'long', 'short', 'both'].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirectionFilter(dir)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                  directionFilter === dir
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {dir === 'all' ? 'All' : TRADE_DIRECTION_ICONS[dir]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={cn(
              "px-2 py-1.5 rounded-md",
              "bg-background border border-input",
              "text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <option value="updated_at_desc">Modified (Newest)</option>
            <option value="updated_at_asc">Modified (Oldest)</option>
            <option value="created_at_desc">Created (Newest)</option>
            <option value="created_at_asc">Created (Oldest)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>

          {/* Multi-select toggle */}
          <button
            type="button"
            onClick={() => {
              setMultiSelectMode(!multiSelectMode);
              setSelectedIds(new Set());
            }}
            className={cn(
              "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
              multiSelectMode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Select Multiple
          </button>

          {/* Bulk delete */}
          {multiSelectMode && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              Delete ({selectedIds.size})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Strategy List */}
          <div className="w-1/2 border-r border-border overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredStrategies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FolderOpen className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">
                  {strategies.length === 0
                    ? 'No saved strategies'
                    : 'No strategies match your search'}
                </p>
              </div>
            ) : (
              <div role="listbox" aria-label="Strategy list">
                {filteredStrategies.map((strategy) => (
                  <StrategyListItem
                    key={strategy.id}
                    strategy={strategy}
                    isSelected={selectedStrategy?.id === strategy.id}
                    onClick={() => handleStrategyClick(strategy)}
                    onDoubleClick={() => handleStrategyDoubleClick(strategy)}
                    onContextMenu={(e) => handleContextMenu(e, strategy)}
                    showCheckbox={multiSelectMode}
                    isChecked={selectedIds.has(strategy.id)}
                    onCheckChange={(checked) => toggleStrategySelection(strategy.id, checked)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {selectedStrategy ? (
              <div className="space-y-4">
                {/* Name and direction */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedStrategy.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        "text-sm font-medium px-2 py-0.5 rounded",
                        selectedStrategy.trade_direction === 'long' && "bg-green-500/10 text-green-600",
                        selectedStrategy.trade_direction === 'short' && "bg-red-500/10 text-red-600",
                        selectedStrategy.trade_direction === 'both' && "bg-blue-500/10 text-blue-600"
                      )}
                    >
                      {TRADE_DIRECTION_ICONS[selectedStrategy.trade_direction]}{' '}
                      {TRADE_DIRECTION_LABELS[selectedStrategy.trade_direction]}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedStrategy.description && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedStrategy.description}
                    </p>
                  </div>
                )}

                {/* Pair and Timeframe */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Currency Pair
                    </label>
                    <p className="mt-1 text-sm text-foreground flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {selectedStrategy.pair?.replace('_', '/') || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Timeframe
                    </label>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedStrategy.timeframe || 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Counts */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Components
                  </label>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm px-2 py-1 rounded bg-blue-500/10 text-blue-600">
                      {selectedStrategy.indicator_count || 0} Indicators
                    </span>
                    <span className="text-sm px-2 py-1 rounded bg-purple-500/10 text-purple-600">
                      {selectedStrategy.condition_count || 0} Conditions
                    </span>
                    <span className="text-sm px-2 py-1 rounded bg-amber-500/10 text-amber-600">
                      {selectedStrategy.pattern_count || 0} Patterns
                    </span>
                    <span className="text-sm px-2 py-1 rounded bg-green-500/10 text-green-600">
                      {selectedStrategy.drawing_count || 0} Drawings
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {selectedStrategy.tags && selectedStrategy.tags.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Tags
                    </label>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {selectedStrategy.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-sm px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created
                    </label>
                    <p className="mt-1 text-sm text-foreground">
                      {formatDate(selectedStrategy.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last Modified
                    </label>
                    <p className="mt-1 text-sm text-foreground">
                      {formatDate(selectedStrategy.updated_at)}
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(selectedStrategy)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md",
                      "bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    )}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport(selectedStrategy)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md",
                      "bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedStrategy)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md",
                      "bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Select a strategy to preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-muted text-foreground",
              "hover:bg-muted/80 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => selectedStrategy && handleLoadStrategy(selectedStrategy)}
            disabled={!selectedStrategy}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            Load Strategy
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className={cn(
            "fixed z-[60] bg-card rounded-md shadow-lg border border-border py-1",
            "min-w-[140px]"
          )}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            type="button"
            onClick={() => handleDuplicate(contextMenu.strategy)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-sm",
              "text-foreground hover:bg-muted transition-colors text-left"
            )}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => handleExport(contextMenu.strategy)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-sm",
              "text-foreground hover:bg-muted transition-colors text-left"
            )}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <div className="border-t border-border my-1" />
          <button
            type="button"
            onClick={() => handleDelete(contextMenu.strategy)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-sm",
              "text-destructive hover:bg-destructive/10 transition-colors text-left"
            )}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      {/* Unsaved Changes Warning Dialog */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowUnsavedWarning(false);
              setPendingLoadStrategy(null);
            }}
          />
          <div className="relative bg-card rounded-lg shadow-xl max-w-md w-full border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Unsaved Changes
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You have unsaved changes to your current strategy. Loading a new strategy will discard these changes.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedWarning(false);
                  setPendingLoadStrategy(null);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md",
                  "bg-muted text-foreground hover:bg-muted/80 transition-colors"
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLoad}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                )}
              >
                Load Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadStrategyDialog;
