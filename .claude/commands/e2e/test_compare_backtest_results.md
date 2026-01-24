# E2E Test: Compare Backtest Results

Test the Compare Backtest Results feature including multi-select mode in the library, side-by-side comparison view, overlaid equity curves, statistical significance analysis, notes editor, and export functionality.

## User Story

As a trader
I want to compare results from multiple backtests side by side
So that I can evaluate which strategy variation performs best

## Prerequisites

- At least 2 completed backtests exist in the library with results
- If not available, create and run backtests before testing comparison

## Test Steps

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Click on "Backtest" in the navigation
5. Wait for backtests API response
6. Take a screenshot of the Backtest Library page
7. **Verify** page header shows "Backtests"
8. **Verify** backtests are displayed in the library

### Multi-Select Mode Testing

9. **Verify** "Select for Compare" button is visible in the header
10. Click "Select for Compare" button
11. Take a screenshot showing selection mode activated
12. **Verify** selection mode is active (checkboxes visible on completed backtest cards)
13. **Verify** "Cancel" button is visible to exit selection mode
14. **Verify** selection count shows "0 selected"

15. Click on a completed backtest card to select it
16. **Verify** checkbox becomes checked
17. **Verify** selection count updates to "1 selected"
18. **Verify** "Compare Selected" button is disabled (need 2-4)
19. Take a screenshot showing one backtest selected

20. Select a second completed backtest
21. **Verify** selection count updates to "2 selected"
22. **Verify** "Compare Selected" button becomes enabled
23. Take a screenshot showing two backtests selected with compare button enabled

24. If more than 4 completed backtests exist:
    - Select a third backtest
    - **Verify** selection count updates to "3 selected"
    - Select a fourth backtest
    - **Verify** selection count updates to "4 selected"
    - Select a fifth backtest
    - **Verify** selection count shows "5 selected"
    - **Verify** "Compare Selected" button is disabled
    - **Verify** tooltip shows "Select 2-4 backtests to compare"
    - Deselect one backtest to have 4 selected
    - Take a screenshot showing 4 selected

25. With 2-4 backtests selected, click "Compare Selected" button
26. Wait for navigation
27. Take a screenshot of the comparison page loading
28. **Verify** URL changed to `/backtests/compare?ids=id1,id2,...`

### Comparison Page Header Testing

29. **Verify** comparison page header is visible with backtest names
30. **Verify** "Back to Library" button is present
31. Take a screenshot of the comparison page header

### Comparison Metrics Table Testing

32. Locate the Comparison Metrics Table section
33. **Verify** table header shows each backtest name as column
34. **Verify** metrics rows include:
    - Total Net Profit
    - ROI
    - Final Balance
    - Total Trades
    - Win Rate
    - Profit Factor
    - Sharpe Ratio
    - Sortino Ratio
    - Max Drawdown
35. Take a screenshot of the metrics table

36. **Verify** best value in each row is highlighted (green background/bold)
37. **Verify** highlighting logic is correct:
    - Higher is better: ROI, Win Rate, Profit Factor, Sharpe Ratio
    - Lower is better: Max Drawdown
38. Take a screenshot showing best value highlighting

39. Hover over a metric name
40. **Verify** tooltip shows metric description
41. Take a screenshot showing metric tooltip

### Comparison Equity Curve Testing

