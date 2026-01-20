/**
 * Condition Defaults Configuration
 *
 * Defines comparison operators, price sources, and condition templates
 * for the Logic Panel's trading condition system.
 * Also includes group-related functions for AND/OR logic.
 */

import { GROUP_OPERATORS, MAX_NESTING_DEPTH } from './constants';

/**
 * Comparison operators for conditions
 */
export const OPERATORS = [
  { id: 'crosses_above', label: 'crosses above', description: 'Value crosses from below to above' },
  { id: 'crosses_below', label: 'crosses below', description: 'Value crosses from above to below' },
  { id: 'is_above', label: 'is above', description: 'Value is greater than' },
  { id: 'is_below', label: 'is below', description: 'Value is less than' },
  { id: 'is_greater_or_equal', label: 'is greater or equal', description: 'Value is greater than or equal to (>=)' },
  { id: 'is_less_or_equal', label: 'is less or equal', description: 'Value is less than or equal to (<=)' },
  { id: 'equals', label: 'equals', description: 'Value is equal to' },
  { id: 'is_between', label: 'is between', description: 'Value is within a range (inclusive)' },
  { id: 'is_detected', label: 'is detected', description: 'Pattern is detected on the chart' },
];

/**
 * Price source options for conditions
 */
export const PRICE_SOURCES = [
  { id: 'close', label: 'Close Price', description: 'Closing price of the candle' },
  { id: 'open', label: 'Open Price', description: 'Opening price of the candle' },
  { id: 'high', label: 'High Price', description: 'Highest price of the candle' },
  { id: 'low', label: 'Low Price', description: 'Lowest price of the candle' },
];

/**
 * Condition section types (legacy - for backward compatibility)
 */
export const CONDITION_SECTIONS = {
  ENTRY: 'entry',
  EXIT: 'exit',
};

/**
 * Condition section types V2 (four sections)
 */
export const CONDITION_SECTIONS_V2 = {
  LONG_ENTRY: 'long_entry',
  LONG_EXIT: 'long_exit',
  SHORT_ENTRY: 'short_entry',
  SHORT_EXIT: 'short_exit',
};

/**
 * Check if a section is valid (V2)
 * @param {string} section - The section to validate
 * @returns {boolean} Whether the section is valid
 */
export function isValidSectionV2(section) {
  return Object.values(CONDITION_SECTIONS_V2).includes(section);
}

/**
 * Migrate legacy section to V2 section
 * Legacy 'entry' -> 'long_entry', 'exit' -> 'long_exit'
 * @param {string} section - The section to migrate
 * @returns {string} The migrated section
 */
export function migrateSectionToV2(section) {
  if (section === CONDITION_SECTIONS.ENTRY) {
    return CONDITION_SECTIONS_V2.LONG_ENTRY;
  }
  if (section === CONDITION_SECTIONS.EXIT) {
    return CONDITION_SECTIONS_V2.LONG_EXIT;
  }
  // If already V2 or unknown, return as-is
  return section;
}

/**
 * Get the default section based on trade direction
 * @param {string} tradeDirection - 'long', 'short', or 'both'
 * @param {string} type - 'entry' or 'exit'
 * @returns {string} The appropriate V2 section
 */
export function getDefaultSection(tradeDirection, type = 'entry') {
  if (tradeDirection === 'long') {
    return type === 'entry' ? CONDITION_SECTIONS_V2.LONG_ENTRY : CONDITION_SECTIONS_V2.LONG_EXIT;
  }
  if (tradeDirection === 'short') {
    return type === 'entry' ? CONDITION_SECTIONS_V2.SHORT_ENTRY : CONDITION_SECTIONS_V2.SHORT_EXIT;
  }
  // For 'both', default to long entry/exit
  return type === 'entry' ? CONDITION_SECTIONS_V2.LONG_ENTRY : CONDITION_SECTIONS_V2.LONG_EXIT;
}

/**
 * Generate a unique condition ID
 * @returns {string} Unique condition ID
 */
