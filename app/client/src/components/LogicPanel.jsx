import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import ConditionBlock from './ConditionBlock';
import { CONDITION_SECTIONS } from '../app/conditionDefaults';
import { TRADE_DIRECTIONS } from '../app/constants';

// localStorage key for panel state
const LOGIC_PANEL_COLLAPSED_KEY = 'forex_dash_logic_panel_collapsed';

/**
 * LogicPanel Component
 *
 * A collapsible right sidebar panel displaying trading conditions.
 * Features Entry and Exit sections with drag-and-drop support for
 * moving conditions between sections.
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
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(LOGIC_PANEL_COLLAPSED_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [dragOverSection, setDragOverSection] = useState(null);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(LOGIC_PANEL_COLLAPSED_KEY, String(isCollapsed));
    } catch (e) {
      console.warn('Failed to save logic panel state:', e);
    }
  }, [isCollapsed]);

  // Toggle panel collapse
  const handleToggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Filter conditions by section
  const entryConditions = conditions.filter(c => c.section === CONDITION_SECTIONS.ENTRY);
  const exitConditions = conditions.filter(c => c.section === CONDITION_SECTIONS.EXIT);

  // Determine which sections to show based on trade direction
  const showEntrySection = tradeDirection === TRADE_DIRECTIONS.LONG || tradeDirection === TRADE_DIRECTIONS.BOTH;
  const showExitSection = tradeDirection === TRADE_DIRECTIONS.SHORT || tradeDirection === TRADE_DIRECTIONS.BOTH;

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
      className={cn(
        "flex flex-col bg-card border-l border-border",
        "w-72 min-h-full",
        "transition-all duration-200 ease-out"
      )}
    >
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
        {/* Entry Conditions Section */}
        {showEntrySection && (
          <div
            className={cn(
              "border-b border-border",
              dragOverSection === CONDITION_SECTIONS.ENTRY && "bg-primary/5 ring-2 ring-inset ring-primary/30"
            )}
            onDragOver={(e) => handleDragOver(e, CONDITION_SECTIONS.ENTRY)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, CONDITION_SECTIONS.ENTRY)}
          >
          {/* Section Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-success/10">
            <LogIn className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-foreground">Entry Conditions</span>
            {entryConditions.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-auto">
                {entryConditions.length}
              </span>
            )}
          </div>

          {/* Entry Conditions List */}
          <div className="p-3 space-y-3 min-h-[80px]">
            {entryConditions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No entry conditions
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drop an indicator on the chart to create one
                </p>
              </div>
            ) : (
              entryConditions.map((condition) => (
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
          </div>
        </div>
        )}

        {/* Exit Conditions Section */}
        {showExitSection && (
          <div
            className={cn(
              dragOverSection === CONDITION_SECTIONS.EXIT && "bg-primary/5 ring-2 ring-inset ring-primary/30"
            )}
            onDragOver={(e) => handleDragOver(e, CONDITION_SECTIONS.EXIT)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, CONDITION_SECTIONS.EXIT)}
          >
          {/* Section Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10">
            <LogOut className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">Exit Conditions</span>
            {exitConditions.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-auto">
                {exitConditions.length}
              </span>
            )}
          </div>

          {/* Exit Conditions List */}
          <div className="p-3 space-y-3 min-h-[80px]">
            {exitConditions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No exit conditions
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag conditions here to set exit rules
                </p>
              </div>
            ) : (
              exitConditions.map((condition) => (
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
          </div>
        </div>
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
