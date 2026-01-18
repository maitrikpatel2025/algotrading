# E2E Test: Interactive OHLC Candlestick Chart

Test the interactive OHLC candlestick chart functionality with all advanced features in the Forex Trading Dashboard Strategy page.

## User Story

As a forex trader
I want to view interactive candlestick charts with customizable timeframes, chart types, volume indicators, and date ranges
So that I can analyze price action patterns, identify trading opportunities, and make informed trading decisions based on visual technical analysis

## Test Steps

### Initial State and Navigation

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully
4. **Verify** the navigation bar is present with links to Monitor, Strategy, and Account

5. Click on "Strategy" in the navigation
6. Take a screenshot of the Strategy page empty state
7. **Verify** the Strategy page loads
8. **Verify** empty state message is displayed: "Select a currency pair and timeframe, then click Load Data" or similar
9. **Verify** the following controls are present:
   - Currency pair selector dropdown
   - Timeframe selector dropdown
   - Load Data button

### Chart Loading and Rendering

10. Select "EUR/USD" from the currency pair dropdown
11. Select "H1" from the timeframe dropdown
12. Click "Load Data" button
13. **Verify** loading state appears (spinner or skeleton)
14. Take a screenshot of the loading state
15. Wait for the chart to load
16. Take a screenshot of the initial candlestick chart
17. **Verify** the chart renders successfully with candlestick data
18. **Verify** the chart displays the pair name and timeframe (EUR/USD • H1)
19. **Verify** candlesticks are visible with proper coloring:
    - Green (#22c55e) for bullish candles (close > open)
    - Red (#ef4444) for bearish candles (close < open)

### Chart Type Selector Tests

20. **Verify** the chart type selector is present with 4 options:
    - Candlestick
    - OHLC
    - Line
    - Area
21. Select "OHLC" from the chart type selector
22. Take a screenshot of the OHLC chart
23. **Verify** the chart updates to display OHLC bars with green/red color-coding

24. Select "Line" from the chart type selector
25. Take a screenshot of the line chart
26. **Verify** the chart updates to display a line chart (blue line showing close prices)

27. Select "Area" from the chart type selector
28. Take a screenshot of the area chart
29. **Verify** the chart updates to display an area chart with filled region below the line

30. Select "Candlestick" from the chart type selector
31. **Verify** the chart returns to candlestick display

### Candle Count Selector Tests

32. **Verify** the candle count selector is present with options: 50, 100, 200
33. Select "50" from the candle count selector
34. Take a screenshot after selecting 50 candles
35. **Verify** the chart updates to display approximately 50 candles
36. **Verify** the selected count is highlighted in the dropdown

37. Select "200" from the candle count selector
38. Take a screenshot after selecting 200 candles
39. **Verify** the chart updates to display approximately 200 candles

40. Select "100" from the candle count selector (reset to default)

### Volume Toggle Tests

41. **Verify** the volume toggle button is present (with BarChart icon and "Vol" text)
42. **Verify** the volume toggle is initially OFF (muted background)
43. Click the volume toggle button to enable volume
44. Take a screenshot with volume indicator enabled
45. **Verify** the volume toggle button is highlighted (primary background)
46. **Verify** volume bars appear below the main price chart
47. **Verify** volume bars are color-coded:
    - Green/transparent for bullish volume (close >= open)
    - Red/transparent for bearish volume (close < open)

48. Click the volume toggle button to disable volume
49. **Verify** the volume toggle button returns to muted state
50. **Verify** volume bars are hidden from the chart

### Date Range Button Tests

51. **Verify** the date range buttons are present with label "Range:":
    - 1D, 5D, 1M, 3M, 6M, YTD, 1Y, All
52. Click the "1D" (1 day) date range button
53. Take a screenshot after clicking 1D
54. **Verify** the 1D button is highlighted (primary background)
55. **Verify** the chart updates with approximately 1 day of data
56. **Verify** the candle count is automatically adjusted

57. Click the "1M" (1 month) date range button
58. Take a screenshot after clicking 1M
59. **Verify** the 1M button is highlighted
60. **Verify** the chart updates with approximately 1 month of data

61. Click the "6M" (6 months) date range button
62. Take a screenshot after clicking 6M
63. **Verify** the 6M button is highlighted
64. **Verify** the chart updates with approximately 6 months of data

65. Click the "1Y" (1 year) date range button
66. Take a screenshot after clicking 1Y
67. **Verify** the 1Y button is highlighted
68. **Verify** the chart updates with approximately 1 year of data

69. Click the "All" date range button
70. Take a screenshot after clicking All
71. **Verify** the All button is highlighted
72. **Verify** the chart updates with maximum available data (up to 1000 candles)

### Interactive Features Tests

73. Hover over a candlestick on the chart
74. **Verify** hover tooltip appears showing OHLC values (Open, High, Low, Close)
75. **Verify** crosshair spike lines appear on both X and Y axes
76. Take a screenshot of the hover state

77. Scroll mouse wheel on the chart to zoom in
78. **Verify** the chart zooms in smoothly
79. Take a screenshot of the zoomed-in chart

80. Scroll mouse wheel in opposite direction to zoom out
81. **Verify** the chart zooms out smoothly

82. Double-click on the chart
83. **Verify** the chart resets to original zoom level
84. Take a screenshot after zoom reset

85. Click and drag on the chart to pan
86. **Verify** the chart pans horizontally
87. Take a screenshot of the panned chart

### Y-Axis Auto-Scaling Tests

88. **Verify** the Y-axis displays price values on the right side
89. **Verify** price values use 5 decimal places (forex precision)
90. **Verify** Y-axis auto-scales to fit visible price range
91. Zoom into a small section of the chart
92. **Verify** Y-axis range adjusts to show detail of zoomed section

### X-Axis Time Formatting Tests

93. **Verify** X-axis displays time labels appropriate for H1 timeframe (HH:MM format)
94. Select "D" (Daily) from the timeframe selector
95. Click "Load Data"
96. Take a screenshot of Daily chart
97. **Verify** X-axis time labels update to show dates (MM-DD format)
98. **Verify** chart renders daily candles correctly

### Performance Test with Maximum Candles

99. Select "H1" timeframe again
100. Click "All" date range button (loads 1000 candles)
101. Wait for chart to render
102. Take a screenshot of the chart with 1000 candles
103. **Verify** the chart renders within reasonable time (< 2 seconds)
104. **Verify** the chart remains interactive and responsive
105. **Verify** zoom and pan still work smoothly with large dataset

### Responsive Design Tests

106. Resize browser window to tablet size (width: 768px)
107. Take a screenshot of tablet view
108. **Verify** chart adapts to smaller width
109. **Verify** all controls remain accessible
110. **Verify** volume toggle shows icon only (no "Vol" text) on mobile

111. Resize browser window to mobile size (width: 375px)
112. Take a screenshot of mobile view
113. **Verify** chart controls stack properly
114. **Verify** date range buttons wrap to multiple rows if needed
115. **Verify** chart remains usable on small screen

116. Restore browser window to desktop size (width: 1280px)
117. **Verify** chart returns to full desktop layout

### Error Handling Tests

118. Navigate to Strategy page again
119. Select "GBP/JPY" pair
120. Select "H4" timeframe
121. Click "Load Data"
122. Take a screenshot of GBP/JPY chart
123. **Verify** chart loads successfully for different pair

124. **Verify** that if API fails (simulated or actual), error alert displays:
    - Alert with error icon (AlertTriangle)
    - Error message text
    - Dismissible close button
125. Take a screenshot of error state (if error occurs)

### Integration with Technicals Sidebar

126. With chart loaded, scroll to view both chart and technicals sidebar
127. Take a screenshot showing both chart and technicals
128. **Verify** chart occupies xl:col-span-2 (2/3 width on large screens)
129. **Verify** technicals sidebar occupies xl:col-span-1 (1/3 width)
130. **Verify** both components display data for the same pair and timeframe

### Chart Controls Accessibility

131. Tab through all interactive chart controls using keyboard
132. **Verify** all controls are keyboard accessible
133. **Verify** focus indicators are visible on focused elements
134. **Verify** dropdowns can be opened and navigated with arrow keys
135. **Verify** buttons can be activated with Enter or Space key

### Final State Verification

136. Select "EUR/USD" pair, "H1" timeframe
137. Select "Candlestick" chart type
138. Enable volume indicator
139. Select "3M" date range
140. Take final comprehensive screenshot
141. **Verify** all settings are applied correctly:
    - Candlestick chart visible
    - Volume bars visible below
    - 3M date range highlighted
    - Chart is interactive and responsive

## Success Criteria

- ✅ Empty state displays proper message before data is loaded
- ✅ Loading state appears during data fetch with spinner/skeleton
- ✅ Candlestick chart renders with correct color-coding (green=#22c55e bullish, red=#ef4444 bearish)
- ✅ Chart type selector works for all 4 types: Candlestick, OHLC, Line, Area
- ✅ Candle count selector updates chart with 50, 100, or 200 candles
- ✅ Volume toggle button works and displays volume bars below main chart
- ✅ Volume bars use correct color-coding (bullish green, bearish red)
- ✅ All 8 date range buttons work: 1D, 5D, 1M, 3M, 6M, YTD, 1Y, All
- ✅ Selected date range button is highlighted visually
- ✅ Candle count is automatically calculated based on selected date range
- ✅ Hover tooltips display OHLC values for each candle
- ✅ Crosshair spike lines appear on hover
- ✅ Mouse wheel zoom in/out works smoothly
- ✅ Double-click resets zoom to original view
- ✅ Click-and-drag panning works
- ✅ Y-axis auto-scales to fit visible price range
- ✅ Y-axis displays 5 decimal places for forex precision
- ✅ X-axis time format adjusts based on granularity (HH:MM for intraday, MM-DD for daily+)
- ✅ Chart performs well with 1000 candles (< 2 second render time)
- ✅ Chart is responsive on mobile, tablet, and desktop viewports
- ✅ Volume toggle icon displays without text on small screens
- ✅ Error handling displays dismissible alert when API fails
- ✅ Chart integrates properly with Technicals sidebar in xl:col-span-2 layout
- ✅ All chart controls are keyboard accessible with visible focus indicators
- ✅ Chart container uses min-h-[500px] with appropriate responsive height
- ✅ All UI components follow the established style guide (colors, typography, spacing)
- ✅ At least 25 screenshots are captured documenting the full test flow
