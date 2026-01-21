/**
 * Drawing Types and Constants
 *
 * Defines drawing tools, default properties, and limits for chart annotations
 * including horizontal lines, trendlines, and Fibonacci retracements.
 */

// Drawing tool types
export const DRAWING_TOOLS = {
  POINTER: 'pointer',
  CROSSHAIR: 'crosshair',
  HORIZONTAL_LINE: 'horizontal_line',
  TRENDLINE: 'trendline',
  FIBONACCI: 'fibonacci',
};

// Keyboard shortcuts for drawing tools
export const DRAWING_TOOL_SHORTCUTS = {
  C: DRAWING_TOOLS.CROSSHAIR,
  H: DRAWING_TOOLS.HORIZONTAL_LINE,
  T: DRAWING_TOOLS.TRENDLINE,
  F: DRAWING_TOOLS.FIBONACCI,
  Escape: DRAWING_TOOLS.POINTER,
};

// Drawing tool labels for display
export const DRAWING_TOOL_LABELS = {
  [DRAWING_TOOLS.POINTER]: 'Pointer',
  [DRAWING_TOOLS.CROSSHAIR]: 'Crosshair',
  [DRAWING_TOOLS.HORIZONTAL_LINE]: 'Horizontal Line',
  [DRAWING_TOOLS.TRENDLINE]: 'Trendline',
  [DRAWING_TOOLS.FIBONACCI]: 'Fibonacci Retracement',
};

// Drawing tool shortcut hints
export const DRAWING_TOOL_HINTS = {
  [DRAWING_TOOLS.POINTER]: 'Esc',
  [DRAWING_TOOLS.CROSSHAIR]: 'C',
  [DRAWING_TOOLS.HORIZONTAL_LINE]: 'H',
  [DRAWING_TOOLS.TRENDLINE]: 'T',
  [DRAWING_TOOLS.FIBONACCI]: 'F',
};

// Drawing limits per chart
export const DRAWING_LIMITS = {
  MAX_HORIZONTAL_LINES: 20,
  MAX_TRENDLINES: 10,
  MAX_FIBONACCI: 5,
};

// Line style options
export const DRAWING_LINE_STYLES = {
  SOLID: 'solid',
  DASHED: 'dash',
  DOTTED: 'dot',
};

// Line style labels
export const DRAWING_LINE_STYLE_LABELS = {
  [DRAWING_LINE_STYLES.SOLID]: 'Solid',
  [DRAWING_LINE_STYLES.DASHED]: 'Dashed',
  [DRAWING_LINE_STYLES.DOTTED]: 'Dotted',
};

// Default drawing colors
export const DRAWING_DEFAULT_COLORS = {
  [DRAWING_TOOLS.HORIZONTAL_LINE]: '#3B82F6', // Blue
  [DRAWING_TOOLS.TRENDLINE]: '#8B5CF6', // Purple
  [DRAWING_TOOLS.FIBONACCI]: '#F59E0B', // Amber
};

// Default line widths
export const DRAWING_DEFAULT_LINE_WIDTH = 2;
export const DRAWING_LINE_WIDTH_MIN = 1;
export const DRAWING_LINE_WIDTH_MAX = 5;

// Default line style
export const DRAWING_DEFAULT_LINE_STYLE = DRAWING_LINE_STYLES.SOLID;

// Fibonacci default levels (percentage values)
export const FIBONACCI_DEFAULT_LEVELS = [
  { value: 0, label: '0%', enabled: true },
  { value: 0.236, label: '23.6%', enabled: true },
  { value: 0.382, label: '38.2%', enabled: true },
  { value: 0.5, label: '50%', enabled: true },
  { value: 0.618, label: '61.8%', enabled: true },
  { value: 0.786, label: '78.6%', enabled: true },
  { value: 1, label: '100%', enabled: true },
];

// Fibonacci extension levels
export const FIBONACCI_EXTENSION_LEVELS = [
  { value: 1.272, label: '127.2%', enabled: false },
  { value: 1.618, label: '161.8%', enabled: false },
  { value: 2.618, label: '261.8%', enabled: false },
];

// Fibonacci level colors (can be customized per level or unified)
export const FIBONACCI_DEFAULT_LEVEL_COLORS = {
  0: '#EF4444',      // Red
  0.236: '#F97316',  // Orange
  0.382: '#F59E0B',  // Amber
  0.5: '#84CC16',    // Lime
  0.618: '#22C55E',  // Green
  0.786: '#14B8A6',  // Teal
  1: '#3B82F6',      // Blue
  1.272: '#8B5CF6',  // Purple
  1.618: '#A855F7',  // Fuchsia
  2.618: '#EC4899',  // Pink
};

