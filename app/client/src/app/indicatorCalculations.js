/**
 * Indicator Calculation Functions
 *
 * Pure calculation functions for technical analysis indicators.
 * All functions operate on price arrays and return indicator value arrays.
 */

/**
 * Calculate Simple Moving Average (SMA)
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods for the average
 * @returns {(number|null)[]} Array of SMA values (null for insufficient data)
 */
export function calculateSMA(closes, period) {
  if (!closes || closes.length === 0 || period <= 0) {
    return [];
  }

  const result = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += closes[i - j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods for the average
 * @returns {(number|null)[]} Array of EMA values (null for insufficient data)
 */
export function calculateEMA(closes, period) {
  if (!closes || closes.length === 0 || period <= 0) {
    return [];
  }

  const result = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // First EMA value is the SMA
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += closes[i - j];
      }
      result.push(sum / period);
    } else {
      // EMA = (Close - Previous EMA) * multiplier + Previous EMA
      const ema = (closes[i] - result[i - 1]) * multiplier + result[i - 1];
      result.push(ema);
    }
  }
  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods (typically 14)
 * @returns {(number|null)[]} Array of RSI values (0-100, null for insufficient data)
 */
export function calculateRSI(closes, period) {
  if (!closes || closes.length < period + 1 || period <= 0) {
    return new Array(closes?.length || 0).fill(null);
  }

  const result = [];
  const gains = [];
  const losses = [];

  // Calculate price changes
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // First period - use simple average
  let avgGain = 0;
  let avgLoss = 0;

  // Null for first value (no previous close)
  result.push(null);

  for (let i = 0; i < closes.length - 1; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // Initial average
      for (let j = 0; j < period; j++) {
        avgGain += gains[i - j];
        avgLoss += losses[i - j];
      }
      avgGain /= period;
      avgLoss /= period;

      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    } else {
      // Smoothed average
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {number[]} closes - Array of closing prices
 * @param {number} fastPeriod - Fast EMA period (typically 12)
 * @param {number} slowPeriod - Slow EMA period (typically 26)
 * @param {number} signalPeriod - Signal line period (typically 9)
 * @returns {{macd: (number|null)[], signal: (number|null)[], histogram: (number|null)[]}}
 */
export function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!closes || closes.length === 0) {
    return { macd: [], signal: [], histogram: [] };
  }

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // MACD Line = Fast EMA - Slow EMA
  const macdLine = [];
  for (let i = 0; i < closes.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Signal Line = EMA of MACD Line
  // Filter out nulls for EMA calculation, then map back
  const macdValues = macdLine.filter(v => v !== null);
  const signalEMA = calculateEMA(macdValues, signalPeriod);

  // Map signal values back to original indices
  const signal = [];
  let signalIdx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signal.push(null);
    } else {
      signal.push(signalEMA[signalIdx]);
      signalIdx++;
    }
  }

  // Histogram = MACD Line - Signal Line
  const histogram = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null || signal[i] === null) {
      histogram.push(null);
    } else {
      histogram.push(macdLine[i] - signal[i]);
    }
  }

  return { macd: macdLine, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods (typically 20)
 * @param {number} stdDev - Number of standard deviations (typically 2)
 * @returns {{upper: (number|null)[], middle: (number|null)[], lower: (number|null)[]}}
 */
export function calculateBollingerBands(closes, period = 20, stdDev = 2) {
  if (!closes || closes.length === 0 || period <= 0) {
    return { upper: [], middle: [], lower: [] };
  }

  const middle = calculateSMA(closes, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1 || middle[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      // Calculate standard deviation
      let sumSquares = 0;
      for (let j = 0; j < period; j++) {
        sumSquares += Math.pow(closes[i - j] - middle[i], 2);
      }
      const std = Math.sqrt(sumSquares / period);

      upper.push(middle[i] + stdDev * std);
      lower.push(middle[i] - stdDev * std);
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculate Average True Range (ATR)
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods (typically 14)
 * @returns {(number|null)[]} Array of ATR values
 */
export function calculateATR(highs, lows, closes, period = 14) {
  if (!highs || !lows || !closes || highs.length === 0 || period <= 0) {
    return [];
  }

  const trueRanges = [];

  // First TR is simply high - low
  trueRanges.push(highs[0] - lows[0]);

  // Calculate True Range for remaining periods
  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  // Calculate ATR using smoothed average
  const result = [];
  for (let i = 0; i < trueRanges.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // First ATR is simple average of TR
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += trueRanges[i - j];
      }
      result.push(sum / period);
    } else {
      // Smoothed ATR
      const atr = (result[i - 1] * (period - 1) + trueRanges[i]) / period;
      result.push(atr);
    }
  }

  return result;
}

/**
 * Calculate Stochastic Oscillator
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of closing prices
 * @param {number} kPeriod - %K period (typically 14)
 * @param {number} dPeriod - %D period (typically 3)
 * @returns {{k: (number|null)[], d: (number|null)[]}}
 */
export function calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  if (!highs || !lows || !closes || closes.length === 0 || kPeriod <= 0) {
    return { k: [], d: [] };
  }

  const kValues = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(null);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;

      for (let j = 0; j < kPeriod; j++) {
        highestHigh = Math.max(highestHigh, highs[i - j]);
        lowestLow = Math.min(lowestLow, lows[i - j]);
      }

      if (highestHigh === lowestLow) {
        kValues.push(50); // Avoid division by zero
      } else {
        const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
        kValues.push(k);
      }
    }
  }

  // %D is SMA of %K
  const dValues = calculateSMA(kValues.map(v => v === null ? 0 : v), dPeriod);

  // Restore nulls in D values
  for (let i = 0; i < kValues.length; i++) {
    if (kValues[i] === null) {
      dValues[i] = null;
    }
  }

  return { k: kValues, d: dValues };
}

