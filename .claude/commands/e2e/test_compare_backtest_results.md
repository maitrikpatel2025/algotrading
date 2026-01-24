# E2E Test: Compare Backtest Results

Test the Compare Backtest Results feature including multi-select mode in the library, side-by-side comparison view, overlaid equity curves, statistical significance analysis, notes editor, and export functionality.

## User Story

As a trader
I want to compare results from multiple backtests side by side
So that I can evaluate which strategy variation performs best

## Prerequisites

- At least 2 completed backtests exist in the library with results
- If not available, create and run backtests before testing comparison
- At least one strategy must exist in the database for creating new backtests

## Test Steps

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state
3. **Verify** the page loads successfully

4. Click on "Backtest" in the navigation
5. Wait for backtests API response
6. Take a screenshot of the Backtest Library page
7. **Verify** page header shows "Backtests"
8. **Verify** backtests are displayed in the library

### Data Setup: Ensure 2+ Completed Backtests Exist

> **Note:** These steps ensure the prerequisite of having at least 2 completed backtests is met before testing the comparison feature.

9. Count the number of completed backtests in the library (look for cards without "pending" or "running" status indicators)
10. Take a screenshot showing the current backtest count
11. If fewer than 2 completed backtests exist, perform the following data setup:

    **Create First Additional Backtest (if needed):**
    - Click "New Backtest" or "+" button in the header
    - Wait for the backtest configuration dialog to appear
    - Take a screenshot of the dialog
    - Enter a name: "E2E Test Backtest 1"
    - Select an available strategy from the dropdown
    - Set a date range (e.g., last 30 days or any valid range)
    - Set initial balance to a reasonable value (e.g., 10000)
    - Click "Save and Run" or "Run Backtest" button
    - Wait for the backtest to start running
    - Take a screenshot showing backtest is running
    - Wait for backtest to complete (status changes to completed) - this may take 30-60 seconds
    - Take a screenshot showing backtest completed

12. If still fewer than 2 completed backtests exist after step 11:

    **Create Second Additional Backtest (if needed):**
    - Click "New Backtest" or "+" button in the header
    - Wait for the backtest configuration dialog to appear
    - Enter a name: "E2E Test Backtest 2"
    - Select an available strategy from the dropdown (can be same or different)
    - Set a different date range from the first backtest
    - Set initial balance to a reasonable value (e.g., 10000)
    - Click "Save and Run" or "Run Backtest" button
    - Wait for the backtest to complete
    - Take a screenshot showing second backtest completed

13. **Verify** at least 2 completed backtests now exist in the library
14. Take a screenshot showing the library with 2+ completed backtests
15. **CRITICAL:** If the "Select for Compare" button is still not visible after data setup, fail the test with message: "Prerequisite not met: Need at least 2 completed backtests to test comparison feature. Ensure strategies exist in the database for creating backtests."

### Multi-Select Mode Testing

16. **Verify** "Select for Compare" button is visible in the header
17. Click "Select for Compare" button
18. Take a screenshot showing selection mode activated
19. **Verify** selection mode is active (checkboxes visible on completed backtest cards)
20. **Verify** "Cancel" button is visible to exit selection mode
21. **Verify** selection count shows "0 selected"

22. Click on a completed backtest card to select it
23. **Verify** checkbox becomes checked
24. **Verify** selection count updates to "1 selected"
25. **Verify** "Compare Selected" button is disabled (need 2-4)
26. Take a screenshot showing one backtest selected

27. Select a second completed backtest
28. **Verify** selection count updates to "2 selected"
29. **Verify** "Compare Selected" button becomes enabled
30. Take a screenshot showing two backtests selected with compare button enabled

31. If more than 4 completed backtests exist:
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

32. With 2-4 backtests selected, click "Compare Selected" button
33. Wait for navigation
34. Take a screenshot of the comparison page loading
35. **Verify** URL changed to `/backtests/compare?ids=id1,id2,...`

### Comparison Page Header Testing

36. **Verify** comparison page header is visible with backtest names
37. **Verify** "Back to Library" button is present
38. Take a screenshot of the comparison page header

### Comparison Metrics Table Testing

39. Locate the Comparison Metrics Table section
40. **Verify** table header shows each backtest name as column
41. **Verify** metrics rows include:
    - Total Net Profit
    - ROI
    - Final Balance
    - Total Trades
    - Win Rate
    - Profit Factor
    - Sharpe Ratio
    - Sortino Ratio
    - Max Drawdown
