import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { X, GripVertical, AlertTriangle } from 'lucide-react';
import ConditionDropdown from './ConditionDropdown';
import { OPERATORS, buildOperandOptions, getOperatorLabel } from '../app/conditionDefaults';

/**
 * ConditionBlock Component
 *
 * Displays a single trading condition with dropdowns for left operand,
 * operator, and right operand. Supports drag-and-drop for reordering
 * and hover highlighting for visual connection to chart indicators.
 *
 * @param {Object} condition - The condition data object
 * @param {Array} activeIndicators - List of active indicators on the chart
 * @param {Function} getIndicatorDisplayName - Function to get indicator display name
 * @param {Function} onUpdate - Callback when condition is updated
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {Function} onHover - Callback when hovering over the block
 * @param {boolean} isHighlighted - Whether the block should be highlighted
 * @param {string} indicatorColor - The color of the associated indicator
 */
function ConditionBlock({
  condition,
  activeIndicators,
  getIndicatorDisplayName,
  onUpdate,
  onDelete,
  onHover,
  isHighlighted,
  indicatorColor,
}) {
  const [isNew, setIsNew] = useState(condition.isNew);
  const [isDragging, setIsDragging] = useState(false);

  // Clear isNew flag after animation completes
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setIsNew(false);
        // Also update the condition object to remove isNew flag
        if (onUpdate) {
          onUpdate({ ...condition, isNew: false });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNew, condition, onUpdate]);

  // Build operand options for dropdowns
  const operandOptions = buildOperandOptions(activeIndicators, getIndicatorDisplayName);

  // Operator options for the operator dropdown
  const operatorOptions = [{
    group: 'Operators',
    options: OPERATORS.map(op => ({
      type: 'operator',
      value: op.id,
      label: op.label,
      description: op.description,
    })),
  }];

  // Handle operand changes
  const handleLeftOperandChange = useCallback((newValue) => {
    onUpdate({
      ...condition,
      leftOperand: newValue,
    });
  }, [condition, onUpdate]);

  const handleOperatorChange = useCallback((newValue) => {
    onUpdate({
      ...condition,
      operator: newValue.value,
    });
  }, [condition, onUpdate]);

  const handleRightOperandChange = useCallback((newValue) => {
    onUpdate({
      ...condition,
      rightOperand: newValue,
    });
  }, [condition, onUpdate]);

  // Hover handlers for visual connection
  const handleMouseEnter = useCallback(() => {
    if (onHover) {
      // Support both indicator and pattern conditions
      onHover(condition.indicatorInstanceId || condition.patternInstanceId);
    }
  }, [onHover, condition.indicatorInstanceId, condition.patternInstanceId]);

  const handleMouseLeave = useCallback(() => {
    if (onHover) {
      onHover(null);
    }
  }, [onHover]);

  // Drag handlers for reordering
  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', condition.id);
    e.dataTransfer.effectAllowed = 'move';
  }, [condition.id]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Check if condition has valid indicator/pattern reference
  // Pattern conditions are always valid if they have the isPatternCondition flag
  const hasValidIndicator = condition.isPatternCondition || activeIndicators.some(
    ind => ind.instanceId === condition.indicatorInstanceId
  );

  // Get current operator for display
  const currentOperator = {
    type: 'operator',
    value: condition.operator,
    label: getOperatorLabel(condition.operator),
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border transition-all duration-200",
        "bg-card hover:bg-muted/30",
        isHighlighted && "ring-2 ring-primary bg-primary/5",
        isDragging && "opacity-50",
        isNew && "animate-slide-in-right"
      )}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: indicatorColor || 'hsl(var(--border))',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="p-3 pl-6">
        {/* Warning for invalid indicator */}
        {!hasValidIndicator && (
          <div className="flex items-center gap-2 text-amber-500 text-xs mb-2">
            <AlertTriangle className="h-3 w-3" />
            <span>Indicator removed from chart</span>
          </div>
        )}

        {/* Condition Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pattern Condition Display (special case - no dropdowns, just text) */}
          {condition.isPatternCondition ? (
            <div className="flex items-center gap-2 text-sm">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium bg-muted"
                style={{ borderLeft: `3px solid ${condition.leftOperand?.color || indicatorColor}` }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: condition.leftOperand?.color || indicatorColor }}
                />
                {condition.patternDisplayName || condition.leftOperand?.label}
              </span>
              <span className="text-muted-foreground">{getOperatorLabel(condition.operator)}</span>
            </div>
          ) : (
            <>
              {/* Left Operand */}
              <ConditionDropdown
                value={condition.leftOperand}
                options={operandOptions}
                onChange={handleLeftOperandChange}
                placeholder="Select..."
                className="min-w-[120px] flex-1"
              />

              {/* Operator */}
              <ConditionDropdown
                value={currentOperator}
                options={operatorOptions}
                onChange={handleOperatorChange}
                placeholder="operator"
                className="min-w-[100px]"
              />

              {/* Right Operand */}
              <ConditionDropdown
                value={condition.rightOperand}
                options={operandOptions}
                onChange={handleRightOperandChange}
                placeholder="Select..."
                className="min-w-[120px] flex-1"
              />
            </>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => onDelete(condition.id)}
        className={cn(
          "absolute -top-2 -right-2 p-1",
          "bg-destructive text-destructive-foreground rounded-full",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive/50",
          "shadow-sm"
        )}
        title="Remove condition"
        aria-label="Remove condition"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export default ConditionBlock;
