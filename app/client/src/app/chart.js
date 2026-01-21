import { createChart, ColorType, CrosshairMode, LineStyle, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries, createSeriesMarkers } from 'lightweight-charts';
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
  DEFAULT_LINE_WIDTH,
} from './chartConstants';
import {
  DRAWING_TOOLS,
  DRAWING_LINE_STYLES,
} from './drawingTypes';

// Style guide colors for charts - exact hex values matching ui_style_guide.md
const CHART_COLORS = {
  bullish: '#22c55e',      // Success green
  bearish: '#ef4444',      // Destructive red
  grid: 'rgba(228, 228, 231, 0.15)',
  text: '#71717A',         // Muted foreground
  background: '#18181B',   // Dark background
  volumeBullish: 'rgba(34, 197, 94, 0.5)',
  volumeBearish: 'rgba(239, 68, 68, 0.5)',
  line: '#3B82F6',         // Blue for line chart
  areaFill: 'rgba(59, 130, 246, 0.2)',
  crosshair: '#71717A',
};

// Global chart instance reference for reuse
let chartInstance = null;
let chartSeries = {};

/**
 * Convert line style string to Lightweight Charts LineStyle
 */
function getLineStyle(style) {
  switch (style) {
    case 'dash':
    case DRAWING_LINE_STYLES.DASHED:
      return LineStyle.Dashed;
    case 'dot':
    case DRAWING_LINE_STYLES.DOTTED:
      return LineStyle.Dotted;
    case 'solid':
    case DRAWING_LINE_STYLES.SOLID:
    default:
      return LineStyle.Solid;
  }
}

/**
 * Parse time value to Unix timestamp (seconds)
 * Handles ISO strings, Date objects, numeric timestamps, and custom YY-MM-DD HH:MM format
 */
function parseTimeToUnix(timeValue) {
  if (typeof timeValue === 'number') {
    // If already a timestamp, check if milliseconds or seconds
    return timeValue > 1e12 ? Math.floor(timeValue / 1000) : timeValue;
  }
  if (typeof timeValue === 'string') {
    // Handle custom format: YY-MM-DD HH:MM (e.g., "26-01-21 16:39" = 2026-01-21 16:39)
    const customMatch = timeValue.match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
    if (customMatch) {
      const [, year, month, day, hour, minute] = customMatch;
      // Assume 20xx for two-digit years
      const fullYear = 2000 + parseInt(year, 10);
      const date = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10));
      return Math.floor(date.getTime() / 1000);
    }
    // Try standard ISO format
    const parsed = Date.parse(timeValue);
    if (!isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }
  if (timeValue instanceof Date) {
    return Math.floor(timeValue.getTime() / 1000);
  }
  return NaN;
}

/**
 * Convert OHLC data from API format to Lightweight Charts format
 * API format: { time: [], mid_o: [], mid_h: [], mid_l: [], mid_c: [], volume: [] }
 * LC format: [{ time: unix_timestamp, open, high, low, close }]
 */
function convertToLightweightData(chartData) {
  const data = [];
  for (let i = 0; i < chartData.time.length; i++) {
    const timestamp = parseTimeToUnix(chartData.time[i]);
    // Skip invalid timestamps
    if (isNaN(timestamp)) {
      console.warn(`Invalid timestamp at index ${i}:`, chartData.time[i]);
      continue;
    }
    data.push({
      time: timestamp,
      open: chartData.mid_o[i],
      high: chartData.mid_h[i],
      low: chartData.mid_l[i],
      close: chartData.mid_c[i],
    });
  }
  return data;
}

/**
 * Convert indicator values to Lightweight Charts line data format
 */
function convertToLineData(chartData, values) {
  const data = [];
  for (let i = 0; i < chartData.time.length; i++) {
    if (values[i] !== null && values[i] !== undefined && !isNaN(values[i])) {
      const timestamp = parseTimeToUnix(chartData.time[i]);
      if (!isNaN(timestamp)) {
        data.push({
          time: timestamp,
          value: values[i],
        });
      }
    }
  }
  return data;
}

/**
 * Convert volume data to histogram format
 */