42. Take a screenshot of the metrics table

43. **Verify** best value in each row is highlighted (green background/bold)
44. **Verify** highlighting logic is correct:
    - Higher is better: ROI, Win Rate, Profit Factor, Sharpe Ratio
    - Lower is better: Max Drawdown
45. Take a screenshot showing best value highlighting

46. Hover over a metric name
47. **Verify** tooltip shows metric description
48. Take a screenshot showing metric tooltip

### Comparison Equity Curve Testing

49. Locate the Comparison Equity Curves section
50. **Verify** chart container is visible
51. **Verify** legend shows all backtest names with distinct colors:
    - Backtest 1: Blue (#3b82f6)
    - Backtest 2: Orange (#f97316)
    - Backtest 3: Purple (#8b5cf6) if applicable
    - Backtest 4: Green (#22c55e) if applicable
52. Take a screenshot of the equity curves chart

53. **Verify** chart supports zoom (mouse wheel)
54. **Verify** chart supports pan (click and drag)
55. Hover over the chart
56. **Verify** crosshair tooltip shows date and balance for each backtest
57. Take a screenshot showing crosshair tooltip with all values

58. Locate show/hide toggle buttons for each backtest
59. Click to hide one backtest's curve
60. **Verify** that backtest's curve is no longer visible on chart
61. Click to show it again
62. **Verify** curve reappears
63. Take a screenshot showing toggle functionality

64. Locate "Normalize" toggle if present
65. Click to enable normalized view (percentage return)
66. **Verify** Y-axis changes to show percentage return starting at 0%
67. Take a screenshot showing normalized view

### Statistical Significance Testing

68. Locate the Statistical Significance section
69. **Verify** section header "Statistical Significance" is visible
70. **Verify** for each key metric with significant difference:
    - Metric name is displayed
    - P-value is shown
    - Significance indicator (green checkmark or yellow warning)
    - Interpretation text is displayed
71. Take a screenshot of statistical significance section

72. Locate "Methodology" expandable section
73. Click to expand
74. **Verify** explanation of statistical tests is visible
75. Take a screenshot of methodology explanation

### Comparison Notes Editor Testing

76. Locate the Comparison Notes Editor section
77. **Verify** section header "Comparison Notes" is visible
78. **Verify** textarea for notes is present
79. **Verify** character counter is visible (shows X/2000)
80. Take a screenshot of notes editor

81. Enter text in the notes textarea: "Test comparison notes for E2E testing"
82. **Verify** character counter updates
83. Wait 3 seconds for auto-save debounce
84. Take a screenshot showing notes entered

85. Refresh the page
86. **Verify** notes are still present (persisted in localStorage)
87. Take a screenshot showing notes persistence

### Export Functionality Testing

88. Locate the Export button(s)
89. **Verify** export options include CSV, JSON, PDF
90. Take a screenshot showing export options

91. Click on CSV export button
92. **Verify** file download is triggered OR export dialog opens
93. If dialog opens:
    - **Verify** format selection (CSV, JSON, PDF) is present
    - **Verify** "Include comparison notes" checkbox is present
    - **Verify** preview of export content is shown
94. Take a screenshot of export dialog or download confirmation

95. Click on JSON export
96. **Verify** JSON export is triggered
97. Take a screenshot

98. Click on PDF export
99. **Verify** PDF export is triggered
100. Take a screenshot

### Navigation and Error Handling Testing

101. Click "Back to Library" button
102. **Verify** navigation returns to `/backtests`
103. **Verify** selection mode is no longer active
104. Take a screenshot of library after returning

105. Navigate directly to `/backtests/compare` without query params
106. **Verify** error state is shown OR redirect to library
107. Take a screenshot of error handling

108. Navigate to `/backtests/compare?ids=invalid-id-1,invalid-id-2`
109. **Verify** appropriate error message is shown for invalid IDs
110. Take a screenshot of invalid ID error handling

### Edge Case Testing

111. Navigate back to library
112. Enter selection mode
113. Select a pending (not completed) backtest if one exists
114. **Verify** pending backtests cannot be selected OR show appropriate message
115. Take a screenshot

116. If only one completed backtest exists:
    - **Verify** cannot compare with only 1 backtest
    - **Verify** helpful message is shown
117. Take a screenshot of single backtest case

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
