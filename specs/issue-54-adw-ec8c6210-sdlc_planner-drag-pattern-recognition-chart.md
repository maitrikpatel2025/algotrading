# Feature: Drag Pattern Recognition onto Chart

## Metadata
issue_number: `54`
adw_id: `ec8c6210`
issue_json: `{"number":54,"title":"Feature Drag Pattern Recognition onto Chart US-VSB-008","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nDrag Pattern Recognition onto Chart\n\nI want to drag candlestick patterns (Doji, Hammer, Engulfing, etc.) onto the chart\nSo that I can see historical occurrences and include pattern recognition in my strategy\nAcceptance Criteria:\n\n Pattern library includes: Doji, Hammer, Inverted Hammer, Engulfing (Bull/Bear), Morning Star, Evening Star, Three White Soldiers, Three Black Crows\n Dragging pattern onto chart triggers pattern scan across visible data\n Detected patterns highlighted with icon/marker above relevant candle\n Pattern tooltip on hover shows: pattern name, date/time, reliability score\n Pattern colors differentiate bullish (green marker) vs bearish (red marker)\n Pattern count displayed: \"Found 12 Hammer patterns in visible range\"\n Condition block auto-created: \"When [Pattern] is detected\""}`

## Feature Description
This feature enables traders to drag candlestick pattern recognition items from a pattern library onto the price chart. When a pattern is dropped, the system scans the visible candlestick data to detect occurrences of that pattern. Detected patterns are highlighted with colored markers (green for bullish, red for bearish) positioned above the relevant candles. Hovering over a marker displays a tooltip with the pattern name, date/time, and reliability score. The chart header shows a count of detected patterns (e.g., "Found 12 Hammer patterns in visible range"). Additionally, dropping a pattern auto-creates a condition block in the Logic Panel for strategy building.

## User Story
As a forex trader
I want to drag candlestick patterns (Doji, Hammer, Engulfing, etc.) onto the chart
So that I can see historical occurrences and include pattern recognition in my strategy

## Problem Statement
Traders need to identify candlestick patterns to make informed trading decisions. Currently, they must manually scan charts for patterns, which is time-consuming and error-prone. There is no automated way to detect and highlight patterns on the chart or integrate pattern detection into trading strategy conditions.

## Solution Statement
Implement a pattern library panel that integrates with the existing indicator library. Traders can drag patterns from the library onto the chart, triggering an automatic scan of visible candlestick data. The system will:
1. Detect pattern occurrences using candlestick pattern recognition algorithms
2. Render markers/icons above relevant candles (green for bullish, red for bearish)
3. Display tooltips on hover with pattern details and reliability scores
4. Show pattern count in the chart header
5. Auto-create condition blocks for strategy integration

## Relevant Files
Use these files to implement the feature:

**Core Pattern System (New)**
- Pattern definitions and metadata will follow the existing indicator pattern structure

**Existing Files to Extend**
- `app/client/src/app/indicators.js` - Study this file to understand indicator structure; will add pattern definitions here or create a parallel patterns.js file
- `app/client/src/app/indicatorCalculations.js` - Study this file to understand calculation patterns; will add pattern detection algorithms
- `app/client/src/app/chart.js` - Extend to render pattern markers as scatter plot annotations on the chart
- `app/client/src/app/conditionDefaults.js` - Extend to support pattern-based conditions with "is detected" operator
- `app/client/src/components/IndicatorLibrary.jsx` - Extend to include a "Patterns" category with draggable pattern items
- `app/client/src/components/PriceChart.jsx` - Already has drop zone handling; extend to handle pattern drops and display pattern count badge
- `app/client/src/components/LogicPanel.jsx` - Already supports condition blocks; will work with pattern conditions
- `app/client/src/components/ConditionBlock.jsx` - May need minor updates for pattern-specific condition display
- `app/client/src/pages/Strategy.jsx` - Extend state management to track active patterns separately from indicators

**Documentation to Read**
- `app_docs/feature-2b739aad-drag-indicator-onto-chart.md` - Understand drag-drop implementation
- `app_docs/feature-41bf1b05-auto-condition-block.md` - Understand condition auto-creation system
- `app_docs/feature-4f076469-indicator-library-panel.md` - Understand library panel structure
- `.claude/commands/test_e2e.md` - Understand E2E test format
- `.claude/commands/e2e/test_drag_indicator_onto_chart.md` - Example E2E test for drag-drop functionality

