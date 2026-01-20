# E2E Test: Multi-Timeframe Conditions

Test the multi-timeframe conditions functionality in the Forex Trading Dashboard Strategy page. This feature allows users to create conditions that reference indicators on different timeframes, enabling strategies like "H4 trend is up AND M15 RSI oversold".

## User Story

As a forex trader
I want to create conditions that reference indicators on different timeframes
So that I can build strategies like "H4 trend is up AND M15 RSI oversold"

## Prerequisites

- Application must be running (frontend on localhost:3000, backend on localhost:8000)
- Price data should be loaded to enable indicator additions
- No existing reference indicators (start with clean state)

## Test Steps

### Phase 1: Initial Setup

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully
4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads with:
   - Pair selector dropdown
   - Timeframe selector dropdown
   - Load Data button
   - Logic Panel visible on the right

7. Select a currency pair (e.g., "EUR/USD")
8. Select a timeframe (e.g., "M15")
9. Click "Load Data" button
10. **Verify** the price chart loads with candlestick data
11. Take a screenshot showing the loaded chart

### Phase 2: Locate Multi-Timeframe Condition Button

12. Expand the Logic Panel if collapsed
13. Locate the "Long Entry Conditions" section
14. **Verify** there is an "Add Multi-Timeframe Condition" button (or equivalent)
15. Take a screenshot showing the button location
16. **Verify** the button is clearly distinguished from the regular "Add Condition" button

### Phase 3: Open Multi-Timeframe Condition Dialog

17. Click the "Add Multi-Timeframe Condition" button
18. **Verify** a dialog opens with title "Add Multi-Timeframe Condition" (or similar)
19. Take a screenshot of the dialog
20. **Verify** the dialog contains:
    - Timeframe selector dropdown
    - Indicator selector
    - Parameter inputs
    - Condition configuration (operator, right operand)
    - Section selector (Long Entry, Long Exit, etc.)
    - Performance warning text
    - Add/Cancel buttons

### Phase 4: Select Timeframe

21. Click on the timeframe selector dropdown
22. **Verify** it shows available timeframes: M1, M5, M15, M30, H1, H4, D, W1
23. **Verify** the current chart timeframe (M15) is NOT shown or is disabled
24. Select "H4" as the reference timeframe
25. Take a screenshot showing H4 selected
26. **Verify** the timeframe is highlighted/selected

### Phase 5: Select Indicator

27. Locate the indicator selector in the dialog
28. **Verify** it shows all available indicators from the catalog (EMA, SMA, RSI, MACD, etc.)
29. Select "EMA" as the indicator
30. Take a screenshot showing indicator selection
31. **Verify** parameter inputs appear (e.g., period input)
32. Set the EMA period to 50

### Phase 6: Configure Condition

33. **Verify** the condition configuration section is visible
34. Select operator "is above" (or ">")
35. For right operand, select "EMA" indicator again
36. Set the right operand EMA period to 200
37. Take a screenshot showing the full condition configuration: [H4] EMA(50) > EMA(200)

### Phase 7: Verify Performance Warning

38. Locate the performance warning in the dialog
39. **Verify** warning text is displayed: "Multi-timeframe conditions may increase backtest time" (or similar)
40. Take a screenshot highlighting the warning

### Phase 8: Add the Condition

41. Click the "Add Condition" button in the dialog
42. **Verify** the dialog closes
43. **Verify** a loading indicator appears briefly (fetching H4 data)
44. Wait for loading to complete
45. Take a screenshot of the Logic Panel after adding the condition

### Phase 9: Verify Condition Display

46. Locate the newly added condition in the Long Entry section
47. **Verify** the condition displays with timeframe prefix: `[H4] EMA(50) is above EMA(200)` (or similar)
48. **Verify** the timeframe badge `[H4]` is visually distinct (different style/color)
49. Take a screenshot of the condition with timeframe label
50. **Verify** natural language preview includes the timeframe context

### Phase 10: Verify Reference Indicators Panel

51. Locate the "Reference Indicators" panel (may be collapsible)
52. **Verify** the panel is visible and expanded
53. **Verify** it shows the H4 timeframe section
54. **Verify** it displays:
    - EMA (50) with current calculated value
    - EMA (200) with current calculated value
55. Take a screenshot of the Reference Indicators panel
56. **Verify** indicator values are numeric (not "N/A" or error)

### Phase 11: Add Second Multi-Timeframe Condition (Different Timeframe)

