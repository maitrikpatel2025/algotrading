# E2E Test: Strategy Import and Pattern Display

Test the Strategy Builder import workflow and pattern display functionality to validate bug fixes for Issue #91.

## User Story

As a trader
I want to import strategies and see them immediately in the UI, and visualize patterns on charts with proper feedback
So that I can efficiently manage my strategies without manual loading steps

## Test Steps

### Part 1: Strategy Import and UI Refresh

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Navigate to `/strategies/new`
5. Wait for page to fully load (network idle)
6. Take a screenshot of the initial Strategy Builder page
7. **Verify** the Strategy Builder page is visible
8. **Verify** the chart is rendered

9. Create a test strategy JSON file at `/tmp/test_strategy_import.json`:
```json
{
  "schema_version": "1.0",
  "export_date": "2026-01-21T00:00:00Z",
  "strategy": {
    "name": "E2E Test Import Strategy",
    "description": "Test strategy for import functionality",
    "tags": ["test", "e2e"],
    "trade_direction": "both",
    "confirm_on_candle_close": "yes",
    "pair": "EUR_USD",
    "timeframe": "1h",
    "candle_count": 100,
    "indicators": [
      {
        "id": "sma",
        "instance_id": "sma_1",
        "params": {
          "period": 20
        },
        "color": "#3B82F6",
        "line_width": 2,
        "line_style": "solid"
      }
    ],
    "patterns": [],
    "conditions": [],
    "groups": [],
    "reference_indicators": [],
    "drawings": []
  }
}
```

10. Click on "Import Strategy" button or menu item
11. Take a screenshot of the import dialog
12. **Verify** the import dialog is visible
13. **Verify** file upload input or drag-drop area is present

14. Upload the test strategy file `/tmp/test_strategy_import.json`
15. Wait for validation and import to complete
16. Take a screenshot after import
17. **Verify** success message appears: "Strategy 'E2E Test Import Strategy' imported successfully"
18. **Verify** the strategy name is displayed in the UI: "E2E Test Import Strategy"
19. **Verify** the imported indicator (SMA with period 20) is visible in the active indicators list
20. **Verify** the chart shows the SMA line
21. **Verify** the pair selector shows EUR_USD
22. **Verify** the timeframe shows 1h selected

### Part 2: Strategy Export Validation

23. With the imported strategy loaded, click "Export Strategy" button (from load dialog or menu)
24. Wait for file download
25. **Verify** a JSON file is downloaded (e.g., `strategy_E2E_Test_Import_Strategy_*.json`)

26. Read the exported JSON file content
27. **Verify** the exported file is valid JSON (can be parsed)
28. **Verify** the exported file has the structure: `{ "schema_version": "1.0", "export_date": "...", "strategy": {...} }`
29. **Verify** the exported file is NOT double-serialized (content should be JSON object, not a JSON string)
30. **Verify** the strategy name in the export matches: "E2E Test Import Strategy"

### Part 3: Load Strategy Error Handling

31. Navigate to `/strategies/new` (or refresh page to clear state)
32. Wait for page load
33. Take a screenshot of the clean state

34. Attempt to load a non-existent strategy by calling the load function with an invalid ID (simulate by clicking load and selecting a deleted strategy if possible, or use browser console to trigger)
35. **Verify** error message is specific and helpful (not just "Failed to load strategy")
36. **Verify** error message mentions one of: "not found", "deleted", or provides specific error details

### Part 4: Pattern Detection and Display

37. Navigate to `/strategies/new` (start fresh)
38. Wait for page load
39. Take a screenshot

40. Ensure chart is in candlestick mode (if chart type selector exists, select "Candlestick")
41. Load price data: Select EUR_USD, 1h, 100 candles
42. Wait for chart data to load
43. Take a screenshot of the loaded chart with price data

44. Open the Indicator Library panel
45. Find the "Patterns" section/tab
46. Take a screenshot of the pattern library

47. Drag and drop the "Hammer" pattern onto the chart (or click to add)
48. Wait for pattern detection to complete
49. Take a screenshot after pattern drop
50. **Verify** a feedback message appears indicating pattern detection results
51. **Verify** feedback shows either:
    - "Found N Hammer pattern(s)" (if patterns detected), OR
    - "No Hammer patterns detected in current price data..." (if no patterns found)
52. Take a screenshot showing the feedback message

53. If patterns were detected (N > 0):
    - **Verify** pattern markers (arrows or indicators) are visible on the chart
    - **Verify** markers have appropriate color (green for bullish, red for bearish, gray for neutral)
    - Take a screenshot highlighting the pattern markers

54. If no patterns were detected:
    - **Verify** no markers are visible on the chart (expected behavior)
    - **Verify** feedback message is shown to user

55. Try adding a second pattern: Drag and drop the "Doji" pattern
56. Wait for detection
57. **Verify** feedback message appears for Doji pattern
58. Take a screenshot with multiple patterns added

59. Switch chart type to "Line" (if available)
60. **Verify** pattern markers are still visible (chart type restriction removed)
61. Take a screenshot of patterns on line chart

### Part 5: End-to-End Workflow Validation

62. Save the current strategy with name "E2E Pattern Test Strategy"
63. Wait for save to complete
64. **Verify** success message appears

65. Navigate away from the strategy page (go to `/monitor` or home)
66. Navigate back to `/strategies/new`
67. Open "Load Strategy" dialog
68. Select "E2E Pattern Test Strategy"
69. Wait for load to complete
70. **Verify** strategy loads successfully with indicators and patterns
71. **Verify** pattern markers reappear on chart

72. Export the strategy
73. **Verify** export completes successfully with valid JSON

74. Delete the test strategy (if delete button available)
75. Close browser

## Success Criteria

All test steps must pass without errors. Specifically:

1. ✅ Strategy import immediately loads the strategy into the UI (indicators, conditions, patterns all visible)
2. ✅ Strategy export produces valid JSON (not double-serialized)
3. ✅ Load errors show specific, actionable error messages (not generic)
4. ✅ Pattern detection provides user feedback (count or "0 patterns found" message)
5. ✅ Pattern markers display on chart with proper colors
6. ✅ Patterns work on all chart types (not restricted to candlestick only)
7. ✅ Full workflow (import → load → export → re-import) completes successfully

## Failure Conditions

The test fails if ANY of these occur:

- ❌ Import succeeds but UI remains empty (indicators/patterns not loaded)
- ❌ Export produces invalid JSON or double-serialized string
- ❌ Load error shows only "Failed to load strategy" with no details
- ❌ Pattern drop has no user feedback (silent failure or success)
- ❌ Patterns don't appear on chart despite successful detection
- ❌ Patterns only work on candlestick chart type
- ❌ Any step throws an unhandled error or times out

## Notes

- If Supabase is not configured, some tests may fail with database errors (expected)
- Pattern detection depends on price data; use EUR_USD 1h 100 candles for reliable results
- Screenshots should clearly show UI state, error messages, and pattern markers
- Test file naming: `01_initial_page.png`, `02_import_dialog.png`, etc.
