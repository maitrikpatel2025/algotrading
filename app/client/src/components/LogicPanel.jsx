import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Sparkles,
  Plus,
} from 'lucide-react';
import ConditionBlock from './ConditionBlock';
import { CONDITION_SECTIONS_V2, migrateSectionToV2 } from '../app/conditionDefaults';
import {
  TRADE_DIRECTIONS,
  CONDITION_SECTION_LABELS,
  CONDITION_SECTION_COLORS,
  CONDITION_SECTION_TYPES,
  LOGIC_PANEL_WIDTH_KEY,
  LOGIC_PANEL_MIN_WIDTH,
  LOGIC_PANEL_MAX_WIDTH,
  LOGIC_PANEL_DEFAULT_WIDTH,
} from '../app/constants';

// localStorage key for panel collapsed state
const LOGIC_PANEL_COLLAPSED_KEY = 'forex_dash_logic_panel_collapsed';

/**
 * LogicPanel Component
 *
 * A collapsible, resizable right sidebar panel displaying trading conditions.
 * Features four sections (Long Entry, Long Exit, Short Entry, Short Exit) based
 * on trade direction, with drag-and-drop support for moving conditions between sections.
 *
 * @param {Array} conditions - Array of condition objects
 * @param {Array} activeIndicators - Array of active indicator instances
 * @param {Function} getIndicatorDisplayName - Function to get indicator display name
 * @param {Function} onConditionUpdate - Callback when a condition is updated
 * @param {Function} onConditionDelete - Callback when delete is requested
 * @param {Function} onConditionMove - Callback when condition is moved between sections
 * @param {Function} onIndicatorHover - Callback when hovering over condition block
 * @param {string} highlightedIndicatorId - ID of indicator to highlight
 * @param {string} tradeDirection - Trade direction: 'long', 'short', or 'both'
 * @param {Function} onAddCondition - Callback when Add Condition button is clicked
 */
