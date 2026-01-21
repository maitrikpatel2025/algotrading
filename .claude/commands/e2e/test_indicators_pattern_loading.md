# E2E Test: Indicators and Pattern Loading

Test the Strategy Builder indicator and pattern save/load functionality to validate bug fixes for Issue #98.

## User Story

As a trader
I want to save strategies with indicators, patterns, and time filters, then reload them with all metadata preserved
So that my strategies maintain their complete configuration across save/load cycles

## Test Steps

### Part 1: Strategy Creation with Indicators

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Navigate to `/strategies/new`
5. Wait for page to fully load (network idle)
6. Take a screenshot of the initial Strategy Builder page
7. **Verify** the Strategy Builder page is visible
8. **Verify** the chart is rendered

9. Load price data: Select EUR_USD, 1h, 100 candles
10. Wait for chart data to load
11. Take a screenshot of the loaded chart with price data

12. Open the Indicator Library panel
13. Find the "Trend" category
14. Take a screenshot of the indicator library

15. Drag and drop the "SMA" indicator onto the chart (or click to add)
16. Configure SMA with period 20
17. **Verify** SMA indicator appears in the active indicators list
18. **Verify** SMA line is visible on the chart
19. Take a screenshot showing the SMA indicator

20. Add a second indicator: "EMA" with period 50
21. **Verify** EMA indicator appears in the active indicators list
22. **Verify** EMA line is visible on the chart
23. Take a screenshot showing both indicators

### Part 2: Add Patterns

24. Open the Indicator Library panel
25. Find the "Patterns" section/tab
26. Take a screenshot of the pattern library

27. Drag and drop the "Hammer" pattern onto the chart
28. Wait for pattern detection to complete
29. **Verify** feedback message appears: "Found N Hammer pattern(s)" or "No Hammer patterns detected..."
30. Take a screenshot after pattern drop

31. Add a second pattern: "Doji"
32. Wait for pattern detection to complete
33. **Verify** feedback message appears for Doji pattern
34. **Verify** patterns appear in the active patterns list
35. Take a screenshot with multiple patterns added

### Part 3: Configure Time Filter

36. Open the Time Filter settings dialog
37. Enable the time filter
38. Select "Include" mode
39. Add "London" session
40. Add a custom window: 09:00 to 17:00
41. Select trading days: Monday through Friday
42. **Verify** time filter settings are displayed in the UI
43. Take a screenshot showing time filter configuration
44. Save the time filter settings

### Part 4: Save Strategy via Dialog

45. Click "Save Strategy" button
46. Enter strategy name: "E2E Test Indicators Patterns Strategy"
47. Enter description: "Test strategy with indicators, patterns, and time filters"
48. Add tags: ["test", "e2e", "indicators"]
49. Click Save
50. Wait for save to complete
51. **Verify** success message appears: "Strategy 'E2E Test Indicators Patterns Strategy' saved successfully"
52. Take a screenshot of the save confirmation

### Part 5: Load Strategy via Dialog

53. Click "Load Strategy" button to open the load dialog
54. Find "E2E Test Indicators Patterns Strategy" in the strategy list
55. Take a screenshot of the load dialog
56. Select the strategy
57. Wait for load to complete
58. **Verify** success message appears: "Strategy 'E2E Test Indicators Patterns Strategy' loaded successfully"
59. **Verify** chart refreshes with the pair and timeframe
60. Take a screenshot after load

61. **Verify** all indicators are loaded:
    - SMA (20) is visible in the active indicators list
    - EMA (50) is visible in the active indicators list
    - Both indicators have correct parameters (period values)
    - Both indicators have correct colors and line styles
62. Take a screenshot showing restored indicators

63. **Verify** all patterns are loaded:
    - Hammer pattern is visible in the active patterns list
    - Doji pattern is visible in the active patterns list
    - Patterns have metadata: patternType, candleCount, reliability
64. Take a screenshot showing restored patterns

65. **Verify** time filter is restored:
    - Time filter is enabled
    - Mode is "Include"
    - London session is selected
    - Custom window 09:00-17:00 is present
    - Trading days are Monday-Friday
66. Take a screenshot showing restored time filter

### Part 6: Load Strategy via URL

67. Note the strategy ID from the URL or database
68. Navigate to `/strategies/{id}/edit` (replace {id} with actual strategy ID)
69. Wait for page load
70. **Verify** success toast appears: "Strategy 'E2E Test Indicators Patterns Strategy' loaded successfully"
71. **Verify** chart refreshes automatically (not stale)
72. Take a screenshot showing URL load

73. **Verify** all indicators are loaded with metadata preserved
74. **Verify** all patterns are loaded with metadata preserved
75. **Verify** time filter is restored correctly
76. Take a screenshot showing fully loaded strategy

