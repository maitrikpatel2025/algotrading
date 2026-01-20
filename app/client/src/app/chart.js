import Plotly from 'plotly.js-dist';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateStochastic,
  calculateCCI,
  calculateWilliamsR,
  calculateADX,
  calculateOBV,
  calculateKeltnerChannel,
} from './indicatorCalculations';
import { INDICATOR_TYPES } from './indicators';
import { detectPattern } from './patternDetection';
import { PATTERN_TYPES } from './patterns';
import {
  PREVIEW_LINE_DASH,
  PREVIEW_OPACITY,
  PREVIEW_LABEL_SUFFIX,
  DEFAULT_LINE_WIDTH,
  DEFAULT_LINE_STYLE,
  DEFAULT_FILL_OPACITY
} from './chartConstants';
import {
  DRAWING_TOOLS,
  DRAWING_LINE_STYLES,
} from './drawingTypes';
import {
  calculateAllFibonacciLevels,
  extendTrendline,
} from './drawingUtils';

// Style guide colors for charts - exact hex values matching ui_style_guide.md
const CHART_COLORS = {
  bullish: '#22c55e',      // Success green (dark mode: #22C55E)
  bearish: '#ef4444',      // Destructive red (dark mode: #EF4444)
  grid: 'rgba(228, 228, 231, 0.3)',
  text: '#71717A',         // Muted foreground
  background: 'transparent',
  volumeBullish: 'rgba(34, 197, 94, 0.5)',  // Semi-transparent green
  volumeBearish: 'rgba(239, 68, 68, 0.5)',  // Semi-transparent red
  line: '#3B82F6',         // Blue for line chart
  areaFill: 'rgba(59, 130, 246, 0.2)',      // Semi-transparent blue
};

/**
 * Apply preview styling to a trace
 * @param {Object} trace - Plotly trace object
 * @param {boolean} isPreview - Whether this is a preview indicator
 * @returns {Object} Modified trace with preview styling
 */
function applyPreviewStyling(trace, isPreview) {
  if (!isPreview) {
    return trace;
  }

  // Apply preview styling: dashed lines and reduced opacity
  const styledTrace = { ...trace };

  // Apply dashed line style
  if (styledTrace.line) {
    styledTrace.line = {
      ...styledTrace.line,
      dash: PREVIEW_LINE_DASH,
    };
  }

  // Apply reduced opacity
  styledTrace.opacity = PREVIEW_OPACITY;

  // Append "(Preview)" suffix to trace name
  if (styledTrace.name) {
    styledTrace.name = styledTrace.name + PREVIEW_LABEL_SUFFIX;
  }

  return styledTrace;
}

/**
 * Calculate the number of visible candles based on X-axis range
 * @param {Array} xaxisRange - [start, end] timestamps for X-axis
 * @param {Object} chartData - Chart data with time array
 * @returns {number} Number of candles visible in the range
 */
function getVisibleCandleCount(xaxisRange, chartData) {
  if (!xaxisRange || !chartData || !chartData.time) {
    return 0;
  }

  const [start, end] = xaxisRange;
  let count = 0;

  for (let i = 0; i < chartData.time.length; i++) {
    const timestamp = new Date(chartData.time[i]).getTime();
    if (timestamp >= new Date(start).getTime() && timestamp <= new Date(end).getTime()) {
      count++;
    }
  }

  return count;
}

/**
 * Clamp zoom range to enforce min/max visible candle constraints
 * @param {Array} newRange - [start, end] proposed range
 * @param {Object} chartData - Chart data with time array
 * @param {number} minCandles - Minimum candles to show (default 50)
 * @param {number} maxCandles - Maximum candles to show (default 500)
 * @returns {Array} Clamped [start, end] range
 */
function clampZoomRange(newRange, chartData, minCandles = 50, maxCandles = 500) {
  if (!newRange || !chartData || !chartData.time || chartData.time.length === 0) {
    return newRange;
  }

  const totalCandles = chartData.time.length;

  // If dataset has fewer than minCandles, don't enforce minimum constraint
  if (totalCandles < minCandles) {
    return newRange;
  }

  const visibleCount = getVisibleCandleCount(newRange, chartData);

  // If within constraints, return as-is
  if (visibleCount >= minCandles && visibleCount <= maxCandles) {
    return newRange;
  }

  const [start, end] = newRange;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  // Validate that the input timestamps are valid
  if (isNaN(startTime) || isNaN(endTime)) {
    return newRange;
  }

  const center = (startTime + endTime) / 2;

  // Calculate average time between candles
  const timeDeltas = [];
  for (let i = 1; i < chartData.time.length; i++) {
    const currentTime = new Date(chartData.time[i]).getTime();
    const prevTime = new Date(chartData.time[i - 1]).getTime();

    // Skip invalid timestamps
    if (!isNaN(currentTime) && !isNaN(prevTime)) {
      const delta = currentTime - prevTime;
      // Only add positive deltas (valid time progression)
      if (delta > 0) {
        timeDeltas.push(delta);
      }
    }
  }

  // If we don't have valid time deltas, return original range
  if (timeDeltas.length === 0) {
    return newRange;
  }

  const avgDelta = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;

  // Validate avgDelta is a valid number
  if (isNaN(avgDelta) || avgDelta <= 0) {
    return newRange;
  }

  let targetCandles;
  if (visibleCount < minCandles) {
    targetCandles = minCandles;
  } else {
    targetCandles = maxCandles;
  }

  const targetRange = avgDelta * targetCandles;
  const newStart = new Date(center - targetRange / 2);
  const newEnd = new Date(center + targetRange / 2);

  // Validate that calculated dates are valid
  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    return newRange;
  }

  // Ensure we don't go beyond data boundaries
  const dataStart = new Date(chartData.time[0]);
  const dataEnd = new Date(chartData.time[chartData.time.length - 1]);

  // Validate data boundary dates are valid
  if (isNaN(dataStart.getTime()) || isNaN(dataEnd.getTime())) {
    return newRange;
  }

  let clampedStart = newStart < dataStart ? dataStart : newStart;
  let clampedEnd = newEnd > dataEnd ? dataEnd : newEnd;

  // Final validation before toISOString
  if (isNaN(clampedStart.getTime()) || isNaN(clampedEnd.getTime())) {
    return newRange;
  }

  return [clampedStart.toISOString(), clampedEnd.toISOString()];
}

