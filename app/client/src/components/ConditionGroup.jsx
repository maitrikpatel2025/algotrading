import React, { useCallback, useState } from 'react';
import { cn } from '../lib/utils';
import {
  GripVertical,
  X,
  Plus,
  Ungroup,
  FolderPlus,
} from 'lucide-react';
import ConditionBlock from './ConditionBlock';
import {
  GROUP_OPERATORS,
  GROUP_OPERATOR_LABELS,
  MAX_NESTING_DEPTH,
} from '../app/constants';
import {
  canAddToGroup,
} from '../app/conditionDefaults';

/**
 * ConditionGroup Component
 *
 * Displays a group of conditions with AND/OR operator.
 * Supports nested groups up to MAX_NESTING_DEPTH levels.
 *
 * @param {Object} group - The group data object
 * @param {Array} conditions - All conditions
 * @param {Array} groups - All groups (for resolving nested groups)
 * @param {Array} activeIndicators - Active indicator instances
 * @param {Array} activePatterns - Active pattern instances
 * @param {Function} getIndicatorDisplayName - Function to get indicator display name
 * @param {Function} onOperatorChange - Callback when operator is toggled
 * @param {Function} onConditionReorder - Callback when condition is reordered within group
 * @param {Function} onUngroup - Callback when ungroup button is clicked
 * @param {Function} onAddCondition - Callback when add condition is clicked
 * @param {Function} onCreateSubgroup - Callback to create nested subgroup
 * @param {Function} onConditionUpdate - Callback when a condition is updated
 * @param {Function} onConditionDelete - Callback when delete condition is requested
 * @param {Function} onIndicatorHover - Callback when hovering over condition
 * @param {string} highlightedIndicatorId - ID of indicator to highlight
 * @param {Function} onGroupDelete - Callback when delete group is requested
 * @param {number} depth - Current nesting depth (0 = root level)
 */
