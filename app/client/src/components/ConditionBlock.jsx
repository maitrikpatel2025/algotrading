import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { X, GripVertical, AlertTriangle } from 'lucide-react';
import ConditionDropdown from './ConditionDropdown';
import {
  OPERATORS,
  buildOperandOptions,
  getOperatorLabel,
  formatNaturalLanguageCondition,
  validateCondition,
  isRangeCondition,
  getOperandBounds,
  validateNumericBounds,
} from '../app/conditionDefaults';
import { INDICATORS } from '../app/indicators';

/**
 * ConditionBlock Component
 *
 * Displays a single trading condition with dropdowns for left operand,
 * operator, and right operand. Supports drag-and-drop for reordering
 * and hover highlighting for visual connection to chart indicators.
 *
 * @param {Object} condition - The condition data object
 * @param {Array} activeIndicators - List of active indicators on the chart
 * @param {Array} activePatterns - List of active patterns on the chart
 * @param {Function} getIndicatorDisplayName - Function to get indicator display name
 * @param {Function} onUpdate - Callback when condition is updated
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {Function} onHover - Callback when hovering over the block
 * @param {boolean} isHighlighted - Whether the block should be highlighted
 * @param {string} indicatorColor - The color of the associated indicator
 * @param {boolean} isInGroup - Whether the condition is inside a group
 * @param {string} groupOperator - The group operator (and/or) for visual connector
 */
function ConditionBlock({
  condition,
  activeIndicators,
  activePatterns = [],
  getIndicatorDisplayName,
  onUpdate,
  onDelete,
  onHover,
  isHighlighted,
  indicatorColor,
  isInGroup = false,
  groupOperator = null,
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

  // Build operand options for dropdowns - left operand includes Indicator Values group
  const leftOperandOptions = useMemo(() =>
    buildOperandOptions(activeIndicators, getIndicatorDisplayName, { isLeftOperand: true, includePercentage: false }),
    [activeIndicators, getIndicatorDisplayName]
  );

  // Right operand options (standard)
  const rightOperandOptions = useMemo(() =>
    buildOperandOptions(activeIndicators, getIndicatorDisplayName, { isLeftOperand: false, includePercentage: true }),
    [activeIndicators, getIndicatorDisplayName]
  );

  // Get indicator bounds for the left operand (if it's an indicator)
  const leftOperandBounds = useMemo(() =>
    getOperandBounds(condition.leftOperand, activeIndicators, INDICATORS),
    [condition.leftOperand, activeIndicators]
  );

  // Validate right operand numeric bounds
  const rightOperandBoundsValidation = useMemo(() => {
    if (!condition.rightOperand || condition.rightOperand.type !== 'value') {
      return null;
    }
    return validateNumericBounds(condition.rightOperand.value, leftOperandBounds);
  }, [condition.rightOperand, leftOperandBounds]);

  // Validate right operand max (for range conditions) numeric bounds
  const rightOperandMaxBoundsValidation = useMemo(() => {
    if (!condition.rightOperandMax || condition.rightOperandMax.type !== 'value') {
      return null;
    }
    return validateNumericBounds(condition.rightOperandMax.value, leftOperandBounds);
  }, [condition.rightOperandMax, leftOperandBounds]);

  // Check if this is a range condition
  const isRange = isRangeCondition(condition);

  // Keep backwards compatibility
  const operandOptions = rightOperandOptions;

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

  // Handler for range condition max value
  const handleRightOperandMaxChange = useCallback((newValue) => {
    onUpdate({
      ...condition,
      rightOperandMax: newValue,
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

  // Validate the condition using the comprehensive validation function
  const validation = validateCondition(condition, activeIndicators, activePatterns);
  const hasValidIndicator = validation.isValid;
  const validationErrorMessage = validation.errorMessage;

  // Generate natural language preview
  const naturalLanguagePreview = formatNaturalLanguageCondition(condition);

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
        isNew && "animate-slide-in-right",
        isInGroup && "bg-muted/20 border-dashed"
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
        {/* Warning for invalid condition */}
        {!hasValidIndicator && (
          <div
            className="flex items-center gap-2 text-amber-500 text-xs mb-2"
            title={validationErrorMessage || 'Condition is invalid'}
          >
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{validationErrorMessage || 'Condition is invalid'}</span>
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
              {/* Left Operand - uses leftOperandOptions which includes Indicator Values group */}
              <ConditionDropdown
                value={condition.leftOperand}
                options={leftOperandOptions}
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

              {/* Range Condition: shows two value inputs */}
              {isRange ? (
                <>
                  {/* Min Value */}
                  <ConditionDropdown
                    value={condition.rightOperand}
                    options={operandOptions}
                    onChange={handleRightOperandChange}
                    placeholder="Min..."
                    className="min-w-[90px] flex-1"
                    showPercentageToggle={!!leftOperandBounds}
                    boundsValidation={rightOperandBoundsValidation}
                  />
                  <span className="text-muted-foreground text-sm">and</span>
                  {/* Max Value */}
                  <ConditionDropdown
                    value={condition.rightOperandMax}
                    options={operandOptions}
                    onChange={handleRightOperandMaxChange}
                    placeholder="Max..."
                    className="min-w-[90px] flex-1"
                    showPercentageToggle={!!leftOperandBounds}
                    boundsValidation={rightOperandMaxBoundsValidation}
                  />
                </>
              ) : (
                /* Standard Right Operand */
                <ConditionDropdown
                  value={condition.rightOperand}
                  options={operandOptions}
                  onChange={handleRightOperandChange}
                  placeholder="Select..."
                  className="min-w-[120px] flex-1"
                  showPercentageToggle={!!leftOperandBounds}
                  boundsValidation={rightOperandBoundsValidation}
                />
              )}
            </>
          )}
        </div>

        {/* Bounds Validation Warning */}
        {(rightOperandBoundsValidation?.isOutOfBounds || rightOperandMaxBoundsValidation?.isOutOfBounds) && (
          <div className="mt-2 flex items-center gap-1.5 text-amber-600 text-xs">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            <span>
              {rightOperandBoundsValidation?.warningMessage || rightOperandMaxBoundsValidation?.warningMessage}
              {leftOperandBounds && ` (${leftOperandBounds.min !== null ? `min: ${leftOperandBounds.min}` : ''}${leftOperandBounds.min !== null && leftOperandBounds.max !== null ? ', ' : ''}${leftOperandBounds.max !== null ? `max: ${leftOperandBounds.max}` : ''})`}
            </span>
          </div>
        )}

        {/* Natural Language Preview */}
        {naturalLanguagePreview && !condition.isPatternCondition && (
          <div className="mt-2 text-xs text-muted-foreground italic">
            {naturalLanguagePreview}
          </div>
        )}
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