export function generateConditionId() {
  return `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a condition from an indicator's default template
 * @param {Object} indicatorInstance - The indicator instance from activeIndicators
 * @param {string} displayName - The indicator display name (e.g., "EMA (50)")
 * @param {string} section - Optional section override (V2 format: 'long_entry', 'long_exit', 'short_entry', 'short_exit')
 * @returns {Object} A new condition object
 */
export function createConditionFromIndicator(indicatorInstance, displayName, section = null) {
  const template = indicatorInstance.defaultConditionTemplate;

  // Determine section - use V2 format, migrate legacy if needed
  let resolvedSection = section;
  if (!resolvedSection) {
    resolvedSection = template?.section || CONDITION_SECTIONS.ENTRY;
  }
  // Migrate legacy sections to V2
  resolvedSection = migrateSectionToV2(resolvedSection);

  if (!template) {
    // Fallback for indicators without a template
    return {
      id: generateConditionId(),
      indicatorInstanceId: indicatorInstance.instanceId,
      leftOperand: {
        type: 'price',
        value: 'close',
        label: 'Close Price',
      },
      operator: 'crosses_above',
      rightOperand: {
        type: 'indicator',
        instanceId: indicatorInstance.instanceId,
        component: null,
        label: displayName,
      },
      section: resolvedSection,
      isNew: true, // Flag for animation
    };
  }

  // Parse the template's leftOperand
  let leftOperand;
  if (template.leftOperand === 'close' || template.leftOperand === 'open' ||
      template.leftOperand === 'high' || template.leftOperand === 'low') {
    const priceSource = PRICE_SOURCES.find(p => p.id === template.leftOperand);
    leftOperand = {
      type: 'price',
      value: template.leftOperand,
      label: priceSource ? priceSource.label : template.leftOperand,
    };
  } else if (template.leftOperand === 'indicator') {
    leftOperand = {
      type: 'indicator',
      instanceId: indicatorInstance.instanceId,
      component: null,
      label: displayName,
    };
  } else if (template.leftOperand.startsWith('indicator:')) {
    const component = template.leftOperand.replace('indicator:', '');
    leftOperand = {
      type: 'indicator',
      instanceId: indicatorInstance.instanceId,
      component: component,
      label: `${displayName} ${component}`,
    };
  } else {
    // Default fallback
    leftOperand = {
      type: 'price',
      value: 'close',
      label: 'Close Price',
    };
  }

  // Parse the template's rightOperand
  let rightOperand;
  if (template.rightOperand === 'indicator') {
    rightOperand = {
      type: 'indicator',
      instanceId: indicatorInstance.instanceId,
      component: null,
      label: displayName,
    };
  } else if (template.rightOperand.startsWith('indicator:')) {
    const component = template.rightOperand.replace('indicator:', '');
    rightOperand = {
      type: 'indicator',
      instanceId: indicatorInstance.instanceId,
      component: component,
      label: `${displayName} ${component}`,
    };
  } else if (template.rightOperand.startsWith('value:')) {
    const value = parseFloat(template.rightOperand.replace('value:', ''));
    rightOperand = {
      type: 'value',
      value: value,
      label: String(value),
    };
  } else {
    // Default fallback
    rightOperand = {
      type: 'indicator',
      instanceId: indicatorInstance.instanceId,
      component: null,
      label: displayName,
    };
  }

  return {
    id: generateConditionId(),
    indicatorInstanceId: indicatorInstance.instanceId,
    leftOperand,
    operator: template.operator,
    rightOperand,
    section: resolvedSection,
    isNew: true, // Flag for animation
  };
}

/**
 * Create a condition from a pattern's detection
 * @param {Object} patternInstance - The pattern instance with id, name, instanceId, detectedCount
 * @param {string} section - Optional section override (V2 format: 'long_entry', 'long_exit', 'short_entry', 'short_exit')
 * @returns {Object} A new condition object
 */
export function createConditionFromPattern(patternInstance, section = null) {
  // Determine section - use V2 format, migrate legacy if needed
  let resolvedSection = section || CONDITION_SECTIONS.ENTRY;
  resolvedSection = migrateSectionToV2(resolvedSection);

  return {
    id: generateConditionId(),
    patternInstanceId: patternInstance.instanceId,
    isPatternCondition: true,
    leftOperand: {
      type: 'pattern',
      instanceId: patternInstance.instanceId,
      label: patternInstance.name,
      patternType: patternInstance.patternType,
      color: patternInstance.color,
    },
    operator: 'is_detected',
    rightOperand: null, // Pattern conditions don't have a right operand
    section: resolvedSection,
    isNew: true, // Flag for animation
    patternDisplayName: patternInstance.name,
  };
}

/**
 * Get the display text for an operator
 * @param {string} operatorId - The operator ID
 * @returns {string} The operator label
 */
export function getOperatorLabel(operatorId) {
  const operator = OPERATORS.find(op => op.id === operatorId);
  return operator ? operator.label : operatorId;
}

/**
 * Get the display text for a price source
 * @param {string} priceSourceId - The price source ID
 * @returns {string} The price source label
 */
export function getPriceSourceLabel(priceSourceId) {
  const source = PRICE_SOURCES.find(s => s.id === priceSourceId);
  return source ? source.label : priceSourceId;
}

/**
 * Build dropdown options for a condition operand
 * @param {Array} activeIndicators - List of active indicators on the chart
 * @param {Function} getDisplayName - Function to get indicator display name
 * @param {Object} options - Optional configuration
 * @param {boolean} options.isLeftOperand - Whether this is for the left operand (includes Indicator Values group)
 * @param {boolean} options.includePercentage - Whether to include percentage value option
 * @returns {Array} Grouped options for dropdown
 */
export function buildOperandOptions(activeIndicators, getDisplayName, { isLeftOperand = false, includePercentage = false } = {}) {
  const options = [];

  // Price sources group
  options.push({
    group: 'Price',
    options: PRICE_SOURCES.map(source => ({
      type: 'price',
      value: source.id,
      label: source.label,
      description: source.description,
    })),
  });

  // Indicator Values group (only for left operand - allows indicator as the primary subject)
  if (isLeftOperand && activeIndicators.length > 0) {
    const indicatorValueOptions = [];

    activeIndicators.forEach(indicator => {
      const displayName = getDisplayName(indicator);

      if (indicator.components && indicator.components.length > 0) {
        // Multi-component indicator: add each component as an option
        indicator.components.forEach(component => {
          indicatorValueOptions.push({
            type: 'indicator',
            instanceId: indicator.instanceId,
            component: component,
            label: `${displayName} ${component}`,
            color: indicator.color,
            indicatorId: indicator.id,
            isIndicatorValue: true, // Flag to distinguish from right-operand indicators
          });
        });
      } else {
        // Single-component indicator
        indicatorValueOptions.push({
          type: 'indicator',
          instanceId: indicator.instanceId,
          component: null,
          label: displayName,
          color: indicator.color,
          indicatorId: indicator.id,
          isIndicatorValue: true,
        });
      }
    });

    if (indicatorValueOptions.length > 0) {
      options.push({
        group: 'Indicator Values',
        options: indicatorValueOptions,
      });
    }
  }

  // Indicators group (for comparison - used primarily for right operand)
  if (activeIndicators.length > 0) {
    const indicatorOptions = [];

    activeIndicators.forEach(indicator => {
      const displayName = getDisplayName(indicator);

      if (indicator.components && indicator.components.length > 0) {
        // Multi-component indicator: add each component as an option
        indicator.components.forEach(component => {
          indicatorOptions.push({
            type: 'indicator',
            instanceId: indicator.instanceId,
            component: component,
            label: `${displayName} ${component}`,
            color: indicator.color,
            indicatorId: indicator.id,
          });
        });
      } else {
        // Single-component indicator
        indicatorOptions.push({
          type: 'indicator',
          instanceId: indicator.instanceId,
          component: null,
          label: displayName,
          color: indicator.color,
          indicatorId: indicator.id,
        });
      }
    });

    if (indicatorOptions.length > 0) {
      options.push({
        group: 'Indicators',
        options: indicatorOptions,
      });
    }
  }

  // Numeric value options (for thresholds)
  const valueOptions = [
    {
      type: 'value',
      value: 0,
      label: 'Custom Value',
      description: 'Enter a numeric threshold',
      isCustom: true,
    },
  ];

  // Add percentage option if enabled
  if (includePercentage) {
    valueOptions.push({
      type: 'percentage',
      value: 0,
      label: 'Percentage Value',
      description: 'Enter a percentage (0-100%)',
      isCustom: true,
      isPercentage: true,
    });
  }

  options.push({
    group: 'Values',
    options: valueOptions,
  });

  return options;
}

/**
 * Format condition as human-readable string
 * @param {Object} condition - The condition object
 * @returns {string} Human-readable condition string
 */
export function formatConditionString(condition) {
  const leftLabel = condition.leftOperand.label;
  const operatorLabel = getOperatorLabel(condition.operator);
  const rightLabel = condition.rightOperand.label;
  return `${leftLabel} ${operatorLabel} ${rightLabel}`;
}

/**
 * Format condition as natural language preview
 * Returns a human-readable string like "When Close Price crosses above EMA (50)"
 * @param {Object} condition - The condition object
 * @returns {string|null} Natural language preview string, or null if condition is incomplete
 */
export function formatNaturalLanguageCondition(condition) {
  if (!condition || !condition.leftOperand) {
    return null;
  }

  const leftOperand = condition.leftOperand;
  const operator = condition.operator;
  const rightOperand = condition.rightOperand;

  // Get the left operand label
  const leftLabel = leftOperand.label || getOperandLabel(leftOperand);
  if (!leftLabel) {
    return null;
  }

  // Get the operator label
  const operatorLabel = getOperatorLabel(operator);
  if (!operatorLabel) {
    return null;
  }

  // Handle pattern conditions (no right operand)
  if (leftOperand.type === 'pattern' || operator === 'is_detected') {
    return `When ${leftLabel} ${operatorLabel}`;
  }

  // Handle range conditions (is_between operator with two values)
  if (operator === 'is_between') {
    const minValue = rightOperand?.value;
    const maxValue = condition.rightOperandMax?.value;

    if (minValue === undefined || minValue === null) {
      return `When ${leftLabel} ${operatorLabel} ... and ...`;
    }
    if (maxValue === undefined || maxValue === null) {
      return `When ${leftLabel} ${operatorLabel} ${minValue} and ...`;
    }

    // Format percentage values if applicable
    const minLabel = rightOperand?.isPercentage ? `${minValue}%` : String(minValue);
    const maxLabel = condition.rightOperandMax?.isPercentage ? `${maxValue}%` : String(maxValue);

    return `When ${leftLabel} ${operatorLabel} ${minLabel} and ${maxLabel}`;
  }

  // For non-pattern conditions, we need a right operand
  if (!rightOperand) {
    // Return partial preview with placeholder
    return `When ${leftLabel} ${operatorLabel} ...`;
  }

  // Get the right operand label
  let rightLabel = rightOperand.label || getOperandLabel(rightOperand);
  if (!rightLabel) {
    return `When ${leftLabel} ${operatorLabel} ...`;
  }

  // Format percentage values
  if (rightOperand.isPercentage) {
    rightLabel = `${rightOperand.value}%`;
  }

  return `When ${leftLabel} ${operatorLabel} ${rightLabel}`;
}

/**
 * Get a display label for an operand
 * Helper function for formatNaturalLanguageCondition
 * @param {Object} operand - The operand object
 * @returns {string|null} The operand label
 */
function getOperandLabel(operand) {
  if (!operand) {
    return null;
  }

  // If the operand has a label, use it
  if (operand.label) {
    return operand.label;
  }

  // Price type
  if (operand.type === 'price') {
    return getPriceSourceLabel(operand.value);
  }

  // Value type (numeric threshold)
  if (operand.type === 'value') {
    return String(operand.value);
  }

  // Indicator type
  if (operand.type === 'indicator') {
    // If no label is set, we can't generate one without context
    return operand.component ? operand.component : null;
  }

  // Pattern type
  if (operand.type === 'pattern') {
    return operand.label || 'Pattern';
  }

  return null;
}

/**
 * Validate if an operand references a valid indicator on the chart
 * @param {Object} operand - The operand to validate
 * @param {Array} activeIndicators - List of active indicators on the chart
 * @returns {Object} Validation result { isValid: boolean, errorMessage: string|null }
 */
export function validateOperandIndicator(operand, activeIndicators) {
  if (!operand) {
    return { isValid: true, errorMessage: null };
  }

  // Price and value operands are always valid
  if (operand.type === 'price' || operand.type === 'value') {
    return { isValid: true, errorMessage: null };
  }

  // Indicator operands need to reference an existing indicator
  if (operand.type === 'indicator') {
    const indicatorExists = activeIndicators.some(
      ind => ind.instanceId === operand.instanceId
    );
    if (!indicatorExists) {
      return {
        isValid: false,
        errorMessage: 'The referenced indicator has been removed from the chart',
      };
    }
  }

  // Pattern operands - check if pattern still exists (handled separately)
  if (operand.type === 'pattern') {
    // Pattern validation is handled by the pattern system
    return { isValid: true, errorMessage: null };
  }

  return { isValid: true, errorMessage: null };
}

/**
 * Validate a complete condition
 * @param {Object} condition - The condition to validate
 * @param {Array} activeIndicators - List of active indicators on the chart
 * @param {Array} activePatterns - List of active patterns on the chart (optional)
 * @returns {Object} Validation result { isValid: boolean, errorMessage: string|null, invalidOperand: 'left'|'right'|null }
 */
export function validateCondition(condition, activeIndicators, activePatterns = []) {
  if (!condition) {
    return { isValid: false, errorMessage: 'Condition is undefined', invalidOperand: null };
  }

  // Pattern conditions
  if (condition.isPatternCondition || condition.leftOperand?.type === 'pattern') {
    const patternExists = activePatterns.some(
      p => p.instanceId === condition.patternInstanceId || p.instanceId === condition.leftOperand?.instanceId
    );
    if (!patternExists) {
      return {
        isValid: false,
        errorMessage: 'The referenced pattern has been removed from the chart',
        invalidOperand: 'left',
      };
    }
    return { isValid: true, errorMessage: null, invalidOperand: null };
  }

  // Validate left operand
  const leftValidation = validateOperandIndicator(condition.leftOperand, activeIndicators);
  if (!leftValidation.isValid) {
    return {
      isValid: false,
      errorMessage: leftValidation.errorMessage,
      invalidOperand: 'left',
    };
  }

  // Validate right operand (if present)
  if (condition.rightOperand) {
    const rightValidation = validateOperandIndicator(condition.rightOperand, activeIndicators);
    if (!rightValidation.isValid) {
      return {
        isValid: false,
        errorMessage: rightValidation.errorMessage,
        invalidOperand: 'right',
      };
    }
  }

  return { isValid: true, errorMessage: null, invalidOperand: null };
}

/**
 * Create a new standalone condition (not linked to an indicator)
 * @param {string} section - The section for the condition (V2 format)
 * @returns {Object} A new standalone condition object
 */
export function createStandaloneCondition(section = CONDITION_SECTIONS_V2.LONG_ENTRY) {
  // Ensure section is V2 format
  const resolvedSection = migrateSectionToV2(section);

  return {
    id: generateConditionId(),
    indicatorInstanceId: null, // Standalone condition - not linked to an indicator
    leftOperand: {
      type: 'price',
      value: 'close',
      label: 'Close Price',
    },
    operator: 'crosses_above',
    rightOperand: null, // User will select this
    section: resolvedSection,
    isNew: true, // Flag for animation
  };
}

/**
 * Check if a condition is a range condition (uses 'is_between' operator)
 * @param {Object} condition - The condition to check
 * @returns {boolean} True if the condition is a range condition
 */
export function isRangeCondition(condition) {
  return condition?.operator === 'is_between';
}

/**
 * Create an indicator-based condition where the left operand is an indicator value
 * @param {Object} indicatorInstance - The indicator instance from activeIndicators
 * @param {string} displayName - The indicator display name (e.g., "RSI (14)")
 * @param {string} component - Optional component name for multi-component indicators
 * @param {string} section - Optional section override (V2 format)
 * @returns {Object} A new condition object with indicator as left operand
 */
export function createIndicatorCondition(indicatorInstance, displayName, component = null, section = null) {
  // Determine section - use V2 format, migrate legacy if needed
  let resolvedSection = section;
  if (!resolvedSection) {
    resolvedSection = CONDITION_SECTIONS_V2.LONG_ENTRY;
  }
  resolvedSection = migrateSectionToV2(resolvedSection);

  const leftOperand = {
    type: 'indicator',
    instanceId: indicatorInstance.instanceId,
    component: component,
    label: component ? `${displayName} ${component}` : displayName,
    color: indicatorInstance.color,
    indicatorId: indicatorInstance.id,
  };

  return {
    id: generateConditionId(),
    indicatorInstanceId: indicatorInstance.instanceId,
    leftOperand,
    operator: 'is_above',
    rightOperand: null, // User will select this
    section: resolvedSection,
    isNew: true, // Flag for animation
  };
}

/**
 * Create a range condition with 'is_between' operator
 * @param {Object} leftOperand - The left operand (indicator or price)
 * @param {number} minValue - The minimum value of the range
 * @param {number} maxValue - The maximum value of the range
 * @param {string} section - Optional section override (V2 format)
 * @returns {Object} A new range condition object
 */
export function createRangeCondition(leftOperand, minValue, maxValue, section = null) {
  // Determine section - use V2 format, migrate legacy if needed
  let resolvedSection = section;
  if (!resolvedSection) {
    resolvedSection = CONDITION_SECTIONS_V2.LONG_ENTRY;
  }
  resolvedSection = migrateSectionToV2(resolvedSection);

  return {
    id: generateConditionId(),
    indicatorInstanceId: leftOperand.instanceId || null,
    leftOperand,
    operator: 'is_between',
    rightOperand: {
      type: 'value',
      value: minValue,
      label: String(minValue),
    },
    rightOperandMax: {
      type: 'value',
      value: maxValue,
      label: String(maxValue),
    },
    section: resolvedSection,
    isNew: true, // Flag for animation
  };
}

/**
 * Get the numeric bounds for an indicator based on its ID
 * @param {string} indicatorId - The indicator ID (e.g., 'rsi', 'stochastic')
 * @param {Array} indicators - Array of indicator definitions (from INDICATORS)
 * @returns {Object|null} The numeric bounds object { min, max, commonThresholds } or null if not found
 */
export function getIndicatorBounds(indicatorId, indicators) {
  if (!indicatorId || !indicators) {
    return null;
  }
  const indicator = indicators.find(ind => ind.id === indicatorId);
  return indicator?.numericBounds || null;
}

/**
 * Validate a numeric value against indicator bounds
 * @param {number} value - The value to validate
 * @param {Object} bounds - The bounds object { min, max, commonThresholds }
 * @returns {Object} Validation result { isValid: boolean, isOutOfBounds: boolean, warningMessage: string|null, boundsDescription: string|null }
 */
export function validateNumericBounds(value, bounds) {
  // No bounds to validate against
  if (!bounds || (bounds.min === null && bounds.max === null)) {
    return {
      isValid: true,
      isOutOfBounds: false,
      warningMessage: null,
      boundsDescription: null,
    };
  }

  const { min, max } = bounds;
  let boundsDescription = null;

  if (min !== null && max !== null) {
    boundsDescription = `Valid range: ${min} to ${max}`;
  } else if (min !== null) {
    boundsDescription = `Minimum value: ${min}`;
  } else if (max !== null) {
    boundsDescription = `Maximum value: ${max}`;
  }

  // Check if value is outside absolute bounds
  const belowMin = min !== null && value < min;
  const aboveMax = max !== null && value > max;
  const isOutOfBounds = belowMin || aboveMax;

  if (isOutOfBounds) {
    let warningMessage;
    if (belowMin) {
      warningMessage = `Value ${value} is below the minimum (${min})`;
    } else {
      warningMessage = `Value ${value} is above the maximum (${max})`;
    }

    return {
      isValid: false,
      isOutOfBounds: true,
      warningMessage,
      boundsDescription,
    };
  }

  return {
    isValid: true,
    isOutOfBounds: false,
    warningMessage: null,
    boundsDescription,
  };
}

/**
 * Get indicator bounds from an operand
 * @param {Object} operand - The operand to get bounds for
 * @param {Array} activeIndicators - List of active indicators
 * @param {Array} indicatorDefinitions - Array of indicator definitions (INDICATORS)
 * @returns {Object|null} The numeric bounds or null
 */
export function getOperandBounds(operand, activeIndicators, indicatorDefinitions) {
  if (!operand || operand.type !== 'indicator') {
    return null;
  }

  // Find the indicator instance
  const indicatorInstance = activeIndicators.find(
    ind => ind.instanceId === operand.instanceId
  );
  if (!indicatorInstance) {
    return null;
  }

  // Get the indicator ID and look up bounds
  const indicatorId = operand.indicatorId || indicatorInstance.id;
  return getIndicatorBounds(indicatorId, indicatorDefinitions);
}

// =============================================================================
// GROUP FUNCTIONS - AND/OR Logic Support
// =============================================================================

/**
 * Generate a unique group ID
 * @returns {string} Unique group ID
 */
export function generateGroupId() {
  return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a condition group with AND/OR operator
 * @param {string} operator - 'and' or 'or'
 * @param {string} section - The section for this group (V2 format)
 * @param {Array<string>} conditionIds - Array of condition IDs to include in the group
 * @param {string|null} parentGroupId - ID of parent group for nested groups
 * @returns {Object} A new condition group object
 */
export function createConditionGroup(operator = GROUP_OPERATORS.AND, section, conditionIds = [], parentGroupId = null) {
  const resolvedSection = migrateSectionToV2(section);

  return {
    id: generateGroupId(),
    type: 'group',
    operator: operator,
    conditionIds: [...conditionIds], // Array of condition IDs in this group
    section: resolvedSection,
    parentGroupId: parentGroupId,
    createdAt: Date.now(),
  };
}

/**
 * Check if an item is a condition group
 * @param {Object} item - The item to check
 * @returns {boolean} True if the item is a group
 */
export function isConditionGroup(item) {
  return item && item.type === 'group' && item.id && item.id.startsWith('group-');
}

/**
 * Get the depth of a group in the nesting hierarchy
 * @param {string} groupId - The group ID to check
 * @param {Array} groups - All groups in the system
 * @returns {number} The nesting depth (0 = root level)
 */
export function getGroupDepth(groupId, groups) {
  if (!groupId || !groups || groups.length === 0) {
    return 0;
  }

  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return 0;
  }

  if (!group.parentGroupId) {
    return 0;
  }

  return 1 + getGroupDepth(group.parentGroupId, groups);
}

/**
 * Check if a new subgroup can be added to a group (respects MAX_NESTING_DEPTH)
 * @param {string} groupId - The parent group ID
 * @param {Array} groups - All groups in the system
 * @returns {boolean} True if adding a subgroup is allowed
 */
export function canAddToGroup(groupId, groups) {
  const currentDepth = getGroupDepth(groupId, groups);
  return currentDepth < MAX_NESTING_DEPTH - 1;
}

/**
 * Validate the integrity of the group structure
 * @param {Array} groups - All groups to validate
 * @param {Array} conditions - All conditions to validate against
 * @returns {Object} Validation result { isValid: boolean, errors: string[] }
 */
export function validateGroupStructure(groups, conditions) {
  const errors = [];
  const conditionIdSet = new Set(conditions.map(c => c.id));
  const groupIdSet = new Set(groups.map(g => g.id));

  groups.forEach(group => {
    // Check for invalid condition references
    group.conditionIds.forEach(condId => {
      if (!conditionIdSet.has(condId) && !groupIdSet.has(condId)) {
        errors.push(`Group ${group.id} references non-existent condition/group: ${condId}`);
      }
    });

    // Check for invalid parent reference
    if (group.parentGroupId && !groupIdSet.has(group.parentGroupId)) {
      errors.push(`Group ${group.id} references non-existent parent: ${group.parentGroupId}`);
    }

    // Check for circular references
    if (group.parentGroupId) {
      const visited = new Set([group.id]);
      let parentId = group.parentGroupId;
      let hasCircular = false;

      // Use a max iteration count to prevent infinite loops
      for (let i = 0; i < groups.length && parentId; i++) {
        if (visited.has(parentId)) {
          hasCircular = true;
          break;
        }
        visited.add(parentId);
        const parentGroup = groups.find(g => g.id === parentId);
        parentId = parentGroup?.parentGroupId;
      }

      if (hasCircular) {
        errors.push(`Circular reference detected in group ${group.id}`);
      }
    }

    // Check for exceeding max depth
    const depth = getGroupDepth(group.id, groups);
    if (depth >= MAX_NESTING_DEPTH) {
      errors.push(`Group ${group.id} exceeds maximum nesting depth of ${MAX_NESTING_DEPTH}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Extract all condition IDs from a group, including nested groups
 * @param {Object} group - The group to flatten
 * @param {Array} groups - All groups (for resolving nested groups)
 * @returns {Array<string>} Array of condition IDs
 */
export function flattenGroupToConditions(group, groups) {
  if (!group || !group.conditionIds) {
    return [];
  }

  const result = [];
  group.conditionIds.forEach(itemId => {
    const nestedGroup = groups.find(g => g.id === itemId);
    if (nestedGroup) {
      result.push(...flattenGroupToConditions(nestedGroup, groups));
    } else {
      result.push(itemId);
    }
  });

  return result;
}

/**
 * Build a logic tree structure for display
 * @param {Array} conditions - All conditions
 * @param {Array} groups - All groups
 * @param {string} section - The section to build tree for
 * @returns {Object} Tree structure for rendering
 */
export function buildLogicTree(conditions, groups, section) {
  const sectionConditions = conditions.filter(c => migrateSectionToV2(c.section) === section);
  const sectionGroups = groups.filter(g => g.section === section && !g.parentGroupId);

  // Get IDs of conditions that are in groups
  const groupedConditionIds = new Set();
  groups.forEach(group => {
    group.conditionIds.forEach(id => groupedConditionIds.add(id));
  });

  // Ungrouped conditions (root level)
  const ungroupedConditions = sectionConditions.filter(c => !groupedConditionIds.has(c.id));

  // Build tree structure
  const buildGroupNode = (group) => {
    const children = group.conditionIds.map(itemId => {
      const nestedGroup = groups.find(g => g.id === itemId);
      if (nestedGroup) {
        return buildGroupNode(nestedGroup);
      }
      const condition = conditions.find(c => c.id === itemId);
      return condition ? { type: 'condition', data: condition } : null;
    }).filter(Boolean);

    return {
      type: 'group',
      data: group,
      operator: group.operator,
      children,
    };
  };

  const rootNodes = [
    ...sectionGroups.map(buildGroupNode),
    ...ungroupedConditions.map(c => ({ type: 'condition', data: c })),
  ];

  return {
    section,
    children: rootNodes,
  };
}

/**
 * Get conditions that belong to a specific group
 * @param {string} groupId - The group ID
 * @param {Array} groups - All groups
 * @param {Array} conditions - All conditions
 * @returns {Array} Conditions in the group
 */
export function getConditionsInGroup(groupId, groups, conditions) {
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return [];
  }

  return group.conditionIds
    .map(id => conditions.find(c => c.id === id))
    .filter(Boolean);
}