/**
 * Compute zoomed-in range (reduce visible range by zoom factor)
 * @param {Array} currentRange - [start, end] current range
 * @param {number} zoomFactor - Factor to zoom by (0.8 = 20% zoom in)
 * @param {number} pivotX - Relative position (0-1) to center zoom on
 * @returns {Array} New [start, end] range
 */
export function computeZoomedInRange(currentRange, zoomFactor = 0.8, pivotX = 0.5) {
  if (!currentRange || currentRange.length < 2) {
    return currentRange;
  }

  const [start, end] = currentRange;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  // Validate input timestamps
  if (isNaN(startTime) || isNaN(endTime)) {
    return currentRange;
  }

  const currentSpan = endTime - startTime;
  const newSpan = currentSpan * zoomFactor;

  // Calculate zoom center based on pivot point
  const pivotTime = startTime + currentSpan * pivotX;
  const newStart = new Date(pivotTime - newSpan * pivotX);
  const newEnd = new Date(pivotTime + newSpan * (1 - pivotX));

  // Validate calculated dates
  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    return currentRange;
  }

  return [newStart.toISOString(), newEnd.toISOString()];
}

/**
 * Compute zoomed-out range (increase visible range by zoom factor)
 * @param {Array} currentRange - [start, end] current range
 * @param {number} zoomFactor - Factor to zoom by (1.2 = 20% zoom out)
 * @param {number} pivotX - Relative position (0-1) to center zoom on
 * @returns {Array} New [start, end] range
 */
export function computeZoomedOutRange(currentRange, zoomFactor = 1.2, pivotX = 0.5) {
  return computeZoomedInRange(currentRange, zoomFactor, pivotX);
}

/**
 * Compute scrolled range (shift range left or right)
 * @param {Array} currentRange - [start, end] current range
 * @param {string} direction - 'left' or 'right'
 * @param {number} scrollPercent - Percentage of visible range to scroll (0.1 = 10%)
 * @param {Object} chartData - Chart data with time array for boundary checking
 * @returns {Array} New [start, end] range
 */
export function computeScrolledRange(currentRange, direction = 'left', scrollPercent = 0.1, chartData = null) {
  if (!currentRange || currentRange.length < 2) {
    return currentRange;
  }

  const [start, end] = currentRange;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  // Validate input timestamps
  if (isNaN(startTime) || isNaN(endTime)) {
    return currentRange;
  }

  const span = endTime - startTime;
  const shift = span * scrollPercent * (direction === 'left' ? -1 : 1);

  let newStart = new Date(startTime + shift);
  let newEnd = new Date(endTime + shift);

  // Validate calculated dates
  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    return currentRange;
  }

  // Enforce data boundaries if chartData provided
  if (chartData && chartData.time && chartData.time.length > 0) {
    const dataStart = new Date(chartData.time[0]);
    const dataEnd = new Date(chartData.time[chartData.time.length - 1]);

    // Validate data boundary dates
    if (isNaN(dataStart.getTime()) || isNaN(dataEnd.getTime())) {
      return [newStart.toISOString(), newEnd.toISOString()];
    }

    if (newStart < dataStart) {
      const overflow = dataStart.getTime() - newStart.getTime();
      newStart = dataStart;
      newEnd = new Date(newEnd.getTime() + overflow);
    }

    if (newEnd > dataEnd) {
      const overflow = newEnd.getTime() - dataEnd.getTime();
      newEnd = dataEnd;
      newStart = new Date(newStart.getTime() - overflow);
    }

    // Final validation after boundary adjustments
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return currentRange;
    }
  }

  return [newStart.toISOString(), newEnd.toISOString()];
}

/**
 * Create a candlestick trace
 */
function createCandlestickTrace(chartData, pairName) {
  return {
    x: chartData.time,
    close: chartData.mid_c,
    high: chartData.mid_h,
    low: chartData.mid_l,
    open: chartData.mid_o,
    type: 'candlestick',
    xaxis: 'x',
    yaxis: 'y',
    increasing: {
      line: { width: 1, color: CHART_COLORS.bullish },
      fillcolor: CHART_COLORS.bullish
    },
    decreasing: {
      line: { width: 1, color: CHART_COLORS.bearish },
      fillcolor: CHART_COLORS.bearish
    },
    name: pairName,
  };
}

/**
 * Create an OHLC trace
 */
function createOHLCTrace(chartData, pairName) {
  return {
    x: chartData.time,
    close: chartData.mid_c,
    high: chartData.mid_h,
    low: chartData.mid_l,
    open: chartData.mid_o,
    type: 'ohlc',
    xaxis: 'x',
    yaxis: 'y',
    increasing: {
      line: { width: 1, color: CHART_COLORS.bullish }
    },
    decreasing: {
      line: { width: 1, color: CHART_COLORS.bearish }
    },
    name: pairName,
  };
}

/**
 * Create a line trace (uses close prices)
 */
function createLineTrace(chartData, pairName) {
  return {
    x: chartData.time,
    y: chartData.mid_c,
    type: 'scatter',
    mode: 'lines',
    xaxis: 'x',
    yaxis: 'y',
    line: {
      color: CHART_COLORS.line,
      width: 2,
    },
    name: pairName,
  };
}

/**
 * Create an area trace (line with filled area below)
 */
function createAreaTrace(chartData, pairName) {
  return {
    x: chartData.time,
    y: chartData.mid_c,
    type: 'scatter',
    mode: 'lines',
    xaxis: 'x',
    yaxis: 'y',
    fill: 'tozeroy',
    fillcolor: CHART_COLORS.areaFill,
    line: {
      color: CHART_COLORS.line,
      width: 2,
    },
    name: pairName,
  };
}