function convertToVolumeData(chartData) {
  const data = [];
  for (let i = 0; i < chartData.time.length; i++) {
    const timestamp = parseTimeToUnix(chartData.time[i]);
    if (isNaN(timestamp)) continue;
    // Use actual volume if available, otherwise calculate proxy from price range
    const volume = chartData.volume?.[i] ??
      Math.abs(chartData.mid_h[i] - chartData.mid_l[i]) * 1000000;
    const isBullish = chartData.mid_c[i] >= chartData.mid_o[i];
    data.push({
      time: timestamp,
      value: volume,
      color: isBullish ? CHART_COLORS.volumeBullish : CHART_COLORS.volumeBearish,
    });
  }
  return data;
}

/**
 * Calculate the number of visible candles based on time range
 */
function getVisibleCandleCount(timeRange, chartData) {
  if (!timeRange || !chartData || !chartData.time) {
    return chartData?.time?.length || 0;
  }

  const { from, to } = timeRange;
  let count = 0;

  for (let i = 0; i < chartData.time.length; i++) {
    const timestamp = parseTimeToUnix(chartData.time[i]);
    if (!isNaN(timestamp) && timestamp >= from && timestamp <= to) {
      count++;
    }
  }

  return count;
}

/**
 * Compute zoomed-in range (reduce visible range by zoom factor)
 */
export function computeZoomedInRange(currentRange, zoomFactor = 0.8, pivotX = 0.5) {
  if (!currentRange || !currentRange.from || !currentRange.to) {
    return currentRange;
  }

  const { from, to } = currentRange;
  const currentSpan = to - from;
  const newSpan = currentSpan * zoomFactor;
  const pivotTime = from + currentSpan * pivotX;
  const newFrom = pivotTime - newSpan * pivotX;
  const newTo = pivotTime + newSpan * (1 - pivotX);

  return { from: Math.floor(newFrom), to: Math.floor(newTo) };
}

/**
 * Compute zoomed-out range (increase visible range by zoom factor)
 */
export function computeZoomedOutRange(currentRange, zoomFactor = 1.2, pivotX = 0.5) {
  return computeZoomedInRange(currentRange, zoomFactor, pivotX);
}

/**
 * Compute scrolled range (shift range left or right)
 */
export function computeScrolledRange(currentRange, direction = 'left', scrollPercent = 0.1, chartData = null) {
  if (!currentRange || !currentRange.from || !currentRange.to) {
    return currentRange;
  }

  const { from, to } = currentRange;
  const span = to - from;
  const shift = span * scrollPercent * (direction === 'left' ? -1 : 1);

  let newFrom = from + shift;
  let newTo = to + shift;

  // Enforce data boundaries if chartData provided
  if (chartData && chartData.time && chartData.time.length > 0) {
    const dataStart = parseTimeToUnix(chartData.time[0]);
    const dataEnd = parseTimeToUnix(chartData.time[chartData.time.length - 1]);

    if (!isNaN(dataStart) && newFrom < dataStart) {
      const overflow = dataStart - newFrom;
      newFrom = dataStart;
      newTo = newTo + overflow;
    }

    if (!isNaN(dataEnd) && newTo > dataEnd) {
      const overflow = newTo - dataEnd;
      newTo = dataEnd;
      newFrom = newFrom - overflow;
    }
  }

  return { from: Math.floor(newFrom), to: Math.floor(newTo) };
}

/**
 * Create overlay indicator series
 */
