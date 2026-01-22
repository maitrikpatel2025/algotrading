# E2E Test: Equity Curve Chart

Test the interactive equity curve chart functionality including zoom, pan, drawdown visualization, buy-and-hold overlay, tooltips, and PNG export after backtest completion.

## User Story

As a trader
I want to interact with the equity curve chart to analyze my backtest performance
So that I can understand how my account balance changed over time and identify drawdown periods

## Prerequisites

- At least one strategy exists with entry conditions defined
- At least one completed backtest with results available

## Test Steps

### Setup: Navigate to Backtest Results

1. Navigate to the `Application URL` (redirects to home page)
2. Take a screenshot of the initial state (Home page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links including "Backtest"

### Navigate to Backtest with Results

5. Click on "Backtest" in the navigation
6. Wait for backtests API response
7. Take a screenshot of the Backtest Library page
8. **Verify** page header shows "Backtests"

9. Click on a completed backtest card (status: completed)
10. Wait for navigation to `/backtests/{id}/edit`
11. Take a screenshot of the Backtest Configuration page with results
12. **Verify** backtest results summary section is visible
13. **Verify** equity curve chart is visible in the results section

### Test Chart Initial Render

14. **Verify** equity curve chart container is visible
15. **Verify** chart has control buttons:
    - "Drawdowns" toggle button with eye icon
    - "Buy & Hold" toggle button with trending up icon
    - "Export PNG" button with download icon
16. **Verify** chart displays with proper styling (Precision Swiss Design System)
17. Take a screenshot of the equity curve chart initial state

### Test Chart Data Display

18. **Verify** equity curve line is displayed (green for profit, red for loss)
19. **Verify** area fill is visible under the equity curve
20. **Verify** buy-and-hold comparison line is visible (gray dashed line)
21. **Verify** chart has time scale (X-axis) showing dates
22. **Verify** chart has price scale (Y-axis) showing balance values
23. Take a screenshot showing both equity and buy-hold curves

### Test Zoom Functionality

24. Scroll mouse wheel down over the chart (zoom in)
25. **Verify** chart zooms in showing more detail
26. **Verify** time scale adjusts to show zoomed timeframe
27. Take a screenshot of zoomed in state

28. Scroll mouse wheel up over the chart (zoom out)
29. **Verify** chart zooms out showing broader view
30. **Verify** time scale adjusts accordingly
31. Take a screenshot of zoomed out state

32. Double-click on the chart
33. **Verify** chart resets to fit all content

### Test Pan Functionality

34. Click and hold on the chart
35. Drag left to pan forward in time
36. **Verify** chart pans and time scale updates
37. Take a screenshot of panned state

38. Drag right to pan backward in time
39. **Verify** chart pans in opposite direction
40. **Verify** time scale updates accordingly

### Test Crosshair and Tooltip

41. Move mouse over the equity curve
42. **Verify** crosshair appears with vertical and horizontal lines
43. **Verify** tooltip appears near cursor showing:
    - Date in readable format (e.g., "Jan 15, 2026 14:30")
    - Balance with $ prefix and 2 decimals
    - Drawdown percentage at that point
    - Number of trades executed at that candle
44. Take a screenshot with tooltip visible

45. Move mouse to different points on the curve
46. **Verify** tooltip updates with different values
47. **Verify** balance color changes (green for above initial, red for below)
48. Take a screenshot showing tooltip at a drawdown point

49. Move mouse off the chart
50. **Verify** crosshair and tooltip disappear

### Test Drawdown Toggle

51. **Verify** "Drawdowns" button is initially active (highlighted)
52. **Verify** drawdown markers are visible on chart (red arrows or shaded areas)
53. Take a screenshot showing drawdown visualization

54. Click "Drawdowns" toggle button to hide drawdowns
55. **Verify** button changes to inactive state (eye-off icon)
56. **Verify** drawdown markers disappear from chart
57. Take a screenshot with drawdowns hidden

58. Click "Drawdowns" toggle button again to show drawdowns
59. **Verify** button returns to active state
60. **Verify** drawdown markers reappear on chart

### Test Buy & Hold Toggle

61. **Verify** "Buy & Hold" button is initially active
62. **Verify** buy-and-hold line is visible on chart (gray dashed)
63. Take a screenshot showing buy-hold overlay

64. Click "Buy & Hold" toggle button to hide comparison
65. **Verify** button changes to inactive state
66. **Verify** buy-and-hold line disappears from chart
67. Take a screenshot with buy-hold hidden

68. Click "Buy & Hold" toggle button again to show comparison
69. **Verify** button returns to active state
70. **Verify** buy-and-hold line reappears on chart

### Test Tooltip Details Accuracy

71. Hover over a specific point on the equity curve
72. Note the displayed date in tooltip
73. **Verify** date format is human-readable (Month Day, Year Time)
74. **Verify** balance value matches expected equity at that point
75. **Verify** drawdown percentage is accurate (0.00% at peak, >0% during drawdown)
76. **Verify** trade count is an integer (0 or greater)
77. Take a screenshot with detailed tooltip information

78. Hover over a point where buy-hold is visible
79. **Verify** tooltip shows both Strategy and Buy & Hold balance values
80. **Verify** Buy & Hold value is formatted consistently
81. Take a screenshot showing both balance comparisons in tooltip

### Test PNG Export Functionality

82. Click "Export PNG" button
83. **Verify** browser downloads a PNG file
84. **Verify** filename format is `equity-curve-YYYY-MM-DD.png`
85. Open the downloaded PNG file
86. **Verify** PNG contains the full chart with:
    - Equity curve line
    - Buy-and-hold line (if enabled)
    - Drawdown markers (if enabled)
    - Time and price scales
    - Chart styling is preserved
87. Take a screenshot of the downloaded PNG file opened in image viewer

### Test Chart Responsiveness

88. Resize browser window to smaller width (e.g., 1024px)
89. **Verify** chart adjusts width proportionally
90. **Verify** chart remains readable and interactive
91. Take a screenshot of chart at smaller width

92. Resize browser window to larger width (e.g., 1920px)
93. **Verify** chart expands to use available space
94. **Verify** all controls remain accessible
95. Take a screenshot of chart at larger width

### Test Interactive Features with Edge Cases

96. Zoom in to maximum level (1-2 candles visible)
97. **Verify** chart still functions correctly
98. **Verify** tooltip shows data for visible candles
99. Take a screenshot of maximum zoom

100. Zoom out to show entire backtest period
101. **Verify** chart fits all data points
102. **Verify** time scale shows full date range
103. Take a screenshot of full data view

### Test Chart with Different Backtest Scenarios

104. Navigate to a different completed backtest (if available)
105. **Verify** chart updates with new data
106. **Verify** all interactive features work with different data
107. **Verify** color changes appropriately (green for profit, red for loss)
108. Take a screenshot of chart with different backtest data

### Test Chart Performance

109. Hover rapidly over different points on the chart
110. **Verify** tooltip updates smoothly without lag
111. **Verify** no visual glitches or flickering
112. Take a screenshot during hover interaction

113. Perform multiple zoom/pan operations in sequence
114. **Verify** chart remains responsive
115. **Verify** no performance degradation

### Test Chart Persistence

116. Toggle drawdowns off
117. Toggle buy-hold off
118. Navigate to a different page (e.g., Strategy Builder)
119. Navigate back to the backtest results page
120. **Verify** chart renders with default state (toggles reset to on)
121. **Verify** chart displays correctly after navigation
122. Take a screenshot confirming chart state after navigation

### Test Chart Error Handling

123. If a backtest with minimal data (<2 points) exists:
    - Navigate to that backtest
    - **Verify** chart shows "Equity curve data not available" message
    - **Verify** no JavaScript errors in console
    - Take a screenshot of empty state

124. Take a final screenshot showing the complete interactive equity curve chart

## Success Criteria

- Interactive equity curve chart displays using lightweight-charts library
- Chart supports zoom functionality:
  - Mouse wheel zooms in/out
  - Double-click resets to fit content
  - Time scale adjusts appropriately
- Chart supports pan functionality:
  - Click and drag to pan left/right
  - Time scale updates during pan
- Drawdown visualization:
  - Drawdown periods are highlighted with red markers
  - Toggle button shows/hides drawdown markers
  - Button has active/inactive visual states
- Buy-and-hold overlay:
  - Gray dashed line shows benchmark comparison
  - Toggle button shows/hides buy-hold line
  - Works independently from drawdown toggle
- Rich tooltip displays on hover:
  - Date in human-readable format (e.g., "Jan 15, 2026 14:30")
  - Balance formatted as currency (e.g., "$10,543.87")
  - Drawdown percentage (e.g., "5.32%")
  - Trade count at that candle (e.g., "2")
  - Tooltip position adjusts to avoid going off-screen
  - Buy & Hold value shown when overlay is visible
- PNG export functionality:
  - Export button generates PNG file
  - Filename includes date
  - PNG contains full chart visualization
  - Chart quality is suitable for reports
- Chart matches Precision Swiss Design System styling:
  - Neutral gray background (#fafafa)
  - Green color for profit (#22c55e)
  - Red color for loss/drawdown (#ef4444)
  - Consistent button styling and spacing
- Chart is responsive:
  - Adjusts width on browser resize
  - Maintains readability at different sizes
  - Controls remain accessible
- Chart performs smoothly:
  - Tooltip updates without lag
  - Zoom/pan operations are fluid
  - No visual glitches or errors
- Chart handles edge cases gracefully:
  - Shows appropriate message when no data
  - Works with 2-10000+ data points
  - Handles missing optional data (dates, trade counts, drawdown periods)
- 30+ screenshots document the complete interactive flow
