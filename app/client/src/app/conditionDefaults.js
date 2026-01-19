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
  { id: 'equals', label: 'equals', description: 'Value is equal to' },
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
 * Condition section types
 */
export const CONDITION_SECTIONS = {
  ENTRY: 'entry',
  EXIT: 'exit',
};

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
 * @param {string} section - Optional section override ('entry' or 'exit')
 * @returns {Object} A new condition object
 */
export function createConditionFromIndicator(indicatorInstance, displayName, section = null) {
  const template = indicatorInstance.defaultConditionTemplate;
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
      section: section || template?.section || CONDITION_SECTIONS.ENTRY,
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
    section: section || template.section || CONDITION_SECTIONS.ENTRY,
    isNew: true, // Flag for animation
  };
}

/**
 * Create a condition from a pattern's detection
 * @param {Object} patternInstance - The pattern instance with id, name, instanceId, detectedCount
 * @param {string} section - Optional section override ('entry' or 'exit')
 * @returns {Object} A new condition object
 */
export function createConditionFromPattern(patternInstance, section = null) {
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
    section: section || CONDITION_SECTIONS.ENTRY,
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
 * @returns {Array} Grouped options for dropdown
 */
export function buildOperandOptions(activeIndicators, getDisplayName) {
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

  // Indicators group
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

  // Numeric value option (for thresholds)
  options.push({
    group: 'Values',
    options: [
      {
        type: 'value',
        value: 0,
        label: 'Custom Value',
        description: 'Enter a numeric threshold',
        isCustom: true,
      },
    ],
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