/**
 * Check if a condition is inside any group
 * @param {string} conditionId - The condition ID to check
 * @param {Array} groups - All groups
 * @returns {Object|null} The parent group if found, null otherwise
 */
export function getConditionParentGroup(conditionId, groups) {
  return groups.find(g => g.conditionIds.includes(conditionId)) || null;
}

/**
 * Remove a condition from its parent group
 * @param {string} conditionId - The condition ID to remove
 * @param {Array} groups - All groups (will be mutated)
 * @returns {Array} Updated groups array
 */
export function removeConditionFromGroup(conditionId, groups) {
  return groups.map(group => {
    if (group.conditionIds.includes(conditionId)) {
      return {
        ...group,
        conditionIds: group.conditionIds.filter(id => id !== conditionId),
      };
    }
    return group;
  });
}

/**
 * Add a condition to a group
 * @param {string} conditionId - The condition ID to add
 * @param {string} groupId - The target group ID
 * @param {Array} groups - All groups
 * @param {number} index - Optional index to insert at
 * @returns {Array} Updated groups array
 */
export function addConditionToGroup(conditionId, groupId, groups, index = -1) {
  return groups.map(group => {
    if (group.id === groupId) {
      const newConditionIds = [...group.conditionIds];
      if (index >= 0 && index < newConditionIds.length) {
        newConditionIds.splice(index, 0, conditionId);
      } else {
        newConditionIds.push(conditionId);
      }
      return {
        ...group,
        conditionIds: newConditionIds,
      };
    }
    return group;
  });
}