42. Locate the Comparison Equity Curves section
43. **Verify** chart container is visible
44. **Verify** legend shows all backtest names with distinct colors:
    - Backtest 1: Blue (#3b82f6)
    - Backtest 2: Orange (#f97316)
    - Backtest 3: Purple (#8b5cf6) if applicable
    - Backtest 4: Green (#22c55e) if applicable
45. Take a screenshot of the equity curves chart

46. **Verify** chart supports zoom (mouse wheel)
47. **Verify** chart supports pan (click and drag)
48. Hover over the chart
49. **Verify** crosshair tooltip shows date and balance for each backtest
50. Take a screenshot showing crosshair tooltip with all values

51. Locate show/hide toggle buttons for each backtest
52. Click to hide one backtest's curve
53. **Verify** that backtest's curve is no longer visible on chart
54. Click to show it again
55. **Verify** curve reappears
56. Take a screenshot showing toggle functionality

57. Locate "Normalize" toggle if present
58. Click to enable normalized view (percentage return)
59. **Verify** Y-axis changes to show percentage return starting at 0%
60. Take a screenshot showing normalized view

### Statistical Significance Testing

61. Locate the Statistical Significance section
62. **Verify** section header "Statistical Significance" is visible
63. **Verify** for each key metric with significant difference:
    - Metric name is displayed
    - P-value is shown
    - Significance indicator (green checkmark or yellow warning)
    - Interpretation text is displayed
64. Take a screenshot of statistical significance section

65. Locate "Methodology" expandable section
66. Click to expand
67. **Verify** explanation of statistical tests is visible
68. Take a screenshot of methodology explanation

### Comparison Notes Editor Testing

69. Locate the Comparison Notes Editor section
70. **Verify** section header "Comparison Notes" is visible
71. **Verify** textarea for notes is present
72. **Verify** character counter is visible (shows X/2000)
73. Take a screenshot of notes editor

74. Enter text in the notes textarea: "Test comparison notes for E2E testing"
75. **Verify** character counter updates
76. Wait 3 seconds for auto-save debounce
77. Take a screenshot showing notes entered

78. Refresh the page
79. **Verify** notes are still present (persisted in localStorage)
80. Take a screenshot showing notes persistence

### Export Functionality Testing

81. Locate the Export button(s)
82. **Verify** export options include CSV, JSON, PDF
83. Take a screenshot showing export options

84. Click on CSV export button
85. **Verify** file download is triggered OR export dialog opens
86. If dialog opens:
    - **Verify** format selection (CSV, JSON, PDF) is present
    - **Verify** "Include comparison notes" checkbox is present
    - **Verify** preview of export content is shown
87. Take a screenshot of export dialog or download confirmation

88. Click on JSON export
89. **Verify** JSON export is triggered
90. Take a screenshot

91. Click on PDF export
92. **Verify** PDF export is triggered
93. Take a screenshot

### Navigation and Error Handling Testing

94. Click "Back to Library" button
95. **Verify** navigation returns to `/backtests`
96. **Verify** selection mode is no longer active
97. Take a screenshot of library after returning

98. Navigate directly to `/backtests/compare` without query params
99. **Verify** error state is shown OR redirect to library
100. Take a screenshot of error handling

101. Navigate to `/backtests/compare?ids=invalid-id-1,invalid-id-2`
102. **Verify** appropriate error message is shown for invalid IDs
103. Take a screenshot of invalid ID error handling

### Edge Case Testing

104. Navigate back to library
105. Enter selection mode
106. Select a pending (not completed) backtest if one exists
107. **Verify** pending backtests cannot be selected OR show appropriate message
108. Take a screenshot

109. If only one completed backtest exists:
    - **Verify** cannot compare with only 1 backtest
    - **Verify** helpful message is shown
110. Take a screenshot of single backtest case

## Success Criteria

- Multi-select mode activates with clear visual feedback
- Selection count updates correctly as backtests are selected/deselected
- Compare button enables only when 2-4 backtests are selected
- Comparison page loads with all selected backtests
- Metrics table displays all key metrics with correct values
- Best values are highlighted appropriately for each metric
- Metric tooltips provide helpful descriptions
- Equity curves overlay with distinct colors for each backtest
- Equity curve supports zoom, pan, and crosshair tooltips
- Show/hide toggles work for individual backtest curves
- Statistical significance is calculated and displayed
- Notes editor saves and persists across page refreshes
- Export functionality works for CSV, JSON, and PDF formats
- Navigation back to library works correctly
- Error handling for invalid comparison requests works
- Only completed backtests can be selected for comparison
- 15+ screenshots are taken documenting the flow