57. Click "Add Multi-Timeframe Condition" in the Long Entry section
58. Select timeframe "D" (Daily)
59. Select indicator "RSI"
60. Set RSI period to 14
61. Configure condition: RSI is below 30
62. Click "Add Condition"
63. **Verify** condition appears with `[D]` prefix
64. Take a screenshot showing both H4 and D conditions
65. **Verify** Reference Indicators panel now shows both H4 and D sections

### Phase 12: Add Third Multi-Timeframe Condition (Third Timeframe)

66. Click "Add Multi-Timeframe Condition" again
67. Select timeframe "H1"
68. Select indicator "MACD"
69. Configure condition: MACD Histogram is above 0
70. Click "Add Condition"
71. **Verify** condition appears with `[H1]` prefix
72. Take a screenshot showing three different timeframe conditions
73. **Verify** Reference Indicators panel shows H4, D, and H1 sections

### Phase 13: Test Maximum Timeframe Limit

74. Click "Add Multi-Timeframe Condition" again
75. Attempt to select a fourth different timeframe (e.g., "W1")
76. **Verify** one of the following occurs:
    - Error message: "Maximum 3 additional timeframes reached"
    - W1 option is disabled in the dropdown
    - Dialog shows validation error when trying to add
77. Take a screenshot of the limit validation
78. **Verify** the limit prevents adding more than 3 reference timeframes
79. Click Cancel to close the dialog

### Phase 14: Verify Persistence

80. Note the current reference indicators and conditions
81. Refresh the browser page (F5 or Ctrl+R)
82. Navigate back to Strategy page
83. Select the same currency pair (EUR/USD)
84. Click "Load Data"
85. **Verify** all three multi-timeframe conditions are restored
86. **Verify** Reference Indicators panel shows all three timeframes
87. Take a screenshot of restored state
88. **Verify** indicator values are recalculated (may show loading briefly)

### Phase 15: Delete Reference Indicator

89. Locate one of the reference indicators in the Reference Indicators panel (e.g., H1 MACD)
90. Click the delete button on that indicator
91. **Verify** a confirmation dialog appears (since indicator is used in conditions)
92. Click "Delete" to confirm
93. Take a screenshot after deletion
94. **Verify** the associated condition shows a validation warning (indicator not found)
95. **Verify** the H1 section is removed from Reference Indicators panel (if no other H1 indicators)

### Phase 16: Test Logic with Multi-Timeframe Conditions

96. Click the "Test Logic" button in the Long Entry section
97. **Verify** the Test Logic dialog opens
98. Take a screenshot of the Test Logic dialog
99. **Verify** the dialog shows:
    - Current chart candle data (M15)
    - Reference indicator values section showing H4 and D values
    - Pass/fail status for each condition
100. **Verify** multi-timeframe conditions show their reference values in evaluation
101. Click Close to dismiss the dialog

### Phase 17: Cross-Section Multi-Timeframe Conditions

102. Click "Add Multi-Timeframe Condition" in the Short Entry section
103. Select H4 timeframe (reusing existing reference timeframe)
104. Select RSI indicator with period 14
105. Configure: RSI is above 70
106. Click "Add Condition"
107. **Verify** condition added to Short Entry section with `[H4]` prefix
108. **Verify** Reference Indicators panel shows H4 RSI (new indicator added)
109. Take a screenshot showing multi-timeframe conditions in different sections

### Phase 18: Change Currency Pair

110. Change the currency pair selector to "GBP/JPY"
111. Click "Load Data"
112. **Verify** the chart updates to GBP/JPY
113. **Verify** reference indicator values update (loading shown, then new values)
114. Take a screenshot showing values updated for new pair
115. **Verify** conditions and reference indicators persist (structure unchanged)

## Success Criteria

- "Add Multi-Timeframe Condition" button is visible in Logic Panel sections
- Dialog allows selecting from available timeframes (excluding current chart timeframe)
- Dialog allows selecting any indicator from the catalog
- Parameter configuration works for selected indicators
- Performance warning is displayed in the dialog
- Conditions display with timeframe prefix: `[H4]`, `[D]`, `[H1]`
- Reference Indicators panel shows indicators grouped by timeframe
- Reference indicator values are calculated and displayed
- Maximum 3 additional timeframes is enforced with clear error message
- Multi-timeframe conditions persist across page refresh
- Deleting reference indicators shows confirmation and updates condition validation
- Test Logic dialog includes reference indicator values
- Reference indicator values update when changing currency pair
- 25+ screenshots are taken documenting the test flow
