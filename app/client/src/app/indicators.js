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
 * Indicator definitions with metadata
 * Each indicator includes:
 * - id: Unique identifier
 * - name: Full display name
 * - shortName: Abbreviated name for compact display
 * - category: Category classification
 * - description: Brief description for tooltips
 * - icon: Lucide icon name (optional, category icon used as fallback)
 */
export const INDICATORS = [
  // Trend Indicators
  {
    id: 'sma',
    name: 'Simple Moving Average (SMA)',
    shortName: 'SMA',
    category: 'Trend',
    description: 'Calculates the average price over a specified period, smoothing out price fluctuations to identify trend direction.',
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average (EMA)',
    shortName: 'EMA',
    category: 'Trend',
    description: 'A weighted moving average that gives more importance to recent prices, reacting faster to price changes than SMA.',
  },
  {
    id: 'macd',
    name: 'Moving Average Convergence Divergence (MACD)',
    shortName: 'MACD',
    category: 'Trend',
    description: 'Shows the relationship between two moving averages, helping identify trend changes and momentum shifts.',
  },
  {
    id: 'adx',
    name: 'Average Directional Index (ADX)',
    shortName: 'ADX',
    category: 'Trend',
    description: 'Measures trend strength regardless of direction. Values above 25 indicate a strong trend.',
  },

  // Momentum Indicators
  {
    id: 'rsi',
    name: 'Relative Strength Index (RSI)',
    shortName: 'RSI',
    category: 'Momentum',
    description: 'Measures the speed and magnitude of price changes. Values above 70 suggest overbought, below 30 suggests oversold.',
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    shortName: 'Stochastic',
    category: 'Momentum',
    description: 'Compares closing price to price range over a period. Useful for identifying potential reversal points.',
  },
  {
    id: 'cci',
    name: 'Commodity Channel Index (CCI)',
    shortName: 'CCI',
    category: 'Momentum',
    description: 'Measures price deviation from the statistical mean. Values above +100 or below -100 indicate strong trends.',
  },
  {
    id: 'williams_r',
    name: 'Williams %R',
    shortName: 'Williams %R',
    category: 'Momentum',
    description: 'A momentum indicator showing overbought/oversold levels. Ranges from 0 to -100, with -20 to 0 overbought.',
  },

  // Volatility Indicators
  {
    id: 'bollinger_bands',
    name: 'Bollinger Bands',
    shortName: 'Bollinger Bands',
    category: 'Volatility',
    description: 'Plots bands around a moving average based on standard deviation. Bands widen with volatility, narrow with stability.',
  },
  {
    id: 'atr',
    name: 'Average True Range (ATR)',
    shortName: 'ATR',
    category: 'Volatility',
    description: 'Measures market volatility by analyzing the range of price movement. Higher ATR indicates higher volatility.',
  },
  {
    id: 'keltner_channel',
    name: 'Keltner Channel',
    shortName: 'Keltner Channel',
    category: 'Volatility',
    description: 'Volatility-based bands using ATR around an EMA. Breakouts above/below channels signal potential trend moves.',
  },

  // Volume Indicators
  {
    id: 'obv',
    name: 'On Balance Volume (OBV)',
    shortName: 'OBV',
    category: 'Volume',
    description: 'Cumulative indicator that adds volume on up days and subtracts on down days. Confirms price trends with volume.',
  },
  {
    id: 'volume_profile',
    name: 'Volume Profile',
    shortName: 'Volume Profile',
    category: 'Volume',
    description: 'Displays trading activity at specific price levels. Shows areas of high and low trading interest.',
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
