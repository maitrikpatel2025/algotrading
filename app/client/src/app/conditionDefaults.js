/**
 * Condition Defaults Configuration
 *
 * Defines comparison operators, price sources, and condition templates
 * for the Logic Panel's trading condition system.
 */

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
