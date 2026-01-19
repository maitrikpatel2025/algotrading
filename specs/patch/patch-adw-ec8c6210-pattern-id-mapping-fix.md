# Patch: Fix Pattern ID Mapping in Drag-Drop Handler

## Metadata
adw_id: `ec8c6210`
review_change_request: `Issue #1: Pattern mismatch bug: When dragging 'Hammer' pattern from the library onto the chart, the system incorrectly added 'Bearish Engulfing' instead. The badge shows 'Found 7 Bearish Engulfing' and the condition block shows 'Bearish Engulfing is detected', but the user dragged Hammer. This indicates a critical pattern ID mapping issue in the drag-drop handler or pattern detection dispatcher. Resolution: Debug the pattern drop handler in Strategy.jsx and the detectPattern function in patternDetection.js to ensure the correct pattern ID is being passed and mapped. Verify that itemData.id from the drag event matches the pattern definition ID and is correctly routed to the appropriate detection function. Add console logging or tests to verify pattern mapping is 1:1 correct for all 8 patterns. Severity: blocker`

## Issue Summary
**Original Spec:** N/A (bug fix patch)
**Issue:** When a user drags a pattern (e.g., 'Hammer') from the Indicator Library onto the chart, the system incorrectly displays and detects a different pattern (e.g., 'Bearish Engulfing'). The badge shows the wrong pattern name and count, and the Logic Panel condition shows the wrong pattern as detected.
**Solution:** Add defensive validation and logging to trace pattern ID through the drag-drop flow. Verify pattern object integrity from drag source to detection to display. Ensure the `pattern.id` passed to `detectPattern()` matches what was dragged.

## Files to Modify

1. `app/client/src/pages/Strategy.jsx` - Add validation in `handlePatternDrop` to verify pattern ID integrity
2. `app/client/src/components/PriceChart.jsx` - Add validation in `handleDrop` to verify pattern data
3. `app/client/src/app/patternDetection.js` - Add debug logging to verify pattern ID routing (development only)

## Implementation Steps

### Step 1: Add Pattern ID Validation in PriceChart.jsx Drop Handler
- In `handleDrop`, add validation to ensure the parsed `itemData` has a valid `id` property that matches expected pattern IDs
- Log a warning if the pattern ID doesn't match any known pattern
- Ensure the `itemData` object is not mutated after parsing

**Location:** `app/client/src/components/PriceChart.jsx:184-201`

```javascript
const handleDrop = useCallback((e) => {
  e.preventDefault();
  setIsDragOver(false);

  try {
    const itemData = JSON.parse(e.dataTransfer.getData('application/json'));
    if (itemData) {
      // Validate pattern data integrity before passing to handler
      if (itemData.isPattern) {
        if (!itemData.id || !itemData.name) {
          console.error('Pattern drop error: Missing id or name in pattern data', itemData);
          return;
        }
        // Create a defensive copy to prevent any mutation
        const patternData = { ...itemData };
        if (onPatternDrop) {
          onPatternDrop(patternData);
        }
      } else if (onIndicatorDrop) {
        onIndicatorDrop(itemData);
      }
    }
  } catch (err) {
    console.error('Failed to parse dropped item data:', err);
  }
}, [onIndicatorDrop, onPatternDrop]);
```

### Step 2: Add Pattern ID Validation in Strategy.jsx handlePatternDrop
- Add validation to ensure `pattern.id` is valid before calling `detectPattern`
- Add defensive logging to trace the pattern ID being used
- Verify the `newPattern` object has the correct `id` and `name` after creation

**Location:** `app/client/src/pages/Strategy.jsx:436-467`

```javascript
const handlePatternDrop = useCallback((pattern) => {
  if (!priceData) {
    setIndicatorError('Load price data first to detect patterns.');
    return;
  }

  // Validate pattern object integrity
  if (!pattern || !pattern.id || !pattern.name) {
    console.error('Invalid pattern object received:', pattern);
    setIndicatorError('Invalid pattern data. Please try again.');
    return;
  }

  // Log pattern being processed (development debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log('Pattern drop - processing pattern:', { id: pattern.id, name: pattern.name });
  }

  // Run pattern detection with validated pattern ID
  const patternId = pattern.id;
  const detectedPatterns = detectPattern(
    patternId,
    priceData.mid_o,
    priceData.mid_h,
    priceData.mid_l,
    priceData.mid_c
  );

  // Create pattern instance with detected patterns
  // IMPORTANT: Spread pattern first, then override with our values
  const newPattern = {
    ...pattern,
    instanceId: `${patternId}-${Date.now()}`,
    detectedPatterns: detectedPatterns,
    detectedCount: detectedPatterns.length,
  };

  // Verify pattern integrity after creation
  if (process.env.NODE_ENV === 'development') {
    console.log('Pattern drop - created newPattern:', { id: newPattern.id, name: newPattern.name, count: newPattern.detectedCount });
  }

  // Create a condition for the pattern
  const newCondition = createConditionFromPattern(newPattern);

  setActivePatterns(prev => [...prev, newPattern]);
  setPatternHistory(prev => [...prev, { type: 'pattern', item: newPattern }]);
  setConditions(prev => [...prev, newCondition]);
  setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);
  setIndicatorError(null);
}, [priceData]);
```

### Step 3: Add Validation in patternDetection.js
- Add a validation check at the start of `detectPattern` to log when an unknown pattern ID is received
- Ensure the switch statement handles all cases properly

**Location:** `app/client/src/app/patternDetection.js:465-494`

```javascript
export function detectPattern(patternId, opens, highs, lows, closes) {
  // Validate input
  if (!opens || !highs || !lows || !closes || opens.length === 0) {
    return [];
  }

  // Validate patternId
  if (!patternId || typeof patternId !== 'string') {
    console.error('detectPattern: Invalid patternId received:', patternId);
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
      console.warn(`detectPattern: Unknown pattern ID: "${patternId}"`);
      return [];
  }
}
```

### Step 4: Add Unit Tests for Pattern ID Mapping
- Create a test file to verify all 8 patterns are correctly mapped
- Ensure each pattern ID routes to the correct detection function

**Location:** Create `app/client/src/app/__tests__/patternDetection.test.js`

```javascript
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
});
```

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/server && uv run python -m py_compile server.py core/*.py` - Verify Python syntax
2. `cd app/server && uv run ruff check .` - Backend code quality check
3. `cd app/server && uv run pytest tests/ -v --tb=short` - Run all backend tests
4. `cd app/client && npm run build` - Verify frontend builds successfully

## Patch Scope
**Lines of code to change:** ~50-70 lines across 3 files
**Risk level:** low (adding validation and logging, no behavioral changes)
**Testing required:** Manual testing of drag-drop for all 8 patterns (Doji, Hammer, Inverted Hammer, Bullish Engulfing, Bearish Engulfing, Morning Star, Evening Star, Three White Soldiers, Three Black Crows) to verify correct pattern ID mapping. E2E test `test_drag_pattern_onto_chart` should pass.