function createOverlayIndicators(chart, chartData, indicators) {
  const series = [];

  indicators.forEach(indicator => {
    const closes = chartData.mid_c;
    const highs = chartData.mid_h;
    const lows = chartData.mid_l;
    const params = indicator.params || indicator.defaultParams || {};
    const isPreview = indicator.isPreview || false;
    const lineWidth = indicator.lineWidth ?? DEFAULT_LINE_WIDTH;

    switch (indicator.id) {
      case 'sma': {
        const smaValues = calculateSMA(closes, params.period || 20);
        const smaData = convertToLineData(chartData, smaValues);
        const smaSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        smaSeries.setData(smaData);
        series.push({ series: smaSeries, indicator });
        break;
      }
      case 'ema': {
        const emaValues = calculateEMA(closes, params.period || 20);
        const emaData = convertToLineData(chartData, emaValues);
        const emaSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        emaSeries.setData(emaData);
        series.push({ series: emaSeries, indicator });
        break;
      }
      case 'bollinger_bands': {
        const bb = calculateBollingerBands(closes, params.period || 20, params.stdDev || 2);

        // Upper band
        const upperData = convertToLineData(chartData, bb.upper);
        const upperSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        upperSeries.setData(upperData);

        // Middle band
        const middleData = convertToLineData(chartData, bb.middle);
        const middleSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        middleSeries.setData(middleData);

        // Lower band
        const lowerData = convertToLineData(chartData, bb.lower);
        const lowerSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        lowerSeries.setData(lowerData);

        series.push({ series: [upperSeries, middleSeries, lowerSeries], indicator });
        break;
      }
      case 'keltner_channel': {
        const kc = calculateKeltnerChannel(highs, lows, closes, params.period || 20, params.atrMultiplier || 2);

        // Upper channel
        const upperData = convertToLineData(chartData, kc.upper);
        const upperSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        upperSeries.setData(upperData);

        // Middle channel
        const middleData = convertToLineData(chartData, kc.middle);
        const middleSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        middleSeries.setData(middleData);

        // Lower channel
        const lowerData = convertToLineData(chartData, kc.lower);
        const lowerSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
        lowerSeries.setData(lowerData);

        series.push({ series: [upperSeries, middleSeries, lowerSeries], indicator });
        break;
      }
      default:
        console.warn(`Unknown overlay indicator: ${indicator.id}`);
    }
  });

  return series;
}

/**
 * Create subchart indicator series
 * Note: Lightweight Charts doesn't have built-in multi-pane support,
 * so we render subchart indicators in the main pane with separate price scales
 */