### New Files
- `app/client/src/app/patterns.js` - Pattern definitions with metadata (name, type bullish/bearish, detection function reference, reliability score, description)
- `app/client/src/app/patternDetection.js` - Pure functions for detecting each candlestick pattern in OHLC data
- `.claude/commands/e2e/test_drag_pattern_onto_chart.md` - E2E test specification for pattern recognition feature

## Implementation Plan

### Phase 1: Foundation
1. Create pattern definition system (`patterns.js`) following indicator patterns
2. Implement candlestick pattern detection algorithms (`patternDetection.js`)
3. Define the 8 required patterns: Doji, Hammer, Inverted Hammer, Engulfing (Bull/Bear), Morning Star, Evening Star, Three White Soldiers, Three Black Crows

### Phase 2: Core Implementation
1. Extend IndicatorLibrary.jsx to include a "Patterns" category with draggable pattern items
2. Add pattern drop handling to PriceChart.jsx and Strategy.jsx
3. Implement chart rendering for pattern markers (scatter plot with custom markers)
4. Add pattern count badge to chart header
5. Implement hover tooltips for pattern markers

### Phase 3: Integration
1. Extend condition system to support "When [Pattern] is detected" conditions
2. Auto-create condition blocks when patterns are dropped
3. Add pattern-specific operators to conditionDefaults.js
4. Wire up hover highlighting between condition blocks and chart markers

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand the E2E test format
- Read `.claude/commands/e2e/test_drag_indicator_onto_chart.md` as an example
- Create `.claude/commands/e2e/test_drag_pattern_onto_chart.md` with test steps for:
  - Navigating to Strategy page and loading data
  - Verifying Patterns category appears in library panel
  - Dragging a pattern (Hammer) onto the chart
  - Verifying pattern markers appear on the chart (green/red markers)
  - Hovering over a marker to verify tooltip (pattern name, date/time, reliability score)
  - Verifying pattern count badge shows (e.g., "Found X Hammer patterns")
  - Verifying condition block auto-created in Logic Panel
  - Testing multiple patterns on same chart
  - Testing pattern removal (via badge X button)
  - Testing Ctrl+Z undo for patterns

### Task 2: Create Pattern Definitions
- Create `app/client/src/app/patterns.js` with pattern metadata structure:
  ```javascript
  export const PATTERN_TYPES = {
    BULLISH: 'bullish',
    BEARISH: 'bearish',
  };

  export const PATTERNS = [
    {
      id: 'doji',
      name: 'Doji',
      shortName: 'Doji',
      category: 'Patterns',
      description: 'A candle where open and close are nearly equal, indicating indecision',
      type: PATTERN_TYPES.BULLISH, // Can be either, but neutral
      candleCount: 1, // Single candle pattern
      reliability: 0.5, // Base reliability score
      color: '#6B7280', // Gray for neutral
      defaultConditionTemplate: {
        leftOperand: 'pattern',
        operator: 'is_detected',
        rightOperand: null,
      },
    },
    // ... Hammer, Inverted Hammer, Bullish Engulfing, Bearish Engulfing,
    // Morning Star, Evening Star, Three White Soldiers, Three Black Crows
  ];
  ```
- Include all 8 required patterns with appropriate metadata
- Bullish patterns: Hammer, Bullish Engulfing, Morning Star, Three White Soldiers (green markers)
- Bearish patterns: Inverted Hammer, Bearish Engulfing, Evening Star, Three Black Crows (red markers)
- Neutral pattern: Doji (gray marker)

