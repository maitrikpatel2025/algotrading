# E2E Test: Strategy Load Failure and Recovery

Test the Strategy Builder load workflow with validation and error recovery to validate bug fixes for Issue #95.

## User Story

As a trader
I want to load saved strategies reliably, even if they contain missing indicators or broken references
So that I can recover my strategy configurations without losing all data due to partial failures

## Test Steps

### Part 1: Successful Strategy Load

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Navigate to `/strategies/new`
5. Wait for page to fully load (network idle)
6. Take a screenshot of the initial Strategy Builder page
7. **Verify** the Strategy Builder page is visible
8. **Verify** the chart is rendered

9. Create a complete test strategy:
   - Select pair: EUR_USD
   - Select timeframe: 1h
   - Select candle count: 100
   - Add indicator: SMA with period 20
   - Add indicator: EMA with period 10
   - Add pattern: Hammer
   - Add condition: "SMA (20) > Close"
   - Add condition: "EMA (10) < Open"
   - Set trade direction to "Long Only"

10. Take a screenshot of the complete strategy
11. **Verify** all indicators are visible in the active indicators list
12. **Verify** all patterns are visible
13. **Verify** all conditions are visible in the logic panel

14. Save the strategy with name "E2E Test Complete Strategy"
15. Wait for save to complete
16. Take a screenshot after save
17. **Verify** success message appears: "Strategy 'E2E Test Complete Strategy' saved successfully"

18. Clear the strategy builder (refresh page or navigate away and back)
19. Open "Load Strategy" dialog
20. Take a screenshot of the load dialog
21. **Verify** the load dialog lists saved strategies
22. **Verify** "E2E Test Complete Strategy" appears in the list

23. Select "E2E Test Complete Strategy" and load it
24. Wait for load to complete
25. Take a screenshot after load
26. **Verify** success message appears: "Strategy 'E2E Test Complete Strategy' loaded successfully"
27. **Verify** all indicators are restored (SMA, EMA)
28. **Verify** all patterns are restored (Hammer)
29. **Verify** all conditions are restored with correct references
30. **Verify** trade direction is "Long Only"
31. **Verify** pair, timeframe, and candle count are restored

### Part 2: Missing Indicator Recovery

32. Create a strategy with missing indicator by creating a JSON file at `/tmp/test_strategy_missing_indicator.json`:
```json
{
  "schema_version": "1.0",
  "export_date": "2026-01-21T00:00:00Z",
  "strategy": {
    "name": "E2E Test Missing Indicator",
    "description": "Test strategy with missing indicator",
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
      },
      {
        "id": "nonexistent_indicator",
        "instance_id": "nonexistent_1",
        "params": {
          "period": 10
        },
        "color": "#FF0000",
        "line_width": 2,
        "line_style": "solid"
      }
    ],
    "patterns": [],
    "conditions": [
      {
        "id": "cond_1",
        "section": "long_entry",
        "left_operand": {
          "type": "indicator",
          "instance_id": "sma_1"
        },
        "operator": ">",
        "right_operand": {
          "type": "price",
          "value": "close"
        },
        "indicator_instance_id": "sma_1",
        "indicator_display_name": "SMA (20)"
      }
    ],
    "groups": [],
    "reference_indicators": [],
    "drawings": []
  }
}
```

33. Navigate to `/strategies/new` (start fresh)
34. Import the test strategy file `/tmp/test_strategy_missing_indicator.json`
35. Wait for validation and import to complete
36. Take a screenshot after import
37. **Verify** error message appears indicating unknown indicator: "Strategy contains indicators not in your library: nonexistent_indicator"
38. **Verify** warning message appears: "1 indicator(s) skipped due to missing definitions"
39. **Verify** the valid indicator (SMA) is loaded and visible
40. **Verify** the condition referencing SMA is loaded and valid
41. **Verify** the strategy continues to function with partial data (no complete failure)

### Part 3: Broken Condition References

42. Create a strategy with broken condition references at `/tmp/test_strategy_broken_conditions.json`:
```json
{
  "schema_version": "1.0",
  "export_date": "2026-01-21T00:00:00Z",
  "strategy": {
    "name": "E2E Test Broken Conditions",
    "description": "Test strategy with broken condition references",
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
    "conditions": [
      {
        "id": "cond_1",
        "section": "long_entry",
        "left_operand": {
          "type": "indicator",
          "instance_id": "sma_1"
        },
        "operator": ">",
        "right_operand": {
          "type": "price",
          "value": "close"
        },
        "indicator_instance_id": "sma_1",
        "indicator_display_name": "SMA (20)"
      },
      {
        "id": "cond_2",
        "section": "long_entry",
        "left_operand": {
          "type": "indicator",
          "instance_id": "nonexistent_instance"
        },
        "operator": "<",
        "right_operand": {
          "type": "price",
          "value": "open"
        },
        "indicator_instance_id": "nonexistent_instance",
        "indicator_display_name": "Missing Indicator"
      }
    ],
    "groups": [],
    "reference_indicators": [],
    "drawings": []
  }
}
```

43. Navigate to `/strategies/new` (start fresh)
44. Import the test strategy file `/tmp/test_strategy_broken_conditions.json`
45. Wait for import to complete
46. Take a screenshot after import
47. **Verify** warning message appears: "1 condition(s) removed due to missing indicator/pattern references"
48. **Verify** the valid condition (cond_1) is loaded
49. **Verify** the broken condition (cond_2) is NOT loaded
50. **Verify** browser console shows warning: "Condition cond_2 references missing indicator instance: nonexistent_instance"
51. **Verify** the strategy continues to function with valid conditions only