/**
 * Move a condition within a group to a new index
 * @param {string} conditionId - The condition ID to move
 * @param {string} groupId - The group ID
 * @param {number} newIndex - The new index
 * @param {Array} groups - All groups
 * @returns {Array} Updated groups array
 */
export function reorderConditionInGroup(conditionId, groupId, newIndex, groups) {
  return groups.map(group => {
    if (group.id === groupId) {
      const newConditionIds = [...group.conditionIds];
      const currentIndex = newConditionIds.indexOf(conditionId);
      if (currentIndex !== -1) {
        newConditionIds.splice(currentIndex, 1);
        newConditionIds.splice(newIndex, 0, conditionId);
      }
      return {
        ...group,
        conditionIds: newConditionIds,
      };
    }
    return group;
  });
}

// =============================================================================
// EVALUATION FUNCTIONS - Test Logic Support
// =============================================================================

/**
 * Get the current value for an operand
 * @param {Object} operand - The operand (price, indicator, value, pattern)
 * @param {Object} candleData - Current candle data { open, high, low, close, time }
 * @param {Object} indicatorValues - Map of indicator instanceId -> current value
 * @param {Object} patternDetections - Map of pattern instanceId -> boolean (detected)
 * @returns {number|boolean|null} The current value, or null if unavailable
 */
