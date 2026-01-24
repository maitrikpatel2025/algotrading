# E2E Test: Risk Analytics

Test the Risk Analytics section in the Backtest Results Summary, including streak analysis, distribution histograms, scatter plots, Risk of Ruin calculation, drawdown duration analysis, and Value at Risk metrics.

## User Story

As a trader
I want to see detailed risk metrics and distributions
So that I can understand the risk profile of my strategy

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one completed backtest exists with trades

## Test Steps

### Setup: Navigate to Application

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links including "Backtest"

### Navigate to Completed Backtest

5. Click on "Backtest" in the navigation
6. Wait for backtests API response
7. Take a screenshot of the Backtest Library page
8. **Verify** page header shows "Backtests"

9. Look for a completed backtest card (status shows "Completed" or has results metrics)
10. If no completed backtest exists:
    - Click on an existing backtest card or create new
    - Run the backtest to completion
11. Click on the completed backtest card
12. **Verify** navigates to `/backtests/{id}/edit`
13. Take a screenshot of the Backtest Configuration page with results

### Verify Risk Analytics Section Exists

14. Scroll down to find the "Risk Analytics" section
15. **Verify** Risk Analytics section header is visible with TrendingDown icon
16. **Verify** Risk Analytics section is collapsible (has chevron icon)
17. Take a screenshot showing Risk Analytics section header

### Test Section Expand/Collapse

18. If section is collapsed, click to expand it
19. **Verify** section expands to show content
20. Take a screenshot of expanded Risk Analytics section
21. Click to collapse the section
22. **Verify** section collapses (content is hidden)
23. Click to expand again for further testing

### Test Streak Analysis Metrics

24. **Verify** "Max Consecutive Wins" metric is displayed
25. **Verify** "Max Consecutive Losses" metric is displayed
26. **Verify** "Avg Win Streak" metric is displayed
27. **Verify** "Avg Loss Streak" metric is displayed
28. **Verify** streak metrics show integer or decimal values
29. Take a screenshot of streak analysis metrics

### Test Value at Risk (VaR) Card

30. **Verify** VaR card is visible
31. **Verify** VaR (95%) metric is displayed with currency formatting
32. **Verify** VaR (99%) metric is displayed with currency formatting
33. **Verify** VaR values are displayed with appropriate color coding
34. Hover over VaR info icon
35. **Verify** tooltip appears explaining VaR calculation
36. Take a screenshot of VaR card with tooltip

### Test Risk of Ruin Card

37. **Verify** Risk of Ruin card is visible
38. **Verify** Risk of Ruin percentage is displayed
39. **Verify** Risk of Ruin has color coding:
    - Green for < 5%
    - Yellow/Orange for 5-20%
    - Red for > 20%
40. **Verify** simulation count is displayed (e.g., "10,000 simulations")
41. Hover over Risk of Ruin info icon
42. **Verify** tooltip explains Monte Carlo simulation methodology
43. Take a screenshot of Risk of Ruin card with tooltip

### Test Drawdown Duration Card

44. **Verify** Drawdown Duration card is visible
45. **Verify** "Avg Drawdown Duration" metric is displayed
46. **Verify** "Max Drawdown Duration" metric is displayed
47. **Verify** durations are formatted appropriately (e.g., "2h 30m", "1d 4h")
48. Hover over drawdown duration info icon
49. **Verify** tooltip explains drawdown duration metrics
50. Take a screenshot of Drawdown Duration card

### Test Win/Loss Distribution Histogram

51. Scroll to Win/Loss Distribution section
52. **Verify** histogram chart is visible
53. **Verify** X-axis is labeled (P/L or similar)
54. **Verify** Y-axis is labeled (Number of Trades or similar)
55. **Verify** histogram bars are visible
56. **Verify** winning trades are colored green
57. **Verify** losing trades are colored red
58. Hover over a histogram bar
59. **Verify** tooltip shows bucket range and count
60. Take a screenshot of Win/Loss Distribution histogram

### Test P/L Scatter Plot

61. Scroll to P/L Scatter Plot section
62. **Verify** scatter plot chart is visible
63. **Verify** X-axis shows dates/time
64. **Verify** Y-axis shows P/L values
65. **Verify** scatter points are visible
66. **Verify** winning trades (positive P/L) are colored green
67. **Verify** losing trades (negative P/L) are colored red
68. **Verify** horizontal line at y=0 is present for reference
69. Hover over a scatter point
70. **Verify** tooltip shows entry date and P/L value
71. Take a screenshot of P/L Scatter Plot

### Test Holding Period Histogram

72. Scroll to Holding Period Distribution section
73. **Verify** histogram chart is visible
74. **Verify** X-axis shows holding period (formatted as duration)
75. **Verify** Y-axis shows number of trades
76. **Verify** histogram bars are visible
77. Hover over a histogram bar
78. **Verify** tooltip shows duration range and trade count
79. Take a screenshot of Holding Period histogram

### Test Metric Tooltips

80. Hover over the info icon for "Max Consecutive Wins"
81. **Verify** tooltip appears explaining the metric
82. Take a screenshot of tooltip

83. Hover over the info icon for "Risk of Ruin"
84. **Verify** tooltip explains Monte Carlo simulation with 10,000 iterations
85. Take a screenshot of tooltip

86. Hover over the info icon for "VaR (95%)"
87. **Verify** tooltip explains Value at Risk at 95% confidence
88. Take a screenshot of tooltip

### Test Responsiveness

89. If possible, resize browser to tablet width (768px)
90. **Verify** Risk Analytics section layout adjusts appropriately
91. **Verify** charts remain visible and functional
92. Take a screenshot at tablet width

93. Resize back to desktop width
94. Take a final screenshot of complete Risk Analytics section

### Test Edge Cases (if applicable)

95. If a backtest with very few trades is available:
    - **Verify** Risk Analytics section displays appropriate "Insufficient data" message for metrics that require minimum trade count
    - Take a screenshot of insufficient data state

## Success Criteria

- Risk Analytics section appears in Backtest Results Summary after completion
- Section is collapsible with smooth expand/collapse animation
- All streak analysis metrics are displayed:
  - Max Consecutive Wins (integer)
  - Max Consecutive Losses (integer)
  - Avg Win Streak (1 decimal place)
  - Avg Loss Streak (1 decimal place)
- Value at Risk metrics are displayed:
  - VaR (95%) with currency formatting
  - VaR (99%) with currency formatting
- Risk of Ruin is displayed:
  - Probability as percentage
  - Color coding based on severity (green/yellow/red)
  - Simulation count shown
- Drawdown Duration metrics are displayed:
  - Avg Drawdown Duration (formatted as duration)
  - Max Drawdown Duration (formatted as duration)
- Win/Loss Distribution Histogram:
  - Renders correctly
  - Green bars for winning trades, red for losing
  - Hover tooltips work
- P/L Scatter Plot:
  - Renders correctly
  - X-axis shows entry times
  - Y-axis shows P/L values
  - Green points for wins, red for losses
  - Reference line at y=0
  - Hover tooltips work
- Holding Period Histogram:
  - Renders correctly
  - Duration buckets displayed
  - Hover tooltips work
- All metrics have working info icon tooltips
- Section handles missing/insufficient data gracefully
- 20+ screenshots are taken documenting the flow
