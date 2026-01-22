# E2E Test: Backtest Summary Statistics

Test the Backtest Summary Statistics dashboard functionality including metric display, color coding, tooltips, and equity curve visualization after backtest completion.

## User Story

As a trader
I want to see comprehensive performance statistics after backtest completion
So that I can evaluate if my strategy is profitable and robust

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one backtest configuration exists linked to a valid strategy

## Test Steps

### Setup: Navigate to Application

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links including "Backtest"

### Navigate to Backtest Configuration

5. Click on "Backtest" in the navigation
6. Wait for backtests API response
7. Take a screenshot of the Backtest Library page
8. **Verify** page header shows "Backtests"

9. If backtest cards exist:
   - Click on an existing backtest card to open configuration
   - Wait for navigation to `/backtests/{id}/edit`
10. If no backtests exist:
    - Click "New Backtest" button
    - Wait for navigation to `/backtests/new`
    - Fill in required fields (name, strategy, dates)
    - Save the backtest first

11. Take a screenshot of the Backtest Configuration page

### Run Backtest to Completion

12. Ensure a valid strategy with entry conditions is selected
13. Click "Run Backtest" button
14. **Verify** progress modal appears
15. Wait for backtest to complete (progress reaches 100%)
16. **Verify** backtest completes successfully
17. Take a screenshot at completion

### Test Summary Statistics Auto-Display

18. **Verify** summary statistics section appears after completion
19. **Verify** summary section has header "Backtest Results" or similar
20. Take a screenshot of the summary statistics section

### Test Primary KPI Cards

21. **Verify** Net P/L card is displayed with:
    - Label: "Net P/L" or "Total Net Profit/Loss"
    - Dollar value with $ prefix
    - Green color for positive, red for negative
22. Take a screenshot of Net P/L card

23. **Verify** ROI card is displayed with:
    - Label: "ROI" or "Return on Investment"
    - Percentage value with % suffix
    - Green color for positive, red for negative

24. **Verify** Win Rate card is displayed with:
    - Label: "Win Rate"
    - Percentage value to 1 decimal place
    - Color coding based on threshold (green >50%, red <40%)

25. **Verify** Profit Factor card is displayed with:
    - Label: "Profit Factor"
    - Numeric value to 2 decimal places
    - Green for >1.0, red for <1.0

26. Take a screenshot showing all 4 primary KPI cards

### Test Equity Curve Chart

27. **Verify** equity curve chart is visible
28. **Verify** chart displays strategy equity curve line (primary)
29. **Verify** chart displays buy-and-hold comparison line (secondary/dashed)
30. **Verify** chart has legend showing "Strategy" and "Buy & Hold"
31. Hover over the equity curve
32. **Verify** tooltip appears showing value at hover point
33. Take a screenshot of equity curve chart with tooltip

### Test Trade Statistics Section

34. **Verify** Trade Statistics section is visible
35. **Verify** Total Trades metric is displayed (integer count)
36. **Verify** Winners/Losers metric shows count for each
37. **Verify** Average Win metric is displayed with $ prefix and 2 decimal places
38. **Verify** Average Loss metric is displayed with $ prefix and 2 decimal places
39. **Verify** Win/Loss Ratio metric is displayed to 2 decimal places
40. **Verify** Largest Win metric is displayed with $ prefix
41. **Verify** Largest Loss metric is displayed with $ prefix
42. **Verify** Average Trade Duration is displayed (formatted as Xh Xm or similar)
43. Take a screenshot of Trade Statistics section

### Test Risk Metrics Section

44. **Verify** Risk Metrics section is visible
45. **Verify** Maximum Drawdown is displayed showing both $ and %
46. **Verify** Recovery Factor metric is displayed to 2 decimal places
47. **Verify** Sharpe Ratio metric is displayed to 2 decimal places
48. **Verify** Sortino Ratio metric is displayed to 2 decimal places
49. **Verify** Expectancy metric is displayed with $ prefix and 2 decimal places
50. Take a screenshot of Risk Metrics section

### Test Benchmark Comparison Section

