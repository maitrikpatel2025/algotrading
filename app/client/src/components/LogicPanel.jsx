import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Sparkles,
  Plus,
  ListTree,
  List,
  FlaskConical,
  FolderPlus,
  Check,
} from 'lucide-react';
import ConditionBlock from './ConditionBlock';
import ConditionGroup from './ConditionGroup';
import LogicTreeView from './LogicTreeView';
import TestLogicDialog from './TestLogicDialog';
import { CONDITION_SECTIONS_V2, migrateSectionToV2, getConditionParentGroup } from '../app/conditionDefaults';
import {
  TRADE_DIRECTIONS,
  CONDITION_SECTION_LABELS,
  CONDITION_SECTION_COLORS,
  CONDITION_SECTION_TYPES,
  LOGIC_PANEL_WIDTH_KEY,
  LOGIC_PANEL_MIN_WIDTH,
  LOGIC_PANEL_MAX_WIDTH,
  LOGIC_PANEL_DEFAULT_WIDTH,
  LOGIC_VIEW_MODES,
  LOGIC_VIEW_MODE_STORAGE_KEY,
} from '../app/constants';

// localStorage key for panel collapsed state
const LOGIC_PANEL_COLLAPSED_KEY = 'forex_dash_logic_panel_collapsed';

/**
 * LogicPanel Component
 *
 * A collapsible, resizable right sidebar panel displaying trading conditions.
 * Features four sections (Long Entry, Long Exit, Short Entry, Short Exit) based
 * on trade direction, with drag-and-drop support for moving conditions between sections.
 * Supports condition grouping with AND/OR operators, tree view, and Test Logic.
 *
 * @param {Array} conditions - Array of condition objects
 * @param {Array} groups - Array of condition group objects
 * @param {Array} activeIndicators - Array of active indicator instances
 * @param {Array} activePatterns - Array of active pattern instances
 * @param {Function} getIndicatorDisplayName - Function to get indicator display name
 * @param {Function} onConditionUpdate - Callback when a condition is updated
 * @param {Function} onConditionDelete - Callback when delete is requested
 * @param {Function} onConditionMove - Callback when condition is moved between sections
 * @param {Function} onIndicatorHover - Callback when hovering over condition block
 * @param {string} highlightedIndicatorId - ID of indicator to highlight
 * @param {string} tradeDirection - Trade direction: 'long', 'short', or 'both'
 * @param {Function} onAddCondition - Callback when Add Condition button is clicked
 * @param {Function} onGroupCreate - Callback when creating a new group
 * @param {Function} onGroupUpdate - Callback when updating a group
 * @param {Function} onGroupDelete - Callback when deleting a group
 * @param {Function} onGroupOperatorChange - Callback when toggling group operator
 * @param {Function} onUngroup - Callback when ungrouping conditions
 * @param {Function} onConditionReorderInGroup - Callback when reordering within group
 * @param {Function} onTestLogic - Callback to get test logic data
 * @param {Object} testLogicData - Data for Test Logic dialog (candleData, indicatorValues, etc.)
 */