export function getOperandValue(operand, candleData, indicatorValues, patternDetections) {
  if (!operand) return null;

  switch (operand.type) {
    case 'price':
      if (!candleData) return null;
      switch (operand.value) {
        case 'open': return candleData.open;
        case 'high': return candleData.high;
        case 'low': return candleData.low;
        case 'close': return candleData.close;
        default: return candleData.close;
      }

    case 'indicator':
      if (!indicatorValues) return null;
      const instanceId = operand.instanceId;
      const component = operand.component;
      const indicatorData = indicatorValues[instanceId];
      if (!indicatorData) return null;
      if (component && typeof indicatorData === 'object') {
        return indicatorData[component] ?? null;
      }
      return typeof indicatorData === 'object' ? indicatorData.value : indicatorData;

    case 'value':
      return operand.value;

    case 'percentage':
      return operand.value;

    case 'pattern':
      if (!patternDetections) return null;
      return patternDetections[operand.instanceId] ?? false;

    default:
      return null;
  }
}

/**
 * Compare two values using the specified operator
 * @param {number} left - Left value
 * @param {string} operator - The operator ID
 * @param {number} right - Right value
 * @param {number} rightMax - Optional max value for 'is_between' operator
 * @param {Object} previousValues - Previous candle values for 'crosses' operators
 * @returns {boolean} The comparison result
 */