51. **Verify** Benchmark Comparison section is visible
52. **Verify** Buy & Hold Return is displayed with % suffix
53. **Verify** Strategy vs Benchmark metric shows difference
54. **Verify** color coding: green if strategy beats benchmark, red if underperforms
55. Take a screenshot of Benchmark Comparison section

### Test Metric Tooltips

56. Hover over the info icon (or metric label) for "Net P/L"
57. **Verify** tooltip appears with explanation text
58. Take a screenshot of tooltip for Net P/L

59. Hover over the info icon for "Profit Factor"
60. **Verify** tooltip explains: "Gross profit divided by gross loss" or similar
61. Take a screenshot of tooltip for Profit Factor

62. Hover over the info icon for "Sharpe Ratio"
63. **Verify** tooltip explains risk-adjusted return concept
64. Take a screenshot of tooltip for Sharpe Ratio

65. Hover over the info icon for "Sortino Ratio"
66. **Verify** tooltip explains downside volatility concept

67. Hover over the info icon for "Maximum Drawdown"
68. **Verify** tooltip explains peak-to-trough decline

69. Hover over the info icon for "Expectancy"
70. **Verify** tooltip explains expected profit per trade

### Test Color Coding Logic

71. **Verify** positive P/L values display in green
72. **Verify** negative P/L values display in red (if applicable based on results)
73. **Verify** Win Rate >50% displays in green
74. **Verify** Profit Factor >1.0 displays in green
75. **Verify** Sharpe Ratio coloring is appropriate (green for positive, red for negative)
76. Take a screenshot highlighting color coding

### Test Results Persistence on Page Navigation

77. Navigate away to a different page (e.g., Strategy Builder)
78. Navigate back to the Backtest Configuration page for same backtest
79. **Verify** summary statistics are still visible
80. **Verify** all metrics are preserved
81. Take a screenshot showing persisted results

### Test View Results from BacktestLibrary

82. Navigate to `/backtests` (Backtest Library)
83. **Verify** completed backtest shows key metrics preview:
    - Return (%) with color coding
    - Win Rate (%)
    - Total Trades
84. Take a screenshot of BacktestLibrary with metrics preview

85. Click on the completed backtest card
86. **Verify** navigates to configuration page with results visible
87. Take a screenshot confirming results display from library navigation

### Test Results Section Collapse/Expand

88. If a collapse/expand control exists:
    - **Verify** collapse button is visible
    - Click collapse button
    - **Verify** summary section collapses (hides detailed content)
    - Click expand button
    - **Verify** summary section expands (shows all content)
    - Take a screenshot of collapsed state

### Test Edge Cases (if applicable)

89. If a backtest with zero trades is available:
    - **Verify** appropriate "No trades" or N/A displays
    - **Verify** Sharpe/Sortino show N/A when not calculable
    - Take a screenshot of zero trades state

90. Take a final screenshot of the complete summary dashboard

## Success Criteria

- Summary statistics section displays automatically after backtest completion
- All 15+ metrics are calculated and displayed:
  - Total Net Profit/Loss ($) with + sign for positive
  - Return on Investment (%) with + sign for positive
  - Total Trades (integer count)
  - Win Rate (%) to 1 decimal place
  - Profit Factor to 2 decimal places
  - Average Win ($) to 2 decimal places
  - Average Loss ($) to 2 decimal places
  - Win/Loss Ratio to 2 decimal places
  - Largest Win ($) to 2 decimal places
  - Largest Loss ($) to 2 decimal places
  - Average Trade Duration (formatted as Xh Xm)
  - Maximum Drawdown ($ and %) both displayed
  - Recovery Factor to 2 decimal places
  - Sharpe Ratio to 2 decimal places
  - Sortino Ratio to 2 decimal places
  - Expectancy ($) to 2 decimal places
  - Buy & Hold Return (%)
  - Strategy vs Benchmark (%)
- Color coding is applied correctly:
  - Green for positive/good metrics
  - Red for negative/concerning metrics
- Tooltip explanations appear on hover for each metric
- Equity curve chart displays with buy-and-hold comparison line
- Results are viewable from BacktestLibrary for completed backtests
- Results persist when navigating away and back to the page
- 20+ screenshots are taken documenting the flow
