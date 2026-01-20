# E2E Test: Indicator-Based Conditions

Test the indicator-based conditions functionality in the Forex Trading Dashboard Strategy page. This feature allows users to create conditions where the left operand is an indicator value (e.g., "RSI > 70", "MACD Histogram > 0").

## User Story

As a forex trader
I want to create conditions comparing indicator values (e.g., "RSI > 70")
So that I can incorporate technical analysis signals into my strategy

## Prerequisites

- Application must be running (frontend on localhost:3000, backend on localhost:8000)
- Price data should be loaded to enable indicator additions

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
8. Select a timeframe (e.g., "H1")
9. Click "Load Data" button
10. **Verify** the price chart loads with candlestick data

### Phase 2: Add Indicator to Chart

11. Drag the "RSI" indicator from the Indicator Library panel onto the chart
12. **Verify** indicator settings dialog opens
13. Configure RSI with period 14 (default) and click "Add Indicator"
14. Take a screenshot showing RSI indicator on chart
15. **Verify** RSI indicator appears in a subchart below the main price chart
16. **Verify** a condition block appears in the Logic Panel

### Phase 3: Indicator Value as Left Operand

17. Click "Add Condition" button in the Long Entry section of Logic Panel
18. **Verify** a new condition block appears with default values
19. Click on the left operand dropdown
20. Take a screenshot of the dropdown options
21. **Verify** dropdown shows:
    - "Price" group with Open, High, Low, Close options
    - "Indicator Values" group with "RSI (14)" option
    - "Indicators" group for right operand use
22. Select "RSI (14)" from the "Indicator Values" group as the left operand
23. **Verify** the left operand shows "RSI (14)" with the indicator's color accent

### Phase 4: Comparison Operators

24. Click on the operator dropdown
25. Take a screenshot of operator options
26. **Verify** the following operators are available:
    - crosses above
    - crosses below
    - is above (>)
    - is below (<)
    - is greater or equal (>=)
    - is less or equal (<=)
    - equals
    - is between (range operator)
27. Select "is above" operator
28. **Verify** operator shows "is above"

### Phase 5: Right-Hand Value Options

29. Click on the right operand dropdown
30. **Verify** dropdown shows:
    - "Values" group with "Custom Value" option and percentage toggle
    - "Indicators" group (for indicator vs indicator comparisons)
31. Select "Custom Value" from the Values group
32. **Verify** numeric input appears
33. Enter "70" as the threshold value
34. Take a screenshot of the completed condition
35. **Verify** condition shows "RSI (14) is above 70"
36. **Verify** natural language preview shows: "When RSI (14) is above 70"

### Phase 6: Range Condition (Between)

37. Click "Add Condition" button in Long Entry section
38. Click on the left operand dropdown and select "RSI (14)"
39. Click on the operator dropdown and select "is between"
40. **Verify** two value input fields appear for min and max
41. Enter "30" for the minimum value
42. Enter "70" for the maximum value
43. Take a screenshot of the range condition
44. **Verify** condition displays as "RSI (14) is between 30 and 70"
45. **Verify** natural language preview shows: "When RSI (14) is between 30 and 70"

### Phase 7: Numeric Bounds Validation

46. Click "Add Condition" button in Long Entry section
47. Select "RSI (14)" as left operand
48. Select "is above" operator
49. Enter "150" as the value (outside RSI's 0-100 bounds)
50. Take a screenshot showing validation warning
51. **Verify** a warning indicator appears showing value is outside valid range
52. **Verify** tooltip/message indicates RSI valid range is 0-100
53. Change the value to "85"
54. **Verify** warning disappears

### Phase 8: Multi-Component Indicator

55. Drag the "MACD" indicator from the Indicator Library onto the chart
56. Configure MACD with default parameters and click "Add Indicator"
57. Click "Add Condition" button in Long Entry section
58. Click on the left operand dropdown
59. Take a screenshot showing MACD component options
60. **Verify** "Indicator Values" group shows:
    - "MACD (12, 26, 9) MACD Line"
    - "MACD (12, 26, 9) Signal Line"
    - "MACD (12, 26, 9) Histogram"
61. Select "MACD (12, 26, 9) Histogram" as left operand
62. Select "is above" operator
63. Enter "0" as the value
64. **Verify** condition shows "MACD (12, 26, 9) Histogram is above 0"
65. Take a screenshot of the MACD histogram condition

### Phase 9: Indicator vs Indicator Comparison

66. Click "Add Condition" button in Long Entry section
67. Select "MACD (12, 26, 9) MACD Line" as left operand
68. Select "crosses above" operator
69. Click on the right operand dropdown
70. Select "MACD (12, 26, 9) Signal Line" from the Indicators group
71. **Verify** condition shows "MACD Line crosses above Signal Line"
72. **Verify** natural language preview shows: "When MACD (12, 26, 9) MACD Line crosses above MACD (12, 26, 9) Signal Line"
73. Take a screenshot of the cross condition

### Phase 10: Percentage Value Type

74. Click "Add Condition" button in Long Entry section
75. Select "RSI (14)" as left operand
76. Select "is above" operator
77. Click on the right operand dropdown and select "Custom Value"
78. Toggle the percentage mode (if available via percentage button/toggle)
79. Enter "50"
80. **Verify** the value displays as "50%" or equivalent
81. Take a screenshot showing percentage value

### Phase 11: Bollinger Bands Components

82. Drag the "Bollinger Bands" indicator onto the chart
83. Configure with default parameters and click "Add Indicator"
84. Click "Add Condition" button in Long Entry section
85. Click on the left operand dropdown
86. **Verify** "Indicator Values" shows BB components:
    - "BB (20, 2) Upper Band"
    - "BB (20, 2) Middle Band"
    - "BB (20, 2) Lower Band"
87. Select "Close Price" as left operand (testing price vs indicator)
88. Select "crosses above" operator
89. Select "BB (20, 2) Upper Band" as right operand
90. Take a screenshot of Bollinger Bands condition

### Phase 12: Stochastic Oscillator (Negative Bounds Test)

91. Drag "Williams %R" indicator onto the chart
92. Configure with default parameters and click "Add Indicator"
93. Click "Add Condition" button
94. Select "Williams %R (14)" as left operand
95. Select "is above" operator
96. Enter "-20" as value
97. **Verify** no warning appears (-20 is within Williams %R range of -100 to 0)
98. Take a screenshot showing Williams %R condition

### Phase 13: Condition Deletion and Cleanup

99. Identify the first RSI condition created
100. Hover over the condition block
101. Click the delete button (X icon)
102. **Verify** confirmation dialog appears
103. Click "Remove Condition" to confirm
104. **Verify** condition is removed from Logic Panel
105. Take a screenshot of final state with remaining conditions

## Success Criteria

- Strategy page loads with all controls
- RSI indicator can be added to chart
- Left operand dropdown shows "Indicator Values" group with available indicators
- Multi-component indicators show individual components (MACD Line, Signal Line, Histogram)
- All comparison operators are available including range operator (is between)
- Range conditions display two value inputs (min and max)
- Custom numeric values can be entered
- Percentage values can be entered (if toggle available)
- Numeric bounds validation shows warnings for out-of-range values
- Indicator vs indicator comparisons work correctly
- Natural language preview displays correctly for all condition types
- Conditions can be deleted
- 15+ screenshots are taken documenting the test flow