function createSubchartIndicators(chart, chartData, indicators) {
  const series = [];

  indicators.forEach((indicator, index) => {
    const closes = chartData.mid_c;
    const highs = chartData.mid_h;
    const lows = chartData.mid_l;
    const params = indicator.params || indicator.defaultParams || {};
    const isPreview = indicator.isPreview || false;
    const lineWidth = indicator.lineWidth ?? DEFAULT_LINE_WIDTH;
    const priceScaleId = `subchart_${index}`;

    switch (indicator.id) {
      case 'rsi': {
        const rsiValues = calculateRSI(closes, params.period || 14);
        const rsiData = convertToLineData(chartData, rsiValues);
        const rsiSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: true,
          priceLineVisible: false,
        });
        rsiSeries.setData(rsiData);
        // Set scale for RSI (0-100)
        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
          autoScale: false,
        });
        series.push({ series: rsiSeries, indicator, priceScaleId });
        break;
      }
      case 'macd': {
        const macd = calculateMACD(
          closes,
          params.fastPeriod || 12,
          params.slowPeriod || 26,
          params.signalPeriod || 9
        );

        // MACD Histogram
        const histData = [];
        for (let i = 0; i < chartData.time.length; i++) {
          if (macd.histogram[i] !== null && !isNaN(macd.histogram[i])) {
            const timestamp = parseTimeToUnix(chartData.time[i]);
            if (!isNaN(timestamp)) {
              histData.push({
                time: timestamp,
                value: macd.histogram[i],
                color: macd.histogram[i] >= 0 ? CHART_COLORS.bullish : CHART_COLORS.bearish,
              });
            }
          }
        }
        const histSeries = chart.addSeries(HistogramSeries, {
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        histSeries.setData(histData);

        // MACD Line
        const macdData = convertToLineData(chartData, macd.macd);
        const macdSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        macdSeries.setData(macdData);

        // Signal Line
        const signalData = convertToLineData(chartData, macd.signal);
        const signalSeries = chart.addSeries(LineSeries, {
          color: '#EF4444',
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        signalSeries.setData(signalData);

        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
        });
        series.push({ series: [histSeries, macdSeries, signalSeries], indicator, priceScaleId });
        break;
      }
      case 'stochastic': {
        const stoch = calculateStochastic(highs, lows, closes, params.kPeriod || 14, params.dPeriod || 3);

        const kData = convertToLineData(chartData, stoch.k);
        const kSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        kSeries.setData(kData);

        const dData = convertToLineData(chartData, stoch.d);
        const dSeries = chart.addSeries(LineSeries, {
          color: '#EF4444',
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        dSeries.setData(dData);

        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
          autoScale: false,
        });
        series.push({ series: [kSeries, dSeries], indicator, priceScaleId });
        break;
      }
      case 'cci': {
        const cciValues = calculateCCI(highs, lows, closes, params.period || 20);
        const cciData = convertToLineData(chartData, cciValues);
        const cciSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: true,
          priceLineVisible: false,
        });
        cciSeries.setData(cciData);
        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
        });
        series.push({ series: cciSeries, indicator, priceScaleId });
        break;
      }
      case 'williams_r': {
        const wrValues = calculateWilliamsR(highs, lows, closes, params.period || 14);
        const wrData = convertToLineData(chartData, wrValues);
        const wrSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: true,
          priceLineVisible: false,
        });
        wrSeries.setData(wrData);
        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
          autoScale: false,
        });
        series.push({ series: wrSeries, indicator, priceScaleId });
        break;
      }
      case 'adx': {
        const adx = calculateADX(highs, lows, closes, params.period || 14);

        const adxData = convertToLineData(chartData, adx.adx);
        const adxSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        adxSeries.setData(adxData);

        const plusDIData = convertToLineData(chartData, adx.plusDI);
        const plusDISeries = chart.addSeries(LineSeries, {
          color: '#22C55E',
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        plusDISeries.setData(plusDIData);

        const minusDIData = convertToLineData(chartData, adx.minusDI);
        const minusDISeries = chart.addSeries(LineSeries, {
          color: '#EF4444',
          lineWidth: lineWidth * 0.67,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        minusDISeries.setData(minusDIData);

        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
        });
        series.push({ series: [adxSeries, plusDISeries, minusDISeries], indicator, priceScaleId });
        break;
      }
      case 'atr': {
        const atrValues = calculateATR(highs, lows, closes, params.period || 14);
        const atrData = convertToLineData(chartData, atrValues);
        const atrSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: true,
          priceLineVisible: false,
        });
        atrSeries.setData(atrData);
        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
        });
        series.push({ series: atrSeries, indicator, priceScaleId });
        break;
      }
      case 'obv': {
        const obvValues = calculateOBV(closes, chartData.volume, highs, lows);
        const obvData = convertToLineData(chartData, obvValues);
        const obvSeries = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: lineWidth,
          lineStyle: isPreview ? LineStyle.Dashed : getLineStyle(indicator.lineStyle),
          priceScaleId: priceScaleId,
          lastValueVisible: true,
          priceLineVisible: false,
        });
        obvSeries.setData(obvData);
        chart.priceScale(priceScaleId).applyOptions({
          scaleMargins: { top: 0.7 + index * 0.1, bottom: 0.02 },
        });
        series.push({ series: obvSeries, indicator, priceScaleId });
        break;
      }
      default:
        console.warn(`Unknown subchart indicator: ${indicator.id}`);
    }
  });

  return series;
}

/**
 * Create pattern markers
 */
function createPatternMarkers(mainSeries, chartData, patterns) {
  if (!patterns || patterns.length === 0) return;

  console.log('createPatternMarkers called with', patterns.length, 'patterns');

  const markers = [];

  patterns.forEach(pattern => {
    const detectedPatterns = pattern.detectedPatterns || detectPattern(
      pattern.id,
      chartData.mid_o,
      chartData.mid_h,
      chartData.mid_l,
      chartData.mid_c
    );

    detectedPatterns.forEach(detection => {
      const idx = detection.index;
      if (idx >= 0 && idx < chartData.time.length) {
        const timestamp = parseTimeToUnix(chartData.time[idx]);
        if (isNaN(timestamp)) return;

        // Validate patternType exists and use default if missing
        if (!pattern.patternType) {
          console.warn('Pattern missing patternType:', pattern.name, '- using default gray color');
        }

        let markerColor;
        switch (pattern.patternType) {
          case PATTERN_TYPES.BULLISH:
            markerColor = CHART_COLORS.bullish;
            break;
          case PATTERN_TYPES.BEARISH:
            markerColor = CHART_COLORS.bearish;
            break;
          default:
            markerColor = '#6B7280'; // Default gray for neutral or missing
        }

        markers.push({
          time: timestamp,
          position: 'aboveBar',
          color: markerColor,
          shape: 'arrowDown',
          text: pattern.name,
        });
      }
    });
  });

  console.log('Generated', markers.length, 'markers for chart');

  if (markers.length > 0) {
    // Sort markers by time
    markers.sort((a, b) => a.time - b.time);
    // In lightweight-charts v5, use createSeriesMarkers instead of setMarkers
    createSeriesMarkers(mainSeries, markers);
    console.log('Markers successfully set on chart');
  }
}

