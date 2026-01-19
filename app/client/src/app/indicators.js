/**
 * Indicator Library Data Constants
 *
 * Static definitions for technical analysis indicators organized by category.
 * Used by the IndicatorLibrary component for display and filtering.
 */

/**
 * Available indicator categories in display order
 */
export const INDICATOR_CATEGORIES = ['Trend', 'Momentum', 'Volatility', 'Volume', 'Custom'];

/**
 * Category icon mapping (Lucide icon names)
 */
export const CATEGORY_ICONS = {
  Trend: 'TrendingUp',
  Momentum: 'Activity',
  Volatility: 'BarChart3',
  Volume: 'Volume2',
  Custom: 'Settings2',
};

/**
 * Indicator type constants
 * - overlay: Renders directly on the main price chart (SMA, EMA, Bollinger Bands, Keltner Channel)
 * - subchart: Renders in a separate pane below the main chart (RSI, MACD, Stochastic, etc.)
 */
export const INDICATOR_TYPES = {
  OVERLAY: 'overlay',
  SUBCHART: 'subchart',
};

/**
 * Indicator definitions with metadata
 * Each indicator includes:
 * - id: Unique identifier
 * - name: Full display name
 * - shortName: Abbreviated name for compact display
 * - category: Category classification
 * - description: Brief description for tooltips
 * - type: 'overlay' (renders on price chart) or 'subchart' (renders in separate pane)
 * - defaultParams: Default calculation parameters
 * - color: Primary color for the indicator line
 */
export const INDICATORS = [
  // Trend Indicators
  {
    id: 'sma',
    name: 'Simple Moving Average (SMA)',
    shortName: 'SMA',
    category: 'Trend',
    description: 'Calculates the average price over a specified period, smoothing out price fluctuations to identify trend direction.',
    type: INDICATOR_TYPES.OVERLAY,
    defaultParams: { period: 20 },
    color: '#3B82F6', // Blue
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average (EMA)',
    shortName: 'EMA',
    category: 'Trend',
    description: 'A weighted moving average that gives more importance to recent prices, reacting faster to price changes than SMA.',
    type: INDICATOR_TYPES.OVERLAY,
    defaultParams: { period: 20 },
    color: '#F97316', // Orange
  },
  {
    id: 'macd',
    name: 'Moving Average Convergence Divergence (MACD)',
    shortName: 'MACD',
    category: 'Trend',
    description: 'Shows the relationship between two moving averages, helping identify trend changes and momentum shifts.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    color: '#22C55E', // Green
  },
  {
    id: 'adx',
    name: 'Average Directional Index (ADX)',
    shortName: 'ADX',
    category: 'Trend',
    description: 'Measures trend strength regardless of direction. Values above 25 indicate a strong trend.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { period: 14 },
    color: '#A855F7', // Purple
  },

  // Momentum Indicators
  {
    id: 'rsi',
    name: 'Relative Strength Index (RSI)',
    shortName: 'RSI',
    category: 'Momentum',
    description: 'Measures the speed and magnitude of price changes. Values above 70 suggest overbought, below 30 suggests oversold.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { period: 14 },
    color: '#8B5CF6', // Violet
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    shortName: 'Stochastic',
    category: 'Momentum',
    description: 'Compares closing price to price range over a period. Useful for identifying potential reversal points.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { kPeriod: 14, dPeriod: 3 },
    color: '#EC4899', // Pink
  },
  {
    id: 'cci',
    name: 'Commodity Channel Index (CCI)',
    shortName: 'CCI',
    category: 'Momentum',
    description: 'Measures price deviation from the statistical mean. Values above +100 or below -100 indicate strong trends.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { period: 20 },
    color: '#14B8A6', // Teal
  },
  {
    id: 'williams_r',
    name: 'Williams %R',
    shortName: 'Williams %R',
    category: 'Momentum',
    description: 'A momentum indicator showing overbought/oversold levels. Ranges from 0 to -100, with -20 to 0 overbought.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { period: 14 },
    color: '#F59E0B', // Amber
  },

  // Volatility Indicators
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands',
    shortName: 'BB',
    category: 'Volatility',
    description: 'Plots bands around a moving average based on standard deviation. Bands widen with volatility, narrow with stability.',
    type: INDICATOR_TYPES.OVERLAY,
    defaultParams: { period: 20, stdDev: 2 },
    color: '#6B7280', // Gray
  },
  {
    id: 'atr',
    name: 'Average True Range (ATR)',
    shortName: 'ATR',
    category: 'Volatility',
    description: 'Measures market volatility by analyzing the range of price movement. Higher ATR indicates higher volatility.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { period: 14 },
    color: '#EF4444', // Red
  },
  {
    id: 'keltner_channel',
    name: 'Keltner Channel',
    shortName: 'KC',
    category: 'Volatility',
    description: 'Volatility-based bands using ATR around an EMA. Breakouts above/below channels signal potential trend moves.',
    type: INDICATOR_TYPES.OVERLAY,
    defaultParams: { period: 20, atrMultiplier: 2 },
    color: '#06B6D4', // Cyan
  },

  // Volume Indicators
  {
    id: 'obv',
    name: 'On Balance Volume (OBV)',
    shortName: 'OBV',
    category: 'Volume',
    description: 'Cumulative indicator that adds volume on up days and subtracts on down days. Confirms price trends with volume.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: {},
    color: '#84CC16', // Lime
  },
  {
    id: 'volume_profile',
    name: 'Volume Profile',
    shortName: 'VP',
    category: 'Volume',
    description: 'Displays trading activity at specific price levels. Shows areas of high and low trading interest.',
    type: INDICATOR_TYPES.SUBCHART,
    defaultParams: { bins: 24 },
    color: '#0EA5E9', // Sky
  },
];

/**
 * Get indicators grouped by category
 * @returns {Object} Object with category keys and indicator arrays
 */
export function getIndicatorsByCategory() {
  const grouped = {};
  INDICATOR_CATEGORIES.forEach(category => {
    grouped[category] = INDICATORS.filter(indicator => indicator.category === category);
  });
  return grouped;
}

/**
 * Get indicator by ID
 * @param {string} id - Indicator ID
 * @returns {Object|undefined} Indicator object or undefined
 */
export function getIndicatorById(id) {
  return INDICATORS.find(indicator => indicator.id === id);
}