function LogicPanel({
  conditions = [],
  activeIndicators = [],
  getIndicatorDisplayName,
  onConditionUpdate,
  onConditionDelete,
  onConditionMove,
  onIndicatorHover,
  highlightedIndicatorId,
  tradeDirection = TRADE_DIRECTIONS.BOTH,
  onAddCondition,
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(LOGIC_PANEL_COLLAPSED_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [panelWidth, setPanelWidth] = useState(() => {
    try {
      const stored = localStorage.getItem(LOGIC_PANEL_WIDTH_KEY);
      if (stored) {
        const width = parseInt(stored, 10);
        if (width >= LOGIC_PANEL_MIN_WIDTH && width <= LOGIC_PANEL_MAX_WIDTH) {
          return width;
        }
      }
    } catch {
      // Ignore
    }
    return LOGIC_PANEL_DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [dragOverSection, setDragOverSection] = useState(null);
  const panelRef = useRef(null);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(LOGIC_PANEL_COLLAPSED_KEY, String(isCollapsed));
    } catch (e) {
      console.warn('Failed to save logic panel state:', e);
    }
  }, [isCollapsed]);

  // Persist panel width
  useEffect(() => {
    try {
      localStorage.setItem(LOGIC_PANEL_WIDTH_KEY, String(panelWidth));
    } catch (e) {
      console.warn('Failed to save logic panel width:', e);
    }
  }, [panelWidth]);

  // Handle resize mouse events
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!panelRef.current) return;
      const panelRect = panelRef.current.getBoundingClientRect();
      // Calculate new width (panel is on the right, so width = right edge - mouse position)
      const newWidth = panelRect.right - e.clientX;
      // Apply constraints
      const constrainedWidth = Math.max(
        LOGIC_PANEL_MIN_WIDTH,
        Math.min(LOGIC_PANEL_MAX_WIDTH, newWidth)
      );
      setPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent text selection during resize
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Toggle panel collapse
  const handleToggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Start resize
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Migrate conditions to V2 sections and filter by section
  const getConditionsForSection = useCallback((sectionV2) => {
    return conditions.filter(c => {
      const migratedSection = migrateSectionToV2(c.section);
      return migratedSection === sectionV2;
    });
  }, [conditions]);

  // Determine which sections to show based on trade direction
  const getSectionsToShow = useCallback(() => {
    if (tradeDirection === TRADE_DIRECTIONS.LONG) {
      return [CONDITION_SECTIONS_V2.LONG_ENTRY, CONDITION_SECTIONS_V2.LONG_EXIT];
    }
    if (tradeDirection === TRADE_DIRECTIONS.SHORT) {
      return [CONDITION_SECTIONS_V2.SHORT_ENTRY, CONDITION_SECTIONS_V2.SHORT_EXIT];
    }
    // BOTH
    return [
      CONDITION_SECTIONS_V2.LONG_ENTRY,
      CONDITION_SECTIONS_V2.LONG_EXIT,
      CONDITION_SECTIONS_V2.SHORT_ENTRY,
      CONDITION_SECTIONS_V2.SHORT_EXIT,
    ];
  }, [tradeDirection]);

  const sectionsToShow = getSectionsToShow();

  // Get indicator/pattern color for a condition
  const getConditionColor = useCallback((condition) => {
    // Check if it's a pattern condition
    if (condition.isPatternCondition && condition.leftOperand?.color) {
      return condition.leftOperand.color;
    }
    // Otherwise look up indicator color
    const indicator = activeIndicators.find(ind => ind.instanceId === condition.indicatorInstanceId);
    return indicator?.color;
  }, [activeIndicators]);

  // Drag over section handlers
  const handleDragOver = useCallback((e, section) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(section);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSection(null);
  }, []);

  const handleDrop = useCallback((e, targetSection) => {
    e.preventDefault();
    setDragOverSection(null);

    const conditionId = e.dataTransfer.getData('text/plain');
    if (conditionId && onConditionMove) {
      onConditionMove(conditionId, targetSection);
    }
  }, [onConditionMove]);

  // Handle Add Condition button click
  const handleAddConditionClick = useCallback((section) => {
    if (onAddCondition) {
      onAddCondition(section);
    }
  }, [onAddCondition]);

  // Render a single section
  const renderSection = (sectionKey, isLast = false) => {
    const sectionConditions = getConditionsForSection(sectionKey);
    const sectionLabel = CONDITION_SECTION_LABELS[sectionKey];
    const sectionColor = CONDITION_SECTION_COLORS[sectionKey];
    const sectionType = CONDITION_SECTION_TYPES[sectionKey];
    const isEntry = sectionType === 'entry';
    const Icon = isEntry ? LogIn : LogOut;

    return (
      <div
        key={sectionKey}
        className={cn(
          !isLast && "border-b border-border",
          dragOverSection === sectionKey && "bg-primary/5 ring-2 ring-inset ring-primary/30"
        )}
        onDragOver={(e) => handleDragOver(e, sectionKey)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, sectionKey)}
      >
        {/* Section Header */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-2.5",
          sectionColor === 'success' ? "bg-success/10" : "bg-destructive/10"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            sectionColor === 'success' ? "text-success" : "text-destructive"
          )} />
          <span className="text-sm font-medium text-foreground">{sectionLabel}</span>
          {sectionConditions.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-auto">
              {sectionConditions.length}
            </span>
          )}
        </div>

        {/* Section Conditions List */}
        <div className="p-3 space-y-3 min-h-[80px]">
          {sectionConditions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Drag indicators to chart or click Add Condition
              </p>
            </div>
          ) : (
            sectionConditions.map((condition) => (
              <ConditionBlock
                key={condition.id}
                condition={condition}
                activeIndicators={activeIndicators}
                getIndicatorDisplayName={getIndicatorDisplayName}
                onUpdate={onConditionUpdate}
                onDelete={onConditionDelete}
                onHover={onIndicatorHover}
                isHighlighted={highlightedIndicatorId === (condition.indicatorInstanceId || condition.patternInstanceId)}
                indicatorColor={getConditionColor(condition)}
              />
            ))
          )}
          {/* Add Condition Button */}
          <button
            type="button"
            onClick={() => handleAddConditionClick(sectionKey)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-3",
              "text-sm text-muted-foreground",
              "border border-dashed border-border rounded-md",
              "hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Add Condition</span>
          </button>
        </div>
      </div>
    );
  };

  // Collapsed state - minimal vertical bar
  if (isCollapsed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center py-4 bg-card border-l border-border",
          "w-10 min-h-full cursor-pointer",
          "hover:bg-muted/50 transition-colors duration-200"
        )}
        onClick={handleToggle}
        role="button"
        aria-label="Expand logic panel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        <div className="mt-4 flex flex-col items-center gap-3">
          <div
            className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Entry Conditions"
          >
            <LogIn className="h-4 w-4" />
          </div>
          <div
            className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Exit Conditions"
          >
            <LogOut className="h-4 w-4" />
          </div>
        </div>
        {conditions.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {conditions.length}
          </div>
        )}
      </div>
    );
  }

  // Expanded state - full panel
  return (
    <div
      ref={panelRef}
      className={cn(
        "flex flex-col bg-card border-l border-border relative",
        "min-h-full",
        "transition-all duration-200 ease-out"
      )}
      style={{ width: `${panelWidth}px` }}
    >
      {/* Resize Handle */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5",
          "cursor-ew-resize hover:bg-primary/30 transition-colors",
          "group",
          isResizing && "bg-primary/50"
        )}
        onMouseDown={handleResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize logic panel"
      >
        <div className={cn(
          "absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-8",
          "bg-muted-foreground/30 rounded-full",
          "group-hover:bg-primary/50 transition-colors",
          isResizing && "bg-primary"
        )} />
      </div>

      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Logic Panel</h2>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground",
            "hover:bg-muted hover:text-foreground",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
          aria-label="Collapse logic panel"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {sectionsToShow.map((sectionKey, index) =>
          renderSection(sectionKey, index === sectionsToShow.length - 1)
        )}
      </div>

      {/* Panel Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          {conditions.length === 0
            ? 'Add indicators to create conditions'
            : `${conditions.length} condition${conditions.length !== 1 ? 's' : ''} defined`
          }
        </p>
      </div>
    </div>
  );
}

export default LogicPanel;