export function compareValues(left, operator, right, rightMax = null, previousValues = null) {
  if (left === null || left === undefined) return false;

  switch (operator) {
    case 'is_above':
      return right !== null && left > right;

    case 'is_below':
      return right !== null && left < right;

    case 'is_greater_or_equal':
      return right !== null && left >= right;

    case 'is_less_or_equal':
      return right !== null && left <= right;

    case 'equals':
      return right !== null && left === right;

    case 'is_between':
      return right !== null && rightMax !== null && left >= right && left <= rightMax;

    case 'crosses_above':
      if (!previousValues || right === null) return false;
      return previousValues.left <= right && left > right;

    case 'crosses_below':
      if (!previousValues || right === null) return false;
      return previousValues.left >= right && left < right;

    case 'is_detected':
      // For patterns, left should be a boolean
      return left === true;

    default:
      return false;
  }
}

/**
 * Evaluate a single condition against current data
 * @param {Object} condition - The condition to evaluate
 * @param {Object} candleData - Current candle data
 * @param {Object} indicatorValues - Map of indicator values
 * @param {Object} patternDetections - Map of pattern detections
 * @param {Object} previousCandleData - Previous candle data for crosses operators
 * @param {Object} previousIndicatorValues - Previous indicator values for crosses operators
 * @returns {Object} Evaluation result { result: boolean, leftValue, rightValue, details }
 */
