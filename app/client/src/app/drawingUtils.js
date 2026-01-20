/**
 * Drawing Utility Functions
 *
 * Helper functions for drawing calculations including Fibonacci levels,
 * trendline slope calculations, snap-to-price functionality, and more.
 */

import {
  DRAWING_TOOLS,
  FIBONACCI_DEFAULT_LEVELS,
  FIBONACCI_EXTENSION_LEVELS,
} from './drawingTypes';

/**
 * Generate a unique drawing ID
 * @returns {string} Unique drawing ID
 */
export function generateDrawingId() {
  return `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate Fibonacci retracement price levels
 * @param {number} startPrice - The starting price (swing low/high)
 * @param {number} endPrice - The ending price (swing high/low)
 * @param {Array} levels - Array of level objects with value property (0-1 for retracement, >1 for extension)
 * @returns {Array} Array of { level, value, price } objects
 */
export function calculateFibonacciLevels(startPrice, endPrice, levels = FIBONACCI_DEFAULT_LEVELS) {
  const priceRange = endPrice - startPrice;

  return levels.map(level => ({
    ...level,
    price: startPrice + (priceRange * level.value),
  }));
}

/**
 * Calculate all Fibonacci levels including extensions
 * @param {number} startPrice - The starting price
 * @param {number} endPrice - The ending price
 * @param {Array} retracementLevels - Retracement level settings
 * @param {Array} extensionLevels - Extension level settings
 * @returns {Array} Combined array of all enabled levels with prices
 */
export function calculateAllFibonacciLevels(
  startPrice,
  endPrice,
  retracementLevels = FIBONACCI_DEFAULT_LEVELS,
  extensionLevels = FIBONACCI_EXTENSION_LEVELS
) {
  const allLevels = [
    ...retracementLevels.filter(l => l.enabled),
    ...extensionLevels.filter(l => l.enabled),
  ];

  return calculateFibonacciLevels(startPrice, endPrice, allLevels);
}

/**
 * Calculate the slope and angle of a trendline
 * @param {Object} point1 - First point { time, price }
 * @param {Object} point2 - Second point { time, price }
 * @returns {Object} { slope, angleDegrees, angleDisplay }
 */
export function calculateTrendlineSlope(point1, point2) {
  if (!point1 || !point2) {
    return { slope: 0, angleDegrees: 0, angleDisplay: '0°' };
  }

  const time1 = new Date(point1.time).getTime();
  const time2 = new Date(point2.time).getTime();

  if (time1 === time2) {
    // Vertical line
    return {
      slope: Infinity,
      angleDegrees: 90,
      angleDisplay: '90°',
    };
  }

  // Calculate slope (price change per millisecond)
  const slope = (point2.price - point1.price) / (time2 - time1);

  // For display purposes, calculate angle in a normalized coordinate system
  // We use a ratio to make the angle meaningful (price units per hour)
  const priceChangePerHour = slope * 3600000; // ms to hour

  // Calculate angle in degrees (atan gives radians)
  // Scale factor to make angles more intuitive (adjust based on typical price movements)
  const scaledSlope = priceChangePerHour * 10000; // Adjust scale for visual representation
  const angleDegrees = Math.atan(scaledSlope) * (180 / Math.PI);

  return {
    slope: slope,
    angleDegrees: angleDegrees,
    angleDisplay: `${angleDegrees.toFixed(1)}°`,
  };
}

/**
 * Snap a price value to the nearest OHLC value within tolerance
 * @param {number} price - The input price
 * @param {Object} candleData - Object with { time, open, high, low, close } at the clicked point
 * @param {number} tolerance - Tolerance as a fraction of price range (default 0.01 = 1%)
 * @returns {Object} { snappedPrice, snappedTo, didSnap }
 */
export function snapToPrice(price, candleData, tolerance = 0.01) {
  if (!candleData) {
    return { snappedPrice: price, snappedTo: null, didSnap: false };
  }

  const { open, high, low, close } = candleData;
  const priceRange = high - low;
  const snapTolerance = priceRange * tolerance;

  // Calculate distances to each OHLC value
  const distances = [
    { value: open, name: 'Open', distance: Math.abs(price - open) },
    { value: high, name: 'High', distance: Math.abs(price - high) },
    { value: low, name: 'Low', distance: Math.abs(price - low) },
    { value: close, name: 'Close', distance: Math.abs(price - close) },
  ];

  // Find the closest OHLC value
  const closest = distances.reduce((min, curr) =>
    curr.distance < min.distance ? curr : min
  );

  // Check if within tolerance
  if (closest.distance <= snapTolerance) {
    return {
      snappedPrice: closest.value,
      snappedTo: closest.name,
      didSnap: true,
    };
  }

  return { snappedPrice: price, snappedTo: null, didSnap: false };
}

/**
 * Find the nearest OHLC values for a given time and price in price data
 * @param {number} clickTime - The clicked time (timestamp)
 * @param {number} clickPrice - The clicked price
 * @param {Object} priceData - The full price data object with time, mid_o, mid_h, mid_l, mid_c arrays
 * @param {number} tolerance - Price tolerance as fraction (default 0.02 = 2%)
 * @returns {Object} { candle, snappedPrice, snappedTo, didSnap }
 */
export function findNearestOHLC(clickTime, clickPrice, priceData, tolerance = 0.02) {
  if (!priceData || !priceData.time || priceData.time.length === 0) {
    return { candle: null, snappedPrice: clickPrice, snappedTo: null, didSnap: false };
  }

  // Find the closest candle by time
  let closestIndex = 0;
  let closestTimeDiff = Infinity;

  for (let i = 0; i < priceData.time.length; i++) {
    const candleTime = new Date(priceData.time[i]).getTime();
    const timeDiff = Math.abs(candleTime - clickTime);
    if (timeDiff < closestTimeDiff) {
      closestTimeDiff = timeDiff;
      closestIndex = i;
    }
  }

  const candle = {
    time: priceData.time[closestIndex],
    open: priceData.mid_o[closestIndex],
    high: priceData.mid_h[closestIndex],
    low: priceData.mid_l[closestIndex],
    close: priceData.mid_c[closestIndex],
  };

  // Now snap to the nearest OHLC value of this candle
  const snapResult = snapToPrice(clickPrice, candle, tolerance);

  return {
    candle,
    snappedPrice: snapResult.snappedPrice,
    snappedTo: snapResult.snappedTo,
    didSnap: snapResult.didSnap,
  };
}

/**
 * Get a display name for a drawing
 * @param {Object} drawing - The drawing object
 * @returns {string} Human-readable display name
 */
export function getDrawingDisplayName(drawing) {
  if (!drawing) return 'Unknown Drawing';

  switch (drawing.type) {
    case DRAWING_TOOLS.HORIZONTAL_LINE:
      if (drawing.label) {
        return drawing.label;
      }
      // Format price to appropriate decimal places (usually 4-5 for forex)
      const priceStr = drawing.price !== undefined ? drawing.price.toFixed(5) : '?';
      return `Horizontal Line @ ${priceStr}`;

    case DRAWING_TOOLS.TRENDLINE:
      if (drawing.label) {
        return drawing.label;
      }
      return 'Trendline';

    case DRAWING_TOOLS.FIBONACCI:
      return 'Fibonacci Retracement';

    default:
      return 'Drawing';
  }
}

/**
 * Check if a drawing is within valid bounds of the price data
 * @param {Object} drawing - The drawing object
 * @param {Object} priceData - The price data with time, mid_h, mid_l arrays
 * @returns {boolean} True if the drawing is within valid bounds
 */
export function isDrawingWithinBounds(drawing, priceData) {
  if (!drawing || !priceData || !priceData.time || priceData.time.length === 0) {
    return false;
  }

  const dataStartTime = new Date(priceData.time[0]).getTime();
  const dataEndTime = new Date(priceData.time[priceData.time.length - 1]).getTime();

  // Calculate min/max prices in the data
  const minPrice = Math.min(...priceData.mid_l);
  const maxPrice = Math.max(...priceData.mid_h);

  switch (drawing.type) {
    case DRAWING_TOOLS.HORIZONTAL_LINE:
      // Horizontal line is within bounds if its price is within the price range
      return drawing.price >= minPrice && drawing.price <= maxPrice;

    case DRAWING_TOOLS.TRENDLINE:
      // Trendline is within bounds if at least one point is within time range
      const p1Time = new Date(drawing.point1.time).getTime();
      const p2Time = new Date(drawing.point2.time).getTime();
      return (p1Time >= dataStartTime && p1Time <= dataEndTime) ||
             (p2Time >= dataStartTime && p2Time <= dataEndTime);

    case DRAWING_TOOLS.FIBONACCI:
      // Fibonacci is within bounds if the price range overlaps with data
      const fibStartTime = new Date(drawing.startPoint.time).getTime();
      const fibEndTime = new Date(drawing.endPoint.time).getTime();
      return (fibStartTime >= dataStartTime && fibStartTime <= dataEndTime) ||
             (fibEndTime >= dataStartTime && fibEndTime <= dataEndTime);

    default:
      return true;
  }
}

/**
 * Calculate extended trendline endpoints
 * @param {Object} startPoint - Start point { time, price }
 * @param {Object} endPoint - End point { time, price }
 * @param {boolean} extendLeft - Whether to extend to the left
 * @param {boolean} extendRight - Whether to extend to the right
 * @param {Object} dataRange - { startTime, endTime } of the chart data
 * @returns {Object} { extendedStart, extendedEnd }
 */
export function extendTrendline(startPoint, endPoint, extendLeft, extendRight, dataRange) {
  if (!startPoint || !endPoint || !dataRange) {
    return { extendedStart: startPoint, extendedEnd: endPoint };
  }

  const startTime = new Date(startPoint.time).getTime();
  const endTime = new Date(endPoint.time).getTime();
  const slope = calculateTrendlineSlope(startPoint, endPoint).slope;

  let extendedStart = { ...startPoint };
  let extendedEnd = { ...endPoint };

  if (extendLeft && dataRange.startTime) {
    const dataStartTime = new Date(dataRange.startTime).getTime();
    const timeDiff = startTime - dataStartTime;
    if (timeDiff > 0) {
      const newPrice = startPoint.price - (slope * timeDiff);
      extendedStart = {
        time: dataRange.startTime,
        price: newPrice,
      };
    }
  }

  if (extendRight && dataRange.endTime) {
    const dataEndTime = new Date(dataRange.endTime).getTime();
    const timeDiff = dataEndTime - endTime;
    if (timeDiff > 0) {
      const newPrice = endPoint.price + (slope * timeDiff);
      extendedEnd = {
        time: dataRange.endTime,
        price: newPrice,
      };
    }
  }

  return { extendedStart, extendedEnd };
}

/**
 * Create a parallel trendline based on an existing trendline
 * @param {Object} originalTrendline - The original trendline drawing
 * @param {Object} clickPoint - The point where the user clicked { time, price }
 * @returns {Object} New trendline drawing with parallel positioning
 */
export function createParallelTrendline(originalTrendline, clickPoint) {
  if (!originalTrendline || !clickPoint) {
    return null;
  }

  // Calculate the vertical offset from the original line to the click point
  // First, find where the click time intersects the original line
  const startTime = new Date(originalTrendline.point1.time).getTime();
  const endTime = new Date(originalTrendline.point2.time).getTime();
  const clickTime = new Date(clickPoint.time).getTime();

  // Linear interpolation to find the price on the original line at click time
  const t = (clickTime - startTime) / (endTime - startTime);
  const interpolatedPrice = originalTrendline.point1.price +
    t * (originalTrendline.point2.price - originalTrendline.point1.price);

  // Calculate the offset
  const priceOffset = clickPoint.price - interpolatedPrice;

  // Create new points with the same time coordinates but offset prices
  return {
    point1: {
      time: originalTrendline.point1.time,
      price: originalTrendline.point1.price + priceOffset,
    },
    point2: {
      time: originalTrendline.point2.time,
      price: originalTrendline.point2.price + priceOffset,
    },
  };
}

/**
 * Snap a trendline point to candle high or low
 * @param {Object} point - The point { time, price }
 * @param {Object} priceData - The price data
 * @param {string} snapMode - 'high', 'low', or 'auto'
 * @returns {Object} Snapped point { time, price }
 */
export function snapToCandle(point, priceData, snapMode = 'auto') {
  if (!point || !priceData || !priceData.time) {
    return point;
  }

  // Find the closest candle
  const clickTime = new Date(point.time).getTime();
  let closestIndex = 0;
  let closestTimeDiff = Infinity;

  for (let i = 0; i < priceData.time.length; i++) {
    const candleTime = new Date(priceData.time[i]).getTime();
    const timeDiff = Math.abs(candleTime - clickTime);
    if (timeDiff < closestTimeDiff) {
      closestTimeDiff = timeDiff;
      closestIndex = i;
    }
  }

  const high = priceData.mid_h[closestIndex];
  const low = priceData.mid_l[closestIndex];

  let snappedPrice;
  if (snapMode === 'high') {
    snappedPrice = high;
  } else if (snapMode === 'low') {
    snappedPrice = low;
  } else {
    // Auto: snap to whichever is closer
    snappedPrice = Math.abs(point.price - high) < Math.abs(point.price - low) ? high : low;
  }

  return {
    time: priceData.time[closestIndex],
    price: snappedPrice,
  };
}

/**
 * Find conditions that use a specific drawing
 * @param {string} drawingId - The drawing ID
 * @param {Array} conditions - Array of all conditions
 * @returns {Array} Conditions that reference this drawing
 */
export function findConditionsUsingDrawing(drawingId, conditions) {
  if (!drawingId || !conditions || !Array.isArray(conditions)) {
    return [];
  }

  return conditions.filter(c => {
    // Check left operand
    if (c.leftOperand?.type === 'horizontalLine' && c.leftOperand?.drawingId === drawingId) {
      return true;
    }
    // Check right operand
    if (c.rightOperand?.type === 'horizontalLine' && c.rightOperand?.drawingId === drawingId) {
      return true;
    }
    return false;
  });
}

/**
 * Validate a drawing object structure
 * @param {Object} drawing - The drawing to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateDrawing(drawing) {
  const errors = [];

  if (!drawing) {
    return { isValid: false, errors: ['Drawing is undefined'] };
  }

  if (!drawing.id) {
    errors.push('Drawing ID is missing');
  }

  if (!drawing.type) {
    errors.push('Drawing type is missing');
  }

  switch (drawing.type) {
    case DRAWING_TOOLS.HORIZONTAL_LINE:
      if (drawing.price === undefined || drawing.price === null) {
        errors.push('Horizontal line price is missing');
      }
      if (typeof drawing.price !== 'number' || isNaN(drawing.price)) {
        errors.push('Horizontal line price must be a valid number');
      }
      break;

    case DRAWING_TOOLS.TRENDLINE:
      if (!drawing.point1 || !drawing.point1.time || drawing.point1.price === undefined) {
        errors.push('Trendline point1 is invalid');
      }
      if (!drawing.point2 || !drawing.point2.time || drawing.point2.price === undefined) {
        errors.push('Trendline point2 is invalid');
      }
      break;

    case DRAWING_TOOLS.FIBONACCI:
      if (!drawing.startPoint || !drawing.startPoint.time || drawing.startPoint.price === undefined) {
        errors.push('Fibonacci startPoint is invalid');
      }
      if (!drawing.endPoint || !drawing.endPoint.time || drawing.endPoint.price === undefined) {
        errors.push('Fibonacci endPoint is invalid');
      }
      break;

    default:
      // Unknown drawing type - generic validation passed
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Serialize drawings for localStorage storage
 * @param {Array} drawings - Array of drawing objects
 * @returns {string} JSON string
 */
export function serializeDrawings(drawings) {
  if (!drawings || !Array.isArray(drawings)) {
    return '[]';
  }
  return JSON.stringify(drawings);
}

/**
 * Deserialize drawings from localStorage
 * @param {string} jsonString - JSON string from localStorage
 * @returns {Array} Array of drawing objects (empty array on error)
 */
export function deserializeDrawings(jsonString) {
  if (!jsonString) {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      console.warn('Drawings data is not an array, returning empty array');
      return [];
    }

    // Filter out invalid drawings
    return parsed.filter(drawing => {
      const validation = validateDrawing(drawing);
      if (!validation.isValid) {
        console.warn('Skipping invalid drawing during deserialization:', validation.errors);
        return false;
      }
      return true;
    });
  } catch (error) {
    console.error('Failed to deserialize drawings:', error);
    return [];
  }
}