### Part 7: Test Error Handling with Invalid Indicators

77. Navigate to `/strategies/new` (start fresh)
78. Wait for page load

79. Create a test strategy with invalid indicator via console:
```javascript
// Simulate loading a strategy with invalid indicator ID
const strategy = {
  name: "Test Invalid Indicator",
  pair: "EUR_USD",
  timeframe: "H1",
  candle_count: 100,
  indicators: [
    { id: "invalid_indicator_xyz", instance_id: "invalid_1", params: {} }
  ],
  patterns: [],
  conditions: [],
  groups: []
};
```

80. Manually trigger strategy load with invalid data (via browser console if needed)
81. **Verify** specific error message appears: "1 indicator(s) skipped due to missing definitions: invalid_indicator_xyz"
82. **Verify** error message includes the specific indicator ID
83. Take a screenshot showing the specific error message

### Part 8: Test Error Handling with Invalid Patterns

84. Navigate to `/strategies/new` (start fresh)
85. Wait for page load

86. Create a test strategy with invalid pattern via console:
```javascript
// Simulate loading a strategy with invalid pattern ID
const strategy = {
  name: "Test Invalid Pattern",
  pair: "EUR_USD",
  timeframe: "H1",
  candle_count: 100,
  indicators: [],
  patterns: [
    { id: "invalid_pattern_xyz", instance_id: "invalid_1" }
  ],
  conditions: [],
  groups: []
};
```

87. Manually trigger strategy load with invalid data
88. **Verify** specific error message appears: "1 pattern(s) skipped due to missing definitions: invalid_pattern_xyz"
89. **Verify** error message includes the specific pattern ID
90. Take a screenshot showing the specific error message

### Part 9: Test Time Filter Round-Trip

91. Navigate to `/strategies/new` (start fresh)
92. Wait for page load

93. Load price data: EUR_USD, 1h, 100 candles
94. Configure time filter:
    - Enable time filter
    - Mode: Include
    - Sessions: London + New York
    - Custom window: 14:00 to 22:00
    - Days: Monday, Wednesday, Friday
    - Timezone: UTC

95. Save strategy as "E2E Time Filter Test"
96. Wait for save to complete
97. **Verify** success message appears

98. Refresh the page (navigate to `/strategies/new`)
99. Load the "E2E Time Filter Test" strategy
100. **Verify** time filter settings are restored exactly:
     - Enabled: true
     - Mode: Include
     - Sessions: Empty (converted to custom window)
     - Custom window: 14:00 to 22:00 (from first session/window)
     - Days: Monday, Wednesday, Friday (strings converted to indices and back)
     - Timezone: UTC
101. Take a screenshot showing restored time filter

### Part 10: Cleanup

102. Delete the test strategies:
     - "E2E Test Indicators Patterns Strategy"
     - "E2E Time Filter Test"
103. **Verify** strategies are removed from the strategy list
104. Close browser

## Success Criteria

All test steps must pass without errors. Specifically:

1. ✅ Indicators load correctly with all metadata preserved (params, colors, line styles)
2. ✅ Patterns load with full metadata (patternType, candleCount, reliability)
3. ✅ Time filters save and restore correctly (sessions/customWindows convert properly)
4. ✅ Conditions and groups remain intact when references are valid
5. ✅ URL-based load refreshes chart and shows success toast
6. ✅ Dialog-based load refreshes chart and shows success toast
7. ✅ Error messages are specific when indicators/patterns are missing (include IDs)
8. ✅ Pattern detection provides user feedback (count or "not found" message)
9. ✅ All indicator metadata round-trips correctly (no data loss)
10. ✅ All pattern metadata round-trips correctly (no data loss)

## Failure Conditions

The test fails if ANY of these occur:

- ❌ Indicators marked as "unknown" and removed during load
- ❌ Patterns load without metadata (missing patternType, candleCount, reliability)
- ❌ Time filter settings are lost or corrupted during save/load
- ❌ Generic error messages without specific indicator/pattern IDs
- ❌ URL-based load doesn't refresh chart
- ❌ No success toast shown on URL-based load
- ❌ Indicator validation uses array access instead of getIndicatorById
- ❌ Any step throws an unhandled error or times out
- ❌ Conditions/groups removed when references are valid
- ❌ Time filter days convert incorrectly (strings ↔ indices)

## Notes

- If Supabase is not configured, database save/load tests will fail (expected)
- Use EUR_USD 1h 100 candles for reliable pattern detection
- Screenshots should clearly show UI state, error messages, and loaded data
- Test file naming: `01_initial_page.png`, `02_indicators_added.png`, etc.
- Verify that INDICATORS array is accessed via getIndicatorById (not INDICATORS[ind.id])
- Verify that time filter conversion functions are used in save/load paths
- Verify that validatePatterns function is called during pattern restoration
