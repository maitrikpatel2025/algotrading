/**
 * TradingView Lightweight Charts Configuration
 * ==============================================
 * Helper functions for creating and managing TradingView Lightweight Charts.
 *
 * Features:
 * - Chart initialization with default options
 * - Candlestick series creation
 * - Volume histogram series
 * - Indicator overlays
 * - Chart styling and theming
 */

import { createChart } from 'lightweight-charts';

/**
 * Default chart options for TradingView Lightweight Charts.
 */
export const DEFAULT_CHART_OPTIONS = {
  layout: {
    background: { color: '#1e293b' },  // Dark slate background
    textColor: '#d1d5db',              // Light gray text
  },
  grid: {
    vertLines: { color: '#334155' },
    horzLines: { color: '#334155' },
  },
  crosshair: {
    mode: 0,  // CrosshairMode.Normal
  },
  rightPriceScale: {
    borderColor: '#334155',
  },
  timeScale: {
    borderColor: '#334155',
    timeVisible: true,
    secondsVisible: false,
  },
  watermark: {
    visible: false,
  },
};

/**
 * Candlestick series options.
 */
export const CANDLESTICK_OPTIONS = {
  upColor: '#10b981',        // Green for bullish candles
  downColor: '#ef4444',      // Red for bearish candles
  borderUpColor: '#10b981',
  borderDownColor: '#ef4444',
  wickUpColor: '#10b981',
  wickDownColor: '#ef4444',
};

/**
 * Volume histogram options.
 */
export const VOLUME_OPTIONS = {
  color: '#6366f1',
  priceFormat: {
    type: 'volume',
  },
  priceScaleId: '',  // Overlay on price chart
};

/**
 * Create a TradingView Lightweight Chart instance.
 *
 * @param {HTMLElement} container - DOM element to render chart in
 * @param {object} options - Chart options (merged with defaults)
 * @returns {object} Chart instance
 */
export function createTradingViewChart(container, options = {}) {
  if (!container) {
    throw new Error('Container element is required');
  }

  const chartOptions = {
    ...DEFAULT_CHART_OPTIONS,
    ...options,
    width: container.clientWidth,
    height: container.clientHeight,
  };

  const chart = createChart(container, chartOptions);

  // Handle window resize
  const resizeObserver = new ResizeObserver(entries => {
    if (entries.length === 0) return;
    const { width, height } = entries[0].contentRect;
    chart.applyOptions({ width, height });
  });
  resizeObserver.observe(container);

  // Store resize observer for cleanup
  chart._resizeObserver = resizeObserver;

  return chart;
}

/**
 * Add candlestick series to chart.
 *
 * @param {object} chart - Chart instance
 * @param {array} data - Candle data array [{time, open, high, low, close}, ...]
 * @param {object} options - Series options (merged with defaults)
 * @returns {object} Candlestick series instance
 */
export function addCandlestickSeries(chart, data = [], options = {}) {
  const seriesOptions = {
    ...CANDLESTICK_OPTIONS,
    ...options,
  };

  const candlestickSeries = chart.addCandlestickSeries(seriesOptions);

  if (data && data.length > 0) {
    candlestickSeries.setData(data);
  }

  return candlestickSeries;
}

/**
 * Add volume histogram series to chart.
 *
 * @param {object} chart - Chart instance
 * @param {array} data - Volume data array [{time, value, color}, ...]
 * @param {object} options - Series options (merged with defaults)
 * @returns {object} Histogram series instance
 */
export function addVolumeSeries(chart, data = [], options = {}) {
  const seriesOptions = {
    ...VOLUME_OPTIONS,
    ...options,
  };

  const volumeSeries = chart.addHistogramSeries(seriesOptions);

  if (data && data.length > 0) {
    volumeSeries.setData(data);
  }

  return volumeSeries;
}

/**
 * Add line series for indicators (SMA, EMA, etc).
 *
 * @param {object} chart - Chart instance
 * @param {array} data - Indicator data array [{time, value}, ...]
 * @param {object} options - Series options {color, lineWidth, title}
 * @returns {object} Line series instance
 */