/**
 * Calculate Commodity Channel Index (CCI)
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods (typically 20)
 * @returns {(number|null)[]} Array of CCI values
 */
export function calculateCCI(highs, lows, closes, period = 20) {
  if (!highs || !lows || !closes || closes.length === 0 || period <= 0) {
    return [];
  }

  // Calculate Typical Price
  const typicalPrices = [];
  for (let i = 0; i < closes.length; i++) {
    typicalPrices.push((highs[i] + lows[i] + closes[i]) / 3);
  }

  const tpSMA = calculateSMA(typicalPrices, period);
  const result = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1 || tpSMA[i] === null) {
      result.push(null);
    } else {
      // Calculate Mean Deviation
      let sumDev = 0;
      for (let j = 0; j < period; j++) {
        sumDev += Math.abs(typicalPrices[i - j] - tpSMA[i]);
      }
      const meanDev = sumDev / period;

      if (meanDev === 0) {
        result.push(0);
      } else {
        const cci = (typicalPrices[i] - tpSMA[i]) / (0.015 * meanDev);
        result.push(cci);
      }
    }
  }

  return result;
}

/**
 * Calculate Williams %R
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods (typically 14)
 * @returns {(number|null)[]} Array of Williams %R values (-100 to 0)
 */
export function calculateWilliamsR(highs, lows, closes, period = 14) {
  if (!highs || !lows || !closes || closes.length === 0 || period <= 0) {
    return [];
  }

  const result = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;

      for (let j = 0; j < period; j++) {
        highestHigh = Math.max(highestHigh, highs[i - j]);
        lowestLow = Math.min(lowestLow, lows[i - j]);
      }

      if (highestHigh === lowestLow) {
        result.push(-50);
      } else {
        const wr = ((highestHigh - closes[i]) / (highestHigh - lowestLow)) * -100;
        result.push(wr);
      }
    }
  }

  return result;
}

/**
 * Calculate Average Directional Index (ADX)
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - Number of periods (typically 14)
 * @returns {{adx: (number|null)[], plusDI: (number|null)[], minusDI: (number|null)[]}}
 */
