import { detectPattern } from '../patternDetection';

// Mock OHLC data for testing
const mockOHLC = {
  opens: [1.0, 1.1, 1.2, 1.3, 1.4],
  highs: [1.2, 1.3, 1.4, 1.5, 1.6],
  lows: [0.9, 1.0, 1.1, 1.2, 1.3],
  closes: [1.1, 1.2, 1.3, 1.4, 1.5],
};

describe('detectPattern', () => {
  const patternIds = [
    'doji',
    'hammer',
    'inverted_hammer',
    'bullish_engulfing',
    'bearish_engulfing',
    'morning_star',
    'evening_star',
    'three_white_soldiers',
    'three_black_crows',
  ];

  test.each(patternIds)('should handle pattern ID "%s" without error', (patternId) => {
    expect(() => {
      detectPattern(
        patternId,
        mockOHLC.opens,
        mockOHLC.highs,
        mockOHLC.lows,
        mockOHLC.closes
      );
    }).not.toThrow();
  });

  test('should return empty array for unknown pattern ID', () => {
    const result = detectPattern(
      'unknown_pattern',
      mockOHLC.opens,
      mockOHLC.highs,
      mockOHLC.lows,
      mockOHLC.closes
    );
    expect(result).toEqual([]);
  });

  test('should return empty array for null pattern ID', () => {
    const result = detectPattern(
      null,
      mockOHLC.opens,
      mockOHLC.highs,
      mockOHLC.lows,
      mockOHLC.closes
    );
    expect(result).toEqual([]);
  });

  test('should return empty array for undefined pattern ID', () => {
    const result = detectPattern(
      undefined,
      mockOHLC.opens,
      mockOHLC.highs,
      mockOHLC.lows,
      mockOHLC.closes
    );
    expect(result).toEqual([]);
  });

  test('should return empty array for non-string pattern ID', () => {
    const result = detectPattern(
      123,
      mockOHLC.opens,
      mockOHLC.highs,
      mockOHLC.lows,
      mockOHLC.closes
    );
    expect(result).toEqual([]);
  });

  test('should return array with objects containing index and reliability', () => {
    // Doji pattern is likely to match with our mock data
    const result = detectPattern(
      'doji',
      mockOHLC.opens,
      mockOHLC.highs,
      mockOHLC.lows,
      mockOHLC.closes
    );

    // Result should be an array
    expect(Array.isArray(result)).toBe(true);

    // If there are any detections, verify structure
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('index');
      expect(result[0]).toHaveProperty('reliability');
      expect(typeof result[0].index).toBe('number');
      expect(typeof result[0].reliability).toBe('number');
    }
  });

  test('should return empty array for empty OHLC data', () => {
    const result = detectPattern('doji', [], [], [], []);
    expect(result).toEqual([]);
  });

  test('should return empty array for null OHLC data', () => {
    const result = detectPattern('doji', null, null, null, null);
    expect(result).toEqual([]);
  });
});
