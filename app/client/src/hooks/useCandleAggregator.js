/**
 * useCandleAggregator Hook
 * =========================
 * React hook for aggregating real-time ticks into candles on the client side.
 *
 * Features:
 * - Maintains candle buffer (historical + real-time)
 * - Updates current candle from incoming ticks
 * - Adds completed candles to the buffer
 * - Provides formatted candle data for charting
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for candle aggregation.
 *
 * @param {string} timeframe - Timeframe for candle aggregation (e.g., 'M5', 'H1')
 * @param {array} initialCandles - Initial historical candles
 *
 * @returns {object} Candle aggregator interface
 */
export const useCandleAggregator = (timeframe, initialCandles = []) => {
  const [candles, setCandles] = useState(initialCandles);
  const [currentCandle, setCurrentCandle] = useState(null);

  /**
   * Set initial historical candles.
   */
  const setHistoricalCandles = useCallback((historicalCandles) => {
    console.log(`[useCandleAggregator] Setting ${historicalCandles.length} historical candles`);
    setCandles(historicalCandles);
    setCurrentCandle(null);
  }, []);

  /**
   * Add a completed candle to the buffer.
   */
  const addCompletedCandle = useCallback((candle) => {
    console.log(`[useCandleAggregator] Adding completed candle:`, candle.time);
    setCandles((prevCandles) => [...prevCandles, candle]);
  }, []);

  /**
   * Update the current in-progress candle.
   */
  const updateCurrentCandle = useCallback((candle) => {
    setCurrentCandle(candle);
  }, []);

  /**
   * Add a tick to update the current candle.
   * This is a simplified client-side version - the backend does the actual aggregation.
   */
  const addTick = useCallback((tick) => {
    // The tick here is actually a candle update from the backend
    // We just update the current candle state
    setCurrentCandle(tick);
  }, []);

  /**
   * Get all candles including the current in-progress candle.
   */
  const getAllCandles = useCallback(() => {
    if (currentCandle) {
      return [...candles, currentCandle];
    }
    return candles;
  }, [candles, currentCandle]);

  /**
   * Format candles for TradingView Lightweight Charts.
   * Converts from {time, open, high, low, close} to the format expected by the chart.
   */
  const getFormattedCandles = useCallback(() => {
    const allCandles = getAllCandles();

    return allCandles.map(candle => ({
      time: parseTimeString(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
  }, [getAllCandles]);

  /**
   * Reset the candle buffer.
   */
  const reset = useCallback(() => {
    console.log('[useCandleAggregator] Resetting candle buffer');
    setCandles([]);
    setCurrentCandle(null);
  }, []);

  /**
   * Get the current state of the aggregator.
   */
  const getState = useCallback(() => {
    return {
      timeframe,
      candleCount: candles.length,
      hasCurrentCandle: currentCandle !== null
    };
  }, [timeframe, candles.length, currentCandle]);

  return {
    candles,
    currentCandle,
    setHistoricalCandles,
    addCompletedCandle,
    updateCurrentCandle,
    addTick,
    getAllCandles,
    getFormattedCandles,
    reset,
    getState
  };
};

/**
 * Parse time string from backend format to Unix timestamp (seconds).
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
    console.error('[useCandleAggregator] Error parsing time:', timeStr, err);
    // Fallback: return current time
    return Math.floor(Date.now() / 1000);
  }
}
