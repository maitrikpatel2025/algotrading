/**
 * Candlestick Pattern Detection Algorithms
 *
 * Pure functions for detecting candlestick patterns in OHLC price data.
 * All functions return arrays of detected pattern occurrences with indices and reliability scores.
 */

/**
 * Helper: Calculate body size of a candle
 */
function getBodySize(open, close) {
  return Math.abs(close - open);
}

/**
 * Helper: Calculate total range of a candle
 */
function getTotalRange(high, low) {
  return high - low;
}

/**
 * Helper: Get upper shadow size
 */
function getUpperShadow(open, high, close) {
  return high - Math.max(open, close);
}

/**
 * Helper: Get lower shadow size
 */
function getLowerShadow(open, low, close) {
  return Math.min(open, close) - low;
}

/**
 * Helper: Check if candle is bullish (close > open)
 */
function isBullish(open, close) {
  return close > open;
}

/**
 * Helper: Check if candle is bearish (close < open)
 */
function isBearish(open, close) {
  return close < open;
}

/**
 * Detect Doji pattern
 * A candle where the body is very small relative to the total range.
 * Indicates market indecision.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @param {number} threshold - Body/Range ratio threshold (default 0.1 = 10%)
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectDoji(opens, highs, lows, closes, threshold = 0.1) {
  const results = [];

  for (let i = 0; i < closes.length; i++) {
    const bodySize = getBodySize(opens[i], closes[i]);
    const totalRange = getTotalRange(highs[i], lows[i]);

    // Skip if no range (flat candle)
    if (totalRange <= 0) continue;

    const bodyRatio = bodySize / totalRange;

    if (bodyRatio < threshold) {
      // Calculate reliability based on how small the body is
      const reliability = Math.min(0.7, 0.5 + (threshold - bodyRatio) * 2);
      results.push({ index: i, reliability });
    }
  }

  return results;
}

/**
 * Detect Hammer pattern
 * Bullish reversal: small body at top, long lower shadow (>= 2x body), minimal upper shadow.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectHammer(opens, highs, lows, closes) {
  const results = [];

  for (let i = 0; i < closes.length; i++) {
    const bodySize = getBodySize(opens[i], closes[i]);
    const totalRange = getTotalRange(highs[i], lows[i]);
    const upperShadow = getUpperShadow(opens[i], highs[i], closes[i]);
    const lowerShadow = getLowerShadow(opens[i], lows[i], closes[i]);

    // Skip if no meaningful range
    if (totalRange <= 0 || bodySize <= 0) continue;

    // Hammer criteria:
    // 1. Lower shadow >= 2x body size
    // 2. Upper shadow <= 0.3x body size (small upper shadow)
    // 3. Body in upper third of the candle range
    const lowerShadowRatio = lowerShadow / bodySize;
    const upperShadowRatio = upperShadow / bodySize;
    const bodyTopPosition = (Math.max(opens[i], closes[i]) - lows[i]) / totalRange;

    if (lowerShadowRatio >= 2 && upperShadowRatio <= 0.5 && bodyTopPosition >= 0.6) {
      // Calculate reliability based on shadow ratios
      const reliability = Math.min(0.8, 0.5 + (lowerShadowRatio - 2) * 0.1);
      results.push({ index: i, reliability });
    }
  }

  return results;
}

/**
 * Detect Inverted Hammer pattern
 * Bullish reversal after downtrend: small body at bottom, long upper shadow (>= 2x body), minimal lower shadow.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectInvertedHammer(opens, highs, lows, closes) {
  const results = [];

  for (let i = 0; i < closes.length; i++) {
    const bodySize = getBodySize(opens[i], closes[i]);
    const totalRange = getTotalRange(highs[i], lows[i]);
    const upperShadow = getUpperShadow(opens[i], highs[i], closes[i]);
    const lowerShadow = getLowerShadow(opens[i], lows[i], closes[i]);

    // Skip if no meaningful range
    if (totalRange <= 0 || bodySize <= 0) continue;

    // Inverted Hammer criteria:
    // 1. Upper shadow >= 2x body size
    // 2. Lower shadow <= 0.3x body size (small lower shadow)
    // 3. Body in lower third of the candle range
    const upperShadowRatio = upperShadow / bodySize;
    const lowerShadowRatio = lowerShadow / bodySize;
    const bodyBottomPosition = (Math.min(opens[i], closes[i]) - lows[i]) / totalRange;

    if (upperShadowRatio >= 2 && lowerShadowRatio <= 0.5 && bodyBottomPosition <= 0.4) {
      const reliability = Math.min(0.75, 0.5 + (upperShadowRatio - 2) * 0.1);
      results.push({ index: i, reliability });
    }
  }

  return results;
}

/**
 * Detect Bullish Engulfing pattern
 * Strong bullish reversal: red candle followed by larger green candle that engulfs it.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectBullishEngulfing(opens, highs, lows, closes) {
  const results = [];

  // Need at least 2 candles
  for (let i = 1; i < closes.length; i++) {
    const prevOpen = opens[i - 1];
    const prevClose = closes[i - 1];
    const currOpen = opens[i];
    const currClose = closes[i];

    // Criteria:
    // 1. Previous candle is bearish (red)
    // 2. Current candle is bullish (green)
    // 3. Current body engulfs previous body (current open <= prev close AND current close >= prev open)
    const prevIsBearish = isBearish(prevOpen, prevClose);
    const currIsBullish = isBullish(currOpen, currClose);
    const engulfs = currOpen <= prevClose && currClose >= prevOpen;

    if (prevIsBearish && currIsBullish && engulfs) {
      // Calculate reliability based on how much larger the engulfing candle is
      const prevBodySize = getBodySize(prevOpen, prevClose);
      const currBodySize = getBodySize(currOpen, currClose);
      const engulfRatio = prevBodySize > 0 ? currBodySize / prevBodySize : 1;
      const reliability = Math.min(0.85, 0.6 + (engulfRatio - 1) * 0.1);
      results.push({ index: i, reliability });
    }
  }

  return results;
}

/**
 * Detect Bearish Engulfing pattern
 * Strong bearish reversal: green candle followed by larger red candle that engulfs it.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectBearishEngulfing(opens, highs, lows, closes) {
  const results = [];

  // Need at least 2 candles
  for (let i = 1; i < closes.length; i++) {
    const prevOpen = opens[i - 1];
    const prevClose = closes[i - 1];
    const currOpen = opens[i];
    const currClose = closes[i];

    // Criteria:
    // 1. Previous candle is bullish (green)
    // 2. Current candle is bearish (red)
    // 3. Current body engulfs previous body (current open >= prev close AND current close <= prev open)
    const prevIsBullish = isBullish(prevOpen, prevClose);
    const currIsBearish = isBearish(currOpen, currClose);
    const engulfs = currOpen >= prevClose && currClose <= prevOpen;

    if (prevIsBullish && currIsBearish && engulfs) {
      const prevBodySize = getBodySize(prevOpen, prevClose);
      const currBodySize = getBodySize(currOpen, currClose);
      const engulfRatio = prevBodySize > 0 ? currBodySize / prevBodySize : 1;
      const reliability = Math.min(0.85, 0.6 + (engulfRatio - 1) * 0.1);
      results.push({ index: i, reliability });
    }
  }

  return results;
}

/**
 * Detect Morning Star pattern
 * 3-candle bullish reversal: large red, small body (star), large green.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectMorningStar(opens, highs, lows, closes) {
  const results = [];

  // Need at least 3 candles
  for (let i = 2; i < closes.length; i++) {
    const firstOpen = opens[i - 2];
    const firstClose = closes[i - 2];
    const secondOpen = opens[i - 1];
    const secondClose = closes[i - 1];
    const thirdOpen = opens[i];
    const thirdClose = closes[i];

    const firstBodySize = getBodySize(firstOpen, firstClose);
    const secondBodySize = getBodySize(secondOpen, secondClose);
    const thirdBodySize = getBodySize(thirdOpen, thirdClose);

    // Criteria:
    // 1. First candle is large bearish
    // 2. Second candle has small body (star) with gap down
    // 3. Third candle is large bullish, closing above midpoint of first candle
    const firstIsBearish = isBearish(firstOpen, firstClose);
    const thirdIsBullish = isBullish(thirdOpen, thirdClose);

    // Star should be smaller than both surrounding candles
    const isSmallStar = secondBodySize < firstBodySize * 0.5 && secondBodySize < thirdBodySize * 0.5;

    // Third candle should close above midpoint of first candle's body
    const firstMidpoint = (firstOpen + firstClose) / 2;
    const thirdClosesAboveMid = thirdClose > firstMidpoint;

    // Gap down from first to second (star opens below first close)
    const hasGapDown = Math.max(secondOpen, secondClose) < firstClose;

    if (firstIsBearish && thirdIsBullish && isSmallStar && thirdClosesAboveMid) {
      // Reliability bonus for gap
      const reliability = hasGapDown ? 0.8 : 0.7;
      results.push({ index: i, reliability });
    }
  }

  return results;
}

/**
 * Detect Evening Star pattern
 * 3-candle bearish reversal: large green, small body (star), large red.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectEveningStar(opens, highs, lows, closes) {
  const results = [];

  // Need at least 3 candles
  for (let i = 2; i < closes.length; i++) {
    const firstOpen = opens[i - 2];
    const firstClose = closes[i - 2];
    const secondOpen = opens[i - 1];
    const secondClose = closes[i - 1];
    const thirdOpen = opens[i];
    const thirdClose = closes[i];

    const firstBodySize = getBodySize(firstOpen, firstClose);
    const secondBodySize = getBodySize(secondOpen, secondClose);
    const thirdBodySize = getBodySize(thirdOpen, thirdClose);

    // Criteria:
    // 1. First candle is large bullish
    // 2. Second candle has small body (star) with gap up
    // 3. Third candle is large bearish, closing below midpoint of first candle
    const firstIsBullish = isBullish(firstOpen, firstClose);
    const thirdIsBearish = isBearish(thirdOpen, thirdClose);

    // Star should be smaller than both surrounding candles
    const isSmallStar = secondBodySize < firstBodySize * 0.5 && secondBodySize < thirdBodySize * 0.5;

    // Third candle should close below midpoint of first candle's body
    const firstMidpoint = (firstOpen + firstClose) / 2;
    const thirdClosesBelowMid = thirdClose < firstMidpoint;

    // Gap up from first to second (star opens above first close)
    const hasGapUp = Math.min(secondOpen, secondClose) > firstClose;

    if (firstIsBullish && thirdIsBearish && isSmallStar && thirdClosesBelowMid) {
      const reliability = hasGapUp ? 0.8 : 0.7;
      results.push({ index: i, reliability });
    }
  }

  return results;
}

/**
 * Detect Three White Soldiers pattern
 * Strong bullish continuation: 3 consecutive green candles with progressively higher closes.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectThreeWhiteSoldiers(opens, highs, lows, closes) {
  const results = [];

  // Need at least 3 candles
  for (let i = 2; i < closes.length; i++) {
    const candles = [
      { open: opens[i - 2], close: closes[i - 2], high: highs[i - 2], low: lows[i - 2] },
      { open: opens[i - 1], close: closes[i - 1], high: highs[i - 1], low: lows[i - 1] },
      { open: opens[i], close: closes[i], high: highs[i], low: lows[i] },
    ];

    // All three must be bullish
    const allBullish = candles.every(c => isBullish(c.open, c.close));
    if (!allBullish) continue;

    // Each close should be higher than the previous
    const progressiveCloses =
      candles[1].close > candles[0].close &&
      candles[2].close > candles[1].close;

    // Each candle should open within the body of the previous candle
    const opensWithinPrevBody =
      candles[1].open >= candles[0].open && candles[1].open <= candles[0].close &&
      candles[2].open >= candles[1].open && candles[2].open <= candles[1].close;

    // Candles should have small upper shadows (strong close)
    const smallUpperShadows = candles.every(c => {
      const bodySize = getBodySize(c.open, c.close);
      const upperShadow = getUpperShadow(c.open, c.high, c.close);
      return bodySize > 0 && upperShadow / bodySize < 0.3;
    });

    if (progressiveCloses && opensWithinPrevBody && smallUpperShadows) {
      results.push({ index: i, reliability: 0.8 });
    } else if (progressiveCloses && allBullish) {
      // Less strict version
      results.push({ index: i, reliability: 0.65 });
    }
  }

  return results;
}

/**
 * Detect Three Black Crows pattern
 * Strong bearish continuation: 3 consecutive red candles with progressively lower closes.
 *
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectThreeBlackCrows(opens, highs, lows, closes) {
  const results = [];

  // Need at least 3 candles
  for (let i = 2; i < closes.length; i++) {
    const candles = [
      { open: opens[i - 2], close: closes[i - 2], high: highs[i - 2], low: lows[i - 2] },
      { open: opens[i - 1], close: closes[i - 1], high: highs[i - 1], low: lows[i - 1] },
      { open: opens[i], close: closes[i], high: highs[i], low: lows[i] },
    ];

    // All three must be bearish
    const allBearish = candles.every(c => isBearish(c.open, c.close));
    if (!allBearish) continue;

    // Each close should be lower than the previous
    const progressiveCloses =
      candles[1].close < candles[0].close &&
      candles[2].close < candles[1].close;

    // Each candle should open within the body of the previous candle
    const opensWithinPrevBody =
      candles[1].open <= candles[0].open && candles[1].open >= candles[0].close &&
      candles[2].open <= candles[1].open && candles[2].open >= candles[1].close;

    // Candles should have small lower shadows (strong close)
    const smallLowerShadows = candles.every(c => {
      const bodySize = getBodySize(c.open, c.close);
      const lowerShadow = getLowerShadow(c.open, c.low, c.close);
      return bodySize > 0 && lowerShadow / bodySize < 0.3;
    });

    if (progressiveCloses && opensWithinPrevBody && smallLowerShadows) {
      results.push({ index: i, reliability: 0.8 });
    } else if (progressiveCloses && allBearish) {
      // Less strict version
      results.push({ index: i, reliability: 0.65 });
    }
  }

  return results;
}

/**
 * Main dispatcher function to detect a specific pattern
 *
 * @param {string} patternId - The pattern ID to detect
 * @param {number[]} opens - Array of open prices
 * @param {number[]} highs - Array of high prices
 * @param {number[]} lows - Array of low prices
 * @param {number[]} closes - Array of close prices
 * @returns {Array<{index: number, reliability: number}>} Detected patterns
 */
export function detectPattern(patternId, opens, highs, lows, closes) {
  // Validate input
  if (!opens || !highs || !lows || !closes || opens.length === 0) {
    return [];
  }

  switch (patternId) {
    case 'doji':
      return detectDoji(opens, highs, lows, closes);
    case 'hammer':
      return detectHammer(opens, highs, lows, closes);
    case 'inverted_hammer':
      return detectInvertedHammer(opens, highs, lows, closes);
    case 'bullish_engulfing':
      return detectBullishEngulfing(opens, highs, lows, closes);
    case 'bearish_engulfing':
      return detectBearishEngulfing(opens, highs, lows, closes);
    case 'morning_star':
      return detectMorningStar(opens, highs, lows, closes);
    case 'evening_star':
      return detectEveningStar(opens, highs, lows, closes);
    case 'three_white_soldiers':
      return detectThreeWhiteSoldiers(opens, highs, lows, closes);
    case 'three_black_crows':
      return detectThreeBlackCrows(opens, highs, lows, closes);
    default:
      console.warn(`Unknown pattern: ${patternId}`);
      return [];
  }
}