function ConditionGroup({
  group,
  conditions,
  groups,
  activeIndicators,
  activePatterns = [],
  getIndicatorDisplayName,
  onOperatorChange,
  onConditionReorder,
  onUngroup,
  onAddCondition,
  onCreateSubgroup,
  onConditionUpdate,
  onConditionDelete,
  onIndicatorHover,
  highlightedIndicatorId,
  onGroupDelete,
  depth = 0,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Get conditions in this group
  const groupConditions = group.conditionIds
    .map(id => {
      // Check if it's a nested group
      const nestedGroup = groups.find(g => g.id === id);
      if (nestedGroup) {
        return { type: 'group', data: nestedGroup };
      }
      // It's a condition
      const condition = conditions.find(c => c.id === id);
      return condition ? { type: 'condition', data: condition } : null;
    })
    .filter(Boolean);

  // Get indicator/pattern color for a condition
  const getConditionColor = useCallback((condition) => {
    if (condition.isPatternCondition && condition.leftOperand?.color) {
      return condition.leftOperand.color;
    }
    const indicator = activeIndicators.find(ind => ind.instanceId === condition.indicatorInstanceId);
    return indicator?.color;
  }, [activeIndicators]);

  // Handle operator toggle
  const handleOperatorToggle = useCallback(() => {
    const newOperator = group.operator === GROUP_OPERATORS.AND
      ? GROUP_OPERATORS.OR
      : GROUP_OPERATORS.AND;
    onOperatorChange(group.id, newOperator);
  }, [group.id, group.operator, onOperatorChange]);

  // Drag handlers for reordering
  const handleDragStart = useCallback((e, itemId) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.setData('application/x-group-id', group.id);
    e.dataTransfer.effectAllowed = 'move';
  }, [group.id]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    const conditionId = e.dataTransfer.getData('text/plain');
    const sourceGroupId = e.dataTransfer.getData('application/x-group-id');

    if (conditionId && onConditionReorder) {
      onConditionReorder(conditionId, group.id, targetIndex, sourceGroupId);
    }
  }, [group.id, onConditionReorder]);

  // Check if we can add subgroups
  const canAddSubgroup = canAddToGroup(group.id, groups);

  // Depth-based styling
  const depthColors = [
    'border-l-primary/60',
    'border-l-blue-500/60',
    'border-l-purple-500/60',
  ];
  const depthBgColors = [
    'bg-primary/5',
    'bg-blue-500/5',
    'bg-purple-500/5',
  ];

  return (
    <div
      className={cn(
        "relative rounded-lg border transition-all duration-200",
        "border-l-4",
        depthColors[depth % depthColors.length],
        depthBgColors[depth % depthBgColors.length],
        isDragging && "opacity-50"
      )}
    >
      {/* Group Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          {/* Drag Handle for group */}
          <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Operator Badge */}
          <button
            type="button"
            onClick={handleOperatorToggle}
            className={cn(
              "px-2 py-0.5 rounded text-xs font-semibold",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
              group.operator === GROUP_OPERATORS.AND
                ? "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
                : "bg-amber-500/20 text-amber-600 hover:bg-amber-500/30"
            )}
            title="Click to toggle AND/OR"
          >
            {GROUP_OPERATOR_LABELS[group.operator]}
          </button>

          {/* Depth indicator */}
          <span className="text-xs text-muted-foreground">
            Level {depth + 1}
          </span>

          {/* Condition count */}
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {groupConditions.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Ungroup Button */}
          <button
            type="button"
            onClick={() => onUngroup(group.id)}
            className={cn(
              "p-1.5 rounded-md text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            title="Ungroup conditions"
          >
            <Ungroup className="h-3.5 w-3.5" />
          </button>

          {/* Delete Group Button */}
          <button
            type="button"
            onClick={() => onGroupDelete(group.id)}
            className={cn(
              "p-1.5 rounded-md text-muted-foreground",
              "hover:bg-destructive/10 hover:text-destructive",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/50"
            )}
            title="Delete group"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Group Content */}
      <div className="p-3 space-y-2">
        {groupConditions.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            Empty group - drag conditions here or add new ones
          </div>
        ) : (
          groupConditions.map((item, index) => (
            <div key={item.data.id}>
              {/* Drop zone indicator */}
              {dragOverIndex === index && (
                <div className="h-1 bg-primary/50 rounded-full mb-2 transition-all" />
              )}

              {/* Operator connector (between conditions) */}
              {index > 0 && (
                <div className="flex items-center justify-center py-1">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      group.operator === GROUP_OPERATORS.AND
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-amber-500/10 text-amber-500"
                    )}
                  >
                    {GROUP_OPERATOR_LABELS[group.operator]}
                  </span>
                </div>
              )}

              {/* Render nested group or condition */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, item.data.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                {item.type === 'group' ? (
                  <ConditionGroup
                    group={item.data}
                    conditions={conditions}
                    groups={groups}
                    activeIndicators={activeIndicators}
                    activePatterns={activePatterns}
                    getIndicatorDisplayName={getIndicatorDisplayName}
                    onOperatorChange={onOperatorChange}
                    onConditionReorder={onConditionReorder}
                    onUngroup={onUngroup}
                    onAddCondition={onAddCondition}
                    onCreateSubgroup={onCreateSubgroup}
                    onConditionUpdate={onConditionUpdate}
                    onConditionDelete={onConditionDelete}
                    onIndicatorHover={onIndicatorHover}
                    highlightedIndicatorId={highlightedIndicatorId}
                    onGroupDelete={onGroupDelete}
                    depth={depth + 1}
                  />
                ) : (
                  <ConditionBlock
                    condition={item.data}
                    activeIndicators={activeIndicators}
                    activePatterns={activePatterns}
                    getIndicatorDisplayName={getIndicatorDisplayName}
                    onUpdate={onConditionUpdate}
                    onDelete={onConditionDelete}
                    onHover={onIndicatorHover}
                    isHighlighted={highlightedIndicatorId === (item.data.indicatorInstanceId || item.data.patternInstanceId)}
                    indicatorColor={getConditionColor(item.data)}
                    isInGroup={true}
                    groupOperator={group.operator}
                  />
                )}
              </div>
            </div>
          ))
        )}

        {/* Drop zone at the end */}
        {dragOverIndex === groupConditions.length && (
          <div className="h-1 bg-primary/50 rounded-full transition-all" />
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
          {/* Add Condition */}
          <button
            type="button"
            onClick={() => onAddCondition(group.section, group.id)}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-3",
              "text-xs text-muted-foreground",
              "border border-dashed border-border rounded-md",
              "hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <Plus className="h-3 w-3" />
            <span>Add Condition</span>
          </button>

          {/* Create Subgroup */}
          {canAddSubgroup && groupConditions.filter(i => i.type === 'condition').length >= 2 && (
            <button
              type="button"
              onClick={() => onCreateSubgroup(group.id)}
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-3",
                "text-xs text-muted-foreground",
                "border border-dashed border-border rounded-md",
                "hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              <FolderPlus className="h-3 w-3" />
              <span>Create Subgroup</span>
            </button>
          )}

          {/* Max depth warning */}
          {!canAddSubgroup && depth >= MAX_NESTING_DEPTH - 1 && (
            <span className="text-xs text-amber-500 py-1.5 px-2">
              Max nesting depth reached
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConditionGroup;