export function evaluateCondition(
  condition,
  candleData,
  indicatorValues,
  patternDetections,
  previousCandleData = null,
  previousIndicatorValues = null
) {
  if (!condition) {
    return { result: false, error: 'No condition provided' };
  }

  // Handle pattern conditions
  if (condition.isPatternCondition || condition.leftOperand?.type === 'pattern') {
    const instanceId = condition.patternInstanceId || condition.leftOperand?.instanceId;
    const detected = patternDetections?.[instanceId] ?? false;
    return {
      result: detected,
      leftValue: detected,
      rightValue: null,
      details: {
        conditionId: condition.id,
        operator: 'is_detected',
        passed: detected,
      },
    };
  }

  // Get left operand value
  const leftValue = getOperandValue(condition.leftOperand, candleData, indicatorValues, patternDetections);

  // Get right operand value
  const rightValue = getOperandValue(condition.rightOperand, candleData, indicatorValues, patternDetections);

  // For range conditions, get max value too
  const rightMaxValue = condition.rightOperandMax
    ? getOperandValue(condition.rightOperandMax, candleData, indicatorValues, patternDetections)
    : null;

  // For crosses operators, get previous values
  let previousValues = null;
  if (condition.operator === 'crosses_above' || condition.operator === 'crosses_below') {
    const prevLeft = getOperandValue(condition.leftOperand, previousCandleData, previousIndicatorValues, patternDetections);
    const prevRight = getOperandValue(condition.rightOperand, previousCandleData, previousIndicatorValues, patternDetections);
    if (prevLeft !== null && prevRight !== null) {
      previousValues = { left: prevLeft, right: prevRight };
    }
  }

  // Compare values
  const result = compareValues(leftValue, condition.operator, rightValue, rightMaxValue, previousValues);

  return {
    result,
    leftValue,
    rightValue,
    rightMaxValue,
    details: {
      conditionId: condition.id,
      operator: condition.operator,
      passed: result,
      leftLabel: condition.leftOperand?.label,
      rightLabel: condition.rightOperand?.label,
    },
  };
}