export function addLineSeries(chart, data = [], options = {}) {
  const seriesOptions = {
    color: options.color || '#3b82f6',
    lineWidth: options.lineWidth || 2,
    title: options.title || 'Indicator',
    priceLineVisible: false,
    lastValueVisible: true,
    ...options,
  };

  const lineSeries = chart.addLineSeries(seriesOptions);

  if (data && data.length > 0) {
    lineSeries.setData(data);
  }

  return lineSeries;
}

/**
 * Update candlestick series with new data.
 * Efficiently updates only the last candle or adds new candles.
 *
 * @param {object} series - Candlestick series instance
 * @param {array} newData - New candle data
 */
export function updateCandlestickSeries(series, newData) {
  if (!series || !newData || newData.length === 0) {
    return;
  }

  // Use setData for full replacement (for initial load or reset)
  // Use update for real-time updates to the last candle
  series.setData(newData);
}

/**
 * Update the last candle in real-time.
 *
 * @param {object} series - Candlestick series instance
 * @param {object} candle - Updated candle data {time, open, high, low, close}
 */
export function updateLastCandle(series, candle) {
  if (!series || !candle) {
    return;
  }

  series.update(candle);
}

/**
 * Add a horizontal price line (support/resistance level).
 *
 * @param {object} series - Series instance to add line to
 * @param {number} price - Price level
 * @param {object} options - Line options {color, lineWidth, lineStyle, title}
 * @returns {object} Price line instance
 */
export function addPriceLine(series, price, options = {}) {
  const lineOptions = {
    price,
    color: options.color || '#f59e0b',
    lineWidth: options.lineWidth || 2,
    lineStyle: options.lineStyle || 2,  // LineStyle.Dashed
    axisLabelVisible: true,
    title: options.title || `Level ${price}`,
    ...options,
  };

  return series.createPriceLine(lineOptions);
}

/**
 * Remove a price line.
 *
 * @param {object} series - Series instance
 * @param {object} priceLine - Price line to remove
 */
export function removePriceLine(series, priceLine) {
  if (series && priceLine) {
    series.removePriceLine(priceLine);
  }
}

/**
 * Fit chart content to visible range.
 *
 * @param {object} chart - Chart instance
 */
export function fitChartContent(chart) {
  if (chart) {
    chart.timeScale().fitContent();
  }
}

/**
 * Clean up chart resources.
 *
 * @param {object} chart - Chart instance to destroy
 */
export function destroyChart(chart) {
  if (!chart) return;

  // Disconnect resize observer
  if (chart._resizeObserver) {
    chart._resizeObserver.disconnect();
    delete chart._resizeObserver;
  }

  // Remove chart
  chart.remove();
}

/**
 * Convert price data from API format to TradingView format.
 * API format: {time: [], mid_o: [], mid_h: [], mid_l: [], mid_c: []}
 * TradingView format: [{time: timestamp, open: number, high: number, low: number, close: number}, ...]
 *
 * @param {object} priceData - Price data from API
 * @returns {array} Formatted candle data
 */
export function convertApiDataToCandles(priceData) {
  if (!priceData || !priceData.time || priceData.time.length === 0) {
    return [];
  }

  const candles = [];
  for (let i = 0; i < priceData.time.length; i++) {
    candles.push({
      time: parseTimeString(priceData.time[i]),
      open: priceData.mid_o[i],
      high: priceData.mid_h[i],
      low: priceData.mid_l[i],
      close: priceData.mid_c[i],
    });
  }

  return candles;
}

/**
 * Parse time string to Unix timestamp (seconds).
 * Backend format: "26-01-21 02:30" (YY-MM-DD HH:MM)
 *
 * @param {string} timeStr - Time string from backend
 * @returns {number} Unix timestamp in seconds
 */
function parseTimeString(timeStr) {
  if (typeof timeStr === 'number') {
    return timeStr;
  }

  try {
    // Parse format: "26-01-21 02:30"
    const [datePart, timePart] = timeStr.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Construct date (assuming 20XX century)
    const date = new Date(2000 + year, month - 1, day, hour, minute, 0);

    // Return Unix timestamp in seconds (not milliseconds)
    return Math.floor(date.getTime() / 1000);
  } catch (err) {
    console.error('[TradingView] Error parsing time:', timeStr, err);
    return Math.floor(Date.now() / 1000);
  }
}
