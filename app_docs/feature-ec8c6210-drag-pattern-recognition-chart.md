# Drag Pattern Recognition onto Chart

**ADW ID:** ec8c6210
**Date:** 2026-01-19
**Specification:** specs/issue-54-adw-ec8c6210-sdlc_planner-drag-pattern-recognition-chart.md

## Overview

This feature enables traders to drag candlestick pattern recognition items from a pattern library onto the price chart. When a pattern is dropped, the system scans the visible candlestick data to detect occurrences of that pattern, highlighting detected patterns with colored markers (green for bullish, red for bearish) and automatically creating condition blocks for strategy building.

## What Was Built

- **Pattern Library**: A new "Patterns" category in the Indicator Library with 9 candlestick patterns (Doji, Hammer, Inverted Hammer, Bullish Engulfing, Bearish Engulfing, Morning Star, Evening Star, Three White Soldiers, Three Black Crows)
- **Pattern Detection Algorithms**: Pure JavaScript functions for detecting each candlestick pattern in OHLC price data with reliability scoring
- **Chart Pattern Markers**: Visual markers (triangle-down) positioned above candles where patterns are detected, color-coded by pattern type
- **Pattern Count Badges**: Display showing number of detected patterns (e.g., "Found 5 Hammer patterns")
- **Auto-Condition Creation**: Automatic creation of "When [Pattern] is detected" condition blocks when patterns are dropped
- **Undo Support**: Ctrl+Z support for removing patterns and their associated conditions

## Technical Implementation

### Files Modified

- `app/client/src/app/patterns.js`: New file defining pattern metadata (id, name, type, description, reliability, color)
- `app/client/src/app/patternDetection.js`: New file with pattern detection algorithms for all 9 patterns
- `app/client/src/app/chart.js`: Extended to render pattern marker traces using Plotly scatter plots
- `app/client/src/app/conditionDefaults.js`: Extended with `createConditionFromPattern()` function and `is_detected` operator
- `app/client/src/components/IndicatorLibrary.jsx`: Extended to include Patterns category with drag-drop support
- `app/client/src/components/PriceChart.jsx`: Extended to handle pattern drops and display pattern count badges
- `app/client/src/components/ConditionBlock.jsx`: Updated to handle pattern-type conditions
- `app/client/src/pages/Strategy.jsx`: Added pattern state management, drop handling, and undo support
- `app/server/core/openfx_api.py`: Added mock price data fallback for development testing
- `app/server/config/settings.py`: Added mock data configuration flag

### Key Changes

- **Pattern Definitions** (`patterns.js`): Defines 9 candlestick patterns with metadata including `patternType` (bullish/bearish/neutral), `candleCount`, `reliability` scores, and color coding
- **Detection Algorithms** (`patternDetection.js`): Implements detection logic for each pattern using OHLC data analysis with configurable thresholds
- **Chart Rendering** (`chart.js`): `createPatternMarkerTraces()` creates scatter traces with triangle markers positioned above detected candles with hover tooltips showing pattern name, date/time, and reliability percentage
- **Unified Library** (`IndicatorLibrary.jsx`): Combines indicators and patterns in a single library with `isPattern` flag, colored drag images, and pattern type indicator dots
- **State Management** (`Strategy.jsx`): Manages `activePatterns` and `patternHistory` states separately from indicators, with full undo support

## How to Use

1. Navigate to the Strategy page
2. Expand the "Patterns" category in the left sidebar Indicator Library
3. Drag a pattern (e.g., "Hammer") onto the price chart
4. View the detected patterns as colored markers above relevant candles
5. Hover over a marker to see the pattern name, date/time, and reliability score
6. Check the pattern count badge below the chart (e.g., "Found 5 Hammer patterns")
7. View the auto-created condition block in the Logic Panel ("When Hammer is detected")
8. Use Ctrl+Z to undo and remove the pattern and its condition
9. Click the X button on a pattern badge to remove it (with confirmation if conditions exist)

## Configuration

- Mock price data can be enabled via `app/server/config/settings.py` by setting `USE_MOCK_PRICE_DATA = True`
- Pattern detection thresholds are configurable in individual detection functions in `patternDetection.js`

## Testing

### Unit Tests
- `app/client/src/app/__tests__/patternDetection.test.js`: Tests for pattern detection algorithms
- `app/server/tests/core/test_openfx_api.py`: Tests for mock price data fallback

### E2E Test
- `.claude/commands/e2e/test_drag_pattern_onto_chart.md`: End-to-end test specification for the complete pattern recognition workflow

### Validation Commands
```bash
cd app/server && uv run pytest  # Server tests
cd app/client && npm run build  # Frontend build
```

## Notes

- Pattern detection is performed client-side for immediate feedback
- Pattern state is session-only and not persisted to backend (consistent with indicator behavior)
- Reliability scores are heuristic-based and can be refined based on pattern characteristics
- Multi-candle patterns (Morning Star, Evening Star, Three White/Black) require at least 3 candles of data
- The pattern system is designed to be extensible - additional patterns can be added by following the same structure in `patterns.js` and `patternDetection.js`