### Task 3: Implement Pattern Detection Algorithms
- Create `app/client/src/app/patternDetection.js` with pure detection functions
- Implement detection for each pattern using OHLC data:
  ```javascript
  // Returns array of { index, reliability } for detected patterns
  export function detectDoji(opens, highs, lows, closes, threshold = 0.001) {
    const results = [];
    for (let i = 0; i < closes.length; i++) {
      const bodySize = Math.abs(closes[i] - opens[i]);
      const totalRange = highs[i] - lows[i];
      if (totalRange > 0 && bodySize / totalRange < threshold) {
        results.push({ index: i, reliability: 0.6 });
      }
    }
    return results;
  }

  export function detectHammer(opens, highs, lows, closes) { /* ... */ }
  export function detectInvertedHammer(opens, highs, lows, closes) { /* ... */ }
  export function detectBullishEngulfing(opens, highs, lows, closes) { /* ... */ }
  export function detectBearishEngulfing(opens, highs, lows, closes) { /* ... */ }
  export function detectMorningStar(opens, highs, lows, closes) { /* ... */ }
  export function detectEveningStar(opens, highs, lows, closes) { /* ... */ }
  export function detectThreeWhiteSoldiers(opens, highs, lows, closes) { /* ... */ }
  export function detectThreeBlackCrows(opens, highs, lows, closes) { /* ... */ }

  // Main dispatcher function
  export function detectPattern(patternId, opens, highs, lows, closes) {
    switch (patternId) {
      case 'doji': return detectDoji(opens, highs, lows, closes);
      case 'hammer': return detectHammer(opens, highs, lows, closes);
      // ... etc
    }
  }
  ```
- Pattern detection criteria:
  - **Doji**: Body size < 10% of total candle range
  - **Hammer**: Small body at top, lower shadow >= 2x body, minimal upper shadow (bullish reversal)
  - **Inverted Hammer**: Small body at bottom, upper shadow >= 2x body, minimal lower shadow (bullish after downtrend)
  - **Bullish Engulfing**: Red candle followed by larger green candle that engulfs it
  - **Bearish Engulfing**: Green candle followed by larger red candle that engulfs it
  - **Morning Star**: 3-candle bullish reversal (large red, small body, large green)
  - **Evening Star**: 3-candle bearish reversal (large green, small body, large red)
  - **Three White Soldiers**: 3 consecutive green candles with higher closes
  - **Three Black Crows**: 3 consecutive red candles with lower closes

### Task 4: Extend Indicator Library with Patterns Category
- Modify `app/client/src/app/indicators.js` to import and include PATTERNS
- Update `app/client/src/components/IndicatorLibrary.jsx`:
  - Import PATTERNS from patterns.js
  - Add "Patterns" to the CATEGORIES array (or create separate category handling)
  - Combine indicators and patterns in the filtered/displayed list
  - Use pattern.type to show bullish/bearish visual hint (green/red dot)
  - Ensure drag-and-drop works for patterns (same mechanism as indicators)

### Task 5: Add Pattern Rendering to Chart
- Modify `app/client/src/app/chart.js`:
  - Create `createPatternMarkerTraces(chartData, activePatterns)` function
  - For each active pattern, run detection algorithm on chart data
  - Create scatter trace with markers positioned above candles where patterns detected:
    ```javascript
    {
      x: detectedTimes,
      y: detectedHighs.map(h => h * 1.002), // Slightly above the candle
      type: 'scatter',
      mode: 'markers+text',
      marker: {
        symbol: 'triangle-down', // or custom icon
        size: 12,
        color: pattern.type === 'bullish' ? '#22C55E' : '#EF4444',
      },
      text: pattern.shortName,
      textposition: 'top center',
      hovertemplate: `${pattern.name}<br>%{x}<br>Reliability: ${reliability}%<extra></extra>`,
      name: pattern.name,
    }
    ```
  - Update `drawChart` to accept `activePatterns` parameter and render pattern traces

### Task 6: Add Pattern State Management to Strategy Page
- Modify `app/client/src/pages/Strategy.jsx`:
  - Add `activePatterns` state array (separate from `activeIndicators`)
  - Add `patternHistory` for Ctrl+Z undo support
  - Implement `handlePatternDrop(pattern)` callback:
    - Create pattern instance with unique ID: `${pattern.id}-${Date.now()}`
    - Run pattern detection on current chart data
    - Add to activePatterns state
    - Auto-create condition block for the pattern
    - Add to history for undo
  - Implement `handlePatternRemove(instanceId)` for badge X button
  - Update Ctrl+Z handler to support pattern undo
  - Pass `activePatterns` to PriceChart component

### Task 7: Add Pattern Count Badge to Chart Header
- Modify `app/client/src/components/PriceChart.jsx`:
  - Accept `activePatterns` prop
  - Add pattern badges section similar to indicator badges
  - Show pattern count: "Found X [PatternName] patterns"
  - Add X button for pattern removal
  - Style badges with pattern color (green for bullish, red for bearish)