function LogicPanel({
  conditions = [],
  groups = [],
  activeIndicators = [],
  activePatterns = [],
  getIndicatorDisplayName,
  onConditionUpdate,
  onConditionDelete,
  onConditionMove,
  onIndicatorHover,
  highlightedIndicatorId,
  tradeDirection = TRADE_DIRECTIONS.BOTH,
  onAddCondition,
  onGroupCreate,
  onGroupUpdate,
  onGroupDelete,
  onGroupOperatorChange,
  onUngroup,
  onConditionReorderInGroup,
  onTestLogic,
  testLogicData = null,
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

  // View mode state (inline vs tree)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const stored = localStorage.getItem(LOGIC_VIEW_MODE_STORAGE_KEY);
      return stored === LOGIC_VIEW_MODES.TREE ? LOGIC_VIEW_MODES.TREE : LOGIC_VIEW_MODES.INLINE;
    } catch {
      return LOGIC_VIEW_MODES.INLINE;
    }
  });

  // Selection state for grouping
  const [selectedConditions, setSelectedConditions] = useState(new Set());

  // Test Logic dialog state
  const [testLogicDialog, setTestLogicDialog] = useState({
    isOpen: false,
    section: null,
  });

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

  // Persist view mode
  useEffect(() => {
    try {
      localStorage.setItem(LOGIC_VIEW_MODE_STORAGE_KEY, viewMode);
    } catch (e) {
      console.warn('Failed to save view mode:', e);
    }
  }, [viewMode]);

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

  // Toggle view mode
  const handleViewModeToggle = useCallback(() => {
    setViewMode(prev => prev === LOGIC_VIEW_MODES.INLINE ? LOGIC_VIEW_MODES.TREE : LOGIC_VIEW_MODES.INLINE);
  }, []);

  // Migrate conditions to V2 sections and filter by section
  const getConditionsForSection = useCallback((sectionV2) => {
    return conditions.filter(c => {
      const migratedSection = migrateSectionToV2(c.section);
      return migratedSection === sectionV2;
    });
  }, [conditions]);

  // Get groups for a section
  const getGroupsForSection = useCallback((sectionV2) => {
    return groups.filter(g => g.section === sectionV2 && !g.parentGroupId);
  }, [groups]);

  // Get ungrouped conditions for a section
  const getUngroupedConditionsForSection = useCallback((sectionV2) => {
    const sectionConditions = getConditionsForSection(sectionV2);
    const groupedConditionIds = new Set();
    groups.forEach(group => {
      group.conditionIds.forEach(id => groupedConditionIds.add(id));
    });
    return sectionConditions.filter(c => !groupedConditionIds.has(c.id));
  }, [getConditionsForSection, groups]);

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
  const handleAddConditionClick = useCallback((section, groupId = null) => {
    if (onAddCondition) {
      onAddCondition(section, groupId);
    }
  }, [onAddCondition]);

  // Handle condition selection toggle
  const handleConditionSelect = useCallback((conditionId) => {
    setSelectedConditions(prev => {
      const next = new Set(prev);
      if (next.has(conditionId)) {
        next.delete(conditionId);
      } else {
        next.add(conditionId);
      }
      return next;
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedConditions(new Set());
  }, []);

  // Handle group selected conditions
  const handleGroupSelected = useCallback((section) => {
    if (selectedConditions.size < 2) return;

    // Get selected conditions that belong to this section and are not already in a group
    const sectionConditions = getConditionsForSection(section);
    const selectedInSection = sectionConditions.filter(c =>
      selectedConditions.has(c.id) && !getConditionParentGroup(c.id, groups)
    );

    if (selectedInSection.length >= 2 && onGroupCreate) {
      const conditionIds = selectedInSection.map(c => c.id);
      onGroupCreate(conditionIds, 'and', section);
      clearSelection();
    }
  }, [selectedConditions, getConditionsForSection, groups, onGroupCreate, clearSelection]);

  // Handle condition reorder (within or between groups)
  const handleConditionReorder = useCallback((conditionId, targetGroupId, targetIndex, sourceGroupId) => {
    if (onConditionReorderInGroup) {
      onConditionReorderInGroup(conditionId, targetGroupId, targetIndex, sourceGroupId);
    }
  }, [onConditionReorderInGroup]);

  // Handle create subgroup
  const handleCreateSubgroup = useCallback((parentGroupId) => {
    const parentGroup = groups.find(g => g.id === parentGroupId);
    if (!parentGroup) return;

    // Get selected conditions within this group
    const groupConditionIds = parentGroup.conditionIds.filter(id =>
      selectedConditions.has(id) && !groups.find(g => g.id === id)
    );

    if (groupConditionIds.length >= 2 && onGroupCreate) {
      onGroupCreate(groupConditionIds, 'and', parentGroup.section, parentGroupId);
      clearSelection();
    }
  }, [groups, selectedConditions, onGroupCreate, clearSelection]);

  // Handle Test Logic button click
  const handleTestLogicClick = useCallback((section) => {
    if (onTestLogic) {
      onTestLogic(section);
    }
    setTestLogicDialog({ isOpen: true, section });
  }, [onTestLogic]);

  // Close Test Logic dialog
  const handleCloseTestLogic = useCallback(() => {
    setTestLogicDialog({ isOpen: false, section: null });
  }, []);

  // Get selected count for a section
  const getSelectedCountForSection = useCallback((section) => {
    const sectionConditions = getConditionsForSection(section);
    return sectionConditions.filter(c =>
      selectedConditions.has(c.id) && !getConditionParentGroup(c.id, groups)
    ).length;
  }, [getConditionsForSection, selectedConditions, groups]);

  // Render a single section
  const renderSection = (sectionKey, isLast = false) => {
    const sectionConditions = getConditionsForSection(sectionKey);
    const sectionGroups = getGroupsForSection(sectionKey);
    const ungroupedConditions = getUngroupedConditionsForSection(sectionKey);
    const sectionLabel = CONDITION_SECTION_LABELS[sectionKey];
    const sectionColor = CONDITION_SECTION_COLORS[sectionKey];
    const sectionType = CONDITION_SECTION_TYPES[sectionKey];
    const isEntry = sectionType === 'entry';
    const Icon = isEntry ? LogIn : LogOut;
    const selectedCount = getSelectedCountForSection(sectionKey);

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

        {/* Section Content */}
        <div className="p-3 space-y-3 min-h-[80px]">
          {/* Tree View */}
          {viewMode === LOGIC_VIEW_MODES.TREE ? (
            <LogicTreeView
              conditions={conditions}
              groups={groups}
              section={sectionKey}
              onConditionSelect={handleConditionSelect}
            />
          ) : (
            <>
              {/* Inline View - Groups first, then ungrouped conditions */}
              {sectionConditions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Drag indicators to chart or click Add Condition
                  </p>
                </div>
              ) : (
                <>
                  {/* Render groups */}
                  {sectionGroups.map((group) => (
                    <ConditionGroup
                      key={group.id}
                      group={group}
                      conditions={conditions}
                      groups={groups}
                      activeIndicators={activeIndicators}
                      activePatterns={activePatterns}
                      getIndicatorDisplayName={getIndicatorDisplayName}
                      onOperatorChange={onGroupOperatorChange}
                      onConditionReorder={handleConditionReorder}
                      onUngroup={onUngroup}
                      onAddCondition={handleAddConditionClick}
                      onCreateSubgroup={handleCreateSubgroup}
                      onConditionUpdate={onConditionUpdate}
                      onConditionDelete={onConditionDelete}
                      onIndicatorHover={onIndicatorHover}
                      highlightedIndicatorId={highlightedIndicatorId}
                      onGroupDelete={onGroupDelete}
                      depth={0}
                    />
                  ))}

                  {/* Render ungrouped conditions */}
                  {ungroupedConditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="relative"
                    >
                      {/* Selection checkbox */}
                      <button
                        type="button"
                        onClick={() => handleConditionSelect(condition.id)}
                        className={cn(
                          "absolute -left-1 top-1/2 -translate-y-1/2 z-10",
                          "w-5 h-5 rounded border flex items-center justify-center",
                          "transition-colors",
                          selectedConditions.has(condition.id)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary/50"
                        )}
                      >
                        {selectedConditions.has(condition.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>

                      <div className="ml-5">
                        <ConditionBlock
                          condition={condition}
                          activeIndicators={activeIndicators}
                          activePatterns={activePatterns}
                          getIndicatorDisplayName={getIndicatorDisplayName}
                          onUpdate={onConditionUpdate}
                          onDelete={onConditionDelete}
                          onHover={onIndicatorHover}
                          isHighlighted={highlightedIndicatorId === (condition.indicatorInstanceId || condition.patternInstanceId)}
                          indicatorColor={getConditionColor(condition)}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {/* Add Condition Button */}
            <button
              type="button"
              onClick={() => handleAddConditionClick(sectionKey)}
              className={cn(
                "flex items-center gap-2 py-2 px-3",
                "text-sm text-muted-foreground",
                "border border-dashed border-border rounded-md",
                "hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Add Condition</span>
            </button>

            {/* Group Selected Button */}
            {selectedCount >= 2 && viewMode === LOGIC_VIEW_MODES.INLINE && (
              <button
                type="button"
                onClick={() => handleGroupSelected(sectionKey)}
                className={cn(
                  "flex items-center gap-2 py-2 px-3",
                  "text-sm text-primary-foreground bg-primary",
                  "rounded-md",
                  "hover:bg-primary/90",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
              >
                <FolderPlus className="h-4 w-4" />
                <span>Group Selected ({selectedCount})</span>
              </button>
            )}

            {/* Test Logic Button */}
            {sectionConditions.length > 0 && (
              <button
                type="button"
                onClick={() => handleTestLogicClick(sectionKey)}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 ml-auto",
                  "text-sm text-muted-foreground",
                  "border border-border rounded-md",
                  "hover:bg-muted/50 hover:text-foreground",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
              >
                <FlaskConical className="h-4 w-4" />
                <span>Test Logic</span>
              </button>
            )}
          </div>
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
    <>
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
          <div className="flex items-center gap-1">
            {/* View mode toggle */}
            <button
              type="button"
              onClick={handleViewModeToggle}
              className={cn(
                "p-1.5 rounded-md text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
              aria-label={viewMode === LOGIC_VIEW_MODES.INLINE ? "Switch to tree view" : "Switch to inline view"}
              title={viewMode === LOGIC_VIEW_MODES.INLINE ? "Tree view" : "Inline view"}
            >
              {viewMode === LOGIC_VIEW_MODES.INLINE ? (
                <ListTree className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </button>

            {/* Collapse button */}
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
              : `${conditions.length} condition${conditions.length !== 1 ? 's' : ''} defined${groups.length > 0 ? `, ${groups.length} group${groups.length !== 1 ? 's' : ''}` : ''}`
            }
          </p>
        </div>
      </div>

      {/* Test Logic Dialog */}
      <TestLogicDialog
        isOpen={testLogicDialog.isOpen}
        onClose={handleCloseTestLogic}
        section={testLogicDialog.section}
        conditions={conditions}
        groups={groups}
        candleData={testLogicData?.candleData}
        indicatorValues={testLogicData?.indicatorValues}
        patternDetections={testLogicData?.patternDetections}
        previousCandleData={testLogicData?.previousCandleData}
        previousIndicatorValues={testLogicData?.previousIndicatorValues}
      />
    </>
  );
}

export default LogicPanel;