/**
 * Create the main price trace based on chart type
 */
function createPriceTrace(chartData, pairName, chartType) {
  switch (chartType) {
    case 'ohlc':
      return createOHLCTrace(chartData, pairName);
    case 'line':
      return createLineTrace(chartData, pairName);
    case 'area':
      return createAreaTrace(chartData, pairName);
    case 'candlestick':
    default:
      return createCandlestickTrace(chartData, pairName);
  }
}

/**
 * Create volume trace with color coding based on price direction
 * Note: OpenFX API may not provide volume data. If not available,
 * we calculate a proxy volume based on candle range (high - low).
 */
function createVolumeTrace(chartData) {
  const volumes = [];
  const colors = [];

  for (let i = 0; i < chartData.time.length; i++) {
    // Use actual volume if available, otherwise calculate proxy from price range
    const volume = chartData.volume?.[i] ??
      Math.abs(chartData.mid_h[i] - chartData.mid_l[i]) * 1000000;
    volumes.push(volume);

    // Color based on whether close > open (bullish) or close < open (bearish)
    const isBullish = chartData.mid_c[i] >= chartData.mid_o[i];
    colors.push(isBullish ? CHART_COLORS.volumeBullish : CHART_COLORS.volumeBearish);
  }

  return {
    x: chartData.time,
    y: volumes,
    type: 'bar',
    xaxis: 'x',
    yaxis: 'y2',
    marker: {
      color: colors,
    },
    name: 'Volume',
    hovertemplate: 'Volume: %{y:,.0f}<extra></extra>',
  };
}

/**
 * Create overlay indicator traces (SMA, EMA, Bollinger Bands, Keltner Channel)
 * These render directly on the main price chart
 */
