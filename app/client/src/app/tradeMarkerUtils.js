/**
 * Trade Marker Utilities
 *
 * Utilities for converting backtest trades to lightweight-charts markers
 * and rendering them on price charts.
 */

import { TRADE_MARKER_COLORS } from './constants';

/**
 * Convert ISO 8601 datetime string to Unix timestamp (seconds)
 * @param {string} isoString - ISO 8601 datetime string
 * @returns {number} Unix timestamp in seconds
 */
export function convertISOToUnixTimestamp(isoString) {
  if (!isoString) return NaN;

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return NaN;
    return Math.floor(date.getTime() / 1000);
  } catch (error) {
    return NaN;
  }
}

/**
 * Find the closest candle index for a given timestamp
 * @param {number} targetTimestamp - Unix timestamp in seconds
 * @param {Array<number>} candleTimes - Array of candle Unix timestamps
 * @returns {number} Index of closest candle, or -1 if not found
 */
export function findClosestCandleIndex(targetTimestamp, candleTimes) {
  if (!candleTimes || candleTimes.length === 0) return -1;
  if (isNaN(targetTimestamp)) return -1;

  // Binary search for closest time
  let left = 0;
  let right = candleTimes.length - 1;
  let closestIndex = 0;
  let minDiff = Math.abs(candleTimes[0] - targetTimestamp);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const diff = Math.abs(candleTimes[mid] - targetTimestamp);

    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = mid;
    }

    if (candleTimes[mid] < targetTimestamp) {
      left = mid + 1;
    } else if (candleTimes[mid] > targetTimestamp) {
      right = mid - 1;
    } else {
      // Exact match
      return mid;
    }
  }

  return closestIndex;
}

/**
 * Get appropriate color for trade marker
 * @param {Object} trade - Trade object with pnl and type
 * @param {boolean} isEntry - True if this is an entry marker
 * @returns {string} Hex color code
 */
export function getTradeMarkerColor(trade, isEntry) {
  if (isEntry) {
    // Entry markers colored by trade direction
    return trade.type === 'long'
      ? TRADE_MARKER_COLORS.LONG_ENTRY
      : TRADE_MARKER_COLORS.SHORT_ENTRY;
  } else {
    // Exit markers colored by profitability
    return trade.pnl > 0
      ? TRADE_MARKER_COLORS.PROFITABLE_EXIT
      : TRADE_MARKER_COLORS.LOSING_EXIT;
  }
}

/**
 * Create trade marker object for lightweight-charts
 * @param {Object} trade - Trade object
 * @param {number} candleTime - Unix timestamp for candle
 * @param {boolean} isEntry - True if this is an entry marker
 * @param {number} tradeNumber - Trade number (1-indexed)
 * @returns {Object} Marker object for lightweight-charts
 */
export function createTradeMarker(trade, candleTime, isEntry, tradeNumber) {
  const color = getTradeMarkerColor(trade, isEntry);

  if (isEntry) {
    // Entry markers: arrow up for long, arrow down for short
    return {
      time: candleTime,
      position: trade.type === 'long' ? 'belowBar' : 'aboveBar',
      color: color,
      shape: trade.type === 'long' ? 'arrowUp' : 'arrowDown',
      text: `#${tradeNumber}`,
      id: `trade-${tradeNumber}-entry`,
      trade: trade,
      tradeNumber: tradeNumber,
      isEntry: true,
    };
  } else {
    // Exit markers: circle with P/L text
    const pnlText = trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`;

    return {
      time: candleTime,
      position: trade.type === 'long' ? 'aboveBar' : 'belowBar',
      color: color,
      shape: 'circle',
      text: pnlText,
      id: `trade-${tradeNumber}-exit`,
      trade: trade,
      tradeNumber: tradeNumber,
      isEntry: false,
    };
  }
}

/**
 * Create connecting line data between entry and exit markers
 * Note: This returns data for custom drawing, not a direct lightweight-charts API call
 * @param {Object} entryMarker - Entry marker object
 * @param {Object} exitMarker - Exit marker object
 * @param {boolean} isProfitable - True if trade was profitable
 * @returns {Object} Line data object
 */
export function createConnectingLine(entryMarker, exitMarker, isProfitable) {
  return {
    entryTime: entryMarker.time,
    exitTime: exitMarker.time,
    entryPrice: entryMarker.trade.entry_price,
    exitPrice: entryMarker.trade.exit_price,
    color: isProfitable
      ? TRADE_MARKER_COLORS.CONNECTING_LINE_WIN
      : TRADE_MARKER_COLORS.CONNECTING_LINE_LOSS,
    lineWidth: 1,
    tradeNumber: entryMarker.tradeNumber,
  };
}

/**
 * Parse time value to Unix timestamp (seconds)
 * Handles various time formats from chart data
 * @param {string|number|Date} timeValue - Time value in various formats
 * @returns {number} Unix timestamp in seconds
 */
export function parseTimeToUnix(timeValue) {
  if (typeof timeValue === 'number') {
    // If already a timestamp, check if milliseconds or seconds
    return timeValue > 1e12 ? Math.floor(timeValue / 1000) : timeValue;
  }
  if (typeof timeValue === 'string') {
    // Handle custom format: YY-MM-DD HH:MM (e.g., "26-01-21 16:39" = 2026-01-21 16:39)
    const customMatch = timeValue.match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
    if (customMatch) {
      const [, year, month, day, hour, minute] = customMatch;
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