/**
 * Create drawing price lines for horizontal lines
 */
function createDrawings(mainSeries, drawings, conditionDrawingIds = []) {
  if (!drawings || !Array.isArray(drawings) || drawings.length === 0) {
    return;
  }

  drawings.forEach(drawing => {
    const isUsedInCondition = conditionDrawingIds.includes(drawing.id);

    switch (drawing.type) {
      case DRAWING_TOOLS.HORIZONTAL_LINE: {
        const labelText = drawing.label
          ? `${drawing.label} (${drawing.price.toFixed(5)})`
          : drawing.price.toFixed(5);

        mainSeries.createPriceLine({
          price: drawing.price,
          color: drawing.color,
          lineWidth: drawing.lineWidth || 2,
          lineStyle: getLineStyle(drawing.lineStyle),
          axisLabelVisible: true,
          title: isUsedInCondition ? `* ${labelText}` : labelText,
        });
        break;
      }
      // Note: Trendlines and Fibonacci require custom primitives which are more complex
      // For now, we only support horizontal lines natively
      default:
        // Trendlines and Fibonacci will need custom implementation
        break;
    }
  });
}

/**
 * Draw the chart with support for multiple chart types, volume, indicators, patterns, and drawings
 */
export function drawChart(chartData, p, g, divName, chartType = 'candlestick', showVolume = false, activeIndicators = [], activePatterns = [], drawings = [], conditionDrawingIds = []) {
  const container = document.getElementById(divName);
  if (!container) {
    console.error(`Chart container ${divName} not found`);
    return null;
  }

  // Clean up existing chart
  if (chartInstance) {
    chartInstance.remove();
    chartInstance = null;
    chartSeries = {};
  }

  // Create new chart
  const chart = createChart(container, {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: CHART_COLORS.text,
      fontFamily: 'JetBrains Mono, monospace',
    },
    grid: {
      vertLines: { color: CHART_COLORS.grid },
      horzLines: { color: CHART_COLORS.grid },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: CHART_COLORS.crosshair,
        width: 1,
        style: LineStyle.Dotted,
        labelBackgroundColor: '#18181B',
      },
      horzLine: {
        color: CHART_COLORS.crosshair,
        width: 1,
        style: LineStyle.Dotted,
        labelBackgroundColor: '#18181B',
      },
    },
    rightPriceScale: {
      borderColor: CHART_COLORS.grid,
      scaleMargins: {
        top: 0.1,
        bottom: showVolume ? 0.2 : 0.1,
      },
    },
    timeScale: {
      borderColor: CHART_COLORS.grid,
      timeVisible: true,
      secondsVisible: false,
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true,
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
  });

  chartInstance = chart;

  // Convert data to Lightweight Charts format
  const ohlcData = convertToLightweightData(chartData);

  // Create main price series based on chart type
  let mainSeries;
  switch (chartType) {
    case 'ohlc':
      // Lightweight Charts uses candlestick with different styling for OHLC
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: 'transparent',
        downColor: 'transparent',
        borderUpColor: CHART_COLORS.bullish,
        borderDownColor: CHART_COLORS.bearish,
        wickUpColor: CHART_COLORS.bullish,
        wickDownColor: CHART_COLORS.bearish,
      });
      mainSeries.setData(ohlcData);
      break;
    case 'line':
      mainSeries = chart.addSeries(LineSeries, {
        color: CHART_COLORS.line,
        lineWidth: 2,
        lastValueVisible: true,
        priceLineVisible: true,
      });
      // Convert to line data (close prices)
      const lineData = ohlcData.map(d => ({ time: d.time, value: d.close }));
      mainSeries.setData(lineData);
      break;
    case 'area':
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: CHART_COLORS.line,
        bottomColor: CHART_COLORS.areaFill,
        lineColor: CHART_COLORS.line,
        lineWidth: 2,
        lastValueVisible: true,
        priceLineVisible: true,
      });
      // Convert to area data (close prices)
      const areaData = ohlcData.map(d => ({ time: d.time, value: d.close }));
      mainSeries.setData(areaData);
      break;
    case 'candlestick':
    default:
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: CHART_COLORS.bullish,
        downColor: CHART_COLORS.bearish,
        borderUpColor: CHART_COLORS.bullish,
        borderDownColor: CHART_COLORS.bearish,
        wickUpColor: CHART_COLORS.bullish,
        wickDownColor: CHART_COLORS.bearish,
      });
      mainSeries.setData(ohlcData);
      break;
  }

  chartSeries.main = mainSeries;

  // Add volume if enabled
  if (showVolume) {
    const volumeData = convertToVolumeData(chartData);
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });
    volumeSeries.setData(volumeData);
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });
    chartSeries.volume = volumeSeries;
  }

  // Separate overlay and subchart indicators
  const overlayIndicators = activeIndicators.filter(ind => ind.type === INDICATOR_TYPES.OVERLAY);
  const subchartIndicators = activeIndicators.filter(ind => ind.type === INDICATOR_TYPES.SUBCHART);

  // Add overlay indicators
  if (overlayIndicators.length > 0) {
    chartSeries.overlays = createOverlayIndicators(chart, chartData, overlayIndicators);
  }

  // Add subchart indicators
  if (subchartIndicators.length > 0) {
    chartSeries.subcharts = createSubchartIndicators(chart, chartData, subchartIndicators);
  }

  // Add pattern markers
  if (activePatterns && activePatterns.length > 0) {
    console.log(`Rendering ${activePatterns.length} pattern(s) on chart`);
    createPatternMarkers(mainSeries, chartData, activePatterns);
  }

  // Add drawings (horizontal lines)
  if (drawings && drawings.length > 0) {
    createDrawings(mainSeries, drawings, conditionDrawingIds);
  }

  // Fit content
  chart.timeScale().fitContent();

  // Store chartData reference for event handlers
  container._chartData = chartData;
  container._chart = chart;
  container._mainSeries = mainSeries;

  // Set up zoom constraint enforcement
  let lastVisibleRange = null;
  chart.timeScale().subscribeVisibleTimeRangeChange((newRange) => {
    if (!newRange) return;

    const visibleCount = getVisibleCandleCount(newRange, chartData);

    // Dispatch custom event with visible candle count for UI updates
    const candleCountEvent = new CustomEvent('chartZoomUpdate', {
      detail: { visibleCandleCount: visibleCount }
    });
    container.dispatchEvent(candleCountEvent);

    // Enforce zoom constraints (50-500 candles)
    const totalCandles = chartData.time ? chartData.time.length : 0;
    if (totalCandles >= 50) {
      if (visibleCount < 50 && lastVisibleRange) {
        // Zoomed in too much, revert
        chart.timeScale().setVisibleRange(lastVisibleRange);
      } else if (visibleCount > 500 && lastVisibleRange) {
        // Zoomed out too much, revert
        chart.timeScale().setVisibleRange(lastVisibleRange);
      } else {
        lastVisibleRange = newRange;
      }
    }
  });

  return chart;
}

/**
 * Get the current chart instance
 */
export function getChartInstance() {
  return chartInstance;
}

/**
 * Get the main series
 */
export function getMainSeries() {
  return chartSeries.main;
}

/**
 * Resize chart to fit container
 */
export function resizeChart() {
  if (chartInstance) {
    const container = chartInstance.options().container;
    if (container) {
      chartInstance.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    }
  }
}