export function calculateADX(highs, lows, closes, period = 14) {
  if (!highs || !lows || !closes || closes.length < period + 1 || period <= 0) {
    const len = closes?.length || 0;
    return {
      adx: new Array(len).fill(null),
      plusDI: new Array(len).fill(null),
      minusDI: new Array(len).fill(null)
    };
  }

  const atr = calculateATR(highs, lows, closes, period);

  // Calculate +DM and -DM
  const plusDM = [0];
  const minusDM = [0];

  for (let i = 1; i < highs.length; i++) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];

    if (upMove > downMove && upMove > 0) {
      plusDM.push(upMove);
    } else {
      plusDM.push(0);
    }

    if (downMove > upMove && downMove > 0) {
      minusDM.push(downMove);
    } else {
      minusDM.push(0);
    }
  }

  // Smooth DM values
  const smoothPlusDM = [];
  const smoothMinusDM = [];

  for (let i = 0; i < plusDM.length; i++) {
    if (i < period - 1) {
      smoothPlusDM.push(null);
      smoothMinusDM.push(null);
    } else if (i === period - 1) {
      let sumPlus = 0;
      let sumMinus = 0;
      for (let j = 0; j < period; j++) {
        sumPlus += plusDM[i - j];
        sumMinus += minusDM[i - j];
      }
      smoothPlusDM.push(sumPlus);
      smoothMinusDM.push(sumMinus);
    } else {
      const prevPlus = smoothPlusDM[i - 1];
      const prevMinus = smoothMinusDM[i - 1];
      smoothPlusDM.push(prevPlus - (prevPlus / period) + plusDM[i]);
      smoothMinusDM.push(prevMinus - (prevMinus / period) + minusDM[i]);
    }
  }

  // Calculate +DI and -DI
  const plusDI = [];
  const minusDI = [];
  const dx = [];

  for (let i = 0; i < closes.length; i++) {
    if (atr[i] === null || smoothPlusDM[i] === null) {
      plusDI.push(null);
      minusDI.push(null);
      dx.push(null);
    } else if (atr[i] === 0) {
      plusDI.push(0);
      minusDI.push(0);
      dx.push(0);
    } else {
      const pdi = (smoothPlusDM[i] / atr[i]) * 100;
      const mdi = (smoothMinusDM[i] / atr[i]) * 100;
      plusDI.push(pdi);
      minusDI.push(mdi);

      const diSum = pdi + mdi;
      if (diSum === 0) {
        dx.push(0);
      } else {
        dx.push(Math.abs(pdi - mdi) / diSum * 100);
      }
    }
  }

  // Calculate ADX as smoothed DX
  const adx = [];
  for (let i = 0; i < dx.length; i++) {
    if (i < (period * 2) - 1 || dx[i] === null) {
      adx.push(null);
    } else if (i === (period * 2) - 1) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < period; j++) {
        if (dx[i - j] !== null) {
          sum += dx[i - j];
          count++;
        }
      }
      adx.push(count > 0 ? sum / count : null);
    } else {
      const prevADX = adx[i - 1];
      if (prevADX === null) {
        adx.push(null);
      } else {
        adx.push((prevADX * (period - 1) + dx[i]) / period);
      }
    }
  }

  return { adx, plusDI, minusDI };
}

/**
 * Calculate On Balance Volume (OBV)
 * @param {number[]} closes - Array of closing prices
 * @param {number[]} volumes - Array of volumes (if not available, uses proxy)
 * @param {number[]} highs - Array of high prices (for volume proxy)
 * @param {number[]} lows - Array of low prices (for volume proxy)
 * @returns {number[]} Array of OBV values
 */
export function calculateOBV(closes, volumes, highs, lows) {
  if (!closes || closes.length === 0) {
    return [];
  }

  // If no volumes provided, create proxy volumes from price range
  const vols = volumes || highs?.map((h, i) => Math.abs(h - lows[i]) * 1000000) || new Array(closes.length).fill(1000000);

  const result = [vols[0]];

  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      result.push(result[i - 1] + vols[i]);
    } else if (closes[i] < closes[i - 1]) {
      result.push(result[i - 1] - vols[i]);
    } else {
      result.push(result[i - 1]);
    }
  }

  return result;
}

/**
 * Calculate Keltner Channel
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - EMA period (typically 20)
 * @param {number} atrMultiplier - ATR multiplier (typically 2)
 * @returns {{upper: (number|null)[], middle: (number|null)[], lower: (number|null)[]}}
 */
export function calculateKeltnerChannel(highs, lows, closes, period = 20, atrMultiplier = 2) {
  if (!highs || !lows || !closes || closes.length === 0 || period <= 0) {
    return { upper: [], middle: [], lower: [] };
  }

  const middle = calculateEMA(closes, period);
  const atr = calculateATR(highs, lows, closes, period);

  const upper = [];
  const lower = [];

  for (let i = 0; i < closes.length; i++) {
    if (middle[i] === null || atr[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      upper.push(middle[i] + atrMultiplier * atr[i]);
      lower.push(middle[i] - atrMultiplier * atr[i]);
    }
  }

  return { upper, middle, lower };
}