### Task 8: Implement Pattern Hover Tooltips
- The hover functionality is built into Plotly's hovertemplate
- Ensure tooltip shows:
  - Pattern name (e.g., "Hammer")
  - Date/time of the candle
  - Reliability score (e.g., "75%")
- Customize tooltip styling via Plotly layout hoverlabel configuration

### Task 9: Extend Condition System for Patterns
- Modify `app/client/src/app/conditionDefaults.js`:
  - Add pattern-specific operator: `{ id: 'is_detected', label: 'is detected', description: 'Pattern is detected on current candle' }`
  - Create `createConditionFromPattern(patternInstance)` function:
    ```javascript
    export function createConditionFromPattern(patternInstance) {
      return {
        id: generateConditionId(),
        patternInstanceId: patternInstance.instanceId,
        leftOperand: {
          type: 'pattern',
          instanceId: patternInstance.instanceId,
          label: patternInstance.name,
        },
        operator: 'is_detected',
        rightOperand: null, // No right operand for "is detected"
        section: CONDITION_SECTIONS.ENTRY,
        isNew: true,
      };
    }
    ```
- Update `app/client/src/components/ConditionBlock.jsx`:
  - Handle pattern-type conditions (simpler display without right operand dropdown)
  - Show pattern color accent on left border

### Task 10: Wire Up Pattern-Condition Linking
- Modify `app/client/src/pages/Strategy.jsx`:
  - In `handlePatternDrop`, call `createConditionFromPattern` and add to conditions state
  - Link pattern instance ID to condition for hover highlighting
  - When deleting a pattern, show confirmation if conditions exist
  - Use existing ConfirmDialog component for deletion confirmation

### Task 11: Run Validation Commands
- Execute all validation commands to ensure feature works correctly with zero regressions

## Testing Strategy

### Unit Tests
- Pattern detection algorithm tests in `app/server/tests/`:
  - Test each detection function with known pattern data
  - Test edge cases (empty data, single candle, insufficient data for multi-candle patterns)
  - Test threshold sensitivity for pattern detection
- Frontend component tests (if applicable):
  - Test pattern library rendering
  - Test pattern badge display

### Edge Cases
- Empty chart data (no patterns to detect)
- Very few candles (less than 3 for multi-candle patterns)
- No patterns found (display "No patterns found" in count badge)
- Multiple patterns of same type detected (handle count correctly)
- Pattern detection on chart zoom/scroll (recalculate on visible range change)
- Removing pattern while hovering over its condition block
- Undo after multiple pattern additions

## Acceptance Criteria
- [ ] Pattern library includes all 8 patterns: Doji, Hammer, Inverted Hammer, Engulfing (Bull/Bear), Morning Star, Evening Star, Three White Soldiers, Three Black Crows
- [ ] Dragging pattern onto chart triggers pattern scan across visible data
- [ ] Detected patterns highlighted with icon/marker above relevant candle
- [ ] Pattern tooltip on hover shows: pattern name, date/time, reliability score
- [ ] Pattern colors differentiate bullish (green marker) vs bearish (red marker)
- [ ] Pattern count displayed: "Found X [Pattern] patterns in visible range"
- [ ] Condition block auto-created: "When [Pattern] is detected"
- [ ] Patterns can be removed via badge X button
- [ ] Ctrl+Z undo removes last added pattern
- [ ] Server tests pass with zero regressions
- [ ] Frontend build succeeds with zero regressions
- [ ] E2E test validates the complete feature workflow

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_drag_pattern_onto_chart.md` to validate the pattern recognition feature works end-to-end
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature compiles with zero regressions

## Notes
- Pattern detection is performed client-side for immediate feedback (same approach as indicator calculations)
- Pattern state is session-only and not persisted to backend (consistent with indicator behavior)
- Reliability scores are heuristic-based and can be refined based on pattern characteristics (e.g., volume confirmation, trend context)
- Multi-candle patterns (Morning Star, Evening Star, Three White/Black) require at least 3 candles of data
- Future enhancements may include:
  - User-adjustable sensitivity thresholds for pattern detection
  - Pattern combination detection (e.g., Hammer at support level)
  - Pattern backtesting with historical performance statistics
  - Pattern alerts/notifications when detected in real-time
- The pattern system is designed to be extensible - additional patterns can be added by following the same structure