/**
 * Evaluate a group of conditions with AND/OR logic
 * @param {Object} group - The group to evaluate
 * @param {Array} conditions - All conditions
 * @param {Array} groups - All groups (for nested groups)
 * @param {Object} candleData - Current candle data
 * @param {Object} indicatorValues - Map of indicator values
 * @param {Object} patternDetections - Map of pattern detections
 * @param {Object} previousCandleData - Previous candle data
 * @param {Object} previousIndicatorValues - Previous indicator values
 * @returns {Object} Evaluation result { result: boolean, childResults: [] }
 */
export function evaluateGroup(
  group,
  conditions,
  groups,
  candleData,
  indicatorValues,
  patternDetections,
  previousCandleData = null,
  previousIndicatorValues = null
) {
  if (!group || !group.conditionIds || group.conditionIds.length === 0) {
    return { result: false, childResults: [], error: 'Empty group' };
  }

  const childResults = [];
  const operator = group.operator || GROUP_OPERATORS.AND;

  for (const itemId of group.conditionIds) {
    // Check if itemId is a nested group
    const nestedGroup = groups.find(g => g.id === itemId);
    if (nestedGroup) {
      const nestedResult = evaluateGroup(
        nestedGroup,
        conditions,
        groups,
        candleData,
        indicatorValues,
        patternDetections,
        previousCandleData,
        previousIndicatorValues
      );
      childResults.push({
        type: 'group',
        id: itemId,
        ...nestedResult,
      });
    } else {
      // It's a condition
      const condition = conditions.find(c => c.id === itemId);
      if (condition) {
        const conditionResult = evaluateCondition(
          condition,
          candleData,
          indicatorValues,
          patternDetections,
          previousCandleData,
          previousIndicatorValues
        );
        childResults.push({
          type: 'condition',
          id: itemId,
          ...conditionResult,
        });
      }
    }
  }

  // Compute group result based on operator
  let groupResult;
  if (operator === GROUP_OPERATORS.AND) {
    groupResult = childResults.every(r => r.result);
  } else {
    // OR
    groupResult = childResults.some(r => r.result);
  }

  return {
    result: groupResult,
    operator,
    childResults,
  };
}

/**
 * Evaluate all conditions in a section (entry point for Test Logic)
 * @param {string} section - The section to evaluate
 * @param {Array} conditions - All conditions
 * @param {Array} groups - All groups
 * @param {Object} candleData - Current candle data
 * @param {Object} indicatorValues - Map of indicator values
 * @param {Object} patternDetections - Map of pattern detections
 * @param {Object} previousCandleData - Previous candle data
 * @param {Object} previousIndicatorValues - Previous indicator values
 * @returns {Object} Full evaluation result
 */
export function evaluateLogic(
  section,
  conditions,
  groups,
  candleData,
  indicatorValues,
  patternDetections,
  previousCandleData = null,
  previousIndicatorValues = null
) {
  const sectionConditions = conditions.filter(c => migrateSectionToV2(c.section) === section);
  const sectionGroups = groups.filter(g => g.section === section && !g.parentGroupId);

  // Get IDs of conditions that are in groups
  const groupedConditionIds = new Set();
  groups.forEach(group => {
    group.conditionIds.forEach(id => groupedConditionIds.add(id));
  });

  // Ungrouped conditions
  const ungroupedConditions = sectionConditions.filter(c => !groupedConditionIds.has(c.id));

  const results = [];

  // Evaluate groups first
  for (const group of sectionGroups) {
    const groupResult = evaluateGroup(
      group,
      conditions,
      groups,
      candleData,
      indicatorValues,
      patternDetections,
      previousCandleData,
      previousIndicatorValues
    );
    results.push({
      type: 'group',
      id: group.id,
      ...groupResult,
    });
  }

  // Evaluate ungrouped conditions
  for (const condition of ungroupedConditions) {
    const conditionResult = evaluateCondition(
      condition,
      candleData,
      indicatorValues,
      patternDetections,
      previousCandleData,
      previousIndicatorValues
    );
    results.push({
      type: 'condition',
      id: condition.id,
      ...conditionResult,
    });
  }

  // Overall result: all items must pass (implicit AND at section level for ungrouped conditions)
  const overallResult = results.every(r => r.result);

  return {
    section,
    result: overallResult,
    itemResults: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.result).length,
      failed: results.filter(r => !r.result).length,
    },
  };
}