function createOverlayIndicatorTraces(chartData, indicator) {
  const traces = [];
  const closes = chartData.mid_c;
  const highs = chartData.mid_h;
  const lows = chartData.mid_l;
  // Use custom params if available, otherwise fall back to defaultParams
  const params = indicator.params || indicator.defaultParams || {};
  const isPreview = indicator.isPreview || false;

  switch (indicator.id) {
    case 'sma': {
      const smaValues = calculateSMA(closes, params.period || 20);
      const trace = applyPreviewStyling({
        x: chartData.time,
        y: smaValues,
        type: 'scatter',
        mode: 'lines',
        name: `SMA(${params.period || 20})`,
        line: {
          color: indicator.color,
          width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
          dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
        },
        hovertemplate: `SMA: %{y:.5f}<extra></extra>`,
        customdata: Array(chartData.time.length).fill(indicator.instanceId),
        meta: { indicatorId: indicator.id, instanceId: indicator.instanceId },
        hoverlabel: { bgcolor: indicator.color },
      }, isPreview);
      traces.push(trace);
      break;
    }
    case 'ema': {
      const emaValues = calculateEMA(closes, params.period || 20);
      const trace = applyPreviewStyling({
        x: chartData.time,
        y: emaValues,
        type: 'scatter',
        mode: 'lines',
        name: `EMA(${params.period || 20})`,
        line: {
          color: indicator.color,
          width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
          dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
        },
        hovertemplate: `EMA: %{y:.5f}<extra></extra>`,
        customdata: Array(chartData.time.length).fill(indicator.instanceId),
        meta: { indicatorId: indicator.id, instanceId: indicator.instanceId },
      }, isPreview);
      traces.push(trace);
      break;
    }
    case 'bollinger_bands': {
      const bb = calculateBollingerBands(closes, params.period || 20, params.stdDev || 2);
      const metadata = { indicatorId: indicator.id, instanceId: indicator.instanceId };
      const customdata = Array(chartData.time.length).fill(indicator.instanceId);
      const lineWidth = indicator.lineWidth ?? DEFAULT_LINE_WIDTH;
      const lineStyle = indicator.lineStyle ?? DEFAULT_LINE_STYLE;
      const fillOpacity = indicator.fillOpacity ?? DEFAULT_FILL_OPACITY;
      // Convert opacity (0-1) to hex (00-FF)
      const opacityHex = Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
      // Upper band
      const upperTrace = applyPreviewStyling({
        x: chartData.time,
        y: bb.upper,
        type: 'scatter',
        mode: 'lines',
        name: 'BB Upper',
        line: {
          color: indicator.color,
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        hovertemplate: `BB Upper: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(upperTrace);
      // Middle band (SMA)
      const middleTrace = applyPreviewStyling({
        x: chartData.time,
        y: bb.middle,
        type: 'scatter',
        mode: 'lines',
        name: 'BB Middle',
        line: {
          color: indicator.color,
          width: lineWidth,
          dash: lineStyle
        },
        hovertemplate: `BB Middle: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(middleTrace);
      // Lower band
      const lowerTrace = applyPreviewStyling({
        x: chartData.time,
        y: bb.lower,
        type: 'scatter',
        mode: 'lines',
        name: 'BB Lower',
        line: {
          color: indicator.color,
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        fill: 'tonexty',
        fillcolor: `${indicator.color}${opacityHex}`,
        hovertemplate: `BB Lower: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(lowerTrace);
      break;
    }
    case 'keltner_channel': {
      const kc = calculateKeltnerChannel(highs, lows, closes, params.period || 20, params.atrMultiplier || 2);
      const metadata = { indicatorId: indicator.id, instanceId: indicator.instanceId };
      const customdata = Array(chartData.time.length).fill(indicator.instanceId);
      const lineWidth = indicator.lineWidth ?? DEFAULT_LINE_WIDTH;
      const lineStyle = indicator.lineStyle ?? DEFAULT_LINE_STYLE;
      const fillOpacity = indicator.fillOpacity ?? DEFAULT_FILL_OPACITY;
      // Convert opacity (0-1) to hex (00-FF)
      const opacityHex = Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
      // Upper channel
      const upperTrace = applyPreviewStyling({
        x: chartData.time,
        y: kc.upper,
        type: 'scatter',
        mode: 'lines',
        name: 'KC Upper',
        line: {
          color: indicator.color,
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        hovertemplate: `KC Upper: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(upperTrace);
      // Middle (EMA)
      const middleTrace = applyPreviewStyling({
        x: chartData.time,
        y: kc.middle,
        type: 'scatter',
        mode: 'lines',
        name: 'KC Middle',
        line: {
          color: indicator.color,
          width: lineWidth,
          dash: lineStyle
        },
        hovertemplate: `KC Middle: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(middleTrace);
      // Lower channel
      const lowerTrace = applyPreviewStyling({
        x: chartData.time,
        y: kc.lower,
        type: 'scatter',
        mode: 'lines',
        name: 'KC Lower',
        line: {
          color: indicator.color,
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        fill: 'tonexty',
        fillcolor: `${indicator.color}${opacityHex}`,
        hovertemplate: `KC Lower: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(lowerTrace);
      break;
    }
    default:
      console.warn(`Unknown overlay indicator: ${indicator.id}`);
  }

  return traces;
}

/**
 * Create subchart indicator traces (RSI, MACD, Stochastic, etc.)
 * These render in separate panes below the main chart
 */
function createSubchartIndicatorTraces(chartData, indicator, yAxisName) {
  const traces = [];
  const closes = chartData.mid_c;
  const highs = chartData.mid_h;
  const lows = chartData.mid_l;
  // Use custom params if available, otherwise fall back to defaultParams
  const params = indicator.params || indicator.defaultParams || {};
  const isPreview = indicator.isPreview || false;

  switch (indicator.id) {
    case 'rsi': {
      const rsiValues = calculateRSI(closes, params.period || 14);
      const trace = applyPreviewStyling({
        x: chartData.time,
        y: rsiValues,
        type: 'scatter',
        mode: 'lines',
        name: `RSI(${params.period || 14})`,
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
          dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
        },
        hovertemplate: `RSI: %{y:.2f}<extra></extra>`,
        customdata: Array(chartData.time.length).fill(indicator.instanceId),
        meta: { indicatorId: indicator.id, instanceId: indicator.instanceId },
      }, isPreview);
      traces.push(trace);
      break;
    }
    case 'macd': {
      const macd = calculateMACD(
        closes,
        params.fastPeriod || 12,
        params.slowPeriod || 26,
        params.signalPeriod || 9
      );
      const metadata = { indicatorId: indicator.id, instanceId: indicator.instanceId };
      const customdata = Array(chartData.time.length).fill(indicator.instanceId);
      const lineWidth = indicator.lineWidth ?? DEFAULT_LINE_WIDTH;
      const lineStyle = indicator.lineStyle ?? DEFAULT_LINE_STYLE;
      // MACD line
      const macdTrace = applyPreviewStyling({
        x: chartData.time,
        y: macd.macd,
        type: 'scatter',
        mode: 'lines',
        name: 'MACD',
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: lineWidth,
          dash: lineStyle
        },
        hovertemplate: `MACD: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(macdTrace);
      // Signal line
      const signalTrace = applyPreviewStyling({
        x: chartData.time,
        y: macd.signal,
        type: 'scatter',
        mode: 'lines',
        name: 'Signal',
        yaxis: yAxisName,
        line: {
          color: '#EF4444',
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        hovertemplate: `Signal: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(signalTrace);
      // Histogram - don't apply line styling to bars
      const histTrace = applyPreviewStyling({
        x: chartData.time,
        y: macd.histogram,
        type: 'bar',
        name: 'Histogram',
        yaxis: yAxisName,
        marker: {
          color: macd.histogram.map(v => v >= 0 ? '#22C55E' : '#EF4444'),
        },
        hovertemplate: `Hist: %{y:.5f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(histTrace);
      break;
    }
    case 'stochastic': {
      const stoch = calculateStochastic(highs, lows, closes, params.kPeriod || 14, params.dPeriod || 3);
      const metadata = { indicatorId: indicator.id, instanceId: indicator.instanceId };
      const customdata = Array(chartData.time.length).fill(indicator.instanceId);
      const lineWidth = indicator.lineWidth ?? DEFAULT_LINE_WIDTH;
      const lineStyle = indicator.lineStyle ?? DEFAULT_LINE_STYLE;
      const kTrace = applyPreviewStyling({
        x: chartData.time,
        y: stoch.k,
        type: 'scatter',
        mode: 'lines',
        name: '%K',
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: lineWidth,
          dash: lineStyle
        },
        hovertemplate: `%K: %{y:.2f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(kTrace);
      const dTrace = applyPreviewStyling({
        x: chartData.time,
        y: stoch.d,
        type: 'scatter',
        mode: 'lines',
        name: '%D',
        yaxis: yAxisName,
        line: {
          color: '#EF4444',
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        hovertemplate: `%D: %{y:.2f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(dTrace);
      break;
    }
    case 'cci': {
      const cciValues = calculateCCI(highs, lows, closes, params.period || 20);
      const trace = applyPreviewStyling({
        x: chartData.time,
        y: cciValues,
        type: 'scatter',
        mode: 'lines',
        name: `CCI(${params.period || 20})`,
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
          dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
        },
        hovertemplate: `CCI: %{y:.2f}<extra></extra>`,
        customdata: Array(chartData.time.length).fill(indicator.instanceId),
        meta: { indicatorId: indicator.id, instanceId: indicator.instanceId },
      }, isPreview);
      traces.push(trace);
      break;
    }
    case 'williams_r': {
      const wrValues = calculateWilliamsR(highs, lows, closes, params.period || 14);
      const trace = applyPreviewStyling({
        x: chartData.time,
        y: wrValues,
        type: 'scatter',
        mode: 'lines',
        name: `Williams %R(${params.period || 14})`,
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
          dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
        },
        hovertemplate: `%R: %{y:.2f}<extra></extra>`,
        customdata: Array(chartData.time.length).fill(indicator.instanceId),
        meta: { indicatorId: indicator.id, instanceId: indicator.instanceId },
      }, isPreview);
      traces.push(trace);
      break;
    }
    case 'adx': {
      const adx = calculateADX(highs, lows, closes, params.period || 14);
      const metadata = { indicatorId: indicator.id, instanceId: indicator.instanceId };
      const customdata = Array(chartData.time.length).fill(indicator.instanceId);
      const lineWidth = indicator.lineWidth ?? DEFAULT_LINE_WIDTH;
      const lineStyle = indicator.lineStyle ?? DEFAULT_LINE_STYLE;
      const adxTrace = applyPreviewStyling({
        x: chartData.time,
        y: adx.adx,
        type: 'scatter',
        mode: 'lines',
        name: `ADX(${params.period || 14})`,
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: lineWidth,
          dash: lineStyle
        },
        hovertemplate: `ADX: %{y:.2f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(adxTrace);
      const plusDITrace = applyPreviewStyling({
        x: chartData.time,
        y: adx.plusDI,
        type: 'scatter',
        mode: 'lines',
        name: '+DI',
        yaxis: yAxisName,
        line: {
          color: '#22C55E',
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        hovertemplate: `+DI: %{y:.2f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(plusDITrace);
      const minusDITrace = applyPreviewStyling({
        x: chartData.time,
        y: adx.minusDI,
        type: 'scatter',
        mode: 'lines',
        name: '-DI',
        yaxis: yAxisName,
        line: {
          color: '#EF4444',
          width: lineWidth * 0.67,
          dash: lineStyle
        },
        hovertemplate: `-DI: %{y:.2f}<extra></extra>`,
        customdata: customdata,
        meta: metadata,
      }, isPreview);
      traces.push(minusDITrace);
      break;
    }
    case 'atr': {
      const atrValues = calculateATR(highs, lows, closes, params.period || 14);
      const trace = applyPreviewStyling({
        x: chartData.time,
        y: atrValues,
        type: 'scatter',
        mode: 'lines',
        name: `ATR(${params.period || 14})`,
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
          dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
        },
        hovertemplate: `ATR: %{y:.5f}<extra></extra>`,
        customdata: Array(chartData.time.length).fill(indicator.instanceId),
        meta: { indicatorId: indicator.id, instanceId: indicator.instanceId },
      }, isPreview);
      traces.push(trace);
      break;
    }
    case 'obv': {
      const obvValues = calculateOBV(closes, chartData.volume, highs, lows);
      const trace = applyPreviewStyling({
        x: chartData.time,
        y: obvValues,
        type: 'scatter',
        mode: 'lines',
        name: 'OBV',
        yaxis: yAxisName,
        line: {
          color: indicator.color,
          width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
          dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
        },
        hovertemplate: `OBV: %{y:,.0f}<extra></extra>`,
        customdata: Array(chartData.time.length).fill(indicator.instanceId),
        meta: { indicatorId: indicator.id, instanceId: indicator.instanceId },
      }, isPreview);
      traces.push(trace);
      break;
    }
    case 'volume_profile': {
      // Volume profile is a horizontal histogram - skip for now, complex to implement
      console.warn('Volume Profile indicator not yet implemented');
      break;
    }
    default:
      console.warn(`Unknown subchart indicator: ${indicator.id}`);
  }

  return traces;
}

/**
 * Create pattern marker traces for detected candlestick patterns
 * Patterns render as scatter markers above the relevant candles
 * @param {Object} chartData - The chart data with OHLC arrays
 * @param {Object} pattern - The pattern instance with id, name, patternType, color, detectedPatterns
 * @returns {Array} Array of Plotly trace objects
 */
function createPatternMarkerTraces(chartData, pattern) {
  const traces = [];

  // Run pattern detection if not already done
  const detectedPatterns = pattern.detectedPatterns || detectPattern(
    pattern.id,
    chartData.mid_o,
    chartData.mid_h,
    chartData.mid_l,
    chartData.mid_c
  );

  if (detectedPatterns.length === 0) {
    return traces;
  }

  // Extract data for detected patterns
  const markerX = [];
  const markerY = [];
  const hoverTexts = [];
  const reliabilityScores = [];

  detectedPatterns.forEach(detection => {
    const idx = detection.index;
    if (idx >= 0 && idx < chartData.time.length) {
      markerX.push(chartData.time[idx]);
      // Position marker slightly above the high of the candle
      const high = chartData.mid_h[idx];
      const range = chartData.mid_h[idx] - chartData.mid_l[idx];
      markerY.push(high + range * 0.15);
      reliabilityScores.push(detection.reliability);
      hoverTexts.push(
        `<b>${pattern.name}</b><br>` +
        `${chartData.time[idx]}<br>` +
        `Reliability: ${Math.round(detection.reliability * 100)}%`
      );
    }
  });

  // Determine marker color based on pattern type
  let markerColor;
  switch (pattern.patternType) {
    case PATTERN_TYPES.BULLISH:
      markerColor = '#22C55E'; // Green
      break;
    case PATTERN_TYPES.BEARISH:
      markerColor = '#EF4444'; // Red
      break;
    default:
      markerColor = '#6B7280'; // Gray for neutral
  }

  // Create scatter trace for pattern markers
  traces.push({
    x: markerX,
    y: markerY,
    type: 'scatter',
    mode: 'markers',
    name: pattern.name,
    marker: {
      symbol: 'triangle-down',
      size: 12,
      color: markerColor,
      line: {
        color: '#ffffff',
        width: 1,
      },
    },
    text: hoverTexts,
    hovertemplate: '%{text}<extra></extra>',
    hoverlabel: {
      bgcolor: '#18181B',
      bordercolor: markerColor,
      font: {
        family: 'Anek Odia, system-ui, sans-serif',
        size: 12,
        color: '#FAFAFA',
      },
    },
  });

  return traces;
}

/**
 * Convert drawing line style to Plotly dash format
 * @param {string} style - The drawing line style (solid, dash, dot)
 * @returns {string} Plotly dash value
 */
function getPlotlyDash(style) {
  switch (style) {
    case DRAWING_LINE_STYLES.DASHED:
      return 'dash';
    case DRAWING_LINE_STYLES.DOTTED:
      return 'dot';
    case DRAWING_LINE_STYLES.SOLID:
    default:
      return 'solid';
  }
}

/**
 * Create Plotly shapes for all drawings
 * @param {Array} drawings - Array of drawing objects
 * @param {Object} chartData - The chart data
 * @param {Array} conditionDrawingIds - Array of drawing IDs used in conditions (for special styling)
 * @returns {Array} Array of Plotly shape objects
 */
function createDrawingShapes(drawings, chartData, conditionDrawingIds = []) {
  if (!drawings || !Array.isArray(drawings) || drawings.length === 0) {
    return [];
  }

  const shapes = [];
  const dataRange = chartData && chartData.time && chartData.time.length > 0
    ? {
        startTime: chartData.time[0],
        endTime: chartData.time[chartData.time.length - 1],
      }
    : null;

  drawings.forEach(drawing => {
    const isUsedInCondition = conditionDrawingIds.includes(drawing.id);
    const dash = getPlotlyDash(drawing.lineStyle);

    switch (drawing.type) {
      case DRAWING_TOOLS.HORIZONTAL_LINE: {
        // Horizontal line extends across the entire chart (paper coordinates for x)
        shapes.push({
          type: 'line',
          xref: 'paper',
          yref: 'y',
          x0: 0,
          x1: 1,
          y0: drawing.price,
          y1: drawing.price,
          line: {
            color: drawing.color,
            width: drawing.lineWidth || 2,
            dash: dash,
          },
          // Store drawing ID for interaction handling
          meta: {
            drawingId: drawing.id,
            drawingType: drawing.type,
            isUsedInCondition,
          },
        });

        // Add glow effect for lines used in conditions
        if (isUsedInCondition) {
          shapes.push({
            type: 'line',
            xref: 'paper',
            yref: 'y',
            x0: 0,
            x1: 1,
            y0: drawing.price,
            y1: drawing.price,
            line: {
              color: drawing.color,
              width: (drawing.lineWidth || 2) + 4,
              dash: dash,
            },
            opacity: 0.2,
            layer: 'below',
          });
        }
        break;
      }

      case DRAWING_TOOLS.TRENDLINE: {
        let startPoint = drawing.point1;
        let endPoint = drawing.point2;

        // Apply extensions if enabled
        if ((drawing.extendLeft || drawing.extendRight) && dataRange) {
          const extended = extendTrendline(
            drawing.point1,
            drawing.point2,
            drawing.extendLeft,
            drawing.extendRight,
            dataRange
          );
          startPoint = extended.extendedStart;
          endPoint = extended.extendedEnd;
        }

        shapes.push({
          type: 'line',
          xref: 'x',
          yref: 'y',
          x0: startPoint.time,
          y0: startPoint.price,
          x1: endPoint.time,
          y1: endPoint.price,
          line: {
            color: drawing.color,
            width: drawing.lineWidth || 2,
            dash: dash,
          },
          meta: {
            drawingId: drawing.id,
            drawingType: drawing.type,
          },
        });
        break;
      }

      case DRAWING_TOOLS.FIBONACCI: {
        // Calculate all enabled Fibonacci levels
        const allLevels = calculateAllFibonacciLevels(
          drawing.startPoint.price,
          drawing.endPoint.price,
          drawing.levels,
          drawing.extensionLevels
        );

        // Create a horizontal line for each level
        allLevels.forEach(level => {
          shapes.push({
            type: 'line',
            xref: 'x',
            yref: 'y',
            x0: drawing.startPoint.time,
            x1: drawing.endPoint.time,
            y0: level.price,
            y1: level.price,
            line: {
              color: drawing.levelColors?.[level.value] || drawing.color,
              width: level.value === 0 || level.value === 1 ? drawing.lineWidth || 2 : (drawing.lineWidth || 2) * 0.67,
              dash: level.value >= 1 && level.value !== 1 ? 'dash' : dash,
            },
            meta: {
              drawingId: drawing.id,
              drawingType: drawing.type,
              fibLevel: level.value,
            },
          });
        });

        // Add vertical connecting lines at start and end
        const minPrice = Math.min(drawing.startPoint.price, drawing.endPoint.price);
        const maxPrice = Math.max(drawing.startPoint.price, drawing.endPoint.price);

        shapes.push({
          type: 'line',
          xref: 'x',
          yref: 'y',
          x0: drawing.startPoint.time,
          x1: drawing.startPoint.time,
          y0: minPrice,
          y1: maxPrice,
          line: {
            color: drawing.color,
            width: 1,
            dash: 'dot',
          },
          opacity: 0.5,
        });

        shapes.push({
          type: 'line',
          xref: 'x',
          yref: 'y',
          x0: drawing.endPoint.time,
          x1: drawing.endPoint.time,
          y0: minPrice,
          y1: maxPrice,
          line: {
            color: drawing.color,
            width: 1,
            dash: 'dot',
          },
          opacity: 0.5,
        });
        break;
      }

      default:
        console.warn(`Unknown drawing type: ${drawing.type}`);
    }
  });

  return shapes;
}

/**
 * Create Plotly annotations for drawing labels
 * @param {Array} drawings - Array of drawing objects
 * @param {Object} chartData - The chart data
 * @param {Array} conditionDrawingIds - Array of drawing IDs used in conditions
 * @returns {Array} Array of Plotly annotation objects
 */
function createDrawingAnnotations(drawings, chartData, conditionDrawingIds = []) {
  if (!drawings || !Array.isArray(drawings) || drawings.length === 0) {
    return [];
  }

  const annotations = [];

  drawings.forEach(drawing => {
    const isUsedInCondition = conditionDrawingIds.includes(drawing.id);

    switch (drawing.type) {
      case DRAWING_TOOLS.HORIZONTAL_LINE: {
        // Price label on the right side
        const labelText = drawing.label
          ? `${drawing.label} (${drawing.price.toFixed(5)})`
          : drawing.price.toFixed(5);

        annotations.push({
          x: 1,
          xref: 'paper',
          xanchor: 'left',
          y: drawing.price,
          yref: 'y',
          text: isUsedInCondition ? `✦ ${labelText}` : labelText,
          showarrow: false,
          font: {
            family: 'JetBrains Mono, monospace',
            size: 10,
            color: drawing.color,
          },
          bgcolor: 'rgba(24, 24, 27, 0.8)',
          bordercolor: drawing.color,
          borderwidth: 1,
          borderpad: 3,
          xshift: 5,
        });
        break;
      }

      case DRAWING_TOOLS.FIBONACCI: {
        // Calculate all enabled Fibonacci levels
        const allLevels = calculateAllFibonacciLevels(
          drawing.startPoint.price,
          drawing.endPoint.price,
          drawing.levels,
          drawing.extensionLevels
        );

        // Add label for each level
        allLevels.forEach(level => {
          let labelParts = [];
          if (drawing.showPercentages !== false) {
            labelParts.push(level.label);
          }
          if (drawing.showPrices !== false) {
            labelParts.push(level.price.toFixed(5));
          }
          const labelText = labelParts.join(' - ');

          if (labelText) {
            annotations.push({
              x: drawing.endPoint.time,
              xref: 'x',
              xanchor: 'left',
              y: level.price,
              yref: 'y',
              text: labelText,
              showarrow: false,
              font: {
                family: 'JetBrains Mono, monospace',
                size: 9,
                color: drawing.levelColors?.[level.value] || drawing.color,
              },
              bgcolor: 'rgba(24, 24, 27, 0.7)',
              borderpad: 2,
              xshift: 5,
            });
          }
        });
        break;
      }

      // Trendlines don't typically need annotations unless label is set
      case DRAWING_TOOLS.TRENDLINE: {
        if (drawing.label) {
          // Place label at the midpoint of the trendline
          const midTime = new Date((new Date(drawing.point1.time).getTime() + new Date(drawing.point2.time).getTime()) / 2);
          const midPrice = (drawing.point1.price + drawing.point2.price) / 2;

          annotations.push({
            x: midTime.toISOString(),
            xref: 'x',
            y: midPrice,
            yref: 'y',
            text: drawing.label,
            showarrow: false,
            font: {
              family: 'Anek Odia, system-ui, sans-serif',
              size: 10,
              color: drawing.color,
            },
            bgcolor: 'rgba(24, 24, 27, 0.8)',
            bordercolor: drawing.color,
            borderwidth: 1,
            borderpad: 3,
          });
        }
        break;
      }

      default:
        // Unknown drawing type - no annotation
        break;
    }
  });

  return annotations;
}

/**
 * Draw the chart with support for multiple chart types, volume subplot, indicators, patterns, drawings, and advanced interactions.
 * @param {Object} chartData - The chart data with time, mid_o, mid_h, mid_l, mid_c, and optionally volume
 * @param {string} p - Pair name (e.g., "EUR_USD")
 * @param {string} g - Granularity (e.g., "H1")
 * @param {string} divName - The ID of the div element to render the chart in
 * @param {string} chartType - Chart type: 'candlestick', 'ohlc', 'line', or 'area'
 * @param {boolean} showVolume - Whether to show the volume subplot
 * @param {Array} activeIndicators - Array of active indicator objects to render
 * @param {Array} activePatterns - Array of active pattern objects to render
 * @param {Array} drawings - Array of drawing objects to render
 * @param {Array} conditionDrawingIds - Array of drawing IDs used in conditions (for special styling)
 */
export function drawChart(chartData, p, g, divName, chartType = 'candlestick', showVolume = false, activeIndicators = [], activePatterns = [], drawings = [], conditionDrawingIds = []) {
  const data = [];

  // Add main price trace
  const priceTrace = createPriceTrace(chartData, p, chartType);
  data.push(priceTrace);

  // Separate overlay and subchart indicators
  const overlayIndicators = activeIndicators.filter(ind => ind.type === INDICATOR_TYPES.OVERLAY);
  const subchartIndicators = activeIndicators.filter(ind => ind.type === INDICATOR_TYPES.SUBCHART);

  // Add overlay indicator traces (render on main price chart)
  overlayIndicators.forEach(indicator => {
    const traces = createOverlayIndicatorTraces(chartData, indicator);
    data.push(...traces);
  });

  // Add pattern marker traces (render on main price chart)
  if (activePatterns && activePatterns.length > 0) {
    activePatterns.forEach(pattern => {
      const traces = createPatternMarkerTraces(chartData, pattern);
      data.push(...traces);
    });
  }

  // Calculate layout domains
  // Main chart takes most space, volume gets ~15%, each subchart gets ~12%
  const volumeHeight = showVolume ? 0.12 : 0;
  const subchartHeight = 0.12;
  const subchartTotalHeight = subchartIndicators.length * subchartHeight;
  const mainChartBottom = volumeHeight + subchartTotalHeight;

  // Price chart domain
  const priceYAxisDomain = [mainChartBottom, 1];
  // Volume domain (if shown)
  const volumeYAxisDomain = showVolume ? [subchartTotalHeight, subchartTotalHeight + volumeHeight - 0.02] : [0, 0];

  // Add volume trace if enabled
  if (showVolume) {
    const volumeTrace = createVolumeTrace(chartData);
    data.push(volumeTrace);
  }

  // Add subchart indicator traces
  subchartIndicators.forEach((indicator, index) => {
    // y3, y4, y5, etc. for subchart indicators
    const yAxisNum = index + 3;
    const yAxisName = `y${yAxisNum}`;
    const traces = createSubchartIndicatorTraces(chartData, indicator, yAxisName);
    data.push(...traces);
  });

  const layout = {
    title: {
      text: `${p} • ${g}`,
      font: {
        family: 'Anek Odia, system-ui, sans-serif',
        size: 16,
        color: CHART_COLORS.text,
      },
      x: 0.01,
      xanchor: 'left',
    },
    height: '100%',
    autosize: true,
    showlegend: false,
    margin: {
      l: 60,
      r: 60,
      b: 50,
      t: 50,
      pad: 4,
    },
    paper_bgcolor: CHART_COLORS.background,
    plot_bgcolor: CHART_COLORS.background,
    xaxis: {
      rangeslider: {
        visible: false,
      },
      showgrid: true,
      gridcolor: CHART_COLORS.grid,
      gridwidth: 1,
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 11,
        color: CHART_COLORS.text,
      },
      linecolor: CHART_COLORS.grid,
      linewidth: 1,
      // Crosshair spike line configuration
      showspikes: true,
      spikemode: 'across',
      spikesnap: 'cursor',
      spikecolor: '#71717A',
      spikethickness: 1,
      spikedash: 'dot',
    },
    yaxis: {
      side: 'right',
      showgrid: true,
      gridcolor: CHART_COLORS.grid,
      gridwidth: 1,
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 11,
        color: CHART_COLORS.text,
      },
      linecolor: CHART_COLORS.grid,
      linewidth: 1,
      tickformat: '.5f',
      domain: priceYAxisDomain,
      // Crosshair spike line configuration
      showspikes: true,
      spikemode: 'across',
      spikesnap: 'cursor',
      spikecolor: '#71717A',
      spikethickness: 1,
      spikedash: 'dot',
    },
    // Configure hover mode for crosshair effect
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: '#18181B',
      bordercolor: '#3F3F46',
      font: {
        family: 'Anek Odia, system-ui, sans-serif',
        size: 12,
        color: '#FAFAFA',
      },
    },
    // Enable drag mode for panning
    dragmode: 'pan',
    // Add drawing shapes
    shapes: createDrawingShapes(drawings, chartData, conditionDrawingIds),
    // Add drawing annotations/labels
    annotations: createDrawingAnnotations(drawings, chartData, conditionDrawingIds),
  };

  // Add volume y-axis if showing volume
  if (showVolume) {
    layout.yaxis2 = {
      side: 'right',
      showgrid: false,
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 10,
        color: CHART_COLORS.text,
      },
      linecolor: CHART_COLORS.grid,
      linewidth: 1,
      domain: volumeYAxisDomain,
      tickformat: '.2s',
      title: {
        text: 'Vol',
        font: {
          size: 10,
          color: CHART_COLORS.text,
        },
        standoff: 5,
      },
    };
  }

  // Add subchart indicator y-axes
  subchartIndicators.forEach((indicator, index) => {
    const yAxisNum = index + 3;
    const yAxisKey = `yaxis${yAxisNum}`;

    // Calculate domain for this subchart
    const subchartBottom = index * subchartHeight;
    const subchartTop = subchartBottom + subchartHeight - 0.02;

    layout[yAxisKey] = {
      side: 'right',
      showgrid: true,
      gridcolor: CHART_COLORS.grid,
      gridwidth: 1,
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 9,
        color: CHART_COLORS.text,
      },
      linecolor: CHART_COLORS.grid,
      linewidth: 1,
      domain: [subchartBottom, subchartTop],
      title: {
        text: indicator.shortName,
        font: {
          size: 9,
          color: indicator.color,
        },
        standoff: 5,
      },
      // Add reference lines for RSI, Stochastic
      ...(indicator.id === 'rsi' && {
        range: [0, 100],
        dtick: 25,
      }),
      ...(indicator.id === 'stochastic' && {
        range: [0, 100],
        dtick: 25,
      }),
      ...(indicator.id === 'williams_r' && {
        range: [-100, 0],
        dtick: 25,
      }),
      ...(indicator.id === 'cci' && {
        dtick: 100,
      }),
    };
  });

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: `${p}_${g}_chart`,
    },
    // Enable scroll zoom for mouse wheel zoom
    scrollZoom: true,
    // Double-click to reset zoom
    doubleClick: 'reset',
  };

  Plotly.newPlot(divName, data, layout, config);

  // Resize to fit container
  const chartElement = document.getElementById(divName);
  if (chartElement) {
    Plotly.Plots.resize(chartElement);

    // Store chartData reference on element for event handlers
    chartElement._chartData = chartData;

    // Track ongoing relayout to prevent infinite loops
    let isRelayouting = false;

    // Add event listener for zoom constraint enforcement
    chartElement.on('plotly_relayout', (eventData) => {
      // Avoid infinite relayout loops
      if (isRelayouting) return;

      // Check if this is a zoom/pan operation (xaxis.range update)
      const hasXRange = eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined;
      const hasXAutorange = eventData['xaxis.autorange'] !== undefined;

      if (hasXRange) {
        const newRange = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
        const visibleCount = getVisibleCandleCount(newRange, chartData);

        // Apply constraints (50-500 candles)
        if (visibleCount < 50 || visibleCount > 500) {
          const clampedRange = clampZoomRange(newRange, chartData, 50, 500);

          // Use requestAnimationFrame to debounce and prevent layout thrashing
          requestAnimationFrame(() => {
            isRelayouting = true;
            Plotly.relayout(chartElement, {
              'xaxis.range': clampedRange
            }).then(() => {
              isRelayouting = false;
            }).catch(() => {
              isRelayouting = false;
            });
          });
        }

        // Dispatch custom event with visible candle count for UI updates
        const candleCountEvent = new CustomEvent('chartZoomUpdate', {
          detail: { visibleCandleCount: visibleCount }
        });
        chartElement.dispatchEvent(candleCountEvent);
      } else if (hasXAutorange) {
        // After reset, dispatch event with total candle count
        const totalCount = chartData.time ? chartData.time.length : 0;
        const candleCountEvent = new CustomEvent('chartZoomUpdate', {
          detail: { visibleCandleCount: totalCount }
        });
        chartElement.dispatchEvent(candleCountEvent);
      }
    });
  }
}