/**
 * Create default properties for a new horizontal line drawing
 * @param {number} price - The price level for the line
 * @returns {Object} Default horizontal line properties
 */
export function createDefaultHorizontalLine(price) {
  return {
    type: DRAWING_TOOLS.HORIZONTAL_LINE,
    price: price,
    color: DRAWING_DEFAULT_COLORS[DRAWING_TOOLS.HORIZONTAL_LINE],
    lineWidth: DRAWING_DEFAULT_LINE_WIDTH,
    lineStyle: DRAWING_DEFAULT_LINE_STYLE,
    label: '',
    showLabel: true,
    isLocked: false,
  };
}

/**
 * Create default properties for a new trendline drawing
 * @param {Object} point1 - First anchor point { time, price }
 * @param {Object} point2 - Second anchor point { time, price }
 * @returns {Object} Default trendline properties
 */
export function createDefaultTrendline(point1, point2) {
  return {
    type: DRAWING_TOOLS.TRENDLINE,
    point1: { ...point1 },
    point2: { ...point2 },
    color: DRAWING_DEFAULT_COLORS[DRAWING_TOOLS.TRENDLINE],
    lineWidth: DRAWING_DEFAULT_LINE_WIDTH,
    lineStyle: DRAWING_DEFAULT_LINE_STYLE,
    extendLeft: false,
    extendRight: false,
    showAngle: false,
    label: '',
    isLocked: false,
  };
}

/**
 * Create default properties for a new Fibonacci retracement drawing
 * @param {Object} startPoint - Start anchor point (swing low/high) { time, price }
 * @param {Object} endPoint - End anchor point (swing high/low) { time, price }
 * @returns {Object} Default Fibonacci properties
 */
export function createDefaultFibonacci(startPoint, endPoint) {
  return {
    type: DRAWING_TOOLS.FIBONACCI,
    startPoint: { ...startPoint },
    endPoint: { ...endPoint },
    color: DRAWING_DEFAULT_COLORS[DRAWING_TOOLS.FIBONACCI],
    lineWidth: DRAWING_DEFAULT_LINE_WIDTH,
    lineStyle: DRAWING_DEFAULT_LINE_STYLE,
    levels: FIBONACCI_DEFAULT_LEVELS.map(level => ({ ...level })),
    extensionLevels: FIBONACCI_EXTENSION_LEVELS.map(level => ({ ...level })),
    showPrices: true,
    showPercentages: true,
    levelColors: null, // null means use unified color
    isLocked: false,
  };
}

/**
 * Get the type-specific limit for a drawing type
 * @param {string} drawingType - The drawing type
 * @returns {number} The maximum number of drawings allowed
 */
export function getDrawingLimit(drawingType) {
  switch (drawingType) {
    case DRAWING_TOOLS.HORIZONTAL_LINE:
      return DRAWING_LIMITS.MAX_HORIZONTAL_LINES;
    case DRAWING_TOOLS.TRENDLINE:
      return DRAWING_LIMITS.MAX_TRENDLINES;
    case DRAWING_TOOLS.FIBONACCI:
      return DRAWING_LIMITS.MAX_FIBONACCI;
    default:
      return 0;
  }
}

/**
 * Get the current count of drawings by type
 * @param {Array} drawings - Array of all drawings
 * @param {string} drawingType - The drawing type to count
 * @returns {number} The count of drawings of that type
 */
export function getDrawingCount(drawings, drawingType) {
  if (!drawings || !Array.isArray(drawings)) return 0;
  return drawings.filter(d => d.type === drawingType).length;
}

/**
 * Check if adding a new drawing of the given type would exceed the limit
 * @param {Array} drawings - Array of all drawings
 * @param {string} drawingType - The drawing type to check
 * @returns {boolean} True if adding would exceed the limit
 */
export function wouldExceedDrawingLimit(drawings, drawingType) {
  const currentCount = getDrawingCount(drawings, drawingType);
  const limit = getDrawingLimit(drawingType);
  return currentCount >= limit;
}

/**
 * Get a human-readable warning message for drawing limits
 * @param {string} drawingType - The drawing type
 * @returns {string} Warning message
 */
export function getDrawingLimitWarning(drawingType) {
  const limit = getDrawingLimit(drawingType);
  const label = DRAWING_TOOL_LABELS[drawingType] || 'drawing';
  return `Maximum ${label.toLowerCase()}s reached (${limit}). Remove one to add another.`;
}