### Part 4: Broken Group References

52. Create a strategy with broken group references at `/tmp/test_strategy_broken_groups.json`:
```json
{
  "schema_version": "1.0",
  "export_date": "2026-01-21T00:00:00Z",
  "strategy": {
    "name": "E2E Test Broken Groups",
    "description": "Test strategy with broken group references",
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
    "conditions": [
      {
        "id": "cond_1",
        "section": "long_entry",
        "left_operand": {
          "type": "indicator",
          "instance_id": "sma_1"
        },
        "operator": ">",
        "right_operand": {
          "type": "price",
          "value": "close"
        },
        "indicator_instance_id": "sma_1",
        "indicator_display_name": "SMA (20)"
      }
    ],
    "groups": [
      {
        "id": "group_1",
        "operator": "AND",
        "section": "long_entry",
        "condition_ids": ["cond_1"]
      },
      {
        "id": "group_2",
        "operator": "OR",
        "section": "long_entry",
        "condition_ids": ["cond_1", "nonexistent_condition"]
      }
    ],
    "reference_indicators": [],
    "drawings": []
  }
}
```

53. Navigate to `/strategies/new` (start fresh)
54. Import the test strategy file `/tmp/test_strategy_broken_groups.json`
55. Wait for import to complete
56. Take a screenshot after import
57. **Verify** warning message appears: "1 group(s) removed due to missing condition references"
58. **Verify** the valid group (group_1) is loaded
59. **Verify** the broken group (group_2) is NOT loaded
60. **Verify** browser console shows warning: "Group group_2 references missing conditions"
61. **Verify** the strategy continues to function with valid groups only

### Part 5: URL-Based Load Validation Parity

62. Save a strategy with known ID (note the strategy ID from the URL or response)
63. Navigate to `/strategies/edit/{strategy_id}` directly via URL
64. Wait for page load
65. Take a screenshot
66. **Verify** strategy loads from URL parameter
67. **Verify** same validation applies as dialog-based load
68. **Verify** if strategy has issues, appropriate warnings are shown

69. Create a malformed strategy in the database (if possible) or use browser console to simulate loading a strategy with missing data
70. Navigate to `/strategies/edit/{malformed_strategy_id}`
71. **Verify** error messages are specific and actionable
72. **Verify** user is not left with a broken UI state

### Part 6: Instance ID Preservation

73. Navigate to `/strategies/new` (start fresh)
74. Create a strategy with:
   - SMA indicator (note the instance_id from browser console: `sma_12345...`)
   - Condition referencing the SMA instance ID
75. Save the strategy as "E2E Test Instance ID"
76. Load the strategy from database
77. Open browser console
78. Inspect the loaded activeIndicators state
79. **Verify** the instance_id matches exactly what was saved (no regeneration)
80. **Verify** the condition still references the same instance_id
81. **Verify** no warnings about missing references appear

### Part 7: Atomic Loading Behavior

82. Navigate to `/strategies/new`
83. Create a valid strategy with multiple components
84. Save as "E2E Test Atomic Load"
85. Manually corrupt the saved strategy in the database (if accessible) to cause a mid-load failure
   - OR use browser console to inject an error during load
86. Attempt to load the corrupted strategy
87. **Verify** if load fails partway through, the UI does not show partial data
88. **Verify** error message explains what went wrong
89. **Verify** previous strategy state is maintained (if one existed)

### Part 8: Console Error Validation

90. Throughout all tests, monitor browser console
91. **Verify** no unhandled errors or exceptions appear
92. **Verify** all errors are caught and displayed to user
93. **Verify** warnings are logged with sufficient detail for debugging

## Success Criteria

All test steps must pass without errors. Specifically:

1. ✅ Complete strategies load successfully with all components intact
2. ✅ Missing indicators are detected and skipped with user warning
3. ✅ Valid indicators from strategies with missing ones still load
4. ✅ Conditions with broken references are removed with warning
5. ✅ Groups with broken references are removed with warning
6. ✅ URL-based loading applies the same validation as dialog-based loading
7. ✅ Instance IDs are preserved from database (never regenerated on load)
8. ✅ Error messages are specific and actionable
9. ✅ Partial failures do not break the entire load
10. ✅ No unhandled errors leak to browser console

## Failure Conditions

The test fails if ANY of these occur:

- ❌ Missing indicator causes complete strategy load failure
- ❌ Broken references cause unhandled errors
- ❌ Instance IDs are regenerated on load (breaking condition references)
- ❌ URL-based load bypasses validation (inconsistent behavior)
- ❌ Error messages are generic ("Failed to load strategy")
- ❌ UI is left in inconsistent state after partial failure
- ❌ Browser console shows unhandled errors
- ❌ Valid data is lost due to unrelated validation failures

## Notes

- If Supabase is not configured, some tests may fail with database errors (expected)
- Test files use intentionally malformed data to validate error handling
- Screenshots should clearly show UI state, warnings, and error messages
- Test file naming: `01_complete_load.png`, `02_missing_indicator.png`, etc.
- Backend deserialization tests should be run separately: `cd app/server && uv run pytest tests/core/test_strategy_service.py::TestDbRowToStrategyDeserialization -v`
