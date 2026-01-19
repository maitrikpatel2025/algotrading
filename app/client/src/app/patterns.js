/**
 * Pattern Library Data Constants
 *
 * Static definitions for candlestick pattern recognition organized by type.
 * Used by the IndicatorLibrary component for display and filtering.
 */

/**
 * Pattern type constants for bullish/bearish/neutral classification
 */
export const PATTERN_TYPES = {
  BULLISH: 'bullish',
  BEARISH: 'bearish',
  NEUTRAL: 'neutral',
};

/**
 * Pattern colors based on type
 */
export const PATTERN_COLORS = {
  [PATTERN_TYPES.BULLISH]: '#22C55E', // Green
  [PATTERN_TYPES.BEARISH]: '#EF4444', // Red
  [PATTERN_TYPES.NEUTRAL]: '#6B7280', // Gray
};

/**
 * Candlestick pattern definitions with metadata
 * Each pattern includes:
 * - id: Unique identifier
 * - name: Full display name
 * - shortName: Abbreviated name for compact display
 * - category: Always 'Patterns' for candlestick patterns
 * - description: Brief description for tooltips
 * - patternType: 'bullish', 'bearish', or 'neutral'
 * - candleCount: Number of candles in the pattern (1, 2, or 3)
 * - reliability: Base reliability score (0-1)
 * - color: Display color based on pattern type
 * - defaultConditionTemplate: Template for auto-creating conditions
 */
export const PATTERNS = [
  // Single Candle Patterns
  {
    id: 'doji',
    name: 'Doji',
    shortName: 'Doji',
    category: 'Patterns',
    description: 'A candle where open and close are nearly equal, indicating market indecision. Often signals potential reversal.',
    patternType: PATTERN_TYPES.NEUTRAL,
    candleCount: 1,
    reliability: 0.5,
    color: PATTERN_COLORS[PATTERN_TYPES.NEUTRAL],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },
  {
    id: 'hammer',
    name: 'Hammer',
    shortName: 'Hammer',
    category: 'Patterns',
    description: 'Bullish reversal pattern with small body at top and long lower shadow. Appears after downtrends.',
    patternType: PATTERN_TYPES.BULLISH,
    candleCount: 1,
    reliability: 0.6,
    color: PATTERN_COLORS[PATTERN_TYPES.BULLISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },
  {
    id: 'inverted_hammer',
    name: 'Inverted Hammer',
    shortName: 'Inv Hammer',
    category: 'Patterns',
    description: 'Bullish reversal pattern with small body at bottom and long upper shadow. Appears after downtrends.',
    patternType: PATTERN_TYPES.BULLISH,
    candleCount: 1,
    reliability: 0.55,
    color: PATTERN_COLORS[PATTERN_TYPES.BULLISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },

  // Two Candle Patterns
  {
    id: 'bullish_engulfing',
    name: 'Bullish Engulfing',
    shortName: 'Bull Engulf',
    category: 'Patterns',
    description: 'Strong bullish reversal: a large green candle completely engulfs the previous red candle.',
    patternType: PATTERN_TYPES.BULLISH,
    candleCount: 2,
    reliability: 0.7,
    color: PATTERN_COLORS[PATTERN_TYPES.BULLISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },
  {
    id: 'bearish_engulfing',
    name: 'Bearish Engulfing',
    shortName: 'Bear Engulf',
    category: 'Patterns',
    description: 'Strong bearish reversal: a large red candle completely engulfs the previous green candle.',
    patternType: PATTERN_TYPES.BEARISH,
    candleCount: 2,
    reliability: 0.7,
    color: PATTERN_COLORS[PATTERN_TYPES.BEARISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },

  // Three Candle Patterns
  {
    id: 'morning_star',
    name: 'Morning Star',
    shortName: 'Morning Star',
    category: 'Patterns',
    description: 'Bullish reversal: large red candle, small body (star), then large green candle. Signals bottom.',
    patternType: PATTERN_TYPES.BULLISH,
    candleCount: 3,
    reliability: 0.75,
    color: PATTERN_COLORS[PATTERN_TYPES.BULLISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },
  {
    id: 'evening_star',
    name: 'Evening Star',
    shortName: 'Evening Star',
    category: 'Patterns',
    description: 'Bearish reversal: large green candle, small body (star), then large red candle. Signals top.',
    patternType: PATTERN_TYPES.BEARISH,
    candleCount: 3,
    reliability: 0.75,
    color: PATTERN_COLORS[PATTERN_TYPES.BEARISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },
  {
    id: 'three_white_soldiers',
    name: 'Three White Soldiers',
    shortName: '3 White',
    category: 'Patterns',
    description: 'Strong bullish continuation: three consecutive green candles with higher closes.',
    patternType: PATTERN_TYPES.BULLISH,
    candleCount: 3,
    reliability: 0.8,
    color: PATTERN_COLORS[PATTERN_TYPES.BULLISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },
  {
    id: 'three_black_crows',
    name: 'Three Black Crows',
    shortName: '3 Black',
    category: 'Patterns',
    description: 'Strong bearish continuation: three consecutive red candles with lower closes.',
    patternType: PATTERN_TYPES.BEARISH,
    candleCount: 3,
    reliability: 0.8,
    color: PATTERN_COLORS[PATTERN_TYPES.BEARISH],
    defaultConditionTemplate: {
      leftOperand: 'pattern',
      operator: 'is_detected',
      rightOperand: null,
    },
  },
];

/**
 * Get pattern by ID
 * @param {string} id - Pattern ID
 * @returns {Object|undefined} Pattern object or undefined
 */
export function getPatternById(id) {
  return PATTERNS.find(pattern => pattern.id === id);
}

/**
 * Get patterns grouped by pattern type (bullish/bearish/neutral)
 * @returns {Object} Object with pattern type keys and pattern arrays
 */
export function getPatternsByType() {
  return {
    [PATTERN_TYPES.BULLISH]: PATTERNS.filter(p => p.patternType === PATTERN_TYPES.BULLISH),
    [PATTERN_TYPES.BEARISH]: PATTERNS.filter(p => p.patternType === PATTERN_TYPES.BEARISH),
    [PATTERN_TYPES.NEUTRAL]: PATTERNS.filter(p => p.patternType === PATTERN_TYPES.NEUTRAL),
  };
}

/**
 * Generate display name for a pattern instance
 * @param {Object} pattern - Pattern definition
 * @returns {string} Display name
 */
export function getPatternDisplayName(pattern) {
  return pattern.name;
}
